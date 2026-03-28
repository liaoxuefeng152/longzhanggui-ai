import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const productId = searchParams.get('product_id');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    let orders = Array.from(store.orders.values());

    // 过滤
    if (platform) {
      orders = orders.filter(o => o.platform === platform);
    }
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (productId) {
      orders = orders.filter(o => o.product_id === productId);
    }
    if (keyword) {
      orders = orders.filter(o => 
        o.product_name.includes(keyword) || 
        o.platform_order_id.includes(keyword) ||
        o.buyer_name?.includes(keyword)
      );
    }

    // 排序：按创建时间倒序
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 分页
    const total = orders.length;
    const start = (page - 1) * pageSize;
    const items = orders.slice(start, start + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize),
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ success: false, error: '获取订单失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证商品存在
    if (body.product_id) {
      const product = store.getProduct(body.product_id);
      if (!product) {
        return NextResponse.json({ success: false, error: '关联商品不存在' }, { status: 400 });
      }
    }
    
    // 计算利润
    const costPrice = body.cost_price || 0;
    const shippingCost = body.shipping_cost || 0;
    const platformFee = body.platform_fee || body.total_amount * 0.1;
    const adCost = body.ad_cost || 0;
    const profit = body.total_amount - costPrice - shippingCost - platformFee - adCost;
    
    const order = store.createOrder({
      ...body,
      shipping_cost: shippingCost,
      platform_fee: platformFee,
      ad_cost: adCost,
      profit,
    });

    // 更新商品销售统计
    if (order.product_id) {
      const product = store.getProduct(order.product_id);
      if (product) {
        store.updateProduct(order.product_id, {
          total_sales: (product.total_sales || 0) + order.quantity,
          total_orders: (product.total_orders || 0) + 1,
          total_profit: (product.total_profit || 0) + order.profit,
        });
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: '创建订单失败' }, { status: 500 });
  }
}
