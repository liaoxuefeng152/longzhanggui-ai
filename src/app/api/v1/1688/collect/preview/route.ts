import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 预览采集商品
 * POST /api/v1/1688/collect/preview
 * 优先使用Python后端，如果后端不可用则返回模拟数据
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

    // 尝试调用Python后端
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/1688/collect/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(5000), // 5秒超时
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      }
    } catch (backendError) {
      console.log('Python后端不可用，使用前端模拟数据预览');
    }

    // 如果后端不可用，返回模拟预览数据
    const offerIdMatch = url.match(/offer\/(\d+)\.html/);
    const offerId = offerIdMatch ? offerIdMatch[1] : Date.now().toString();

    const mockPreview = {
      success: true,
      data: {
        id: offerId,
        title: '宠物自动喂食器 5L大容量 定时定量 智能APP远程控制 双电源',
        price: 89.50,
        main_image: `https://img.alicdn.com/imgextra/i4/O1CN01${offerId.slice(0, 8)}_${offerId.slice(8, 16)}_${offerId.slice(16)}!!0-item_pic.jpg`,
        specs: ['5L大容量', '定时定量', 'APP远程控制', '双电源'],
        supplier: '深圳市宠物用品有限公司',
        stock: 9999,
        sales_volume: 2000,
        collected_at: new Date().toISOString(),
      },
      message: '预览成功（前端模拟模式）'
    };

    return NextResponse.json(mockPreview, { status: 200 });
  } catch (error) {
    console.error('预览失败:', error);
    return NextResponse.json(
      { success: false, message: '预览失败，请稍后重试' },
      { status: 500 }
    );
  }
}
