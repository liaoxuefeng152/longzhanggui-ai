/**
 * 飞书 Webhook 接收处理
 * 用于接收飞书开放平台的事件推送
 */

import { NextRequest, NextResponse } from 'next/server';
import { FEISHU_CONFIG } from '@/lib/feishu/config';
import { recognizeIntent } from '@/lib/feishu/intent';
import { sendFeishuMessage } from '@/lib/feishu/client';

// GET 请求：飞书验证 URL 有效性
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // 飞书 Webhook 验证参数
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // 返回验证挑战 - 飞书要求返回纯 JSON 格式
    return new NextResponse(JSON.stringify({ challenge }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  return NextResponse.json({
    code: 0,
    msg: 'Webhook endpoint is active'
  });
}

// POST 请求：接收飞书事件（也用于 challenge 验证）
export async function POST(request: NextRequest) {
  try {
    // 检查 URL 中是否有 challenge 参数（优先使用）
    const urlChallenge = request.nextUrl.searchParams.get('challenge');
    
    // 解析 body
    const bodyText = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(bodyText);
    } catch {
      // 如果解析失败，可能是 URL-encoded 格式
      const params = new URLSearchParams(bodyText);
      params.forEach((value, key) => {
        body[key] = value;
      });
    }
    
    // Challenge 验证（优先使用 URL 参数）
    const challenge = urlChallenge || body.challenge;
    if (challenge) {
      console.log('[Feishu Webhook] Challenge 验证:', challenge);
      return new NextResponse(JSON.stringify({ challenge }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    console.log('[Feishu Webhook] 收到事件:', JSON.stringify(body, null, 2));
    
    // 处理飞书事件
    const result = await processFeishuEvent(body);
    
    return NextResponse.json({
      code: 0,
      msg: 'ok'
    });
  } catch (error: any) {
    console.error('[Feishu Webhook] 处理错误:', error);
    
    return NextResponse.json({
      code: 1,
      msg: error.message || '处理失败'
    }, { status: 200 }); // 返回200避免飞书重试
  }
}

/**
 * 处理飞书事件
 */
async function processFeishuEvent(event: any) {
  // 获取事件类型
  const eventType = event.header?.event_type || event.schema?.uri;
  
  console.log('[Feishu Webhook] 事件类型:', eventType);
  
  // 处理不同类型的事件
  if (eventType === 'im.message.receive_v1' || event.message) {
    // 接收消息事件
    return await handleMessageEvent(event);
  }
  
  if (eventType === 'im.message.message_read_v1') {
    // 消息已读事件
    console.log('[Feishu Webhook] 消息已读');
    return { success: true };
  }
  
  // 其他事件类型直接返回成功
  return { success: true, message: '事件已接收' };
}

/**
 * 处理消息事件
 */
async function handleMessageEvent(event: any) {
  // 提取消息内容
  const message = event.event?.message || event.message;
  const sender = event.event?.sender || event.sender;
  const chatId = message?.chat_id;
  const openId = sender?.sender_id?.open_id || sender?.open_id;
  
  if (!message || !message.content) {
    console.log('[Feishu Webhook] 消息内容为空');
    return { success: false };
  }
  
  // 解析消息内容
  let textContent = '';
  try {
    const content = JSON.parse(message.content);
    textContent = content.text || content.content || '';
  } catch {
    textContent = message.content;
  }
  
  console.log('[Feishu Webhook] 收到用户消息:', textContent);
  console.log('[Feishu Webhook] 发送者 OpenID:', openId);
  
  if (!textContent.trim()) {
    return { success: false };
  }
  
  // 识别用户意图
  const intent = recognizeIntent(textContent);
  console.log('[Feishu Webhook] 识别意图:', intent);
  
  // 发送"正在处理"消息
  await sendFeishuMessage(chatId, {
    msg_type: 'text',
    content: {
      text: `收到您的消息：「${textContent}」\n\n正在分析中，请稍候...`
    }
  });
  
  // 根据意图处理请求
  let responseText = '';
  
  switch (intent.type) {
    case 'query_daily':
      responseText = await generateDailyReport();
      break;
    case 'query_inventory':
      responseText = await queryInventoryAlert();
      break;
    case 'query_ad':
      responseText = await queryAdSpend();
      break;
    case 'select_products':
      responseText = await handleSelectProductsIntent(intent.params);
      break;
    case 'publish_product':
      responseText = await handlePublishIntent(intent.params);
      break;
    case 'greeting':
      responseText = '您好！我是龙掌柜智能运营助理。请问有什么可以帮您的？\n\n您可以：\n• 查询今日运营情况\n• 查看库存预警\n• 了解广告消耗\n• 选品分析\n• 等等...';
      break;
    default:
      responseText = `收到您的消息：「${textContent}」\n\n抱歉，我暂时无法理解这个指令。\n\n您可以尝试：\n• "今天的运营情况怎么样？"\n• "哪些商品库存不足？"\n• "帮我选3款宠物用品"`;
  }
  
  // 发送回复消息
  await sendFeishuMessage(chatId, {
    msg_type: 'text',
    content: {
      text: responseText
    }
  });
  
  return { success: true };
}

/**
 * 生成运营日报
 */
async function generateDailyReport(): Promise<string> {
  // 模拟数据
  return `📊 今日运营日报

【销售概况】
• 今日订单：45 单 (+12%)
• 今日销售额：¥12,580 (+8%)
• 今日广告花费：¥850 (+5%)
• 好评率：94.5% (-0.3%)

【异常提醒】
⚠️ SKU-B456 库存仅剩 8 件，建议补货
⚠️ 物流时效略有下降

【亮点】
✅ 新品表现超预期，ROI达3.5`;
}

/**
 * 查询库存预警
 */
async function queryInventoryAlert(): Promise<string> {
  // 模拟数据
  return `🔔 库存预警

以下商品库存低于安全库存：

1. SKU-B456 - 宠物玩具
   当前库存：8 件（安全库存：20）
   建议补货：50 件

2. SKU-C789 - 宠物饮水机
   当前库存：12 件（安全库存：15）
   建议补货：30 件

3. SKU-D111 - 宠物床
   当前库存：5 件（安全库存：10）
   建议补货：40 件

回复"采购"可自动生成采购单`;
}

/**
 * 查询广告消耗
 */
async function queryAdSpend(): Promise<string> {
  // 模拟数据
  return `📈 今日广告消耗

【TikTok 印尼站】
• 今日花费：¥650
• 广告订单：23 单
• 平均 ROI：2.8

【亚马逊美国站】
• 今日花费：$180
• 广告订单：15 单
• 平均 ROI：3.2

【总体】
• 总花费：¥2,280 / ¥3,000 预算
• 整体 ROI：3.0
• 状态：正常`;
}

/**
 * 处理选品意图
 */
async function handleSelectProductsIntent(params: any): Promise<string> {
  return `🎯 选品分析

正在为您分析热门品类...

【宠物用品 - 印尼 TK】
1. 宠物自动喂食器
   预估月销量：2,500 单
   预估利润率：35%
   竞争度：中

2. 宠物饮水机
   预估月销量：1,800 单
   预估利润率：28%
   竞争度：低

3. 宠物玩具套装
   预估月销量：2,200 单
   预估利润率：32%
   竞争度：中

回复"采集第1个"开始采集商品信息`;
}

/**
 * 处理上架意图
 */
async function handlePublishIntent(params: any): Promise<string> {
  return `📦 上架确认

商品：宠物自动喂食器
目标平台：TikTok 印尼站
建议售价：¥89.00

【操作步骤】
1. 图片处理 ✅
2. Listing 生成 ✅
3. 智能定价 ✅
4. 上架确认 ⏳

回复"确认上架"完成最后一步`;
}

/**
 * 发送飞书消息
 */
async function sendFeishuMessage(chatId: string, message: any) {
  try {
    // 获取 tenant_access_token
    const tokenResponse = await fetch(`${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.apiPaths.TENANT_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: FEISHU_CONFIG.appId,
        app_secret: FEISHU_CONFIG.appSecret,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.tenant_access_token;
    
    if (!accessToken) {
      throw new Error('获取 access_token 失败');
    }
    
    // 发送消息
    const sendResponse = await fetch(`${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.apiPaths.SEND_MESSAGE}?receive_id_type=chat_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: message.msg_type,
        content: JSON.stringify(message.content),
      }),
    });
    
    const sendData = await sendResponse.json();
    
    if (sendData.code !== 0) {
      console.error('[Feishu Webhook] 发送消息失败:', sendData);
    }
    
    return sendData;
  } catch (error) {
    console.error('[Feishu Webhook] 发送消息异常:', error);
    throw error;
  }
}
