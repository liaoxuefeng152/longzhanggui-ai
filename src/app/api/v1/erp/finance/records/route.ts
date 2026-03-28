import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let records = Array.from(store.financeRecords.values());

    // 过滤
    if (startDate) {
      records = records.filter(r => r.record_date >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.record_date <= endDate);
    }

    // 排序：按日期倒序
    records.sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());

    return NextResponse.json({
      success: true,
      data: {
        items: records,
        total: records.length,
      }
    });
  } catch (error) {
    console.error('Get finance records error:', error);
    return NextResponse.json({ success: false, error: '获取财务记录失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const id = store.generateId('REC');
    const now = store.now();
    
    const record = {
      id,
      record_date: body.record_date || now.split(' ')[0],
      record_type: body.record_type || 'expense',
      category: body.category || '',
      amount: body.amount || 0,
      currency: body.currency || 'CNY',
      description: body.description,
      platform: body.platform,
      source: body.source,
      order_id: body.order_id,
      product_id: body.product_id,
      created_at: now,
    };
    
    store.financeRecords.set(id, record);
    
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Create finance record error:', error);
    return NextResponse.json({ success: false, error: '创建财务记录失败' }, { status: 500 });
  }
}
