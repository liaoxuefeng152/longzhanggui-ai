/**
 * 飞书智能助理 - 增强版意图识别
 * 规则优先 + LLM 增强 + 上下文感知
 */

import { INTENT_TYPES } from './config';
import { getOrCreateContext } from './conversation';

// 意图解析结果
export interface IntentResult {
  intent: string;
  confidence: number;
  params: Record<string, any>;
  originalText: string;
  needClarification: boolean;
  clarificationQuestion?: string;
  fromContext?: boolean;  // 是否从上下文推断
}

// 核心业务词优先级（这些词必须被正确识别）
const CORE_KEYWORDS: { keywords: string[]; intent: string }[] = [
  // 选品相关 - 最高优先级
  { keywords: ['选品', '帮我选', '选几款', '选什么'], intent: INTENT_TYPES.SELECT_PRODUCTS },
  
  // 图片处理
  { keywords: ['翻译图片', '图片翻译', '去水印', '图片去水印', '白底图', '生成白底'], intent: INTENT_TYPES.PROCESS_IMAGE },
  
  // TikTok视频
  { keywords: ['TikTok视频', '生成视频', '制作视频', '生成TikTok'], intent: INTENT_TYPES.GENERATE_VIDEO },
  
  // 智能定价
  { keywords: ['智能定价', '计算定价', '算价格', '定价建议'], intent: INTENT_TYPES.CALCULATE_PRICE },
  
  // 新品上架
  { keywords: ['上架', '新品上架', '发布商品', '发布产品'], intent: INTENT_TYPES.PUBLISH_PRODUCT },
  
  // 链接采集
  { keywords: ['采集链接', '采集商品', '抓取链接', '1688采集'], intent: INTENT_TYPES.COLLECT_LINKS },
  
  // Listing优化
  { keywords: ['优化listing', '优化标题', '优化描述', 'listing优化'], intent: INTENT_TYPES.OPTIMIZE_LISTING },
];

// 意图互斥组（同一组内的意图不能同时存在）
const MUTUALLY_EXCLUSIVE_GROUPS = [
  [INTENT_TYPES.SELECT_PRODUCTS, INTENT_TYPES.GENERATE_COPY, INTENT_TYPES.CREATE_AD],
  [INTENT_TYPES.QUERY_DAILY, INTENT_TYPES.QUERY_INVENTORY, INTENT_TYPES.QUERY_ORDERS, INTENT_TYPES.QUERY_SALES],
];

/**
 * 核心关键词匹配（最高优先级）
 */
function matchCoreKeywords(text: string): { intent: string; confidence: number } | null {
  const lowerText = text.toLowerCase();
  
  for (const { keywords, intent } of CORE_KEYWORDS) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return { intent, confidence: 0.95 };
      }
    }
  }
  
  return null;
}

/**
 * 检查文本是否包含意图相关关键词
 */
function hasIntentKeywords(text: string, intent: string): boolean {
  const lowerText = text.toLowerCase();
  
  const intentKeywords: Record<string, string[]> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: ['选品', '选款', '选', '爆款', '推荐产品'],
    [INTENT_TYPES.GENERATE_COPY]: ['文案', '写消息', '催好评', '好评'],
    [INTENT_TYPES.CREATE_AD]: ['广告', '推广', '投放'],
    [INTENT_TYPES.QUERY_DAILY]: ['今天', '今日', '运营', '日'],
    [INTENT_TYPES.QUERY_INVENTORY]: ['库存', '存货', '还剩'],
    [INTENT_TYPES.QUERY_ORDERS]: ['订单', '物流', '快递'],
    [INTENT_TYPES.QUERY_SALES]: ['销量', '销售', '业绩'],
    [INTENT_TYPES.PROCESS_IMAGE]: ['图片', '图'],
    [INTENT_TYPES.GENERATE_VIDEO]: ['视频', 'tiktok'],
    [INTENT_TYPES.CALCULATE_PRICE]: ['价格', '定价', '售价'],
    [INTENT_TYPES.PUBLISH_PRODUCT]: ['上架', '发布', '发布商品'],
    [INTENT_TYPES.COLLECT_LINKS]: ['采集', '链接', '抓取'],
    [INTENT_TYPES.OPTIMIZE_LISTING]: ['listing', '标题', '描述'],
  };
  
  const keywords = intentKeywords[intent] || [];
  return keywords.some(k => lowerText.includes(k.toLowerCase()));
}

/**
 * 规则识别（第二优先级）
 */
