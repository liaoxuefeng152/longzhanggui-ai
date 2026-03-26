import { NextRequest, NextResponse } from 'next/server';

// 模拟工单数据
const tickets: Record<string, any> = {
  'TK-2026-0001': {
    id: 'TK-2026-0001',
    title: '订单物流查询 - 包裹未送达',
    content: '客户询问订单#TK20260321001的物流状态，包裹已发出5天但尚未送达。物流单号: SF1234567890，最后更新时间: 3天前。',
    priority: 'medium',
    status: 'open',
    user_id: 'USR-001',
    assigned_to: 'AI客服',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  'TK-2026-0002': {
    id: 'TK-2026-0002',
    title: '退款申请 - 商品与描述不符',
    content: '客户收到商品后发现与描述不符，要求全额退款。订单号: AM20260321001。客户提供的照片显示商品颜色与图片有差异。',
    priority: 'high',
    status: 'in_progress',
    user_id: 'USR-002',
    assigned_to: '客服小王',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  'TK-2026-0003': {
    id: 'TK-2026-0003',
    title: 'A-to-Z索赔处理',
    content: '亚马逊买家发起A-to-Z索赔，声称未收到商品。物流信息显示已送达，需要核实并提供证据。',
    priority: 'high',
    status: 'open',
    user_id: 'USR-003',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
};

/**
 * 获取工单详情
 * GET /api/v1/customer-tickets/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = tickets[id];

    if (!ticket) {
      return NextResponse.json(
        { error: '工单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('获取工单详情失败:', error);
    return NextResponse.json(
      { error: '获取工单详情失败' },
      { status: 500 }
    );
  }
}
