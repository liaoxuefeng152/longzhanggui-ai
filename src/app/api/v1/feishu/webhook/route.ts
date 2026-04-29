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
  if (lowerMsg.includes('数据') || lowerMsg.includes('日报') || lowerMsg.includes('销量')) {
    return { intent: 'data-query', action: '查看数据报表', params: {} };
  }
  
  // 库存
  if (lowerMsg.includes('库存') || lowerMsg.includes('补货') || lowerMsg.includes('预警')) {
    return { intent: 'inventory', action: '查看库存情况', params: {} };
  }
  
  // 订单
  if (lowerMsg.includes('订单') || lowerMsg.includes('物流') || lowerMsg.includes('发货')) {
    return { intent: 'orders', action: '查看订单列表', params: {} };
  }
  
  // 客服
  if (lowerMsg.includes('客服') || lowerMsg.includes('差评') || lowerMsg.includes('回复')) {
    return { intent: 'customer-service', action: '跳转到客服处理', params: {} };
  }
  
  // 默认
  return { intent: 'general', action: '智能回复', params: {} };
}

// 生成AI回复
function generateAIResponse(message: string, intent: string): string {
  const responses: Record<string, string> = {
    'product-selection': `好的，我来帮你进行选品分析！

请告诉我：
1. **目标市场**：东南亚/欧美/拉美？
2. **类目偏好**：3C数码/家居/服装/美妆？
3. **预算范围**：每款产品的采购预算？
4. **核心诉求**：爆款/蓝海/差异化？

你可以直接告诉我你的需求，例如：
- "帮我选3款3C产品，主攻东南亚市场"
- "找一些家居类蓝海产品"

输入你的需求，我将调用选品SKILL为你分析！`,

    'image-design': `好的，我来帮你处理图片！

支持的图片处理功能：
1. **图片翻译**：将图片中的文字翻译成目标语言
2. **主图优化**：生成更吸引人的产品主图
3. **白底图**：将图片背景处理成白底

请直接发送图片并告诉我需要什么处理，例如：
- "翻译这张图片成英文"
- "帮我优化这个产品主图"

我将通过图片设计SKILL为你处理！`,

    'listing': `好的，我来帮你优化Listing！

请提供商品信息，我可以帮你：
1. **标题优化**：提升搜索排名和点击率
2. **五点描述**：突出产品卖点
3. **关键词挖掘**：找到高流量关键词
4. **多语言翻译**：英语/泰语/越南语等

请告诉我：
- 商品链接或详细信息
- 需要优化的语言版本

我将调用Listing优化SKILL为你服务！`,

    'advertising': `好的，我来帮你分析广告投放！

请告诉我：
1. **广告目标**：新品推广/爆款打造/清库存？
2. **目标平台**：TikTok/Amazon/Shopee？
3. **预算范围**：日预算多少？
4. **预期ROI**：想要达到几倍回报？

我可以帮你：
- 分析竞品广告策略
- 制定广告投放方案
- 监控ROI表现

请输入你的需求！`,

    'data-query': `好的，我来帮你查询数据！

支持的查询：
1. **销售数据**：今日/本周/本月销量
2. **TOP商品**：销量最高的产品
3. **利润分析**：各产品利润情况
4. **运营日报**：每日运营汇总

请告诉我你想要查询什么数据？`,

    'inventory': `好的，我来帮你查看库存！

我可以帮你：
1. **库存预警**：低于安全库存的商品
2. **补货建议**：需要及时补货的产品
3. **库存分析**：库存周转情况

请告诉我你想要查看什么？`,

    'orders': `好的，我来帮你处理订单！

支持的订单功能：
1. **订单查询**：查看订单状态和详情
2. **物流跟踪**：追踪包裹物流信息
3. **异常订单**：处理退款、退货、纠纷

请告诉我你的需求？`,

    'customer-service': `好的，我来帮你处理客服问题！

支持的客服功能：
1. **回复生成**：AI生成专业客服回复
2. **差评处理**：分析差评原因并给出解决方案
3. **纠纷处理**：帮助处理平台纠纷

请告诉我遇到了什么客服问题？`,

    'general': `你好！我是龙掌柜跨境AI全能助手。

我可以帮你完成以下工作：

**AI SKILL能力：**
1. 📦 选品分析 - 帮你找到爆款产品
2. 🖼️ 图片设计 - 图片翻译、主图优化
3. 📝 Listing优化 - 标题、描述、关键词
4. 📊 广告投放 - ROI分析、投放策略
5. 💬 客服处理 - 回复生成、差评处理
6. 📈 数据复盘 - 销售分析、运营日报
7. 💰 智能定价 - 成本计算、利润优化

**你可以这样问我：**
- "帮我选3款3C产品"
- "翻译这张产品图片"
- "今天销量多少？"
- "帮我分析这个新品"

请告诉我你需要什么帮助！`,
  };
  
  return responses[intent] || responses['general'];
}

// 处理飞书事件
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = request.headers;
    
    // 获取飞书配置
    const db = getDb();
    const config = db.prepare('SELECT * FROM feishu_config WHERE id = 1').get() as any;
    
    if (!config || !config.app_id || !config.app_secret) {
      return NextResponse.json({ error: '飞书配置未完成' }, { status: 400 });
    }
    
    const data = JSON.parse(body);
    console.log('收到飞书事件:', JSON.stringify(data));
    
    // 处理URL验证
    if (data.type === 'url_verification') {
      return NextResponse.json({
        challenge: data.challenge,
      });
    }
    
    // 处理事件回调
    if (data.header?.event_type) {
      const eventType = data.header.event_type;
      const event = data.event;
      
      // 获取tenant_access_token
      const accessToken = await getTenantAccessToken(config.app_id, config.app_secret);
      
      if (!accessToken) {
        return NextResponse.json({ error: '获取access_token失败' }, { status: 500 });
      }
      
      // 处理接收消息事件
      if (eventType === 'im.message.receive_v1') {
        const message = event.message;
        const sender = event.sender;
        
        // 只处理用户发给机器人的私聊消息
        if (message.chat_type !== 'p2p') {
          return NextResponse.json({ code: 0, msg: '群消息暂不支持' });
        }
        
        // 过滤掉机器人自己的消息
        if (sender?.sender_type === 'app') {
          return NextResponse.json({ code: 0, msg: '忽略机器人消息' });
        }
        
        // 解析消息内容
        let textContent = '';
        if (message.message_type === 'text') {
          const content = JSON.parse(message.content);
          textContent = content.text;
        } else if (message.message_type === 'post') {
          textContent = '[用户发送了富文本/图片消息]';
        }
        
        console.log('收到用户消息:', textContent);
        
        // 识别意图
        const intent = recognizeIntent(textContent);
        console.log('识别意图:', intent);
        
        // 生成回复
        const reply = generateAIResponse(textContent, intent.intent);
        
        // 发送回复
        const success = await sendMessage(
          accessToken,
          'message_id',
          message.message_id,
          'text',
          JSON.stringify({ text: reply })
        );
        
        if (success) {
          console.log('回复发送成功');
        } else {
          console.error('回复发送失败');
        }
        
        return NextResponse.json({ code: 0, msg: 'success' });
      }
    }
    
    return NextResponse.json({ code: 0, msg: 'success' });
  } catch (error) {
    console.error('处理飞书事件失败:', error);
    return NextResponse.json({ error: '处理失败' }, { status: 500 });
  }
}

// GET请求用于验证
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '飞书Webhook服务正常运行',
    time: new Date().toISOString(),
  });
}
