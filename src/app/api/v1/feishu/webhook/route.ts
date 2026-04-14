/**
 * 飞书 Webhook 接收处理
 * 使用卡片消息格式与用户交互
 */

import { NextRequest, NextResponse } from 'next/server';
import { FEISHU_CONFIG } from '@/lib/feishu/config';
import { recognizeIntent } from '@/lib/feishu/intent';

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
    
    const challenge = urlChallenge || body.challenge;
    if (challenge) {
      return new NextResponse(JSON.stringify({ challenge }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('[Feishu Webhook] 收到事件:', JSON.stringify(body, null, 2));
    await processFeishuEvent(body);
    
    return NextResponse.json({ code: 0, msg: 'ok' });
  } catch (error: any) {
    console.error('[Feishu Webhook] 处理错误:', error);
    return NextResponse.json({ code: 1, msg: error.message || '处理失败' }, { status: 200 });
  }
}

/**
 * 处理飞书事件
 */
async function processFeishuEvent(event: any) {
  const eventType = event.header?.event_type || event.schema?.uri;
  
  if (eventType === 'im.message.receive_v1' || event.message) {
    return await handleMessageEvent(event);
  }
  
  return { success: true };
}

/**
 * 处理消息事件 - 使用卡片回复
 */
async function handleMessageEvent(event: any) {
  const message = event.event?.message || event.message;
  const sender = event.event?.sender || event.sender;
  const chatId = message?.chat_id;
  
  if (!message || !message.content) {
    return { success: false };
  }
  
  let textContent = '';
  try {
    const content = JSON.parse(message.content);
    textContent = content.text || '';
  } catch {
    textContent = message.content;
  }
  
  console.log('[Feishu Webhook] 收到消息:', textContent);
  
  if (!textContent.trim()) {
    return { success: false };
  }
  
  const intent = recognizeIntent(textContent);
  let card = null;
  
  switch (intent.type) {
    case 'query_daily':
      card = buildDailyReportCard();
      break;
    case 'query_inventory':
      card = buildInventoryAlertCard();
      break;
    case 'query_ad':
      card = buildAdSpendCard();
      break;
    case 'select_products':
      card = buildProductSelectionCard();
      break;
    case 'greeting':
      card = buildWelcomeCard();
      break;
    default:
      card = buildDefaultCard(textContent);
  }
  
  if (card) {
    await sendFeishuCardMessage(chatId, card);
  }
  
  return { success: true };
}

// ==================== 卡片构建函数 ====================

function buildDailyReportCard() {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📊 今日运营日报' },
      template: 'blue'
    },
    elements: [
      { tag: 'div', text: { tag: 'lark_md', content: `**日期**: ${new Date().toLocaleDateString('zh-CN')}` } },
      { tag: 'hr' },
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          { tag: 'column', width: 'weighted', weight: 1, elements: [
            { tag: 'markdown', content: '**今日订单**\n45 单\n📈 +12%' }
          ]},
          { tag: 'column', width: 'weighted', weight: 1, elements: [
            { tag: 'markdown', content: '**今日销售额**\n¥12,580\n📈 +8%' }
          ]},
          { tag: 'column', width: 'weighted', weight: 1, elements: [
            { tag: 'markdown', content: '**广告花费**\n¥850\n📈 +5%' }
          ]}
        ]
      },
      { tag: 'hr' },
      { tag: 'div', text: { tag: 'lark_md', content: '**⚠️ 异常提醒**' } },
      { tag: 'div', text: { tag: 'lark_md', content: '• SKU-B456 库存仅剩 8 件，建议补货\n• 物流时效略有下降' } },
      { tag: 'hr' },
      { tag: 'div', text: { tag: 'lark_md', content: '**✅ 亮点**\n• 新品表现超预期，ROI达3.5\n• 印尼站订单增长明显' } },
      {
        tag: 'action',
        actions: [
          { tag: 'button', text: { tag: 'plain_text', content: '查看详情' }, type: 'primary', url: 'https://c3471164-d4a8-459c-a047-271336351e54.dev.coze.site/dashboard' }
        ]
      }
    ]
  };
}

function buildInventoryAlertCard() {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🔔 库存预警' },
      template: 'orange'
    },
    elements: [
      { tag: 'div', text: { tag: 'lark_md', content: '共 **2** 件商品库存不足' } },
      { tag: 'hr' },
      { tag: 'div', text: { tag: 'lark_md', content: 
        '**1. SKU-B456** - 宠物玩具\n当前库存: 8件 | 安全库存: 20件\n💡 建议补货: 50件\n\n' +
        '**2. SKU-C789** - 宠物饮水机\n当前库存: 12件 | 安全库存: 15件\n💡 建议补货: 30件'
      }},
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          { tag: 'button', text: { tag: 'plain_text', content: '生成采购单' }, type: 'primary' },
          { tag: 'button', text: { tag: 'plain_text', content: '查看库存' }, type: 'default', url: 'https://c3471164-d4a8-459c-a047-271336351e54.dev.coze.site/feishu/inventory' }
        ]
      }
    ]
  };
}

