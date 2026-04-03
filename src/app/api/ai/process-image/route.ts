import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, ImageGenerationClient } from 'coze-coding-dev-sdk';

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
  zh: 'Chinese (中文)',
};

// 不同处理模式的提示词
const MODE_PROMPTS: Record<string, string> = {
  translate: `You are an expert at analyzing and translating text in images. 
Please analyze this image carefully:
1. Identify ALL text content visible in the image
2. Describe the exact position of each text element (top-left, top-center, center, bottom-right, etc.)
3. Describe the text style (color, font size, bold/regular, background)
4. Return JSON format with this exact structure:
{
  "texts": [
    {"original": "the exact text found", "position": "position description", "style": "style description"}
  ],
  "background": "background description",
  "layout": "overall layout description"
}

If no text is found, return: {"texts": [], "background": "...", "layout": "..."}`,

  optimize: `You are a professional e-commerce image optimization expert. Please analyze this image:
1. Evaluate image quality and clarity
2. Identify the main subject and background
3. Provide optimization suggestions (lighting, composition, colors, etc.)
4. Return JSON format: {"quality_score": 8, "issues": ["issue1"], "suggestions": ["suggestion1"], "product_detected": "product name"}`,

  remove_watermark: `You are an image processing expert. Please analyze this image:
1. Detect if there are watermarks in the image
2. If there are watermarks, describe their position and characteristics
3. Provide suggestions for watermark removal
4. Return JSON format: {"has_watermark": true/false, "watermark_position": "position", "watermark_type": "type", "removal_difficulty": "easy/medium/difficult", "suggestions": ["suggestions"]}`,

  white_background: `You are an e-commerce image processing expert. Please analyze this image:
1. Identify the main subject
2. Analyze the current background
3. Evaluate background removal difficulty
4. Return JSON format: {"subject": "product name", "current_background": "description", "cutout_difficulty": "easy/medium/difficult", "edge_quality": "evaluation", "suggestions": ["suggestions"]}`,
};

