import { NextRequest, NextResponse } from 'next/server';

// 模拟采集历史数据
const mockHistory = [
  {
    id: 'hist_1',
    source_url: 'https://detail.1688.com/offer/654321.html',
    source_id: '654321',
    product_id: 'PROD-001',
    status: 'collected',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'hist_2',
    source_url: 'https://detail.1688.com/offer/765432.html',
    source_id: '765432',
    product_id: 'PROD-002',
    status: 'collected',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'hist_3',
    source_url: 'https://detail.1688.com/offer/876543.html',
    source_id: '876543',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

/**
 * 获取采集历史
 * GET /api/v1/1688/history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    // 返回模拟数据
    return NextResponse.json({
      success: true,
      total: mockHistory.length,
      page,
      page_size: pageSize,
      items: mockHistory,
    });
  } catch (error) {
    console.error('获取采集历史失败:', error);
    return NextResponse.json(
      { success: false, message: '获取采集历史失败' },
      { status: 500 }
    );
  }
}
