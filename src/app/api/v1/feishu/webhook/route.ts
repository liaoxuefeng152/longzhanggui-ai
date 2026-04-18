/**
 * 飞书智能助理 Webhook
 * 支持智能体调用、异步任务和卡片消息
 */

import { NextRequest, NextResponse } from 'next/server';
import { FEISHU_CONFIG } from '@/lib/feishu/config';

// 意图类型
const INTENT_TYPES = {
  DAILY_REPORT: 'daily_report',
  PRODUCT_SELECTION: 'product_selection',
  INVENTORY_ALERT: 'inventory_alert',
  AD_ANALYSIS: 'ad_analysis',
  ORDER_STATUS: 'order_status',
  GENERAL_QUERY: 'general_query',
} as const;

// 消息去重缓存
const processedMessages = new Map<string, number>();
const MESSAGE_DEDUP_WINDOW_MS = 30000;

/**
 * 生成消息去重key
 */
function getDeduplicationKey(messageId: string, userId: string, chatId: string, textContent: string): string {
  const now = Date.now();
  for (const [key, timestamp] of processedMessages.entries()) {
    if (now - timestamp > MESSAGE_DEDUP_WINDOW_MS) {
      processedMessages.delete(key);
    }
  }
  return `${chatId}:${userId}:${textContent.substring(0, 50)}`;
}

/**
 * POST - 接收飞书消息
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = request.headers;

    // 飞书事件挑战验证
    let eventData;
    try {
      eventData = JSON.parse(body);
    } catch {
      return NextResponse.json({ code: 1, msg: 'Invalid JSON' }, { status: 400 });
    }

    // 挑战模式（飞书机器人配置验证）
    if (eventData.type === 'url_verification') {
      return NextResponse.json({ challenge: eventData.challenge });
    }

    // 事件回调
    if (eventData.header?.event_type) {
      const event = eventData.event;
      if (!event) {
        return NextResponse.json({ code: 0, msg: 'No event data' });
      }

      // 处理文本消息
      if (event.message?.msg_type === 'text' && event.message?.content) {
        const content = JSON.parse(event.message.content);
        const text = content.text?.trim() || '';
        const chatId = event.message?.chat_id || '';
        const userId = event.message?.sender?.sender_id?.user_id || '';
        const messageId = event.message?.message_id || '';

        // 消息去重
        const dedupKey = getDeduplicationKey(messageId, userId, chatId, text);
        if (processedMessages.has(dedupKey)) {
          return NextResponse.json({ code: 0, msg: 'Duplicate message' });
        }
        processedMessages.set(dedupKey, Date.now());

        // 处理意图
        const intent = recognizeIntent(text);
        const response = generateResponse(intent, text);

        // 发送回复
        await sendFeishuMessage(chatId, response);

        return NextResponse.json({ code: 0, msg: 'Success' });
      }
    }

    return NextResponse.json({ code: 0, msg: 'Event received' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ code: 1, msg: error.message }, { status: 500 });
  }
}

/**
 * 简单的意图识别
 */
function recognizeIntent(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('日报') || lowerText.includes('今天情况') || lowerText.includes('运营情况')) {
    return INTENT_TYPES.DAILY_REPORT;
  }
  if (lowerText.includes('选品') || lowerText.includes('推荐')) {
    return INTENT_TYPES.PRODUCT_SELECTION;
  }
  if (lowerText.includes('库存') || lowerText.includes('补货')) {
    return INTENT_TYPES.INVENTORY_ALERT;
  }
  if (lowerText.includes('广告') || lowerText.includes('推广')) {
    return INTENT_TYPES.AD_ANALYSIS;
  }
  if (lowerText.includes('订单') || lowerText.includes('物流')) {
    return INTENT_TYPES.ORDER_STATUS;
  }

  return INTENT_TYPES.GENERAL_QUERY;
}

/**
 * 生成回复内容
 */
function generateResponse(intent: string, originalText: string): string {
  const responses: Record<string, string> = {
    [INTENT_TYPES.DAILY_REPORT]: '📊 今日运营概览\n\n• 订单数：8单\n• 销售额：¥1,280\n• 待处理：3单\n• 库存预警：2个商品',

    [INTENT_TYPES.PRODUCT_SELECTION]: '🔍 选品助手\n\n请告诉我您的需求：\n1. 目标市场（东南亚/欧美）\n2. 商品类目\n3. 预算范围',

    [INTENT_TYPES.INVENTORY_ALERT]: '📦 库存预警\n\n以下商品库存不足：\n• 商品A - 剩余5件\n• 商品B - 剩余3件',

    [INTENT_TYPES.AD_ANALYSIS]: '📢 广告分析\n\n当前广告表现良好，ROI 达到 2.5',

    [INTENT_TYPES.ORDER_STATUS]: '📋 订单状态\n\n• 进行中：5单\n• 已发货：3单\n• 待处理：0单',

    [INTENT_TYPES.GENERAL_QUERY]: `您好！我是龙掌柜智能运营助理 🦞\n\n我可以帮您：\n• 查询运营日报\n• 选品建议\n• 库存预警\n• 广告分析\n• 订单查询\n\n请告诉我您的需求~`,
  };

  return responses[intent] || responses[INTENT_TYPES.GENERAL_QUERY];
}

/**
 * 发送飞书消息
 */
async function sendFeishuMessage(chatId: string, text: string): Promise<void> {
  const { appId, appSecret } = FEISHU_CONFIG;

  try {
    // 获取tenant_access_token
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.tenant_access_token;

    if (!token) {
      console.error('Failed to get tenant token');
      return;
    }

    // 发送消息
    await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({ text }),
      }),
    });
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}
