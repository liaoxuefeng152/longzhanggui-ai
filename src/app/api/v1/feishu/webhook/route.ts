/**
 * 飞书智能助理 Webhook
 * 支持智能体调用、异步任务和卡片消息
 */

import { NextRequest, NextResponse } from 'next/server';
import { FEISHU_CONFIG } from '@/lib/feishu/config';
import { recognizeIntent, generateHelpMessage } from '@/lib/feishu/intent-enhanced';
import { executeIntent } from '@/lib/feishu/agent-executor';
import { addUserMessage, addAssistantMessage, getOrCreateContext } from '@/lib/feishu/conversation';
import { getTask } from '@/lib/feishu/task-queue';
import { getPushClient, pushWelcomeMessage, pushTaskStatus } from '@/lib/feishu/push-service';
import { INTENT_TYPES } from '@/lib/feishu/config';

// 消息去重缓存（防止飞书重试导致重复处理）
const processedMessages = new Set<string>();
const MESSAGE_DEDUP_WINDOW_MS = 10000; // 10秒内相同消息视为重复

/**
 * 生成消息去重key（基于消息内容+发送者+时间窗口）
 */
function getDeduplicationKey(messageId: string, userId: string, textContent: string): string {
  // 如果有message_id，使用它
  if (messageId) {
    return messageId;
  }
  // 否则用内容+用户+时间窗口（30秒）生成key
  const timeWindow = Math.floor(Date.now() / 30000);
  return `${userId}:${textContent}:${timeWindow}`;
}

/**
 * 检查消息是否已处理过
 */
function isMessageProcessed(messageId: string, userId: string, textContent: string): boolean {
  const key = getDeduplicationKey(messageId, userId, textContent);
  
  if (processedMessages.has(key)) {
    return true;
  }
  processedMessages.add(key);
  
  // 清理过期记录
  setTimeout(() => {
    processedMessages.delete(key);
  }, MESSAGE_DEDUP_WINDOW_MS);
  
  return false;
}

