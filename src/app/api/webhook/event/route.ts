import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FEISHU_CONFIG } from '@/lib/feishu/config';
import { sendMessage } from '@/lib/feishu/client';

// 获取飞书配置
async function getFeishuConfigFromDb(): Promise<Record<string, string> | null> {
  try {
    const db = getDb();
    const config = db.prepare('SELECT * FROM feishu_config WHERE id = 1').get() as Record<string, string> | undefined;
    return config || null;
  } catch (error) {
    console.error('[飞书] 获取配置失败:', error);
    return null;
  }
}

// 调用AI生成回复
async function callAI(userMessage: string): Promise<string> {
  try {
    console.log('[飞书] 调用AI服务...');
    
    const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        user_id: 'feishu_user'
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI服务返回错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[飞书] AI响应数据:', JSON.stringify(data).substring(0, 200));
    
    return data.reply || data.content || data.message || data.response || '处理成功';
  } catch (error) {
    console.error('[飞书] AI调用失败:', error);
    throw error;
  }
}

// 生成回复
async function generateReply(message: string, intent: string, action: string): Promise<string> {
  try {
    const aiReply = await callAI(message);
    return aiReply;
  } catch (error) {
    console.error('[飞书] AI回复生成失败:', error);
    return '消息已收到，正在处理中...';
  }
}

// GET 请求 - 用于飞书验证URL
export async function GET(request: NextRequest) {
  const db = getDb();
  
  // 飞书URL验证
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    console.log('[飞书] URL验证请求');
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// POST 请求 - 处理飞书事件
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('[飞书] 收到事件:', JSON.stringify(data).substring(0, 500));
    
    // URL验证请求
    if (data.type === 'url_verification') {
      console.log('[飞书] URL验证通过');
      return new NextResponse(data.challenge, { status: 200 });
    }
    
    // 获取事件类型
    const eventType = data.header?.event_type;
    console.log('[飞书] 事件类型:', eventType);
    
    if (eventType !== 'im.message.receive_v1') {
      console.log('[飞书] 非消息事件，跳过');
      return NextResponse.json({ code: 0 });
    }
    
    const event = data.event;
    if (!event) {
      console.log('[飞书] 无事件数据');
      return NextResponse.json({ code: 0 });
    }
    
    const messageType = event.message?.message_type;
    console.log('[飞书] 消息类型:', messageType);
    
    if (messageType !== 'text') {
      console.log('[飞书] 非文本消息，跳过');
      return NextResponse.json({ code: 0 });
    }
    
    const chatId = event.message?.chat_id;
    const messageId = event.message?.message_id;
    const content = event.message?.content;
    
    // 解析消息内容
    let text = '';
    try {
      const msgContent = JSON.parse(content);
      text = msgContent.text || '';
    } catch {
      text = content;
    }
    
    // 去掉@机器人前缀
    text = text.replace(/@_user_1\s*/g, '').trim();
    
    console.log('[飞书] 解析后消息:', text);
    console.log('[飞书] chat_id:', chatId);
    console.log('[飞书] message_id:', messageId);
    
    if (!text) {
      console.log('[飞书] 空消息，跳过');
      return NextResponse.json({ code: 0 });
    }
    
    // 生成AI回复
    console.log('[飞书] 开始生成AI回复...');
    const reply = await generateReply(text, '', '');
    console.log('[飞书] AI回复:', reply.substring(0, 200));
    
    // 发送回复
    console.log('[飞书] 准备发送回复到:', chatId);
    
    // 获取飞书配置
    const config = await getFeishuConfigFromDb();
    if (!config) {
      console.error('[飞书] 未配置飞书');
      return NextResponse.json({ error: '未配置飞书' }, { status: 500 });
    }
    
    const appId = config.app_id || config.appId || '';
    const appSecret = config.app_secret || config.appSecret || '';
    
    // 获取token
    const tokenResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.tenant_access_token;
    
    if (!accessToken) {
      console.error('[飞书] 获取access_token失败');
      return NextResponse.json({ error: '获取token失败' }, { status: 500 });
    }
    
    console.log('[飞书] 获取token成功');
    
    // 发送消息到群聊
    const sendResponse = await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({ text: reply })
      })
    });
    
    const sendResult = await sendResponse.json();
    console.log('[飞书] 发送结果:', JSON.stringify(sendResult).substring(0, 200));
    
    if (sendResult.code === 0) {
      console.log('[飞书] ✅ 消息发送成功!');
      return NextResponse.json({ code: 0, message: 'success' });
    } else {
      console.error('[飞书] ❌ 发送失败:', sendResult.msg);
      return NextResponse.json(sendResult, { status: 500 });
    }
    
  } catch (error) {
    console.error('[飞书] 处理异常:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
