/**
 * SKILLAPI
 */
import { apiClient, PaginatedResponse } from './client';
import { API_ENDPOINTS } from './config';

// SKILL类型
export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  prompt_id?: string;
  model_id?: string;
  config?: Record<string, unknown>;
  status: string;
  total_calls: number;
  created_at: string;
  updated_at: string;
}

// 任务类型
export interface Task {
  id: string;
  agent_id: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  tokens_used: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

/**
 * 获取SKILL列表
 */
export async function getAgents(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<PaginatedResponse<Agent>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.status) searchParams.set('status', params.status);
  
  const endpoint = `${API_ENDPOINTS.agents.list}?${searchParams.toString()}`;
  return apiClient.get<PaginatedResponse<Agent>>(endpoint);
}

/**
 * 获取SKILL详情
 */
export async function getAgent(id: string): Promise<Agent> {
  return apiClient.get<Agent>(API_ENDPOINTS.agents.detail(id));
}

/**
 * 更新SKILL配置
 */
export async function updateAgentConfig(
  id: string,
  config: Record<string, unknown>
): Promise<Agent> {
  return apiClient.put<Agent>(API_ENDPOINTS.agents.config(id), { config });
}

/**
 * 启动SKILL任务
 */
export async function startAgentTask(
  agentId: string,
  params: Record<string, unknown>
): Promise<{ task_id: string; message: string }> {
  return apiClient.post<{ task_id: string; message: string }>(
    API_ENDPOINTS.agents.start(agentId),
    { params }
  );
}

/**
 * 停止SKILL任务
 */
export async function stopAgentTask(
  agentId: string,
  taskId: string
): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>(
    API_ENDPOINTS.agents.stop(agentId),
    { task_id: taskId }
  );
}

/**
 * 获取任务列表
 */
export async function getTasks(params?: {
  agent_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Task>> {
  const searchParams = new URLSearchParams();
  if (params?.agent_id) searchParams.set('agent_id', params.agent_id);
  if (params?.status) searchParams.set('task_status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  const endpoint = `${API_ENDPOINTS.agents.tasks}?${searchParams.toString()}`;
  return apiClient.get<PaginatedResponse<Task>>(endpoint);
}

/**
 * 获取任务详情
 */
export async function getTask(taskId: string): Promise<Task> {
  return apiClient.get<Task>(API_ENDPOINTS.agents.taskDetail(taskId));
}
