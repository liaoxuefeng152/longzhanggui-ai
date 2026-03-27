import { NextRequest, NextResponse } from 'next/server';

// 全局Prompt存储
declare global {
  var promptsStore: any[] | undefined;
}

// 默认Prompt数据
const DEFAULT_PROMPTS = [
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

// 确保全局存储已初始化
function getPromptsStore(): any[] {
  if (!global.promptsStore) {
    global.promptsStore = [...DEFAULT_PROMPTS];
  }
  return global.promptsStore;
}

// 生成唯一ID
function generateId(): string {
  return `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - 获取Prompt列表
export async function GET(request: NextRequest) {
  const promptsStore = getPromptsStore();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '100');
  const agentType = searchParams.get('agent_type');
  const status = searchParams.get('status');
  
  let filteredPrompts = [...promptsStore];
  
  if (agentType && agentType !== 'all') {
    filteredPrompts = filteredPrompts.filter(p => p.agent_type === agentType);
  }
  
  if (status && status !== 'all') {
    filteredPrompts = filteredPrompts.filter(p => p.status === status);
  }
  
  const total = filteredPrompts.length;
  const start = (page - 1) * pageSize;
  const items = filteredPrompts.slice(start, start + pageSize);
  
  return NextResponse.json({
    items,
    prompts: items,
    total,
    page,
    page_size: pageSize,
  });
}

// POST - 创建Prompt
export async function POST(request: NextRequest) {
  const promptsStore = getPromptsStore();
  
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.content) {
      return NextResponse.json(
        { detail: '请填写必填项：模板名称、Prompt内容' },
        { status: 400 }
      );
    }
    
    const newPrompt = {
      id: generateId(),
      name: body.name,
      category: body.category || body.agent_type || 'general',
      content: body.content,
      model_id: body.model_id || 'doubao-seed-2-0-lite-260215',
      agent_type: body.agent_type || 'product-selection',
      platform: body.platform || 'all',
      variables: body.variables || {},
      version: 'v1.0',
      status: 'active',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    promptsStore.push(newPrompt);
    
    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('创建Prompt失败:', error);
    return NextResponse.json(
      { detail: '创建Prompt失败' },
      { status: 500 }
    );
  }
}
