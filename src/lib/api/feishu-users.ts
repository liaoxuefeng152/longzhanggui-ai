/**
 * 飞书用户管理API
 */
import { apiClient, PaginatedResponse } from './client';
import { API_ENDPOINTS } from './config';

// 飞书用户类型
export interface FeishuUser {
  id: string;
  open_id: string;
  union_id?: string;
  nickname?: string;
  avatar?: string;
  mobile?: string;
  department_id?: string;
  status: string;
  package_id?: string;
  call_quota: number;
  call_used: number;
  referral_code?: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

// 飞书用户列表响应
export interface FeishuUserListResponse {
  users: FeishuUser[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * 获取飞书用户列表
 */
export async function getFeishuUsers(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<FeishuUserListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.status) searchParams.set('status', params.status);
  
  const endpoint = `${API_ENDPOINTS.feishuUsers.list}?${searchParams.toString()}`;
  return apiClient.get<FeishuUserListResponse>(endpoint);
}

/**
 * 获取飞书用户详情
 */
export async function getFeishuUser(id: string): Promise<FeishuUser> {
  return apiClient.get<FeishuUser>(API_ENDPOINTS.feishuUsers.detail(id));
}

/**
 * 更新用户配额
 */
export async function updateUserQuota(
  id: string,
  quota: number
): Promise<{ success: boolean; message: string }> {
  return apiClient.put(API_ENDPOINTS.feishuUsers.quota(id), { quota });
}

/**
 * 获取用户使用情况
 */
export async function getUserUsage(id: string): Promise<{
  daily_usage: Array<{ date: string; calls: number }>;
  total_calls: number;
  total_tokens: number;
}> {
  return apiClient.get(API_ENDPOINTS.feishuUsers.usage(id));
}