// GET 请求：飞书验证 URL 有效性
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get('challenge');

  if (challenge) {
    return new NextResponse(JSON.stringify({ challenge }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.json({ code: 0, msg: 'Webhook endpoint is active' });
}

// POST 请求：接收飞书事件
export async function POST(request: NextRequest) {
  try {
    const urlChallenge = request.nextUrl.searchParams.get('challenge');
    const bodyText = await request.text();
    let body: any = {};

    try {
      body = JSON.parse(bodyText);
    } catch {
      const params = new URLSearchParams(bodyText);
      params.forEach((value, key) => { body[key] = value; });
    }

    // Challenge 验证
    const challenge = urlChallenge || body.challenge;
    if (challenge) {
      return new NextResponse(JSON.stringify({ challenge }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 处理事件
    await processEvent(body);

    return NextResponse.json({ code: 0, msg: 'ok' });
  } catch (error) {
    console.error('[Feishu Webhook] 处理错误:', error);
    return NextResponse.json({ code: 1, msg: '处理失败' }, { status: 500 });
  }
}

/**
 * 处理飞书事件
 */
async function processEvent(body: any) {
  const header = body.header || body;
  const eventType = header.event_type;

  // 处理验证事件
  if (eventType === 'im.message.receive_v1' || body.event?.message) {
    await handleMessageEvent(body);
    return;
  }

  // 其他事件类型暂不处理
  console.log(`[Feishu] 收到事件: ${eventType}`);
}

/**
 * 处理消息事件
 */
async function handleMessageEvent(body: any) {
  const event = body.event || body;
  const message = event.message;
  const sender = event.sender;

  if (!message || !message.content) {
    return;
  }

  // 解析消息内容
  let textContent = '';
  try {
    const content = JSON.parse(message.content);
    textContent = content.text || '';
  } catch {
    textContent = message.content;
  }

  // 获取发送者信息
  const chatId = message.chat_id;
  const chatType = message.chat_type || 'p2p';
  const senderOpenId = sender?.sender_id?.open_id;
  const userId = senderOpenId || chatId;

  // 消息去重（防止飞书重试）
  const messageId = message.message_id;
  if (isMessageProcessed(messageId, userId, textContent)) {
    console.log(`[Feishu] 消息已处理过，跳过: ${messageId || textContent.slice(0, 20)}`);
    return;
  }

  console.log(`[Feishu] 收到消息 from ${userId}: ${textContent}`);

  // 添加到会话上下文
  addUserMessage(userId, chatId, textContent);

  // 检查是否是查询任务状态的指令
  if (textContent.startsWith('任务状态 ') || textContent.includes('task')) {
    const taskId = textContent.replace('任务状态 ', '').replace('task', '').trim();
    if (taskId) {
      await pushTaskStatus(chatId, taskId);
      return;
    }
  }

  // 检查是否是欢迎消息
  if (/^(hi|hello|你好|嗨)/i.test(textContent.trim())) {
    await pushWelcomeMessage(chatId);
    return;
  }

  // 识别意图（传入上下文）
  const intentResult = await recognizeIntent(textContent, userId, chatId);

  console.log(`[Feishu] 识别意图: ${intentResult.intent}, 置信度: ${intentResult.confidence}${intentResult.fromContext ? ' (从上下文推断)' : ''}`);

  // 如果需要追问
  if (intentResult.needClarification && intentResult.clarificationQuestion) {
    await sendClarificationMessage(chatId, intentResult);
    return;
  }

  // 执行任务
  const result = await executeIntent(
    intentResult.intent,
    intentResult.params,
    userId,
    chatId,
    textContent
  );

  // 添加到会话上下文（记录意图）
  addAssistantMessage(userId, chatId, JSON.stringify(result), intentResult.intent, intentResult.params);

  // 发送结果
  if (result.isAsync) {
    // 异步任务：发送处理中消息
    await sendAsyncTaskMessage(chatId, result, intentResult.intent);
  } else if (result.success) {
    // 同步任务：直接发送结果
    await sendResultMessage(chatId, result, intentResult.intent);
  } else {
    // 执行失败
    await sendErrorMessage(chatId, result.error || '执行失败');
  }
}

/**
 * 发送追问消息
 */
async function sendClarificationMessage(chatId: string, intentResult: any) {
  const pushClient = getPushClient();
  
  const intentNames: Record<string, string> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: '选品分析',
    [INTENT_TYPES.PROCESS_IMAGE]: '图片处理',
    [INTENT_TYPES.GENERATE_VIDEO]: '视频生成',
    [INTENT_TYPES.CALCULATE_PRICE]: '智能定价',
    [INTENT_TYPES.PUBLISH_PRODUCT]: '新品上架',
    [INTENT_TYPES.COLLECT_LINKS]: '链接采集',
    [INTENT_TYPES.OPTIMIZE_LISTING]: 'Listing优化',
    [INTENT_TYPES.CREATE_AD]: '创建广告',
  };
  
  const intentName = intentNames[intentResult.intent] || '处理';
  const contextHint = intentResult.fromContext ? '\n\n💡 我注意到您可能在继续上次的操作。' : '';

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `📋 ${intentName} - 需要更多信息` },
      template: 'blue',
    },
    elements: [
      { tag: 'markdown', content: intentResult.clarificationQuestion + contextHint },
      { tag: 'hr' },
      {
        tag: 'note',
        elements: [
          { tag: 'plain_text', content: '请补充您的需求，我会继续为您服务' },
        ],
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送异步任务处理中消息
 */
async function sendAsyncTaskMessage(chatId: string, result: any, intent: string) {
  const pushClient = getPushClient();

  const intentNames: Record<string, string> = {
    [INTENT_TYPES.SELECT_PRODUCTS]: '选品分析',
    [INTENT_TYPES.CREATE_AD]: '广告创建',
    [INTENT_TYPES.GENERATE_REPORT]: '报告生成',
  };

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `🎯 ${intentNames[intent] || '任务'}进行中` },
      template: 'blue',
    },
    elements: [
      { tag: 'markdown', content: result.data?.message || '正在处理，请稍候...' },
      { tag: 'hr' },
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**状态**\n🔄 处理中' },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**任务ID**\n${result.taskId}` },
            ],
          },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'markdown',
        content: '⏳ 处理完成后会自动通知您\n\n您也可以输入"任务状态 ' + result.taskId + '"查询进度',
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送结果消息
 */
async function sendResultMessage(chatId: string, result: any, intent: string) {
  const pushClient = getPushClient();

  // 根据数据类型选择不同的卡片模板
  const data = result.data;

  switch (data?.type) {
    case 'daily_report':
      await sendDailyReportCard(chatId, data);
      break;

    case 'product_selection':
      await sendProductSelectionCard(chatId, data);
      break;

    case 'inventory_alert':
      await sendInventoryAlertCard(chatId, data);
      break;

    case 'order_list':
      await sendOrderListCard(chatId, data);
      break;

    case 'sales_report':
      await sendSalesReportCard(chatId, data);
      break;

    case 'generated_copy':
      await sendGeneratedCopyCard(chatId, data);
      break;

    case 'listing_optimized':
      await sendListingOptimizedCard(chatId, data);
      break;

    case 'image_processed':
      await sendImageProcessedCard(chatId, data);
      break;

    case 'video_generated':
      await sendVideoGeneratedCard(chatId, data);
      break;

    case 'price_calculated':
      await sendPriceCalculatedCard(chatId, data);
      break;

    case 'product_published':
      await sendProductPublishedCard(chatId, data);
      break;

    case 'links_collected':
      await sendLinksCollectedCard(chatId, data);
      break;

    case 'greeting':
      await pushClient.sendTextMessage(chatId, 'chat_id', data.content);
      break;

    case 'help':
      await sendHelpCard(chatId, data.content);
      break;

    case 'unknown':
      await sendUnknownCard(chatId, data.content);
      break;

    default:
      // 默认卡片
      await pushClient.sendCardMessage(chatId, 'chat_id', {
        config: { wide_screen_mode: true },
        header: {
          title: { tag: 'plain_text', content: '📋 查询结果' },
          template: 'blue',
        },
        elements: [
          { tag: 'markdown', content: JSON.stringify(data, null, 2) },
        ],
      });
  }
}

/**
 * 发送日报卡片
 */
async function sendDailyReportCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const stats = data.stats || {};
  const trends = data.trends || {};

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `📊 ${data.date} 运营日报` },
      template: 'blue',
    },
    elements: [
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**今日订单**\n' + (stats.orders || 0) + ' 单\n📈 ' + (trends.ordersChange || '+0%') },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**今日销售额**\n¥' + (stats.sales || 0).toLocaleString() + '\n📈 ' + (trends.salesChange || '+0%') },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**广告花费**\n¥' + (stats.adsSpend || 0) + '\n📊 正常' },
            ],
          },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**访客数**\n' + (stats.visitors || 0) },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**转化率**\n' + (stats.conversionRate || '3.6%') },
            ],
          },
        ],
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送选品结果卡片
 */
