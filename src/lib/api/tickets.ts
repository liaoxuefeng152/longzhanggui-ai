/**
 * 客服工单API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 工单类型
export interface Ticket {
  id: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  user_id: string;
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

// 工单列表响应
export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  page_size: number;
}

// 工单统计
export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

/**
 * 获取工单列表
 */
export async function getTickets(params?: {
  status?: string;
  priority?: string;
  page?: number;
  page_size?: number;
}): Promise<TicketListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.priority) searchParams.set('priority', params.priority);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  const endpoint = `${API_ENDPOINTS.tickets.list}?${searchParams.toString()}`;
  return apiClient.get<TicketListResponse>(endpoint);
}

/**
 * 获取工单详情
 */
export async function getTicket(id: string): Promise<Ticket> {
  return apiClient.get<Ticket>(API_ENDPOINTS.tickets.detail(id));
}

/**
 * 关闭工单
 */
export async function closeTicket(
  id: string,
  resolution: string
): Promise<{ success: boolean; message: string }> {
  return apiClient.post(API_ENDPOINTS.tickets.close(id), { resolution });
}

/**
 * 分配工单
 */
export async function assignTicket(
  id: string,
  assignedTo: string
): Promise<{ success: boolean; message: string }> {
  return apiClient.post(API_ENDPOINTS.tickets.assign(id), { assigned_to: assignedTo });
}

/**
 * 获取工单统计
 */
export async function getTicketStats(): Promise<TicketStats> {
  return apiClient.get<TicketStats>(API_ENDPOINTS.tickets.stats);
}
