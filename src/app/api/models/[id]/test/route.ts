import { NextRequest, NextResponse } from 'next/server';

// 测试模型连通性
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 模拟测试延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // 模拟测试结果（90%成功率）
    const isSuccess = Math.random() > 0.1;
    const latency = Math.floor(100 + Math.random() * 200);
    
    if (isSuccess) {
      return NextResponse.json({
        success: true,
        latency,
        message: '连接成功',
      });
    } else {
      return NextResponse.json({
        success: false,
        latency: 0,
        message: '连接失败：API密钥无效或服务不可用',
      });
    }
  } catch (error) {
    console.error('测试模型失败:', error);
    return NextResponse.json({
      success: false,
      latency: 0,
      message: '测试失败',
    });
  }
}
