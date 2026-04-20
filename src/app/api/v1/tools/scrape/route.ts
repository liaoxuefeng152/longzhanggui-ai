import { NextRequest, NextResponse } from 'next/server';

/**
 * 商品采集工具 API
 * 
 * 功能：
 * - 支持平台：1688、淘宝、天猫、京东、拼多多
 * - 商品信息提取
 * - 批量采集
 */

// 平台配置
const PLATFORM_CONFIG = {
  '1688': {
    name: '1688',
    domains: ['1688.com', 'm.1688.com'],
    idPattern: /offer\/(\d+)\.html|offerId=(\d+)/,
  },
  'taobao': {
    name: '淘宝',
    domains: ['taobao.com', 'm.taobao.com', 'item.taobao.com'],
    idPattern: /id=(\d+)/,
  },
  'tmall': {
    name: '天猫',
    domains: ['tmall.com', 'detail.tmall.com'],
    idPattern: /id=(\d+)/,
  },
  'jd': {
    name: '京东',
    domains: ['jd.com', 'item.jd.com', 'm.jd.com'],
    idPattern: /item\.jd\.com\/(\d+)/,
  },
  'pdd': {
    name: '拼多多',
    domains: ['pinduoduo.com', 'yangkeduo.com', 'mobile.yangkeduo.com'],
    idPattern: /goods_id=(\d+)/,
  }
};

type Platform = keyof typeof PLATFORM_CONFIG;

interface ScrapeResult {
  success: boolean;
  platform?: string;
  productId?: string;
  data?: {
    title: string;
    price: number;
    originalPrice?: number;
    images: string[];
    description?: string;
    specifications?: Record<string, string>;
    seller?: {
      name: string;
      rating?: number;
    };
    stock?: number;
    sales?: number;
  };
  error?: string;
}

// 检测平台
function detectPlatform(url: string): Platform | null {
  for (const [key, config] of Object.entries(PLATFORM_CONFIG)) {
    if (config.domains.some(domain => url.includes(domain))) {
      return key as Platform;
    }
  }
  return null;
}

// 提取商品ID
function extractProductId(url: string, platform: Platform): string | null {
  const config = PLATFORM_CONFIG[platform];
  const match = url.match(config.idPattern);
  if (match) {
    return match[1] || match[2];
  }
  return null;
}

// 模拟商品信息提取（生产环境应调用真实爬虫服务）
async function scrapeProductInfo(url: string, platform: Platform, productId: string): Promise<ScrapeResult> {
  // 这里应该调用真实的爬虫服务
  // 目前返回模拟数据用于演示
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟数据
  const mockData: Record<Platform, ScrapeResult['data']> = {
    '1688': {
      title: '【1688商品】新款创意产品 工厂直销 支持一件代发',
      price: 15.8,
      originalPrice: 25.0,
      images: [
        'https://via.placeholder.com/800x800?text=1688+Product+1',
        'https://via.placeholder.com/800x800?text=1688+Product+2',
      ],
      description: '产品详情：优质材料，工艺精湛，支持定制...',
      specifications: {
        '材质': '优质材料',
        '尺寸': '10x10x5cm',
        '颜色': '多色可选',
        '起批量': '2件起批'
      },
      seller: {
        name: '优质供应商店铺',
        rating: 4.8
      },
      stock: 9999,
      sales: 1500
    },
    'taobao': {
      title: '【淘宝爆款】网红同款 热销单品 包邮',
      price: 29.9,
      originalPrice: 59.9,
      images: [
        'https://via.placeholder.com/800x800?text=Taobao+Product+1',
        'https://via.placeholder.com/800x800?text=Taobao+Product+2',
      ],
      description: '淘宝热销爆款，月销过万，好评如潮...',
      seller: {
        name: '皇冠店铺',
        rating: 4.9
      },
      sales: 12000
    },
    'tmall': {
      title: '【天猫正品】品牌官方旗舰店 限时特惠',
      price: 89.0,
      originalPrice: 159.0,
      images: [
        'https://via.placeholder.com/800x800?text=Tmall+Product+1',
      ],
      description: '天猫官方正品，品质保证...',
      specifications: {
        '品牌': '知名品牌',
        '产地': '中国'
      },
      seller: {
        name: '品牌官方旗舰店',
        rating: 4.95
      },
      sales: 5000
    },
    'jd': {
      title: '【京东自营】品质保证 次日达',
      price: 99.0,
      originalPrice: 129.0,
      images: [
        'https://via.placeholder.com/800x800?text=JD+Product+1',
      ],
      description: '京东自营，品质保证，物流快捷...',
      seller: {
        name: '京东自营',
        rating: 4.9
      },
      sales: 8000
    },
    'pdd': {
      title: '【拼多多百亿补贴】超值好货 限时抢购',
      price: 9.9,
      originalPrice: 39.9,
      images: [
        'https://via.placeholder.com/800x800?text=PDD+Product+1',
      ],
      description: '百亿补贴，超值优惠...',
      sales: 50000
    }
  };

  return {
    success: true,
    platform: PLATFORM_CONFIG[platform].name,
    productId,
    data: mockData[platform]
  };
}

// 单个商品采集
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: '请提供商品链接' },
        { status: 400 }
      );
    }

    // 检测平台
    const platform = detectPlatform(url);
    if (!platform) {
      return NextResponse.json({
        success: false,
        error: '不支持的平台，目前支持：1688、淘宝、天猫、京东、拼多多'
      }, { status: 400 });
    }

    // 提取商品ID
    const productId = extractProductId(url, platform);
    if (!productId) {
      return NextResponse.json({
        success: false,
        error: '无法识别商品ID，请检查链接格式'
      }, { status: 400 });
    }

    // 采集商品信息
    const result = await scrapeProductInfo(url, platform, productId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { success: false, error: '采集失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 批量采集
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供商品链接数组' },
        { status: 400 }
      );
    }

    if (urls.length > 20) {
      return NextResponse.json(
        { success: false, error: '单次最多采集20个商品' },
        { status: 400 }
      );
    }

    // 并行采集
    const results: ScrapeResult[] = [];
    
    for (const url of urls) {
      const platform = detectPlatform(url);
      if (!platform) {
        results.push({
          success: false,
          error: `不支持的平台: ${url}`
        });
        continue;
      }

      const productId = extractProductId(url, platform);
      if (!productId) {
        results.push({
          success: false,
          error: `无法识别商品ID: ${url}`
        });
        continue;
      }

      const result = await scrapeProductInfo(url, platform, productId);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      total: urls.length,
      successCount,
      failedCount: urls.length - successCount,
      results
    });
  } catch (error) {
    console.error('Batch scrape error:', error);
    return NextResponse.json(
      { success: false, error: '批量采集失败' },
      { status: 500 }
    );
  }
}
