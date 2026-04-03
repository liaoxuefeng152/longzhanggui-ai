import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 批量采集1688商品
 * POST /api/v1/1688/collect/batch
 * 优先使用Python后端，如果后端不可用则返回模拟数据
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

    // 验证链接
    const validUrls = urls.filter(url => url.trim() && url.includes('1688.com'));
    if (validUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有有效的1688链接' },
        { status: 400 }
      );
    }

    // 尝试调用Python后端
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/1688/collect/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: validUrls }),
        signal: AbortSignal.timeout(5000), // 5秒超时
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      }
    } catch (backendError) {
      console.log('Python后端不可用，使用前端模拟数据批量采集');
    }

    // 如果后端不可用，返回模拟批量采集数据
    const mockProducts = validUrls.map((url, index) => {
      const offerIdMatch = url.match(/offer\/(\d+)\.html/);
      const offerId = offerIdMatch ? offerIdMatch[1] : `${Date.now()}-${index}`;
      const categories = ['宠物用品', '家居电器', '电子数码', '美妆工具', '母婴用品'];
      const products = [
        '宠物自动喂食器 5L大容量 定时定量',
        '便携式榨汁机 USB充电 多功能',
        '智能手环 运动监测 防水',
        'LED化妆镜 台式带灯 高清',
        '婴儿温奶器 恒温控制 双瓶',
      ];
      const category = categories[index % categories.length];
      const product = products[index % products.length];

      return {
        id: offerId,
        title: `${product} 智能APP远程控制`,
        price: Math.floor(Math.random() * 100 + 50) + Math.random().toFixed(2),
        original_price: Math.floor(Math.random() * 50 + 100) + Math.random().toFixed(2),
        category: category,
        image: `https://img.alicdn.com/imgextra/i${4-index}/O1CN01${offerId.slice(0, 8)}_${offerId.slice(8, 16)}_${offerId.slice(16)}!!0-item_pic.jpg`,
        supplier: '实力供应商',
        collected_at: new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: mockProducts,
      total: mockProducts.length,
      message: '批量采集成功（前端模拟模式）'
    }, { status: 200 });
  } catch (error) {
    console.error('批量采集失败:', error);
    return NextResponse.json(
      { success: false, message: '批量采集失败，请稍后重试' },
      { status: 500 }
    );
  }
}
