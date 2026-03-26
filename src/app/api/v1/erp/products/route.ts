import { NextRequest, NextResponse } from 'next/server';

// 模拟商品数据库
const products: any[] = [
  {
    id: 'PROD-001',
    internal_sku: 'SKU-2026-001',
    name_zh: '示例商品1',
    name_en: 'Sample Product 1',
    source_url: 'https://detail.1688.com/offer/123456.html',
    supplier_name: '示例供应商',
    cost_price: 25.5,
    domestic_shipping: 3,
    first_mile_shipping: 5,
    total_cost: 33.5,
    image_status: 'done',
    compliance_status: 'passed',
    category_name: '家居用品',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'PROD-002',
    internal_sku: 'SKU-2026-002',
    name_zh: '示例商品2',
    name_en: 'Sample Product 2',
    source_url: 'https://detail.1688.com/offer/234567.html',
    supplier_name: '测试供应商',
    cost_price: 15.8,
    domestic_shipping: 2,
    first_mile_shipping: 4,
    total_cost: 21.8,
    image_status: 'pending',
    compliance_status: 'pending',
    category_name: '电子产品',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * 获取商品列表
 * GET /api/v1/erp/products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') || '';
    const compliance_status = searchParams.get('compliance_status') || '';
    
    let filtered = [...products];
    
    if (keyword) {
      filtered = filtered.filter(p => 
        p.name_zh.includes(keyword) || 
        p.internal_sku.includes(keyword) ||
        (p.name_en && p.name_en.toLowerCase().includes(keyword.toLowerCase()))
      );
    }
    
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    
    if (compliance_status) {
      filtered = filtered.filter(p => p.compliance_status === compliance_status);
    }
    
    return NextResponse.json({
      success: true,
      items: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取商品列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 新增商品
 * POST /api/v1/erp/products
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name_zh,
      name_en,
      cost_price,
      domestic_shipping,
      first_mile_shipping,
      supplier_name,
      category_name,
      source_url,
    } = body;

    if (!name_zh) {
      return NextResponse.json(
        { success: false, message: '请输入商品中文名称' },
        { status: 400 }
      );
    }

    // 生成SKU
    const skuId = String(products.length + 1).padStart(3, '0');
    const internal_sku = `SKU-${new Date().getFullYear()}-${skuId}`;
    
    const total_cost = (parseFloat(cost_price) || 0) + 
                       (parseFloat(domestic_shipping) || 0) + 
                       (parseFloat(first_mile_shipping) || 0);

    const newProduct = {
      id: `PROD-${Date.now()}`,
      internal_sku,
      name_zh,
      name_en: name_en || '',
      source_url: source_url || '',
      supplier_name: supplier_name || '',
      cost_price: parseFloat(cost_price) || 0,
      domestic_shipping: parseFloat(domestic_shipping) || 0,
      first_mile_shipping: parseFloat(first_mile_shipping) || 0,
      total_cost,
      image_status: 'pending',
      compliance_status: 'pending',
      category_name: category_name || '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    products.push(newProduct);

    return NextResponse.json({
      success: true,
      message: '商品创建成功',
      data: newProduct,
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { success: false, message: '创建商品失败' },
      { status: 500 }
    );
  }
}
