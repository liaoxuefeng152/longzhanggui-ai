import { NextRequest, NextResponse } from 'next/server';

// 模拟采购单数据库
const purchaseOrders: any[] = [
  {
    id: 'PO-001',
    po_number: 'PO-2026-0001',
    product_id: 'PROD-001',
    product_name: '示例商品1',
    sku: 'SKU-2026-001',
    qty: 100,
    unit_price: 25.5,
    total_amount: 2550,
    supplier_name: '示例供应商',
    supplier_url: 'https://shop12345678.1688.com',
    supplier_contact: '张经理 13800138000',
    status: 'approved',
    order_date: new Date().toISOString(),
    expected_arrival: new Date(Date.now() + 7 * 86400000).toISOString(),
    notes: '首批采购',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 采购单计数器
let poCounter = 2;

/**
 * 获取采购单列表
 * GET /api/v1/erp/purchase-orders
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const keyword = searchParams.get('keyword') || '';

    let filtered = [...purchaseOrders];

    if (status) {
      filtered = filtered.filter(po => po.status === status);
    }

    if (keyword) {
      filtered = filtered.filter(po =>
        po.po_number.includes(keyword) ||
        po.product_name.includes(keyword) ||
        po.supplier_name.includes(keyword)
      );
    }

    return NextResponse.json({
      success: true,
      items: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('获取采购单列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取采购单列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 新建采购单
 * POST /api/v1/erp/purchase-orders
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      product_name,
      sku,
      qty,
      unit_price,
      supplier_name,
      supplier_url,
      supplier_contact,
      expected_arrival,
      notes,
    } = body;

    if (!product_name || !qty || !unit_price) {
      return NextResponse.json(
        { success: false, message: '请填写完整的采购单信息' },
        { status: 400 }
      );
    }

    // 生成采购单号
    const poNumber = `PO-${new Date().getFullYear()}-${String(poCounter++).padStart(4, '0')}`;
    const total_amount = (parseFloat(qty) || 0) * (parseFloat(unit_price) || 0);

    const newPurchaseOrder = {
      id: `PO-${Date.now()}`,
      po_number: poNumber,
      product_id: product_id || '',
      product_name,
      sku: sku || '',
      qty: parseInt(qty) || 0,
      unit_price: parseFloat(unit_price) || 0,
      total_amount,
      supplier_name: supplier_name || '',
      supplier_url: supplier_url || '',
      supplier_contact: supplier_contact || '',
      status: 'draft',
      order_date: new Date().toISOString(),
      expected_arrival: expected_arrival || new Date(Date.now() + 7 * 86400000).toISOString(),
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    purchaseOrders.push(newPurchaseOrder);

    return NextResponse.json({
      success: true,
      message: '采购单创建成功',
      data: newPurchaseOrder,
    });
  } catch (error) {
    console.error('创建采购单失败:', error);
    return NextResponse.json(
      { success: false, message: '创建采购单失败' },
      { status: 500 }
    );
  }
}
