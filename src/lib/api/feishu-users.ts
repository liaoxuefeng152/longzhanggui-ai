/**
 * 飞书用户管理API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 套餐类型
export type PackageType = 'basic' | 'advanced' | 'flagship';

// 用户状态
export type UserStatus = 'active' | 'inactive' | 'expired' | 'trial';

// 飞书用户类型
export interface FeishuUser {
  id: string;
  open_id: string;
  union_id?: string;
  nickname: string;
  avatar?: string;
  mobile?: string;
  department_id?: string;
  status: UserStatus;
  package_id?: string;
  package_type?: PackageType;
  package_name?: string;
  expire_time?: string;
  agent_permissions: string[]; // 智能体权限ID列表
  call_quota: number;
  call_used: number;
  call_limit: number;
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

// 用户统计
export interface FeishuUserStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  trial: number;
  expiring_soon: number; // 即将到期（7天内）
}

// 创建/更新用户请求
export interface FeishuUserRequest {
  open_id: string;
  nickname: string;
  package_type: PackageType;
  agent_permissions: string[];
  trial_days?: number;
  call_quota?: number;
}

// 批量操作请求
export interface BatchUserRequest {
  user_ids: string[];
  action: 'activate' | 'deactivate' | 'renew' | 'export';
  renew_days?: number;
}

// 套餐配置
export const PACKAGE_CONFIG: Record<PackageType, { name: string; color: string }> = {
  basic: { name: '基础版', color: 'bg-muted text-muted-foreground' },
  advanced: { name: '进阶版', color: 'bg-primary/10 text-primary' },
  flagship: { name: '旗舰版', color: 'bg-warning/10 text-warning' },
};

/**
 * 获取飞书用户列表
 */
export async function getFeishuUsers(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  package_type?: string;
  search?: string;
}): Promise<FeishuUserListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.package_type) searchParams.set('package_type', params.package_type);
  if (params?.search) searchParams.set('search', params.search);

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
 * 创建飞书用户
 */
export async function createFeishuUser(data: FeishuUserRequest): Promise<FeishuUser> {
  return apiClient.post<FeishuUser>(API_ENDPOINTS.feishuUsers.list, data);
}

/**
 * 更新飞书用户
 */
export async function updateFeishuUser(id: string, data: Partial<FeishuUserRequest>): Promise<FeishuUser> {
  return apiClient.put<FeishuUser>(API_ENDPOINTS.feishuUsers.detail(id), data);
}

/**
 * 删除飞书用户
 */
export async function deleteFeishuUser(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete<{ success: boolean; message: string }>(
    API_ENDPOINTS.feishuUsers.detail(id)
  );
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
 * 批量操作用户
 */
export async function batchUserOperation(
  data: BatchUserRequest
): Promise<{ success: boolean; affected: number }> {
  return apiClient.post<{ success: boolean; affected: number }>(
    `${API_ENDPOINTS.feishuUsers.list}/batch`,
    data
  );
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

/**
 * 获取用户统计
 */
export async function getFeishuUserStats(): Promise<FeishuUserStats> {
  const response = await getFeishuUsers({ page_size: 1000 });
  const users = response.users;

  return {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    expired: users.filter((u) => u.status === 'expired').length,
    trial: users.filter((u) => u.status === 'trial').length,
    expiring_soon: users.filter((u) => {
      if (!u.expire_time) return false;
      const expireDate = new Date(u.expire_time);
      const now = new Date();
      const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    }).length,
  };
}
