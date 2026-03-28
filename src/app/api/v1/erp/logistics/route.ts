import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');

    let logistics = Array.from(store.logistics.values());

    // 过滤
    if (keyword) {
      logistics = logistics.filter(l => 
        l.tracking_number.includes(keyword) || 
        l.order_id.includes(keyword)
      );
    }
    if (status) {
      logistics = logistics.filter(l => l.status === status);
    }
    if (orderId) {
      logistics = logistics.filter(l => l.order_id === orderId);
    }

    // 添加订单信息
    const logisticsWithOrder = logistics.map(log => {
      const order = store.orders.get(log.order_id);
      return {
        ...log,
        order_platform: order?.platform,
        order_product_name: order?.product_name,
        buyer_name: order?.buyer_name,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: logisticsWithOrder,
        total: logistics.length,
      }
    });
  } catch (error) {
    console.error('Get logistics error:', error);
    return NextResponse.json({ success: false, error: '获取物流失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证订单存在
    const order = store.orders.get(body.order_id);
    if (!order) {
      return NextResponse.json({ success: false, error: '订单不存在' }, { status: 400 });
    }
    
    const id = store.generateId('LOG');
    const now = store.now();
    
    const logistics: import('@/lib/store').Logistics = {
      id,
      order_id: body.order_id,
      carrier: body.carrier || '',
      tracking_number: body.tracking_number || '',
      status: 'shipped' as const,
      shipped_at: now,
      delivered_at: undefined,
      tracking_events: [{
        time: now,
        location: 'Warehouse',
        status: 'Shipment created',
      }],
      created_at: now,
      updated_at: now,
    };
    
    store.logistics.set(id, logistics);
    
    // 更新订单状态
    store.orders.set(body.order_id, {
      ...order,
      status: 'shipped',
      ship_time: now,
      updated_at: now,
    });
    
    return NextResponse.json({ success: true, data: logistics });
  } catch (error) {
    console.error('Create logistics error:', error);
    return NextResponse.json({ success: false, error: '创建物流失败' }, { status: 500 });
  }
}
