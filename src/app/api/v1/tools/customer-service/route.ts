import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 智能客服回复工具 API
 * 
 * 功能：
 * - 多语言客服回复
 * - 订单查询回复
 * - 物流查询回复
 * - 售后纠纷回复
 */

interface CustomerServiceRequest {
  customerMessage: string;     // 客户消息
  messageType: 'inquiry' | 'order' | 'logistics' | 'complaint' | 'refund' | 'review';
  targetLanguage: 'en' | 'th' | 'vi' | 'ms' | 'id' | 'ph';
  orderInfo?: {
    orderId?: string;
    status?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  tone?: 'friendly' | 'professional' | 'apologetic';
  previousMessages?: Array<{ role: 'customer' | 'agent'; content: string }>;
}

// 语言配置
const LANGUAGE_PROMPTS = {
  en: 'Please respond in English',
  th: '请用泰语回复，使用礼貌敬语',
  vi: '请用越南语回复，使用礼貌用语',
  ms: '请用马来语回复',
  id: '请用印尼语回复，使用礼貌用语',
  ph: '请用菲律宾语回复',
};

// 客服系统提示词
const CS_SYSTEM_PROMPT = `你是龙掌柜智能客服助手，专门为跨境电商卖家提供客服回复支持。

## 回复原则

### 1. 友好专业
- 使用礼貌用语
- 表达同理心
- 积极解决问题

### 2. 清晰简洁
- 直接回答问题
- 避免复杂表述
- 提供具体信息

### 3. 积极正面
- 承认问题并道歉
- 提供解决方案
- 表达感谢

### 4. 文化适应
- 尊重当地文化
- 使用恰当称呼
- 避免文化禁忌

## 消息类型处理

### inquiry（询盘）
- 热情回复
- 提供详细产品信息
- 引导下单

### order（订单查询）
- 确认订单状态
- 提供物流信息
- 预计送达时间

### logistics（物流查询）
- 提供追踪信息
- 解释物流状态
- 安抚客户情绪

### complaint（投诉）
- 诚恳道歉
- 承担责任
- 提供补偿方案

### refund（退款）
- 了解退款原因
- 说明退款流程
- 尝试挽留

### review（评价）
- 感谢评价
- 正面回应问题
- 邀请再次购买`;

export async function POST(request: NextRequest) {
  try {
    const body: CustomerServiceRequest = await request.json();
    const {
      customerMessage,
      messageType,
      targetLanguage,
      orderInfo,
      tone = 'friendly',
      previousMessages
    } = body;

    if (!customerMessage) {
      return new Response(
        JSON.stringify({ success: false, error: '请提供客户消息' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 消息类型标签
    const messageTypeLabels = {
      inquiry: '询盘咨询',
      order: '订单查询',
      logistics: '物流查询',
      complaint: '投诉处理',
      refund: '退款申请',
      review: '评价回复'
    };

    // 语气风格提示
    const tonePrompts = {
      friendly: '使用友好亲切的语气，像朋友一样交流',
      professional: '使用专业正式的语气，保持商务礼仪',
      apologetic: '使用诚恳道歉的语气，表达歉意和补救意愿'
    };

    // 构建请求消息
    let userMessage = `
## 客户消息
"${customerMessage}"

## 消息类型
${messageTypeLabels[messageType] || '通用咨询'}

## 回复要求
- 目标语言：${LANGUAGE_PROMPTS[targetLanguage] || LANGUAGE_PROMPTS.en}
- 语气风格：${tonePrompts[tone]}
`;

    // 添加订单信息
    if (orderInfo) {
      userMessage += `
## 订单信息
${orderInfo.orderId ? `- 订单号：${orderInfo.orderId}` : ''}
${orderInfo.status ? `- 订单状态：${orderInfo.status}` : ''}
${orderInfo.trackingNumber ? `- 物流单号：${orderInfo.trackingNumber}` : ''}
${orderInfo.estimatedDelivery ? `- 预计送达：${orderInfo.estimatedDelivery}` : ''}
`;
    }

    // 添加历史消息
    if (previousMessages?.length) {
      userMessage += `
## 对话历史
${previousMessages.map(m => `${m.role === 'customer' ? '客户' : '客服'}: ${m.content}`).join('\n')}
`;
    }

    userMessage += `
请生成专业、友好、有效的客服回复。直接输出回复内容，不要解释。`;

    // 初始化 LLM 客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages = [
            { role: 'system' as const, content: CS_SYSTEM_PROMPT },
            { role: 'user' as const, content: userMessage }
          ];

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', messageType, label: messageTypeLabels[messageType] })}\n\n`));

          const llmStream = client.stream(messages, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.7,
          });

          let fullResponse = '';
          
          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('CS reply generation error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: '生成失败，请重试' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('CS API error:', error);
    return new Response(
      JSON.stringify({ success: false, error: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