// 图片翻译专用提示词 - 用于生成翻译后的图片
const TRANSLATION_IMAGE_PROMPT = `You are a professional image editor. Create a new image based on the original image but with translated text.

Original image background: {background}
Original layout: {layout}

Text replacements (MUST keep exact position and style):
{text_replacements}

IMPORTANT REQUIREMENTS:
- Keep the EXACT same visual style, colors, lighting, and composition as the original image
- Only replace the text content with the translated versions
- Maintain the same text positioning, sizing, and styling
- The result should look professional and natural, as if the text was always in that language
- Do NOT add any new elements or change anything except the text
- The image quality should be the same as the original`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const imageUrl = body.image_url;
    const mode = body.mode || 'optimize';
    const targetLanguage = body.target_language || 'en';
    const productDescription = body.product_description || '';
    const prompt = body.prompt;
    const aspectRatio = body.aspect_ratio || '1:1';
    const resolution = body.resolution || '1K';
    
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();

    // 生成任务ID
    const taskId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const modeLabels: Record<string, string> = {
      translate: '图片翻译',
      optimize: '图片优化分析',
      remove_watermark: '水印检测',
      white_background: '白底图分析',
      main: 'AI主图生成',
      background: '白底图生成',
      'a-plus': 'A+页面图',
      cover: '封面图生成',
    };

    // 如果没有提供图片URL且有prompt，则执行纯图片生成
    if (!imageUrl && prompt) {
      console.log(`[图片生成] 提示词: ${prompt.substring(0, 50)}...`);
      
      try {
        const imageClient = new ImageGenerationClient(config, customHeaders);
        
        // 将分辨率转换为图片生成API支持的尺寸
        let size = '1K';
        if (resolution === '2K') size = '2K';
        else if (resolution === '4K') size = '4K';
        
        const imageResponse = await imageClient.generate({
          prompt,
          size,
        });

        console.log(`[图片生成] 响应: ${JSON.stringify(imageResponse).substring(0, 200)}...`);

        // 解析图片生成结果
        let processedUrl = '';
        let generatedSize = '';
        
        if (imageResponse && imageResponse.data && imageResponse.data.length > 0) {
          processedUrl = imageResponse.data[0].url || '';
          generatedSize = imageResponse.data[0].size || size;
          console.log(`[图片生成] 生成成功: ${processedUrl.substring(0, 50)}...`);
        }

        return NextResponse.json({
          success: true,
          data: {
            task_id: taskId,
            status: 'completed',
            original_url: null,
            processed_url: processedUrl,
            generated_size: generatedSize,
            mode: mode || 'main',
            mode_label: modeLabels[mode] || 'AI主图生成',
            prompt,
            aspect_ratio: aspectRatio,
            model_used: 'doubao-seedream',
          },
        });
      } catch (apiError: any) {
        console.error('图片生成失败:', apiError);
        throw apiError;
      }
    }

    // 需要图片URL的处理流程
    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: '请提供图片URL或图片生成提示词',
      }, { status: 400 });
    }

    // 获取对应模式的提示词
    const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.optimize;
    
    // 使用 Vision 模型分析图片
    const llmClient = new LLMClient(config, customHeaders);

    // 构建消息 - 豆包Vision模型支持直接通过URL处理图片
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
      console.log(`[图片处理] 模式: ${mode}, 目标语言: ${targetLanguage}`);
      
      // 调用 Vision 模型分析图片
      const visionResponse = await llmClient.invoke(visionMessages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3,
      });

      console.log(`[图片处理] Vision响应: ${visionResponse.content.substring(0, 200)}...`);

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

      // 如果是翻译模式且有文字，生成翻译后的图片
      if (mode === 'translate' && analysisResult.texts && analysisResult.texts.length > 0) {
        console.log(`[图片翻译] 检测到 ${analysisResult.texts.length} 个文字元素`);
        
        // 翻译文字
        const targetLangName = SUPPORTED_LANGUAGES[targetLanguage] || 'English';
        const translatePrompt = `Translate the following texts to ${targetLangName}.
Keep translations natural and suitable for e-commerce/marketing context.
Return ONLY a valid JSON array of translations in the exact same order as the input.
If a translation is not needed (already in target language or is a number/symbol), keep it unchanged.

Input texts:
${analysisResult.texts.map((t: any, i: number) => `${i + 1}. "${t.original}"`).join('\n')}

Output format: ["translation1", "translation2", ...]`;

        const translateResponse = await llmClient.invoke([
          { role: 'user' as const, content: translatePrompt }
        ], {
          model: 'doubao-seed-1-6-251015',
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

        console.log(`[图片翻译] 翻译完成: ${translatedTexts.join(', ')}`);

        // 构建图片生成提示词 - 基于原图生成带翻译的新图
        const textReplacements = analysisResult.texts.map((t: any, i: number) => 
          `Position "${t.position}": "${t.original}" → "${translatedTexts[i] || t.original}" (Style: ${t.style || 'standard'})`
        ).join('\n');

        const imageGenPrompt = TRANSLATION_IMAGE_PROMPT
          .replace('{background}', analysisResult.background || 'professional product photography')
          .replace('{layout}', analysisResult.layout || 'centered composition')
          .replace('{text_replacements}', textReplacements);

        // 使用图像生成模型生成翻译后的图片
        const imageClient = new ImageGenerationClient(config, customHeaders);
        
        console.log(`[图片翻译] 生成翻译后图片...`);
        
        const imageResponse = await imageClient.generate({
          prompt: imageGenPrompt,
          size: '2K',
        });

        // 解析图片生成结果
        let processedUrl = imageUrl;
        let generatedSize = '';
        
        if (imageResponse && imageResponse.data && imageResponse.data.length > 0) {
          processedUrl = imageResponse.data[0].url;
          generatedSize = imageResponse.data[0].size || '2K';
          console.log(`[图片翻译] 生成成功: ${processedUrl.substring(0, 50)}...`);
        }

        return NextResponse.json({
          success: true,
          data: {
            task_id: taskId,
            status: 'completed',
            original_url: imageUrl,
            processed_url: processedUrl,
            generated_size: generatedSize,
            mode,
            mode_label: modeLabels[mode] || '图片处理',
            target_language: targetLanguage,
            target_language_name: targetLangName,
            translations: analysisResult.texts.map((t: any, i: number) => ({
              original: t.original,
              translated: translatedTexts[i] || t.original,
              position: t.position,
              style: t.style,
            })),
            model_used: 'doubao-vision + doubao-seedream',
          },
        });
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
          model_used: 'doubao-vision',
        },
      });
    } catch (apiError: any) {
      console.error('API调用失败:', apiError);
      
      if (apiError.message?.includes('downloading') || apiError.code === 'InvalidParameter') {
        return NextResponse.json({
          success: false,
          error: '无法访问图片URL，请确保图片链接可公开访问（不支持需要签名的临时链接）',
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
