/**
 * 平台绑定管理API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 平台绑定类型
export interface PlatformBinding {
  id: string;
  platform: string;
  account_name: string;
  shop_id: string;
  region: string;
  status: 'active' | 'expired' | 'error';
  auth_type: string;
  expire_time: string;
  last_sync: string;
  product_count: number;
  order_count: number;
  created_at: string;
  updated_at: string;
}

// 平台绑定列表响应
export interface PlatformBindingListResponse {
  bindings: PlatformBinding[];
  total: number;
  page: number;
  page_size: number;
}

// 平台绑定统计
export interface PlatformBindingStats {
  total: number;
  active: number;
  expired: number;
  error: number;
}

// 创建平台绑定请求
export interface CreatePlatformBindingRequest {
  platform: string;
  account_name: string;
  shop_id: string;
  region: string;
  api_key?: string;
  api_secret?: string;
  auth_type: string;
}

// 同步结果
export interface SyncResult {
  success: boolean;
  message: string;
  synced_products?: number;
  synced_orders?: number;
}

/**
 * 获取平台绑定列表
 */
export async function getPlatformBindings(params?: {
  page?: number;
  page_size?: number;
  platform?: string;
  status?: string;
}): Promise<PlatformBindingListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.platform) searchParams.set('platform', params.platform);
  if (params?.status) searchParams.set('status', params.status);

  const endpoint = `${API_ENDPOINTS.platformBindings.list}?${searchParams.toString()}`;
  return apiClient.get<PlatformBindingListResponse>(endpoint);
}

/**
 * 获取平台绑定详情
 */
export async function getPlatformBinding(id: string): Promise<PlatformBinding> {
  return apiClient.get<PlatformBinding>(API_ENDPOINTS.platformBindings.detail(id));
}

/**
 * 创建平台绑定
 */
export async function createPlatformBinding(
  data: CreatePlatformBindingRequest
): Promise<PlatformBinding> {
  return apiClient.post<PlatformBinding>(API_ENDPOINTS.platformBindings.list, data);
}

/**
 * 解绑平台
 */
export async function deletePlatformBinding(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete<{ success: boolean; message: string }>(
    API_ENDPOINTS.platformBindings.detail(id)
  );
}

/**
 * 同步平台数据
 */
export async function syncPlatformBinding(id: string): Promise<SyncResult> {
  return apiClient.post<SyncResult>(API_ENDPOINTS.platformBindings.sync(id));
}

/**
 * 获取平台绑定统计
 */
export async function getPlatformBindingStats(): Promise<PlatformBindingStats> {
  const response = await getPlatformBindings({ page_size: 1000 });
  const bindings = response.bindings;

  return {
    total: bindings.length,
    active: bindings.filter((b) => b.status === 'active').length,
    expired: bindings.filter((b) => b.status === 'expired').length,
    error: bindings.filter((b) => b.status === 'error').length,
  };
}
