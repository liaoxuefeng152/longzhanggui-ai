import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_info, platform, language } = body;
    
    if (!product_info || !product_info.name) {
      return NextResponse.json(
        { success: false, error: '请提供产品信息' },
        { status: 400 }
      );
    }
    
    // 模拟AI处理
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const productName = product_info.name as string;
    const targetLanguage = language || '印尼语';
    const targetPlatform = platform || 'tiktok';
    
    // 生成优化后的Listing
    const listing = {
      title: `${productName} - 热销爆款 限时特惠 免运费`,
      description: `【产品亮点】
✨ 高品质材质，耐用持久
✨ 时尚设计，引领潮流
✨ 实用功能，满足日常需求

【产品特点】
• 材质优质，安全环保
• 工艺精湛，细节完美
• 多种款式可选

【适用场景】
适合日常使用、送礼佳品

【购买须知】
• 支持批量采购
• 质量保证，售后无忧
• 闪电发货`,
      bullet_points: [
        '✅ 高品质材质，经久耐用',
        '✅ 设计时尚，颜值在线',
        '✅ 性价比高，热销爆款',
        '✅ 现货直发，快速到达',
        '✅ 售后保障，购物无忧',
      ],
      keywords: [
        productName,
        '热销',
        '爆款',
        '性价比',
        '推荐',
        '新品',
        '限时特惠',
      ],
      seo_score: Math.floor(Math.random() * 20) + 80, // 80-100分
    };
    
    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error('Optimize listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Listing优化失败' },
      { status: 500 }
    );
  }
}
