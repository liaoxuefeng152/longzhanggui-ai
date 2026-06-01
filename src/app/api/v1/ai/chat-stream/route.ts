import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 龙掌柜智能运营助手 - 流式聊天 API
 * 
 * 功能：
 * - 多轮对话（保留最近20轮）
 * - 意图识别和路由
 * - 流式输出
 */

// 意图类型
type IntentType = 
  | 'product_selection'    // 选品分析
  | 'product_scrape'       // 商品采集
  | 'image_design'         // 图片设计
  | 'video_generation'     // 视频生成
  | 'listing_optimize'     // Listing优化
  | 'pricing'              // 定价计算
  | 'profit_analysis'      // 利润分析
  | 'ad_optimization'      // 广告优化
  | 'customer_service'     // 客服回复
  | 'compliance_check'     // 合规检查
  | 'data_analysis'        // 数据分析
  | 'general_chat';        // 通用对话

// 会话存储（生产环境应使用Redis）
const sessionStore = new Map<string, { messages: Array<{role: string, content: string}> }>();

// 免费体验次数限制（基于IP + 时间窗口）
const FREE_CHAT_LIMIT = 10; // 每个IP每天免费10次
const ipUsageStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const usage = ipUsageStore.get(ip);
  
  // 如果没有记录或已过期（24小时窗口），重置
  if (!usage || now >= usage.resetAt) {
    const resetAt = now + 24 * 60 * 60 * 1000; // 24小时后重置
    ipUsageStore.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: FREE_CHAT_LIMIT - 1, resetAt };
  }
  
  // 检查是否超限
  if (usage.count >= FREE_CHAT_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: usage.resetAt };
  }
  
  // 增加计数
  usage.count++;
  return { allowed: true, remaining: FREE_CHAT_LIMIT - usage.count, resetAt: usage.resetAt };
}

function getClientIP(request: NextRequest): string {
  // 优先从代理头获取真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

// 系统提示词
const SYSTEM_PROMPT = `你是龙掌柜智能运营助手，专为跨境电商卖家提供一站式运营服务。

## 你的核心能力

### 1. 选品分析 🎯
- 市场趋势分析
- 竞品研究
- 蓝海类目挖掘
- 选品报告生成

### 2. 商品采集 📦
- 支持1688、淘宝、天猫、京东、拼多多
- 单个/批量商品采集
- 商品信息提取

### 3. 图片/视频设计 🎨
- 商品主图生成
- 生活场景图
- AI视频生成

### 4. Listing优化 📝
- 标题生成与优化
- 五点描述
- SEO关键词
- 多语言支持（英文/印尼语/泰语/越南语/马来语）

### 5. 智能定价 💰
- 保本价计算
- 利润空间验证
- 价格策略建议

### 6. 广告优化 📊
- ROI/ACOS分析
- 智能出价建议
- 广告效果优化

### 7. 客服支持 💬
- 多语言客服回复
- 订单/物流查询
- 售后纠纷处理

### 8. 数据复盘 📈
- 流量分析
- 转化分析
- 利润分析

## 回复风格
- 专业、简洁、实用
- 使用Markdown格式
- 提供可执行的建议
- 必要时引导用户到系统对应功能模块

## 特殊指令
- 当用户需要选品时，提供详细的市场分析和建议
- 当用户需要定价时，提醒考虑成本、物流、佣金等因素
- 当用户需要客服回复时，生成专业、友好的回复模板`;

// 意图识别关键词
const INTENT_KEYWORDS: Record<IntentType, string[]> = {
  product_selection: ['选品', '爆款', '热卖', '趋势', '蓝海', '类目', '竞品分析', '市场分析', '推荐产品'],
  product_scrape: ['采集', '爬取', '抓取', '1688', '淘宝', '京东', '拼多多', 'teum', '商品信息'],
  image_design: ['图片', '主图', '场景图', '白底', '抠图', '图片处理', '图片翻译'],
  video_generation: ['视频', '视频生成', '产品视频', '展示视频', '短视频'],
  listing_optimize: ['listing', '标题', '描述', '五点', '关键词', 'seo', '文案', '优化'],
  pricing: ['定价', '价格', '利润', '成本', '售价', '保本', '利润率'],
  profit_analysis: ['利润分析', '盈亏', '成本分析', '利润报表', '每日利润'],
  ad_optimization: ['广告', 'roi', 'acos', '投放', '推广', '出价', 'campaign'],
  customer_service: ['客服', '回复', '消息', '差评', '纠纷', '退款', '退货', '售后'],
  compliance_check: ['合规', '风险', '违规', '检查', '体检', '封店'],
  data_analysis: ['数据', '报表', '分析', '日报', '周报', '复盘', '统计'],
  general_chat: []
};

// 识别意图
function recognizeIntent(message: string): IntentType {
  const lowerMessage = message.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'general_chat') continue;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return intent as IntentType;
      }
    }
  }
  
  return 'general_chat';
}

