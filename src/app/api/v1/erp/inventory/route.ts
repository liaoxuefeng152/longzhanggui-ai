import { NextRequest, NextResponse } from 'next/server';
import { getAllInventory, addInventory, updateInventoryQuantity, InventoryItem } from '@/lib/data/inventory-store';

/**
 * 获取库存列表
 * GET /api/v1/erp/inventory
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const warehouse_id = searchParams.get('warehouse_id');

    let inventory = getAllInventory();

    if (status) {
      inventory = inventory.filter(i => i.status === status);
    }

    if (warehouse_id) {
      inventory = inventory.filter(i => i.warehouse_id === warehouse_id);
    }

    return NextResponse.json({
      inventory: inventory,
      total: inventory.length,
      summary: {
        total_items: inventory.length,
        total_value: inventory.reduce((sum, i) => sum + i.total_value, 0),
        low_stock_count: inventory.filter(i => i.status === 'low_stock').length,
        out_of_stock_count: inventory.filter(i => i.status === 'out_of_stock').length,
      },
    });
  } catch (error) {
    console.error('获取库存列表失败:', error);
    return NextResponse.json(
      { error: '获取库存列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建库存记录
 * POST /api/v1/erp/inventory
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      product_name,
      sku,
      warehouse_id,
      warehouse_name,
      quantity_available,
      unit_cost,
      reorder_point,
      reorder_quantity,
    } = body;

    if (!product_id || !sku || !warehouse_id) {
      return NextResponse.json(
        { error: '请填写必填字段' },
        { status: 400 }
      );
    }

    const newInventory: InventoryItem = {
      id: `INV-${Date.now()}`,
      product_id,
      product_name: product_name || '未命名商品',
      sku,
      warehouse_id,
      warehouse_name: warehouse_name || '未指定仓库',
      quantity_available: quantity_available || 0,
      quantity_reserved: 0,
      quantity_in_transit: 0,
      quantity_on_order: 0,
      unit_cost: unit_cost || 0,
      total_value: (quantity_available || 0) * (unit_cost || 0),
      reorder_point: reorder_point || 100,
      reorder_quantity: reorder_quantity || 500,
      last_restocked: null,
      status: (quantity_available || 0) > 0 ? 'in_stock' : 'out_of_stock',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addInventory(newInventory);

    return NextResponse.json({
      success: true,
      message: '库存记录创建成功',
      data: newInventory,
    });
  } catch (error) {
    console.error('创建库存记录失败:', error);
    return NextResponse.json(
      { error: '创建库存记录失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新库存
 * PUT /api/v1/erp/inventory
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, quantity_change } = body;

    if (!product_id || quantity_change === undefined) {
      return NextResponse.json(
        { error: '请提供商品ID和数量变化' },
        { status: 400 }
      );
    }

    const updated = updateInventoryQuantity(product_id, quantity_change);

    if (!updated) {
      return NextResponse.json(
        { error: '库存记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '库存更新成功',
      data: updated,
    });
  } catch (error: any) {
    console.error('更新库存失败:', error);
    return NextResponse.json(
      { error: error.message || '更新库存失败' },
      { status: 500 }
    );
  }
}
