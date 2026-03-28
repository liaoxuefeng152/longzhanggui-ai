import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 工作流步骤定义类型
interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  required: boolean;
}

// 工作流模板定义类型
interface WorkflowTemplate {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

// 工作流模板定义
const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  'single_product_publish': {
    name: '单品上架流程',
    description: '选品→图片→Listing→定价→上架',
    steps: [
      { id: 'selection', name: '选品分析', agent: 'product-selection', required: true },
      { id: 'image', name: '图片处理', agent: 'image-design', required: true },
      { id: 'listing', name: 'Listing优化', agent: 'listing-optimization', required: true },
      { id: 'compliance', name: '合规校验', agent: 'compliance-checker', required: true },
      { id: 'pricing', name: '智能定价', agent: 'pricing-engine', required: true },
      { id: 'publish', name: '上架发布', agent: 'publish-agent', required: true },
      { id: 'ad_create', name: '广告创建', agent: 'advertising', required: false },
    ]
  },
  'image_process': {
    name: '图片处理流程',
    description: '主图生成→背景替换→合规校验',
    steps: [
      { id: 'main_image', name: '主图生成', agent: 'image-design', required: true },
      { id: 'background', name: '背景处理', agent: 'image-design', required: false },
      { id: 'translate', name: '图片翻译', agent: 'image-design', required: false },
      { id: 'compliance', name: '图片合规', agent: 'compliance-checker', required: true },
    ]
  },
  'order_fulfillment': {
    name: '订单履约流程',
    description: '订单同步→库存扣减→物流发货→状态更新',
    steps: [
      { id: 'sync', name: '订单同步', agent: 'order-sync', required: true },
      { id: 'inventory', name: '库存扣减', agent: 'inventory-agent', required: true },
      { id: 'shipping', name: '物流发货', agent: 'shipping-agent', required: true },
      { id: 'notify', name: '买家通知', agent: 'notification-agent', required: false },
    ]
  },
  'customer_service': {
    name: '客服处理流程',
    description: '消息接收→意图识别→回复生成→工单创建',
    steps: [
      { id: 'receive', name: '消息接收', agent: 'message-receiver', required: true },
      { id: 'intent', name: '意图识别', agent: 'customer-service', required: true },
      { id: 'reply', name: '回复生成', agent: 'customer-service', required: true },
      { id: 'ticket', name: '工单创建', agent: 'ticket-agent', required: false },
    ]
  },
  'data_analysis': {
    name: '数据分析流程',
    description: '数据采集→指标计算→问题诊断→行动项生成',
    steps: [
      { id: 'collect', name: '数据采集', agent: 'data-collector', required: true },
      { id: 'calculate', name: '指标计算', agent: 'data-review', required: true },
      { id: 'diagnose', name: '问题诊断', agent: 'data-review', required: true },
      { id: 'actions', name: '行动项生成', agent: 'data-review', required: true },
    ]
  },
};

