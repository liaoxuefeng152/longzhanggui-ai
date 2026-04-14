/**
 * 飞书智能助理 - 智能体执行器
 * 根据意图类型调用对应的智能体或服务
 */

import { Config, LLMClient } from 'coze-coding-dev-sdk';
import { TaskType, TaskStatus, updateTask, completeTask, failTask, shouldRunAsync } from './task-queue';
import { INTENT_TYPES } from './config';

// 执行结果
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  isAsync?: boolean;
  taskId?: string;
}

/**
 * 执行意图对应的任务
 */
export async function executeIntent(
  intent: string,
  params: Record<string, any>,
  userId: string,
  chatId: string,
  originalText: string
): Promise<ExecutionResult> {
  // 判断是否需要异步执行
  const needsAsync = shouldRunAsync(intent as TaskType);

  switch (intent) {
    case INTENT_TYPES.SELECT_PRODUCTS:
      return executeProductSelection(params, userId, chatId, needsAsync);

    case INTENT_TYPES.QUERY_DAILY:
      return executeQueryDaily(userId, chatId);

    case INTENT_TYPES.QUERY_INVENTORY:
      return executeQueryInventory(params, userId, chatId);

    case INTENT_TYPES.QUERY_ORDERS:
      return executeQueryOrders(params, userId, chatId);

    case INTENT_TYPES.QUERY_SALES:
      return executeQuerySales(params, userId, chatId);

    case INTENT_TYPES.GENERATE_COPY:
      return executeGenerateCopy(params, userId, chatId);

    case INTENT_TYPES.CREATE_AD:
      return executeCreateAd(params, userId, chatId, needsAsync);

    case INTENT_TYPES.GENERATE_REPORT:
      return executeGenerateReport(params, userId, chatId);

    case INTENT_TYPES.GREETING:
      return executeGreeting(userId, chatId);

    case INTENT_TYPES.HELP:
      return executeHelp();

    case INTENT_TYPES.UNKNOWN:
    default:
      return executeUnknown(originalText);
  }
}

// ==================== 选品执行 ====================

async function executeProductSelection(
  params: Record<string, any>,
  userId: string,
  chatId: string,
  isAsync: boolean
): Promise<ExecutionResult> {
  if (isAsync) {
    // 异步执行 - 返回任务ID
    const { createTask } = await import('./task-queue');
    const task = createTask(
      TaskType.SELECT_PRODUCTS,
      userId,
      chatId,
      params
    );

    // 异步执行实际任务
    executeProductSelectionAsync(task.id, params);

    return {
      success: true,
      data: {
        message: `正在为您搜索「${params.category || '热门'}」商品，请稍候...`,
        taskId: task.id,
        isProcessing: true,
      },
      isAsync: true,
      taskId: task.id,
    };
  }

  // 同步执行（简单查询）
  return executeProductSelectionSync(params);
}

async function executeProductSelectionSync(params: Record<string, any>): Promise<ExecutionResult> {
  try {
    // 调用选品 API
    const response = await fetch('/api/ai/select-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: params.category || '综合',
        count: params.count || 3,
        ...params,
      }),
    });

    const data = await response.json();

    return {
      success: true,
      data: {
        type: 'product_selection',
        products: data.products || generateMockProducts(params.category, params.count),
        message: `为您推荐 ${params.count || 3} 款「${params.category || '热门'}」商品：`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: '选品服务暂时不可用',
    };
  }
}

async function executeProductSelectionAsync(taskId: string, params: Record<string, any>): Promise<void> {
  try {
    updateTask(taskId, { status: TaskStatus.PROCESSING, progress: 10 });

    // 模拟 AI 选品过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateTask(taskId, { progress: 30 });

    await new Promise(resolve => setTimeout(resolve, 1000));
    updateTask(taskId, { progress: 60 });

    await new Promise(resolve => setTimeout(resolve, 1000));
    updateTask(taskId, { progress: 90 });

    // 生成结果
    const result = {
      type: 'product_selection',
      products: generateMockProducts(params.category, params.count),
      message: `为您推荐 ${params.count || 3} 款「${params.category || '热门'}」商品：`,
    };

    completeTask(taskId, result);

    // 主动推送结果（需要推送服务）
    const { pushTaskResult } = await import('./push-service');
    pushTaskResult(taskId);
  } catch (error) {
    failTask(taskId, '选品执行失败');
  }
}

