/**
 * 演示模式工具函数
 * 
 * 演示模式限制策略：
 * - 浏览页面：不限制（让客户看到完整功能）
 * - AI助手对话：10次限制（已在 landing-chat-widget 中实现）
 * - 数据查看：不限制（模拟数据就是为了展示效果）
 * - 写操作（保存/删除/发布/创建/上架/采集/提交）：全局拦截弹窗引导联系
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
 */
export const DEMO_LIMIT_EVENT = 'demo:limit-reached';

/**
 * 触发演示模式限制弹窗
 * @param action 正在尝试的操作名称
 */
export function triggerDemoLimit(action: string): void {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent(DEMO_LIMIT_EVENT, {
    detail: { action }
  });
  window.dispatchEvent(event);
}

/**
 * 需要拦截的按钮文本关键词
 * 匹配按钮内部文本中是否包含这些词
 */
const BLOCKED_KEYWORDS = [
  '保存', '删除', '发布', '上架', '采集', '提交', '确认删除',
  '创建商品', '创建订单', '创建广告', '创建角色',
  '加入采购', '一键采购', '立即采购',
  '测试连接', '发送测试', '导入',
  '更新配置', '保存配置', '应用配置',
  '生成报告', '生成视频', '生成Listing',
  '优化', '翻译', '处理图片',
];

/**
 * 判断按钮文本是否匹配需要拦截的操作
 */
export function isBlockedAction(buttonText: string): boolean {
  if (!buttonText) return false;
  const text = buttonText.trim();
  return BLOCKED_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * 全局点击拦截器
 * 在 MainLayout 中调用，劫持 document 的点击事件
 * 演示模式下，如果点击的按钮文本匹配写操作关键词，则拦截并弹窗
 */
export function setupDemoGuard(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handler = (e: MouseEvent) => {
    if (!isDemoMode()) return;
    
    // 从点击目标向上找最近的 button 元素
    const target = (e.target as HTMLElement).closest('button');
    if (!target) return;
    
    // 获取按钮文本
    const buttonText = target.textContent || '';
    
    if (isBlockedAction(buttonText)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // 提取操作名称（取按钮文本前20字符）
      const actionName = buttonText.trim().slice(0, 20);
      triggerDemoLimit(actionName);
    }
  };
  
  // 使用 capture 阶段拦截，优先于 React 的 onClick
  document.addEventListener('click', handler, true);
  
  // 返回清理函数
  return () => {
    document.removeEventListener('click', handler, true);
  };
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
