import { NextRequest, NextResponse } from 'next/server';

/**
 * 预览采集商品（不保存）
 * POST /api/v1/1688/collect/preview
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
    const sourceId = offerIdMatch ? offerIdMatch[1] : 'unknown';

    // 模拟预览数据
    const previewData = {
      id: sourceId,
      name: '1688优质商品 - 仿真采集预览',
      price: 29.9 + Math.random() * 100,
      images: [
        'https://cbu01.alicdn.com/img/ibank/O1CN01_placeholder_1.jpg',
        'https://cbu01.alicdn.com/img/ibank/O1CN01_placeholder_2.jpg',
      ],
      supplier: '示例供应商店铺',
      supplier_url: 'https://shop12345678.1688.com',
      sku_info: [
        { sku_id: 'sku_1', name: '默认规格', price: 29.9, stock: 999 },
        { sku_id: 'sku_2', name: '升级款', price: 39.9, stock: 500 },
      ],
      attributes: {
        '材质': '优质材料',
        '产地': '浙江义乌',
        '规格': '标准尺寸',
      },
    };

    return NextResponse.json({
      success: true,
      data: previewData,
    });
  } catch (error) {
    console.error('预览失败:', error);
    return NextResponse.json(
      { success: false, message: '预览失败，请稍后重试' },
      { status: 500 }
    );
  }
}
