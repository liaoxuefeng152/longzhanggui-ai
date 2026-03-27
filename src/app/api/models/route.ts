import { NextRequest, NextResponse } from 'next/server';

// 全局模型存储（开发环境）
declare global {
  var modelsStore: any[] | undefined;
}

// 初始化默认模型数据
const DEFAULT_MODELS = [
  {
    id: 'model-001',
    name: '豆包-Pro-256K',
    model_id: 'doubao-pro-256k',
    provider: 'doubao',
    api_key: 'sk-demo-key',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    daily_limit: 1000000,
    today_used: 125000,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'model-002',
    name: 'DeepSeek-V3',
    model_id: 'deepseek-chat',
    provider: 'deepseek',
    api_key: 'sk-demo-key',
    endpoint: 'https://api.deepseek.com/v1',
    daily_limit: 500000,
    today_used: 89000,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'model-003',
    name: 'Kimi-128K',
    model_id: 'moonshot-v1-128k',
    provider: 'moonshot',
    api_key: 'sk-demo-key',
    endpoint: 'https://api.moonshot.cn/v1',
    daily_limit: 300000,
    today_used: 45000,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 确保全局存储已初始化
function getModelsStore(): any[] {
  if (!global.modelsStore) {
    global.modelsStore = [...DEFAULT_MODELS];
  }
  return global.modelsStore;
}

// 生成唯一ID
function generateId(): string {
  return `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - 获取模型列表
export async function GET(request: NextRequest) {
  const modelsStore = getModelsStore();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '100');
  const status = searchParams.get('status');
  
  let filteredModels = [...modelsStore];
  
  if (status && status !== 'all') {
    filteredModels = filteredModels.filter(m => m.status === status);
  }
  
  const total = filteredModels.length;
  const start = (page - 1) * pageSize;
  const items = filteredModels.slice(start, start + pageSize);
  
  return NextResponse.json({
    items,
    total,
    page,
    page_size: pageSize,
  });
}

// POST - 创建模型
export async function POST(request: NextRequest) {
  const modelsStore = getModelsStore();
  
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.model_id || !body.api_key) {
      return NextResponse.json(
        { detail: '请填写必填项：模型名称、模型ID、API密钥' },
        { status: 400 }
      );
    }
    
    // 检查模型ID是否已存在
    const existing = modelsStore.find(m => m.model_id === body.model_id);
    if (existing) {
      return NextResponse.json(
        { detail: '模型ID已存在，请使用不同的ID' },
        { status: 400 }
      );
    }
    
    const newModel = {
      id: generateId(),
      name: body.name,
      model_id: body.model_id,
      provider: body.provider || 'doubao',
      api_key: body.api_key,
      endpoint: body.endpoint || '',
      daily_limit: body.daily_limit || 1000000,
      today_used: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    modelsStore.push(newModel);
    
    // 返回时隐藏API密钥
    const responseModel = {
      ...newModel,
      api_key: '***',
    };
    
    return NextResponse.json(responseModel, { status: 201 });
  } catch (error) {
    console.error('创建模型失败:', error);
    return NextResponse.json(
      { detail: '创建模型失败' },
      { status: 500 }
    );
  }
}
