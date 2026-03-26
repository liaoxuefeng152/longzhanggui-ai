import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      platform = 'tiktok',
      daily_budget = 100,
      target_acos = 0.2,
      keywords = [],
    } = body;
    
    if (!product_id) {
      return NextResponse.json(
        { success: false, error: '请提供产品ID' },
        { status: 400 }
      );
    }
    
    // 模拟AI广告创建
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const campaignId = `ad-${Date.now()}`;
    
    const campaign = {
      campaign_id: campaignId,
      product_id,
      platform,
      daily_budget,
      target_acos,
      keywords: keywords.length > 0 ? keywords : ['热销', '爆款', '推荐', '限时特惠'],
      status: 'active',
      recommendations: [
        '建议设置日预算为产品售价的10-20%',
        '初期可设置较高出价获取流量',
        '关注ROI变化，及时调整出价',
        '建议使用自动出价策略',
      ],
      created_at: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: campaign,
      message: '广告计划创建成功',
    });
  } catch (error) {
    console.error('Create ad error:', error);
    return NextResponse.json(
      { success: false, error: '广告创建失败' },
      { status: 500 }
    );
  }
}
