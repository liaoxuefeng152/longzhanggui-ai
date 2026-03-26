import { NextRequest, NextResponse } from 'next/server';

// 模拟Prompt数据（与父路由共享）
const mockPrompts = [
  {
    id: 'prompt-001',
    name: '印尼语客服询盘回复',
    category: 'customer-service',
    content: '你是一位专业的TK印尼语客服，请用印尼语回复用户的询盘。回复应该友好、专业，并突出产品优势。',
    model_id: 'doubao-seed-1-8-251228',
    agent_type: 'customer-service',
    platform: 'tiktok',
    variables: { language: '印尼语', tone: '友好专业' },
    version: 'v2.1',
    status: 'active',
    is_active: true,
    created_at: '2024-02-18T10:00:00Z',
    updated_at: '2024-02-18T10:00:00Z',
  },
  {
    id: 'prompt-002',
    name: 'TK短视频标题生成',
    category: 'video-generation',
    content: '请为TK短视频生成吸引人的标题，要求包含热门标签，吸引目标用户点击。标题应该简洁有力，突出产品卖点。',
    model_id: 'doubao-seed-2-0-lite-260215',
    agent_type: 'video-generation',
    platform: 'tiktok',
    variables: { style: '吸引眼球', include_tags: true },
    version: 'v1.5',
    status: 'active',
    is_active: true,
    created_at: '2024-02-15T14:30:00Z',
    updated_at: '2024-02-15T14:30:00Z',
  },
  {
    id: 'prompt-003',
    name: '马来语订单催促',
    category: 'customer-service',
    content: '请用马来语发送友好的订单催促消息，提醒用户完成支付，同时提供购买帮助。',
    model_id: 'doubao-seed-1-8-251228',
    agent_type: 'customer-service',
    platform: 'all',
    variables: { language: '马来语', tone: '友好' },
    version: 'v1.0',
    status: 'active',
    is_active: true,
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-10T09:00:00Z',
  },
  {
    id: 'prompt-004',
    name: '选品分析助手',
    category: 'product-selection',
    content: '分析目标市场的热门品类，推荐具有高潜力的产品。输出包括市场趋势、竞争分析、定价建议。',
    model_id: 'doubao-seed-2-0-lite-260215',
    agent_type: 'product-selection',
    platform: 'all',
    variables: { market: '东南亚', category: '热销品类' },
    version: 'v1.2',
    status: 'active',
    is_active: true,
    created_at: '2024-02-08T11:00:00Z',
    updated_at: '2024-02-08T11:00:00Z',
  },
  {
    id: 'prompt-005',
    name: 'Listing标题优化',
    category: 'listing-optimization',
    content: '优化商品标题，包含关键词，提高搜索排名。标题应该简洁明了，突出产品卖点和优势。',
    model_id: 'doubao-seed-2-0-lite-260215',
    agent_type: 'listing-optimization',
    platform: 'all',
    variables: { keywords: '', max_length: 100 },
    version: 'v1.3',
    status: 'active',
    is_active: true,
    created_at: '2024-02-05T16:00:00Z',
    updated_at: '2024-02-05T16:00:00Z',
  },
  {
    id: 'prompt-006',
    name: '广告投放策略',
    category: 'advertising',
    content: '根据产品特点和市场定位，制定广告投放策略。包括目标受众、预算分配、投放时段建议。',
    model_id: 'doubao-pro-256k-241115',
    agent_type: 'advertising',
    platform: 'tiktok',
    variables: { budget: '中等', target: '东南亚年轻用户' },
    version: 'v2.0',
    status: 'inactive',
    is_active: false,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-02-01T08:00:00Z',
  },
  {
    id: 'prompt-007',
    name: '图片去背景',
    category: 'image-design',
    content: '智能识别图片主体，自动去除背景，输出透明背景图片。适用于产品主图处理。',
    model_id: 'doubao-vision-32k-241028',
    agent_type: 'image-design',
    platform: 'all',
    variables: { output_format: 'png' },
    version: 'v1.0',
    status: 'active',
    is_active: true,
    created_at: '2024-01-28T13:00:00Z',
    updated_at: '2024-01-28T13:00:00Z',
  },
  {
    id: 'prompt-008',
    name: '数据复盘报告',
    category: 'data-review',
    content: '分析店铺运营数据，生成复盘报告。包括销售趋势、爆款分析、问题诊断和优化建议。',
    model_id: 'doubao-pro-256k-241115',
    agent_type: 'data-review',
    platform: 'all',
    variables: { period: '周', metrics: '销售额,订单量,转化率' },
    version: 'v1.1',
    status: 'active',
    is_active: true,
    created_at: '2024-01-25T10:30:00Z',
    updated_at: '2024-01-25T10:30:00Z',
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prompt = mockPrompts.find((p) => p.id === id);
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Get prompt error:', error);
    return NextResponse.json(
      { error: '获取Prompt详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const promptIndex = mockPrompts.findIndex((p) => p.id === id);
    if (promptIndex === -1) {
      return NextResponse.json(
        { error: 'Prompt不存在' },
        { status: 404 }
      );
    }

    const updatedPrompt = {
      ...mockPrompts[promptIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Update prompt error:', error);
    return NextResponse.json(
      { error: '更新Prompt失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const promptIndex = mockPrompts.findIndex((p) => p.id === id);
    if (promptIndex === -1) {
      return NextResponse.json(
        { error: 'Prompt不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt已删除',
    });
  } catch (error) {
    console.error('Delete prompt error:', error);
    return NextResponse.json(
      { error: '删除Prompt失败' },
      { status: 500 }
    );
  }
}
