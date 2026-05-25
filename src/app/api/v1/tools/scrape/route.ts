import { NextRequest, NextResponse } from 'next/server';

/**
 * 商品采集工具 API - 代理到Python后端1688采集服务
 * 
 * Python后端已对接1688开放平台API（HMAC-SHA1签名），能采集真实商品数据
 * 此路由负责将前端请求转发到后端
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 解析1688商品链接获取 offerId
 */
function parseOfferIdFromUrl(url: string): string | null {
  const patterns = [
    /offer\/(\d+)\.html/i,
    /offer\/-\w+\/(\d+)\.html/i,
    /view\/(\d+)\.htm/i,
    /(\d{10,})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

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

    // 调用Python后端1688采集API（已对接真实1688开放平台）
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/1688/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (backendResponse.ok) {
        const backendResult = await backendResponse.json();
        
        if (backendResult.success && backendResult.data) {
          const productData = backendResult.data;
          
          // 将后端返回格式转换为前端期望的格式
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
        
        // 后端返回了但数据不成功
        console.error('[采集] 后端返回失败:', backendResult);
      }
    } catch (backendError) {
      console.error('[采集] Python后端不可用:', backendError);
    }

    // 后端不可用时返回错误，不再返回模拟数据
    return NextResponse.json({
      success: false,
      error: '采集服务暂时不可用，请确认后端服务已启动',
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

    const results = [];
    for (const url of urls) {
      try {
        const offerId = parseOfferIdFromUrl(url);
        if (!offerId) {
          results.push({ success: false, url, error: '无法解析链接' });
          continue;
        }

        // 调用Python后端批量采集
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/1688/collect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (backendResponse.ok) {
          const backendResult = await backendResponse.json();
          if (backendResult.success && backendResult.data) {
            const productData = backendResult.data;
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
        } else {
          results.push({ success: false, url, error: '后端服务不可用' });
        }
      } catch (err: any) {
        results.push({ success: false, url, error: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('[1688 Batch Collect] 批量采集异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '批量采集异常' },
      { status: 500 }
    );
  }
}
