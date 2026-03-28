import { NextRequest, NextResponse } from 'next/server';

// Mock订单数据
const mockOrders = [
  {
    id: 'ORD001',
    platform: 'tiktok',
    platform_order_id: 'TK20260321001',
    product_name: '宠物自动喂食器 5L大容量',
    quantity: 2,
    sale_price: 199.00,
    total_amount: 398.00,
    currency: 'IDR',
    cost_price: 109.00,
    profit: 180.00,
    buyer_name: 'Budi Santoso',
    status: 'delivered',
    order_time: '2026-03-21 10:30:00',
    created_at: '2026-03-21 10:30:00',
  },
  {
    id: 'ORD002',
    platform: 'amazon',
    platform_order_id: 'AM20260321002',
    product_name: '便携式榨汁机 USB充电',
    quantity: 1,
    sale_price: 29.99,
    total_amount: 29.99,
    currency: 'USD',
    cost_price: 61.00,
    profit: 120.00,
    buyer_name: 'John Smith',
    status: 'shipped',
    order_time: '2026-03-21 09:15:00',
    created_at: '2026-03-21 09:15:00',
  },
  {
    id: 'ORD003',
    platform: 'tiktok',
    platform_order_id: 'TK20260320003',
    product_name: 'LED化妆镜 台式带灯',
    quantity: 3,
    sale_price: 89.00,
    total_amount: 267.00,
    currency: 'THB',
    cost_price: 48.00,
    profit: 123.00,
    buyer_name: 'Somchai Thai',
    status: 'paid',
    abnormal_type: 'address_incomplete',
    order_time: '2026-03-20 16:45:00',
    created_at: '2026-03-20 16:45:00',
  },
  {
    id: 'ORD004',
    platform: 'amazon',
    platform_order_id: 'AM20260320004',
    product_name: '智能手环 运动监测',
    quantity: 1,
    sale_price: 49.99,
    total_amount: 49.99,
    currency: 'USD',
    cost_price: 91.00,
    profit: 65.00,
    buyer_name: 'Emma Wilson',
    status: 'delivered',
    order_time: '2026-03-20 14:20:00',
    created_at: '2026-03-20 14:20:00',
  },
  {
    id: 'ORD005',
    platform: 'tiktok',
    platform_order_id: 'TK20260319005',
    product_name: '不锈钢保温杯 500ml',
    quantity: 5,
    sale_price: 45.00,
    total_amount: 225.00,
    currency: 'IDR',
    cost_price: 33.00,
    profit: 60.00,
    buyer_name: 'Ahmad Yusuf',
    status: 'pending',
    order_time: '2026-03-19 11:30:00',
    created_at: '2026-03-19 11:30:00',
  },
  {
    id: 'ORD006',
    platform: 'amazon',
    platform_order_id: 'AM20260319006',
    product_name: '猫咪自动饮水机',
    quantity: 2,
    sale_price: 35.99,
    total_amount: 71.98,
    currency: 'USD',
    cost_price: 72.00,
    profit: 72.00,
    buyer_name: 'Michael Brown',
    status: 'cancelled',
    abnormal_type: 'refund_requested',
    order_time: '2026-03-19 09:00:00',
    created_at: '2026-03-19 09:00:00',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    let filteredOrders = [...mockOrders];

    if (platform) {
      filteredOrders = filteredOrders.filter(o => o.platform === platform);
    }
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }
    if (keyword) {
      filteredOrders = filteredOrders.filter(o => 
        o.product_name.includes(keyword) || 
        o.platform_order_id.includes(keyword) ||
        o.buyer_name?.includes(keyword)
      );
    }

    const total = filteredOrders.length;
    const start = (page - 1) * pageSize;
    const items = filteredOrders.slice(start, start + pageSize);

    return NextResponse.json({
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ success: false, error: '获取订单失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newOrder = {
      id: `ORD${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: '创建订单失败' }, { status: 500 });
  }
}