function buildAdSpendCard() {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📈 今日广告消耗' },
      template: 'green'
    },
    elements: [
      {
        tag: 'column_set',
        flex_mode: 'none',
        elements: [
          { tag: 'column', width: 'weighted', weight: 1, elements: [
            { tag: 'markdown', content: '**TikTok印尼**\n花费: ¥650\n订单: 23单\nROI: 2.8' }
          ]},
          { tag: 'column', width: 'weighted', weight: 1, elements: [
            { tag: 'markdown', content: '**亚马逊美国**\n花费: ¥1,280\n订单: 35单\nROI: 3.2' }
          ]}
        ]
      },
      { tag: 'hr' },
      { tag: 'div', text: { tag: 'lark_md', content: '**总计**: ¥1,930 / ¥3,000 预算\n**整体 ROI**: 3.0\n**状态**: 正常 ✅' } }
    ]
  };
}

function buildProductSelectionCard() {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🎯 智能选品建议' },
      template: 'purple'
    },
    elements: [
      { tag: 'div', text: { tag: 'lark_md', content: 
        '**1. 宠物自动喂食器**\n📦 预估月销量: 2,500单\n💰 预估利润率: 35%\n📊 竞争度: 中\n\n' +
        '**2. 宠物饮水机**\n📦 预估月销量: 1,800单\n💰 预估利润率: 28%\n📊 竞争度: 低\n\n' +
        '**3. 宠物玩具套装**\n📦 预估月销量: 2,200单\n💰 预估利润率: 32%\n📊 竞争度: 中'
      }},
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          { tag: 'button', text: { tag: 'plain_text', content: '采集第1个' }, type: 'primary' },
          { tag: 'button', text: { tag: 'plain_text', content: '查看详情' }, type: 'default' }
        ]
      }
    ]
  };
}

function buildWelcomeCard() {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '👋 您好，龙掌柜智能助理' },
      template: 'blue'
    },
    elements: [
      { tag: 'div', text: { tag: 'lark_md', content: '我是您的**智能运营助理**，可以帮您：' } },
      { tag: 'hr' },
      { tag: 'div', text: { tag: 'lark_md', content: 
        '📊 **数据查询**\n• "今天运营情况怎么样？"\n• "哪些商品库存不足？"\n• "广告花了多少钱？"\n\n' +
        '🎯 **智能选品**\n• "帮我选3款宠物用品"\n• "分析一下这个新品"\n\n' +
        '💬 **文案生成**\n• "写一个催好评的消息"'
      }},
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          { tag: 'button', text: { tag: 'plain_text', content: '📊 查看运营日报' }, type: 'primary' },
          { tag: 'button', text: { tag: 'plain_text', content: '🎯 智能选品' }, type: 'default' }
        ]
      }
    ]
  };
}

function buildDefaultCard(text: string) {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🤖 龙掌柜智能助理' },
      template: 'grey'
    },
    elements: [
      { tag: 'div', text: { tag: 'lark_md', content: `收到您的消息：「**${text}**」` } },
      { tag: 'hr' },
      { tag: 'div', text: { tag: 'lark_md', content: '抱歉，我暂时无法理解这个指令。\n\n您可以尝试以下命令：' } },
      { tag: 'div', text: { tag: 'lark_md', content: 
        '• "今天的运营情况怎么样？"\n' +
        '• "哪些商品库存不足？"\n' +
        '• "帮我选3款宠物用品"\n' +
        '• "写一个催好评的消息"'
      }}
    ]
  };
}

// ==================== 飞书 API 调用 ====================

async function sendFeishuCardMessage(chatId: string, card: any) {
  try {
    // 获取 token
    const tokenResponse = await fetch(`${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.apiPaths.TENANT_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: FEISHU_CONFIG.appId, app_secret: FEISHU_CONFIG.appSecret }),
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.tenant_access_token;
    
    if (!accessToken) {
      throw new Error('获取 access_token 失败');
    }
    
    // 发送卡片消息
    const sendResponse = await fetch(`${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.apiPaths.SEND_MESSAGE}?receive_id_type=chat_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        msg_type: 'interactive',
        receive_id: chatId,
        content: JSON.stringify(card),
      }),
    });
    
    const sendData = await sendResponse.json();
    if (sendData.code !== 0) {
      console.error('[Feishu] 发送卡片失败:', sendData);
    }
    
    return sendData;
  } catch (error) {
    console.error('[Feishu] 发送卡片异常:', error);
    throw error;
  }
}
