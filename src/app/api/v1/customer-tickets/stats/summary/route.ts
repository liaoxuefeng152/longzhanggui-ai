import { NextRequest, NextResponse } from 'next/server';

// 模拟工单统计数据
const mockStats = {
  total: 128,
  open: 23,
  in_progress: 15,
  resolved: 75,
  closed: 15,
};

/**
 * 获取工单统计
 * GET /api/v1/customer-tickets/stats/summary
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('获取工单统计失败:', error);
    return NextResponse.json(
      { error: '获取工单统计失败' },
      { status: 500 }
    );
  }
}
