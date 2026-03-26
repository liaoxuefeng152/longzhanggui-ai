import { NextRequest, NextResponse } from 'next/server';

// 模拟统计数据
const mockStats = {
  total_tasks: 1256,
  success_count: 1158,
  failed_count: 42,
  avg_duration: 8.5,
  total_tokens: 3256000,
};

/**
 * 获取任务统计
 * GET /api/v1/task-logs/stats/summary
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('获取任务统计失败:', error);
    return NextResponse.json(
      { error: '获取任务统计失败' },
      { status: 500 }
    );
  }
}
