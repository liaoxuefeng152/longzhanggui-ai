/**
 * 飞书意图识别系统
 * 用于解析用户的自然语言输入，识别用户的意图
 */

import { INTENT_TYPES, INTENT_TEMPLATES } from './config';

/**
 * 意图解析结果
 */
export interface IntentResult {
  intent: string;
  confidence: number;
  params: Record<string, any>;
  originalText: string;
}

/**
 * 提取参数
 */
function extractParams(text: string, intent: string): Record<string, any> {
  const params: Record<string, any> = {};

  // 提取数量
  const quantityMatch = text.match(/(\d+)\s*(个|款|种|件)/);
  if (quantityMatch) {
    params.count = parseInt(quantityMatch[1], 10);
  }

  // 提取类目
  const categoryPatterns = [
    /(?:类目|分类|类别)[:：]\s*([^\s，。]+)/,
    /(?:选品|推荐|上架)\s*([^\s，。]+)/,
  ];

  for (const pattern of categoryPatterns) {
    const match = text.match(pattern);
    if (match) {
      params.category = match[1];
      break;
    }
  }

  // 特殊类目处理
  if (text.includes('3C')) {
    params.category = '3C数码';
  } else if (text.includes('手机配件')) {
    params.category = '3C手机配件';
  } else if (text.includes('宠物')) {
    params.category = '宠物用品';
  } else if (text.includes('美妆')) {
    params.category = '美妆个护';
  } else if (text.includes('家居')) {
    params.category = '家居用品';
  } else if (text.includes('服装')) {
    params.category = '服装鞋帽';
  }

  return params;
}

/**
 * 识别意图
 * @param text 用户输入的文本
 * @returns 意图识别结果
 */
export function recognizeIntent(text: string): IntentResult {
  const trimmedText = text.trim();
  let bestMatch: { intent: string; confidence: number } = {
    intent: INTENT_TYPES.UNKNOWN,
    confidence: 0,
  };

  // 遍历所有意图模板
  for (const [intent, patterns] of Object.entries(INTENT_TEMPLATES)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmedText)) {
        // 计算匹配度（简单的关键词匹配）
        const match = trimmedText.match(pattern);
        const confidence = match ? (match[0].length / trimmedText.length) : 0.5;

        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence: Math.min(confidence, 1) };
        }
      }
    }
  }

  // 提取参数
  const params = extractParams(trimmedText, bestMatch.intent);

  return {
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    params,
    originalText: trimmedText,
  };
}

/**
 * 获取意图描述
 */
export function getIntentDescription(intent: string): string {
  const descriptions: Record<string, string> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: '选品分析 - 帮你选择合适的产品',
    [INTENT_TYPES.PUBLISH_PRODUCTS]: '上架推广 - 上架产品并推广',
    [INTENT_TYPES.CREATE_AD]: '创建广告 - 创建广告计划',
    [INTENT_TYPES.OPTIMIZE_AD]: '优化广告 - 优化广告效果',
    [INTENT_TYPES.CUSTOMER_SERVICE]: '客服服务 - 回复客户消息',
    [INTENT_TYPES.QUERY_SALES]: '查询销量 - 查看销售数据',
    [INTENT_TYPES.QUERY_INVENTORY]: '查询库存 - 查看库存情况',
    [INTENT_TYPES.QUERY_ORDERS]: '查询订单 - 查看订单状态',
    [INTENT_TYPES.QUERY_STATUS]: '查询状态 - 查看系统状态',
    [INTENT_TYPES.HELP]: '帮助 - 查看帮助信息',
    [INTENT_TYPES.UNKNOWN]: '未知意图 - 请重新描述你的需求',
  };

  return descriptions[intent] || '未知意图';
}

/**
 * 生成帮助消息
 */
export function generateHelpMessage(): string {
  return `🤖 **龙虾AI助手使用指南**

**📦 选品相关**
- "帮我选3款3C手机配件的产品"
- "推荐一些爆款产品"
- "选品分析"

**🚀 上架推广**
- "上架产品123"
- "发布新品"
- "上架推广"

**📢 广告管理**
- "创建广告"
- "优化广告"
- "调整广告预算"

**👥 客服服务**
- "回复客户消息"
- "处理退款请求"

**📊 数据查询**
- "今天的销量"
- "库存预警"
- "订单状态"
- "系统状态"

**💡 提示**
- 可以@机器人直接发送指令
- 支持自然语言描述需求
- 系统会自动识别你的意图并执行`;
}

export default {
  recognizeIntent,
  getIntentDescription,
  generateHelpMessage,
  extractParams,
};
