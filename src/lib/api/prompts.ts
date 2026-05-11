/**
 * Prompt管理API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// Prompt类型
export interface Prompt {
  id: string;
  name: string;
  category: string;
  content: string;
  platform: string;
  agent_type: string;
  variables?: Record<string, unknown>;
  model_id?: string;
  version: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Prompt创建请求
export interface PromptCreate {
  name: string;
  category: string;
  content: string;
  platform: string;
  agent_type: string;
  variables?: Record<string, unknown>;
  model_id?: string;
}

// Prompt更新请求
export interface PromptUpdate {
  name?: string;
  category?: string;
  content?: string;
  platform?: string;
  agent_type?: string;
  variables?: Record<string, unknown>;
  model_id?: string;
  version?: string;
  status?: string;
  is_active?: boolean;
}

// Prompt列表响应
export interface PromptListResponse {
  items: Prompt[];
  prompts: Prompt[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * 获取Prompt列表
 */
export async function getPrompts(params?: {
  category?: string;
  page?: number;
  page_size?: number;
}): Promise<PromptListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  const endpoint = `${API_ENDPOINTS.prompts.list}?${searchParams.toString()}`;
  return apiClient.get<PromptListResponse>(endpoint);
}

/**
 * 获取Prompt详情
 */
export async function getPrompt(id: string): Promise<Prompt> {
  return apiClient.get<Prompt>(API_ENDPOINTS.prompts.detail(id));
}

/**
 * 创建Prompt
 */
export async function createPrompt(data: PromptCreate): Promise<Prompt> {
  return apiClient.post<Prompt>(API_ENDPOINTS.prompts.list, data);
}

/**
 * 更新Prompt
 */
export async function updatePrompt(id: string, data: PromptUpdate): Promise<Prompt> {
  return apiClient.put<Prompt>(API_ENDPOINTS.prompts.detail(id), data);
}

/**
 * 删除Prompt
 */
export async function deletePrompt(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(API_ENDPOINTS.prompts.detail(id));
}
