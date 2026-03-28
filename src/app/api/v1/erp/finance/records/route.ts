import { NextRequest, NextResponse } from 'next/server';

// Mock财务记录数据
const mockRecords = [
  {
    id: 'REC001',
    record_date: '2026-03-21',
    record_type: 'income',
    category: '销售收入',
    amount: 15680.50,
    currency: 'CNY',
    description: '平台订单收入',
    platform: 'tiktok',
    source: 'order_settlement',
    created_at: '2026-03-21 23:00:00',
  },
  {
    id: 'REC002',
    record_date: '2026-03-21',
    record_type: 'expense',
    category: '采购成本',
    amount: 8920.30,
    currency: 'CNY',
    description: '商品采购支出',
    source: 'purchase',
    created_at: '2026-03-21 22:00:00',
  },
  {
    id: 'REC003',
    record_date: '2026-03-21',
    record_type: 'expense',
    category: '广告费用',
    amount: 1568.05,
    currency: 'CNY',
    description: 'TikTok广告投放',
    platform: 'tiktok',
    source: 'ad_spend',
    created_at: '2026-03-21 21:00:00',
  },
  {
    id: 'REC004',
    record_date: '2026-03-21',
    record_type: 'expense',
    category: '物流费用',
    amount: 1250.00,
    currency: 'CNY',
    description: '国际物流运费',
    source: 'shipping',
    created_at: '2026-03-21 20:00:00',
  },
  {
    id: 'REC005',
    record_date: '2026-03-20',
    record_type: 'refund',
    category: '退款',
    amount: 199.00,
    currency: 'CNY',
    description: '订单退款-商品破损',
    platform: 'amazon',
    source: 'refund',
    created_at: '2026-03-20 18:30:00',
  },
  {
    id: 'REC006',
    record_date: '2026-03-20',
    record_type: 'income',
    category: '销售收入',
    amount: 18450.00,
    currency: 'CNY',
    description: '平台订单收入',
    platform: 'amazon',
    source: 'order_settlement',
    created_at: '2026-03-20 23:00:00',
  },
  {
    id: 'REC007',
    record_date: '2026-03-19',
    record_type: 'expense',
    category: '平台佣金',
    amount: 617.54,
    currency: 'CNY',
    description: 'TikTok平台佣金',
    platform: 'tiktok',
    source: 'commission',
    created_at: '2026-03-19 23:00:00',
  },
  {
    id: 'REC008',
    record_date: '2026-03-18',
    record_type: 'adjustment',
    category: '调整',
    amount: 150.00,
    currency: 'CNY',
    description: '物流费差价调整',
    source: 'manual_adjust',
    created_at: '2026-03-18 15:00:00',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const recordType = searchParams.get('record_type');

    let filtered = [...mockRecords];

    if (startDate) {
      filtered = filtered.filter(r => r.record_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.record_date <= endDate);
    }
    if (recordType) {
      filtered = filtered.filter(r => r.record_type === recordType);
    }

    return NextResponse.json({ items: filtered, total: filtered.length });
  } catch (error) {
    console.error('Get finance records error:', error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}
