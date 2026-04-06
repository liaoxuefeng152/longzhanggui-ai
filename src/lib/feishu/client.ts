/**
 * 飞书 API 客户端
 * 用于与飞书开放平台交互
 */

import { FEISHU_CONFIG, FEISHU_API_PATHS } from './config';

// Tenant Access Token 缓存
let tenantAccessToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 获取 Tenant Access Token
 */
export async function getTenantAccessToken(): Promise<string> {
  // 检查 token 是否过期
  if (tenantAccessToken && Date.now() < tokenExpireTime) {
    return tenantAccessToken;
  }

  try {
    const response = await fetch(
      `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_API_PATHS.TENANT_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: FEISHU_CONFIG.appId,
          app_secret: FEISHU_CONFIG.appSecret,
        }),
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`获取 Token 失败: ${data.msg}`);
    }

    tenantAccessToken = data.tenant_access_token;
    // token 有效期为 2 小时，提前 5 分钟过期
    tokenExpireTime = Date.now() + (data.expire - 300) * 1000;

    return tenantAccessToken;
  } catch (error) {
    console.error('获取 Tenant Access Token 失败:', error);
    throw error;
  }
}

/**
 * 发送消息到飞书
 * @param receiveId 接收者 ID（用户 open_id 或群 chat_id）
 * @param msgType 消息类型
 * @param content 消息内容
 */
export async function sendMessage(
  receiveId: string,
  msgType: 'text' | 'interactive' | 'post' | 'card',
  content: any
): Promise<any> {
  const token = await getTenantAccessToken();

  try {
    const response = await fetch(
      `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_API_PATHS.SEND_MESSAGE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msg_type: msgType,
          receive_id: receiveId,
          receive_id_type: 'open_id', // 明确指定接收者类型为 open_id
          content: typeof content === 'string' ? content : JSON.stringify(content),
        }),
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`发送消息失败: ${data.msg} (code: ${data.code})`);
    }

    return data;
  } catch (error) {
    console.error('发送消息失败:', error);
    throw error;
  }
}

/**
 * 发送文本消息
 * @param receiveId 接收者 ID（用户 open_id 或群 chat_id）
 * @param text 文本内容
 */
export async function sendTextMessage(receiveId: string, text: string): Promise<any> {
  return sendMessage(receiveId, 'text', {
    text: text,
  });
}

/**
 * 发送交互式卡片消息
 * @param receiveId 接收者 ID（用户 open_id 或群 chat_id）
 * @param card 卡片内容
 */
export async function sendCardMessage(receiveId: string, card: any): Promise<any> {
  return sendMessage(receiveId, 'interactive', {
    config: {
      wide_screen_mode: true,
    },
    header: {
      template: 'blue',
      title: {
        content: card.title || '消息',
        tag: 'plain_text',
      },
    },
    elements: card.elements || [],
  });
}

/**
 * 创建成功卡片
 * @param title 标题
 * @param content 内容
 * @param actions 操作按钮
 */
export function createSuccessCard(
  title: string,
  content: string[],
  actions?: Array<{ text: string; url?: string; value?: string }>
) {
  return {
    title,
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: content.join('\n\n'),
        },
      },
      ...(actions ? [
        {
          tag: 'action',
          actions: actions.map(action => ({
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: action.text,
            },
            type: 'primary',
            url: action.url,
            value: action.value,
          })),
        },
      ] : []),
    ],
  };
}

/**
 * 创建错误卡片
 * @param title 标题
 * @param error 错误信息
 */
export function createErrorCard(title: string, error: string) {
  return {
    title,
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `❌ **错误**\n\n${error}`,
        },
      },
    ],
  };
}

/**
 * 创建处理中卡片
 * @param title 标题
 * @param message 提示信息
 */
export function createProcessingCard(title: string, message: string) {
  return {
    title,
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `⏳ **处理中**\n\n${message}\n\n请稍候...`,
        },
      },
    ],
  };
}

/**
 * 验证 Webhook 请求
 * @param token 验证令牌
 * @returns 是否验证通过
 */
export function verifyWebhookToken(token: string): boolean {
  return token === FEISHU_CONFIG.verificationToken;
}

export default {
  getTenantAccessToken,
  sendMessage,
  sendTextMessage,
  sendCardMessage,
  createSuccessCard,
  createErrorCard,
  createProcessingCard,
  verifyWebhookToken,
};
