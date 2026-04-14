/**
 * 飞书智能助理 - 会话上下文管理
 * 管理用户会话历史，支持多轮对话和上下文记忆
 */

import { TaskType } from './task-queue';

// 会话消息类型
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  intent?: string;  // 明确记录的意图
  taskId?: string;  // 关联的任务ID
}

// 会话上下文
export interface ConversationContext {
  userId: string;
  chatId: string;
  messages: ConversationMessage[];  // 消息历史（最多保留20条）
  lastClearIntent?: string;  // 上一个明确的意图（用于追问）
  lastParams?: Record<string, any>;  // 上一个意图的参数
  lastTaskId?: string;
  lastProductCategory?: string;  // 最近提到的商品品类
  lastPlatform?: string;        // 最近提到的平台
  pendingClarifications: string[];  // 待确认的信息
  createdAt: number;
  updatedAt: number;
}

// 上下文有效期（60分钟无交互则过期，增加到1小时）
const CONTEXT_EXPIRY_MS = 60 * 60 * 1000;

// 最大消息保留数量
const MAX_MESSAGES = 20;

// 全局会话存储
declare global {
  var feishuConversations: Map<string, ConversationContext>;
  var feishuConversationIndex: Map<string, string[]>; // userId -> chatIds
}

// 生成会话ID
function getConversationKey(userId: string, chatId: string): string {
  return `${userId}:${chatId}`;
}

// 初始化会话存储
function initConversations() {
  if (!global.feishuConversations) {
    global.feishuConversations = new Map();
  }
  if (!global.feishuConversationIndex) {
    global.feishuConversationIndex = new Map();
  }
}

/**
 * 获取或创建会话上下文
 */
export function getOrCreateContext(
  userId: string,
  chatId: string
): ConversationContext {
  initConversations();
  
  const key = getConversationKey(userId, chatId);
  let context = global.feishuConversations.get(key);
  
  if (!context) {
    context = {
      userId,
      chatId,
      messages: [],
      pendingClarifications: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    global.feishuConversations.set(key, context);
    
    // 更新索引
    if (!global.feishuConversationIndex.has(userId)) {
      global.feishuConversationIndex.set(userId, []);
    }
    if (!global.feishuConversationIndex.get(userId)!.includes(chatId)) {
      global.feishuConversationIndex.get(userId)!.push(chatId);
    }
  }
  
  // 检查是否过期
  if (Date.now() - context.updatedAt > CONTEXT_EXPIRY_MS) {
    // 重置会话但保留关键信息（如用户偏好）
    const preservedInfo = {
      lastProductCategory: context.lastProductCategory,
      lastPlatform: context.lastPlatform,
    };
    
    context = {
      ...context,
      ...preservedInfo,
      messages: [],
      pendingClarifications: [],
      lastClearIntent: undefined,
      lastParams: undefined,
      updatedAt: Date.now(),
    };
    global.feishuConversations.set(key, context);
  }
  
  return context;
}

/**
 * 添加用户消息
 */
export function addUserMessage(
  userId: string,
  chatId: string,
  content: string,
  intent?: string
): ConversationContext {
  const context = getOrCreateContext(userId, chatId);
  
  const message: ConversationMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: 'user',
    content,
    timestamp: Date.now(),
    intent,
  };
  
  context.messages.push(message);
  
  // 限制消息数量
  if (context.messages.length > MAX_MESSAGES) {
    context.messages = context.messages.slice(-MAX_MESSAGES);
  }
  
  context.updatedAt = Date.now();
  global.feishuConversations.set(getConversationKey(userId, chatId), context);
  
  return context;
}

/**
 * 添加助手消息
 */
export function addAssistantMessage(
  userId: string,
  chatId: string,
  content: string,
  intent?: string,
  params?: Record<string, any>
): ConversationContext {
  const context = getOrCreateContext(userId, chatId);
  
  const message: ConversationMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: 'assistant',
    content,
    timestamp: Date.now(),
    intent,
  };
  
  context.messages.push(message);
  
  // 更新最后意图（仅当意图明确时）
  if (intent && intent !== 'unknown') {
    context.lastClearIntent = intent;
    context.lastParams = params || context.lastParams;
  }
  
  // 限制消息数量
  if (context.messages.length > MAX_MESSAGES) {
    context.messages = context.messages.slice(-MAX_MESSAGES);
  }
  
  context.updatedAt = Date.now();
  global.feishuConversations.set(getConversationKey(userId, chatId), context);
  
  return context;
}

/**
 * 清除会话
 */
export function clearContext(userId: string, chatId: string): void {
  const key = getConversationKey(userId, chatId);
  global.feishuConversations.delete(key);
}

/**
 * 获取会话摘要（用于调试）
 */
export function getContextSummary(userId: string, chatId: string): string {
  const context = getOrCreateContext(userId, chatId);
  
  return `会话摘要:
- 用户: ${context.userId}
- 消息数: ${context.messages.length}
- 最后意图: ${context.lastClearIntent || '无'}
- 待确认: ${context.pendingClarifications.length > 0 ? context.pendingClarifications.join(', ') : '无'}
- 最近品类: ${context.lastProductCategory || '无'}
- 创建时间: ${new Date(context.createdAt).toLocaleString()}
- 最后更新: ${new Date(context.updatedAt).toLocaleString()}
`;
}

/**
 * 更新上下文中的品类信息
 */
export function updateCategory(
  userId: string,
  chatId: string,
  category: string
): ConversationContext {
  const context = getOrCreateContext(userId, chatId);
  context.lastProductCategory = category;
  context.updatedAt = Date.now();
  global.feishuConversations.set(getConversationKey(userId, chatId), context);
  return context;
}

/**
 * 添加待确认信息
 */
export function addPendingClarification(
  userId: string,
  chatId: string,
  clarification: string
): ConversationContext {
  const context = getOrCreateContext(userId, chatId);
  if (!context.pendingClarifications.includes(clarification)) {
    context.pendingClarifications.push(clarification);
  }
  context.updatedAt = Date.now();
  global.feishuConversations.set(getConversationKey(userId, chatId), context);
  return context;
}

/**
 * 获取完整的对话历史（用于 LLM 上下文）
 */
export function getConversationHistory(
  userId: string,
  chatId: string,
  maxMessages: number = 10
): ConversationMessage[] {
  const context = getOrCreateContext(userId, chatId);
  return context.messages.slice(-maxMessages);
}

/**
 * 格式化对话历史为文本（用于 LLM 上下文）
 */
export function formatConversationHistory(
  userId: string,
  chatId: string,
  maxMessages: number = 10
): string {
  const history = getConversationHistory(userId, chatId, maxMessages);
  
  if (history.length === 0) {
    return '';
  }
  
  const lines = ['【对话历史】'];
  for (const msg of history) {
    const role = msg.role === 'user' ? '用户' : '助理';
    lines.push(`${role}: ${msg.content}`);
    if (msg.intent) {
      lines.push(`  [意图: ${msg.intent}]`);
    }
  }
  
  return lines.join('\n');
}
