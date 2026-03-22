/**
 * 用户管理API
 */
import { apiClient, PaginatedResponse } from './client';
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

// 用户创建请求
export interface UserCreate {
  phone: string;
  password: string;
  nickname: string;
  role?: string;
  avatar?: string;
}

// 用户更新请求
export interface UserUpdate {
  nickname?: string;
  role?: string;
  avatar?: string;
  status?: string;
}

/**
 * 获取用户列表
 */
export async function getUsers(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  role?: string;
}): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.role) searchParams.set('role', params.role);
  
  // 使用auth端点获取用户列表，这里假设有单独的用户管理API
  const endpoint = `/users?${searchParams.toString()}`;
  return apiClient.get<PaginatedResponse<User>>(endpoint);
}

/**
 * 获取用户详情
 */
export async function getUser(id: string): Promise<User> {
  return apiClient.get<User>(`/users/${id}`);
}

/**
 * 创建用户
 */
export async function createUser(data: UserCreate): Promise<User> {
  return apiClient.post<User>('/users', data);
}

/**
 * 更新用户
 */
export async function updateUser(id: string, data: UserUpdate): Promise<User> {
  return apiClient.put<User>(`/users/${id}`, data);
}

/**
 * 删除用户
 */
export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(`/users/${id}`);
}

/**
 * 重置用户密码
 */
export async function resetUserPassword(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`/users/${id}/reset-password`);
}
