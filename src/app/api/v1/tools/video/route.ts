import { NextRequest, NextResponse } from 'next/server';
import { VideoGenerationClient, Config, HeaderUtils, Content } from 'coze-coding-dev-sdk';

/**
 * 龙掌柜智能运营助手 - 视频生成 API
 * 
 * 功能：
 * - 文生视频（Text to Video）：根据文本描述生成视频
 * - 图生视频（Image to Video）：根据首帧图片生成视频
 * - 首尾帧控制：根据首帧和尾帧图片生成过渡视频
 * - 支持多种分辨率（480p、720p、1080p）
 * - 支持多种宽高比（16:9、9:16、1:1、4:3、3:4、21:9）
 * - 支持自动音频生成
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt,              // 文本描述（必填）
      firstFrameImage,     // 首帧图片URL（可选）
      lastFrameImage,      // 尾帧图片URL（可选）
      duration = -1,       // 视频时长（秒），-1自动选择，或 5/10
      resolution = '720p', // 分辨率：480p、720p、1080p
      ratio = '16:9',      // 宽高比：16:9、9:16、1:1、4:3、3:4、21:9、adaptive
      watermark = false,   // 是否添加水印
      generateAudio = true, // 是否生成音频
      model = 'doubao-seedance-1-5-pro-251215', // 模型ID
    } = body;

    if (!prompt && !firstFrameImage) {
      return NextResponse.json(
        { success: false, error: '请提供视频描述或首帧图片' },
        { status: 400 }
      );
    }

    // 初始化视频生成客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new VideoGenerationClient(config, customHeaders);

    // 构建内容数组
    const contentItems: Content[] = [];

    // 添加首帧图片（如果有）
    if (firstFrameImage) {
      contentItems.push({
        type: 'image_url',
        image_url: { url: firstFrameImage },
        role: 'first_frame',
      });
    }

    // 添加尾帧图片（如果有）
    if (lastFrameImage) {
      contentItems.push({
        type: 'image_url',
        image_url: { url: lastFrameImage },
        role: 'last_frame',
      });
    }

    // 添加文本描述
    if (prompt) {
      contentItems.push({
        type: 'text',
        text: prompt,
      });
    }

    // 生成视频
    const response = await client.videoGeneration(contentItems, {
      model,
      duration,
      resolution,
      ratio,
      watermark,
      generateAudio,
      maxWaitTime: 900, // 最大等待时间（秒）
    });

    if (response.videoUrl) {
      return NextResponse.json({
        success: true,
        videoUrl: response.videoUrl,
        lastFrameUrl: response.lastFrameUrl,
        taskId: response.response.id,
        status: response.response.status,
        duration: response.response.duration,
        resolution: response.response.resolution,
        ratio: response.response.ratio,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: response.response.error_message || '视频生成失败',
          status: response.response.status,
          taskId: response.response.id,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Video generation error:', error);
    
    // 提取更详细的错误信息
    let errorMessage = '视频生成失败';
    if (error?.response?.data) {
      // axios错误，包含响应数据
      errorMessage = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data);
      console.error('API Response Data:', error.response.data);
    } else if (error?.response) {
      // HTTP响应错误
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
      console.error('HTTP Response:', error.response);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage, details: error?.response?.data },
      { status: 500 }
    );
  }
}
