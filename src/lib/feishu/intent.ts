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
    
    // 智能助理 - 日常问询
    [INTENT_TYPES.DAILY_REPORT]: '运营日报 - 今日运营数据汇总',
    [INTENT_TYPES.TOP_PRODUCTS]: 'TOP商品 - 热销商品排行',
    [INTENT_TYPES.AD_SUMMARY]: '广告汇总 - 广告消耗统计',
    [INTENT_TYPES.SERVICE_QUALITY]: '服务质量 - 好评率统计',
    [INTENT_TYPES.COMPARISON]: '对比分析 - 数据对比分析',
    [INTENT_TYPES.TREND]: '环比分析 - 趋势分析',
    
    // 智能助理 - 分析建议
    [INTENT_TYPES.PRICING_ADVICE]: '定价建议 - 智能定价建议',
    [INTENT_TYPES.COMPETITOR_ANALYSIS]: '竞品分析 - 竞品价格监控',
    [INTENT_TYPES.ROI_ANALYSIS]: 'ROI分析 - 投入产出分析',
    [INTENT_TYPES.SLOW_SELLING]: '滞销分析 - 滞销商品诊断',
    
    // 智能助理 - 文案生成
    [INTENT_TYPES.COPYWRITING]: '文案生成 - 生成营销文案',
    [INTENT_TYPES.REVIEW_REPLY]: '催好评 - 生成催好评消息',
    [INTENT_TYPES.BAD_REVIEW_REPLY]: '差评回复 - 生成差评回复话术',
    
    // 智能助理 - 报表生成
    [INTENT_TYPES.REPORT_GENERATION]: '报表生成 - 生成数据报表',
    [INTENT_TYPES.EXPORT_DATA]: '导出数据 - 导出数据文件',
    
    [INTENT_TYPES.HELP]: '帮助 - 查看帮助信息',
    [INTENT_TYPES.UNKNOWN]: '未知意图 - 请重新描述你的需求',
  };

  return descriptions[intent] || '未知意图';
}

/**
 * 生成帮助消息
 */
export function generateHelpMessage(): string {
  return `🤖 **龙掌柜运营助理使用指南**

**📊 数据查询类**
- "今天运营情况怎么样？"
- "这周卖得最好的产品是什么？"
- "哪些商品库存低于10件了？"
- "今天广告花了多少钱？"
- "今天好评率是多少？"

**📈 分析建议类**
- "帮我分析一下这个新品要不要上？"
- "这个产品应该定什么价格？"
- "为什么今天订单比昨天少了？"
- "和上周对比，增长了多少？"

**✍️ 文案生成类**
- "帮我写一个催好评的消息"
- "帮我写一个回复差评的话术"
- "帮我生成产品描述"

**📋 报表生成类**
- "生成今日日报"
- "导出本周数据"
- "生成运营月报"

**📦 执行任务类**
- "帮我选3款宠物用品"
- "上架商品A到TK"
- "创建广告计划"

发送以上指令，我会帮你自动执行或生成对应内容！`;
}

export default {
  recognizeIntent,
  getIntentDescription,
  generateHelpMessage,
  extractParams,
};
