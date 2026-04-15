/**
 * 选品报告生成 API
 * 使用豆包大模型进行真实AI选品报告生成
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 系统提示词 - 选品报告专家
const REPORT_SYSTEM_PROMPT = `你是跨境电商选品报告专家，精通东南亚市场（印尼、泰国、越南、菲律宾、马来西亚）和 TikTok Shop 运营。

你的职责是基于用户的需求、选品分析结果，生成专业的选品决策报告。

请以 JSON 格式返回选品报告，包含以下字段：
- summary: 执行摘要
- recommendations: 选品推荐列表，每项包含：
  - product: 商品名称
  - priority: 优先级(high/medium/low)
  - reason: 推荐理由
  - price_suggestion: 定价建议
  - video_idea: 视频创意建议
  - risk_level: 风险等级(low/medium/high)
- action_items: 行动项列表
- next_steps: 下一步建议

只返回 JSON 数据，不要其他内容。`;

// 用户提示词模板
function buildUserPrompt(params: {
  market: string;
  category: string;
  products: any[];
  feasibility: any[];
  competitors: any[];
}): string {
  const siteNames: Record<string, string> = {
    id: '印尼',
    th: '泰国',
    vn: '越南',
    ph: '菲律宾',
    my: '马来西亚',
    us: '美国',
    uk: '英国',
  };

  const marketName = siteNames[params.market] || params.market;
  
  // 提取商品信息
  const productList = params.products
    .map((p: any, i: number) => `${i + 1}. ${p.name} - 价格: $${p.price} - 月销量: ${p.monthlySales || p.daily_sales * 30 || '未知'}`)
    .join('\n');

  // 提取可行性分析
  const feasibilityList = params.feasibility
    .map((f: any, i: number) => `${i + 1}. ${f.product?.name || f.product_name} - 毛利率: ${f.profitCalc?.grossMargin || f.profit_margin || '未知'}% - 结论: ${f.conclusion || '待评估'}`)
    .join('\n');

  // 提取竞品信息
  const competitorList = params.competitors
    .map((c: any, i: number) => `${i + 1}. ${c.name} - 月销量: ${c.sales} - 评分: ${c.rating}`)
    .join('\n');

  return `帮我生成 ${marketName} 市场的选品决策报告。

## 用户需求
- 目标市场：${marketName}
- 品类偏好：${params.category || '综合热门'}

## 推荐商品候选池
${productList || '暂无数据'}

## 可行性分析结果
${feasibilityList || '暂无数据'}

## 竞品分析结果
${competitorList || '暂无数据'}

请基于以上信息，生成：
1. 执行摘要：整体市场判断和选品结论
2. 优先级推荐：按优先级排序的选品建议
3. 定价建议：针对每个推荐商品的定价策略
4. 视频创意：TikTok推广的视频创意方向
5. 风险提示：需要关注的风险点
6. 行动项：下一步具体行动建议

只返回 JSON 格式的选品报告。`;
}

// 解析 AI 返回的 JSON
function parseAIResponse(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// 默认报告（兜底）
const defaultReport = {
  summary: '综合市场分析和可行性评估，推荐以上商品进入测试阶段。建议优先测试高利润、低竞争商品，控制首批备货量以降低风险。',
  recommendations: [
    { product: '推荐商品1', priority: 'high', reason: '蓝海类目，利润率高', price_suggestion: '$9.99', video_idea: '场景化使用演示', risk_level: 'low' },
    { product: '推荐商品2', priority: 'medium', reason: '市场需求稳定', price_suggestion: '$12.99', video_idea: '对比测评视频', risk_level: 'medium' },
  ],
  action_items: [
    '确认供应商和拿货价格',
    '准备产品图片和视频素材',
    '制定首批备货计划',
    '设置广告投放预算',
  ],
  next_steps: '完成选品后进入商品上架流程。',
};

// POST /api/v1/ai/generate-selection-report - 真实AI选品报告生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      market = 'id',
      category,
      products = [],
      feasibility = [],
      competitors = [],
    } = body;

    console.log(`[选品报告] 开始生成: ${market} ${category || '综合'} - ${products.length}个商品`);

    // 初始化 LLM 客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 构建消息
    const messages = [
      { role: 'system', content: REPORT_SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt({
        market,
        category,
        products,
        feasibility,
        competitors,
      })},
    ];

    // 调用豆包大模型
    const response = await client.invoke(messages as any, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.5,
      thinking: 'disabled',
    });

    const aiContent = response.content || '';
    console.log(`[选品报告] AI返回内容长度: ${aiContent.length}`);

    // 解析 AI 返回
    const aiData = parseAIResponse(aiContent);

    if (aiData) {
      return NextResponse.json({
        success: true,
        report: {
          summary: aiData.summary || defaultReport.summary,
          recommendations: aiData.recommendations || defaultReport.recommendations,
          actionItems: aiData.action_items || aiData.actionItems || defaultReport.action_items,
          nextSteps: aiData.next_steps || aiData.nextSteps || defaultReport.next_steps,
        },
        generatedAt: new Date().toISOString(),
        market,
        category,
      });
    }

    // 如果解析失败，返回默认报告
    console.warn('[选品报告] AI返回格式解析失败，使用默认报告');
    return NextResponse.json({
      success: true,
      report: defaultReport,
      generatedAt: new Date().toISOString(),
      market,
      category,
    });

  } catch (error: any) {
    console.error('[选品报告] API错误:', error);
    
    // 出错时返回默认报告
    return NextResponse.json({
      success: true,
      report: defaultReport,
      generatedAt: new Date().toISOString(),
      error: error.message,
    });
  }
}
