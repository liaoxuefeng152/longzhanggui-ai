import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * Listing 智能生成工具 API
 * 
 * 功能：
 * - 标题生成与优化
 * - 五点描述生成
 * - 详细描述生成
 * - 多语言支持
 * - SEO关键词优化
 */

interface ListingRequest {
  productName: string;         // 产品名称
  category?: string;           // 类目
  features?: string[];         // 产品特点
  targetMarket: 'TH' | 'VN' | 'MY' | 'ID' | 'PH' | 'US' | 'UK';
  targetLanguage: 'en' | 'th' | 'vi' | 'ms' | 'id' | 'ph';
  keywords?: string[];         // 目标关键词
  competitorTitles?: string[]; // 竞品标题
  tone?: 'professional' | 'casual' | 'enthusiastic'; // 语气风格
}

// 语言配置
const LANGUAGE_CONFIG = {
  en: { name: 'English', systemPrompt: 'Generate listing in English' },
  th: { name: 'Thai', systemPrompt: '生成泰语Listing，使用自然的泰语表达' },
  vi: { name: 'Vietnamese', systemPrompt: '生成越南语Listing，使用自然的越南语表达' },
  ms: { name: 'Malay', systemPrompt: '生成马来语Listing，使用自然的马来语表达' },
  id: { name: 'Indonesian', systemPrompt: '生成印尼语Listing，使用自然的印尼语表达' },
  ph: { name: 'Filipino', systemPrompt: '生成菲律宾语Listing，使用自然的菲律宾语表达' },
};

// Listing生成系统提示词
const LISTING_SYSTEM_PROMPT = `你是跨境电商Listing优化专家，精通各大平台（Shopee、Lazada、TikTok Shop、Amazon）的Listing优化规则。

## 输出格式

### 1. 标题（Title）
- 长度：根据平台限制（一般100-150字符）
- 结构：品牌词 + 核心关键词 + 属性词 + 场景词
- 要求：包含主要关键词，语句通顺，吸引点击

### 2. 五点描述（Bullet Points）
- 每点50-100字符
- 突出卖点：功能、优势、使用场景、品质保证
- 使用简洁有力的表达

### 3. 详细描述（Description）
- 200-500字符
- 结构：产品介绍 → 核心卖点 → 使用场景 → 规格参数 → 购买须知
- 增强信任感和购买欲望

### 4. SEO关键词
- 核心关键词（3-5个）
- 长尾关键词（5-10个）
- 搜索热度建议

## 优化原则
1. 关键词自然融入，避免堆砌
2. 突出产品差异化卖点
3. 符合目标市场消费者习惯
4. 遵守平台规则，避免违禁词`;

export async function POST(request: NextRequest) {
  try {
    const body: ListingRequest = await request.json();
    const {
      productName,
      category,
      features,
      targetMarket,
      targetLanguage,
      keywords,
      competitorTitles,
      tone = 'professional'
    } = body;

    if (!productName) {
      return new Response(
        JSON.stringify({ success: false, error: '请提供产品名称' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 语言配置
    const langConfig = LANGUAGE_CONFIG[targetLanguage] || LANGUAGE_CONFIG.en;

    // 构建请求消息
    const userMessage = `
请为以下产品生成Listing：

**产品名称**: ${productName}
${category ? `**类目**: ${category}` : ''}
${features?.length ? `**产品特点**:\n${features.map(f => `- ${f}`).join('\n')}` : ''}
${keywords?.length ? `**目标关键词**: ${keywords.join(', ')}` : ''}
${competitorTitles?.length ? `**竞品标题参考**:\n${competitorTitles.map(t => `- ${t}`).join('\n')}` : ''}
**目标市场**: ${targetMarket}
**语气风格**: ${tone === 'professional' ? '专业正式' : tone === 'casual' ? '轻松自然' : '热情活泼'}

${langConfig.systemPrompt}

请按以下格式输出：
## 📝 标题
[生成的标题]

## 📌 五点描述
1. [第一点]
2. [第二点]
3. [第三点]
4. [第四点]
5. [第五点]

## 📄 详细描述
[详细描述内容]

## 🔍 SEO关键词建议
- 核心关键词：[关键词列表]
- 长尾关键词：[关键词列表]

## 💡 优化建议
[针对该产品的Listing优化建议]
`;

    // 初始化 LLM 客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages = [
            { role: 'system' as const, content: LISTING_SYSTEM_PROMPT },
            { role: 'user' as const, content: userMessage }
          ];

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', message: `开始生成${langConfig.name} Listing...` })}\n\n`));

          const llmStream = client.stream(messages, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.7,
          });

          let fullResponse = '';
          
          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Listing generation error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: '生成失败，请重试' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Listing API error:', error);
    return new Response(
      JSON.stringify({ success: false, error: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
