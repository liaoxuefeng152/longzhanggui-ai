import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 任务日志类型定义
export interface TaskLog {
  id: string;
  task_id: string;
  agent_id: string;
  agent_name: string;
  action: string;
  status: 'success' | 'failed' | 'processing';
  duration: number;
  tokens_used: number;
  cost: number;
  error_message?: string;
  request_params?: Record<string, unknown>;
  response_summary?: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
}

export interface TaskLogStats {
  total: number;
  success: number;
  failed: number;
  avg_duration: number;
}

// 获取任务日志列表
export async function getTaskLogs(params?: {
  status?: string;
  agent_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: TaskLog[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.agent_id) searchParams.set('agent_id', params.agent_id);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const endpoint = `${API_ENDPOINTS.taskLogs.list}?${searchParams.toString()}`;
  return apiClient.get(endpoint);
}

// 获取任务日志详情
export async function getTaskLogDetail(id: string): Promise<TaskLog> {
  return apiClient.get<TaskLog>(API_ENDPOINTS.taskLogs.detail(id));
}

// 重试失败任务
export async function retryTask(logId: string): Promise<void> {
  return apiClient.post(`${API_ENDPOINTS.taskLogs.retry(logId)}`, {});
}

// 获取任务日志统计
export async function getTaskLogStats(): Promise<TaskLogStats> {
  return apiClient.get<TaskLogStats>(API_ENDPOINTS.taskLogs.stats);
}
