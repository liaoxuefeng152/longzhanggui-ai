import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const startDate = body.start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = body.end_date || new Date().toISOString().split('T')[0];
    const platform = body.platform || 'all';

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `Generate a business data report for ${platform} platform.

Period: ${startDate} to ${endDate}

Return a JSON with this structure:
{
  "period": {
    "start_date": "${startDate}",
    "end_date": "${endDate}"
  },
  "summary": {
    "total_sales": 50000,
    "total_orders": 150,
    "total_profit": 15000,
    "profit_rate": 30
  },
  "trends": {
    "sales_trend": [
      {"date": "2026-03-20", "value": 5000},
      {"date": "2026-03-21", "value": 5500}
    ],
    "order_trend": [
      {"date": "2026-03-20", "value": 15},
      {"date": "2026-03-21", "value": 18}
    ],
    "profit_trend": [
      {"date": "2026-03-20", "value": 1500},
      {"date": "2026-03-21", "value": 1650}
    ]
  },
  "top_products": [
    {"product_id": "P001", "product_name": "Product A", "sales": 10000, "profit": 3000}
  ],
  "issues": ["Issue 1", "Issue 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Generate realistic data for a 7-day period. Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are a business analytics expert. Always return valid JSON with realistic data.' },
      { role: 'user', content: prompt }
    ], { model: 'doubao-seed-1-6-251015', temperature: 0.7 });

    let data;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // 生成模拟数据
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        days.push(date);
      }
      
      data = {
        period: { start_date: startDate, end_date: endDate },
        summary: { total_sales: 52000, total_orders: 156, total_profit: 15600, profit_rate: 30 },
        trends: {
          sales_trend: days.map(date => ({ date, value: 6000 + Math.random() * 2000 })),
          order_trend: days.map(date => ({ date, value: 18 + Math.floor(Math.random() * 8) })),
          profit_trend: days.map(date => ({ date, value: 1800 + Math.random() * 600 })),
        },
        top_products: [
          { product_id: 'P001', product_name: '宠物自动喂食器', sales: 12000, profit: 3600 },
          { product_id: 'P002', product_name: '便携式榨汁机', sales: 8500, profit: 2550 },
          { product_id: 'P003', product_name: 'LED化妆镜', sales: 6800, profit: 2040 },
        ],
        issues: ['部分商品转化率下降', '物流时效需优化'],
        recommendations: ['增加高转化商品广告预算', '优化物流渠道'],
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Generate data report error:', error);
    return NextResponse.json({ success: false, error: '生成数据报告失败' }, { status: 500 });
  }
}
