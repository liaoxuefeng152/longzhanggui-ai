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
    console.log(`[Push] 飞书API响应: code=${data.code}, msg=${data.msg}, status=${response.status}`);
    if (data.code !== 0) {
      console.error(`[Push] 飞书API错误: ${JSON.stringify(data)}`);
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
    // 群聊优先使用 chatId，单聊使用 userId
    // chatId 如果以 oc_ 开头则是群聊 ID，否则使用 userId（open_id 格式）
    const isGroupChat = task.chatId && task.chatId.startsWith('oc_');
    const receiveId = isGroupChat ? task.chatId : task.userId;
    const receiveIdType = isGroupChat ? 'chat_id' : 'open_id';

    console.log(`[Push] 推送类型: ${receiveIdType}, ID: ${receiveId}, isGroup: ${isGroupChat}`);

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
export async function pushWelcomeMessage(receiveId: string, receiveIdType: string): Promise<void> {
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
    await globalPushClient.sendCardMessage(receiveId, receiveIdType, card);
  } catch (error) {
    console.error(`[Push] 欢迎消息推送失败:`, error);
  }
}

/**
 * 推送任务状态查询卡片
 */
export async function pushTaskStatus(receiveId: string, receiveIdType: string, taskId: string): Promise<void> {
  const task = getTask(taskId);
  if (!task) {
    await globalPushClient.sendTextMessage(receiveId, receiveIdType, `任务 ${taskId} 不存在`);
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

  await globalPushClient.sendCardMessage(receiveId, receiveIdType, card);
}

// ==================== 卡片构建函数 ====================

function buildProductSelectionResultCard(task: any) {
  const products = task.result?.products || [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://abc123.dev.coze.site';

  const productElements = products.slice(0, 5).map((p: any, index: number) => {
    const competitionEmoji = p.competition === 'low' ? '🟢' : p.competition === 'medium' ? '🟡' : '🔴';
    return {
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**${index + 1}. ${p.name}**\n💰 价格: $${p.price} | 利润率: ${p.profit_margin || 35}%\n📈 日销量: ${p.daily_sales || 500}+/天 | 竞争度: ${competitionEmoji}${p.competition || '中'}`,
      },
    };
  });

  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `🎯 选品结果 - ${products.length}款推荐` },
      template: 'green',
    },
    elements: [
      {
        tag: 'markdown',
        content: `✅ 已为您分析市场，推荐以下 ${products.length} 款潜力商品：`,
      },
      { tag: 'hr' },
      ...productElements,
      { tag: 'hr' },
      {
        tag: 'markdown',
        content: `📊 **汇总信息**\n- 平均利润率: ${task.result?.summary?.avgProfitRate || '35-45%'}\n- 市场潜力: ${task.result?.summary?.marketPotential || '优秀'}`,
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '📦 查看全部商品' },
            type: 'primary',
            url: `${appUrl}/agents/product-selection`,
          },
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '🏠 商品中心' },
            type: 'default',
            url: `${appUrl}/erp/products`,
          },
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
