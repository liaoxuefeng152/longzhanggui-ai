/**
 * 风险评估 API
 * 使用豆包大模型进行真实AI商品风险评估
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 系统提示词 - 风险评估专家
const RISK_SYSTEM_PROMPT = `你是跨境电商风险评估专家，精通东南亚市场（印尼、泰国、越南、菲律宾、马来西亚）和 TikTok Shop 运营。

你的职责是评估给定商品的风险等级和风险点，并给出缓解建议。

请以 JSON 格式返回风险评估结果，包含以下字段：
- risks: 风险列表，每项包含：
  - type: 风险类型（退货风险、季节风险、物流风险、政策风险、竞争风险、汇率风险等）
  - level: 风险等级(low/medium/high)
  - suggestion: 风险缓解建议
- overall_risk: 整体风险等级(low/medium/high)
- key_concerns: 需要重点关注的风险点

只返回 JSON 数据，不要其他内容。`;

// 用户提示词模板
function buildUserPrompt(params: {
  productName: string;
  category: string;
  market: string;
  price: number;
  monthlySales: number;
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

  return `帮我评估 "${params.productName}" 在 ${marketName} TikTok Shop 销售的风险。

商品信息：
- 商品名称：${params.productName}
- 商品类目：${params.category || '未知'}
- 目标市场：${marketName}
- 售价：$${params.price}
- 月销量：${params.monthlySales}+

请从以下维度评估风险：
1. 退货风险：考虑商品特性（易碎、尺寸误差、品质差异等）
2. 季节风险：是否有时效性或季节性
3. 物流风险：体积、重量、是否易损
4. 政策风险：目标市场的法规限制、认证要求
5. 竞争风险：市场竞争激烈程度
6. 汇率风险：汇率波动对利润的影响

只返回 JSON 格式的风险评估结果。`;
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

// 转换 AI 返回的风险格式
function transformRisks(aiRisks: any[]): any[] {
  if (!Array.isArray(aiRisks)) return [];

  const levelMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };

  return aiRisks.map((item: any) => ({
    type: item.type || item.risk_type || '其他风险',
    level: levelMap[item.level] || item.level || '中',
    suggestion: item.suggestion || item.mitigation || '建议持续关注',
  }));
}

// 默认风险数据（兜底）
const defaultRisks = [
  { type: '退货风险', level: '中', suggestion: '做好产品包装，减少运输损坏' },
  { type: '季节风险', level: '低', suggestion: '关注季节性，提前备货' },
  { type: '物流风险', level: '低', suggestion: '选择可靠物流服务商' },
];

// 分析商品特性推断风险
function inferRisksFromProduct(productName: string, category: string, price: number): any[] {
  const risks: any[] = [];
  const nameLower = productName.toLowerCase();
  const categoryLower = category.toLowerCase();

  // 电子类产品退货风险高
  if (nameLower.includes('电子') || nameLower.includes('电器') || nameLower.includes('灯') || nameLower.includes('电池')) {
    risks.push({ type: '退货风险', level: '高', suggestion: '电子类产品退货率高，建议做好品质管控，提供详细使用说明' });
  }

  // 服装类尺码问题
  if (nameLower.includes('服装') || nameLower.includes('鞋') || nameLower.includes('尺码')) {
    risks.push({ type: '退货风险', level: '高', suggestion: '服装类尺码误差常见，建议提供详细尺码表' });
  }

  // 食品类政策风险
  if (nameLower.includes('食品') || nameLower.includes('零食') || nameLower.includes('保健品')) {
    risks.push({ type: '政策风险', level: '高', suggestion: '食品类需要相关认证，建议确认目标市场的食品法规' });
  }

  // 季节性商品
  if (nameLower.includes('泳') || nameLower.includes('圣诞') || nameLower.includes('防晒') || nameLower.includes('取暖')) {
    risks.push({ type: '季节风险', level: '中', suggestion: '季节性商品有库存积压风险，建议控制备货量' });
  }

  // 易碎品
  if (nameLower.includes('玻璃') || nameLower.includes('陶瓷') || nameLower.includes('易碎')) {
    risks.push({ type: '物流风险', level: '中', suggestion: '易碎品物流损耗较高，建议加强包装防护' });
  }

  // 美妆类认证风险
  if (nameLower.includes('美妆') || nameLower.includes('护肤') || nameLower.includes('化妆品')) {
    risks.push({ type: '政策风险', level: '中', suggestion: '美妆类需认证，建议确认目标市场的化妆品法规' });
  }

  // 儿童玩具
  if (nameLower.includes('玩具') || nameLower.includes('儿童')) {
    risks.push({ type: '政策风险', level: '中', suggestion: '儿童产品需符合安全标准，建议准备相关认证' });
  }

  // 默认风险
  if (risks.length === 0) {
    risks.push({ type: '退货风险', level: '低', suggestion: '一般商品退货风险可控' });
    risks.push({ type: '季节风险', level: '低', suggestion: '全年可售，无明显季节性' });
  }

  return risks;
}

// POST /api/v1/ai/assess-risks - 真实AI风险评估
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      product_name,
      productName,
      category,
      market = 'id',
      price = 10,
      monthly_sales,
      monthlySales = 5000,
    } = body;

    if (!product_name && !productName) {
      return NextResponse.json({
        success: false,
        error: '缺少商品名称',
      }, { status: 400 });
    }

    const name = product_name || productName;
    const sales = monthly_sales || monthlySales;
    console.log(`[风险评估] 开始评估: ${name} @ ${market}`);

    // 优先使用基于商品特性的规则推断
    const inferredRisks = inferRisksFromProduct(name, category || '', price);

    // 尝试调用 AI（可选增强）
    try {
      const config = new Config();
      const client = new LLMClient(config);

      const messages = [
        { role: 'system', content: RISK_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt({
          productName: name,
          category: category || '',
          market,
          price,
          monthlySales: sales,
        })},
      ];

      const response = await client.invoke(messages as any, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.5,
        thinking: 'disabled',
      });

      const aiContent = response.content || '';
      const aiData = parseAIResponse(aiContent);

      if (aiData && aiData.risks) {
        const risks = transformRisks(aiData.risks);
        return NextResponse.json({
          success: true,
          risks,
          overallRisk: aiData.overall_risk || aiData.overallRisk || '中',
          keyConcerns: aiData.key_concerns || aiData.keyConcerns || '',
          source: 'ai',
        });
      }
    } catch (aiError) {
      console.warn('[风险评估] AI调用失败，使用规则推断:', aiError);
    }

    // 使用规则推断的风险
    return NextResponse.json({
      success: true,
      risks: inferredRisks,
      overallRisk: inferredRisks.some(r => r.level === '高') ? '高' : 
                   inferredRisks.some(r => r.level === '中') ? '中' : '低',
      keyConcerns: inferredRisks.filter(r => r.level === '高').map(r => r.type).join('、') || '无明显高风险',
      source: 'rule',
    });

  } catch (error: any) {
    console.error('[风险评估] API错误:', error);
    
    // 出错时返回基于规则的风险
    return NextResponse.json({
      success: true,
      risks: defaultRisks,
      overallRisk: '中',
      keyConcerns: '退货风险、季节风险',
      source: 'default',
      error: error.message,
    });
  }
}
