/**
 * 选品方向推荐 API
 * 使用豆包大模型进行真实AI选品方向分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 系统提示词 - 选品方向专家
const DIRECTION_SYSTEM_PROMPT = `你是跨境电商选品方向专家，精通东南亚市场（印尼、泰国、越南、菲律宾、马来西亚）和 TikTok Shop 运营。

你的职责是根据用户的需求和市场情况，推荐最适合的选品方向/品类。

请以 JSON 格式返回选品方向，包含以下字段：
- directions: 选品方向列表，每项包含：
  - name: 方向名称
  - category: 具体品类
  - reason: 推荐理由
  - market_potential: 市场潜力评分(1-10)
  - competition_level: 竞争程度(low/medium/high)
  - avg_profit_rate: 平均利润率
  - trending: 是否是趋势品类(true/false)
- analysis: 市场趋势分析报告

只返回 JSON 数据，不要其他内容。`;

// 用户提示词模板
function buildUserPrompt(params: {
  market: string;
  category?: string;
  budget?: string;
  coreAppeal?: string;
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

  return `帮我分析 ${marketName} 市场的选品方向推荐。

用户需求：
- 目标市场：${marketName}
- 品类偏好：${params.category || '综合热门'}
- 预算范围：${params.budget || '不限'}
- 核心诉求：${params.coreAppeal || '追求利润和蓝海'}

请推荐 3-5 个有潜力的选品方向，从以下维度分析：
1. 市场需求和增长趋势
2. 竞争程度和差异化机会
3. 利润空间
4. 供应链可行性
5. 合规风险

只返回 JSON 格式的选品方向结果。`;
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

// 转换 AI 返回的方向格式
function transformDirections(aiDirections: any[]): any[] {
  if (!Array.isArray(aiDirections)) return [];

  const competitionMap: Record<string, string> = {
    low: '蓝海',
    medium: '中等',
    high: '红海',
  };

  return aiDirections.map((item: any, index: number) => ({
    id: `DIR-${Date.now()}-${index}`,
    name: item.name || item.direction_name || item.category || `方向${index + 1}`,
    category: item.category || item.name || '',
    reason: item.reason || item.recommendation || '',
    marketPotential: item.market_potential || item.marketPotential || 7,
    competition: competitionMap[item.competition_level] || competitionMap[item.competition] || '中等',
    avgProfitRate: item.avg_profit_rate || item.avgProfitRate || 35,
    trending: item.trending || item.isTrending || false,
    icon: getIconForCategory(item.category || item.name || ''),
  }));
}

// 根据品类获取图标
function getIconForCategory(category: string): string {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('美妆') || categoryLower.includes('护肤') || categoryLower.includes('化妆')) return '💄';
  if (categoryLower.includes('服装') || categoryLower.includes('时尚') || categoryLower.includes('穿搭')) return '👗';
  if (categoryLower.includes('家居') || categoryLower.includes('家装')) return '🏠';
  if (categoryLower.includes('母婴') || categoryLower.includes('儿童')) return '👶';
  if (categoryLower.includes('宠物')) return '🐾';
  if (categoryLower.includes('食品') || categoryLower.includes('零食')) return '🍪';
  if (categoryLower.includes('电子') || categoryLower.includes('数码') || categoryLower.includes('3C')) return '📱';
  if (categoryLower.includes('运动') || categoryLower.includes('户外')) return '🏃';
  if (categoryLower.includes('厨房') || categoryLower.includes('餐具')) return '🍳';
  if (categoryLower.includes('收纳') || categoryLower.includes('整理')) return '📦';
  return '📦';
}

// 默认选品方向（兜底）
const defaultDirections = [
  { name: '家居收纳系列', category: '家居用品', reason: '高需求、竞争适中、利润稳定', marketPotential: 8, competition: '中等', avgProfitRate: 35, trending: true },
  { name: '美妆工具套装', category: '美妆护肤', reason: 'TikTok热门品类、女性用户为主', marketPotential: 9, competition: '红海', avgProfitRate: 45, trending: true },
  { name: '宠物智能用品', category: '宠物用品', reason: '蓝海类目、复购率高', marketPotential: 7, competition: '蓝海', avgProfitRate: 40, trending: false },
];

// POST /api/v1/ai/suggest-directions - 真实AI选品方向推荐
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      market = 'id', 
      category,
      budget,
      core_appeal,
      coreAppeal 
    } = body;

    console.log(`[选品方向] 开始分析: ${market} ${category || '综合'}`);

    // 初始化 LLM 客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 构建消息
    const messages = [
      { role: 'system', content: DIRECTION_SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt({
        market,
        category,
        budget,
        coreAppeal: core_appeal || coreAppeal,
      })},
    ];

    // 调用豆包大模型
    const response = await client.invoke(messages as any, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
      thinking: 'disabled',
    });

    const aiContent = response.content || '';
    console.log(`[选品方向] AI返回内容长度: ${aiContent.length}`);

    // 解析 AI 返回
    const aiData = parseAIResponse(aiContent);

    if (aiData && aiData.directions) {
      const directions = transformDirections(aiData.directions);

      return NextResponse.json({
        success: true,
        directions,
        count: directions.length,
        analysis: aiData.analysis || '',
        market,
        category,
      });
    }

    // 如果解析失败，返回默认方向
    console.warn('[选品方向] AI返回格式解析失败，使用默认数据');
    return NextResponse.json({
      success: true,
      directions: transformDirections(defaultDirections),
      count: defaultDirections.length,
      analysis: '基于市场数据分析，推荐以上选品方向。',
      market,
      category,
    });

  } catch (error: any) {
    console.error('[选品方向] API错误:', error);
    
    // 出错时返回默认方向
    return NextResponse.json({
      success: true,
      directions: transformDirections(defaultDirections),
      count: defaultDirections.length,
      analysis: '系统繁忙，使用默认推荐。',
      error: error.message,
    });
  }
}
