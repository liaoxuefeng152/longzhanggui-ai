import { NextRequest, NextResponse } from 'next/server';

// Mock采购单数据
const mockPurchases = [
  {
    id: 'PUR001',
    supplier: '深圳市电子科技有限公司',
    items: [
      { product_id: 'PROD001', product_name: '宠物自动喂食器 5L', qty: 100, unit_cost: 55.00, total_cost: 5500.00 },
      { product_id: 'PROD002', product_name: '便携式榨汁机 USB', qty: 80, unit_cost: 31.00, total_cost: 2480.00 },
    ],
    total_amount: 7980.00,
    currency: 'CNY',
    status: 'received',
    order_date: '2026-03-15',
    expected_date: '2026-03-20',
    received_date: '2026-03-19',
    notes: '常规补货',
  },
  {
    id: 'PUR002',
    supplier: '广州市家居用品有限公司',
    items: [
      { product_id: 'PROD003', product_name: 'LED化妆镜 台式带灯', qty: 150, unit_cost: 24.00, total_cost: 3600.00 },
    ],
    total_amount: 3600.00,
    currency: 'CNY',
    status: 'shipped',
    order_date: '2026-03-18',
    expected_date: '2026-03-23',
    received_date: null,
    notes: '新品首批备货',
  },
  {
    id: 'PUR003',
    supplier: '东莞市健身器材厂',
    items: [
      { product_id: 'PROD004', product_name: '智能手环 运动监测', qty: 120, unit_cost: 46.00, total_cost: 5520.00 },
      { product_id: 'PROD005', product_name: '瑜伽垫 加厚防滑', qty: 200, unit_cost: 18.00, total_cost: 3600.00 },
    ],
    total_amount: 9120.00,
    currency: 'CNY',
    status: 'pending',
    order_date: '2026-03-21',
    expected_date: '2026-03-26',
    received_date: null,
    notes: 'TikTok爆款备货',
  },
  {
    id: 'PUR004',
    supplier: '深圳市电子科技有限公司',
    items: [
      { product_id: 'PROD006', product_name: '蓝牙耳机 无线', qty: 60, unit_cost: 38.00, total_cost: 2280.00 },
    ],
    total_amount: 2280.00,
    currency: 'CNY',
    status: 'partial',
    order_date: '2026-03-10',
    expected_date: '2026-03-15',
    received_date: '2026-03-14',
    notes: '部分收货，剩余30件延期',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supplier = searchParams.get('supplier');

    let filtered = [...mockPurchases];

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (supplier) {
      filtered = filtered.filter(p => p.supplier.includes(supplier));
    }

    return NextResponse.json({ items: filtered, total: filtered.length });
  } catch (error) {
    console.error('Get purchases error:', error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newPurchase = {
      id: `PUR${Date.now()}`,
      ...body,
      status: 'pending',
      order_date: new Date().toISOString().split('T')[0],
      received_date: null,
    };

    return NextResponse.json({ success: true, data: newPurchase });
  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json({ success: false, error: '创建采购单失败' }, { status: 500 });
  }
}
