import { NextRequest, NextResponse } from 'next/server';

// 模拟采集数据库
const collectionHistory: any[] = [];

/**
 * 采集单个1688商品
 * POST /api/v1/1688/collect
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: '请提供商品链接' },
        { status: 400 }
      );
    }

    // 验证1688链接
    if (!url.includes('1688.com')) {
      return NextResponse.json(
        { success: false, message: '请输入有效的1688商品链接' },
        { status: 400 }
      );
    }

    // 从URL提取商品ID
    const offerIdMatch = url.match(/offer\/(\d+)\.html/);
    const sourceId = offerIdMatch ? offerIdMatch[1] : crypto.randomUUID();

    // 模拟采集结果
    const productId = `PROD-${Date.now()}`;
    const collectionRecord = {
      id: crypto.randomUUID(),
      source_url: url,
      source_id: sourceId,
      product_id: productId,
      status: 'collected',
      created_at: new Date().toISOString(),
    };

    collectionHistory.push(collectionRecord);

    return NextResponse.json({
      success: true,
      message: '采集成功，已添加到商品库',
      product_id: productId,
      source_id: sourceId,
    });
  } catch (error) {
    console.error('采集失败:', error);
    return NextResponse.json(
      { success: false, message: '采集失败，请稍后重试' },
      { status: 500 }
    );
  }
}
