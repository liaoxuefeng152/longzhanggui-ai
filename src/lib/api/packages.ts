/**
 * 套餐管理API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 套餐类型
export interface Package {
  id: string;
  name: string;
  price: number;
  call_quota: number;
  call_limit: number;
  duration: number;
  duration_days: number;
  features: string[];
  agent_access: string[];
  user_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 套餐创建请求
export interface PackageCreate {
  name: string;
  price: number;
  call_quota: number;
  call_limit: number;
  duration: number;
  duration_days: number;
  features?: string[];
  agent_access?: string[];
}

// 套餐更新请求
export interface PackageUpdate {
  name?: string;
  price?: number;
  call_quota?: number;
  call_limit?: number;
  duration?: number;
  duration_days?: number;
  features?: string[];
  agent_access?: string[];
  is_active?: boolean;
}

// 套餐列表响应
export interface PackageListResponse {
  packages: Package[];
}

/**
 * 获取套餐列表
 */
export async function getPackages(activeOnly?: boolean): Promise<PackageListResponse> {
  const searchParams = new URLSearchParams();
  if (activeOnly) searchParams.set('active_only', 'true');
  
  const endpoint = `${API_ENDPOINTS.packages.list}?${searchParams.toString()}`;
  return apiClient.get<PackageListResponse>(endpoint);
}

/**
 * 获取套餐详情
 */
export async function getPackage(id: string): Promise<Package> {
  return apiClient.get<Package>(API_ENDPOINTS.packages.detail(id));
}

/**
 * 创建套餐
 */
export async function createPackage(data: PackageCreate): Promise<Package> {
  return apiClient.post<Package>(API_ENDPOINTS.packages.list, data);
}

/**
 * 更新套餐
 */
export async function updatePackage(id: string, data: PackageUpdate): Promise<Package> {
  return apiClient.put<Package>(API_ENDPOINTS.packages.detail(id), data);
}

/**
 * 删除套餐
 */
export async function deletePackage(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(API_ENDPOINTS.packages.detail(id));
}
