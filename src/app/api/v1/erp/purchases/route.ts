import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplier = searchParams.get('supplier');
    const status = searchParams.get('status');

    let purchases = Array.from(store.purchases.values());

    // 过滤
    if (supplier) {
      purchases = purchases.filter(p => p.supplier_name.includes(supplier));
    }
    if (status) {
      purchases = purchases.filter(p => p.status === status);
    }

    // 排序：按创建时间倒序
    purchases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: {
        items: purchases,
        total: purchases.length,
      }
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    return NextResponse.json({ success: false, error: '获取采购单失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const id = store.generateId('PUR');
    const now = store.now();
    
    // 计算总金额
    const totalAmount = body.items?.reduce((sum: number, item: any) => sum + item.total_cost, 0) || 0;
    
    const purchase: import('@/lib/store').Purchase = {
      id,
      supplier_id: body.supplier_id,
      supplier_name: body.supplier_name || '',
      items: body.items || [],
      total_amount: totalAmount,
      currency: body.currency || 'CNY',
      status: 'pending' as const,
      order_date: now.split(' ')[0],
      expected_date: body.expected_date,
      received_date: undefined,
      notes: body.notes,
      created_at: now,
      updated_at: now,
    };
    
    store.purchases.set(id, purchase);
    
    // 更新商品的供应商信息
    for (const item of body.items || []) {
      if (item.product_id) {
        const product = store.getProduct(item.product_id);
        if (product && !product.supplier_name) {
          store.updateProduct(item.product_id, { 
            supplier_name: body.supplier_name,
            cost_price: item.unit_cost,
            total_cost: item.unit_cost + (product.domestic_shipping || 0) + (product.first_mile_shipping || 0),
          });
        }
      }
    }
    
    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json({ success: false, error: '创建采购单失败' }, { status: 500 });
  }
}