function recognizeByRules(text: string, context?: any): IntentResult {
  const trimmedText = text.trim().toLowerCase();

  // 问候语
  if (/^(你好|hi|hello|嗨|hey)/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.GREETING,
      confidence: 0.95,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 帮助
  if (/帮助|功能|怎么用|有什么|命令|菜单/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.HELP,
      confidence: 0.95,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 选品（精确匹配）
  if (/^选品$|^选品\s/.test(trimmedText) || /选品/.test(trimmedText)) {
    const params = extractParamsFromText(text);
    return {
      intent: INTENT_TYPES.SELECT_PRODUCTS,
      confidence: 0.9,
      params,
      originalText: text,
      needClarification: !params.category,
      clarificationQuestion: '请问您想选哪个品类的商品呢？比如：宠物用品、3C产品、家居用品等',
    };
  }

  // 日报/今日情况
  if (/今天.*运营|今日.*运营|运营.*今天|运营.*今日/.test(trimmedText) || 
      (/今天|今日/.test(trimmedText) && /怎么|如何|情况|样/.test(trimmedText))) {
    return {
      intent: INTENT_TYPES.QUERY_DAILY,
      confidence: 0.85,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 库存
  if (/库存|还剩多少|不足|缺货/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.QUERY_INVENTORY,
      confidence: 0.85,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 订单
  if (/订单|查.*订单|订单.*到/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.QUERY_ORDERS,
      confidence: 0.85,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 销售
  if (/销售|销量|卖了|业绩/.test(trimmedText) && !/选品/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.QUERY_SALES,
      confidence: 0.8,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 文案生成（必须有明确的文案相关词）
  if (/文案|写.*消息|催好评|回复.*客户/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.GENERATE_COPY,
      confidence: 0.85,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 广告
  if (/广告|推广|创建.*计划/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.CREATE_AD,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: false,
    };
  }

  // 报告
  if (/报告|报表|生成.*日[报周]/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.GENERATE_REPORT,
      confidence: 0.85,
      params: {},
      originalText: text,
      needClarification: false,
    };
  }

  // 图片处理
  if (/图片/.test(trimmedText) && /处理|翻译|去水印/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.PROCESS_IMAGE,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: true,
      clarificationQuestion: '请发送需要处理的图片',
    };
  }

  // TikTok视频
  if (/视频|tiktok|tiktok/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.GENERATE_VIDEO,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: true,
      clarificationQuestion: '请告诉我视频要展示什么内容',
    };
  }

  // 智能定价
  if (/定价|价格|算.*价格/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.CALCULATE_PRICE,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: true,
      clarificationQuestion: '请提供商品的成本价格',
    };
  }

  // 新品上架
  if (/上架|发布商品/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.PUBLISH_PRODUCT,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: true,
      clarificationQuestion: '请告诉我需要上架的商品',
    };
  }

  // 链接采集
  if (/采集|抓取/.test(trimmedText) && /链接|商品/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.COLLECT_LINKS,
      confidence: 0.8,
      params: {},
      originalText: text,
      needClarification: true,
      clarificationQuestion: '请发送需要采集的商品链接',
    };
  }

  // Listing优化
  if (/listing|标题|描述/.test(trimmedText)) {
    return {
      intent: INTENT_TYPES.OPTIMIZE_LISTING,
      confidence: 0.8,
      params: extractParamsFromText(text),
      originalText: text,
      needClarification: true,
      clarificationQuestion: '请提供需要优化的Listing内容',
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
 * 从上下文推断意图
 */
function inferFromContext(text: string, context: any): IntentResult | null {
  if (!context || !context.messages || context.messages.length === 0) {
    return null;
  }

  const lowerText = text.toLowerCase();
  
  // 如果用户只回复"好的"、"可以"、"继续"等
  if (/^(好的|可以|行|好|嗯|ok|继续)/.test(lowerText)) {
    // 从上文中找到最近的明确意图
    const recentMessages = context.messages.slice(-4);
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      if (msg.intent && msg.intent !== INTENT_TYPES.UNKNOWN) {
        return {
          intent: msg.intent,
          confidence: 0.7,
          params: context.lastParams || {},
          originalText: text,
          needClarification: true,
          clarificationQuestion: `您确认要继续执行"${getIntentName(msg.intent)}"吗？`,
          fromContext: true,
        };
      }
    }
  }

  // 如果用户提到"这个"或"刚才"，引用上文
  if (/^(这个|那个|刚才)/.test(lowerText)) {
    const recentMessages = context.messages.slice(-4);
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      if (msg.intent && msg.intent !== INTENT_TYPES.UNKNOWN) {
        return {
          intent: msg.intent,
          confidence: 0.6,
          params: context.lastParams || {},
          originalText: text,
          needClarification: true,
          clarificationQuestion: '请提供更多详情',
          fromContext: true,
        };
      }
    }
  }

  return null;
}

/**
 * 获取意图名称
 */
function getIntentName(intent: string): string {
  const names: Record<string, string> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: '选品分析',
    [INTENT_TYPES.GENERATE_COPY]: '文案生成',
    [INTENT_TYPES.QUERY_DAILY]: '运营日报',
    [INTENT_TYPES.QUERY_INVENTORY]: '库存查询',
    [INTENT_TYPES.QUERY_ORDERS]: '订单查询',
    [INTENT_TYPES.QUERY_SALES]: '销售查询',
    [INTENT_TYPES.PROCESS_IMAGE]: '图片处理',
    [INTENT_TYPES.GENERATE_VIDEO]: '视频生成',
    [INTENT_TYPES.CALCULATE_PRICE]: '智能定价',
    [INTENT_TYPES.PUBLISH_PRODUCT]: '新品上架',
    [INTENT_TYPES.COLLECT_LINKS]: '链接采集',
    [INTENT_TYPES.OPTIMIZE_LISTING]: 'Listing优化',
    [INTENT_TYPES.CREATE_AD]: '创建广告',
  };
  return names[intent] || intent;
}

/**
 * 从文本中提取参数
 */
function extractParamsFromText(text: string): Record<string, any> {
  const params: Record<string, any> = {};

  // 提取数量
  const countMatch = text.match(/(\d+)\s*(款|个|种|件)/);
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

  // 提取链接
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    params.url = urlMatch[0];
  }

  return params;
}

