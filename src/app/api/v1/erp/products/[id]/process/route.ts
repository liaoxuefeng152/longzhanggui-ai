import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 处理流程步骤定义
const PROCESS_STEPS = [
  { id: 'image', name: '图片处理', agent: 'image-design' },
  { id: 'listing', name: 'Listing优化', agent: 'listing-optimization' },
  { id: 'compliance', name: '合规校验', agent: 'compliance-checker' },
  { id: 'pricing', name: '智能定价', agent: 'pricing-engine' },
];

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const steps = body.steps || ['image', 'listing', 'compliance', 'pricing'];
    
    const product = store.getProduct(id);
    if (!product) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    // 更新商品状态为处理中
    store.updateProduct(id, { status: 'processing' });

    // 创建工作流执行记录
    const workflow = store.createWorkflow({
      template_id: 'product_process',
      template_name: '商品处理流程',
      product_id: id,
      product_name: product.name_zh,
      total_steps: steps.length,
      steps: steps.map((stepId: string, index: number) => {
        const stepDef = PROCESS_STEPS.find(s => s.id === stepId);
        return {
          id: `${id}-${stepId}`,
          name: stepDef?.name || stepId,
          agent: stepDef?.agent || stepId,
          status: 'pending',
        };
      }),
    });

    // 模拟异步处理（实际应使用后台任务）
    processProductAsync(id, steps);

    return NextResponse.json({
      success: true,
      data: {
        workflow_id: workflow.id,
        product_id: id,
        status: 'processing',
        message: '商品处理流程已启动',
      }
    });
  } catch (error) {
    console.error('Process product error:', error);
    return NextResponse.json({ success: false, error: '启动处理流程失败' }, { status: 500 });
  }
}

// 异步处理商品
async function processProductAsync(productId: string, steps: string[]) {
  const product = store.getProduct(productId);
  if (!product) return;

  for (let i = 0; i < steps.length; i++) {
    const stepId = steps[i];
    const stepDef = PROCESS_STEPS.find(s => s.id === stepId);
    
    try {
      // 更新步骤状态为运行中
      const workflow = store.getWorkflows().find(w => w.product_id === productId && w.status !== 'completed');
      if (workflow) {
        workflow.steps[i].status = 'running';
        workflow.steps[i].started_at = store.now();
        workflow.current_step = i + 1;
        store.updateWorkflow(workflow.id, workflow);
      }

      // 执行具体处理
      let result: any = {};
      
      switch (stepId) {
        case 'image':
          result = await processImage(product);
          store.updateProduct(productId, { 
            image_status: 'done',
            images: result.images,
          });
          break;
          
        case 'listing':
          result = await processListing(product);
          store.updateProduct(productId, { 
            listing_status: 'done',
            listing: result.listing,
          });
          break;
          
        case 'compliance':
          result = await processCompliance(product);
          store.updateProduct(productId, { 
            compliance_status: result.passed ? 'passed' : 'failed',
            compliance_issues: result.issues,
          });
          break;
          
        case 'pricing':
          result = await processPricing(product);
          store.updateProduct(productId, { 
            pricing: result.pricing,
          });
          break;
      }

      // 更新步骤状态为完成
      if (workflow) {
        workflow.steps[i].status = 'completed';
        workflow.steps[i].completed_at = store.now();
        workflow.steps[i].result = result;
        store.updateWorkflow(workflow.id, workflow);
      }

    } catch (error) {
      console.error(`Step ${stepId} failed:`, error);
      
      // 更新步骤状态为失败
      const workflow = store.getWorkflows().find(w => w.product_id === productId);
      if (workflow) {
        workflow.steps[i].status = 'failed';
        workflow.steps[i].error = String(error);
        workflow.status = 'failed';
        store.updateWorkflow(workflow.id, workflow);
      }
      
      store.updateProduct(productId, { status: 'draft' });
      return;
    }
  }

  // 所有步骤完成，更新商品状态
  store.updateProduct(productId, { status: 'ready' });
  
  // 更新工作流状态
  const workflow = store.getWorkflows().find(w => w.product_id === productId);
  if (workflow) {
    store.updateWorkflow(workflow.id, { 
      status: 'completed', 
      completed_at: store.now() 
    });
  }
}

async function processImage(product: any) {
  // 模拟图片处理
  return {
    images: [
      {
        id: store.generateId('IMG'),
        type: 'main',
        original_url: product.source_url || '',
        processed_url: `https://placehold.co/800x800?text=${encodeURIComponent(product.name_zh)}`,
        status: 'done',
        created_at: store.now(),
      }
    ]
  };
}

async function processListing(product: any) {
  try {
    const config = new Config();
    const customHeaders = {};
    const client = new LLMClient(config, customHeaders);

    const prompt = `Generate product listing for e-commerce platform.

Product Name (Chinese): ${product.name_zh}
Category: ${product.category || 'General'}
Key Features: High quality, competitive price

Generate a JSON response with:
{
  "title": "English product title (max 200 chars)",
  "title_en": "Same as title",
  "description": "Product description (2-3 paragraphs)",
  "bullet_points": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tags": ["tag1", "tag2", "tag3"],
  "seo_score": 85
}`;

    const response = await client.invoke([
      { role: 'system', content: 'You are an e-commerce listing expert. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ], { model: 'doubao-seed-1-6-251015', temperature: 0.7 });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const listing = JSON.parse(jsonMatch[0]);
      listing.generated_at = store.now();
      return { listing };
    }
  } catch (error) {
    console.error('Listing generation error:', error);
  }

  // Fallback
  return {
    listing: {
      title: product.name_en || product.name_zh,
      title_en: product.name_en || product.name_zh,
      description: `High quality ${product.name_zh}. Perfect for daily use.`,
      bullet_points: ['High Quality', 'Competitive Price', 'Fast Shipping', 'Excellent Service', 'Customer Satisfaction'],
      keywords: [product.category || 'product', 'quality', 'best', 'sale', 'hot'],
      tags: [product.category || 'general'],
      seo_score: 75,
      generated_at: store.now(),
    }
  };
}

async function processCompliance(product: any) {
  // 模拟合规检查
  const issues: string[] = [];
  
  // 检查敏感词
  const sensitiveWords = ['医疗', '治疗', '治愈', '最佳', '第一'];
  for (const word of sensitiveWords) {
    if (product.name_zh.includes(word)) {
      issues.push(`商品名称包含敏感词: ${word}`);
    }
  }
  
  return {
    passed: issues.length === 0,
    issues,
  };
}

async function processPricing(product: any) {
  const totalCost = product.total_cost || product.cost_price;
  const targetProfitRate = 0.3;
  const platformFeeRate = 0.15;
  const adCostRate = 0.1;
  
  const basePrice = totalCost / (1 - platformFeeRate - adCostRate - targetProfitRate);
  const suggestedPrice = Math.ceil(basePrice * 10) / 10;
  
  return {
    pricing: {
      total_cost: totalCost,
      suggested_price: suggestedPrice,
      target_price: suggestedPrice,
      profit_margin: targetProfitRate,
      pricing_basis: '基于成本+目标利润率计算',
      calculated_at: store.now(),
    }
  };
}
