import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

// 测试平台连接
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    
    // 获取平台凭证
    const credentials = (globalStore as any).platformCredentials?.[platform];
    
    if (!credentials?.api_key || !credentials?.api_secret) {
      return NextResponse.json({
        success: false,
        error: '该平台尚未配置 API 凭证',
      }, { status: 400 });
    }
    
    // 模拟测试连接（实际应该调用平台API进行验证）
    // 这里只是模拟测试
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟测试结果（90%成功率）
    const success = Math.random() > 0.1;
    
    if (success) {
      return NextResponse.json({
        success: true,
        data: {
          platform,
          message: `${platform} API 连接测试成功`,
          connected_at: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'API 连接失败，请检查凭证是否正确',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('测试连接失败:', error);
    return NextResponse.json({
      success: false,
      error: '测试连接失败',
    }, { status: 500 });
  }
}
