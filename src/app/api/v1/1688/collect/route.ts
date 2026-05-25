import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000';

/**
 * 1688 商品采集 API - 代理到Python后端
 * Python后端已实现HMAC-SHA1签名算法，成功对接1688开放平台API
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

    console.log('[1688 Collect] 代理采集请求到后端:', url);

    // 代理到Python后端
    const backendResp = await fetch(`${BACKEND_URL}/api/v1/1688/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await backendResp.json();

    if (!backendResp.ok) {
      console.error('[1688 Collect] 后端返回错误:', data);
      return NextResponse.json(
        { success: false, error: data.error || data.detail || '后端采集失败' },
        { status: backendResp.status }
      );
    }

    // 转换后端返回格式为前端期望的格式
    const product = data.data || {};
    const offerId = product.offer_id || '';

    return NextResponse.json({
      success: true,
      platform: '1688',
      productId: offerId,
      data: {
        title: product.title || '',
        price: parseFloat(String(product.price || 0).split('-')[0]) || 0,
        price_range: product.price_range || '',
        main_image: product.images?.[0] || '',
        images: product.images || [],
        description: product.details || '',
        shop_name: product.supplier?.name || '',
        shop_url: product.supplier?.url || '',
        specifications: product.attributes || {},
        skus: product.skus || [],
        sales: product.sales || 0,
        min_order: product.min_order || 1,
        location: product.location || '',
        collect_method: product.collect_method || '',
        note: product.note || '',
      },
    });

  } catch (error: any) {
    console.error('[1688 Collect] 采集异常:', error);
    // 后端不可用时，返回明确错误而非模拟数据
    return NextResponse.json(
      { success: false, error: '后端采集服务不可用，请确保Python后端已启动 (port 8000)' },
      { status: 503 }
    );
  }
}

/**
 * 批量采集 - 代理到Python后端
 */
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

    console.log('[1688 Batch Collect] 代理批量采集到后端, 数量:', urls.length);

    // 逐个代理到后端
    const results = [];
    for (const url of urls) {
      try {
        const resp = await fetch(`${BACKEND_URL}/api/v1/1688/collect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: AbortSignal.timeout(30000),
        });

        const data = await resp.json();
        const product = data.data || {};

        if (data.success && product) {
          results.push({
            success: true,
            url,
            productId: product.offer_id || '',
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
            error: data.error || '采集失败',
          });
        }
      } catch (err: any) {
        results.push({
          success: false,
          url,
          error: err.message || '采集异常',
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
