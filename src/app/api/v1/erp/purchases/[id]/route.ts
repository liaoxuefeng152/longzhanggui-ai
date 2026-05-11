import { NextRequest, NextResponse } from 'next/server';

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  products: {
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  expected_arrival?: string;
  received_qty?: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

function getPurchases(): PurchaseOrder[] {
  if (!global.__erp_purchases) {
    global.__erp_purchases = [];
  }
  return global.__erp_purchases;
}

// GET - 获取采购单详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const purchases = getPurchases();
  const purchase = purchases.find(p => p.id === id || p.po_number === id);

  if (!purchase) {
    return NextResponse.json({
      success: false,
      error: '采购单不存在',
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    purchase,
  });
}

// PUT - 更新采购单
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const purchases = getPurchases();
    const index = purchases.findIndex(p => p.id === id || p.po_number === id);

    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: '采购单不存在',
      }, { status: 404 });
    }

    const purchase = purchases[index];

    // 更新字段
    if (body.status) {
      purchase.status = body.status;
    }
    if (body.expected_arrival !== undefined) {
      purchase.expected_arrival = body.expected_arrival;
    }
    if (body.notes !== undefined) {
      purchase.notes = body.notes;
    }
    if (body.received_qty !== undefined) {
      purchase.received_qty = body.received_qty;
    }
    if (body.products !== undefined) {
      purchase.products = body.products;
      purchase.total_amount = body.products.reduce((sum: number, p: any) => {
        return sum + (p.quantity * p.unit_price);
      }, 0);
    }

    purchase.updated_at = new Date().toISOString();
    purchases[index] = purchase;

    return NextResponse.json({
      success: true,
      message: '采购单更新成功',
      purchase,
    });
  } catch (error) {
    console.error('更新采购单失败:', error);
    return NextResponse.json({
      success: false,
      error: '更新采购单失败',
    }, { status: 500 });
  }
}

// DELETE - 删除采购单
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const purchases = getPurchases();
  const index = purchases.findIndex(p => p.id === id || p.po_number === id);

  if (index === -1) {
    return NextResponse.json({
      success: false,
      error: '采购单不存在',
    }, { status: 404 });
  }

  purchases.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: '采购单删除成功',
  });
}
