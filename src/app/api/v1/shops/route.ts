/**
 * 多店铺管理 API
 * 支持多平台、多店铺的绑定和管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

interface Shop {
  id: string;
  name: string;
  platform: 'tiktok' | 'amazon' | 'shopee' | 'lazada' | 'tokopedia';
  region: string;
  currency: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  
  // 授权状态
  authorization_status: 'authorized' | 'unauthorized' | 'expired';
  store_id?: string;
  
  // 认证信息（不存储敏感凭证，由管理员统一管理）
  credentials: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: string;
  };
  
  // 配置
  config: {
    auto_sync: boolean;
    sync_interval: number;
    notify_email?: string;
  };
  
  // 统计
  stats: {
    total_orders: number;
    total_sales: number;
    total_products: number;
    last_sync?: string;
  };
  
  created_at: string;
  updated_at: string;
}

// 平台配置
const PLATFORM_CONFIG = {
  tiktok: {
    name: 'TikTok Shop',
    icon: '🎵',
    color: '#FF0050',
    regions: ['美国', '英国', '东南亚', '中东'],
    currencies: ['USD', 'GBP', 'SGD'],
  },
  amazon: {
    name: 'Amazon',
    icon: '📦',
    color: '#FF9900',
    regions: ['美国', '英国', '德国', '日本', '澳洲'],
    currencies: ['USD', 'GBP', 'EUR', 'JPY', 'AUD'],
  },
  shopee: {
    name: 'Shopee',
    icon: '🛒',
    color: '#EE4D2D',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  lazada: {
    name: 'Lazada',
    icon: '🏪',
    color: '#0F1472',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  tokopedia: {
    name: 'Tokopedia',
    icon: '🏬',
    color: '#42D06D',
    regions: ['印尼'],
    currencies: ['IDR'],
  },
};

// 获取所有店铺
export async function GET() {
  let shops = globalStore.shops || [];

  // 按状态排序
  shops.sort((a: Shop, b: Shop) => {
    const statusOrder = { active: 0, pending: 1, inactive: 2, suspended: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // 添加平台配置
  const shopsWithConfig = shops.map((shop: Shop) => ({
    ...shop,
    platform_info: PLATFORM_CONFIG[shop.platform as keyof typeof PLATFORM_CONFIG] || PLATFORM_CONFIG.tiktok,
  }));

  return NextResponse.json({
    success: true,
    data: {
      shops: shopsWithConfig,
      platforms: PLATFORM_CONFIG,
    },
  });
}

// 创建店铺
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, platform, region, currency, store_id, config } = body;

    if (!name || !platform) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查平台是否已配置凭证
    const platformCredentials = (globalStore as any).platformCredentials?.[platform];
    const hasCredentials = platformCredentials && (platformCredentials.api_key || platformCredentials.api_secret);
    
    const shop: Shop = {
      id: `shop_${Date.now()}`,
      name,
      platform,
      region: region || '美国',
      currency: currency || 'USD',
      status: hasCredentials ? 'active' : 'pending',
      authorization_status: store_id ? 'authorized' : 'unauthorized',
      store_id: store_id || '',
      credentials: {},
      config: {
        auto_sync: config?.auto_sync ?? true,
        sync_interval: config?.sync_interval || 5,
        notify_email: config?.notify_email,
      },
      stats: {
        total_orders: 0,
        total_sales: 0,
        total_products: 0,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!globalStore.shops) {
      globalStore.shops = [];
    }
    globalStore.shops.push(shop);

    // 记录操作日志
    globalStore.operationLogs?.push({
      id: `log_${Date.now()}`,
      action: 'create_shop',
      target: shop.id,
      target_name: shop.name,
      operator: 'system',
      result: 'success',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { shop },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建店铺失败' },
      { status: 500 }
    );
  }
}

// 更新店铺
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少店铺ID' },
        { status: 400 }
      );
    }

    const shops = globalStore.shops || [];
    const index = shops.findIndex((s: Shop) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    // 不允许直接修改敏感字段
    delete updates.id;
    delete updates.created_at;
    delete updates.credentials?.api_secret; // 不能修改密钥

    shops[index] = {
      ...shops[index],
      ...updates,
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
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少店铺ID' },
        { status: 400 }
      );
    }

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
