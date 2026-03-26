import { NextRequest, NextResponse } from 'next/server';

// 模拟工单数据
const tickets: any[] = [
  {
    id: 'TK-2026-0001',
    title: '订单物流查询 - 包裹未送达',
    content: '客户询问订单#TK20260321001的物流状态，包裹已发出5天但尚未送达。',
    priority: 'medium',
    status: 'open',
    user_id: 'USR-001',
    assigned_to: 'AI客服',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'TK-2026-0002',
    title: '退款申请 - 商品与描述不符',
    content: '客户收到商品后发现与描述不符，要求全额退款。订单号: AM20260321001。',
    priority: 'high',
    status: 'in_progress',
    user_id: 'USR-002',
    assigned_to: '客服小王',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'TK-2026-0003',
    title: 'A-to-Z索赔处理',
    content: '亚马逊买家发起A-to-Z索赔，声称未收到商品。需要核实物流信息并处理。',
    priority: 'high',
    status: 'open',
    user_id: 'USR-003',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'TK-2026-0004',
    title: '产品咨询 - 询问库存和规格',
    content: '客户询问产品SKU-2026-001的库存情况和详细规格参数。',
    priority: 'low',
    status: 'resolved',
    user_id: 'USR-004',
    assigned_to: 'AI客服',
    resolution: '已通过AI自动回复告知客户库存和规格信息。',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'TK-2026-0005',
    title: '投诉 - 发货延迟',
    content: '客户投诉订单发货延迟，原承诺24小时内发货但实际等待了3天。',
    priority: 'high',
    status: 'escalated',
    user_id: 'USR-005',
    assigned_to: '主管处理',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

/**
 * 获取工单列表
 * GET /api/v1/customer-tickets
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    let filtered = [...tickets];

    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }

    if (priority) {
      filtered = filtered.filter(t => t.priority === priority);
    }

    const startIndex = (page - 1) * pageSize;
    const paginatedTickets = filtered.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      tickets: paginatedTickets,
      total: filtered.length,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    return NextResponse.json(
      { error: '获取工单列表失败' },
      { status: 500 }
    );
  }
}
