/**
 * 控制台API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 统计数据类型
export interface DashboardStats {
  todayCalls: number;
  onlineUsers: number;
  todayOrders: number;
  referralUsers: number;
  assistantCalls: number; // 智能助理调用次数
  callTrend: Array<{
    date: string;
    calls: number;
  }>;
  recentUsers: Array<{
    id: string;
    nickname: string;
    avatar?: string;
    createdAt: string;
  }>;
}

/**
 * 获取控制台统计数据
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<{ success?: boolean; data?: DashboardStats } | DashboardStats>(API_ENDPOINTS.dashboard.stats);
  // 兼容两种响应格式：{ success, data } 或直接返回 data
  if ('data' in response && response.data) {
    return response.data;
  }
  return response as DashboardStats;
}