// ==================== 日报查询 ====================

async function executeQueryDaily(userId: string, chatId: string): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/dashboard/stats');
    const stats = await response.json();

    return {
      success: true,
      data: {
        type: 'daily_report',
        date: new Date().toLocaleDateString('zh-CN'),
        stats: {
          orders: stats.todayOrders || 45,
          sales: stats.todaySales || 12580,
          adsSpend: stats.adsSpend || 850,
          visitors: stats.visitors || 1234,
        },
        trends: {
          ordersChange: '+12%',
          salesChange: '+8%',
        },
      },
    };
  } catch (error) {
    // 返回模拟数据
    return {
      success: true,
      data: {
        type: 'daily_report',
        date: new Date().toLocaleDateString('zh-CN'),
        stats: {
          orders: 45,
          sales: 12580,
          adsSpend: 850,
          visitors: 1234,
        },
        trends: {
          ordersChange: '+12%',
          salesChange: '+8%',
        },
      },
    };
  }
}

// ==================== 库存查询 ====================

async function executeQueryInventory(
  params: Record<string, any>,
  userId: string,
  chatId: string
): Promise<ExecutionResult> {
  // 模拟库存数据
  const inventoryItems = [
    { name: '宠物玩具-狗狗飞盘', sku: 'PET001', stock: 5, threshold: 10 },
    { name: '3C数据线-快充版', sku: '3C001', stock: 156, threshold: 50 },
    { name: '家居收纳盒-三层', sku: 'HOME001', stock: 8, threshold: 20 },
    { name: '美妆化妆刷套装', sku: 'BEAUTY001', stock: 45, threshold: 30 },
  ];

  // 如果指定了品类，过滤
  let filteredItems = inventoryItems;
  if (params.category) {
    filteredItems = inventoryItems.filter(item =>
      item.name.includes(params.category) ||
      (params.category.includes('宠物') && item.sku === 'PET001')
    );
  }

  // 只返回库存不足的
  const lowStockItems = filteredItems.filter(item => item.stock < item.threshold);

  return {
    success: true,
    data: {
      type: 'inventory_alert',
      items: lowStockItems.length > 0 ? lowStockItems : filteredItems.slice(0, 2),
      summary: lowStockItems.length > 0 ? `发现 ${lowStockItems.length} 个商品库存不足` : '所有商品库存正常',
    },
  };
}

// ==================== 订单查询 ====================

async function executeQueryOrders(
  params: Record<string, any>,
  userId: string,
  chatId: string
): Promise<ExecutionResult> {
  // 模拟订单数据
  const orders = [
    { orderId: 'ORD20240415001', status: '已发货', tracking: 'SF1234567890', amount: 299 },
    { orderId: 'ORD20240415002', status: '处理中', tracking: '-', amount: 156 },
    { orderId: 'ORD20240415003', status: '已签收', tracking: 'YT9876543210', amount: 428 },
  ];

  return {
    success: true,
    data: {
      type: 'order_list',
      orders: params.orderId
        ? orders.filter(o => o.orderId.includes(params.orderId))
        : orders.slice(0, 3),
    },
  };
}

// ==================== 销售查询 ====================

async function executeQuerySales(
  params: Record<string, any>,
  userId: string,
  chatId: string
): Promise<ExecutionResult> {
  return {
    success: true,
    data: {
      type: 'sales_report',
      period: params.period || '本周',
      stats: {
        totalOrders: 328,
        totalSales: 89560,
        avgOrderValue: 273,
        topCategory: '3C数码',
      },
      comparison: {
        ordersChange: '+15%',
        salesChange: '+12%',
      },
    },
  };
}

// ==================== 文案生成 ====================

async function executeGenerateCopy(
  params: Record<string, any>,
  userId: string,
  chatId: string
): Promise<ExecutionResult> {
  try {
    const copyType = params.copyType || 'review_reminder';

    if (copyType === 'review_reminder' || params.originalText?.includes('好评')) {
      const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review_reminder', ...params }),
      });

      const data = await response.json();

      return {
        success: true,
        data: {
          type: 'generated_copy',
          content: data.content || generateMockCopy('review_reminder'),
          usage: '可直接复制使用',
        },
      };
    }

    // 默认生成催好评文案
    return {
      success: true,
      data: {
        type: 'generated_copy',
        content: generateMockCopy('review_reminder'),
        usage: '可直接复制使用',
      },
    };
  } catch (error) {
    return {
      success: true,
      data: {
        type: 'generated_copy',
        content: generateMockCopy('review_reminder'),
        usage: '可直接复制使用',
      },
    };
  }
}

