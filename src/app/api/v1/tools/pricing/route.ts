import { NextRequest, NextResponse } from 'next/server';

/**
 * 智能定价工具 API
 * 
 * 功能：
 * - 保本价计算
 * - 利润空间验证
 * - 多种定价方案
 * - 价格战预警
 */

interface PricingRequest {
  costPrice: number;           // 采购成本（元）
  domesticShipping: number;    // 国内运费（元）
  internationalShipping: number; // 国际运费（元）
  targetPlatform: 'shopee' | 'lazada' | 'tiktok' | 'amazon';
  targetMarket: 'TH' | 'VN' | 'MY' | 'ID' | 'PH';
  productWeight: number;       // 产品重量（kg）
  productCategory?: string;    // 产品类目
  targetProfitRate?: number;   // 目标利润率（小数，如0.2表示20%）
  competitorPrice?: number;    // 竞品价格（当地货币）
}

interface PricingResult {
  breakEvenPrice: number;      // 保本价
  suggestedPrices: Array<{
    name: string;
    price: number;
    profit: number;
    profitRate: number;
    description: string;
  }>;
  costBreakdown: {
    item: string;
    amount: number;
    currency: string;
  }[];
  warnings: string[];
  recommendations: string[];
}

// 平台费率配置
const PLATFORM_FEES = {
  shopee: {
    commission: 0.05,      // 交易佣金
    transactionFee: 0.02,  // 交易手续费
    freeShipping: 0.03,    // 免运活动费
  },
  lazada: {
    commission: 0.04,
    transactionFee: 0.02,
    freeShipping: 0.025,
  },
  tiktok: {
    commission: 0.05,
    transactionFee: 0.015,
    freeShipping: 0.02,
  },
  amazon: {
    commission: 0.15,      // 亚马逊佣金较高
    transactionFee: 0,
    freeShipping: 0,
  }
};

// 汇率配置（示例）
const EXCHANGE_RATES: Record<string, number> = {
  'CNY-THB': 4.8,   // 人民币转泰铢
  'CNY-VND': 3400,  // 人民币转越南盾
  'CNY-MYR': 0.65,  // 人民币转马币
  'CNY-IDR': 2100,  // 人民币转印尼盾
  'CNY-PHP': 7.8,   // 人民币转菲律宾比索
};

// VAT税率
const VAT_RATES: Record<string, number> = {
  'TH': 0.07,   // 泰国7%
  'VN': 0.10,   // 越南10%
  'MY': 0.06,   // 马来西亚6%
  'ID': 0.11,   // 印尼11%
  'PH': 0.12,   // 菲律宾12%
};

// 货币符号
const CURRENCY_SYMBOLS: Record<string, string> = {
  'TH': '฿',
  'VN': '₫',
  'MY': 'RM',
  'ID': 'Rp',
  'PH': '₱',
};

