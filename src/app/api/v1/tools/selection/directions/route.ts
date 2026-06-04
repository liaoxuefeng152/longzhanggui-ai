import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 选品方向推荐 API
 * 
 * 与选品分析不同，本接口专注于：
 * - 基于用户需求（市场/平台/类目/预算/诉求）推荐 3-5 个选品方向
 * - 输出严格结构化 JSON，便于前端直接渲染
 * - 每个方向包含：名称、类目、推荐理由、市场潜力评分、竞争度、预估利润率、趋势标签
 */

const DIRECTION_SYSTEM_PROMPT = `你是龙掌柜选品方向推荐专家，专注于东南亚跨境电商市场。

## 你的任务
根据用户提供的需求信息，推荐 3-5 个最适合的选品方向。

## 推荐逻辑
1. 结合目标市场的消费习惯和平台特性
2. 参考近期趋势数据（TikTok热门标签、Shopee/Lazada销量榜）
3. 考虑预算约束和核心诉求（高利润/低竞争/快周转/易操作）
4. 评估供应链可行性（1688是否有充足货源）
5. 规避合规风险高的品类

## 目标市场知识
- 泰国 (TH)：佛教文化、热带气候、注重性价比、LINE社交
- 越南 (VN)：年轻人口多、移动端为主、价格敏感、Zalo社交
- 马来西亚 (MY)：多元文化、英语普及、消费力较强、穆斯林市场
- 印尼 (ID)：人口最大市场、价格敏感、穆斯林为主、社交电商活跃
- 菲律宾 (PH)：英语市场、美式消费偏好、年轻人口多

## 输出格式（必须严格遵守）
直接输出JSON数组，不要包裹在代码块中，不要输出其他文字：
[
  {
    "id": "DIR-1",
    "name": "方向名称（简洁有力，如'智能宠物喂食器'）",
    "category": "所属类目",
    "reason": "推荐理由（30-50字，说明为什么推荐这个方向）",
    "marketPotential": 8.5,
    "competition": "蓝海|中等|红海",
    "avgProfitRate": 35,
    "trending": true,
    "icon": "🐱",
    "keywords": ["关键词1", "关键词2"],
    "riskLevel": "低|中|高",
    "riskNote": "风险提示"
  }
]

字段说明：
- marketPotential: 1-10分，市场潜力评分
- avgProfitRate: 预估平均利润率百分比
- trending: 是否处于上升趋势
- icon: 用一个emoji表示这个方向
- keywords: 这个方向的搜索关键词，用于后续1688搜索
- riskLevel: 整体风险等级
- riskNote: 风险说明（如有）

重要：必须输出合法JSON，不要添加markdown代码块标记。`;

// 预算枚举到金额范围的映射
const budgetMap: Record<string, { label: string; min: number; max: number }> = {
  low: { label: '低预算(≤5美元拿货价)', min: 0, max: 5 },
  medium: { label: '中预算(5-15美元拿货价)', min: 5, max: 15 },
  high: { label: '高预算(15-30美元拿货价)', min: 15, max: 30 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { market, platform, category, budget, core_appeal, avoid_categories } = body;

    const marketNames: Record<string, string> = {
      us: '美国', uk: '英国', id: '印尼', th: '泰国', vn: '越南', my: '马来西亚', ph: '菲律宾',
    };
    const platformNames: Record<string, string> = {
      tiktok: 'TikTok Shop', shopee: 'Shopee', lazada: 'Lazada', amazon: 'Amazon',
    };
    const appealNames: Record<string, string> = {
      high_profit: '高利润', low_competition: '低竞争', fast_turnover: '快周转', easy_operation: '易操作',
    };

    const budgetInfo = budgetMap[budget] || { label: '不限', min: 0, max: 999 };

    const userMessage = `请推荐选品方向：

- 目标市场：${marketNames[market] || market || '不限'}
- 目标平台：${platformNames[platform] || platform || '不限'}
- 类目偏好：${category || '不限'}
- 预算范围：${budgetInfo.label}
- 核心诉求：${appealNames[core_appeal] || core_appeal || '不限'}
${avoid_categories ? `- 规避类目：${avoid_categories}` : ''}

请结合以上需求，推荐3-5个最适合的选品方向。`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: DIRECTION_SYSTEM_PROMPT },
      { role: 'user' as const, content: userMessage },
    ];

    const llmStream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    let fullContent = '';
    for await (const chunk of llmStream) {
      if (chunk.content) {
        fullContent += chunk.content.toString();
      }
    }

    // 解析AI返回的JSON
    let directions = parseDirectionsFromAI(fullContent);

    if (directions.length === 0) {
      // 降级：返回基于市场的默认方向
      directions = getDefaultDirections(market);
    }

    return Response.json({ success: true, directions });
  } catch (error) {
    console.error('Direction recommendation error:', error);
    return Response.json(
      { success: false, error: '方向推荐失败，请重试', directions: getDefaultDirections('id') },
      { status: 500 }
    );
  }
}

