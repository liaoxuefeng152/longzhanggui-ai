/**
 * API配置
 */

// API基础URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// API端点配置
export const API_ENDPOINTS = {
  // 认证
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  
  // 模型管理
  models: {
    list: '/models',
    detail: (id: string) => `/models/${id}`,
    test: (id: string) => `/models/${id}/test`,
    status: '/models/status/list',
  },
  
  // Prompt管理
  prompts: {
    list: '/prompts',
    detail: (id: string) => `/prompts/${id}`,
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
  
  // AI调用
  ai: {
    invoke: '/ai/invoke',
  },
  
  // 控制台
  dashboard: {
    stats: '/dashboard/stats',
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
