/**
 * 落地页AI助手 - 使用次数限制工具
 *
 * 策略：5次免费对话，超出后引导用户添加客服微信
 * 计数方式：每条用户消息算1次，存储在 localStorage
 */

const STORAGE_KEY = 'landing_chat_usage';
const MAX_FREE_MESSAGES = 5;

interface UsageData {
  count: number;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
}

function getUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return { count: 0, firstUsedAt: null, lastUsedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, firstUsedAt: null, lastUsedAt: null };
    return JSON.parse(raw) as UsageData;
  } catch {
    return { count: 0, firstUsedAt: null, lastUsedAt: null };
  }
}

function saveUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 满或不可写，静默忽略
  }
}

/** 获取已使用次数 */
export function getUsageCount(): number {
  return getUsageData().count;
}

/** 获取免费额度上限 */
export function getMaxFreeMessages(): number {
  return MAX_FREE_MESSAGES;
}

/** 剩余免费次数 */
export function getRemainingCount(): number {
  return Math.max(0, MAX_FREE_MESSAGES - getUsageCount());
}

/** 是否已超出免费额度 */
export function isUsageExceeded(): boolean {
  return getUsageCount() >= MAX_FREE_MESSAGES;
}

/** 使用次数 +1，返回更新后的使用数据 */
export function incrementUsage(): UsageData {
  const current = getUsageData();
  const now = new Date().toISOString();
  const updated: UsageData = {
    count: current.count + 1,
    firstUsedAt: current.firstUsedAt || now,
    lastUsedAt: now,
  };
  saveUsageData(updated);
  return updated;
}

/** 重置使用次数（调试用，或用户扫码后可调用） */
export function resetUsage(): void {
  saveUsageData({ count: 0, firstUsedAt: null, lastUsedAt: null });
}
