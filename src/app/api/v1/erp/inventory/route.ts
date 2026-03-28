import { NextRequest, NextResponse } from 'next/server';

// Mock库存数据
const mockInventory = [
  {
    id: 'INV001',
    product_id: 'PROD001',
    qty_available: 156,
    qty_reserved: 24,
    qty_in_transit: 50,
    safety_stock: 50,
    reorder_point: 80,
    reorder_qty: 100,
    avg_daily_sales: 8,
    days_of_stock: 19,
    is_low_stock: false,
    need_reorder: false,
    warehouse: 'domestic',
    location: 'A-01-03',
    updated_at: '2026-03-21 14:30:00',
  },
  {
    id: 'INV002',
    product_id: 'PROD002',
    qty_available: 42,
    qty_reserved: 18,
    qty_in_transit: 30,
    safety_stock: 30,
    reorder_point: 50,
    reorder_qty: 80,
    avg_daily_sales: 5,
    days_of_stock: 8,
    is_low_stock: false,
    need_reorder: true,
    warehouse: 'domestic',
    location: 'B-02-01',
    updated_at: '2026-03-21 11:00:00',
  },
  {
    id: 'INV003',
    product_id: 'PROD003',
    qty_available: 15,
    qty_reserved: 8,
    qty_in_transit: 0,
    safety_stock: 30,
    reorder_point: 40,
    reorder_qty: 100,
    avg_daily_sales: 4,
    days_of_stock: 3,
    is_low_stock: true,
    need_reorder: true,
    warehouse: 'domestic',
    location: 'C-01-02',
    updated_at: '2026-03-21 10:30:00',
  },
  {
    id: 'INV004',
    product_id: 'PROD004',
    qty_available: 88,
    qty_reserved: 12,
    qty_in_transit: 40,
    safety_stock: 40,
    reorder_point: 60,
    reorder_qty: 80,
    avg_daily_sales: 6,
    days_of_stock: 14,
    is_low_stock: false,
    need_reorder: false,
    warehouse: 'domestic',
    location: 'D-03-01',
    updated_at: '2026-03-20 16:45:00',
  },
  {
    id: 'INV005',
    product_id: 'PROD005',
    qty_available: 320,
    qty_reserved: 45,
    qty_in_transit: 100,
    safety_stock: 100,
    reorder_point: 150,
    reorder_qty: 200,
    avg_daily_sales: 15,
    days_of_stock: 21,
    is_low_stock: false,
    need_reorder: false,
    warehouse: 'domestic',
    location: 'A-02-04',
    updated_at: '2026-03-19 09:20:00',
  },
  {
    id: 'INV006',
    product_id: 'PROD001',
    qty_available: 85,
    qty_reserved: 10,
    qty_in_transit: 30,
    safety_stock: 30,
    reorder_point: 50,
    reorder_qty: 60,
    avg_daily_sales: 4,
    days_of_stock: 21,
    is_low_stock: false,
    need_reorder: false,
    warehouse: 'indonesia',
    location: 'JKT-01',
    updated_at: '2026-03-18 14:30:00',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('low_stock') === 'true';
    const warehouse = searchParams.get('warehouse');

    let filtered = [...mockInventory];

    if (lowStock) {
      filtered = filtered.filter(i => i.is_low_stock);
    }
    if (warehouse) {
      filtered = filtered.filter(i => i.warehouse === warehouse);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ success: false, error: '更新库存失败' }, { status: 500 });
  }
}
