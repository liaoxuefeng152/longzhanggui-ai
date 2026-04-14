/**
 * 飞书智能助理 - 消息推送服务
 * 支持同步消息发送和异步任务结果推送
 */

import { FEISHU_CONFIG } from './config';
import { getTask, TaskType } from './task-queue';

/**
 * 飞书消息推送客户端
 */
export class FeishuPushClient {
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  /**
   * 获取 Access Token
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(
      `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.apiPaths.TENANT_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: FEISHU_CONFIG.appId,
          app_secret: FEISHU_CONFIG.appSecret,
        }),
      }
    );

    const data = await response.json();
    
    if (data.code !== 0 || !data.tenant_access_token) {
      throw new Error(`获取Token失败: ${data.msg}`);
    }

    this.accessToken = data.tenant_access_token;
    // 提前5分钟过期
    this.tokenExpiry = Date.now() + (data.expire - 300) * 1000;

    return this.accessToken;
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(receiveId: string, receiveIdType: string, text: string): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.apiPaths.SEND_MESSAGE}?receive_id_type=${receiveIdType}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          msg_type: 'text',
          receive_id: receiveId,
          content: JSON.stringify({ text }),
        }),
      }
    );

    const data = await response.json();
    if (data.code !== 0) {
      console.error(`[Push] 发送文本失败: ${data.msg}`);
      return;
    }
  }

  /**
   * 发送卡片消息
   */
  async sendCardMessage(
    receiveId: string,
    receiveIdType: string,
    card: any
  ): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${FEISHU_CONFIG.apiBaseUrl}${FEISHU_CONFIG.apiPaths.SEND_MESSAGE}?receive_id_type=${receiveIdType}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          msg_type: 'interactive',
          receive_id: receiveId,
          content: JSON.stringify(card),
        }),
      }
    );

    const data = await response.json();
    if (data.code !== 0) {
      console.error(`[Push] 发送失败: ${data.msg}`);
      return; // 不要抛出异常
    }
  }
}

// 全局推送客户端
const globalPushClient = new FeishuPushClient();

/**
 * 推送任务结果到用户
 */
export async function pushTaskResult(taskId: string): Promise<void> {
  const task = getTask(taskId);
  if (!task) {
    console.error(`[Push] 任务不存在: ${taskId}`);
    return;
  }

  try {
    const receiveId = task.chatId;
    const receiveIdType = 'chat_id';

    // 根据任务类型生成不同的卡片
    let card: any;

    switch (task.type) {
      case TaskType.SELECT_PRODUCTS:
        card = buildProductSelectionResultCard(task);
        break;
      case TaskType.CREATE_AD:
        card = buildAdCreatedResultCard(task);
        break;
      default:
        card = buildGenericResultCard(task);
    }

    await globalPushClient.sendCardMessage(receiveId, receiveIdType, card);
    console.log(`[Push] 任务结果已推送: ${taskId}`);
  } catch (error) {
    console.error(`[Push] 推送失败:`, error);
  }
}

/**
 * 推送进度更新
 */
export async function pushTaskProgress(
  chatId: string,
  taskId: string,
  progress: number,
  message: string
): Promise<void> {
  try {
    const card = {
      config: { wide_screen_mode: true },
      elements: [
        {
          tag: 'markdown',
          content: `**任务进行中...**\n\n${message}`,
        },
        {
          tag: 'progress',
          value: progress,
        },
        {
          tag: 'note',
          elements: [
            {
              tag: 'plain_text',
              content: `任务ID: ${taskId}`,
            },
          ],
        },
      ],
    };

    await globalPushClient.sendCardMessage(chatId, 'chat_id', card);
  } catch (error) {
    console.error(`[Push] 进度推送失败:`, error);
  }
}

/**
 * 推送欢迎消息
 */
export async function pushWelcomeMessage(chatId: string): Promise<void> {
  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🤖 欢迎使用龙掌柜智能运营助理' },
      template: 'blue',
    },
    elements: [
      {
        tag: 'markdown',
        content: '您好！我是龙掌柜智能运营助理，可以帮您：\n\n**📊 数据查询** - 运营日报、库存预警、订单状态\n**🎯 智能选品** - AI推荐热销商品\n**✍️ 文案生成** - 催好评、产品描述\n**📈 广告管理** - 创建广告计划\n\n有什么可以帮您的？',
      },
      { tag: 'hr' },
      {
        tag: 'note',
        elements: [
          { tag: 'plain_text', content: '输入"有什么功能"查看全部能力' },
        ],
      },
    ],
  };

  try {
    await globalPushClient.sendCardMessage(chatId, 'chat_id', card);
  } catch (error) {
    console.error(`[Push] 欢迎消息推送失败:`, error);
  }
}

