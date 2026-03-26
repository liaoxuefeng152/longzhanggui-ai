import { NextRequest, NextResponse } from 'next/server';

/**
 * 分配工单
 * POST /api/v1/customer-tickets/[id]/assign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { assigned_to } = body;

    if (!assigned_to) {
      return NextResponse.json(
        { success: false, message: '请指定分配对象' },
        { status: 400 }
      );
    }

    // 模拟分配工单
    console.log(`工单 ${id} 已分配给: ${assigned_to}`);

    return NextResponse.json({
      success: true,
      message: '工单已分配',
      data: {
        id,
        assigned_to,
        status: 'in_progress',
        assigned_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('分配工单失败:', error);
    return NextResponse.json(
      { success: false, message: '分配工单失败' },
      { status: 500 }
    );
  }
}
