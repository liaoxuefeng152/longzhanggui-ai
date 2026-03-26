import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cost_price,
      domestic_shipping = 0,
      first_mile_shipping = 0,
      platform_commission_rate = 0.05,
      ad_cost_rate = 0.1,
      target_profit_rate = 0.3,
      competitor_prices = [],
    } = body;
    
    if (!cost_price || cost_price <= 0) {
      return NextResponse.json(
        { success: false, error: '请提供有效的成本价格' },
        { status: 400 }
      );
    }
    
    // 计算总成本
    const totalCost = cost_price + domestic_shipping + first_mile_shipping;
    
    // 计算建议售价（基于目标利润率）
    const targetPrice = totalCost / (1 - platform_commission_rate - ad_cost_rate - target_profit_rate);
    
    // 根据竞品价格调整建议售价
    let suggestedPrice = targetPrice;
    if (competitor_prices.length > 0) {
      const avgCompetitorPrice = competitor_prices.reduce((a: number, b: number) => a + b, 0) / competitor_prices.length;
      // 如果竞品平均价格更低，则取中间值
      if (avgCompetitorPrice < targetPrice) {
        suggestedPrice = (targetPrice + avgCompetitorPrice) / 2;
      }
    }
    
    // 四舍五入到两位小数
    suggestedPrice = Math.round(suggestedPrice * 100) / 100;
    
    // 计算实际利润率
    const actualProfit = suggestedPrice - totalCost - (suggestedPrice * platform_commission_rate) - (suggestedPrice * ad_cost_rate);
    const profitMargin = (actualProfit / suggestedPrice) * 100;
    
    const result = {
      total_cost: Math.round(totalCost * 100) / 100,
      target_price: Math.round(targetPrice * 100) / 100,
      suggested_price: suggestedPrice,
      profit_margin: Math.round(profitMargin * 10) / 10,
      cost_breakdown: {
        '采购成本': cost_price,
        '国内运费': domestic_shipping,
        '头程运费': first_mile_shipping,
        '平台佣金': Math.round(suggestedPrice * platform_commission_rate * 100) / 100,
        '广告成本': Math.round(suggestedPrice * ad_cost_rate * 100) / 100,
      },
      pricing_basis: competitor_prices.length > 0
        ? `基于成本核算和竞品价格分析（竞品平均: ¥${Math.round(competitor_prices.reduce((a: number, b: number) => a + b, 0) / competitor_prices.length * 100) / 100}）`
        : '基于成本核算和目标利润率计算',
    };
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    return NextResponse.json(
      { success: false, error: '定价计算失败' },
      { status: 500 }
    );
  }
}
