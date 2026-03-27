import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const productInfo = body.product_info || {};
    const platform = body.platform || 'tiktok';
    const language = body.language || 'id';
    const keywords = body.keywords || [];
    
    const productName = productInfo.name || productInfo.title || '商品';
    
    // 模拟AI生成优化后的Listing
    const optimizedTitle = `${productName} - 高品质热销款 | 免费配送`;
    const description = `${productName}\n\n✨ 产品特点：\n- 高品质材质，耐用可靠\n- 精美设计，时尚美观\n- 多功能用途，满足日常需求\n\n📦 包装清单：\n- 主产品 x1\n- 说明书 x1\n\n⚠️ 注意事项：\n- 请按说明正确使用\n- 如有问题请联系客服`;
    
    const bulletPoints = [
      '🔥 热销爆款，品质保证',
      '📦 快速发货，免费配送',
      '💯 正品保证，售后无忧',
      '🎁 精美包装，送礼佳选',
    ];
    
    const generatedKeywords = keywords.length > 0 ? keywords : [
      productName.split(' ')[0],
      '热销',
      '高品质',
      '免费配送',
    ];
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return NextResponse.json({
      success: true,
      data: {
        title: optimizedTitle,
        description,
        bullet_points: bulletPoints,
        keywords: generatedKeywords,
        seo_score: 87, // 整体SEO评分
        seo_details: {
          title_score: 85,
          description_score: 90,
          keywords_score: 88,
        },
        platform,
        language,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Optimize listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Listing优化失败' },
      { status: 500 }
    );
  }
}
