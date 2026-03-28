import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = store.getProduct(id);
    
    if (!product) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    // 获取关联数据
    const inventory = store.getInventoryByProduct(id);
    const orders = store.getOrdersByProduct(id);
    const ads = store.getAdsByProduct(id);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        inventory,
        recent_orders: orders.slice(0, 5),
        ad_campaigns: ads,
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ success: false, error: '获取商品详情失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 重新计算总成本
    if (body.cost_price !== undefined || body.domestic_shipping !== undefined || body.first_mile_shipping !== undefined) {
      const product = store.getProduct(id);
      if (product) {
        const costPrice = body.cost_price ?? product.cost_price;
        const domesticShipping = body.domestic_shipping ?? product.domestic_shipping;
        const firstMileShipping = body.first_mile_shipping ?? product.first_mile_shipping;
        body.total_cost = costPrice + domesticShipping + firstMileShipping;
      }
    }

    const product = store.updateProduct(id, body);
    
    if (!product) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: '更新商品失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = store.deleteProduct(id);
    
    if (!success) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '商品已删除' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: false, error: '删除商品失败' }, { status: 500 });
  }
}
