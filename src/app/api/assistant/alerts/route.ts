import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const alerts = [
      {
        id: 'ALT-001',
        type: 'inventory',
        title: '库存不足',
        message: 'SKU-001 宠物饮水机库存不足（剩余3件）',
        level: 'warning',
        product: { id: 'SKU-001', name: '宠物饮水机' },
        action: '立即补货',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ALT-002',
        type: 'ad',
        title: '广告ACOS偏高',
        message: 'SKU-002 手机支架广告ACOS达到32%，建议优化',
        level: 'info',
        product: { id: 'SKU-002', name: '手机支架' },
        action: '调整竞价',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'ALT-003',
        type: 'order',
        title: '订单异常',
        message: '订单 #TK-890 物流停滞超过48小时',
        level: 'warning',
        orderId: 'TK-890',
        action: '联系买家',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'ALT-004',
        type: 'review',
        title: '差评预警',
        message: '商品 SKU-003 收到1条1星评价',
        level: 'critical',
        product: { id: 'SKU-003', name: '折叠伞' },
        action: '查看评价',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
    ];

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Alerts Error:', error);
    return NextResponse.json(
      { error: '获取告警失败' },
      { status: 500 }
    );
  }
}
