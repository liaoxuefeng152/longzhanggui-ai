import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 图片生成 API - /api/ai/generate-image
 * 
 * 功能：
 * - 文生图（Text to Image）：根据文本描述生成图片
 * - 图生图（Image to Image）：根据参考图片和文本描述生成新图片
 * - 支持多种尺寸（2K、4K、自定义）
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt,           // 文本描述（必填）
      image,            // 参考图片URL（可选，用于图生图）
      size = '2K',      // 图片尺寸：2K、4K、或 WIDTHxHEIGHT
      watermark = false, // 是否添加水印
      model = 'doubao-seedream-5-0-260128', // 模型ID
      count = 1,        // 生成数量（1-4）
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '请提供图片描述' },
        { status: 400 }
      );
    }

    // 初始化图片生成客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    // 构建请求参数
    const requestParams: {
      prompt: string;
      model?: string;
      size?: string;
      watermark?: boolean;
      image?: string | string[];
    } = {
      prompt,
      model,
      size,
      watermark,
    };

    // 如果提供了参考图片，添加到请求中
    if (image) {
      requestParams.image = image;
    }

    // 生成图片
    const response = await client.generate(requestParams);
    const helper = client.getResponseHelper(response);

    if (helper.success) {
      return NextResponse.json({
        success: true,
        imageUrl: helper.imageUrls?.[0] || '',
        imageUrls: helper.imageUrls,
        size: size,
        model: response.model,
        created: response.created,
        usage: response.usage,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: helper.errorMessages?.join('; ') || '图片生成失败'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image generation error:', error);
    const errorMessage = error instanceof Error ? error.message : '图片生成失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