/**
 * LLM 增强识别（用于参数提取和复杂意图）
 */
async function enhanceWithLLM(text: string, rulesResult: IntentResult): Promise<IntentResult> {
  // 如果规则识别置信度已经很高，直接返回
  if (rulesResult.confidence >= 0.85) {
    return rulesResult;
  }

  // 如果是明确的核心业务词，不依赖 LLM
  const coreMatch = matchCoreKeywords(text);
  if (coreMatch) {
    return {
      ...rulesResult,
      intent: coreMatch.intent,
      confidence: coreMatch.confidence,
    };
  }

  // 对于模糊输入，尝试 LLM 辅助
  try {
    const { Config, LLMClient } = await import('coze-coding-dev-sdk');
    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是跨境电商智能运营助理的意图识别专家。
用户输入后，判断最可能的意图。

支持意图：选品(select_products)、日报(query_daily)、库存(query_inventory)、
订单(query_orders)、销量(query_sales)、文案(copywriting)、广告(create_ad)、
图片处理(process_image)、视频生成(generate_video)、定价(calculate_price)、
上架(publish_product)、采集(collect_links)、Listing优化(optimize_listing)

只输出JSON：{"intent":"意图","confidence":0.0-1.0}`;

    const response = await client.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ], {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.1,
    });

    const llmResult = JSON.parse(response.content);
    
    // 校验 LLM 结果：如果与规则结果不一致，检查关键词匹配
    if (llmResult.intent !== rulesResult.intent) {
      // 如果规则中有匹配的关键词，优先信任规则
      if (hasIntentKeywords(text, rulesResult.intent)) {
        return rulesResult;
      }
      // 否则信任 LLM（但置信度要打折）
      return {
        ...rulesResult,
        intent: llmResult.intent,
        confidence: Math.min(llmResult.confidence * 0.8, 0.7),
      };
    }

    return rulesResult;
  } catch (error) {
    console.error('[Intent] LLM增强失败:', error);
    return rulesResult;
  }
}

/**
 * 识别意图（主入口）
 */
export async function recognizeIntent(
  text: string, 
  userId?: string, 
  chatId?: string
): Promise<IntentResult> {
  
  // 1. 先获取上下文
  let context = null;
  if (userId && chatId) {
    context = getOrCreateContext(userId, chatId);
  }

  // 2. 核心关键词匹配（最高优先级）
  const coreMatch = matchCoreKeywords(text);
  if (coreMatch) {
    console.log(`[Intent] 核心关键词匹配: ${coreMatch.intent}`);
    const params = extractParamsFromText(text);
    
    // 选品：如果没有指定品类，使用默认品类"热门"，直接执行
    if (coreMatch.intent === INTENT_TYPES.SELECT_PRODUCTS && !params.category) {
      params.category = '热门商品';
    }
    
    // 检查是否需要追问（缺少关键信息如链接、图片等）
    const needsClarification = checkNeedsClarification(coreMatch.intent, params);
    
    return {
      intent: coreMatch.intent,
      confidence: coreMatch.confidence,
      params,
      originalText: text,
      needClarification: needsClarification,
      clarificationQuestion: needsClarification ? getClarificationQuestion(coreMatch.intent) : undefined,
    };
  }

  // 3. 从上下文推断
  if (context) {
    const contextResult = inferFromContext(text, context);
    if (contextResult) {
      console.log(`[Intent] 从上下文推断: ${contextResult.intent}`);
      return contextResult;
    }
  }

  // 4. 规则识别
  const rulesResult = recognizeByRules(text, context);
  
  // 选品：如果没有指定品类，使用默认品类"热门"，直接执行
  if (rulesResult.intent === INTENT_TYPES.SELECT_PRODUCTS && !rulesResult.params.category) {
    rulesResult.params.category = '热门商品';
    rulesResult.needClarification = false;
    rulesResult.clarificationQuestion = undefined;
  }
  
  // 5. LLM 增强（仅用于模糊输入）
  if (rulesResult.confidence < 0.8) {
    const enhancedResult = await enhanceWithLLM(text, rulesResult);
    return enhancedResult;
  }

  return rulesResult;
}

/**
 * 检查是否需要追问
 * 某些意图需要用户提供额外信息（如链接、图片等）才需要追问
 */
function checkNeedsClarification(intent: string, params: Record<string, any>): boolean {
  // 需要追问的意图类型（需要用户提供链接、图片等）
  const needsDetailsIntents = [
    INTENT_TYPES.PROCESS_IMAGE,
    INTENT_TYPES.GENERATE_VIDEO,
    INTENT_TYPES.CALCULATE_PRICE,
    INTENT_TYPES.PUBLISH_PRODUCT,
    INTENT_TYPES.COLLECT_LINKS,
    INTENT_TYPES.OPTIMIZE_LISTING,
  ];
  
  // 这些意图需要追问
  if (needsDetailsIntents.includes(intent as any)) {
    return true;
  }
  
  // 其他意图默认不需要追问
  return false;
}

/**
 * 获取追问问题
 */
function getClarificationQuestion(intent: string): string {
  const questions: Record<string, string> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: '请问您想选哪个品类的商品呢？比如：宠物用品、3C产品、家居用品等',
    [INTENT_TYPES.PROCESS_IMAGE]: '请发送需要处理的图片',
    [INTENT_TYPES.GENERATE_VIDEO]: '请告诉我视频要展示什么内容，或者发送商品图片',
    [INTENT_TYPES.CALCULATE_PRICE]: '请提供商品的成本价格',
    [INTENT_TYPES.PUBLISH_PRODUCT]: '请告诉我需要上架的商品名称或上传商品链接',
    [INTENT_TYPES.COLLECT_LINKS]: '请发送需要采集的商品链接',
    [INTENT_TYPES.OPTIMIZE_LISTING]: '请提供需要优化的Listing内容或商品链接',
  };
  return questions[intent] || '请提供更多信息';
}

/**
 * 获取意图描述
 */
export function getIntentDescription(intent: string): string {
  const descriptions: Record<string, string> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: '选品分析',
    [INTENT_TYPES.PUBLISH_PRODUCT]: '新品上架',
    [INTENT_TYPES.CREATE_AD]: '创建广告',
    [INTENT_TYPES.OPTIMIZE_AD]: '优化广告',
    [INTENT_TYPES.QUERY_SALES]: '销售查询',
    [INTENT_TYPES.QUERY_INVENTORY]: '库存查询',
    [INTENT_TYPES.QUERY_ORDERS]: '订单查询',
    [INTENT_TYPES.QUERY_DAILY]: '运营日报',
    [INTENT_TYPES.PROCESS_IMAGE]: '图片处理',
    [INTENT_TYPES.GENERATE_VIDEO]: '视频生成',
    [INTENT_TYPES.CALCULATE_PRICE]: '智能定价',
    [INTENT_TYPES.COLLECT_LINKS]: '链接采集',
    [INTENT_TYPES.OPTIMIZE_LISTING]: 'Listing优化',
    [INTENT_TYPES.GENERATE_COPY]: '文案生成',
    [INTENT_TYPES.GENERATE_REPORT]: '报表生成',
    [INTENT_TYPES.GREETING]: '问候',
    [INTENT_TYPES.HELP]: '帮助',
    [INTENT_TYPES.UNKNOWN]: '未知意图',
  };
  return descriptions[intent] || intent;
}

/**
 * 生成帮助消息
 */
export function generateHelpMessage(): string {
  return `🤖 **龙掌柜运营助理使用指南**

**核心功能**

📦 **选品分析**
• "帮我选3款宠物用品"
• "推荐几款3C产品"

📊 **运营查询**
• "今天运营情况怎么样？"
• "哪些商品库存不足？"

🖼️ **图片处理**
• "翻译这张图片"
• "生成白底图"

🎬 **视频生成**
• "生成一个TikTok视频"
• "制作产品展示视频"

💰 **智能定价**
• "帮我计算这个产品的定价"

📝 **Listing优化**
• "优化一下这个listing"
• "优化商品标题"

🔗 **链接采集**
• "采集这个1688链接"

📢 **文案生成**
• "写一个催好评的消息"
• "生成差评回复话术"

---
回复数字选择功能，或直接描述您的需求！`;
}
