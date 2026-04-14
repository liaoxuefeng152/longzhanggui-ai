/**
 * 控制台API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 统计数据类型
export interface DashboardStats {
  onlineModels: number;      // 在线模型数
  todayTaskCount: number;     // 今日任务总量
  taskSuccessRate: number;   // 任务成功率 (百分比)
  paidUsers: number;         // 付费用户数
  assistantCalls: number;     // 智能助理调用次数
  // 以下为辅助字段
  todayCalls: number;        // 今日调用次数（保留兼容）
  onlineUsers: number;       // 在线用户数
  todayOrders: number;       // 今日订单数
  referralUsers: number;     // 推荐用户数
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
