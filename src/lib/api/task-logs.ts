/**
 * 任务日志API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 任务日志类型
export interface TaskLog {
  id: string;
  task_id: string;
  agent_id: string;
  user_id: string;
  action: string;
  status: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration: number;
  tokens_used: number;
  created_at: string;
}

// 任务日志列表响应
export interface TaskLogListResponse {
  logs: TaskLog[];
  total: number;
  page: number;
  page_size: number;
}

// 统计摘要
export interface TaskLogStats {
  total_tasks: number;
  success_tasks: number;
  failed_tasks: number;
  success_rate: number;
  avg_duration: number;
  total_tokens: number;
  start_date: string;
  end_date: string;
}

/**
 * 获取任务日志列表
 */
export async function getTaskLogs(params?: {
  agent_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<TaskLogListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.agent_id) searchParams.set('agent_id', params.agent_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  const endpoint = `${API_ENDPOINTS.taskLogs.list}?${searchParams.toString()}`;
  const response = await apiClient.get<{ items?: TaskLog[]; logs?: TaskLog[]; total: number; page: number; page_size: number }>(endpoint);
  // 兼容后端返回的 items 字段
  return {
    logs: response.items || response.logs || [],
    total: response.total,
    page: response.page,
    page_size: response.page_size,
  };
}

/**
 * 获取任务日志详情
 */
export async function getTaskLog(id: string): Promise<TaskLog> {
  return apiClient.get<TaskLog>(API_ENDPOINTS.taskLogs.detail(id));
}

/**
 * 重试任务
 */
export async function retryTask(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post(API_ENDPOINTS.taskLogs.retry(id));
}

/**
 * 获取统计摘要
 */
export async function getTaskLogStats(): Promise<TaskLogStats> {
  return apiClient.get<TaskLogStats>(API_ENDPOINTS.taskLogs.stats);
}
