import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const suppliers = Array.from(store.suppliers.values());
    
    // 排序：按合作等级和评分
    suppliers.sort((a, b) => {
      const levelOrder = { 'A': 0, 'B': 1, 'C': 2 };
      const levelDiff = levelOrder[a.coop_level] - levelOrder[b.coop_level];
      if (levelDiff !== 0) return levelDiff;
      return b.rating - a.rating;
    });

    return NextResponse.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({ success: false, error: '获取供应商失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const id = store.generateId('SUP');
    const now = store.now();
    
    const supplier = {
      id,
      name: body.name || '',
      contact: body.contact,
      phone: body.phone,
      email: body.email,
      address: body.address,
      main_products: body.main_products || [],
      coop_level: body.coop_level || 'C',
      payment_terms: body.payment_terms,
      delivery_cycle: body.delivery_cycle,
      rating: 0,
      total_orders: 0,
      created_at: now,
      updated_at: now,
    };
    
    store.suppliers.set(id, supplier);
    
    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ success: false, error: '创建供应商失败' }, { status: 500 });
  }
}
