import { NextRequest, NextResponse } from 'next/server';

/**
 * 重试任务
 * POST /api/v1/task-logs/[id]/retry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 模拟重试任务
    console.log(`重试任务: ${id}`);

    return NextResponse.json({
      success: true,
      message: '任务已重新执行',
      data: {
        id,
        status: 'running',
        retry_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('重试任务失败:', error);
    return NextResponse.json(
      { success: false, message: '重试任务失败' },
      { status: 500 }
    );
  }
}
