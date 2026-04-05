import { NextRequest, NextResponse } from 'next/server';
import { getAllPurchases, addPurchase, Purchase } from '@/lib/data/purchases-store';

/**
 * 获取采购单列表
 * GET /api/v1/erp/purchases
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let purchases = getAllPurchases();

    if (status) {
      purchases = purchases.filter(p => p.status === status);
    }

    return NextResponse.json({
      purchases: purchases,
      total: purchases.length,
    });
  } catch (error) {
    console.error('获取采购单列表失败:', error);
    return NextResponse.json(
      { error: '获取采购单列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建采购单
 * POST /api/v1/erp/purchases
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplier_id,
      supplier_name,
      products,
      currency,
      notes,
      expected_delivery,
    } = body;

    if (!supplier_id || !products || products.length === 0) {
      return NextResponse.json(
        { error: '请填写必填字段' },
        { status: 400 }
      );
    }

    // 计算总金额
    const total_amount = products.reduce((sum: number, p: any) => sum + (p.total_price || 0), 0);

    const newPurchase: Purchase = {
      id: `PO-${Date.now()}`,
      order_no: `PO-${Date.now()}`,
      supplier_id,
      supplier_name: supplier_name || '未指定供应商',
      products,
      total_amount,
      currency: currency || 'CNY',
      status: 'draft',
      payment_status: 'unpaid',
      ordered_at: null,
      expected_delivery: expected_delivery || null,
      actual_delivery: null,
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addPurchase(newPurchase);

    return NextResponse.json({
      success: true,
      message: '采购单创建成功',
      data: newPurchase,
    });
  } catch (error) {
    console.error('创建采购单失败:', error);
    return NextResponse.json(
      { error: '创建采购单失败' },
      { status: 500 }
    );
  }
}
