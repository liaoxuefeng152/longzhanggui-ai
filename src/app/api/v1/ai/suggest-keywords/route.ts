import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productName = searchParams.get('product_name');
    const platform = searchParams.get('platform') || 'tiktok';
    
    if (!productName) {
      return NextResponse.json(
        { success: false, error: '请提供产品名称' },
        { status: 400 }
      );
    }
    
    // 模拟关键词分析
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // 基于产品名称生成相关关键词
    const baseKeywords = [
      { keyword: productName, relevance: 100, volume: '高' },
      { keyword: `${productName} 热销`, relevance: 95, volume: '高' },
      { keyword: `${productName} 推荐`, relevance: 90, volume: '中' },
      { keyword: `${productName} 爆款`, relevance: 88, volume: '高' },
      { keyword: `${productName} 新品`, relevance: 85, volume: '中' },
      { keyword: '限时特惠', relevance: 82, volume: '高' },
      { keyword: '性价比', relevance: 80, volume: '高' },
      { keyword: '品质保证', relevance: 78, volume: '中' },
      { keyword: '免运费', relevance: 75, volume: '高' },
      { keyword: '现货直发', relevance: 72, volume: '中' },
    ];
    
    return NextResponse.json({
      success: true,
      data: {
        keywords: baseKeywords,
      },
    });
  } catch (error) {
    console.error('Suggest keywords error:', error);
    return NextResponse.json(
      { success: false, error: '关键词建议失败' },
      { status: 500 }
    );
  }
}
