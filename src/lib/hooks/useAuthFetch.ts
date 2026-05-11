/**
 * 认证Fetch Hook
 * 提供带认证token的fetch函数
 */
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * 使用认证Fetch
 * 自动从localStorage获取token，处理401响应
 */
export function useAuthFetch() {
  const router = useRouter();

  const authFetch = useCallback(async <T = unknown>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    const { skipAuth = false, headers: customHeaders = {}, ...restOptions } = options;

    // 获取token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 构建headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    // 添加认证头
    if (!skipAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 发送请求
    const response = await fetch(url, {
      ...restOptions,
      headers,
    });

    // 处理401未授权响应
    if (response.status === 401) {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 跳转到登录页
      router.push('/login');
      throw new Error('未授权，请重新登录');
    }

    // 处理其他错误响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `请求失败: ${response.status}`);
    }

    // 处理204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }, [router]);

  return { authFetch };
}

/**
 * 获取认证headers（用于非hook场景）
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * 认证Fetch函数（用于非hook场景）
 */
export async function authFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || `请求失败: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