/**
 * 推送任务状态查询卡片
 */
export async function pushTaskStatus(chatId: string, taskId: string): Promise<void> {
  const task = getTask(taskId);
  if (!task) {
    await globalPushClient.sendTextMessage(chatId, 'chat_id', `任务 ${taskId} 不存在`);
    return;
  }

  const statusEmoji: Record<string, string> = {
    pending: '⏳',
    processing: '🔄',
    completed: '✅',
    failed: '❌',
  };

  let content = `${statusEmoji[task.status] || '❓'} **任务状态**: ${task.status}\n\n`;

  if (task.status === 'processing') {
    content += `**进度**: ${task.progress || 0}%\n`;
  }

  if (task.error) {
    content += `**错误**: ${task.error}\n`;
  }

  content += `\n*任务ID: ${task.id}*`;

  const card = {
    config: { wide_screen_mode: true },
    elements: [
      { tag: 'markdown', content },
    ],
  };

  await globalPushClient.sendCardMessage(chatId, 'chat_id', card);
}

// ==================== 卡片构建函数 ====================

function buildProductSelectionResultCard(task: any) {
  const products = task.result?.products || [];

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
          { tag: 'markdown', content: `💰 价格: ¥${p.price}` },
          { tag: 'markdown', content: `📦 销量: ${p.volume}` },
          { tag: 'markdown', content: `⭐ 评分: ${p.score}` },
        ],
      },
      {
        tag: 'column',
        width: 'weighted',
        weight: 1,
        elements: [
          { tag: 'markdown', content: `**推荐理由**` },
          { tag: 'markdown', content: p.reason || '综合分析推荐' },
        ],
      },
    ],
  }));

  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🎯 选品结果' },
      template: 'green',
    },
    elements: [
      {
        tag: 'markdown',
        content: task.result?.message || `为您找到 ${products.length} 款优质商品`,
      },
      { tag: 'hr' },
      ...productElements,
      { tag: 'hr' },
      {
        tag: 'note',
        elements: [
          { tag: 'plain_text', content: `任务ID: ${task.id}` },
        ],
      },
    ],
  };
}

function buildAdCreatedResultCard(task: any) {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📈 广告计划已创建' },
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
              { tag: 'markdown', content: '**广告名称**' },
              { tag: 'markdown', content: task.result?.adName || '新广告计划' },
            ],
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**预算**' },
              { tag: 'markdown', content: `¥${task.result?.budget || 100}/天` },
            ],
          },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'markdown',
        content: `✅ 广告计划已创建成功，当前状态：**${task.result?.status || '待审核'}**`,
      },
    ],
  };
}

function buildGenericResultCard(task: any) {
  const statusEmoji: Record<string, string> = {
    completed: '✅',
    failed: '❌',
    processing: '🔄',
  };

  return {
    config: { wide_screen_mode: true },
    header: {
      title: {
        tag: 'plain_text',
        content: `${statusEmoji[task.status] || '📋'} 任务${task.status === 'completed' ? '完成' : task.status === 'failed' ? '失败' : '进行中'}`,
      },
      template: task.status === 'completed' ? 'green' : task.status === 'failed' ? 'red' : 'blue',
    },
    elements: [
      {
        tag: 'markdown',
        content: `**任务类型**: ${task.type}\n\n**状态**: ${task.status}`,
      },
      ...(task.result ? [{ tag: 'hr' }] : []),
      ...(task.result ? [{ tag: 'markdown', content: JSON.stringify(task.result, null, 2) }] : []),
      { tag: 'hr' },
      {
        tag: 'note',
        elements: [
          { tag: 'plain_text', content: `任务ID: ${task.id}` },
        ],
      },
    ],
  };
}

/**
 * 导出客户端实例
 */
export function getPushClient(): FeishuPushClient {
  return globalPushClient;
}
