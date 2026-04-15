import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const recommendations = {
      selection: [
        {
          id: 'REC-001',
          category: '宠物用品',
          reason: '搜索量上涨45%，竞争度适中',
          market: '东南亚',
          score: 85,
          trend: 'up',
        },
        {
          id: 'REC-002',
          category: '家居收纳',
          reason: '物流成本低，客单价高',
          market: '东南亚',
          score: 78,
          trend: 'stable',
        },
      ],
      pricing: [
        {
          id: 'PRC-001',
          product: '宠物饮水机',
          currentPrice: 24.99,
          suggestedPrice: 22.99,
          reason: '竞品价格下调，建议跟进',
          confidence: 85,
        },
      ],
      listing: [
        {
          id: 'LST-001',
          product: '手机支架',
          issue: '标题关键词覆盖不足',
          suggestion: '建议添加 "universal"、"adjustable" 等关键词',
          priority: 'high',
        },
      ],
      ads: [
        {
          id: 'AD-001',
          product: '宠物饮水机',
          currentACOS: 32,
          suggestedACOS: 25,
          action: '降低竞价10%，优化关键词',
        },
      ],
    };

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Recommendations Error:', error);
    return NextResponse.json(
      { error: '获取建议失败' },
      { status: 500 }
    );
  }
}