async function sendProductSelectionCard(chatId: string, data: any) {
  const pushClient = getPushClient();
  const products = data.products || [];

  const productElements = products.map((p: any, index: number) => ({
    tag: 'column_set',
    flex_mode: 'none',
    elements: [
      {
        tag: 'column',
        width: 'weighted',
        weight: 1,
        elements: [
          { tag: 'markdown', content: `**${index + 1}. ${p.name}**` },
          { tag: 'markdown', content: `💰 ¥${p.price} | 📦 ${p.volume} 销量 | ⭐ ${p.score}` },
        ],
      },
    ],
  }));

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🎯 选品结果' },
      template: 'green',
    },
    elements: [
      { tag: 'markdown', content: data.message || `为您找到 ${products.length} 款优质商品` },
      { tag: 'hr' },
      ...productElements,
      { tag: 'hr' },
      {
        tag: 'markdown',
        content: '💡 *点击商品可查看详情，需要上架请告诉我*',
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送库存预警卡片
 */
async function sendInventoryAlertCard(chatId: string, data: any) {
  const pushClient = getPushClient();
  const items = data.items || [];

  const itemElements = items.map((item: any) => ({
    tag: 'column_set',
    flex_mode: 'none',
    elements: [
      {
        tag: 'column',
        width: 'weighted',
        weight: 1,
        elements: [
          { tag: 'markdown', content: `**${item.name}**` },
          { tag: 'markdown', content: `SKU: ${item.sku}` },
        ],
      },
      {
        tag: 'column',
        width: 'weighted',
        weight: 1,
        elements: [
          { tag: 'markdown', content: `**库存: ${item.stock}**` },
          { tag: 'markdown', content: `警戒值: ${item.threshold}` },
        ],
      },
    ],
  }));

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '⚠️ 库存预警' },
      template: items.some((i: any) => i.stock < i.threshold) ? 'red' : 'green',
    },
    elements: [
      { tag: 'markdown', content: data.summary || `共 ${items.length} 个商品` },
      { tag: 'hr' },
      ...itemElements,
      ...(items.some((i: any) => i.stock < i.threshold) ? [
        { tag: 'hr' },
        { tag: 'markdown', content: '⚡ *库存不足，需要及时补货*' },
      ] : []),
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送订单列表卡片
 */
async function sendOrderListCard(chatId: string, data: any) {
  const pushClient = getPushClient();
  const orders = data.orders || [];

  const orderElements = orders.map((order: any) => ({
    tag: 'column_set',
    flex_mode: 'none',
    elements: [
      {
        tag: 'column',
        width: 'weighted',
        weight: 1,
        elements: [
          { tag: 'markdown', content: `**${order.orderId}**` },
          { tag: 'markdown', content: `¥${order.amount}` },
        ],
      },
      {
        tag: 'column',
        width: 'weighted',
        weight: 1,
        elements: [
          { tag: 'markdown', content: `**${order.status}**` },
          { tag: 'markdown', content: order.tracking !== '-' ? `📦 ${order.tracking}` : '-' },
        ],
      },
    ],
  }));

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📦 订单列表' },
      template: 'blue',
    },
    elements: [
      { tag: 'markdown', content: `共 ${orders.length} 个订单` },
      { tag: 'hr' },
      ...orderElements,
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送销售报告卡片
 */
async function sendSalesReportCard(chatId: string, data: any) {
  const pushClient = getPushClient();
  const stats = data.stats || {};
  const comparison = data.comparison || {};

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `📈 ${data.period} 销售报告` },
      template: 'blue',
    },
    elements: [
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**总订单**\n' + (stats.totalOrders || 0) + ' 单\n📈 ' + (comparison.ordersChange || '+0%') },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**总销售额**\n¥' + (stats.totalSales || 0).toLocaleString() + '\n📈 ' + (comparison.salesChange || '+0%') },
            ],
          },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**客单价**\n¥' + (stats.avgOrderValue || 0) },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**热销品类**\n' + (stats.topCategory || '-') },
            ],
          },
        ],
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送生成的文案卡片
 */
