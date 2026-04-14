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
  intent?: string;
  taskId?: string;  // 关联的任务ID
}

// 会话上下文
export interface ConversationContext {
  userId: string;
  chatId: string;
  messages: ConversationMessage[];
  lastIntent?: string;
  lastParams?: Record<string, any>;
  lastTaskId?: string;
  lastProductCategory?: string;  // 最近提到的商品品类
  lastPlatform?: string;        // 最近提到的平台
  createdAt: number;
  updatedAt: number;
}

// 上下文有效期（30分钟无交互则过期）
const CONTEXT_EXPIRY_MS = 30 * 60 * 1000;

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
    // 重置会话但保留关键信息
    context = {
      ...context,
      messages: [],
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
  intent?: string,
  taskId?: string
): ConversationContext {
  const context = getOrCreateContext(userId, chatId);
  
  const message: ConversationMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    role: 'user',
    content,
    timestamp: Date.now(),
    intent,
    taskId,
  };
  
  context.messages.push(message);
  context.lastIntent = intent;
  context.lastTaskId = taskId;
  context.updatedAt = Date.now();
  
  // 提取并保存关键实体
  extractEntities(content, context);
  
  return context;
}

/**
 * 添加助手消息
 */
export function addAssistantMessage(
  userId: string,
  chatId: string,
  content: string
): ConversationContext {
  const context = getOrCreateContext(userId, chatId);
  
  const message: ConversationMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    role: 'assistant',
    content,
    timestamp: Date.now(),
  };
  
  context.messages.push(message);
  context.updatedAt = Date.now();
  
  return context;
}

/**
 * 从消息中提取关键实体
 */
function extractEntities(content: string, context: ConversationContext): void {
  const text = content.toLowerCase();
  
  // 提取商品品类
  const categories = [
    '宠物用品', '宠物玩具', '宠物食品', '宠物服饰',
    '3c产品', '手机配件', '电脑配件', '数码',
    '家居用品', '厨房用品', '卧室用品',
    '服装', '女装', '男装', '童装',
    '美妆', '化妆品', '护肤',
    '母婴', '玩具',
  ];
  
  for (const category of categories) {
    if (text.includes(category)) {
      context.lastProductCategory = category;
      break;
    }
  }
  
  // 提取平台
  const platforms = [
    'shopee', '虾皮', 'lazada', '来赞达',
    'amazon', '亚马逊', 'ebay', 'wish',
  ];
  
  for (const platform of platforms) {
    if (text.includes(platform)) {
      context.lastPlatform = platform;
      break;
    }
  }
}

/**
 * 获取最近N条消息
 */
export function getRecentMessages(
  userId: string,
  chatId: string,
  count = 10
): ConversationMessage[] {
  const context = getOrCreateContext(userId, chatId);
  return context.messages.slice(-count);
}

/**
 * 构建对话历史（用于LLM调用）
 */
export function buildConversationHistory(
  userId: string,
  chatId: string,
  maxMessages = 10
): string {
  const messages = getRecentMessages(userId, chatId, maxMessages);
  
  return messages
    .map(m => `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`)
    .join('\n');
}

/**
 * 检查是否需要追问
 */
export function shouldAskClarification(
  intent: string,
  params: Record<string, any>
): { need: boolean; question?: string } {
  switch (intent) {
    case TaskType.SELECT_PRODUCTS:
      if (!params.category) {
        return {
          need: true,
          question: '请问您想选哪个品类的商品呢？比如：宠物用品、3C产品、家居用品等',
        };
      }
      if (!params.count || params.count < 1) {
        return {
          need: true,
          question: '请问您需要推荐几款商品呢？',
        };
      }
      break;
      
    case TaskType.QUERY_INVENTORY:
      if (!params.productName && !params.category) {
        return {
          need: true,
          question: '请问您想查询哪个商品或品类的库存？',
        };
      }
      break;
      
    case TaskType.CREATE_AD:
      if (!params.productId) {
        return {
          need: true,
          question: '请问您想为哪个商品创建广告？',
        };
      }
      break;
  }
  
  return { need: false };
}

/**
 * 清除会话上下文
 */
export function clearContext(userId: string, chatId: string): void {
  initConversations();
  const key = getConversationKey(userId, chatId);
  global.feishuConversations.delete(key);
}

/**
 * 获取用户的最近会话
 */
export function getUserRecentChats(userId: string, limit = 5): ConversationContext[] {
  initConversations();
  
  const chatIds = global.feishuConversationIndex.get(userId) || [];
  const now = Date.now();
  
  return chatIds
    .map(chatId => global.feishuConversations.get(getConversationKey(userId, chatId)))
    .filter((c): c is ConversationContext => c !== undefined && now - c.updatedAt < CONTEXT_EXPIRY_MS)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}
