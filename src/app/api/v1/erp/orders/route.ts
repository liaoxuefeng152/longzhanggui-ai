import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, addOrder, Order } from '@/lib/data/orders-store';

/**
 * 获取订单列表
 * GET /api/v1/erp/orders
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const marketplace = searchParams.get('marketplace');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let orders = getAllOrders();

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    if (platform) {
      orders = orders.filter(o => o.platform.toLowerCase() === platform.toLowerCase());
    }

    if (marketplace) {
      orders = orders.filter(o => o.marketplace.toLowerCase() === marketplace.toLowerCase());
    }

    // 排序：按订单时间倒序
    orders.sort((a, b) => new Date(b.ordered_at).getTime() - new Date(a.ordered_at).getTime());

    // 分页
    const paginatedOrders = orders.slice(offset, offset + limit);

    return NextResponse.json({
      orders: paginatedOrders,
      total: orders.length,
      summary: {
        total_orders: orders.length,
        total_revenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
        pending_orders: orders.filter(o => o.status === 'pending').length,
        processing_orders: orders.filter(o => o.status === 'processing').length,
        shipped_orders: orders.filter(o => o.status === 'shipped').length,
        delivered_orders: orders.filter(o => o.status === 'delivered').length,
        cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
      },
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json(
      { error: '获取订单列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建订单
 * POST /api/v1/erp/orders
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      customer_name,
      customer_email,
      platform,
      marketplace,
      products,
      shipping_address,
      currency,
    } = body;

    if (!customer_id || !platform || !products || products.length === 0) {
      return NextResponse.json(
        { error: '请填写必填字段' },
        { status: 400 }
      );
    }

    // 计算金额
    const subtotal = products.reduce((sum: number, p: any) => sum + (p.total_price || 0), 0);
    const shipping_cost = body.shipping_cost || 0;
    const tax = body.tax || 0;
    const total_amount = subtotal + shipping_cost + tax;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      order_no: `ORD-${Date.now()}`,
      customer_id,
      customer_name: customer_name || '未命名客户',
      customer_email: customer_email || '',
      platform,
      marketplace: marketplace || 'US',
      products,
      subtotal,
      shipping_cost,
      tax,
      total_amount,
      currency: currency || 'USD',
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: body.payment_method || 'Credit Card',
      shipping_address: shipping_address || {
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      },
      tracking_number: null,
      carrier: null,
      ordered_at: new Date().toISOString(),
      shipped_at: null,
      delivered_at: null,
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addOrder(newOrder);

    return NextResponse.json({
      success: true,
      message: '订单创建成功',
      data: newOrder,
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      { error: '创建订单失败' },
      { status: 500 }
    );
  }
}
