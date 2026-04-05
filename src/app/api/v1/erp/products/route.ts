import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct, Product } from '@/lib/data/products-store';

/**
 * 获取商品列表
 * GET /api/v1/erp/products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let products = getAllProducts();

    if (status) {
      products = products.filter(p => p.status === status);
    }

    if (category) {
      products = products.filter(p => p.category === category);
    }

    // 排序：按创建时间倒序
    products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 分页
    const paginatedProducts = products.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginatedProducts,
      total: products.length,
      summary: {
        total_products: products.length,
        published_count: products.filter(p => p.status === 'published').length,
        draft_count: products.filter(p => p.status === 'draft').length,
        processing_count: products.filter(p => p.status === 'processing').length,
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { error: '获取商品列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建商品
 * POST /api/v1/erp/products
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sku,
      name,
      category,
      brand,
      description,
      cost_price,
      selling_price,
      currency,
      source,
    } = body;

    if (!sku || !name) {
      return NextResponse.json(
        { error: '请填写必填字段' },
        { status: 400 }
      );
    }

    // 计算利润率
    const margin = selling_price && cost_price 
      ? ((selling_price - cost_price) / selling_price) * 100 
      : 0;

    const newProduct: Product = {
      id: `PROD-${Date.now()}`,
      sku,
      name,
      category: category || '未分类',
      brand: brand || '',
      description: description || '',
      images: body.images || [],
      specs: body.specs || {},
      cost_price: cost_price || 0,
      selling_price: selling_price || 0,
      margin,
      currency: currency || 'USD',
      status: 'draft',
      source: source || '',
      source_url: body.source_url || '',
      tags: body.tags || [],
      weight: body.weight || 0,
      dimensions: body.dimensions || { length: 0, width: 0, height: 0 },
      platform_ids: body.platform_ids || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addProduct(newProduct);

    return NextResponse.json({
      success: true,
      message: '商品创建成功',
      data: newProduct,
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    );
  }
}
