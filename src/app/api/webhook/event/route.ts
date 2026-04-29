import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

// 飞书API基础URL
const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis';

// 获取tenant_access_token
async function getTenantAccessToken(appId: string, appSecret: string): Promise<string | null> {
  try {
    const response = await fetch(`${FEISHU_API_BASE}/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    });
    
    const data = await response.json();
    if (data.code === 0) {
      return data.tenant_access_token;
    }
    console.error('获取tenant_access_token失败:', data);
    return null;
  } catch (error) {
    console.error('获取tenant_access_token异常:', error);
    return null;
  }
}

// 验证飞书签名
function verifyFeishuSignature(
  body: string,
  timestamp: string,
  sign: string,
  secret: string
): boolean {
  const stringToSign = `${timestamp}${body}${secret}`;
  const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');
  return signature === sign;
}

// 发送消息给用户
async function sendMessage(
  accessToken: string,
  receiveIdType: string,
  receiveId: string,
  msgType: string,
  content: string
): Promise<boolean> {
  try {
    const response = await fetch(`${FEISHU_API_BASE}/im/v1/messages?receive_id_type=${receiveIdType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: msgType,
        content: content,
      }),
    });
    
    const data = await response.json();
    return data.code === 0;
  } catch (error) {
    console.error('发送消息失败:', error);
    return false;
  }
}

// 意图识别
function recognizeIntent(message: string): { intent: string; action: string; params: any } {
  const lowerMsg = message.toLowerCase();
  
  // 选品分析
  if (lowerMsg.includes('选品') || lowerMsg.includes('爆款') || lowerMsg.includes('热卖')) {
    return { intent: 'product-selection', action: '跳转到选品SKILL', params: {} };
  }
  
  // 图片翻译
  if (lowerMsg.includes('图片') || lowerMsg.includes('翻译') || lowerMsg.includes('主图')) {
    return { intent: 'image-design', action: '跳转到图片设计', params: {} };
  }
  
  // Listing优化
  if (lowerMsg.includes('listing') || lowerMsg.includes('标题') || lowerMsg.includes('描述')) {
    return { intent: 'listing', action: '跳转到Listing优化', params: {} };
  }
  
  // 广告
  if (lowerMsg.includes('广告') || lowerMsg.includes('roi') || lowerMsg.includes('预算')) {
    return { intent: 'advertising', action: '跳转到广告投放', params: {} };
  }
  
  // 数据查询
  if (lowerMsg.includes('数据') || lowerMsg.includes('报表') || lowerMsg.includes('日报')) {
    return { intent: 'data', action: '查看数据报表', params: {} };
  }
  
  // 库存查询
  if (lowerMsg.includes('库存') || lowerMsg.includes('补货') || lowerMsg.includes('预警')) {
    return { intent: 'inventory', action: '查看库存情况', params: {} };
  }
  
  // 订单查询
  if (lowerMsg.includes('订单') || lowerMsg.includes('物流') || lowerMsg.includes('发货')) {
    return { intent: 'order', action: '查看订单列表', params: {} };
  }
  
  // 客服
  if (lowerMsg.includes('客服') || lowerMsg.includes('回复') || lowerMsg.includes('差评')) {
    return { intent: 'customer-service', action: '客服处理', params: {} };
  }
  
  // 帮助
  if (lowerMsg.includes('帮助') || lowerMsg.includes('功能') || lowerMsg.includes('怎么')) {
    return { intent: 'help', action: '显示功能列表', params: {} };
  }
  
  // 默认
  return { intent: 'chat', action: '智能对话', params: {} };
}

// 生成AI回复
function generateReply(message: string, intent: string, action: string): string {
  const replies: Record<string, string> = {
    'product-selection': `好的！我来帮你分析选品策略。

【选品SKILL】可以帮你：
📊 市场趋势分析
🔍 竞品研究
🎯 蓝海类目挖掘
💰 利润测算

请问你关注哪个类目或市场？`,
    
    'image-design': `好的！我来帮你处理图片。

【图片设计SKILL】可以帮你：
🌐 图片翻译（支持中英泰越马来等语言）
📷 主图优化
⚪ 一键白底
🎨 AI图片生成

请上传需要处理的图片~`,
    
    'listing': `好的！我来帮你优化Listing。

【Listing优化SKILL】可以帮你：
✨ 标题优化
📝 五点描述撰写
🏷️ 关键词挖掘
🌐 多语言翻译

请提供商品信息或现有Listing~`,
    
    'advertising': `好的！我来帮你分析广告。

【广告投放SKILL】可以帮你：
📈 广告数据分析
💵 ROI优化建议
🎯 关键词策略
💰 预算分配

请提供广告账户或ASIN信息~`,
    
    'data': `好的！我来帮你查询数据。

【数据报表】可以查看：
📊 销售数据
📈 运营指标
📦 库存状况
💰 财务数据

请问你想看哪方面的数据？`,
    
    'inventory': `好的！我来帮你查看库存。

【库存管理】可以：
📦 实时库存查询
⚠️ 库存预警提醒
📋 补货建议

请问你想查哪个商品？`,
    
    'order': `好的！我来帮你查询订单。

【订单管理】可以：
📦 订单状态查询
🚚 物流跟踪
📋 异常订单处理

请提供订单号或相关信息~`,
    
    'customer-service': `好的！我来帮你处理客服问题。

【客服SKILL】可以帮你：
💬 智能回复建议
⭐ 差评处理方案
📋 工单管理
🔄 纠纷处理

请问是什么问题？`,
    
    'help': `你好！我是龙掌柜跨境AI全能助手 👋

我可以帮你完成以下操作：

🛒 【选品】帮你分析爆款和蓝海类目
🖼️ 【图片】翻译图片和主图优化
📝 【Listing】标题和描述优化
📊 【广告】投放策略和ROI分析
📦 【库存】管理和补货建议
📋 【订单】查询和物流跟踪
💬 【客服】回复建议和差评处理
📈 【数据】销售报表和运营分析

请告诉我你需要什么帮助~`,
    
    'chat': `你好！我是龙掌柜跨境AI全能助手 👋

很高兴为你服务！请问有什么可以帮你的？

你可以：
• 咨询选品、市场分析
• 处理图片和Listing
• 查看销售数据和库存
• 处理订单和客服问题

请告诉我你的需求~`
  };
  
  return replies[intent] || replies['chat'];
}

