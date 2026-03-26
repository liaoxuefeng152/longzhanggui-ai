import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_url, mode, source_language, target_language } = body;
    
    if (!image_url) {
      return NextResponse.json(
        { success: false, error: '请提供图片URL' },
        { status: 400 }
      );
    }
    
    // 模拟图片处理
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const taskId = `img-task-${Date.now()}`;
    
    // 根据不同模式返回不同结果
    const modeDescriptions: Record<string, string> = {
      translate: '图片文字翻译',
      optimize: '图片智能优化',
      remove_watermark: '去水印处理',
      white_background: '白底图生成',
    };
    
    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        status: 'completed',
        original_url: image_url,
        processed_url: image_url, // 模拟返回原图URL
        message: `${modeDescriptions[mode] || '图片处理'}完成`,
      },
    });
  } catch (error) {
    console.error('Process image error:', error);
    return NextResponse.json(
      { success: false, error: '图片处理失败' },
      { status: 500 }
    );
  }
}