export async function POST(request: NextRequest) {
  try {
    const body: PricingRequest = await request.json();
    const {
      costPrice,
      domesticShipping,
      internationalShipping,
      targetPlatform,
      targetMarket,
      productWeight,
      productCategory,
      targetProfitRate = 0.20,
      competitorPrice
    } = body;

    // 参数验证
    if (!costPrice || costPrice <= 0) {
      return NextResponse.json(
        { success: false, error: '请输入有效的采购成本' },
        { status: 400 }
      );
    }

    // 获取平台费率
    const platformFee = PLATFORM_FEES[targetPlatform] || PLATFORM_FEES.shopee;
    const exchangeRate = EXCHANGE_RATES[`CNY-${targetMarket}`] || 1;
    const vatRate = VAT_RATES[targetMarket] || 0.1;
    const currencySymbol = CURRENCY_SYMBOLS[targetMarket] || '$';

    // 计算总成本（人民币）
    const totalCostCNY = costPrice + domesticShipping + internationalShipping;
    
    // 转换为当地货币
    const totalCostLocal = totalCostCNY * exchangeRate;

    // 计算保本价（不考虑利润）
    // 保本价 = 成本 + 平台费用 + VAT
    // 设售价为P，则：P - P*(佣金+手续费) - P*VAT = 成本
    // P = 成本 / (1 - 佣金 - 手续费 - VAT)
    const totalFeeRate = platformFee.commission + platformFee.transactionFee + platformFee.freeShipping + vatRate;
    const breakEvenPrice = totalCostLocal / (1 - totalFeeRate);

    // 生成多种定价方案
    const suggestedPrices = [
      {
        name: '保本价',
        price: Math.ceil(breakEvenPrice),
        profit: 0,
        profitRate: 0,
        description: '仅覆盖成本，不推荐'
      },
      {
        name: '低利润方案',
        price: Math.ceil(breakEvenPrice * 1.10),
        profit: Math.ceil(breakEvenPrice * 0.10),
        profitRate: 0.10,
        description: '薄利多销，适合新店'
      },
      {
        name: '推荐方案',
        price: Math.ceil(breakEvenPrice * (1 + targetProfitRate)),
        profit: Math.ceil(breakEvenPrice * targetProfitRate),
        profitRate: targetProfitRate,
        description: `目标利润率${(targetProfitRate * 100).toFixed(0)}%`
      },
      {
        name: '高利润方案',
        price: Math.ceil(breakEvenPrice * 1.35),
        profit: Math.ceil(breakEvenPrice * 0.35),
        profitRate: 0.35,
        description: '高溢价，需品牌支撑'
      }
    ];

    // 成本拆分
    const costBreakdown = [
      { item: '采购成本', amount: costPrice * exchangeRate, currency: currencySymbol },
      { item: '国内运费', amount: domesticShipping * exchangeRate, currency: currencySymbol },
      { item: '国际运费', amount: internationalShipping * exchangeRate, currency: currencySymbol },
      { item: `平台佣金(${(platformFee.commission * 100).toFixed(0)}%)`, amount: breakEvenPrice * platformFee.commission, currency: currencySymbol },
      { item: `交易手续费(${(platformFee.transactionFee * 100).toFixed(0)}%)`, amount: breakEvenPrice * platformFee.transactionFee, currency: currencySymbol },
      { item: `VAT税费(${(vatRate * 100).toFixed(0)}%)`, amount: breakEvenPrice * vatRate, currency: currencySymbol },
    ];

    // 预警信息
    const warnings: string[] = [];
    
    if (breakEvenPrice > 1000) {
      warnings.push(`⚠️ 保本价较高(${currencySymbol}${Math.ceil(breakEvenPrice)})，请评估市场接受度`);
    }
    
    if (competitorPrice && breakEvenPrice > competitorPrice * 0.8) {
      warnings.push(`⚠️ 保本价接近竞品价格，利润空间有限`);
    }
    
    if (productWeight > 1) {
      warnings.push(`⚠️ 产品较重(${productWeight}kg)，国际运费可能较高`);
    }

    // 推荐建议
    const recommendations: string[] = [
      `💡 建议定价：${currencySymbol}${suggestedPrices[2].price}（利润率${(targetProfitRate * 100).toFixed(0)}%）`,
      `💡 可通过优化包装降低运费成本`,
      `💡 建议参加平台免运活动提升转化率`,
    ];

    if (competitorPrice) {
      const priceGap = ((competitorPrice - suggestedPrices[2].price) / competitorPrice * 100).toFixed(1);
      if (parseFloat(priceGap) > 0) {
        recommendations.push(`💡 竞品价格为${currencySymbol}${competitorPrice}，你有${priceGap}%的价格优势`);
      } else {
        recommendations.push(`💡 竞品价格为${currencySymbol}${competitorPrice}，建议优化成本或差异化定位`);
      }
    }

    const result: PricingResult = {
      breakEvenPrice: Math.ceil(breakEvenPrice),
      suggestedPrices,
      costBreakdown,
      warnings,
      recommendations
    };

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        platform: targetPlatform,
        market: targetMarket,
        currency: currencySymbol,
        exchangeRate
      }
    });
  } catch (error) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { success: false, error: '定价计算失败' },
      { status: 500 }
    );
  }
}
