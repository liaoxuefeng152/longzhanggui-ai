import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const productId = body.product_id || '';
    const platform = body.platform || 'tiktok';
    const dailyBudget = body.daily_budget || 100;
    const targetAcos = body.target_acos || 0.2;
    const keywords = body.keywords || [];

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 生成广告建议
    const prompt = `Create an advertising campaign for product ID: ${productId} on ${platform}.

Campaign settings:
- Daily budget: $${dailyBudget}
- Target ACOS: ${targetAcos * 100}%
- Keywords: ${keywords.join(', ') || 'Auto-generate'}

Return a JSON with this structure:
{
  "campaign_id": "CAMP-${Date.now()}",
  "product_id": "${productId}",
  "platform": "${platform}",
  "daily_budget": ${dailyBudget},
  "target_acos": ${targetAcos},
  "keywords": ["keyword1", "keyword2"],
  "status": "active",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}

Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are an e-commerce advertising expert. Always return valid JSON.' },
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
        campaign_id: `CAMP-${Date.now()}`,
        product_id: productId,
        platform,
        daily_budget: dailyBudget,
        target_acos: targetAcos,
        keywords: keywords.length > 0 ? keywords : ['auto-keyword'],
        status: 'active',
        recommendations: ['建议增加预算以获得更多曝光', '关注转化率变化'],
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create ad campaign error:', error);
    return NextResponse.json({ success: false, error: '创建广告失败' }, { status: 500 });
  }
}
