/**
 * 演示模式工具函数
 * 
 * 演示模式限制策略：
 * - 浏览页面：不限制（让客户看到完整功能）
 * - AI助手对话：10次限制（已在 landing-chat-widget 中实现）
 * - 数据查看：不限制（模拟数据就是为了展示效果）
 * - 写操作（保存/删除/发布/创建）：限制，弹窗引导联系
 * - 敏感信息（API密钥/密码）：脱敏显示
 * - 系统配置：限制
 */

// 演示模式的用户名
export const DEMO_USERNAME = 'demo_admin';

/**
 * 判断当前是否为演示模式
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return user?.username === DEMO_USERNAME;
  } catch {
    return false;
  }
}

/**
 * 演示模式限制弹窗的事件名
 * 组件监听此事件来显示限制弹窗
 */
export const DEMO_LIMIT_EVENT = 'demo:limit-reached';

/**
 * 触发演示模式限制弹窗
 * @param action 正在尝试的操作名称，如"保存商品"、"创建广告"
 */
export function triggerDemoLimit(action: string): void {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent(DEMO_LIMIT_EVENT, {
    detail: { action }
  });
  window.dispatchEvent(event);
}

/**
 * 包装写操作，演示模式下自动拦截并弹窗
 * @param action 操作名称
 * @param fn 实际执行的函数
 * @returns 若为演示模式返回 false，否则执行 fn 并返回其结果
 */
export function withDemoCheck<T extends (...args: unknown[]) => unknown>(
  action: string,
  fn: T
): T {
  return ((...args: unknown[]) => {
    if (isDemoMode()) {
      triggerDemoLimit(action);
      return false;
    }
    return fn(...args);
  }) as T;
}

/**
 * 脱敏显示敏感信息
 * @param value 原始值
 * @param visibleLength 前后可见字符数
 */
export function maskSensitive(value: string, visibleLength: number = 3): string {
  if (!isDemoMode()) return value;
  if (!value || value.length <= visibleLength * 2) {
    return '••••••••';
  }
  return value.slice(0, visibleLength) + '••••••••' + value.slice(-visibleLength);
}
