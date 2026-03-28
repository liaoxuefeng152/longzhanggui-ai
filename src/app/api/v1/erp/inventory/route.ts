import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('low_stock') === 'true';
    const warehouse = searchParams.get('warehouse');
    const productId = searchParams.get('product_id');

    let inventory = Array.from(store.inventory.values());

    // 过滤
    if (lowStock) {
      inventory = inventory.filter(i => i.is_low_stock);
    }
    if (warehouse) {
      inventory = inventory.filter(i => i.warehouse === warehouse);
    }
    if (productId) {
      inventory = inventory.filter(i => i.product_id === productId);
    }

    // 添加商品信息
    const inventoryWithProduct = inventory.map(inv => {
      const product = store.getProduct(inv.product_id);
      return {
        ...inv,
        product_name: product?.name_zh,
        product_sku: product?.internal_sku,
      };
    });

    return NextResponse.json({
      success: true,
      data: inventoryWithProduct,
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json({ success: false, error: '获取库存失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证商品存在
    const product = store.getProduct(body.product_id);
    if (!product) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 400 });
    }
    
    const id = store.generateId('INV');
    const now = store.now();
    
    const inventory = {
      id,
      product_id: body.product_id,
      warehouse: body.warehouse || 'domestic',
      location: body.location,
      qty_available: body.qty_available || 0,
      qty_reserved: 0,
      qty_in_transit: 0,
      safety_stock: body.safety_stock || 30,
      reorder_point: body.reorder_point || 50,
      reorder_qty: body.reorder_qty || 100,
      avg_daily_sales: 0,
      days_of_stock: 999,
      is_low_stock: false,
      need_reorder: false,
      created_at: now,
      updated_at: now,
    };
    
    store.inventory.set(id, inventory);
    
    // 建立关联
    const existing = store.productInventory.get(body.product_id) || [];
    existing.push(id);
    store.productInventory.set(body.product_id, existing);
    
    return NextResponse.json({ success: true, data: inventory });
  } catch (error) {
    console.error('Create inventory error:', error);
    return NextResponse.json({ success: false, error: '创建库存失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    const inventory = store.inventory.get(id);
    if (!inventory) {
      return NextResponse.json({ success: false, error: '库存记录不存在' }, { status: 404 });
    }
    
    // 更新库存
    const updated = {
      ...inventory,
      ...updates,
      id: inventory.id,
      product_id: inventory.product_id,
      created_at: inventory.created_at,
      updated_at: store.now(),
    };
    
    // 计算是否低库存
    updated.is_low_stock = updated.qty_available < updated.safety_stock;
    updated.need_reorder = updated.qty_available <= updated.reorder_point;
    updated.days_of_stock = updated.avg_daily_sales > 0 
      ? Math.floor(updated.qty_available / updated.avg_daily_sales) 
      : 999;
    
    store.inventory.set(id, updated);
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ success: false, error: '更新库存失败' }, { status: 500 });
  }
}