/**
 * 从AI输出中解析方向列表
 */
function parseDirectionsFromAI(content: string): any[] {
  try {
    // 尝试1：直接JSON解析
    let jsonStr = content.trim();
    
    // 去掉可能的markdown代码块包裹
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(jsonStr);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, index: number) => ({
        id: item.id || `DIR-${index + 1}`,
        name: item.name || `方向${index + 1}`,
        category: item.category || '综合品类',
        reason: item.reason || '市场需求旺盛',
        marketPotential: Number(item.marketPotential) || 7,
        competition: validateCompetition(item.competition),
        avgProfitRate: Number(item.avgProfitRate) || 30,
        trending: Boolean(item.trending),
        icon: item.icon || '📦',
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        riskLevel: item.riskLevel || '低',
        riskNote: item.riskNote || '',
      }));
    }
  } catch (e) {
    // JSON解析失败，尝试从文本中提取
    console.warn('方向JSON解析失败，尝试文本提取:', (e as Error).message);
  }

  try {
    // 尝试2：从文本中找JSON数组
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, index: number) => ({
          id: item.id || `DIR-${index + 1}`,
          name: item.name || `方向${index + 1}`,
          category: item.category || '综合品类',
          reason: item.reason || '市场需求旺盛',
          marketPotential: Number(item.marketPotential) || 7,
          competition: validateCompetition(item.competition),
          avgProfitRate: Number(item.avgProfitRate) || 30,
          trending: Boolean(item.trending),
          icon: item.icon || '📦',
          keywords: Array.isArray(item.keywords) ? item.keywords : [],
          riskLevel: item.riskLevel || '低',
          riskNote: item.riskNote || '',
        }));
      }
    }
  } catch (e2) {
    console.warn('方向文本提取也失败:', (e2 as Error).message);
  }

  return [];
}

function validateCompetition(val: any): string {
  if (val === '蓝海' || val === '红海' || val === '中等') return val;
  return '中等';
}

function getDefaultDirections(market?: string): any[] {
  const marketName = market === 'th' ? '泰国' : 
                     market === 'vn' ? '越南' : 
                     market === 'my' ? '马来西亚' : 
                     market === 'ph' ? '菲律宾' : 
                     market === 'id' ? '印尼' : '东南亚';
  
  return [
    { id: 'DIR-1', name: '智能宠物用品', category: '宠物用品', reason: `${marketName}宠物市场快速增长，智能化产品需求旺盛`, marketPotential: 8.5, competition: '蓝海', avgProfitRate: 35, trending: true, icon: '🐱', keywords: ['宠物用品', '智能喂食器', '宠物饮水机'], riskLevel: '低', riskNote: '需注意产品安全性' },
    { id: 'DIR-2', name: '家居清洁神器', category: '家居用品', reason: `${marketName}年轻人追求高效便捷的家居生活`, marketPotential: 8.2, competition: '中等', avgProfitRate: 32, trending: true, icon: '🏠', keywords: ['家居清洁', '收纳整理', '厨房工具'], riskLevel: '低', riskNote: '' },
    { id: 'DIR-3', name: '户外运动装备', category: '运动户外', reason: `${marketName}运动风潮兴起，相关品类热度上升`, marketPotential: 7.8, competition: '红海', avgProfitRate: 28, trending: false, icon: '⚽', keywords: ['运动装备', '户外用品', '健身器材'], riskLevel: '中', riskNote: '季节性较强' },
    { id: 'DIR-4', name: '美妆护肤工具', category: '美妆工具', reason: `${marketName}美妆市场持续增长，工具类需求稳定`, marketPotential: 7.5, competition: '中等', avgProfitRate: 40, trending: true, icon: '💄', keywords: ['美妆工具', '化妆刷', '美容仪器'], riskLevel: '中', riskNote: '美妆类目需要相关认证' },
    { id: 'DIR-5', name: '厨房小家电', category: '家电厨电', reason: `${marketName}小户型住宅增多，便携小家电受欢迎`, marketPotential: 7.2, competition: '中等', avgProfitRate: 30, trending: false, icon: '🍳', keywords: ['厨房电器', '小家电', '便携电器'], riskLevel: '中', riskNote: '电器需要CE/FCC认证' },
  ];
}
