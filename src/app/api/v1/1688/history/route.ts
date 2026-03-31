import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 获取1688采集历史
 * GET /api/v1/1688/history
 * 代理到Python后端
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';

    // 调用Python后端
    const response = await fetch(
      `${BACKEND_URL}/api/v1/1688/history?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('获取采集历史失败:', error);
    return NextResponse.json(
      { success: false, message: '获取采集历史失败', items: [], total: 0 },
      { status: 500 }
    );
  }
}
