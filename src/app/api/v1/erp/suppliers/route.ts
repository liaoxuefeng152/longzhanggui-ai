import { NextRequest, NextResponse } from 'next/server';

// Mock供应商数据
const mockSuppliers = [
  {
    id: 'SUP001',
    name: '深圳市电子科技有限公司',
    contact: '李经理',
    phone: '13800138001',
    email: 'li@sz-electronic.com',
    address: '深圳市南山区科技园',
    main_products: ['宠物自动喂食器', '便携式榨汁机', '智能手环'],
    coop_level: 'A',
    payment_terms: '款到发货',
    delivery_cycle: 5,
    rating: 4.8,
    total_orders: 28,
    created_at: '2025-06-15 10:00:00',
  },
  {
    id: 'SUP002',
    name: '广州市家居用品有限公司',
    contact: '王总',
    phone: '13900139002',
    email: 'wang@gz-home.com',
    address: '广州市白云区工业园',
    main_products: ['LED化妆镜', '瑜伽垫', '保温杯'],
    coop_level: 'A',
    payment_terms: '月结30天',
    delivery_cycle: 7,
    rating: 4.6,
    total_orders: 15,
    created_at: '2025-08-20 14:30:00',
  },
  {
    id: 'SUP003',
    name: '东莞市健身器材厂',
    contact: '张经理',
    phone: '13500135003',
    email: 'zhang@dg-fitness.com',
    address: '东莞市虎门镇工业区',
    main_products: ['智能手环', '瑜伽垫', '跳绳'],
    coop_level: 'B',
    payment_terms: '款到发货',
    delivery_cycle: 5,
    rating: 4.3,
    total_orders: 12,
    created_at: '2025-09-10 09:15:00',
  },
  {
    id: 'SUP004',
    name: '义乌市小商品批发市场',
    contact: '刘老板',
    phone: '13700137004',
    email: 'liu@yw-wholesale.com',
    address: '义乌市国际商贸城',
    main_products: ['手机配件', '小饰品', '日用品'],
    coop_level: 'C',
    payment_terms: '款到发货',
    delivery_cycle: 3,
    rating: 4.0,
    total_orders: 8,
    created_at: '2026-01-05 16:00:00',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const level = searchParams.get('level');

    let filtered = [...mockSuppliers];

    if (keyword) {
      filtered = filtered.filter(s => 
        s.name.includes(keyword) || 
        s.contact?.includes(keyword) ||
        s.main_products.some(p => p.includes(keyword))
      );
    }
    if (level) {
      filtered = filtered.filter(s => s.coop_level === level);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newSupplier = {
      id: `SUP${Date.now()}`,
      ...body,
      rating: 0,
      total_orders: 0,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: newSupplier });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ success: false, error: '创建供应商失败' }, { status: 500 });
  }
}
