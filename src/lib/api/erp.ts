/**
 * ERP API 客户端
 * 连接后端数据库 API
 */

// API 基础路径
const API_BASE = '/api/v1';

// 获取认证头
function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

// API 请求封装
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // 未认证，清除本地存储
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      return { error: data.detail || data.error || '请求失败' };
    }

    return { data };
  } catch (error) {
    console.error('API request error:', error);
    return { error: error instanceof Error ? error.message : '网络错误' };
  }
}

// ============ 商品 API ============

export interface Product {
  id: string;
  internal_sku: string;
  name_zh: string;
  name_en?: string;
  category?: string;
  status: string;
  
  // 选品阶段
  source_url?: string;
  supplier_name?: string;
  supplier_url?: string;
  selected_at?: string;
  selection_score?: number;
  
  // 成本信息
  cost_price: number;
  domestic_shipping: number;
  first_mile_shipping: number;
  total_cost: number;
  
  // 处理状态
  image_status?: string;
  listing_status?: string;
  compliance_status?: string;
  compliance_issues?: string[];
  
  // 店铺认领
  platform_listings?: PlatformListing[];
  
  // 统计
  total_sales?: number;
  total_orders?: number;
  total_profit?: number;
  
  // 规格
  weight_kg?: number;
  dimensions?: { length: number; width: number; height: number };
  brand?: string;
  model?: string;
  material?: string;
  color?: string;
  size?: string;
  
  // 时间
  created_at: string;
  updated_at: string;
}

export interface PlatformListing {
  id: string;
  platform: string;
  shop_id: string;
  shop_name: string;
  platform_product_id?: string;
  listing_title?: string;
  sale_price?: number;
  currency?: string;
  status?: string;
}

export interface CreateProductRequest {
  name_zh: string;
  name_en?: string;
  category?: string;
  source_url?: string;
  supplier_name?: string;
  cost_price: number;
  domestic_shipping?: number;
  first_mile_shipping?: number;
  total_cost?: number;
  status?: string;
  selection_score?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  image_status?: string;
  listing_status?: string;
  compliance_status?: string;
}

export const productsApi = {
  // 获取商品列表
  async list(params?: { status?: string; category?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    
    return apiRequest<Product[]>(`/erp/products?${query.toString()}`);
  },

  // 获取单个商品
  async get(id: string) {
    return apiRequest<Product>(`/erp/products/${id}`);
  },

  // 创建商品
  async create(data: CreateProductRequest) {
    return apiRequest<Product>('/erp/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新商品
  async update(id: string, data: UpdateProductRequest) {
    return apiRequest<Product>(`/erp/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 删除商品
  async delete(id: string) {
    return apiRequest<void>(`/erp/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ 认证 API ============
// 注意: LoginRequest 和 LoginResponse 已在 auth.ts 中定义，这里使用 auth 模块的

export const authApi = {
  async login(data: { username: string; password: string }) {
    return apiRequest<{ access_token: string; token_type: string; user: { id: string; username: string; email: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async me() {
    return apiRequest<{ id: string; username: string; email: string; role: string }>('/auth/me');
  },
};

// ============ 库存 API ============

export interface Inventory {
  id: string;
  product_id: string;
  warehouse: string;
  location?: string;
  qty_available: number;
  qty_reserved: number;
  qty_in_transit: number;
  safety_stock: number;
  reorder_point: number;
  reorder_qty: number;
}

export const inventoryApi = {
  async list(productId?: string) {
    const query = productId ? `?product_id=${productId}` : '';
    return apiRequest<Inventory[]>(`/erp/inventory${query}`);
  },

  async update(id: string, data: Partial<Inventory>) {
    return apiRequest<Inventory>(`/erp/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============ 订单 API ============

export interface Order {
  id: string;
  order_no: string;
  platform: string;
  shop_name: string;
  customer_name: string;
  status: string;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

export const ordersApi = {
  async list(params?: { status?: string; platform?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.platform) query.set('platform', params.platform);
    
    return apiRequest<Order[]>(`/erp/orders?${query.toString()}`);
  },

  async get(id: string) {
    return apiRequest<Order>(`/erp/orders/${id}`);
  },
};

// ============ 数据统计 API ============

export interface ErpDashboardStats {
  total_products: number;
  published_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_profit: number;
  low_stock_alerts: number;
}

export const dashboardApi = {
  async getStats() {
    return apiRequest<ErpDashboardStats>('/dashboard/stats');
  },
};
