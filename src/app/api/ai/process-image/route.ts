import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { ImageGenerationClient } from 'coze-coding-dev-sdk';

// 支持的目标语言
const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: 'English',
  th: 'Thai (泰语)',
  vi: 'Vietnamese (越南语)',
  id: 'Indonesian (印尼语)',
  ms: 'Malay (马来语)',
  pt: 'Portuguese (葡萄牙语)',
  es: 'Spanish (西班牙语)',
  ja: 'Japanese (日语)',
  ko: 'Korean (韩语)',
  ar: 'Arabic (阿拉伯语)',
};

// 不同处理模式的提示词
const MODE_PROMPTS: Record<string, string> = {
  translate: `You are an image text translation expert. Analyze this image:
1. Identify ALL text content in the image
2. Describe the exact position of each text (top-left, top-center, center, bottom-right, etc.)
3. Describe the text style (color, font size, bold/regular, background)
4. Return JSON format: {"texts": [{"original": "原文", "position": "位置描述", "style": "样式描述"}], "background": "背景描述", "layout": "整体布局描述"}`,

  optimize: `你是一个专业的电商图片优化专家。请分析这张图片：
1. 评估图片质量和清晰度
2. 识别产品主体和背景
3. 给出优化建议（光线、构图、色彩等）
4. 返回JSON格式：{"quality_score": 8, "issues": ["问题1"], "suggestions": ["建议1"], "product_detected": "产品名称"}`,

  remove_watermark: `你是一个图片处理专家。请分析这张图片：
1. 检测图片中是否存在水印
2. 如果有水印，描述水印的位置和特征
3. 给出去除水印的建议方法
4. 返回JSON格式：{"has_watermark": true, "watermark_position": "右下角", "watermark_type": "文字水印", "removal_difficulty": "简单/中等/困难", "suggestions": ["建议"]}`,

  white_background: `你是一个电商图片处理专家。请分析这张图片：
1. 识别图片主体
2. 分析当前背景
3. 评估抠图难度
4. 返回JSON格式：{"subject": "产品名称", "current_background": "描述", "cutout_difficulty": "简单/中等/困难", "edge_quality": "边缘质量评估", "suggestions": ["建议"]}`,
};

// 全局模型存储声明
declare global {
  var modelsStore: any[] | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const imageUrl = body.image_url;
    const mode = body.mode || 'translate';
    const targetLanguage = body.target_language || 'en';
    
    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: '请提供图片URL',
      }, { status: 400 });
    }

    // 验证图片URL格式
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json({
        success: false,
        error: '图片URL格式无效',
      }, { status: 400 });
    }

    // 获取对应模式的提示词
    const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.translate;
    
    // 使用 Vision 模型分析图片
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const visionMessages = [
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: modePrompt },
          {
            type: 'image_url' as const,
            image_url: {
              url: imageUrl,
              detail: 'high' as const,
            },
          },
        ],
      },
    ];

    try {
      console.log(`[图片处理] 使用模型: doubao-seed-1-6-vision-250815, 模式: ${mode}, 目标语言: ${targetLanguage}`);
      
      // 调用 Vision 模型分析图片
      const visionResponse = await llmClient.invoke(visionMessages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3,
      });

      console.log(`[图片处理] Vision响应: ${visionResponse.content.substring(0, 300)}...`);

      // 解析 AI 返回的结果
      let analysisResult;
      try {
        const jsonMatch = visionResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = { raw_response: visionResponse.content };
        }
      } catch {
        analysisResult = { raw_response: visionResponse.content };
      }

      // 生成任务ID
      const taskId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const modeLabels: Record<string, string> = {
        translate: '图片翻译',
        optimize: '图片优化',
        remove_watermark: '去水印',
        white_background: '白底图',
      };

      // 如果是翻译模式，生成翻译后的图片
      if (mode === 'translate' && analysisResult.texts && analysisResult.texts.length > 0) {
        // 翻译文字
        const translatePrompt = `Translate the following Chinese texts to ${SUPPORTED_LANGUAGES[targetLanguage] || 'English'}.
Keep the translation natural and suitable for e-commerce/marketing context.
Return ONLY a JSON array of translations in the same order: ["translation1", "translation2", ...]

Texts to translate:
${analysisResult.texts.map((t: any) => t.original).join('\n')}`;

        const translateResponse = await llmClient.invoke([
          { role: 'user' as const, content: translatePrompt }
        ], {
          model: 'doubao-seed-1-6-vision-250815',
          temperature: 0.3,
        });

        let translatedTexts: string[] = [];
        try {
          const jsonMatch = translateResponse.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            translatedTexts = JSON.parse(jsonMatch[0]);
          }
        } catch {
          translatedTexts = analysisResult.texts.map((t: any) => t.original);
        }

        // 构建图片生成提示词
        const imageGenPrompt = `Create an image that looks exactly like the original image, but replace ALL Chinese text with the translated text.
Original image background and layout: ${analysisResult.background || 'clean background'}
Layout: ${analysisResult.layout || 'simple layout'}

Text replacements (position: original -> translated):
${analysisResult.texts.map((t: any, i: number) => 
  `- ${t.position}: "${t.original}" -> "${translatedTexts[i] || t.original}" (style: ${t.style || 'standard text'})`
).join('\n')}

IMPORTANT: 
- Keep the EXACT same visual style, colors, and layout as the original
- Only replace the text content with translated versions
- Maintain the same text positioning and styling
- The image should look professional and natural`;

        // 使用图像生成模型生成新图片
        const imageClient = new ImageGenerationClient(config, customHeaders);
        
        console.log(`[图片翻译] 生成翻译后图片...`);
        
        const imageResponse = await imageClient.generate({
          prompt: imageGenPrompt,
          image: imageUrl, // 使用原图作为参考
          size: '2K',
        });

        const helper = imageClient.getResponseHelper(imageResponse);
        
        if (helper.success && helper.imageUrls.length > 0) {
          return NextResponse.json({
            success: true,
            data: {
              task_id: taskId,
              status: 'completed',
              original_url: imageUrl,
              processed_url: helper.imageUrls[0],
              mode,
              mode_label: modeLabels[mode] || '图片处理',
              target_language: targetLanguage,
              target_language_name: SUPPORTED_LANGUAGES[targetLanguage] || 'English',
              translations: analysisResult.texts.map((t: any, i: number) => ({
                original: t.original,
                translated: translatedTexts[i] || t.original,
                position: t.position,
              })),
              model_used: 'doubao-seed-1-6-vision-250815 + image-generation',
            },
          });
        }
      }

      // 非翻译模式或没有文字，返回分析结果
      return NextResponse.json({
        success: true,
        data: {
          task_id: taskId,
          status: 'completed',
          original_url: imageUrl,
          processed_url: imageUrl,
          mode,
          mode_label: modeLabels[mode] || '图片处理',
          analysis: analysisResult,
          ai_response: visionResponse.content,
          target_language: targetLanguage,
          model_used: 'doubao-seed-1-6-vision-250815',
        },
      });
    } catch (apiError: any) {
      console.error('API调用失败:', apiError);
      
      if (apiError.message?.includes('downloading') || apiError.code === 'InvalidParameter') {
        return NextResponse.json({
          success: false,
          error: '无法访问图片URL，请确保图片链接可公开访问',
        }, { status: 400 });
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error('Process image error:', error);
    return NextResponse.json(
      { success: false, error: '图片处理失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取支持的语言列表
export async function GET() {
  return NextResponse.json({
    languages: Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code,
      name,
    })),
  });
}