async function sendGeneratedCopyCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '✍️ 生成的文案' },
      template: 'green',
    },
    elements: [
      {
        tag: 'markdown',
        content: data.content || '生成失败',
      },
      { tag: 'hr' },
      {
        tag: 'markdown',
        content: `📋 **用途**: ${data.usage || '直接使用'}\n\n💡 *点击复制即可使用*`,
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送帮助卡片
 */
async function sendHelpCard(chatId: string, content: string) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🤖 龙掌柜智能运营助理' },
      template: 'blue',
    },
    elements: [
      { tag: 'markdown', content },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送未知意图卡片
 */
async function sendUnknownCard(chatId: string, content: string) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🤔 抱歉，没理解您的意思' },
      template: 'yellow',
    },
    elements: [
      { tag: 'markdown', content },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送错误消息
 */
async function sendErrorMessage(chatId: string, error: string) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '❌ 执行失败' },
      template: 'red',
    },
    elements: [
      { tag: 'markdown', content: error },
      { tag: 'hr' },
      {
        tag: 'markdown',
        content: '请稍后重试，或联系管理员',
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送Listing优化结果卡片
 */
async function sendListingOptimizedCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📝 Listing优化完成' },
      template: 'green',
    },
    elements: [
      { tag: 'markdown', content: `**优化标题**\n${data.title || '标题优化完成'}` },
      { tag: 'hr' },
      { tag: 'markdown', content: `**关键词**\n${(data.keywords || []).join(', ')}` },
      { tag: 'hr' },
      { tag: 'markdown', content: `**产品要点**\n${(data.bulletPoints || []).map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}` },
      { tag: 'hr' },
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**SEO评分**\n${data.seoScore || 0}分` },
            ],
          },
        ],
      },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送图片处理结果卡片
 */
async function sendImageProcessedCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `🖼️ 图片${data.modeLabel || '处理'}完成` },
      template: 'green',
    },
    elements: [
      { tag: 'markdown', content: data.message || '图片处理完成！' },
      { tag: 'hr' },
      {
        tag: 'image',
        img_key: data.processedUrl || '/placeholder.png',
        alt: '处理后的图片',
      },
      { tag: 'hr' },
      { tag: 'markdown', content: '💡 *点击图片可查看大图*' },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送视频生成结果卡片
 */
async function sendVideoGeneratedCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🎬 TikTok视频生成完成' },
      template: 'green',
    },
    elements: [
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**时长**\n${data.duration || 10}秒` },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**分辨率**\n${data.resolution || '720p'}` },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**比例**\n${data.ratio || '9:16'}` },
            ],
          },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'thumbnail',
        img_key: data.thumbnailUrl || '/placeholder.png',
        title: '视频封面',
        alt: '视频封面',
      },
      { tag: 'hr' },
      { tag: 'markdown', content: '💡 *视频已生成，可直接下载使用*' },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送智能定价结果卡片
 */
