import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // 模拟Prompt数据
    const prompts = [
      {
        id: '1',
        name: '印尼语客服询盘回复',
        category: '客服',
        content: '你是一位专业的TK印尼语客服，请用印尼语回复用户的询盘。回复应该友好、专业，并突出产品优势。',
        model: 'doubao-seed-1-8-251228',
        agent: 'customer_service',
        version: 'v2.1',
        isActive: true,
        createdAt: '2024-02-18',
      },
      {
        id: '2',
        name: 'TK短视频标题生成',
        category: '营销文案',
        content: '请为TK短视频生成吸引人的标题，要求包含热门标签，吸引目标用户点击。标题应该简洁有力，突出产品卖点。',
        model: 'doubao-seed-2-0-lite-260215',
        agent: 'marketing',
        version: 'v1.5',
        isActive: true,
        createdAt: '2024-02-15',
      },
      {
        id: '3',
        name: '马来语订单催促',
        category: '客服',
        content: '请用马来语发送友好的订单催促消息，提醒用户完成支付，同时提供购买帮助。',
        model: 'doubao-seed-1-8-251228',
        agent: 'customer_service',
        version: 'v1.0',
        isActive: true,
        createdAt: '2024-02-10',
      },
      {
        id: '4',
        name: '卖家群推广文案',
        category: '自推广',
        content: '生成用于卖家群转发的推广文案，突出产品优势和使用效果，引导其他卖家试用。',
        model: 'doubao-seed-2-0-lite-260215',
        agent: 'marketing',
        version: 'v1.2',
        isActive: false,
        createdAt: '2024-02-08',
      },
    ];

    // 按分类过滤
    const filtered = category
      ? prompts.filter((p) => p.category === category)
      : prompts;

    return NextResponse.json({
      success: true,
      data: { prompts: filtered },
    });
  } catch (error) {
    console.error('Get prompts error:', error);
    return NextResponse.json(
      { error: '获取Prompt模板失败' },
      { status: 500 }
    );
  }
}
