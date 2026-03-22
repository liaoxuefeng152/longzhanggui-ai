/**
 * API客户端
 */
import { API_BASE_URL, getAuthHeaders } from './config';

// API响应类型
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// 请求方法类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 基础请求函数
async function request<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  data?: unknown,
  options?: {
    token?: string;
    signal?: AbortSignal;
  }
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders(options?.token);
  
  const config: RequestInit = {
    method,
    headers,
    signal: options?.signal,
  };
  
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, config);
  
  // 处理响应
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || `请求失败: ${response.status}`);
  }
  
  // 处理204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// GET请求
export async function get<T>(endpoint: string, options?: { token?: string; signal?: AbortSignal }): Promise<T> {
  return request<T>(endpoint, 'GET', undefined, options);
}

// POST请求
export async function post<T>(endpoint: string, data?: unknown, options?: { token?: string }): Promise<T> {
  return request<T>(endpoint, 'POST', data, options);
}

// PUT请求
export async function put<T>(endpoint: string, data?: unknown, options?: { token?: string }): Promise<T> {
  return request<T>(endpoint, 'PUT', data, options);
}

// DELETE请求
export async function del<T>(endpoint: string, options?: { token?: string }): Promise<T> {
  return request<T>(endpoint, 'DELETE', undefined, options);
}

// PATCH请求
export async function patch<T>(endpoint: string, data?: unknown, options?: { token?: string }): Promise<T> {
  return request<T>(endpoint, 'PATCH', data, options);
}

// 流式请求
export async function stream(
  endpoint: string,
  data: unknown,
  onChunk: (content: string) => void,
  options?: { token?: string; signal?: AbortSignal }
): Promise<void> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders(options?.token);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    signal: options?.signal,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || `请求失败: ${response.status}`);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法读取响应流');
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // 处理SSE数据
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            onChunk(parsed.content);
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

// 导出客户端
export const apiClient = {
  get,
  post,
  put,
  delete: del,
  patch,
  stream,
};
