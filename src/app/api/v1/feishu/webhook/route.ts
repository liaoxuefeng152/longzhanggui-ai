import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookToken, sendTextMessage } from '@/lib/feishu/client';
import { recognizeIntent, getIntentDescription, generateHelpMessage } from '@/lib/feishu/intent';
import { handleWorkflow } from '@/lib/feishu/workflow';

/**
 * 飞书 Webhook 路由
 * 接收飞书机器人推送的消息
 */
export async function POST(request: NextRequest) {
  // 设置 CORS 头
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = await request.json();
    console.log('=== 飞书 Webhook 收到请求 ===');
    console.log('完整的请求体:', JSON.stringify(body, null, 2));

    const { token, type, challenge, event, header } = body;

    console.log('解析后的字段:', { type, token: !!token, event: !!event, header: !!header });
    if (header) {
      console.log('Header 信息:', { event_type: header.event_type, event_id: header.event_id });
    }

    // URL 验证（首次配置时）
    if (type === 'url_verification') {
      console.log('URL 验证请求:', { token, challenge });

      // 验证 token
      if (!verifyWebhookToken(token)) {
        console.error('Token 验证失败');
        return new Response(JSON.stringify({ code: 1, msg: 'Invalid token' }), {
          status: 403,
          headers,
        });
      }

      console.log('Token 验证成功，返回 challenge');
      // 飞书要求返回标准 JSON 格式，只包含 challenge 字段
      return new Response(JSON.stringify({ challenge }), {
        status: 200,
        headers,
      });
    }

    // 消息接收 - 检查 header.event_type 或直接检查 event 内容
    const eventType = header?.event_type;
    if (eventType === 'im.message.receive_v1' || (event && event.message)) {
      console.log('收到事件回调:', eventType || 'im.message.receive_v1');
      console.log('事件详情:', JSON.stringify(event, null, 2));

      const message = event.message;
      const sender = event.sender;

      // 提取消息内容
      const messageContent = message.content;
      let messageText = '';

      try {
        const content = JSON.parse(messageContent);
        messageText = content.text || '';
      } catch {
        messageText = messageContent || '';
      }

      console.log('用户消息:', {
        userId: sender.sender_id.user_id || sender.sender_id.open_id,
        text: messageText,
        messageId: message.message_id,
      });

      // 忽略空消息或机器人自己的消息
      if (!messageText || messageText.trim() === '') {
        console.log('忽略空消息');
        return new Response(JSON.stringify({ code: 0, msg: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 获取用户 open_id（优先使用 open_id，如果没有则使用 user_id）
      const userOpenId = sender.sender_id.open_id || sender.sender_id.user_id;

      // 识别意图
      const intentResult = recognizeIntent(messageText);
      console.log('意图识别结果:', intentResult);

      // 调用工作流处理
      console.log('开始调用工作流...');
      await handleWorkflow(
        userOpenId,
        intentResult.intent,
        intentResult.params,
        messageText
      );
      console.log('工作流调用完成');

      return new Response(JSON.stringify({ code: 0, msg: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('未知的事件类型或没有事件数据');
    console.log('Event Type:', eventType);
    console.log('Has Event:', !!event);
    return new Response(JSON.stringify({ code: 0, msg: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('处理飞书 Webhook 失败:', error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : '');
    return new Response(
      JSON.stringify({ code: 1, msg: error instanceof Error ? error.message : 'Internal error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * GET 请求 - 返回 Webhook 配置信息
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: '飞书机器人 Webhook 已就绪',
    webhookUrl: '/api/v1/feishu/webhook',
  });
}
