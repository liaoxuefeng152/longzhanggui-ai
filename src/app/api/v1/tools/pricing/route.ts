import { NextRequest, NextResponse } from 'next/server';

// 定价配置
const PRICING_CONFIG = {
  // 平台佣金率
  commissionRates: {
    shopee: 0.06,      // 6%
    lazada: 0.08,      // 8%
    tiktok: 0.05,      // 5%
    amazon: 0.15,       // 15%
    ebay: 0.12,         // 12%
  },
  // 物流费用（单位：CNY）
  logistics: {
    shopee: { normal: 25, fast: 45 },
    lazada: { normal: 30, fast: 55 },
    tiktok: { normal: 20, fast: 40 },
    amazon: { normal: 35, fast: 60 },
    ebay: { normal: 28, fast: 50 },
  },
  // VAT税率
  vatRates: {
    id: 0.11,    // 印尼 11%
    th: 0.07,    // 泰国 7%
    vn: 0.10,    // 越南 10%
    my: 0.06,    // 马来西亚 6%
    ph: 0.12,    // 菲律宾 12%
    sg: 0.09,    // 新加坡 9%
  },
  // 最低利润率
  minProfitRates: {
    safe: 0.25,    // 安全 25%
    warning: 0.15, // 警告 15%
    danger: 0.05,  // 危险 5%
  },
};

// 竞品价格数据（模拟）
const mockCompetitorPrices: Record<string, any[]> = {
  'P001': [
    { id: 'C1', name: '小米充电宝 20000mAh', price: 149, currency: 'CNY', platform: 'shopee', trend: 'down', lastUpdated: new Date().toISOString() },
    { id: 'C2', name: '华为充电宝 20000mAh', price: 169, currency: 'CNY', platform: 'lazada', trend: 'up', lastUpdated: new Date().toISOString() },
    { id: 'C3', name: '罗马仕充电宝', price: 139, currency: 'CNY', platform: 'tiktok', trend: 'stable', lastUpdated: new Date().toISOString() },
  ],
  'P002': [
    { id: 'C4', name: '小米蓝牙耳机', price: 129, currency: 'CNY', platform: 'shopee', trend: 'down', lastUpdated: new Date().toISOString() },
    { id: 'C5', name: '华为FreeBuds', price: 199, currency: 'CNY', platform: 'lazada', trend: 'stable', lastUpdated: new Date().toISOString() },
  ],
  'P003': [
    { id: 'C6', name: '小米手环8', price: 229, currency: 'CNY', platform: 'shopee', trend: 'up', lastUpdated: new Date().toISOString() },
    { id: 'C7', name: '华为手环8', price: 249, currency: 'CNY', platform: 'lazada', trend: 'stable', lastUpdated: new Date().toISOString() },
  ],
};

// 模拟商品数据
const mockProducts = [
  {
    id: 'P001',
    name: '便携充电宝 20000mAh',
    sku: 'SKU-P001',
    costPrice: 45,
    sellingPrice: 159,
    platform: 'shopee',
    country: 'id',
    weight: 0.35,
  },
  {
    id: 'P002',
    name: '无线蓝牙耳机',
    sku: 'SKU-P002',
    costPrice: 68,
    sellingPrice: 128,
    platform: 'tiktok',
    country: 'th',
    weight: 0.15,
  },
  {
    id: 'P003',
    name: '智能手环运动手表',
    sku: 'SKU-P003',
    costPrice: 120,
    sellingPrice: 199,
    platform: 'lazada',
    country: 'my',
    weight: 0.25,
  },
];

// 计算成本
function calculateCost(product: any, targetPrice: number, config: typeof PRICING_CONFIG) {
  const platform = product.platform || 'shopee';
  const country = product.country || 'id';
  const weight = product.weight || 0.2;
  
  const commissionRate = config.commissionRates[platform] || 0.06;
  const logisticsFee = config.logistics[platform]?.normal || 25;
  const vatRate = config.vatRates[country] || 0.10;
  
  // 销售额 = 售价 + VAT
  const salesAmount = targetPrice * (1 + vatRate);
  
  // 平台佣金 = 销售额 * 佣金率
  const commission = salesAmount * commissionRate;
  
  // 物流费
  const logistics = logisticsFee;
  
  // 包装费（按重量估算）
  const packingFee = weight * 5; // 每克0.005元
  
  // 汇率损耗（假设1.5%）
  const exchangeLoss = salesAmount * 0.015;
  
  // 总成本
  const totalCost = product.costPrice + logistics + packingFee + exchangeLoss;
  
  // 实际利润
  const actualProfit = targetPrice - totalCost - commission;
  
  // 利润率
  const profitRate = actualProfit / targetPrice;
  
  // 保本价（利润为0时的价格）
  const breakEvenPrice = totalCost / (1 - commissionRate - vatRate * commissionRate);
  
  return {
    salesAmount,
    commission,
    logistics,
    packingFee,
    exchangeLoss,
    totalCost,
    actualProfit,
    profitRate,
    breakEvenPrice,
    roi: actualProfit / product.costPrice,
  };
}

