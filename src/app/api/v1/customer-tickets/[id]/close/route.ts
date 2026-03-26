import { NextRequest, NextResponse } from 'next/server';

/**
 * 关闭工单
 * POST /api/v1/customer-tickets/[id]/close
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { resolution } = body;

    if (!resolution) {
      return NextResponse.json(
        { success: false, message: '请提供解决方案' },
        { status: 400 }
      );
    }

    // 模拟关闭工单
    console.log(`工单 ${id} 已关闭，解决方案: ${resolution}`);

    return NextResponse.json({
      success: true,
      message: '工单已关闭',
      data: {
        id,
        status: 'closed',
        resolution,
        closed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('关闭工单失败:', error);
    return NextResponse.json(
      { success: false, message: '关闭工单失败' },
      { status: 500 }
    );
  }
}
