import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const platform = body.platform || 'tiktok';
    const region = body.region || 'id';
    const shopId = body.shop_id;
    
    const product = store.getProduct(id);
    if (!product) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    // 检查商品状态
    if (product.status !== 'ready') {
      return NextResponse.json({ 
        success: false, 
        error: '商品尚未准备就绪，请先完成处理流程' 
      }, { status: 400 });
    }

    // 检查合规状态
    if (product.compliance_status !== 'passed') {
      return NextResponse.json({ 
        success: false, 
        error: '商品未通过合规校验' 
      }, { status: 400 });
    }

    // 创建平台上架记录
    const listingId = store.generateId('LST');
    const platformListing = {
      id: listingId,
      platform,
      shop_id: shopId,
      region,
      platform_product_id: `${platform.toUpperCase()}-${Date.now()}`,
      platform_sku: product.internal_sku,
      status: 'listed',
      listed_at: store.now(),
      listing_url: `https://${platform}.com/product/${listingId}`,
    };

    // 更新商品
    const existingListings = product.platform_listings || [];
    existingListings.push(platformListing as any);
    
    store.updateProduct(id, {
      status: 'published',
      platform_listings: existingListings,
    });

    // 自动创建广告投放（可选）
    if (body.auto_ad !== false) {
      const ad = store.createAdCampaign({
        product_id: id,
        product_name: product.name_zh,
        name: `${product.name_zh.slice(0, 10)}-${region}站-自动推广`,
        platform,
        status: 'active',
        daily_budget: body.ad_budget || 100,
      });
      
      return NextResponse.json({
        success: true,
        data: {
          product_id: id,
          listing: platformListing,
          ad_campaign: ad,
          message: '商品已上架并启动广告投放',
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        product_id: id,
        listing: platformListing,
        message: '商品已上架',
      }
    });
  } catch (error) {
    console.error('Publish product error:', error);
    return NextResponse.json({ success: false, error: '上架失败' }, { status: 500 });
  }
}
