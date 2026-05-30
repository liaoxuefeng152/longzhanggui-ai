import { NextRequest, NextResponse } from 'next/server';
import { collectProduct, parseOfferIdFromUrl } from '@/lib/ali1688';

/**
 * 商品采集工具 API
 * 
 * 优先: Next.js 直接调用1688开放平台API（HMAC-SHA1签名）
 * 备选: 代理到Python后端
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, source } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: '请提供商品链接' },
        { status: 400 }
      );
    }

    const offerId = parseOfferIdFromUrl(url);
    if (!offerId) {
      return NextResponse.json({
        success: false,
        error: '无法解析1688商品链接，请检查链接格式',
      });
    }

    console.log('[采集] 开始采集商品:', offerId, '来源:', source || 'auto');

    // 方案1: Next.js 直接调用1688 API（HMAC-SHA1签名，无需Python后端）
    try {
      const result = await collectProduct(url);

      if (result.success && result.data) {
        const productData = result.data;
        console.log('[采集] API采集成功:', productData.title?.substring(0, 30));

        return NextResponse.json({
          success: true,
          platform: '1688',
          source: productData.collect_method || 'alibaba_api',
          productId: productData.offer_id || offerId,
          data: {
            title: productData.title || '',
            price: parseFloat(String(productData.price || 0).split('-')[0]) || 0,
            original_price: productData.price,
            price_range: productData.price_range || '',
            main_image: productData.main_image || productData.images?.[0] || '',
            images: productData.images || [],
            description: productData.details || productData.description || '',
            shop_name: productData.supplier?.name || '',
            shop_url: productData.supplier?.url || '',
            specifications: productData.attributes || {},
            skus: productData.skus || [],
            sales: productData.sales || 0,
            min_order: productData.min_order || 1,
            weight: productData.weight,
            location: productData.location || '',
            collect_method: productData.collect_method || 'alibaba_api',
          },
        });
      }
    } catch (directError: any) {
      console.warn('[采集] 直接API调用失败:', directError.message);

      // 方案2: 代理到Python后端（备选）
      try {
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/1688/collect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: AbortSignal.timeout(15000),
        });

        if (backendResponse.ok) {
          const backendResult = await backendResponse.json();
          if (backendResult.success && backendResult.data) {
            const productData = backendResult.data;
            console.log('[采集] 后端采集成功:', productData.title?.substring(0, 30));

            return NextResponse.json({
              success: true,
              platform: '1688',
              source: productData.collect_method || 'alibaba_api',
              productId: productData.offer_id || offerId,
              data: {
                title: productData.title || '',
                price: parseFloat(String(productData.price || 0).split('-')[0]) || 0,
                original_price: productData.price,
                price_range: productData.price_range || '',
                main_image: productData.images?.[0] || '',
                images: productData.images || [],
                description: productData.details || '',
                shop_name: productData.supplier?.name || '',
                shop_url: productData.supplier?.url || '',
                specifications: productData.attributes || {},
                skus: productData.skus || [],
                sales: productData.sales || 0,
                min_order: productData.min_order || 1,
                weight: productData.weight,
                location: productData.location || '',
                collect_method: productData.collect_method || 'alibaba_api',
              },
            });
          }
        }
      } catch (backendError) {
        console.warn('[采集] Python后端不可用');
      }

      // 两个方案都失败
      return NextResponse.json({
        success: false,
        error: `采集失败: ${directError.message}`,
      });
    }

    // 不应该走到这里
    return NextResponse.json({
      success: false,
      error: '采集服务异常',
    });

  } catch (error: any) {
    console.error('[采集] 异常:', error);
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

    const results = [];
    for (const url of urls) {
      try {
        const offerId = parseOfferIdFromUrl(url);
        if (!offerId) {
          results.push({ success: false, url, error: '无法解析链接' });
          continue;
        }

        const result = await collectProduct(url);
        if (result.success && result.data) {
          const productData = result.data;
          results.push({
            success: true,
            url,
            productId: productData.offer_id || offerId,
            data: {
              title: productData.title || '',
              price: parseFloat(String(productData.price || 0).split('-')[0]) || 0,
              images: productData.images || [],
              shop_name: productData.supplier?.name || '',
            },
          });
        } else {
          results.push({ success: false, url, error: '采集失败' });
        }
      } catch (err: any) {
        results.push({ success: false, url, error: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('[批量采集] 异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '批量采集异常' },
      { status: 500 }
    );
  }
}
