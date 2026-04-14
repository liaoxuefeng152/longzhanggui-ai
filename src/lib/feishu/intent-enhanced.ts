/**
 * 飞书智能助理 - 增强版意图识别
 * 支持 LLM + 规则混合识别
 */

import { NextRequest } from 'next/server';
import { Config, LLMClient } from 'coze-coding-dev-sdk';
import { INTENT_TYPES } from './config';

// 意图解析结果
export interface IntentResult {
  intent: string;
  confidence: number;
  params: Record<string, any>;
  originalText: string;
  needClarification: boolean;
  clarificationQuestion?: string;
}

// 系统提示词
const SYSTEM_PROMPT = `你是一个跨境电商智能运营助理的意图识别专家。

## 你的任务
分析用户的自然语言输入，识别用户的意图并提取关键参数。

## 支持的意图类型
1. **select_products** - 选品：帮用户选择合适的产品，如"帮我选3款宠物用品"
2. **query_daily** - 运营日报：查询今日运营数据，如"今天运营情况怎么样？"
3. **query_inventory** - 库存查询：查询商品库存，如"哪个商品库存低了？"
4. **query_orders** - 订单查询：查询订单状态，如"订单123到哪里了？"
5. **query_sales** - 销售查询：查询销售数据，如"本周销售怎么样？"
6. **generate_copy** - 文案生成：生成营销文案，如"写一个催好评的消息"
7. **create_ad** - 创建广告：创建广告计划，如"创建一个广告"
8. **optimize_listing** - Listing优化：优化商品 listing，如"帮我优化一下这个listing"
9. **analyze_competition** - 竞品分析：分析竞品，如"分析一下竞品价格"
10. **generate_report** - 报表生成：生成数据报表，如"生成今日日报"
11. **help** - 帮助：查看帮助，如"你有什么功能？"
12. **greeting** - 问候：打招呼，如"你好"
13. **unknown** - 未知意图：无法识别的意图

## 输出格式
请严格按以下JSON格式输出，不要添加任何其他内容：
{
  "intent": "意图类型",
  "confidence": 0.0-1.0,
  "params": {
    "count": 数量（如3款）,
    "category": 商品品类（如宠物用品、3C产品）,
    "productName": 商品名称,
    "platform": 平台（如Shopee、Lazada）,
    "orderId": 订单号,
    "keywords": 关键词
  },
  "needClarification": true或false,
  "clarificationQuestion": "如果需要追问，填写追问内容"
}

## 示例
- 输入："帮我选3款宠物用品"
- 输出：{"intent":"select_products","confidence":0.95,"params":{"count":3,"category":"宠物用品"},"needClarification":false}

- 输入："帮我选品"
- 输出：{"intent":"select_products","confidence":0.8,"params":{},"needClarification":true,"clarificationQuestion":"请问您想选哪个品类的商品呢？比如：宠物用品、3C产品、家居用品等"}

- 输入："今天怎么样"
- 输出：{"intent":"query_daily","confidence":0.9,"params":{},"needClarification":false}`;

/**
 * 使用 LLM 进行意图识别
 */
async function recognizeIntentByLLM(text: string): Promise<IntentResult> {
  try {
    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: text },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.1,
    });

    const result = JSON.parse(response.content);

    return {
      intent: result.intent || INTENT_TYPES.UNKNOWN,
      confidence: result.confidence || 0,
      params: result.params || {},
      originalText: text,
      needClarification: result.needClarification || false,
      clarificationQuestion: result.clarificationQuestion,
    };
  } catch (error) {
    console.error('[Intent] LLM识别失败，降级到规则识别:', error);
    return fallbackToRules(text);
  }
}

/**
 * 规则兜底识别
 */