// ==================== 广告创建 ====================

async function executeCreateAd(
  params: Record<string, any>,
  userId: string,
  chatId: string,
  isAsync: boolean
): Promise<ExecutionResult> {
  if (isAsync) {
    const { createTask } = await import('./task-queue');
    const task = createTask(
      TaskType.CREATE_AD,
      userId,
      chatId,
      params
    );

    // 异步执行
    setTimeout(() => {
      completeTask(task.id, {
        type: 'ad_created',
        adName: `广告计划-${Date.now()}`,
        budget: params.budget || 100,
        status: '待审核',
      });
    }, 2000);

    return {
      success: true,
      data: { message: '正在创建广告计划，请稍候...', taskId: task.id },
      isAsync: true,
      taskId: task.id,
    };
  }

  return {
    success: true,
    data: {
      type: 'ad_created',
      adName: '测试广告计划',
      budget: params.budget || 100,
    },
  };
}

// ==================== 报告生成 ====================

async function executeGenerateReport(
  params: Record<string, any>,
  userId: string,
  chatId: string
): Promise<ExecutionResult> {
  try {
    const response = await fetch('/api/assistant/daily-report');
    const report = await response.json();

    return {
      success: true,
      data: {
        type: 'daily_report',
        ...report,
      },
    };
  } catch (error) {
    return {
      success: true,
      data: {
        type: 'daily_report',
        date: new Date().toLocaleDateString('zh-CN'),
        stats: generateMockReportStats(),
      },
    };
  }
}

// ==================== 问候 ====================

async function executeGreeting(userId: string, chatId: string): Promise<ExecutionResult> {
  const greetings = [
    '您好！有什么可以帮您的？',
    '您好！我是龙掌柜智能运营助理，可以帮您查询数据、选品、生成文案等。',
    '欢迎回来！需要我帮您做些什么？',
  ];

  return {
    success: true,
    data: {
      type: 'greeting',
      content: greetings[Math.floor(Math.random() * greetings.length)],
    },
  };
}

// ==================== 帮助 ====================

async function executeHelp(): Promise<ExecutionResult> {
  const { generateHelpMessage } = await import('./intent-enhanced');

  return {
    success: true,
    data: {
      type: 'help',
      content: generateHelpMessage(),
    },
  };
}

// ==================== 未知意图 ====================

async function executeUnknown(text: string): Promise<ExecutionResult> {
  return {
    success: true,
    data: {
      type: 'unknown',
      content: `抱歉，我不太理解"${text}"的意思。\n\n您可以尝试：\n• "今天运营情况怎么样？" - 查询数据\n• "帮我选3款宠物用品" - 智能选品\n• "写一个催好评的消息" - 生成文案\n• "有什么功能？" - 查看帮助`,
    },
  };
}

// ==================== 辅助函数 ====================

function generateMockProducts(category?: string, count: number = 3) {
  const categories = category || '热门';
  const products = [
    {
      name: `${categories}爆款新品A`,
      price: 29.9,
      volume: 1256,
      score: 4.8,
      reason: '市场需求大，竞争度适中',
    },
    {
      name: `${categories}高性价比B`,
      price: 19.9,
      volume: 2341,
      score: 4.6,
      reason: '价格优势明显，适合走量',
    },
    {
      name: `${categories}差异化选品C`,
      price: 39.9,
      volume: 876,
      score: 4.9,
      reason: '独特设计，溢价空间大',
    },
  ];

  return products.slice(0, count);
}

function generateMockCopy(type: string): string {
  if (type === 'review_reminder') {
    return `亲，感谢您的支持！🌟

收到宝贝还满意吗？如果方便的话，麻烦给个5星好评呗～

您的好评是我们最大的动力！

如有任何问题，欢迎随时联系我们，会第一时间为您处理哦～

祝您生活愉快！🎉`;
  }
  return '感谢您的购买！期待您的好评~';
}

function generateMockReportStats() {
  return {
    orders: 45,
    sales: 12580,
    adsSpend: 850,
    visitors: 1234,
    conversionRate: '3.6%',
    newCustomers: 18,
    returnCustomers: 12,
  };
}
