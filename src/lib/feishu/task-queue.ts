/**
 * 飞书智能助理 - 任务队列管理
 * 管理异步任务的创建、状态追踪和结果存储
 */

import { FEISHU_CONFIG } from '@/lib/feishu/config';

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',      // 待处理
  PROCESSING = 'processing', // 处理中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed',         // 失败
}

// 任务类型
export enum TaskType {
  SELECT_PRODUCTS = 'select_products',  // 选品
  GENERATE_COPY = 'generate_copy',      // 文案生成
  OPTIMIZE_LISTING = 'optimize_listing', // Listing优化
  ANALYZE_COMPETITION = 'analyze_competition', // 竞品分析
  CREATE_AD = 'create_ad',              // 创建广告
  QUERY_INVENTORY = 'query_inventory',  // 库存查询
  QUERY_ORDERS = 'query_orders',        // 订单查询
  QUERY_SALES = 'query_sales',          // 销售查询
  GENERATE_REPORT = 'generate_report',  // 生成报告
  PROCESS_IMAGE = 'process_image',      // 图片处理
  GENERATE_VIDEO = 'generate_video',    // 视频生成
  CALCULATE_PRICE = 'calculate_price',  // 智能定价
  PUBLISH_PRODUCTS = 'publish_products', // 新品上架
  COLLECT_LINKS = 'collect_links',      // 链接采集
}

// 任务接口
export interface Task {
  id: string;                // 任务ID
  type: TaskType;           // 任务类型
  status: TaskStatus;       // 任务状态
  userId: string;           // 用户ID
  chatId: string;           // 会话ID
  params: Record<string, any>; // 任务参数
  result?: any;             // 任务结果
  error?: string;           // 错误信息
  createdAt: number;        // 创建时间
  updatedAt: number;        // 更新时间
  progress?: number;        // 进度 0-100
  messageId?: string;       // 关联的消息ID（用于更新卡片）
}

// 全局任务存储（使用 global 对象确保跨请求共享）
declare global {
  var feishuTaskQueue: Map<string, Task>;
  var feishuTaskIndex: Map<string, string[]>; // userId -> taskIds
}

// 初始化任务队列
function initTaskQueue() {
  if (!global.feishuTaskQueue) {
    global.feishuTaskQueue = new Map();
  }
  if (!global.feishuTaskIndex) {
    global.feishuTaskIndex = new Map();
  }
}

// 生成唯一任务ID
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 创建新任务
 */
export function createTask(
  type: TaskType,
  userId: string,
  chatId: string,
  params: Record<string, any> = {}
): Task {
  initTaskQueue();
  
  const task: Task = {
    id: generateTaskId(),
    type,
    status: TaskStatus.PENDING,
    userId,
    chatId,
    params,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    progress: 0,
  };
  
  // 存储任务
  global.feishuTaskQueue.set(task.id, task);
  
  // 更新用户索引
  if (!global.feishuTaskIndex.has(userId)) {
    global.feishuTaskIndex.set(userId, []);
  }
  global.feishuTaskIndex.get(userId)!.push(task.id);
  
  return task;
}

/**
 * 获取任务
 */
export function getTask(taskId: string): Task | undefined {
  initTaskQueue();
  return global.feishuTaskQueue.get(taskId);
}

/**
 * 更新任务状态
 */
export function updateTask(
  taskId: string,
  updates: Partial<Task>
): Task | undefined {
  initTaskQueue();
  
  const task = global.feishuTaskQueue.get(taskId);
  if (!task) return undefined;
  
  Object.assign(task, updates, { updatedAt: Date.now() });
  global.feishuTaskQueue.set(taskId, task);
  
  return task;
}

/**
 * 更新任务进度
 */
export function updateTaskProgress(
  taskId: string,
  progress: number,
  result?: any
): Task | undefined {
  return updateTask(taskId, {
    progress: Math.min(100, Math.max(0, progress)),
    status: progress >= 100 ? TaskStatus.COMPLETED : TaskStatus.PROCESSING,
    ...(result && { result }),
  });
}

/**
 * 完成任务
 */
export function completeTask(taskId: string, result: any): Task | undefined {
  return updateTask(taskId, {
    status: TaskStatus.COMPLETED,
    progress: 100,
    result,
    updatedAt: Date.now(),
  });
}

/**
 * 标记任务失败
 */
export function failTask(taskId: string, error: string): Task | undefined {
  return updateTask(taskId, {
    status: TaskStatus.FAILED,
    error,
    updatedAt: Date.now(),
  });
}

/**
 * 获取用户的所有任务
 */
export function getUserTasks(userId: string, limit = 10): Task[] {
  initTaskQueue();
  
  const taskIds = global.feishuTaskIndex.get(userId) || [];
  const tasks = taskIds
    .map(id => global.feishuTaskQueue.get(id))
    .filter((t): t is Task => t !== undefined)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
  
  return tasks;
}

/**
 * 获取用户的进行中任务
 */
export function getUserPendingTasks(userId: string): Task[] {
  return getUserTasks(userId).filter(
    t => t.status === TaskStatus.PENDING || t.status === TaskStatus.PROCESSING
  );
}

/**
 * 清理过期任务（保留最近24小时）
 */
export function cleanupExpiredTasks(maxAgeMs = 24 * 60 * 60 * 1000): number {
  initTaskQueue();
  
  const now = Date.now();
  let cleaned = 0;
  
  for (const [taskId, task] of global.feishuTaskQueue.entries()) {
    if (now - task.createdAt > maxAgeMs) {
      global.feishuTaskQueue.delete(taskId);
      
      // 从索引中移除
      const userTasks = global.feishuTaskIndex.get(task.userId);
      if (userTasks) {
        const idx = userTasks.indexOf(taskId);
        if (idx > -1) userTasks.splice(idx, 1);
      }
      
      cleaned++;
    }
  }
  
  return cleaned;
}

/**
 * 任务状态检查 - 判断是否需要异步处理
 */
export function shouldRunAsync(type: TaskType): boolean {
  // 需要调用外部API或耗时的任务设为异步
  const asyncTasks = [
    TaskType.SELECT_PRODUCTS,
    TaskType.OPTIMIZE_LISTING,
    TaskType.ANALYZE_COMPETITION,
    TaskType.CREATE_AD,
    TaskType.GENERATE_REPORT,
  ];
  
  return asyncTasks.includes(type);
}
