/**
 * 数据报表API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 概览数据
export interface ReportOverview {
  total_sales: number;
  total_orders: number;
  active_users: number;
  conversion_rate: number;
  sales_trend: Array<{ date: string; sales: number; orders: number }>;
  platform_distribution: Array<{ name: string; value: number; color: string }>;
}

// 使用情况
export interface ReportUsage {
  total_calls: number;
  total_tokens: number;
  agent_usage: Array<{
    name: string;
    calls: number;
    success_rate: number;
  }>;
}

// 收入数据
export interface ReportRevenue {
  total_revenue: number;
  revenue_trend: Array<{ date: string; revenue: number }>;
  package_distribution: Array<{ name: string; count: number; revenue: number }>;
}

// 智能体效能
export interface ReportAgents {
  agents: Array<{
    id: string;
    name: string;
    type: string;
    total_tasks: number;
    success_rate: number;
    avg_duration: number;
    total_tokens: number;
  }>;
}

/**
 * 获取报表概览
 */
export async function getReportOverview(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ReportOverview> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  
  const endpoint = `${API_ENDPOINTS.reports.overview}?${searchParams.toString()}`;
  return apiClient.get<ReportOverview>(endpoint);
}

/**
 * 获取使用情况报表
 */
export async function getReportUsage(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ReportUsage> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  
  const endpoint = `${API_ENDPOINTS.reports.usage}?${searchParams.toString()}`;
  return apiClient.get<ReportUsage>(endpoint);
}

/**
 * 获取收入报表
 */
export async function getReportRevenue(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ReportRevenue> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  
  const endpoint = `${API_ENDPOINTS.reports.revenue}?${searchParams.toString()}`;
  return apiClient.get<ReportRevenue>(endpoint);
}

/**
 * 获取智能体效能报表
 */
export async function getReportAgents(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ReportAgents> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  
  const endpoint = `${API_ENDPOINTS.reports.agents}?${searchParams.toString()}`;
  return apiClient.get<ReportAgents>(endpoint);
}
