import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

// 平台凭证配置存储
interface PlatformCredentials {
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  api_doc_url: string;
  regions: string[];
  currencies: string[];
  has_credentials: boolean;
  credentials?: PlatformCredentials;
  status: 'configured' | 'unconfigured' | 'error';
  last_updated?: string;
}

// 平台配置数据
const PLATFORMS_CONFIG: Record<string, Omit<PlatformConfig, 'has_credentials' | 'credentials' | 'status' | 'last_updated'>> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Shop',
    icon: '🎵',
    color: '#FF0050',
    api_doc_url: 'https://partner.tiktok.com/product',
    regions: ['美国', '英国', '东南亚', '中东'],
    currencies: ['USD', 'GBP', 'SGD'],
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    icon: '📦',
    color: '#FF9900',
    api_doc_url: 'https://developer.amazonservices.com',
    regions: ['美国', '英国', '德国', '日本', '澳洲'],
    currencies: ['USD', 'GBP', 'EUR', 'JPY', 'AUD'],
  },
  shopee: {
    id: 'shopee',
    name: 'Shopee',
    icon: '🛒',
    color: '#EE4D2D',
    api_doc_url: 'https://partner.shopeemobile.com',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  lazada: {
    id: 'lazada',
    name: 'Lazada',
    icon: '🏪',
    color: '#0F1472',
    api_doc_url: 'https://open.lazada.com',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  tokopedia: {
    id: 'tokopedia',
    name: 'Tokopedia',
    icon: '🏬',
    color: '#42D06D',
    api_doc_url: 'https://developer.tokopedia.com',
    regions: ['印尼'],
    currencies: ['IDR'],
  },
};

// 获取平台配置列表
export async function GET() {
  try {
    // 从全局存储获取已配置的平台凭证
    const platformCredentials = (globalStore as any).platformCredentials || {};
    
    // 构建返回数据
    const platforms: PlatformConfig[] = Object.entries(PLATFORMS_CONFIG).map(([platformId, config]) => {
      const credentials = platformCredentials[platformId];
      const hasCredentials = credentials && (credentials.api_key || credentials.api_secret);
      
      return {
        ...config,
        has_credentials: !!hasCredentials,
        credentials: hasCredentials ? {
          api_key: credentials.api_key,
          api_secret: credentials.api_secret,
          webhook_secret: credentials.webhook_secret,
        } : undefined,
        status: hasCredentials ? 'configured' : 'unconfigured',
        last_updated: (globalStore as any).platformConfigUpdated?.[platformId],
      };
    });
    
    return NextResponse.json({
      success: true,
      data: { platforms },
    });
  } catch (error) {
    console.error('获取平台配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取平台配置失败',
    }, { status: 500 });
  }
}

// 保存/更新平台配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, credentials } = body;
    
    if (!platform) {
      return NextResponse.json({
        success: false,
        error: '缺少平台参数',
      }, { status: 400 });
    }
    
    if (!PLATFORMS_CONFIG[platform]) {
      return NextResponse.json({
        success: false,
        error: '不支持的平台',
      }, { status: 400 });
    }
    
    // 初始化存储
    if (!(globalStore as any).platformCredentials) {
      (globalStore as any).platformCredentials = {};
    }
    if (!(globalStore as any).platformConfigUpdated) {
      (globalStore as any).platformConfigUpdated = {};
    }
    
    // 保存凭证
    (globalStore as any).platformCredentials[platform] = {
      api_key: credentials?.api_key || '',
      api_secret: credentials?.api_secret || '',
      webhook_secret: credentials?.webhook_secret || '',
    };
    
    // 记录更新时间
    (globalStore as any).platformConfigUpdated[platform] = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      data: {
        platform,
        status: 'configured',
        last_updated: (globalStore as any).platformConfigUpdated[platform],
      },
    });
  } catch (error) {
    console.error('保存平台配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '保存平台配置失败',
    }, { status: 500 });
  }
}

// 删除平台配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    
    if (!platform) {
      return NextResponse.json({
        success: false,
        error: '缺少平台参数',
      }, { status: 400 });
    }
    
    // 清除凭证
    if ((globalStore as any).platformCredentials?.[platform]) {
      delete (globalStore as any).platformCredentials[platform];
    }
    if ((globalStore as any).platformConfigUpdated?.[platform]) {
      delete (globalStore as any).platformConfigUpdated[platform];
    }
    
    return NextResponse.json({
      success: true,
      data: { platform },
    });
  } catch (error) {
    console.error('删除平台配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除平台配置失败',
    }, { status: 500 });
  }
}
