import { NextRequest, NextResponse } from 'next/server';

// 安全解析JSON字符串
function safeParseJSON(str: any): any {
  if (!str) return [];
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

// 内存商品数据 (fallback)
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

    // 优先从Python后端获取真实数据
    try {
      const authHeader = request.headers.get('authorization') || '';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const backendResponse = await fetch(
        `${backendUrl}/api/v1/erp/products/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {}),
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (backendResponse.ok) {
        const product = await backendResponse.json();
        if (product && product.id) {
          // 解析JSON字符串字段
          const parsed = {
            ...product,
            images: safeParseJSON(product.images),
            processed_images: safeParseJSON(product.processed_images),
            skus: safeParseJSON(product.skus),
            category: product.category_name || product.category,
          };
          return NextResponse.json(parsed);
        }
      }
    } catch (backendError) {
      console.warn('[商品详情API] 后端不可用，使用本地数据:', (backendError as Error).message);
    }

    // Fallback: 本地内存数据
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

    // 优先更新后端
    try {
      const authHeader = request.headers.get('authorization') || '';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const backendResponse = await fetch(
        `${backendUrl}/api/v1/erp/products/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {}),
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000),
        }
      );

      if (backendResponse.ok) {
        const updated = await backendResponse.json();
        return NextResponse.json(updated);
      }
    } catch (backendError) {
      console.warn('[商品更新API] 后端不可用，使用本地数据:', (backendError as Error).message);
    }

    // Fallback: 本地更新
    if (!products[id]) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

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

    // 优先从后端删除
    try {
      const authHeader = request.headers.get('authorization') || '';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const backendResponse = await fetch(
        `${backendUrl}/api/v1/erp/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {}),
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (backendResponse.ok) {
        return NextResponse.json({ success: true, message: '删除成功' });
      }
    } catch (backendError) {
      console.warn('[商品删除API] 后端不可用，使用本地数据:', (backendError as Error).message);
    }

    // Fallback: 本地删除
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