function fallbackToRules(text: string): IntentResult {
  const trimmedText = text.trim().toLowerCase();

  // 问候语
  if (/^(你好|hi|hello|嗨|hey)/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.GREETING,
      confidence: 0.9,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 帮助
  if (/帮助|功能|怎么用|有什么|命令/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.HELP,
      confidence: 0.9,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 选品
  if (/选品|选.*款|推荐.*商品|帮我选/.test(trimmedText)) {
    const params = extractParamsFromText(text);
    return {
      intent: INTENT_TYPES.SELECT_PRODUCTS,
      confidence: 0.7,
      params,
      originalText: text,
      needClarification: !params.category,
      clarificationQuestion: '请问您想选哪个品类的商品呢？',
    };
  }

  // 日报/今日情况
  if (/今天|今日|日[报情况]|怎么样/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.QUERY_DAILY,
      confidence: 0.8,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 库存
  if (/库存|还剩多少|不足/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.QUERY_INVENTORY,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 订单
  if (/订单|查.*订单|订单.*到/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.QUERY_ORDERS,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 销售
  if (/销售|销量|卖了|本周|月/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.QUERY_SALES,
      confidence: 0.7,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 文案生成
  if (/写.*消息|文案|催好评|回复.*客户/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.GENERATE_COPY,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 广告
  if (/广告|推广|创建.*计划/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.CREATE_AD,
      confidence: 0.7,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 报告
  if (/报告|报表|生成.*日[报周]/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.GENERATE_REPORT,
      confidence: 0.8,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 未知
  return {
    intent: INTENT_TYPES.UNKNOWN,
    confidence: 0,
    params: {},
    originalText: text,
    needClarification: false,
  };
}

/**
 * 从文本中提取参数
 */
function extractParamsFromText(text: string): Record<string, any> {
  const params: Record<string, any> = {};

  // 提取数量
  const countMatch = text.match(/(\d+)\s*(款|个|种|件|个)/);
  if (countMatch) {
    params.count = parseInt(countMatch[1], 10);
  }

  // 提取品类
  const categories: [RegExp, string][] = [
    [/宠物[用物]*/, '宠物用品'],
    [/3c|3C/, '3C数码'],
    [/手机配件/, '3C手机配件'],
    [/美妆|化妆品/, '美妆个护'],
    [/家居/, '家居用品'],
    [/服装|衣服/, '服装鞋帽'],
    [/母婴| baby|baby/, '母婴用品'],
    [/厨房/, '厨房用品'],
    [/运动/, '运动户外'],
    [/玩具/, '玩具'],
  ];

  for (const [pattern, category] of categories) {
    if (pattern.test(text)) {
      params.category = category;
      break;
    }
  }

  return params;
}

/**
 * 识别意图（主入口）
 * 优先使用 LLM，失败时降级到规则
 */
export async function recognizeIntent(text: string): Promise<IntentResult> {
  // 先尝试 LLM
  const result = await recognizeIntentByLLM(text);

  // 如果 LLM 置信度太低，降级到规则
  if (result.confidence < 0.5) {
    return fallbackToRules(text);
  }

  return result;
}

/**
 * 获取意图描述
 */
export function getIntentDescription(intent: string): string {
  const descriptions: Record<string, string> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: '选品分析',
    [INTENT_TYPES.QUERY_DAILY]: '运营日报',
    [INTENT_TYPES.QUERY_INVENTORY]: '库存查询',
    [INTENT_TYPES.QUERY_ORDERS]: '订单查询',
    [INTENT_TYPES.QUERY_SALES]: '销售查询',
    [INTENT_TYPES.GENERATE_COPY]: '文案生成',
    [INTENT_TYPES.CREATE_AD]: '创建广告',
    [INTENT_TYPES.OPTIMIZE_LISTING]: 'Listing优化',
    [INTENT_TYPES.ANALYZE_COMPETITION]: '竞品分析',
    [INTENT_TYPES.GENERATE_REPORT]: '报表生成',
    [INTENT_TYPES.HELP]: '帮助',
    [INTENT_TYPES.GREETING]: '问候',
    [INTENT_TYPES.UNKNOWN]: '未知意图',
  };

  return descriptions[intent] || '未知意图';
}

/**
 * 生成帮助消息
 */
export function generateHelpMessage(): string {
  return `🤖 **龙掌柜智能运营助理**

我是您的智能运营助手，可以帮您完成以下操作：

**📊 数据查询**
• "今天运营情况怎么样？" - 查看今日数据
• "哪些商品库存不足？" - 库存预警
• "本周销售数据如何？" - 销售汇总

**🎯 智能选品**
• "帮我选3款宠物用品" - AI智能选品
• "推荐一些热销品" - 热卖商品

**✍️ 文案生成**
• "写一个催好评的消息" - 自动生成
• "帮我写产品描述" - Listing优化

**📈 广告管理**
• "帮我创建广告计划" - 智能投放
• "分析广告效果" - ROI分析

**📋 报表生成**
• "生成今日日报" - 自动汇总
• "本周数据报告" - 周报生成

有什么可以帮您的？
`;
}
