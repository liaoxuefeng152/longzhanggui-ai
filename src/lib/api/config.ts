/**
 * API配置
 * 
 * 架构说明：
 * - 前端：Next.js (端口5000)
 * - 后端：Python FastAPI (端口8000)
 * - API调用通过 Next.js rewrites 代理到后端
 */

// API基础URL - 使用相对路径，通过 rewrites 代理
export const API_BASE_URL = '/api/v1';

// Python后端地址（用于直接调用）
export const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

// API端点配置
export const API_ENDPOINTS = {
  // 认证 - 使用前端API路由（不依赖后端）
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    sendCode: '/api/auth/send-code',
  },
  
  // 模型管理 - 使用前端API路由
  models: {
    list: '/api/models',
    detail: (id: string) => `/api/models/${id}`,
    test: (id: string) => `/api/models/${id}/test`,
    status: '/api/models/status',
  },
  
  // Prompt管理 - 使用前端API路由
  prompts: {
    list: '/api/prompts',
    detail: (id: string) => `/api/prompts/${id}`,
  },
  
  // 智能体
  agents: {
    list: '/agents',
    detail: (id: string) => `/agents/${id}`,
    config: (id: string) => `/agents/${id}/config`,
    start: (id: string) => `/agents/${id}/start`,
    stop: (id: string) => `/agents/${id}/stop`,
    tasks: '/agents/tasks',
    taskDetail: (id: string) => `/agents/tasks/${id}`,
  },
  
  // AI调用 - 使用前端API路由（开发环境）
  ai: {
    invoke: '/api/ai/model/invoke',
    selectProducts: '/api/ai/select-products',
    processImage: '/api/ai/process-image',
    optimizeListing: '/api/ai/optimize-listing',
    calculatePrice: '/api/ai/calculate-price',
    suggestKeywords: '/api/ai/suggest-keywords',
  },
  
  // 控制台
  dashboard: {
    stats: '/dashboard/stats',
  },
  
  // 飞书用户 - 使用前端API路由（不依赖后端）
  feishuUsers: {
    list: '/api/feishu-users',
    detail: (id: string) => `/api/feishu-users/${id}`,
    quota: (id: string) => `/api/feishu-users/${id}/quota`,
    usage: (id: string) => `/api/feishu-users/${id}/usage`,
    batch: '/api/feishu-users/batch',
  },
  
  // 套餐管理
  packages: {
    list: '/packages',
    detail: (id: string) => `/packages/${id}`,
  },
  
  // 任务日志
  taskLogs: {
    list: '/task-logs',
    detail: (id: string) => `/task-logs/${id}`,
    retry: (id: string) => `/task-logs/${id}/retry`,
    stats: '/task-logs/stats/summary',
  },
  
  // 平台绑定
  platformBindings: {
    list: '/api/platform-bindings',
    detail: (id: string) => `/api/platform-bindings/${id}`,
    sync: (id: string) => `/api/platform-bindings/${id}/sync`,
  },
  
  // 商品库
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
    batch: '/products/batch',
    categories: '/products/categories/list',
  },
  
  // 订单中心
  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
    status: (id: string) => `/orders/${id}/status`,
    stats: '/orders/stats/summary',
    platforms: '/orders/platforms/list',
  },
  
  // 客服工单
  tickets: {
    list: '/customer-tickets',
    detail: (id: string) => `/customer-tickets/${id}`,
    close: (id: string) => `/customer-tickets/${id}/close`,
    assign: (id: string) => `/customer-tickets/${id}/assign`,
    stats: '/customer-tickets/stats/summary',
  },
  
  // 数据报表
  reports: {
    overview: '/reports/overview',
    usage: '/reports/usage',
    revenue: '/reports/revenue',
    agents: '/reports/agents',
  },
  
  // 系统设置
  settings: {
    list: '/settings',
    feishu: '/settings/feishu',
    testFeishu: '/settings/feishu/test',
    backup: '/settings/backup',
  },
} as const;

// 请求配置
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// 获取认证头
export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS };
  const accessToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}
