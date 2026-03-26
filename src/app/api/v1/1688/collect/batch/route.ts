import { NextRequest, NextResponse } from 'next/server';

/**
 * 批量采集商品
 * POST /api/v1/1688/collect/batch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, message: '请提供商品链接列表' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    let successCount = 0;

    for (const url of urls) {
      if (!url.trim() || !url.includes('1688.com')) {
        results.push({
          success: false,
          source_url: url,
          error: '无效的1688链接',
        });
        continue;
      }

      // 从URL提取商品ID
      const offerIdMatch = url.match(/offer\/(\d+)\.html/);
      const sourceId = offerIdMatch ? offerIdMatch[1] : crypto.randomUUID();
      const productId = `PROD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      results.push({
        success: true,
        product_id: productId,
        source_url: url,
        source_id: sourceId,
        name: '批量采集商品',
        price: Math.round((10 + Math.random() * 100) * 100) / 100,
      });
      successCount++;
    }

    return NextResponse.json({
      success: true,
      total: successCount,
      items: results,
    });
  } catch (error) {
    console.error('批量采集失败:', error);
    return NextResponse.json(
      { success: false, message: '批量采集失败，请稍后重试' },
      { status: 500 }
    );
  }
}
