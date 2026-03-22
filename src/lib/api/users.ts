/**
 * 用户管理API
 */
import { apiClient, PaginatedResponse } from './client';

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
  
  const endpoint = `/users?${searchParams.toString()}`;
  return apiClient.get<PaginatedResponse<User>>(endpoint);
}

/**
 * 获取用户详情
 */
export async function getUser(id: string): Promise<User> {
  return apiClient.get<User>(`/users/${id}`);
}
