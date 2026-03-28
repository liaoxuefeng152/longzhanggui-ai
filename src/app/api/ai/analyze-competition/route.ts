import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productName = searchParams.get('product_name');
    const platform = searchParams.get('platform') || 'tiktok';

    if (!productName) {
      return NextResponse.json({ success: false, error: '请提供商品名称' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `Analyze competition for the product: "${productName}" on ${platform}.

Return a JSON analysis with this structure:
{
  "product_name": "${productName}",
  "platform": "${platform}",
  "competitors": [
    {
      "name": "Competitor product name",
      "price": 29.99,
      "sales": 1000,
      "rating": 4.5
    }
  ],
  "market_trend": "Description of market trend",
  "recommendation": "Strategy recommendation"
}

Analyze at least 3-5 competitors. Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are an e-commerce market analysis expert. Always return valid JSON.' },
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
        product_name: productName,
        platform,
        competitors: [],
        market_trend: '数据解析失败',
        recommendation: '请稍后重试',
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Analyze competition error:', error);
    return NextResponse.json({ success: false, error: '竞品分析失败' }, { status: 500 });
  }
}
