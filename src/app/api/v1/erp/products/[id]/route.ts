import { NextRequest, NextResponse } from 'next/server';

// 内存商品数据
const mockProducts: { [key: string]: any } = {
  'PROD001': {
    id: 'PROD001',
    internal_sku: 'SKU-PET-001',
    name_zh: '宠物自动喂食器 5L大容量',
    name_en: 'Automatic Pet Feeder 5L',
    category: '宠物用品',
    source_url: 'https://1688.com/product/1',
    supplier_name: '深圳市电子科技有限公司',
    cost_price: 89,
    domestic_shipping: 5,
    first_mile_shipping: 15,
    total_cost: 109,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 89.5,
    sales_trend: 92,
    profit_margin: 42,
    total_sales: 156,
    total_orders: 89,
    total_profit: 12800,
    created_at: '2026-03-15 10:30:00',
    updated_at: '2026-03-21 14:20:00',
  },
  'PROD002': {
    id: 'PROD002',
    internal_sku: 'SKU-HOME-001',
    name_zh: '便携式榨汁机 USB充电',
    name_en: 'Portable Juicer USB Rechargeable',
    category: '家居电器',
    source_url: 'https://1688.com/product/2',
    supplier_name: '深圳市电子科技有限公司',
    cost_price: 45,
    domestic_shipping: 4,
    first_mile_shipping: 12,
    total_cost: 61,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 76.2,
    total_sales: 89,
    total_orders: 52,
    total_profit: 6800,
    created_at: '2026-03-16 15:20:00',
    updated_at: '2026-03-21 11:00:00',
  },
};

// 模拟数据库
let products = { ...mockProducts };

// GET - 获取单个商品
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = products[id];

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json(
      { error: '获取商品详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!products[id]) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // 更新商品
    products[id] = {
      ...products[id],
      ...body,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    return NextResponse.json(products[id]);
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json(
      { error: '更新商品失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除商品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!products[id]) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    delete products[id];

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json(
      { error: '删除商品失败' },
      { status: 500 }
    );
  }
}