// 获取意图专属提示词
function getIntentPrompt(intent: IntentType): string {
  const prompts: Record<IntentType, string> = {
    product_selection: `
## 当前任务：选品分析
请按以下结构回复：
1. **市场趋势**：分析当前市场趋势
2. **推荐方向**：提供3-5个选品方向
3. **风险评估**：指出潜在风险
4. **行动建议**：给出具体可执行的下一步

如果用户提供了具体需求（如目标市场、预算），请针对性地分析。`,
    
    product_scrape: `
## 当前任务：商品采集
请引导用户提供：
1. 商品链接（支持1688、淘宝等平台）
2. 采集需求（基本信息/详细信息/批量采集）

如果用户提供了链接，请分析该商品的基本信息。`,
    
    image_design: `
## 当前任务：图片设计
请了解用户需求：
1. 图片类型（主图/场景图/信息图）
2. 目标平台（Shopee/Lazada/TikTok/Amazon）
3. 特殊要求（白底/翻译/尺寸）

提供专业的图片设计建议。`,
    
    video_generation: `
## 当前任务：视频生成
请了解用户需求：
1. 视频类型（展示视频/解说视频/短视频）
2. 视频时长
3. 产品特点

提供视频创意和脚本建议。`,
    
    listing_optimize: `
## 当前任务：Listing优化
请按以下步骤处理：
1. 了解产品基本信息
2. 目标站点/语言
3. 优化目标（标题/描述/关键词）

输出专业的Listing内容。`,
    
    pricing: `
## 当前任务：智能定价
请收集以下信息：
1. 采购成本
2. 目标平台和站点
3. 物流方式
4. 预期利润率

使用公式：售价 = (成本 + 物流 + 佣金 + 广告费) / (1 - 利润率)`,
    
    profit_analysis: `
## 当前任务：利润分析
请引导用户：
1. 查看利润报表（ERP系统 > 财务管理）
2. 分析亏损商品
3. 优化建议`,
    
    ad_optimization: `
## 当前任务：广告优化
请收集以下信息：
1. 广告数据（花费、点击、转化）
2. 当前ROI/ACOS
3. 优化目标

提供具体的优化建议。`,
    
    customer_service: `
## 当前任务：客服回复
请了解：
1. 客户问题类型
2. 订单状态
3. 目标回复语言

生成专业、友好的客服回复。`,
    
    compliance_check: `
## 当前任务：合规检查
请引导用户：
1. 选择检查类型（Listing风险/图片风险）
2. 提供商品信息
3. 查看体检报告`,
    
    data_analysis: `
## 当前任务：数据分析
请引导用户：
1. 选择分析维度（流量/转化/价格）
2. 时间范围
3. 分析目标

提供数据洞察和建议。`,
    
    general_chat: ''
  };
  
  return prompts[intent];
}

export async function POST(request: NextRequest) {
  try {
    // 免费体验次数检查
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          detail: '免费体验次数已用完', 
          remaining: 0, 
          resetAt: rateLimit.resetAt,
          upgradeUrl: '/contact'
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt)
          } 
        }
      );
    }

    const body = await request.json();
    const { message, session_id = 'default', history = [] } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ detail: '消息不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取或创建会话
    let session = sessionStore.get(session_id);
    if (!session) {
      session = { messages: [] };
      sessionStore.set(session_id, session);
    }

    // 识别意图
    const intent = recognizeIntent(message);
    const intentPrompt = getIntentPrompt(intent);

    // 构建消息列表
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT + intentPrompt }
    ];

    // 添加历史消息（保留最近20轮）
    const recentHistory = session.messages.slice(-40);
    messages.push(...recentHistory as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>);

    // 添加当前消息
    messages.push({ role: 'user', content: message });

    // 初始化 LLM 客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 意图信息（第一条消息）
          const intentInfo = `data: ${JSON.stringify({ type: 'intent', intent, label: getIntentLabel(intent) })}\n\n`;
          controller.enqueue(encoder.encode(intentInfo));

          // 流式调用大模型
          const llmStream = client.stream(messages, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.7,
            thinking: 'disabled',
          });

          let fullResponse = '';
          
          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullResponse += text;
              
              // 发送内容块
              const contentMsg = `data: ${JSON.stringify({ type: 'content', content: text })}\n\n`;
              controller.enqueue(encoder.encode(contentMsg));
            }
          }

          // 保存到会话历史
          session!.messages.push(
            { role: 'user', content: message },
            { role: 'assistant', content: fullResponse }
          );

          // 发送完成信号
          const doneMsg = `data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`;
          controller.enqueue(encoder.encode(doneMsg));
          
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorMsg = `data: ${JSON.stringify({ type: 'error', message: 'AI服务暂时不可用，请稍后重试' })}\n\n`;
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Limit': String(FREE_CHAT_LIMIT),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ detail: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 获取意图标签
function getIntentLabel(intent: IntentType): string {
  const labels: Record<IntentType, string> = {
    product_selection: '🎯 选品分析',
    product_scrape: '📦 商品采集',
    image_design: '🎨 图片设计',
    video_generation: '🎬 视频生成',
    listing_optimize: '📝 Listing优化',
    pricing: '💰 智能定价',
    profit_analysis: '📊 利润分析',
    ad_optimization: '📈 广告优化',
    customer_service: '💬 客服支持',
    compliance_check: '✅ 合规检查',
    data_analysis: '📉 数据分析',
    general_chat: '💬 智能对话'
  };
  return labels[intent];
}
