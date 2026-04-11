/**
 * 店铺详情与同步 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

interface Shop {
  id: string;
  name: string;
  platform: string;
  region: string;
  currency: string;
  status: string;
  credentials: Record<string, string>;
  config: Record<string, any>;
  stats: {
    total_orders: number;
    total_sales: number;
    total_products: number;
    last_sync?: string;
  };
}

// 获取单个店铺详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shops = globalStore.shops || [];
    const shop = shops.find((s: Shop) => s.id === id);

    if (!shop) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    // 获取店铺关联的订单和商品
    const orders = Array.from(globalStore.orders?.values() || [])
      .filter(o => o.shop_id === id);
    
    const products = Array.from(globalStore.products?.values() || [])
      .filter(p => p.platform_listings?.some(l => l.shop_id === id));

    return NextResponse.json({
      success: true,
      data: {
        ...shop,
        // 隐藏敏感信息
        credentials: {
          api_key: shop.credentials?.api_key ? '***' + shop.credentials.api_key.slice(-4) : undefined,
          store_id: shop.credentials?.store_id,
          seller_id: shop.credentials?.seller_id,
        },
        related_orders: orders.slice(0, 10),
        related_products: products.slice(0, 10),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取店铺详情失败' },
      { status: 500 }
    );
  }
}

// 更新店铺
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const shops = globalStore.shops || [];
    const index = shops.findIndex((s: Shop) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    shops[index] = {
      ...shops[index],
      ...body,
      id, // 确保ID不变
      updated_at: new Date().toISOString(),
    };

    globalStore.shops = shops;

    return NextResponse.json({
      success: true,
      data: shops[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新店铺失败' },
      { status: 500 }
    );
  }
}

// 删除店铺
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shops = globalStore.shops || [];
    const index = shops.findIndex((s: Shop) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    shops.splice(index, 1);
    globalStore.shops = shops;

    return NextResponse.json({
      success: true,
      message: '店铺已删除',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除店铺失败' },
      { status: 500 }
    );
  }
}
