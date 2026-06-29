/**
 * 龙掌柜全局数据存储 - 已迁移到 Supabase 数据库
 * 
 * 注意：此文件仅保留类型定义和空数据结构
 * 所有数据操作已迁移到 src/lib/storage/database.ts
 * 模拟数据已清除，改为从数据库查询
 */

// 类型定义 - 保留供其他文件引用
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  main_products?: string[];
  coop_level?: 'A' | 'B' | 'C';
  payment_terms?: string;
  delivery_cycle?: number;
  rating?: number;
  total_orders?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  internal_sku?: string;
  name_zh: string;
  name_en?: string;
  category?: string;
  source_url?: string;
  supplier_id?: string;
  supplier_name?: string;
  cost_price?: number;
  domestic_shipping?: number;
  first_mile_shipping?: number;
  total_cost?: number;
  weight_kg?: number;
  image_status?: 'pending' | 'processing' | 'done';
  listing_status?: 'pending' | 'processing' | 'done';
  compliance_status?: 'pending' | 'checking' | 'passed' | 'failed';
  compliance_issues?: string[];
  status?: 'draft' | 'selected' | 'processing' | 'ready' | 'published' | 'archived';
  selection_score?: number;
  sales_trend?: number;
  profit_margin?: number;
  total_sales?: number;
  total_orders?: number;
  total_profit?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse: 'domestic' | 'fba' | 'third_party';
  location?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  platform: string;
  platform_order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  sale_price: number;
  total_amount: number;
  currency: string;
  cost_price?: number;
  shipping_cost?: number;
  platform_fee?: number;
  ad_cost?: number;
  profit?: number;
  buyer_name?: string;
  buyer_address?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  order_time?: string;
  pay_time?: string;
  ship_time?: string;
  deliver_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdCampaign {
  id: string;
  product_id?: string;
  product_name?: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'ended';
  daily_budget?: number;
  total_spent?: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
  revenue?: number;
  roi?: number;
  cpc?: number;
  ctr?: number;
  risk_status?: 'normal' | 'warning' | 'critical';
  created_at?: string;
  updated_at?: string;
}

export interface Logistics {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'exception';
  shipped_at?: string;
  delivered_at?: string;
  tracking_events?: Array<{ time: string; location: string; status: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface FinanceRecord {
  id: string;
  record_date: string;
  record_type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description?: string;
  platform?: string;
  order_id?: string;
  source?: string;
  created_at?: string;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier_name: string;
  items: Array<{
    product_id: string;
    product_name: string;
    qty: number;
    unit_cost: number;
    total_cost: number;
  }>;
  total_amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  order_date: string;
  expected_date?: string;
  received_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowExecution {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  steps: Array<{
    name: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    output?: unknown;
  }>;
  input?: unknown;
  output?: unknown;
  error?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
}

/**
 * LobsterStore 类 - 空数据存储
 * 已迁移到 Supabase，此类仅作为兼容层保留
 */
class LobsterStore {
  // 空数据存储
  private suppliers = new Map<string, Supplier>();
  private products = new Map<string, Product>();
  private inventory = new Map<string, Inventory>();
  private orders = new Map<string, Order>();
  private adCampaigns = new Map<string, AdCampaign>();
  private logistics = new Map<string, Logistics>();
  private financeRecords = new Map<string, FinanceRecord>();
  private purchases = new Map<string, Purchase>();
  private workflows = new Map<string, WorkflowExecution>();
  
  // 商品关联索引
  private productInventory = new Map<string, string[]>();
  private productOrders = new Map<string, string[]>();
  private productAds = new Map<string, string[]>();

  constructor() {
    // 不初始化模拟数据，所有数据从数据库查询
  }

  // 方法保留但返回空数据（实际应调用 database.ts）
  getSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values());
  }

  getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }

  createProduct(data: Partial<Product>): Product {
    const product: Product = {
      id: data.id || `PROD${Date.now()}`,
      name_zh: data.name_zh || '',
      ...data,
      created_at: new Date().toISOString(),
    };
    this.products.set(product.id, product);
    return product;
  }

  updateProduct(id: string, data: Partial<Product>): Product | undefined {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.products.set(id, updated);
    return updated;
  }

  getInventory(): Inventory[] {
    return Array.from(this.inventory.values());
  }

  getOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  getAdCampaigns(): AdCampaign[] {
    return Array.from(this.adCampaigns.values());
  }

  getLogistics(): Logistics[] {
    return Array.from(this.logistics.values());
  }

  getFinanceRecords(): FinanceRecord[] {
    return Array.from(this.financeRecords.values());
  }

  getPurchases(): Purchase[] {
    return Array.from(this.purchases.values());
  }

  getWorkflows(): WorkflowExecution[] {
    return Array.from(this.workflows.values());
  }
}

// 导出全局 store 实例（兼容层）
export const store = new LobsterStore();

// 导出获取 store 的函数
export function getStore(): LobsterStore {
  return store;
}