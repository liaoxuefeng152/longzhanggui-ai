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

    const prompt = `Generate SEO keywords for the product: "${productName}" on ${platform}.

Return a JSON with this structure:
{
  "keywords": [
    {
      "keyword": "keyword phrase",
      "relevance": 95,
      "volume": "10K-50K"
    }
  ]
}

Generate 8-10 relevant keywords with high search volume. Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are an SEO expert for e-commerce. Always return valid JSON.' },
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
        keywords: [
          { keyword: productName, relevance: 100, volume: 'Unknown' },
        ]
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Suggest keywords error:', error);
    return NextResponse.json({ success: false, error: '关键词建议失败' }, { status: 500 });
  }
}
