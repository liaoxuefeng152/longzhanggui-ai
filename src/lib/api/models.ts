/**
 * 模型管理API
 */
import { apiClient, PaginatedResponse } from './client';
import { API_ENDPOINTS } from './config';

// 模型类型
export interface Model {
  id: string;
  name: string;
  model_id: string;
  provider: string;
  api_key: string;
  endpoint?: string;
  daily_limit: number;
  today_used: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// 模型创建请求
export interface ModelCreate {
  name: string;
  model_id: string;
  provider: string;
  api_key: string;
  endpoint?: string;
  daily_limit?: number;
}

// 模型更新请求
export interface ModelUpdate {
  name?: string;
  model_id?: string;
  provider?: string;
  api_key?: string;
  endpoint?: string;
  daily_limit?: number;
  status?: string;
}

// 测试响应
export interface ModelTestResponse {
  success: boolean;
  latency: number;
  message: string;
}

/**
 * 获取模型列表
 */
export async function getModels(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<PaginatedResponse<Model>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.status) searchParams.set('status', params.status);
  
  const endpoint = `${API_ENDPOINTS.models.list}?${searchParams.toString()}`;
  return apiClient.get<PaginatedResponse<Model>>(endpoint);
}

/**
 * 获取模型详情
 */
export async function getModel(id: string): Promise<Model> {
  return apiClient.get<Model>(API_ENDPOINTS.models.detail(id));
}

/**
 * 创建模型
 */
export async function createModel(data: ModelCreate): Promise<Model> {
  return apiClient.post<Model>(API_ENDPOINTS.models.list, data);
}

/**
 * 更新模型
 */
export async function updateModel(id: string, data: ModelUpdate): Promise<Model> {
  return apiClient.put<Model>(API_ENDPOINTS.models.detail(id), data);
}

/**
 * 删除模型
 */
export async function deleteModel(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(API_ENDPOINTS.models.detail(id));
}

/**
 * 测试模型连通性
 */
export async function testModel(id: string): Promise<ModelTestResponse> {
  return apiClient.post<ModelTestResponse>(API_ENDPOINTS.models.test(id));
}

/**
 * 获取模型状态列表
 */
export async function getModelsStatus(): Promise<{
  models: Array<{
    id: string;
    name: string;
    status: string;
    modelId: string;
    totalTokens: number;
    dailyLimit: number;
    todayUsed: number;
  }>;
}> {
  return apiClient.get(API_ENDPOINTS.models.status);
}
