import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * AI选品API - 调用豆包大模型生成商品推荐
 * 
 * 数据源：豆包大模型知识库
 * 工作原理：
 * 1. AI作为选品专家，分析目标市场和平台
 * 2. 基于AI的海量商品知识生成推荐
 * 3. 计算利润、分析趋势、检查合规
 * 4. 返回JSON格式的商品数据
 */

interface SelectionRequest {
  platform: 'tiktok' | 'amazon' | 'shopee' | 'lazada';
  site: string; // 站点: id, my, th, vn, ph, sg
  count: number;
  min_profit_rate: number;
  category?: string;
  price_range?: {
    min: number;
    max: number;
  };
  auto_save?: boolean;
}

interface AIProduct {
  name: string;
  name_en: string;
  category: string;
  cost_price: number;
  suggested_price: number;
  profit_margin: number;
  sales_trend: number;
  compliance_status: 'passed' | 'failed';
  supply_chain: 'matched' | 'unmatched';
  purchase_cycle: number;
  stock_cost_ratio: number;
  predicted_profit: number;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SelectionRequest = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 解析请求参数
    const platform = body.platform || 'tiktok';
    const site = body.site || 'id';
    const count = Math.min(body.count || 10, 20); // 最多20个
    const minProfitRate = body.min_profit_rate || 0.3;
    const category = body.category;
    const autoSave = body.auto_save !== false;
    const priceRange = body.price_range || { min: 5, max: 50 };

    // 初始化LLM客户端
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建Prompt
    const prompt = buildSelectionPrompt({
      platform,
      site,
      count,
      minProfitRate,
      category,
      priceRange,
    });

    // 调用豆包大模型（使用Lite模型，平衡性能和成本）
    const response = await client.invoke(
      [{ role: 'user', content: prompt }],
      {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.7,
        thinking: 'disabled',
      }
    );

    // 解析AI返回的数据
    const aiProducts = parseAIResponse(response.content);

    if (aiProducts.length === 0) {
      return NextResponse.json({
        success: false,
        data: [],
        error: 'AI未能生成有效的选品数据，请重试',
      });
    }

    // 保存到商品库
    const savedProducts = [];
    for (const item of aiProducts) {
      // 计算成本结构
      const costPrice = item.cost_price;
      const domesticShipping = 5;
      const firstMileShipping = 15;
      const totalCost = costPrice + domesticShipping + firstMileShipping;

      // 基于总成本重新计算售价，确保利润率达标
      // AI返回的suggested_price仅作参考，实际售价需要基于总成本计算
      const requiredPrice = totalCost / (1 - minProfitRate);
      const suggestedPrice = Math.ceil(requiredPrice * 100) / 100; // 保留2位小数
      const profit = suggestedPrice - totalCost;
      const profitMargin = (profit / suggestedPrice) * 100;

      // 创建商品
      const product = store.createProduct({
        name_zh: item.name,
        name_en: item.name_en,
        category: item.category,
        source_url: '', // AI生成的商品没有真实链接
        supplier_name: 'AI推荐供应商',
        cost_price: costPrice,
        domestic_shipping: domesticShipping,
        first_mile_shipping: firstMileShipping,
        total_cost: totalCost,
        pricing: {
          total_cost: totalCost,
          suggested_price: suggestedPrice,
          target_price: suggestedPrice,
          profit_margin: profitMargin,
          pricing_basis: 'AI Calculation',
        },
        selection_score: item.sales_trend,
        sales_trend: item.sales_trend,
        profit_margin: profitMargin,
        image_status: 'pending',
        listing_status: 'pending',
        compliance_status: item.compliance_status === 'passed' ? 'passed' : 'failed',
        status: 'selected',
      });

      savedProducts.push({
        id: product.id,
        name: item.name,
        name_en: item.name_en,
        category: item.category,
        platform: platform,
        site: site,
        sales_trend: item.sales_trend,
        profit_margin: profitMargin,
        compliance_status: item.compliance_status,
        supply_chain: item.supply_chain,
        purchase_cycle: item.purchase_cycle,
        stock_cost_ratio: item.stock_cost_ratio,
        predicted_profit: profit,
        cost_price: costPrice,
        suggested_price: suggestedPrice,
        reason: item.reason,
      });
    }

