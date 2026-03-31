import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 批量采集1688商品
 * POST /api/v1/1688/collect/batch
 * 代理到Python后端
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, message: '请提供商品链接列表' },
        { status: 400 }
      );
    }

    // 验证链接
    const validUrls = urls.filter(url => url.trim() && url.includes('1688.com'));
    if (validUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有有效的1688链接' },
        { status: 400 }
      );
    }

    // 调用Python后端
    const response = await fetch(`${BACKEND_URL}/api/v1/1688/collect/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: validUrls }),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('批量采集失败:', error);
    return NextResponse.json(
      { success: false, message: '批量采集失败，请稍后重试' },
      { status: 500 }
    );
  }
}
