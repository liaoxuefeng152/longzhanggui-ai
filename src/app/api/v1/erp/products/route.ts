import { NextRequest, NextResponse } from 'next/server';
import store, { Product } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    let products = store.getProducts();

    // 过滤
    if (keyword) {
      products = products.filter(p => 
        p.name_zh.includes(keyword) || 
        p.name_en?.includes(keyword) ||
        p.internal_sku.includes(keyword) ||
        p.supplier_name?.includes(keyword)
      );
    }
    if (status) {
      products = products.filter(p => p.status === status);
    }
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // 排序：按更新时间倒序
    products.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // 分页
    const total = products.length;
    const start = (page - 1) * pageSize;
    const items = products.slice(start, start + pageSize);

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
    console.error('Get products error:', error);
    return NextResponse.json({ success: false, error: '获取商品列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 计算总成本
    const costPrice = body.cost_price || 0;
    const domesticShipping = body.domestic_shipping || 0;
    const firstMileShipping = body.first_mile_shipping || 0;
    const totalCost = costPrice + domesticShipping + firstMileShipping;
    
    const product = store.createProduct({
      ...body,
      total_cost: totalCost,
      status: body.status || 'selected',
    });

    // 如果有初始库存，创建库存记录
    if (body.initial_stock) {
      const inventoryId = store.generateId('INV');
      const inventory = {
        id: inventoryId,
        product_id: product.id,
        warehouse: body.warehouse || 'domestic',
        location: body.location,
        qty_available: body.initial_stock,
        qty_reserved: 0,
        qty_in_transit: 0,
        safety_stock: body.safety_stock || 30,
        reorder_point: body.reorder_point || 50,
        reorder_qty: body.reorder_qty || 100,
        avg_daily_sales: 0,
        days_of_stock: 999,
        is_low_stock: false,
        need_reorder: false,
        created_at: store.now(),
        updated_at: store.now(),
      };
      store.inventory.set(inventoryId, inventory);
      const existing = store.productInventory.get(product.id) || [];
      existing.push(inventoryId);
      store.productInventory.set(product.id, existing);
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: false, error: '创建商品失败' }, { status: 500 });
  }
}
