/**
 * ERP系统 API
 */
import { apiClient, PaginatedResponse } from './client';

// ERP商品类型
export interface ERPProduct {
  id: string;
  user_id?: string;
  internal_sku: string;
  name_zh: string;
  name_en?: string;
  source_url?: string;
  supplier_name?: string;
  supplier_url?: string;
  cost_price: number;
  domestic_shipping: number;
  first_mile_shipping: number;
  total_cost: number;
  images?: string;
  processed_images?: string;
  image_status: string;
  compliance_status: string;
  compliance_check_result?: string;
  category_id?: string;
  category_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// 库存类型
export interface Inventory {
  id: string;
  product_id: string;
  qty_available: number;
  qty_reserved: number;
  qty_in_transit: number;
  safety_stock: number;
  reorder_point: number;
  reorder_qty: number;
  avg_daily_sales: number;
  days_of_stock: number;
  is_low_stock: boolean;
  need_reorder: boolean;
  warehouse?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// 采购单类型
export interface PurchaseOrder {
  id: string;
  po_number: string;
  product_id: string;
  qty: number;
  unit_price: number;
  total_amount: number;
  supplier_name?: string;
  supplier_url?: string;
  supplier_contact?: string;
  status: string;
  order_date: string;
  expected_arrival?: string;
  actual_arrival?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ERP订单类型
export interface ERPOrder {
  id: string;
  user_id?: string;
  platform?: string;
  shop_id?: string;
  platform_order_id?: string;
  product_id?: string;
  sku_id?: string;
  product_name: string;
  quantity: number;
  sale_price: number;
  total_amount: number;
  currency?: string;
  cost_price: number;
  shipping_cost: number;
  platform_fee: number;
  ad_cost: number;
  profit: number;
  buyer_id?: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  status: string;
  abnormal_type?: string;
  order_time?: string;
  pay_time?: string;
  ship_time?: string;
  deliver_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 财务汇总
export interface FinanceSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  total_sales: number;
  total_orders: number;
  total_cost: number;
  total_profit: number;
  profit_rate: number;
  daily_summaries: Array<{
    date: string;
    total_sales: number;
    total_orders: number;
    net_profit: number;
  }>;
}

// 定价请求
export interface PricingRequest {
  product_id?: string;
  cost_price: number;
  domestic_shipping: number;
  first_mile_shipping: number;
  platform_fee_rate: number;
  ad_budget_rate: number;
  target_profit_rate: number;
  competitor_price?: number;
}

// 定价响应
export interface PricingResponse {
  product_id?: string;
  total_cost: number;
  target_price: number;
  competitor_price?: number;
  suggested_price: number;
  profit_margin: number;
  cost_breakdown: Record<string, number>;
  pricing_basis: string;
}

// ============ 商品管理 API ============

export async function getERPProducts(params?: {
  keyword?: string;
  status?: string;
  compliance_status?: string;
  category?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<ERPProduct>> {
  const searchParams = new URLSearchParams();
  if (params?.keyword) searchParams.set('keyword', params.keyword);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.compliance_status) searchParams.set('compliance_status', params.compliance_status);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  return apiClient.get<PaginatedResponse<ERPProduct>>(`/erp/products?${searchParams.toString()}`);
}

export async function getERPProduct(productId: string): Promise<ERPProduct> {
  return apiClient.get<ERPProduct>(`/erp/products/${productId}`);
}

export async function createERPProduct(data: Partial<ERPProduct>): Promise<ERPProduct> {
  return apiClient.post<ERPProduct>('/erp/products', data);
}

export async function updateERPProduct(productId: string, data: Partial<ERPProduct>): Promise<ERPProduct> {
  return apiClient.put<ERPProduct>(`/erp/products/${productId}`, data);
}

export async function deleteERPProduct(productId: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete<{ success: boolean; message: string }>(`/erp/products/${productId}`);
}

// ============ 库存管理 API ============

export async function getInventoryList(params?: {
  low_stock?: boolean;
  page?: number;
  page_size?: number;
}): Promise<Inventory[]> {
  const searchParams = new URLSearchParams();
  if (params?.low_stock) searchParams.set('low_stock', 'true');
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  return apiClient.get<Inventory[]>(`/erp/inventory?${searchParams.toString()}`);
}

export async function getProductInventory(productId: string): Promise<Inventory> {
  return apiClient.get<Inventory>(`/erp/inventory/${productId}`);
}

export async function updateInventory(productId: string, data: Partial<Inventory>): Promise<Inventory> {
  return apiClient.put<Inventory>(`/erp/inventory/${productId}`, data);
}

// ============ 采购管理 API ============

export async function getPurchaseOrders(params?: {
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<PurchaseOrder[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  return apiClient.get<PurchaseOrder[]>(`/erp/purchase-orders?${searchParams.toString()}`);
}

export async function createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  return apiClient.post<PurchaseOrder>('/erp/purchase-orders', data);
}

export async function updatePurchaseOrder(orderId: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  return apiClient.put<PurchaseOrder>(`/erp/purchase-orders/${orderId}`, data);
}

// ============ ERP订单管理 API ============

export async function getERPOrders(params?: {
  platform?: string;
  status?: string;
  keyword?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<ERPOrder>> {
  const searchParams = new URLSearchParams();
  if (params?.platform) searchParams.set('platform', params.platform);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.keyword) searchParams.set('keyword', params.keyword);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  
  return apiClient.get<PaginatedResponse<ERPOrder>>(`/erp/orders?${searchParams.toString()}`);
}

// ============ 智能定价 API ============

export async function calculatePricing(data: PricingRequest): Promise<PricingResponse> {
  return apiClient.post<PricingResponse>('/erp/pricing', data);
}

// ============ 财务汇总 API ============

export async function getFinanceSummary(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<FinanceSummary> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  
  return apiClient.get<FinanceSummary>(`/erp/finance/summary?${searchParams.toString()}`);
}
