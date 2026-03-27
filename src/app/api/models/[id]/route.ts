import { NextRequest, NextResponse } from 'next/server';

// 全局模型存储
declare global {
  var modelsStore: any[] | undefined;
}

// 默认模型数据
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

// GET - 获取单个模型详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const modelsStore = getModelsStore();
  const { id } = await params;
  const model = modelsStore.find(m => m.id === id);
  
  if (!model) {
    return NextResponse.json(
      { detail: '模型不存在' },
      { status: 404 }
    );
  }
  
  // 隐藏API密钥
  const responseModel = {
    ...model,
    api_key: '***',
  };
  
  return NextResponse.json(responseModel);
}

// PUT - 更新模型
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const modelsStore = getModelsStore();
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    const index = modelsStore.findIndex(m => m.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { detail: '模型不存在' },
        { status: 404 }
      );
    }
    
    // 更新模型数据
    modelsStore[index] = {
      ...modelsStore[index],
      name: body.name || modelsStore[index].name,
      model_id: body.model_id || modelsStore[index].model_id,
      provider: body.provider || modelsStore[index].provider,
      api_key: body.api_key || modelsStore[index].api_key,
      endpoint: body.endpoint !== undefined ? body.endpoint : modelsStore[index].endpoint,
      daily_limit: body.daily_limit || modelsStore[index].daily_limit,
      status: body.status || modelsStore[index].status,
      updated_at: new Date().toISOString(),
    };
    
    // 返回时隐藏API密钥
    const responseModel = {
      ...modelsStore[index],
      api_key: '***',
    };
    
    return NextResponse.json(responseModel);
  } catch (error) {
    console.error('更新模型失败:', error);
    return NextResponse.json(
      { detail: '更新模型失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除模型
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const modelsStore = getModelsStore();
  
  try {
    const { id } = await params;
    const index = modelsStore.findIndex(m => m.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { detail: '模型不存在' },
        { status: 404 }
      );
    }
    
    modelsStore.splice(index, 1);
    
    return NextResponse.json({
      success: true,
      message: '模型已删除',
    });
  } catch (error) {
    console.error('删除模型失败:', error);
    return NextResponse.json(
      { detail: '删除模型失败' },
      { status: 500 }
    );
  }
}
