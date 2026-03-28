import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `Optimize advertising campaign: ${campaignId}

Analyze the campaign performance and provide optimization suggestions.

Return a JSON with this structure:
{
  "campaign_id": "${campaignId}",
  "adjustments": [
    {
      "type": "budget",
      "before": 100,
      "after": 120,
      "reason": "Increase budget to improve reach"
    },
    {
      "type": "bid",
      "before": 0.15,
      "after": 0.18,
      "reason": "Increase bid for better position"
    }
  ],
  "expected_improvement": "Expected 20% increase in conversions"
}

Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are an e-commerce advertising optimization expert. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ], { model: 'doubao-seed-1-6-251015', temperature: 0.7 });

    let data;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      }
    } catch {
      data = {
        campaign_id: campaignId,
        adjustments: [
          { type: 'budget', before: 100, after: 120, reason: '提高预算以获得更多曝光' }
        ],
        expected_improvement: '预计转化率提升15%',
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Optimize ad campaign error:', error);
    return NextResponse.json({ success: false, error: '优化广告失败' }, { status: 500 });
  }
}
