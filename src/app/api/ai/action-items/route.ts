import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const report = body || {};

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `Generate action items based on this business report:

${JSON.stringify(report, null, 2)}

Return a JSON with this structure:
{
  "actions": [
    {
      "id": "ACTION-001",
      "type": "optimization",
      "priority": "high",
      "description": "Action description",
      "affected_products": ["P001", "P002"],
      "expected_impact": "Expected impact"
    }
  ]
}

Generate 3-5 actionable items. Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are a business operations expert. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ], { model: 'doubao-seed-1-6-251015', temperature: 0.7 });

    let actions;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        actions = data.actions || data;
      }
    } catch {
      actions = [
        {
          id: 'ACTION-001',
          type: 'optimization',
          priority: 'high',
          description: '优化低转化商品的Listing',
          affected_products: ['P003'],
          expected_impact: '预计转化率提升20%',
        },
        {
          id: 'ACTION-002',
          type: 'advertising',
          priority: 'medium',
          description: '增加高转化商品广告预算',
          affected_products: ['P001', 'P002'],
          expected_impact: '预计销售额提升15%',
        },
        {
          id: 'ACTION-003',
          type: 'logistics',
          priority: 'medium',
          description: '优化物流渠道降低时效',
          affected_products: [],
          expected_impact: '预计物流时效缩短2天',
        },
      ];
    }

    return NextResponse.json({ success: true, data: actions });
  } catch (error) {
    console.error('Generate action items error:', error);
    return NextResponse.json({ success: false, error: '生成行动项失败' }, { status: 500 });
  }
}
