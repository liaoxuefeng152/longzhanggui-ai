import { NextRequest, NextResponse } from 'next/server';

// 模拟库存数据库
const inventory: any[] = [
  {
    id: 'INV-001',
    product_id: 'PROD-001',
    sku: 'SKU-2026-001',
    product_name: '示例商品1',
    warehouse: 'domestic',
    qty_available: 150,
    qty_reserved: 20,
    safety_stock: 50,
    reorder_point: 30,
    is_low_stock: false,
    need_reorder: false,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'INV-002',
    product_id: 'PROD-002',
    sku: 'SKU-2026-002',
    product_name: '示例商品2',
    warehouse: 'overseas',
    qty_available: 30,
    qty_reserved: 5,
    safety_stock: 50,
    reorder_point: 30,
    is_low_stock: true,
    need_reorder: true,
    updated_at: new Date().toISOString(),
  },
];

// 入库记录
const stockInRecords: any[] = [];

/**
 * 入库操作
 * POST /api/v1/erp/inventory/stock-in
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      sku,
      product_name,
      warehouse,
      quantity,
      batch_no,
      notes,
    } = body;

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: '请选择商品并输入有效的入库数量' },
        { status: 400 }
      );
    }

    // 查找现有库存
    let inventoryItem = inventory.find(
      item => item.product_id === product_id && item.warehouse === warehouse
    );

    if (inventoryItem) {
      // 更新库存
      inventoryItem.qty_available += quantity;
      inventoryItem.is_low_stock = inventoryItem.qty_available < inventoryItem.safety_stock;
      inventoryItem.need_reorder = inventoryItem.qty_available < inventoryItem.reorder_point;
      inventoryItem.updated_at = new Date().toISOString();
    } else {
      // 创建新库存记录
      inventoryItem = {
        id: `INV-${Date.now()}`,
        product_id,
        sku: sku || `SKU-${product_id.slice(0, 8)}`,
        product_name: product_name || `商品-${product_id.slice(0, 6)}`,
        warehouse: warehouse || 'domestic',
        qty_available: quantity,
        qty_reserved: 0,
        safety_stock: 50,
        reorder_point: 30,
        is_low_stock: quantity < 50,
        need_reorder: quantity < 30,
        updated_at: new Date().toISOString(),
      };
      inventory.push(inventoryItem);
    }

    // 创建入库记录
    const stockInRecord = {
      id: `SI-${Date.now()}`,
      product_id,
      sku: inventoryItem.sku,
      product_name: inventoryItem.product_name,
      warehouse: warehouse || 'domestic',
      quantity,
      batch_no: batch_no || `B${Date.now()}`,
      notes: notes || '',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    stockInRecords.push(stockInRecord);

    return NextResponse.json({
      success: true,
      message: `入库成功，入库数量：${quantity}`,
      data: {
        inventory: inventoryItem,
        stock_in_record: stockInRecord,
      },
    });
  } catch (error) {
    console.error('入库操作失败:', error);
    return NextResponse.json(
      { success: false, message: '入库操作失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取入库记录
 * GET /api/v1/erp/inventory/stock-in
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    return NextResponse.json({
      success: true,
      items: stockInRecords.slice((page - 1) * pageSize, page * pageSize),
      total: stockInRecords.length,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('获取入库记录失败:', error);
    return NextResponse.json(
      { success: false, message: '获取入库记录失败' },
      { status: 500 }
    );
  }
}
