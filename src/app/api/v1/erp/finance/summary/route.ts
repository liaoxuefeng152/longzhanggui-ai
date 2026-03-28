import { NextRequest, NextResponse } from 'next/server';

// Mock财务汇总数据
const mockSummaries = [
  {
    id: 'SUM001',
    date: '2026-03-21',
    total_sales: 15680.50,
    total_cost: 8920.30,
    shipping_fee: 1250.00,
    platform_fee: 784.03,
    ad_cost: 1568.05,
    other_cost: 320.00,
    gross_profit: 2838.12,
    profit_rate: 18.1,
    order_count: 42,
    refund_amount: 0,
  },
  {
    id: 'SUM002',
    date: '2026-03-20',
    total_sales: 18450.00,
    total_cost: 10560.00,
    shipping_fee: 1480.00,
    platform_fee: 922.50,
    ad_cost: 1845.00,
    other_cost: 450.00,
    gross_profit: 3192.50,
    profit_rate: 17.3,
    order_count: 51,
    refund_amount: 199.00,
  },
  {
    id: 'SUM003',
    date: '2026-03-19',
    total_sales: 12350.80,
    total_cost: 7120.50,
    shipping_fee: 980.00,
    platform_fee: 617.54,
    ad_cost: 1235.08,
    other_cost: 280.00,
    gross_profit: 2117.68,
    profit_rate: 17.1,
    order_count: 35,
    refund_amount: 0,
  },
  {
    id: 'SUM004',
    date: '2026-03-18',
    total_sales: 21300.00,
    total_cost: 12400.00,
    shipping_fee: 1680.00,
    platform_fee: 1065.00,
    ad_cost: 2130.00,
    other_cost: 520.00,
    gross_profit: 3505.00,
    profit_rate: 16.5,
    order_count: 58,
    refund_amount: 89.00,
  },
  {
    id: 'SUM005',
    date: '2026-03-17',
    total_sales: 16890.00,
    total_cost: 9780.00,
    shipping_fee: 1320.00,
    platform_fee: 844.50,
    ad_cost: 1689.00,
    other_cost: 380.00,
    gross_profit: 2876.50,
    profit_rate: 17.0,
    order_count: 47,
    refund_amount: 0,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let filtered = [...mockSummaries];

    if (startDate) {
      filtered = filtered.filter(s => s.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(s => s.date <= endDate);
    }

    return NextResponse.json({ items: filtered, total: filtered.length });
  } catch (error) {
    console.error('Get finance summary error:', error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}
