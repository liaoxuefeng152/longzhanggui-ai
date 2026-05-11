import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 模型类型定义
export interface Model {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_url: string;
  status: 'online' | 'offline' | 'error';
  enabled: boolean;
  priority: number;
  max_tokens: number;
  cost_per_1k: number;
  created_at: string;
  updated_at: string;
}

export interface ModelCreate {
  name: string;
  provider: string;
  model_id: string;
  api_url?: string;
  priority?: number;
  max_tokens?: number;
  cost_per_1k?: number;
}

export interface ModelUpdate {
  name?: string;
  provider?: string;
  model_id?: string;
  api_url?: string;
  enabled?: boolean;
  priority?: number;
  max_tokens?: number;
  cost_per_1k?: number;
}

// 获取模型列表
export async function getModels(params?: {
  provider?: string;
  status?: string;
}): Promise<Model[]> {
  const searchParams = new URLSearchParams();
  if (params?.provider) searchParams.set('provider', params.provider);
  if (params?.status) searchParams.set('status', params.status);
  
  const endpoint = `${API_ENDPOINTS.models.list}?${searchParams.toString()}`;
  const response = await apiClient.get<{ data: Model[] }>(endpoint);
  return response.data;
}

// 获取单个模型
export async function getModel(id: string): Promise<Model> {
  return apiClient.get<Model>(API_ENDPOINTS.models.detail(id));
}

// 创建模型
export async function createModel(data: ModelCreate): Promise<Model> {
  return apiClient.post<Model>(API_ENDPOINTS.models.list, data);
}

// 更新模型
export async function updateModel(id: string, data: ModelUpdate): Promise<Model> {
  return apiClient.put<Model>(API_ENDPOINTS.models.detail(id), data);
}

// 删除模型
export async function deleteModel(id: string): Promise<void> {
  return apiClient.delete(API_ENDPOINTS.models.detail(id));
}

// 测试模型连接
export async function testModel(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`${API_ENDPOINTS.models.detail(id)}/test`, {});
}