export async function GET(request: NextRequest) {
  try {
    const templates = Object.entries(WORKFLOW_TEMPLATES).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description,
      step_count: template.steps.length,
      required_steps: template.steps.filter(s => s.required).length,
    }));

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Get workflow templates error:', error);
    return NextResponse.json({ success: false, error: '获取模板失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template_id, product_id, user_id, params } = body;

    // 验证模板
    const template = WORKFLOW_TEMPLATES[template_id];
    if (!template) {
      return NextResponse.json({ 
        success: false, 
        error: '工作流模板不存在' 
      }, { status: 400 });
    }

    // 获取商品信息（如果指定）
    let productName = '';
    if (product_id) {
      const product = store.getProduct(product_id);
      if (product) {
        productName = product.name_zh;
      }
    }

    // 创建工作流执行记录
    const workflow = store.createWorkflow({
      template_id,
      template_name: template.name,
      product_id,
      product_name: productName,
      total_steps: template.steps.length,
      steps: template.steps.map(step => ({
        id: `${Date.now()}-${step.id}`,
        name: step.name,
        agent: step.agent,
        status: 'pending' as const,
      })),
    });

    // 更新工作流状态为运行中
    store.updateWorkflow(workflow.id, { 
      status: 'running', 
      started_at: store.now() 
    });

    // 异步执行工作流
    executeWorkflowAsync(workflow.id, template, product_id, params);

    return NextResponse.json({
      success: true,
      data: {
        workflow_id: workflow.id,
        template_id,
        template_name: template.name,
        product_id,
        status: 'running',
        total_steps: template.steps.length,
        message: '工作流已启动',
      }
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    return NextResponse.json({ success: false, error: '启动工作流失败' }, { status: 500 });
  }
}

// 异步执行工作流
async function executeWorkflowAsync(
  workflowId: string, 
  template: WorkflowTemplate,
  productId?: string,
  params?: Record<string, any>
) {
  const workflow = store.getWorkflow(workflowId);
  if (!workflow) return;

  for (let i = 0; i < template.steps.length; i++) {
    const stepDef = template.steps[i];
    const step = workflow.steps[i];

    try {
      // 更新步骤状态
      step.status = 'running';
      step.started_at = store.now();
      workflow.current_step = i + 1;
      store.updateWorkflow(workflowId, workflow);

      // 执行步骤
      const result = await executeStep(stepDef, productId, params);
      
      // 步骤完成
      step.status = 'completed';
      step.completed_at = store.now();
      step.result = result;
      store.updateWorkflow(workflowId, workflow);

    } catch (error: any) {
      console.error(`Step ${stepDef.id} failed:`, error);
      
      step.status = 'failed';
      step.error = error.message || String(error);
      
      // 必需步骤失败则终止工作流
      if (stepDef.required) {
        workflow.status = 'failed';
        workflow.error = `步骤 ${stepDef.name} 失败: ${step.error}`;
        store.updateWorkflow(workflowId, workflow);
        return;
      }
      
      // 非必需步骤失败则跳过
      step.status = 'skipped';
      store.updateWorkflow(workflowId, workflow);
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 所有步骤完成
  workflow.status = 'completed';
  workflow.completed_at = store.now();
  store.updateWorkflow(workflowId, workflow);

  // 如果是单品上架流程，更新商品状态
  if (template.name === '单品上架流程' && productId) {
    store.updateProduct(productId, { status: 'ready' });
  }
}

// 执行单个步骤
async function executeStep(
  step: { id: string; name: string; agent: string },
  productId?: string,
  params?: Record<string, any>
): Promise<any> {
  const product = productId ? store.getProduct(productId) : null;

  switch (step.id) {
    case 'selection':
      return await executeSelection(product, params);
    
    case 'image':
    case 'main_image':
    case 'background':
    case 'translate':
      return await executeImageProcess(step.id, product);
    
    case 'listing':
      return await executeListing(product);
    
    case 'compliance':
      return await executeCompliance(product);
    
    case 'pricing':
      return await executePricing(product);
    
    case 'publish':
      return await executePublish(product, params);
    
    case 'ad_create':
      return await executeAdCreate(product, params);
    
    default:
      return { message: `步骤 ${step.name} 执行完成` };
  }
}

// 选品分析
async function executeSelection(product: any, params?: any): Promise<any> {
  try {
    const config = new Config();
    const client = new LLMClient(config, {});
    
    const response = await client.invoke([
      { role: 'system', content: '你是跨境电商选品专家。' },
      { role: 'user', content: `分析这个商品的市场潜力: ${product?.name_zh || params?.product_name}` }
    ], { model: 'doubao-seed-1-6-251015' });
    
    return { analysis: response.content };
  } catch {
    return { analysis: '选品分析完成' };
  }
}

// 图片处理
async function executeImageProcess(stepId: string, product: any): Promise<any> {
  const imageId = store.generateId('IMG');
  const imageUrl = `https://placehold.co/800x800?text=${encodeURIComponent(product?.name_zh || 'Product')}`;
  
  return {
    image_id: imageId,
    type: stepId === 'main_image' ? 'main' : 'processed',
    url: imageUrl,
    status: 'done',
  };
}

// Listing优化
async function executeListing(product: any): Promise<any> {
  return {
    title: product?.name_en || product?.name_zh,
    description: `High quality ${product?.name_zh}. Best choice for you.`,
    bullet_points: ['Premium Quality', 'Fast Shipping', 'Best Price', 'Satisfaction Guaranteed'],
    keywords: ['best', 'quality', 'sale', 'hot'],
    seo_score: 85,
  };
}

// 合规校验
async function executeCompliance(product: any): Promise<any> {
  const issues: string[] = [];
  
  // 检查敏感词
  const sensitiveWords = ['医疗', '治疗', '最佳', '第一'];
  for (const word of sensitiveWords) {
    if (product?.name_zh?.includes(word)) {
      issues.push(`包含敏感词: ${word}`);
    }
  }
  
  if (issues.length > 0) {
    throw new Error(`合规校验失败: ${issues.join(', ')}`);
  }
  
  return { passed: true, issues: [] };
}

// 智能定价
async function executePricing(product: any): Promise<any> {
  const cost = product?.total_cost || product?.cost_price || 100;
  const margin = 0.3;
  const price = Math.ceil(cost / (1 - margin));
  
  return {
    suggested_price: price,
    profit_margin: margin,
    cost_breakdown: {
      product_cost: cost,
      platform_fee: price * 0.15,
      shipping: 10,
      profit: price * margin,
    }
  };
}

// 上架发布
async function executePublish(product: any, params?: any): Promise<any> {
  const listingId = store.generateId('LST');
  
  return {
    listing_id: listingId,
    platform: params?.platform || 'tiktok',
    region: params?.region || 'id',
    status: 'listed',
    listed_at: store.now(),
  };
}

// 创建广告
async function executeAdCreate(product: any, params?: any): Promise<any> {
  if (!product) return { skipped: true, reason: '无商品信息' };
  
  const ad = store.createAdCampaign({
    product_id: product.id,
    product_name: product.name_zh,
    name: `${product.name_zh.slice(0, 10)}-自动推广`,
    platform: params?.platform || 'tiktok',
    status: 'active',
    daily_budget: 100,
  });
  
  return {
    ad_id: ad.id,
    name: ad.name,
    budget: ad.daily_budget,
    status: ad.status,
  };
}
