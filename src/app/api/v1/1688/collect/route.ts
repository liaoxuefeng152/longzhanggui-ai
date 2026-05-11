import { NextRequest, NextResponse } from 'next/server';
import {
  collectProduct,
  parseOfferIdFromUrl,
  ALI_1688_CONFIG,
} from '@/lib/ali1688';

/**
 * 1688 商品采集 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: '请提供1688商品链接' },
        { status: 400 }
      );
    }

    const hasCredentials = ALI_1688_CONFIG.appKey && ALI_1688_CONFIG.appSecret;
    
    if (!hasCredentials) {
      return NextResponse.json({
        success: false,
        error: '请先在平台配置中设置1688 API凭证',
        needConfig: true,
        configPath: '/platform/datasources',
        hint: '需要配置 AppKey 和 AppSecret',
      });
    }

    const offerId = parseOfferIdFromUrl(url);
    if (!offerId) {
      return NextResponse.json({
        success: false,
        error: '无法解析1688商品链接，请检查链接格式',
      });
    }

    console.log('[1688 Collect] 开始采集商品:', offerId);

    const result = await collectProduct(url);

    if (result.success && result.data) {
      const product = result.data;
      
      return NextResponse.json({
        success: true,
        platform: '1688',
        productId: offerId,
        data: {
          title: product.title || '',
          price: parseFloat(String(product.price || 0).split('-')[0]) || 0,
          price_range: product.priceRange,
          main_image: product.images?.[0] || '',
          images: product.images || [],
          description: product.details || '',
          shop_name: product.supplier?.name || '',
          shop_url: product.supplier?.url || '',
          specifications: product.attributes || {},
          skus: product.skus || [],
          sales: product.sales || 0,
          min_order: product.minOrder || 1,
          location: product.location || '',
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: '采集失败，请稍后重试',
    });

  } catch (error: any) {
    console.error('[1688 Collect] 采集异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '采集服务异常' },
      { status: 500 }
    );
  }
}

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

    if (urls.length > 10) {
      return NextResponse.json(
        { success: false, error: '单次最多采集10个商品' },
        { status: 400 }
      );
    }

    const hasCredentials = ALI_1688_CONFIG.appKey && ALI_1688_CONFIG.appSecret;
    if (!hasCredentials) {
      return NextResponse.json({
        success: false,
        error: '请先在平台配置中设置1688 API凭证',
        needConfig: true,
      });
    }

    const results = [];
    for (const url of urls) {
      try {
        const offerId = parseOfferIdFromUrl(url);
        if (!offerId) {
          results.push({
            success: false,
            url,
            error: '无法解析链接',
          });
          continue;
        }

        const result = await collectProduct(url);
        if (result.success && result.data) {
          const product = result.data;
          results.push({
            success: true,
            url,
            productId: offerId,
            data: {
              title: product.title || '',
              price: parseFloat(String(product.price || 0).split('-')[0]) || 0,
              images: product.images || [],
              shop_name: product.supplier?.name || '',
            },
          });
        } else {
          results.push({
            success: false,
            url,
            error: '采集失败',
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          url,
          error: error.message || '采集异常',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      total: urls.length,
      successCount,
      failedCount,
      results,
    });

  } catch (error: any) {
    console.error('[1688 Batch Collect] 批量采集异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '批量采集异常' },
      { status: 500 }
    );
  }
}
