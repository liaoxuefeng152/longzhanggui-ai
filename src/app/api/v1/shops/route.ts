import { NextRequest, NextResponse } from 'next/server';
import { getShops, createShop, updateShopSyncTime, Shop } from '@/lib/storage/database';

// GET /api/v1/shops - Get all shops
export async function GET(request: NextRequest) {
  try {
    const shops = await getShops();
    return NextResponse.json({ success: true, shops });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '查询店铺列表失败' 
    }, { status: 500 });
  }
}

// POST /api/v1/shops - Create a new shop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shop_id, shop_name, platform, region, platform_config_id } = body;
    
    if (!shop_id || !shop_name || !platform || !region) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    const shop = await createShop({
      shop_id,
      shop_name,
      platform,
      region,
      platform_config_id,
    });
    
    return NextResponse.json({ success: true, shop }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '创建店铺失败' 
    }, { status: 500 });
  }
}