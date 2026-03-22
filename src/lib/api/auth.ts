/**
 * 认证API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 用户类型
export interface User {
  id: string;
  phone: string;
  nickname: string;
  role: string;
  avatar?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// 登录响应
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 登录请求
export interface LoginRequest {
  phone: string;
  password: string;
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, data);
  
  // 保存token
  if (typeof window !== 'undefined' && response.access_token) {
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  } finally {
    // 清除本地存储
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.auth.me);
  return response.user;
}

/**
 * 获取本地存储的用户信息
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/**
 * 获取存储的token
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
