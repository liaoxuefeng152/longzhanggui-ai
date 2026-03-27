import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 语言名称映射
const LANGUAGE_NAMES: Record<string, string> = {
  id: 'Indonesian (Bahasa Indonesia)',
  th: 'Thai (ภาษาไทย)',
  vi: 'Vietnamese (Tiếng Việt)',
  en: 'English',
  ms: 'Malay (Bahasa Melayu)',
  pt: 'Portuguese (Português)',
  es: 'Spanish (Español)',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const productInfo = body.product_info || {};
    const platform = body.platform || 'tiktok';
    const language = body.language || 'id';
    const keywords = body.keywords || [];
    
    const productName = productInfo.name || productInfo.title || '商品';
    const languageName = LANGUAGE_NAMES[language] || 'English';
    
    // 构建提示词
    const systemPrompt = `You are a professional e-commerce listing expert specializing in ${platform === 'amazon' ? 'Amazon' : 'TikTok Shop'} platform optimization.

IMPORTANT RULES:
1. ALL output MUST be in ${languageName} language
2. DO NOT use Chinese or any other language
3. Follow platform-specific character limits and best practices
4. Use SEO-friendly keywords naturally
5. Make content compelling and conversion-focused

${platform === 'amazon' ? `
Amazon Guidelines:
- Title: 150-200 characters, include brand + product name + key features
- Bullet points: 5 points, each 150-200 characters, start with benefit
- Description: 1000-2000 characters, detailed product information
- Keywords: 5-10 relevant search terms
` : `
TikTok Shop Guidelines:
- Title: 60-80 characters, catchy and include main keywords
- Description: 300-500 characters, highlight selling points with emojis
- Tags: 3-5 relevant hashtags
- Keywords: 5-8 search terms popular on TikTok
`}`;

    const userPrompt = `Create an optimized listing for the following product:

Product Name: ${productName}
${keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''}

Generate the listing in ${languageName} with the following format (return as JSON):
{
  "title": "Product title in ${languageName}",
  "description": "Product description in ${languageName}",
  "bullet_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "keywords": ["keyword1", "keyword2", ...],
  "seo_score": 85,
  "seo_details": {
    "title_score": 85,
    "description_score": 90,
    "keywords_score": 88
  }
}

REMEMBER: All text MUST be in ${languageName}, not Chinese!`;

    // 调用 AI 模型
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    console.log(`[Listing优化] 商品: ${productName}, 平台: ${platform}, 语言: ${languageName}`);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-251015', // 使用平衡性能模型
      temperature: 0.7,
    });

    console.log(`[Listing优化] AI响应: ${response.content.substring(0, 200)}...`);

    // 解析AI响应
    let listingData;
    try {
      // 尝试提取JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        listingData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('解析AI响应失败:', parseError);
      // 如果解析失败，使用默认结构
      listingData = {
        title: `${productName} - Premium Quality`,
        description: response.content,
        bullet_points: [],
        keywords: [],
        seo_score: 80,
      };
    }

    // 确保所有字段都存在
    const result = {
      title: listingData.title || `${productName} - Premium Quality`,
      description: listingData.description || '',
      bullet_points: listingData.bullet_points || [],
      keywords: listingData.keywords || [],
      seo_score: listingData.seo_score || 85,
      seo_details: listingData.seo_details || {
        title_score: 85,
        description_score: 88,
        keywords_score: 82,
      },
      platform,
      language,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Optimize listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Listing优化失败，请稍后重试' },
      { status: 500 }
    );
  }
}
