/**
 * 商品列表API
 */
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const page_size = parseInt(searchParams.get('page_size') || '20');
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const search = searchParams.get('search');

    let products = store.getProducts();

    // 过滤
    if (status && status !== 'all') {
      products = products.filter(p => p.status === status);
    }
    if (platform && platform !== 'all') {
      products = products.filter(p => 
        p.platform_listings?.some(pl => pl.platform === platform)
      );
    }
    if (search) {
      const keyword = search.toLowerCase();
      products = products.filter(p => 
        p.name_zh.toLowerCase().includes(keyword) ||
        p.name_en?.toLowerCase().includes(keyword) ||
        p.internal_sku.toLowerCase().includes(keyword)
      );
    }

    // 分页
    const total = products.length;
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const paginatedProducts = products.slice(start, end);

    // 转换为API格式
    const apiProducts = paginatedProducts.map(p => ({
      id: p.id,
      name: p.name_zh,
      name_en: p.name_en,
      image: p.images?.find(img => img.type === 'main')?.processed_url || 
             p.images?.find(img => img.type === 'main')?.original_url,
      category: p.category || '未分类',
      platform: p.platform_listings?.[0]?.platform || 'tiktok',
      status: p.status === 'published' ? 'active' : p.status === 'processing' ? 'pending' : 'draft',
      compliance_status: p.compliance_status === 'passed' ? 'passed' : 
                        p.compliance_status === 'checking' ? 'pending' : 'failed',
      stock: store.getInventoryByProduct(p.id).reduce((sum, inv) => sum + inv.qty_available, 0) || 0,
      price: p.pricing?.suggested_price || 0,
      sales: p.total_orders || 0,
      pv: 0,
      uv: 0,
      conversion_rate: 0,
      rating: 0,
      refund_rate: 0,
      ad_spend: 0,
      cost_price: p.cost_price,
      profit_margin: p.profit_margin,
      description: p.listing?.description,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return NextResponse.json({
      products: apiProducts,
      total,
      page,
      page_size,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const product = store.createProduct({
      name_zh: body.name,
      name_en: body.name_en,
      category: body.category,
      cost_price: body.cost_price || 0,
      domestic_shipping: body.domestic_shipping || 0,
      first_mile_shipping: body.first_mile_shipping || 0,
      status: 'draft',
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
