import { NextRequest, NextResponse } from 'next/server';

/**
 * 商品采集工具 API - 代理到后端1688采集服务
 * 
 * 功能：
 * - 支持平台：1688
 * - 使用后端真实采集服务
 */

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

    // 获取token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 调用后端1688采集API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/1688/collect/preview`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || data.message || '采集失败' },
        { status: response.status }
      );
    }

    // 转换后端返回格式为前端期望格式
    if (data.success && data.data) {
      const productData = data.data;
      return NextResponse.json({
        success: true,
        platform: '1688',
        productId: productData.offer_id || productData.offerId || '',
        data: {
          title: productData.title || productData.subject || '',
          price: parseFloat(String(productData.price || 0).split('-')[0]) || 0,
          original_price: productData.original_price || productData.price,
          price_range: productData.price_range,
          main_image: productData.images?.[0] || '',
          images: productData.images || [],
          description: productData.details || '',
          shop_name: productData.supplier?.name || '',
          shop_url: productData.supplier?.url || '',
          specifications: productData.attributes || {},
          skus: productData.skus || [],
          sales: productData.sales || 0,
          min_order: productData.min_order,
          weight: productData.weight,
          location: productData.location || '',
          collect_method: productData.collect_method || 'api',
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: data.message || data.detail || '采集失败'
    });

  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { success: false, error: '采集服务异常，请稍后重试' },
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

    if (urls.length > 10) {
      return NextResponse.json(
        { success: false, error: '单次最多采集10个商品' },
        { status: 400 }
      );
    }

    // 获取token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 调用后端批量采集API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/1688/collect/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ urls }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || '批量采集失败' },
        { status: response.status }
      );
    }

    // 转换结果格式
    const results = (data.items || []).map((item: any) => ({
      success: true,
      platform: '1688',
      productId: item.offer_id,
      data: {
        title: item.title || item.subject || '',
        price: parseFloat(String(item.price || 0).split('-')[0]) || 0,
        images: item.images || [],
        description: item.details || '',
        shop_name: item.supplier?.name || '',
        collect_method: item.collect_method || 'api',
      }
    }));

    return NextResponse.json({
      success: true,
      total: urls.length,
      successCount: results.filter((r: any) => r.success).length,
      failedCount: urls.length - results.filter((r: any) => r.success).length,
      results
    });

  } catch (error) {
    console.error('Batch scrape error:', error);
    return NextResponse.json(
      { success: false, error: '批量采集服务异常' },
      { status: 500 }
    );
  }
}
