import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 预览采集商品
 * POST /api/v1/1688/collect/preview
 * 代理到Python后端
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: '请提供商品链接' },
        { status: 400 }
      );
    }

    // 验证1688链接
    if (!url.includes('1688.com')) {
      return NextResponse.json(
        { success: false, message: '请输入有效的1688商品链接' },
        { status: 400 }
      );
    }

    // 调用Python后端
    const response = await fetch(`${BACKEND_URL}/api/v1/1688/collect/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('预览失败:', error);
    return NextResponse.json(
      { success: false, message: '预览失败，请稍后重试' },
      { status: 500 }
    );
  }
}