async function sendPriceCalculatedCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const breakdownLines = Object.entries(data.costBreakdown || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '💰 智能定价结果' },
      template: 'blue',
    },
    elements: [
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**成本价**\n¥${data.costPrice || 0}` },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**建议售价**\n¥${data.suggestedPrice || 0}` },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**利润率**\n${data.profitMargin || 0}%` },
            ],
          },
        ],
      },
      { tag: 'hr' },
      { tag: 'markdown', content: `**成本明细**\n${breakdownLines}` },
      { tag: 'hr' },
      { tag: 'markdown', content: `📍 平台: ${data.platform || 'Shopee'}\n💡 *点击查看详细定价策略*` },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送新品上架结果卡片
 */
async function sendProductPublishedCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📦 商品上架成功' },
      template: 'green',
    },
    elements: [
      { tag: 'markdown', content: `**商品名称**\n${data.productName || '商品'}` },
      { tag: 'hr' },
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**目标平台**\n${data.platform || 'Shopee'}` },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**状态**\n${data.status === 'published' ? '✅ 已发布' : '📝 草稿'}` },
            ],
          },
        ],
      },
      ...(data.listingUrl ? [
        { tag: 'hr' },
        { tag: 'markdown', content: `🔗 [查看商品链接](${data.listingUrl})` },
      ] : []),
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}

/**
 * 发送链接采集结果卡片
 */
async function sendLinksCollectedCard(chatId: string, data: any) {
  const pushClient = getPushClient();

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `🔗 ${data.source || '1688'}商品采集完成` },
      template: 'green',
    },
    elements: [
      { tag: 'markdown', content: `**商品名称**\n${data.productName || '采集的商品'}` },
      { tag: 'hr' },
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**价格**\n¥${data.price || 0}` },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**供应商**\n${data.supplier || '-'}` },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: `**起订量**\n${data.minOrder || 1}件` },
            ],
          },
        ],
      },
      { tag: 'hr' },
      { tag: 'markdown', content: `**规格**\n${(data.specifications || []).join('\n')}` },
      { tag: 'hr' },
      { tag: 'markdown', content: '💡 *已保存到商品库，可进行下一步处理*' },
    ],
  };

  await pushClient.sendCardMessage(chatId, 'chat_id', card);
}
