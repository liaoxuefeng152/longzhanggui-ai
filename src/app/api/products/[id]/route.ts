/**
 * 商品详情API
 */
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = store.getProduct(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 获取关联数据
    const inventory = store.getInventoryByProduct(id);
    const orders = store.getOrdersByProduct(id);
    const ads = store.getAdsByProduct(id);

    // 转换为完整的API格式
    const apiProduct = {
      // 基本信息
      id: product.id,
      internal_sku: product.internal_sku,
      name_zh: product.name_zh,
      name_en: product.name_en,
      category: product.category,
      
      // 选品信息
      source_url: product.source_url,
      supplier_name: product.supplier_name,
      supplier_url: product.supplier_url,
      selected_at: product.selected_at,
      selection_score: product.selection_score,
      sales_trend: product.sales_trend,
      profit_margin: product.profit_margin,
      
      // 成本信息
      cost_price: product.cost_price,
      domestic_shipping: product.domestic_shipping,
      first_mile_shipping: product.first_mile_shipping,
      total_cost: product.total_cost,
      
      // 图片
      images: product.images || [],
      
      // Listing
      listing: product.listing,
      
      // 定价
      pricing: product.pricing,
      
      // 处理状态
      image_status: product.image_status,
      listing_status: product.listing_status,
      compliance_status: product.compliance_status,
      compliance_issues: product.compliance_issues,
      
      // 生命周期状态
      status: product.status,
      
      // 库存
      inventory: inventory,
      total_stock: inventory.reduce((sum, inv) => sum + inv.qty_available, 0),
      
      // 销售数据
      total_sales: product.total_sales || orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      total_orders: product.total_orders || orders.length,
      total_profit: product.total_profit || orders.reduce((sum, o) => sum + (o.profit || 0), 0),
      
      // 广告数据
      ads: ads,
      total_ad_spend: ads.reduce((sum, ad) => sum + (ad.total_spent || 0), 0),
      total_roi: ads.length > 0 ? ads.reduce((sum, ad) => sum + (ad.roi || 0), 0) / ads.length : 0,
      
      // 平台列表
      platform_listings: product.platform_listings || [],
      
      // 时间戳
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    return NextResponse.json(apiProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const product = store.updateProduct(id, body);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = store.deleteProduct(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