// 智能定价算法
function calculateOptimalPrice(product: any, competitors: any[], targetProfitRate: number, config: typeof PRICING_CONFIG) {
  const platform = product.platform || 'shopee';
  const country = product.country || 'id';
  
  const commissionRate = config.commissionRates[platform] || 0.06;
  const vatRate = config.vatRates[country] || 0.10;
  const logisticsFee = config.logistics[platform]?.normal || 25;
  const weight = product.weight || 0.2;
  
  // 计算保本价
  const packingFee = weight * 5;
  const exchangeLossRate = 0.015;
  const totalFixedCost = product.costPrice + logisticsFee + packingFee;
  
  // 保本价 = (成本 + 物流 + 包装) / (1 - 佣金率 - VAT影响 - 汇率损耗)
  const breakEvenPrice = totalFixedCost / (1 - commissionRate * (1 + vatRate) - exchangeLossRate);
  
  // 获取竞品价格范围
  const competitorPrices = competitors.map(c => c.price).filter(p => p > 0);
  const minCompetitorPrice = Math.min(...competitorPrices);
  const maxCompetitorPrice = Math.max(...competitorPrices);
  const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
  
  // 目标利润率定价
  // 售价 = 成本 / (1 - 佣金率 - 汇率损耗 - 目标利润率)
  const targetPriceByProfit = totalFixedCost / (1 - commissionRate - exchangeLossRate - targetProfitRate);
  
  // 竞品竞争力定价（在竞品均价基础上浮动）
  const competitivePrice = avgCompetitorPrice * 0.95; // 比竞品低5%
  
  // 取两者中的较低者，但不低于保本价
  const optimalPrice = Math.max(breakEvenPrice, Math.min(targetPriceByProfit, competitivePrice));
  
  // 计算各方案
  const profitPlan = calculateCost(product, targetPriceByProfit, config);
  const competitivePlan = calculateCost(product, competitivePrice, config);
  const optimalPlan = calculateCost(product, optimalPrice, config);
  
  return {
    breakEvenPrice: Math.round(breakEvenPrice * 100) / 100,
    targetPrice: Math.round(targetPriceByProfit * 100) / 100,
    competitivePrice: Math.round(competitivePrice * 100) / 100,
    optimalPrice: Math.round(optimalPrice * 100) / 100,
    minCompetitorPrice,
    maxCompetitorPrice,
    avgCompetitorPrice: Math.round(avgCompetitorPrice * 100) / 100,
    plans: {
      profit: { price: Math.round(targetPriceByProfit * 100) / 100, ...profitPlan },
      competitive: { price: Math.round(competitivePrice * 100) / 100, ...competitivePlan },
      optimal: { price: Math.round(optimalPrice * 100) / 100, ...optimalPlan },
    },
  };
}

// GET - 获取商品列表和竞品价格
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (productId) {
      // 获取单个商品详情
      const product = mockProducts.find(p => p.id === productId);
      if (!product) {
        return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
      }
      
      const competitors = mockCompetitorPrices[productId] || [];
      const pricing = calculateOptimalPrice(product, competitors, 0.25, PRICING_CONFIG);
      
      return NextResponse.json({
        success: true,
        data: {
          product,
          competitors,
          pricing,
        },
      });
    }
    
    // 获取所有商品
    const productsWithPricing = mockProducts.map(product => {
      const competitors = mockCompetitorPrices[product.id] || [];
      const pricing = calculateOptimalPrice(product, competitors, 0.25, PRICING_CONFIG);
      return {
        ...product,
        competitors,
        pricing,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: productsWithPricing,
    });
  } catch (error) {
    console.error('获取定价数据失败:', error);
    return NextResponse.json({ success: false, error: '获取数据失败' }, { status: 500 });
  }
}

// POST - 批量定价计算
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, products, targetProfitRate, platform, country } = body;
    
    // 合并配置
    const config = { ...PRICING_CONFIG };
    if (platform) {
      Object.keys(config.commissionRates).forEach(p => {
        if (p !== platform) delete config.commissionRates[p as keyof typeof config.commissionRates];
      });
    }
    
    if (action === 'calculate') {
      // 计算定价
      const results = [];
      for (const item of products) {
        const product = mockProducts.find(p => p.id === item.productId) || item;
        const competitors = mockCompetitorPrices[product.id] || [];
        const pricing = calculateOptimalPrice(
          { ...product, platform: platform || product.platform, country: country || product.country },
          competitors,
          targetProfitRate || 0.25,
          config
        );
        
        const currentCost = calculateCost(product, product.sellingPrice, config);
        
        results.push({
          productId: product.id,
          productName: product.name,
          currentPrice: product.sellingPrice,
          currentProfitRate: currentCost.profitRate,
          suggestedPrice: pricing.optimalPrice,
          suggestedProfitRate: pricing.plans.optimal.profitRate,
          priceChange: pricing.optimalPrice - product.sellingPrice,
          priceChangePercent: ((pricing.optimalPrice - product.sellingPrice) / product.sellingPrice * 100).toFixed(1) + '%',
          pricing,
          riskLevel: pricing.plans.optimal.profitRate >= config.minProfitRates.safe ? 'safe' :
                     pricing.plans.optimal.profitRate >= config.minProfitRates.warning ? 'warning' : 'danger',
        });
      }
      
      return NextResponse.json({
        success: true,
        data: results,
      });
    }
    
    if (action === 'apply') {
      // 应用定价（模拟）
      const applied = products.map((item: any) => ({
        productId: item.productId,
        oldPrice: mockProducts.find(p => p.id === item.productId)?.sellingPrice || 0,
        newPrice: item.newPrice,
        status: 'applied',
        appliedAt: new Date().toISOString(),
      }));
      
      return NextResponse.json({
        success: true,
        data: {
          applied,
          total: applied.length,
        },
      });
    }
    
    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('定价计算失败:', error);
    return NextResponse.json({ success: false, error: '计算失败' }, { status: 500 });
  }
}
