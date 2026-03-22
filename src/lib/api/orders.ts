/**
 * 订单中心管理API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 订单类型
export interface Order {
  id: string;
  order_id: string;
  customer: string;
  platform: string;
  product: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'exception';
  logistics_status: string;
  created_at: string;
  updated_at: string;
}

// 订单列表响应
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
}

// 订单统计
export interface OrderStats {
  today_orders: number;
  pending_shipment: number;
  in_transit: number;
  delivered: number;
  exception: number;
  today_amount: number;
}

// 平台信息
export interface PlatformInfo {
  name: string;
  code: string;
  order_count: number;
}

/**
 * 获取订单列表
 */
export async function getOrders(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  platform?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}): Promise<OrderListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.platform) searchParams.set('platform', params.platform);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);

  const endpoint = `${API_ENDPOINTS.orders.list}?${searchParams.toString()}`;
  return apiClient.get<OrderListResponse>(endpoint);
}

/**
 * 获取订单详情
 */
export async function getOrder(id: string): Promise<Order> {
  return apiClient.get<Order>(API_ENDPOINTS.orders.detail(id));
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  logistics_status?: string
): Promise<Order> {
  return apiClient.put<Order>(API_ENDPOINTS.orders.status(id), {
    status,
    logistics_status,
  });
}

/**
 * 获取订单统计
 */
export async function getOrderStats(): Promise<OrderStats> {
  return apiClient.get<OrderStats>(API_ENDPOINTS.orders.stats);
}

/**
 * 获取平台列表
 */
export async function getOrderPlatforms(): Promise<PlatformInfo[]> {
  return apiClient.get<PlatformInfo[]>(API_ENDPOINTS.orders.platforms);
}