    return NextResponse.json({
      success: true,
      data: savedProducts,
      message: `AI选品完成！成功筛选出 ${savedProducts.length} 个潜力商品${autoSave ? '，已保存到商品库' : ''}`,
    });
  } catch (error: any) {
    console.error('AI选品失败:', error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: error.message || 'AI选品失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 构建选品Prompt
 */
function buildSelectionPrompt(params: {
  platform: string;
  site: string;
  count: number;
  minProfitRate: number;
  category?: string;
  priceRange: { min: number; max: number };
}): string {
  const { platform, site, count, minProfitRate, category, priceRange } = params;

  const siteNames: Record<string, string> = {
    id: '印尼',
    my: '马来西亚',
    th: '泰国',
    vn: '越南',
    ph: '菲律宾',
    sg: '新加坡',
  };

  const siteName = siteNames[site] || site;
  const platformNames: Record<string, string> = {
    tiktok: 'TikTok Shop',
    amazon: 'Amazon',
    shopee: 'Shopee',
    lazada: 'Lazada',
  };
  const platformName = platformNames[platform] || platform;

  return `你是${platformName}跨境选品专家，精通${siteName}市场需求和消费者偏好。

请为${platformName}${siteName}站推荐 ${count} 个高潜力热销商品。

## 选品要求：
1. **利润率**：最低利润率 ${(minProfitRate * 100).toFixed(0)}%
2. **价格区间**：$${priceRange.min} - $${priceRange.max}
3. **市场趋势**：优先选择当前热销或潜力爆款的品类
4. **合规性**：必须符合平台规则，避免禁售品类
5. **供应链**：确保货源稳定，采购周期≤15天

${category ? `6. **类目限制**：专注于${category}相关品类` : ''}

## ${siteName}市场特征：
- 年轻用户群体为主，对新鲜事物敏感
- 价格敏感度中等偏上，追求性价比
- 移动端购物占比高
- 对直播带货接受度高

## 返回格式：
请严格按照以下JSON格式返回，不要包含任何其他文字：

\`\`\`json
[
  {
    "name": "商品中文名称（精准，包含关键卖点）",
    "name_en": "商品英文名称（适合平台展示）",
    "category": "商品类目（如：家居生活、美妆个护、数码配件等）",
    "cost_price": 成本价（数值，如12.5），
    "suggested_price": 建议售价（数值，如25.0），
    "profit_margin": 利润率（数值，如52.0），
    "sales_trend": 销售趋势分数（60-100之间），
    "compliance_status": "passed"或"failed"，
    "supply_chain": "matched"或"unmatched"，
    "purchase_cycle": 采购周期（天数，5-15之间），
    "stock_cost_ratio": 库存成本占比（数值，20-40之间），
    "predicted_profit": 预估利润（数值），
    "reason": "推荐理由（为什么选这个商品，100字以内）"
  }
]
\`\`\`

## 注意事项：
1. 商品要具体，不要泛泛而谈（如不要只写"手机壳"，要写"透明磁吸无线充电手机壳"）
2. 确保所有商品都是真实存在且符合市场需求的品类
3. 价格和利润要符合实际，避免虚高或过低
4. 合规状态为"failed"的商品不要推荐
5. 确保返回的是纯JSON格式，不要有markdown标记或其他文字

现在请开始选品，返回JSON数据。`;
}

/**
 * 解析AI响应
 */
function parseAIResponse(content: string): AIProduct[] {
  try {
    // 尝试提取JSON部分
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      console.error('AI响应中未找到JSON数组');
      return [];
    }

    const jsonStr = jsonMatch[0];
    const products = JSON.parse(jsonStr);

    // 验证数据格式
    if (!Array.isArray(products)) {
      console.error('AI返回的不是数组');
      return [];
    }

    // 过滤和验证每个商品
    return products
      .filter((p: any) => {
        return (
          p.name &&
          p.name_en &&
          p.category &&
          typeof p.cost_price === 'number' &&
          typeof p.profit_margin === 'number' &&
          p.compliance_status === 'passed'
        );
      })
      .map((p: any) => ({
        name: p.name,
        name_en: p.name_en,
        category: p.category,
        cost_price: Number(p.cost_price),
        suggested_price: Number(p.suggested_price) || p.cost_price * 2,
        profit_margin: Number(p.profit_margin),
        sales_trend: Number(p.sales_trend) || 70,
        compliance_status: p.compliance_status,
        supply_chain: p.supply_chain || 'matched',
        purchase_cycle: Number(p.purchase_cycle) || 7,
        stock_cost_ratio: Number(p.stock_cost_ratio) || 30,
        predicted_profit: Number(p.predicted_profit) || (p.suggested_price - p.cost_price) * 0.7,
        reason: p.reason || '符合市场需求，利润空间良好',
      }));
  } catch (error) {
    console.error('解析AI响应失败:', error);
    console.error('原始内容:', content);
    return [];
  }
}
