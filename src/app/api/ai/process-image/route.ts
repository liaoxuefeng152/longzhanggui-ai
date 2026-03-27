import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 不同处理模式的提示词
const MODE_PROMPTS: Record<string, string> = {
  translate: `你是一个专业的图片翻译助手。请分析这张图片：
1. 识别图片中所有的文字内容
2. 将文字翻译成英文（如果原文是中文）或中文（如果原文是英文）
3. 保持原有的格式和布局建议
4. 返回JSON格式：{"original_texts": ["原文1", "原文2"], "translated_texts": ["译文1", "译文2"], "notes": "翻译说明"}`,

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

// 获取用户配置的模型
function getUserConfiguredModel(): { provider: string; modelId: string; apiKey: string; endpoint?: string } | null {
  if (!global.modelsStore) return null;
  
  // 查找第一个活跃的用户配置模型
  const userModels = global.modelsStore.filter(m => m.status === 'active' && m.api_key && m.api_key !== 'sk-demo-key');
  
  if (userModels.length > 0) {
    const model = userModels[0];
    return {
      provider: model.provider,
      modelId: model.model_id,
      apiKey: model.api_key,
      endpoint: model.endpoint,
    };
  }
  
  return null;
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
    
    // 检查是否有用户配置的模型
    const userModel = getUserConfiguredModel();
    
    // 使用 Vision 模型分析图片
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 选择模型：如果用户配置了 DeepSeek，使用 DeepSeek；否则使用豆包 Vision
    // 注意：DeepSeek 不支持图片输入，所以图片处理仍然使用豆包 Vision
    const modelName = 'doubao-seed-1-6-vision-250815'; // Vision 模型用于图片理解

    const messages = [
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
      console.log(`[图片处理] 使用模型: ${modelName}, 模式: ${mode}, 图片URL: ${imageUrl}`);
      
      // 调用 Vision 模型
      const response = await client.invoke(messages, {
        model: modelName,
        temperature: 0.3,
      });

      console.log(`[图片处理] AI响应: ${response.content.substring(0, 200)}...`);

      // 解析 AI 返回的结果
      let analysisResult;
      try {
        // 尝试提取 JSON
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = { raw_response: response.content };
        }
      } catch {
        analysisResult = { raw_response: response.content };
      }

      // 生成任务ID
      const taskId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 根据模式返回不同的结果
      const modeLabels: Record<string, string> = {
        translate: '图片翻译',
        optimize: '图片优化',
        remove_watermark: '去水印',
        white_background: '白底图',
      };

      return NextResponse.json({
        success: true,
        data: {
          task_id: taskId,
          status: 'completed',
          original_url: imageUrl,
          processed_url: imageUrl, // 实际图片处理需要图片编辑服务
          mode,
          mode_label: modeLabels[mode] || '图片处理',
          analysis: analysisResult,
          ai_response: response.content,
          target_language: targetLanguage,
          model_used: modelName,
        },
      });
    } catch (apiError: any) {
      console.error('Vision API调用失败:', apiError);
      
      // 如果是图片下载失败，返回更友好的错误信息
      if (apiError.message?.includes('downloading') || apiError.code === 'InvalidParameter') {
        return NextResponse.json({
          success: false,
          error: '无法访问图片URL，请确保图片链接可公开访问，或尝试使用其他图片链接',
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
