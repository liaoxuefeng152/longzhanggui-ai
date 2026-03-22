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
  return apiClient.get<DashboardStats>(API_ENDPOINTS.dashboard.stats);
}