// GET 请求 - 用于飞书验证URL
export async function GET(request: NextRequest) {
  const db = getDb();
  
  // 获取飞书配置
  const config = db.prepare('SELECT * FROM feishu_config WHERE id = 1').get() as any;
  
  if (!config) {
    return NextResponse.json(
      { code: 400, msg: '飞书配置未找到' },
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 飞书URL验证
  const url = new URL(request.url);
  const challenge = url.searchParams.get('challenge');
  
  if (challenge) {
    // 返回挑战值进行验证 - 飞书要求必须返回 challenge 字段
    console.log('飞书URL验证 challenge:', challenge);
    return NextResponse.json(
      { challenge },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return NextResponse.json(
    { code: 0, msg: 'ok' },
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

// POST 请求 - 用于接收飞书事件
export async function POST(request: NextRequest) {
  const db = getDb();
  
  try {
    // 获取飞书配置
    const config = db.prepare('SELECT * FROM feishu_config WHERE id = 1').get() as any;
    
    if (!config) {
      console.error('飞书配置未找到');
      return NextResponse.json({ error: '飞书配置未找到' }, { status: 404 });
    }
    
    const body = await request.text();
    const data = JSON.parse(body);
    
    // URL验证（飞书第一次配置回调地址时会发送challenge）
    if (data.challenge) {
      console.log('[飞书] URL验证成功');
      return NextResponse.json({ challenge: data.challenge });
    }
    
    // 处理事件
    console.log('[飞书] 1. 收到事件数据, keys:', Object.keys(data));
    console.log('[飞书] 2. event存在:', !!data.event);
    console.log('[飞书] 3. event.type:', data.event?.type);
    
    if (data.event && data.event.type === 'im.message.receive_v1') {
      const message = data.event.message;
      console.log('[飞书] 4. message存在:', !!message);
      console.log('[飞书] 5. message_type:', message?.message_type);
      
      // 只处理文本消息
      if (message.message_type !== 'text') {
        console.log('[飞书] 非文本消息，忽略');
        return NextResponse.json({ status: 'ignored', reason: 'not text' });
      }
      
      // 解析消息内容
      let textContent = '';
      try {
        const content = JSON.parse(message.content);
        textContent = content.text || '';
        console.log('[飞书] 6. 解析后文本:', textContent);
      } catch (e) {
        textContent = message.content;
        console.log('[飞书] 6. 原始文本:', textContent);
      }
      
      console.log('[飞书] 7. 发送者ID:', message.sender?.sender_id?.open_id);
      
      // 识别意图
      console.log('[飞书] 8. 开始识别意图...');
      const { intent, action } = recognizeIntent(textContent);
      console.log('[飞书] 9. 识别结果:', intent, action);
      
      // 生成回复
      console.log('[飞书] 10. 开始生成回复...');
      const reply = generateReply(textContent, intent, action);
      console.log('[飞书] 11. 回复内容:', reply.substring(0, 100));
      
      // 获取tenant_access_token
      console.log('获取access_token...');
      const accessToken = await getTenantAccessToken(config.app_id, config.app_secret);
      
      if (!accessToken) {
        console.error('获取access_token失败');
        return NextResponse.json({ error: '获取access_token失败' }, { status: 500 });
      }
      console.log('access_token获取成功');
      
      // 发送回复消息
      const senderOpenId = message.sender?.sender_id?.open_id;
      console.log('发送给:', senderOpenId);
      
      if (!senderOpenId) {
        console.error('无法获取发送者open_id');
        return NextResponse.json({ error: 'no sender open_id' }, { status: 400 });
      }
      
      const success = await sendMessage(
        accessToken,
        'open_id',
        senderOpenId,
        'text',
        JSON.stringify({ text: reply })
      );
      
      console.log('发送结果:', success);
      if (success) {
        console.log('消息发送成功');
      } else {
        console.error('消息发送失败');
      }
      
      return NextResponse.json({ status: 'ok', success });
    }
    
    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('处理飞书事件异常:', error);
    return NextResponse.json({ error: '处理异常' }, { status: 500 });
  }
}
