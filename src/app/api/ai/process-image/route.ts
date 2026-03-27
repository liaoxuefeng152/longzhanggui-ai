import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const imageUrl = body.image_url;
    const mode = body.mode || 'translate';
    
    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: '请提供图片URL',
      }, { status: 400 });
    }
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // 模拟返回处理后的图片URL
    const taskId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        status: 'completed',
        original_url: imageUrl,
        processed_url: imageUrl, // 实际应返回处理后的图片URL
        mode,
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
