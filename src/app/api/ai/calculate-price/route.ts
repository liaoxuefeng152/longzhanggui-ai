import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 获取参数
    const costPrice = body.cost_price || 50;
    const domesticShipping = body.domestic_shipping || 5;
    const firstMileShipping = body.first_mile_shipping || 3;
    const platformCommissionRate = body.platform_commission_rate || 0.05;
    const adCostRate = body.ad_cost_rate || 0.1;
    const targetProfitRate = body.target_profit_rate || 0.3;
    const competitorPrices = body.competitor_prices || [];
    
    // 计算总成本
    const totalCost = costPrice + domesticShipping + firstMileShipping;
    
    // 计算建议售价
    const basePrice = totalCost / (1 - platformCommissionRate - adCostRate - targetProfitRate);
    
    // 如果有竞品价格，取中间值
    let suggestedPrice = basePrice;
    if (competitorPrices.length > 0) {
      const avgCompetitorPrice = competitorPrices.reduce((a: number, b: number) => a + b, 0) / competitorPrices.length;
      suggestedPrice = Math.min(basePrice * 1.1, avgCompetitorPrice * 0.95);
    }
    
    // 计算实际利润率
    const actualProfitRate = (suggestedPrice - totalCost - suggestedPrice * platformCommissionRate - suggestedPrice * adCostRate) / suggestedPrice;
    
    // 成本明细
    const costBreakdown = {
      product_cost: costPrice,
      domestic_shipping: domesticShipping,
      first_mile_shipping: firstMileShipping,
      platform_commission: suggestedPrice * platformCommissionRate,
      ad_cost: suggestedPrice * adCostRate,
      profit: suggestedPrice - totalCost - suggestedPrice * platformCommissionRate - suggestedPrice * adCostRate,
    };
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      data: {
        total_cost: Math.round(totalCost * 100) / 100,
        target_price: Math.round(basePrice * 100) / 100,
        suggested_price: Math.round(suggestedPrice * 100) / 100,
        profit_margin: Math.round(actualProfitRate * 1000) / 10,
        cost_breakdown: Object.fromEntries(
          Object.entries(costBreakdown).map(([k, v]) => [k, Math.round((v as number) * 100) / 100])
        ),
        pricing_basis: competitorPrices.length > 0 
          ? '基于竞品价格和成本的综合定价' 
          : '基于成本加成的定价策略',
      },
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    return NextResponse.json(
      { success: false, error: '定价计算失败' },
      { status: 500 }
    );
  }
}
