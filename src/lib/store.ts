/**
 * 全局数据存储层
 * 用于存储运行时数据，实现数据流转
 */

// 类型定义

export interface Product {
  id: string;
  internal_sku: string;
  name_zh: string;
  name_en?: string;
  category?: string;
  
  // 选品阶段
  source_url?: string;
  supplier_name?: string;
  supplier_url?: string;
  selected_at?: string;
  selection_score?: number;
  sales_trend?: number;
  profit_margin?: number;
  
  // 成本信息
  cost_price: number;
  domestic_shipping: number;
  first_mile_shipping: number;
  total_cost: number;
  
  // 产品规格
  weight_kg?: number;  // 产品重量(kg)
  dimensions?: { length: number; width: number; height: number }; // 产品尺寸(cm)
  packaging_list?: string[]; // 包装清单
  brand?: string; // 品牌
  model?: string; // 型号
  material?: string; // 材质
  color?: string; // 颜色
  size?: string; // 尺寸
  
  // 处理阶段
  images?: ProductImage[];
  listing?: ProductListing;
  pricing?: ProductPricing;
  
  // 处理状态
  image_status: 'pending' | 'processing' | 'done' | 'failed';
  listing_status: 'pending' | 'processing' | 'done' | 'failed';
  compliance_status: 'pending' | 'checking' | 'passed' | 'failed';
  compliance_issues?: string[];
  
  // 上架信息
  platform_listings?: PlatformListing[];
  
  // 生命周期状态
  status: 'draft' | 'selected' | 'processing' | 'ready' | 'published' | 'archived';
  
  // 统计数据
  total_sales?: number;
  total_orders?: number;
  total_profit?: number;
  
  // 时间戳
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  type: 'main' | 'gallery' | 'a_plus' | 'cover';
  original_url: string;
  processed_url?: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  platform?: string;
  created_at: string;
}

export interface ProductListing {
  title: string;
  title_en?: string;
  description?: string;
  bullet_points?: string[];
  keywords?: string[];
  tags?: string[];
  seo_score?: number;
  platform?: string;
  language?: string;
  generated_at?: string;
}

export interface ProductPricing {
  total_cost: number;
  suggested_price: number;
  target_price: number;
  profit_margin: number;
  competitor_prices?: number[];
  pricing_basis?: string;
  calculated_at?: string;
}

export interface PlatformListing {
  id: string;
  platform: 'tiktok' | 'amazon' | 'shopee';
  shop_id?: string;
  shop_name?: string;
  region?: string;
  platform_product_id?: string;
  platform_sku?: string;
  status: 'pending' | 'listed' | 'active' | 'inactive' | 'removed';
  listed_at?: string;
  listing_url?: string;
  
  // 认领店铺时设置的定价
  sale_price?: number;
  currency?: string;
  
  // 关联的Listing信息
  listing_title?: string;
  listing_description?: string;
  bullet_points?: string[];
  keywords?: string[];
  
  // 变体关系
  variants?: PlatformVariant[];
}

export interface PlatformVariant {
  id: string;
  platform_variant_id?: string;
  name: string;
  sku?: string;
  price: number;
  quantity?: number;
  image_url?: string;
  attributes?: Record<string, string>;
  status: 'active' | 'inactive';
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse: 'domestic' | 'indonesia' | 'thailand' | 'vietnam' | 'malaysia';
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
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  platform: 'tiktok' | 'amazon' | 'shopee';
  platform_order_id: string;
  shop_id?: string;
  product_id?: string;
  product_name: string;
  sku?: string;
  quantity: number;
  sale_price: number;
  total_amount: number;
  currency: string;
  cost_price: number;
  shipping_cost: number;
  platform_fee: number;
  ad_cost: number;
  profit: number;
  buyer_id?: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  abnormal_type?: string;
  order_time?: string;
  pay_time?: string;
  ship_time?: string;
  deliver_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  supplier_id?: string;
  supplier_name: string;
  items: PurchaseItem[];
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'partial' | 'received' | 'cancelled';
  order_date: string;
  expected_date?: string;
  received_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  product_id: string;
  product_name: string;
  qty: number;
  unit_cost: number;
  total_cost: number;
  received_qty?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  main_products?: string[];
  coop_level: 'A' | 'B' | 'C';
  payment_terms?: string;
  delivery_cycle?: number;
  rating: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  product_id?: string;
  product_name?: string;
  name: string;
  platform: 'tiktok' | 'amazon';
  status: 'draft' | 'active' | 'paused' | 'ended';
  daily_budget: number;
  total_spent: number;
  clicks: number;
  impressions: number;
  conversions: number;
  revenue: number;
  roi: number;
  cpc: number;
  ctr: number;
  acos?: number;
  risk_status: 'normal' | 'warning' | 'danger';
  risk_reasons?: string[];
  created_at: string;
  updated_at: string;
}

export interface Logistics {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  shipped_at?: string;
  delivered_at?: string;
  tracking_events: TrackingEvent[];
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  time: string;
  location: string;
  status: string;
}

export interface FinanceRecord {
  id: string;
  record_date: string;
  record_type: 'income' | 'expense' | 'refund' | 'adjustment';
  category: string;
  amount: number;
  currency: string;
  description?: string;
  platform?: string;
  source?: string;
  order_id?: string;
  product_id?: string;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  template_id: string;
  template_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  product_id?: string;
  product_name?: string;
  current_step: number;
  total_steps: number;
  steps: WorkflowStep[];
  started_at?: string;
  completed_at?: string;
  error?: string;
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  result?: any;
  error?: string;
}

// 采集清单类型

export interface CollectionItem {
  id: string;
  source: '1688' | 'taobao' | 'pinduoduo';
  source_url: string;
  source_id?: string;
  product_name?: string;
  keyword?: string;
  status: 'pending' | 'collected' | 'failed';
  product_id?: string;
  error?: string;
  added_from?: 'selection_agent' | 'manual';
  selection_report_id?: string;
  created_at: string;
  collected_at?: string;
}

// 公用采集箱类型

export interface PublicCollectionItem {
  id: string;
  collection_id: string;      // 关联的采集记录ID
  product_id: string;          // 关联的商品ID
  product_name: string;        // 商品名称
  product_name_en?: string;    // 英文名称
  source: '1688' | 'taobao' | 'pinduoduo';
  source_url: string;
  source_id?: string;
  supplier_name?: string;
  cost_price?: number;
  images?: string[];           // 商品图片列表
  category?: string;
  claimed: boolean;           // 是否已被认领
  claimed_by?: string;         // 认领人
  claimed_at?: string;        // 认领时间
  claimed_shop_id?: string;    // 认领到的店铺ID
  status: 'pending' | 'processing' | 'ready' | 'claimed';
  created_at: string;
  updated_at: string;
}

// 全局存储

declare global {
  // eslint-disable-next-line no-var
  // eslint-disable-next-line no-var
  var __erp_purchases: PurchaseOrder[] | undefined;
  var __LOBSTER_STORE__: LobsterStore | undefined;
}

class LobsterStore {
  products: Map<string, Product> = new Map();
  inventory: Map<string, Inventory> = new Map();
  orders: Map<string, Order> = new Map();
  purchases: Map<string, Purchase> = new Map();
  suppliers: Map<string, Supplier> = new Map();
  adCampaigns: Map<string, AdCampaign> = new Map();
  logistics: Map<string, Logistics> = new Map();
  financeRecords: Map<string, FinanceRecord> = new Map();
  workflows: Map<string, WorkflowExecution> = new Map();
  
  // 待采集清单
  pendingCollections: Map<string, CollectionItem> = new Map();
  
  // 公用采集箱（采集完成待认领的商品）
  publicCollections: Map<string, PublicCollectionItem> = new Map();
  
  // 定时任务相关
  scheduledTasks: any[] = [];
  taskExecutions: any[] = [];
  syncTasks: any[] = [];
  
  // 店铺管理
  shops: any[] = [];
  
  // 用户和角色
  users: Map<string, any> = new Map();
  roles: any[] = [];
  
  // 操作日志
  operationLogs: any[] = [];
  
  // 索引：product_id -> 相关数据
  productInventory: Map<string, string[]> = new Map(); // product_id -> inventory_ids
  productOrders: Map<string, string[]> = new Map(); // product_id -> order_ids
  productAds: Map<string, string[]> = new Map(); // product_id -> ad_ids

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // 初始化供应商
    const suppliers: Supplier[] = [
      {
        id: 'SUP001',
        name: '深圳市电子科技有限公司',
        contact: '李经理',
        phone: '13800138001',
        email: 'li@sz-electronic.com',
        address: '深圳市南山区科技园',
        main_products: ['宠物自动喂食器', '便携式榨汁机', '智能手环'],
        coop_level: 'A',
        payment_terms: '款到发货',
        delivery_cycle: 5,
        rating: 4.8,
        total_orders: 28,
        created_at: '2025-06-15 10:00:00',
        updated_at: '2025-06-15 10:00:00',
      },
      {
        id: 'SUP002',
        name: '广州市家居用品有限公司',
        contact: '王总',
        phone: '13900139002',
        email: 'wang@gz-home.com',
        address: '广州市白云区工业园',
        main_products: ['LED化妆镜', '瑜伽垫', '保温杯'],
        coop_level: 'A',
        payment_terms: '月结30天',
        delivery_cycle: 7,
        rating: 4.6,
        total_orders: 15,
        created_at: '2025-08-20 14:30:00',
        updated_at: '2025-08-20 14:30:00',
      },
    ];
    suppliers.forEach(s => this.suppliers.set(s.id, s));

    // 初始化商品
    const products: Product[] = [
      {
        id: 'PROD001',
        internal_sku: 'SKU-PET-001',
        name_zh: '宠物自动喂食器 5L大容量',
        name_en: 'Automatic Pet Feeder 5L',
        category: '宠物用品',
        source_url: 'https://1688.com/product/1',
        supplier_name: '深圳市电子科技有限公司',
        cost_price: 89,
        domestic_shipping: 5,
        first_mile_shipping: 15,
        total_cost: 109,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 89.5,
        sales_trend: 92,
        profit_margin: 42,
        total_sales: 156,
        total_orders: 89,
        total_profit: 12800,
        created_at: '2026-03-15 10:30:00',
        updated_at: '2026-03-21 14:20:00',
      },
      {
        id: 'PROD002',
        internal_sku: 'SKU-HOME-001',
        name_zh: '便携式榨汁机 USB充电',
        name_en: 'Portable Juicer USB Rechargeable',
        category: '家居电器',
        source_url: 'https://1688.com/product/2',
        supplier_name: '深圳市电子科技有限公司',
        cost_price: 45,
        domestic_shipping: 4,
        first_mile_shipping: 12,
        total_cost: 61,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 76.2,
        total_sales: 89,
        total_orders: 52,
        total_profit: 6800,
        created_at: '2026-03-16 15:20:00',
        updated_at: '2026-03-21 11:00:00',
      },
      {
        id: 'PROD003',
        internal_sku: 'SKU-BEAUTY-001',
        name_zh: 'LED化妆镜 台式带灯',
        name_en: 'LED Makeup Mirror Desktop',
        category: '美妆工具',
        source_url: 'https://1688.com/product/3',
        supplier_name: '广州市家居用品有限公司',
        cost_price: 35,
        domestic_shipping: 3,
        first_mile_shipping: 10,
        total_cost: 48,
        image_status: 'processing',
        listing_status: 'pending',
        compliance_status: 'checking',
        status: 'processing',
        selection_score: 68.4,
        created_at: '2026-03-18 09:45:00',
        updated_at: '2026-03-21 10:30:00',
      },
      {
        id: 'PROD004',
        internal_sku: 'SKU-ELEC-001',
        name_zh: '智能手环 运动监测',
        name_en: 'Smart Fitness Tracker',
        category: '电子数码',
        source_url: 'https://1688.com/product/4',
        supplier_name: '深圳市电子科技有限公司',
        cost_price: 68,
        domestic_shipping: 5,
        first_mile_shipping: 18,
        total_cost: 91,
        image_status: 'pending',
        listing_status: 'pending',
        compliance_status: 'failed',
        compliance_issues: ['含禁售品类'],
        status: 'draft',
        selection_score: 45.2,
        created_at: '2026-03-17 14:10:00',
        updated_at: '2026-03-20 16:45:00',
      },
      // 妙手ERP风格商品 - iPad/平板保护套
      {
        id: 'PROD005',
        internal_sku: 'SKU-IPAD-001',
        name_zh: '苹果 iPad Pro 11寸磁吸拆分保护壳 带笔槽 防摔 透明 2024款',
        name_en: 'Apple iPad Pro 11 inch Magnetic Split Case with Pen Slot',
        category: '平板电脑配件>平板电脑保护套/壳',
        source_url: 'https://detail.1688.com/offer/965485657984.html',
        supplier_name: 'CoolShield源工厂',
        cost_price: 27.80,
        domestic_shipping: 0,
        first_mile_shipping: 8,
        total_cost: 35.80,
        weight_kg: 0.4,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 92.5,
        sales_trend: 88,
        profit_margin: 38,
        total_sales: 63931,
        total_orders: 28543,
        total_profit: 156800,
        created_at: '2026-04-22 22:35:44',
        updated_at: '2026-04-22 22:35:44',
      },
      {
        id: 'PROD006',
        internal_sku: 'SKU-IPAD-002',
        name_zh: '适用2025苹果iPad Pro 11寸磁吸拆分保护壳 带笔槽 防摔 10.2旋转',
        name_en: 'Compatible 2025 Apple iPad Pro 11 inch Magnetic Split Case',
        category: '平板电脑配件>平板电脑保护套/壳',
        source_url: 'https://detail.1688.com/offer/735049329987.html',
        supplier_name: 'CoolShield源工厂',
        cost_price: 26.00,
        domestic_shipping: 0,
        first_mile_shipping: 8,
        total_cost: 34.00,
        weight_kg: 0.45,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 90.1,
        sales_trend: 85,
        profit_margin: 36,
        total_sales: 970227,
        total_orders: 432156,
        total_profit: 892000,
        created_at: '2026-04-22 18:43:08',
        updated_at: '2026-04-22 18:43:08',
      },
      {
        id: 'PROD007',
        internal_sku: 'SKU-KINDLE-001',
        name_zh: '适用Kindle 2024保护套 四角防摔透明 K12 KPW6 KC TPU软壳',
        name_en: 'Compatible Kindle 2024 Case Four Corner Protection',
        category: '电子教育设备>电子书阅读器',
        source_url: 'https://detail.1688.com/offer/846511244072.html',
        supplier_name: 'Kindle源工厂',
        cost_price: 5.00,
        domestic_shipping: 0,
        first_mile_shipping: 5,
        total_cost: 10.00,
        weight_kg: 0.06,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 78.3,
        sales_trend: 72,
        profit_margin: 45,
        total_sales: 1558903,
        total_orders: 689234,
        total_profit: 1256000,
        created_at: '2026-04-22 18:17:38',
        updated_at: '2026-04-22 18:17:38',
      },
      {
        id: 'PROD008',
        internal_sku: 'SKU-IPAD-003',
        name_zh: '蒂连卡通笔槽平板套 三折智能Ipad套立体贴公仔苹果平板套',
        name_en: 'Cute Cartoon Pen Slot Tablet Case',
        category: '平板电脑配件>平板电脑保护套/壳',
        source_url: 'https://detail.1688.com/offer/813938123647.html',
        supplier_name: '卡通源工厂',
        cost_price: 23.00,
        domestic_shipping: 0,
        first_mile_shipping: 8,
        total_cost: 31.00,
        weight_kg: 10.0,
        image_status: 'done',
        listing_status: 'processing',
        compliance_status: 'passed',
        status: 'processing',
        selection_score: 65.8,
        sales_trend: 58,
        profit_margin: 32,
        total_sales: 776,
        total_orders: 345,
        total_profit: 8920,
        created_at: '2026-04-22 10:06:04',
        updated_at: '2026-04-22 10:06:04',
      },
      {
        id: 'PROD009',
        internal_sku: 'SKU-HUAWEI-001',
        name_zh: '25款适用华为平板MatePad 11.5S保护套 带笔槽 亚克力 防弯 Mini',
        name_en: 'Compatible Huawei MatePad 11.5S Case',
        category: '平板电脑配件>平板电脑保护套/壳',
        source_url: 'https://detail.1688.com/offer/892235798691.html',
        supplier_name: '华为源工厂',
        cost_price: 12.90,
        domestic_shipping: 0,
        first_mile_shipping: 6,
        total_cost: 18.90,
        weight_kg: 0.22,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 82.4,
        sales_trend: 79,
        profit_margin: 41,
        total_sales: 489588,
        total_orders: 218765,
        total_profit: 687000,
        created_at: '2026-04-22 09:46:34',
        updated_at: '2026-04-22 09:46:34',
      },
      {
        id: 'PROD010',
        internal_sku: 'SKU-SAMSUNG-001',
        name_zh: 'เคสป้องกัน Samsung Tab S10 Lite 硅胶 带笔槽 透明 防摔',
        name_en: 'Samsung Tab S10 Lite Silicone Case',
        category: '平板电脑配件>平板电脑保护套/壳',
        source_url: 'https://detail.1688.com/offer/972683855031.html',
        supplier_name: '三星源工厂',
        cost_price: 18.00,
        domestic_shipping: 0,
        first_mile_shipping: 7,
        total_cost: 25.00,
        weight_kg: 0.222,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 75.6,
        sales_trend: 68,
        profit_margin: 35,
        total_sales: 248798,
        total_orders: 110432,
        total_profit: 345600,
        created_at: '2026-04-22 08:26:31',
        updated_at: '2026-04-22 08:26:31',
      },
      {
        id: 'PROD011',
        internal_sku: 'SKU-IPAD-004',
        name_zh: '2024新款iPad Air 6代保护套 MINI67 防弯 Pro 亚克力 皮套',
        name_en: '2024 New iPad Air 6 Case',
        category: '平板电脑配件>平板电脑保护套/壳',
        source_url: 'https://detail.1688.com/offer/645129833123.html',
        supplier_name: '苹果源工厂',
        cost_price: 14.00,
        domestic_shipping: 0,
        first_mile_shipping: 6,
        total_cost: 20.00,
        weight_kg: 0.3,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 80.2,
        sales_trend: 76,
        profit_margin: 39,
        total_sales: 2769,
        total_orders: 1234,
        total_profit: 45600,
        created_at: '2026-04-22 00:04:57',
        updated_at: '2026-04-22 00:04:57',
      },
      {
        id: 'PROD012',
        internal_sku: 'SKU-IPAD-005',
        name_zh: '720度旋转适用苹果iPad Pro保护套 Air5 平板 亚克力',
        name_en: '720 Rotation iPad Pro Case',
        category: '平板电脑配件>平板电脑保护套/壳',
        source_url: 'https://detail.1688.com/offer/848146517875.html',
        supplier_name: '旋转源工厂',
        cost_price: 13.50,
        domestic_shipping: 0,
        first_mile_shipping: 6,
        total_cost: 19.50,
        weight_kg: 0.24,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 77.8,
        sales_trend: 71,
        profit_margin: 37,
        total_sales: 445319,
        total_orders: 198234,
        total_profit: 589000,
        created_at: '2026-04-21 15:59:24',
        updated_at: '2026-04-21 15:59:24',
      },
      {
        id: 'PROD013',
        internal_sku: 'SKU-CABLE-001',
        name_zh: '正品Type-C公对公数据线 PD快充线 双头 MacBook充电线 电脑',
        name_en: 'Original Type-C Male to Male Cable PD Fast Charge',
        category: '手机配件>充电线、充电器&转换器',
        source_url: 'https://detail.1688.com/offer/723487849652.html',
        supplier_name: '数据线源工厂',
        cost_price: 19.90,
        domestic_shipping: 0,
        first_mile_shipping: 4,
        total_cost: 23.90,
        weight_kg: 0.05,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 71.3,
        sales_trend: 65,
        profit_margin: 42,
        total_sales: 14809,
        total_orders: 6578,
        total_profit: 125000,
        created_at: '2026-04-18 12:51:42',
        updated_at: '2026-04-18 12:51:42',
      },
      {
        id: 'PROD014',
        internal_sku: 'SKU-STAND-001',
        name_zh: '手机全金属360度旋转支架 桌面机械平板通用折叠 解压便携式',
        name_en: '360 Rotation Metal Phone Stand',
        category: '手机配件>手机支架',
        source_url: 'https://detail.1688.com/offer/954865221024.html',
        supplier_name: '支架源工厂',
        cost_price: 1.48,
        domestic_shipping: 0,
        first_mile_shipping: 3,
        total_cost: 4.48,
        weight_kg: 0.09,
        image_status: 'done',
        listing_status: 'done',
        compliance_status: 'passed',
        status: 'published',
        selection_score: 68.9,
        sales_trend: 62,
        profit_margin: 55,
        total_sales: 300,
        total_orders: 134,
        total_profit: 8900,
        created_at: '2026-04-18 12:03:09',
        updated_at: '2026-04-18 12:03:09',
      },
      // 待处理商品
      {
        id: 'PROD015',
        internal_sku: 'SKU-NEW-001',
        name_zh: '无线蓝牙耳机 降噪款',
        name_en: 'Wireless Bluetooth Earbuds ANC',
        category: '电子数码>耳机',
        source_url: 'https://detail.1688.com/offer/123456789.html',
        supplier_name: '音频源工厂',
        cost_price: 58,
        domestic_shipping: 0,
        first_mile_shipping: 12,
        total_cost: 70,
        weight_kg: 0.15,
        image_status: 'pending',
        listing_status: 'pending',
        compliance_status: 'pending',
        status: 'selected',
        selection_score: 85.2,
        sales_trend: 82,
        profit_margin: 40,
        created_at: '2026-04-23 09:00:00',
        updated_at: '2026-04-23 09:00:00',
      },
      {
        id: 'PROD016',
        internal_sku: 'SKU-NEW-002',
        name_zh: '智能手表 儿童定位版',
        name_en: 'Smart Watch Kids GPS',
        category: '电子数码>智能手表',
        source_url: 'https://detail.1688.com/offer/234567890.html',
        supplier_name: '手表源工厂',
        cost_price: 89,
        domestic_shipping: 0,
        first_mile_shipping: 15,
        total_cost: 104,
        weight_kg: 0.2,
        image_status: 'pending',
        listing_status: 'pending',
        compliance_status: 'checking',
        status: 'processing',
        selection_score: 72.6,
        sales_trend: 68,
        profit_margin: 35,
        created_at: '2026-04-23 10:30:00',
        updated_at: '2026-04-23 10:30:00',
      },
    ];
    products.forEach(p => this.products.set(p.id, p));

    // 初始化库存
    const inventory: Inventory[] = [
      {
        id: 'INV001',
        product_id: 'PROD001',
        warehouse: 'domestic',
        location: 'A-01-03',
        qty_available: 156,
        qty_reserved: 24,
        qty_in_transit: 50,
        safety_stock: 50,
        reorder_point: 80,
        reorder_qty: 100,
        avg_daily_sales: 8,
        days_of_stock: 19,
        is_low_stock: false,
        need_reorder: false,
        created_at: '2026-03-15 10:30:00',
        updated_at: '2026-03-21 14:30:00',
      },
      {
        id: 'INV002',
        product_id: 'PROD002',
        warehouse: 'domestic',
        location: 'B-02-01',
        qty_available: 42,
        qty_reserved: 18,
        qty_in_transit: 30,
        safety_stock: 30,
        reorder_point: 50,
        reorder_qty: 80,
        avg_daily_sales: 5,
        days_of_stock: 8,
        is_low_stock: false,
        need_reorder: true,
        created_at: '2026-03-16 15:20:00',
        updated_at: '2026-03-21 11:00:00',
      },
      {
        id: 'INV003',
        product_id: 'PROD001',
        warehouse: 'indonesia',
        location: 'JKT-01',
        qty_available: 85,
        qty_reserved: 10,
        qty_in_transit: 30,
        safety_stock: 30,
        reorder_point: 50,
        reorder_qty: 60,
        avg_daily_sales: 4,
        days_of_stock: 21,
        is_low_stock: false,
        need_reorder: false,
        created_at: '2026-03-18 14:30:00',
        updated_at: '2026-03-21 10:00:00',
      },
    ];
    inventory.forEach(i => {
      this.inventory.set(i.id, i);
      const existing = this.productInventory.get(i.product_id) || [];
      existing.push(i.id);
      this.productInventory.set(i.product_id, existing);
    });

    // 初始化订单
    const orders: Order[] = [
      {
        id: 'ORD001',
        platform: 'tiktok',
        platform_order_id: 'TK20260321001',
        product_id: 'PROD001',
        product_name: '宠物自动喂食器 5L大容量',
        quantity: 2,
        sale_price: 199,
        total_amount: 398,
        currency: 'IDR',
        cost_price: 109,
        shipping_cost: 15,
        platform_fee: 19.9,
        ad_cost: 20,
        profit: 180,
        buyer_name: 'Budi Santoso',
        status: 'delivered',
        order_time: '2026-03-21 10:30:00',
        created_at: '2026-03-21 10:30:00',
        updated_at: '2026-03-21 10:30:00',
      },
      {
        id: 'ORD002',
        platform: 'amazon',
        platform_order_id: 'AM20260321002',
        product_id: 'PROD002',
        product_name: '便携式榨汁机 USB充电',
        quantity: 1,
        sale_price: 29.99,
        total_amount: 29.99,
        currency: 'USD',
        cost_price: 61,
        shipping_cost: 12,
        platform_fee: 4.5,
        ad_cost: 8,
        profit: 120,
        buyer_name: 'John Smith',
        status: 'shipped',
        order_time: '2026-03-21 09:15:00',
        created_at: '2026-03-21 09:15:00',
        updated_at: '2026-03-21 09:15:00',
      },
      {
        id: 'ORD003',
        platform: 'tiktok',
        platform_order_id: 'TK20260320003',
        product_id: 'PROD003',
        product_name: 'LED化妆镜 台式带灯',
        quantity: 3,
        sale_price: 89,
        total_amount: 267,
        currency: 'THB',
        cost_price: 48,
        shipping_cost: 10,
        platform_fee: 13.35,
        ad_cost: 15,
        profit: 123,
        buyer_name: 'Somchai Thai',
        status: 'paid',
        abnormal_type: 'address_incomplete',
        order_time: '2026-03-20 16:45:00',
        created_at: '2026-03-20 16:45:00',
        updated_at: '2026-03-20 16:45:00',
      },
    ];
    orders.forEach(o => {
      this.orders.set(o.id, o);
      if (o.product_id) {
        const existing = this.productOrders.get(o.product_id) || [];
        existing.push(o.id);
        this.productOrders.set(o.product_id, existing);
      }
    });

    // 初始化广告
    const ads: AdCampaign[] = [
      {
        id: 'AD001',
        product_id: 'PROD001',
        product_name: '宠物自动喂食器 5L大容量',
        name: '宠物喂食器-印尼站-爆款推流',
        platform: 'tiktok',
        status: 'active',
        daily_budget: 300,
        total_spent: 185.6,
        clicks: 1250,
        impressions: 15000,
        conversions: 42,
        revenue: 960,
        roi: 2.3,
        cpc: 0.15,
        ctr: 8.3,
        risk_status: 'normal',
        created_at: '2026-03-18 10:00:00',
        updated_at: '2026-03-21 14:30:00',
      },
      {
        id: 'AD002',
        product_id: 'PROD002',
        product_name: '便携式榨汁机 USB充电',
        name: '榨汁机-美国站-关键词竞价',
        platform: 'amazon',
        status: 'paused',
        daily_budget: 200,
        total_spent: 156.8,
        clicks: 890,
        impressions: 8500,
        conversions: 15,
        revenue: 450,
        roi: 0.85,
        cpc: 0.18,
        ctr: 10.5,
        acos: 35,
        risk_status: 'danger',
        risk_reasons: ['ROI低于1:1', '已达预算78%'],
        created_at: '2026-03-19 14:00:00',
        updated_at: '2026-03-21 12:00:00',
      },
    ];
    ads.forEach(a => {
      this.adCampaigns.set(a.id, a);
      if (a.product_id) {
        const existing = this.productAds.get(a.product_id) || [];
        existing.push(a.id);
        this.productAds.set(a.product_id, existing);
      }
    });

    // 初始化物流
    const logistics: Logistics[] = [
      {
        id: 'LOG001',
        order_id: 'ORD001',
        carrier: 'J&T Express',
        tracking_number: 'JT1234567890123',
        status: 'in_transit',
        shipped_at: '2026-03-20 10:30:00',
        tracking_events: [
          { time: '2026-03-21 08:00', location: 'Jakarta', status: 'In transit to destination' },
          { time: '2026-03-20 18:00', location: 'Jakarta Hub', status: 'Departed from sorting center' },
        ],
        created_at: '2026-03-20 10:30:00',
        updated_at: '2026-03-21 08:00:00',
      },
      {
        id: 'LOG002',
        order_id: 'ORD002',
        carrier: 'Ninja Van',
        tracking_number: 'NV0987654321098',
        status: 'delivered',
        shipped_at: '2026-03-18 14:20:00',
        delivered_at: '2026-03-21 11:30:00',
        tracking_events: [
          { time: '2026-03-21 11:30', location: 'Los Angeles', status: 'Delivered to customer' },
          { time: '2026-03-21 09:00', location: 'Los Angeles', status: 'Out for delivery' },
        ],
        created_at: '2026-03-18 14:20:00',
        updated_at: '2026-03-21 11:30:00',
      },
    ];
    logistics.forEach(l => this.logistics.set(l.id, l));

    // 初始化财务记录
    const financeRecords: FinanceRecord[] = [
      {
        id: 'REC001',
        record_date: '2026-03-21',
        record_type: 'income',
        category: '销售收入',
        amount: 15680.5,
        currency: 'CNY',
        description: '平台订单收入',
        platform: 'tiktok',
        source: 'order_settlement',
        created_at: '2026-03-21 23:00:00',
      },
      {
        id: 'REC002',
        record_date: '2026-03-21',
        record_type: 'expense',
        category: '采购成本',
        amount: 8920.3,
        currency: 'CNY',
        description: '商品采购支出',
        source: 'purchase',
        created_at: '2026-03-21 22:00:00',
      },
    ];
    financeRecords.forEach(r => this.financeRecords.set(r.id, r));

    // 初始化采购单
    const purchases: Purchase[] = [
      {
        id: 'PUR001',
        supplier_id: 'SUP001',
        supplier_name: '深圳市电子科技有限公司',
        items: [
          { product_id: 'PROD001', product_name: '宠物自动喂食器 5L', qty: 100, unit_cost: 55, total_cost: 5500 },
          { product_id: 'PROD002', product_name: '便携式榨汁机 USB', qty: 80, unit_cost: 31, total_cost: 2480 },
        ],
        total_amount: 7980,
        currency: 'CNY',
        status: 'received',
        order_date: '2026-03-15',
        expected_date: '2026-03-20',
        received_date: '2026-03-19',
        notes: '常规补货',
        created_at: '2026-03-15 10:00:00',
        updated_at: '2026-03-19 16:00:00',
      },
    ];
    purchases.forEach(p => this.purchases.set(p.id, p));
  }

  // 工具方法
  generateId(prefix: string): string {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 6)}`;
  }

  now(): string {
    return new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
  }

  // 商品相关
  getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }

  createProduct(data: Partial<Product>): Product {
    const id = this.generateId('PROD');
    const now = this.now();
    const product: Product = {
      id,
      internal_sku: data.internal_sku || `SKU-${id}`,
      name_zh: data.name_zh || '',
      name_en: data.name_en,
      category: data.category,
      source_url: data.source_url,
      supplier_name: data.supplier_name,
      supplier_url: data.supplier_url,
      selected_at: data.selected_at || now,
      selection_score: data.selection_score,
      sales_trend: data.sales_trend,
      profit_margin: data.profit_margin,
      cost_price: data.cost_price || 0,
      domestic_shipping: data.domestic_shipping || 0,
      first_mile_shipping: data.first_mile_shipping || 0,
      total_cost: data.total_cost || (data.cost_price || 0) + (data.domestic_shipping || 0) + (data.first_mile_shipping || 0),
      image_status: data.image_status || 'pending',
      listing_status: data.listing_status || 'pending',
      compliance_status: data.compliance_status || 'pending',
      compliance_issues: data.compliance_issues,
      status: data.status || 'selected',
      created_at: now,
      updated_at: now,
    };
    this.products.set(id, product);
    return product;
  }

  updateProduct(id: string, data: Partial<Product>): Product | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated = {
      ...product,
      ...data,
      id: product.id,
      created_at: product.created_at,
      updated_at: this.now(),
    };
    this.products.set(id, updated);
    return updated;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // 库存相关
  getInventoryByProduct(productId: string): Inventory[] {
    const ids = this.productInventory.get(productId) || [];
    return ids.map(id => this.inventory.get(id)).filter(Boolean) as Inventory[];
  }

  // 订单相关
  getOrdersByProduct(productId: string): Order[] {
    const ids = this.productOrders.get(productId) || [];
    return ids.map(id => this.orders.get(id)).filter(Boolean) as Order[];
  }

  // 广告相关
  getAdsByProduct(productId: string): AdCampaign[] {
    const ids = this.productAds.get(productId) || [];
    return ids.map(id => this.adCampaigns.get(id)).filter(Boolean) as AdCampaign[];
  }

  // 创建订单并关联商品
  createOrder(data: Partial<Order>): Order {
    const id = this.generateId('ORD');
    const now = this.now();
    const order: Order = {
      id,
      platform: data.platform || 'tiktok',
      platform_order_id: data.platform_order_id || id,
      product_id: data.product_id,
      product_name: data.product_name || '',
      quantity: data.quantity || 1,
      sale_price: data.sale_price || 0,
      total_amount: data.total_amount || 0,
      currency: data.currency || 'CNY',
      cost_price: data.cost_price || 0,
      shipping_cost: data.shipping_cost || 0,
      platform_fee: data.platform_fee || 0,
      ad_cost: data.ad_cost || 0,
      profit: data.profit || 0,
      buyer_name: data.buyer_name,
      status: data.status || 'pending',
      order_time: data.order_time || now,
      created_at: now,
      updated_at: now,
    };
    this.orders.set(id, order);
    
    // 建立关联
    if (order.product_id) {
      const existing = this.productOrders.get(order.product_id) || [];
      existing.push(id);
      this.productOrders.set(order.product_id, existing);
    }
    
    return order;
  }

  // 创建广告并关联商品
  createAdCampaign(data: Partial<AdCampaign>): AdCampaign {
    const id = this.generateId('AD');
    const now = this.now();
    const ad: AdCampaign = {
      id,
      product_id: data.product_id,
      product_name: data.product_name,
      name: data.name || '',
      platform: data.platform || 'tiktok',
      status: data.status || 'draft',
      daily_budget: data.daily_budget || 100,
      total_spent: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
      revenue: 0,
      roi: 0,
      cpc: 0,
      ctr: 0,
      risk_status: 'normal',
      created_at: now,
      updated_at: now,
    };
    this.adCampaigns.set(id, ad);
    
    // 建立关联
    if (ad.product_id) {
      const existing = this.productAds.get(ad.product_id) || [];
      existing.push(id);
      this.productAds.set(ad.product_id, existing);
    }
    
    return ad;
  }

  // 工作流相关
  createWorkflow(data: Partial<WorkflowExecution>): WorkflowExecution {
    const id = this.generateId('WF');
    const now = this.now();
    const workflow: WorkflowExecution = {
      id,
      template_id: data.template_id || '',
      template_name: data.template_name || '',
      status: 'pending',
      product_id: data.product_id,
      product_name: data.product_name,
      current_step: 0,
      total_steps: data.total_steps || 0,
      steps: data.steps || [],
      created_at: now,
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  updateWorkflow(id: string, data: Partial<WorkflowExecution>): WorkflowExecution | undefined {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updated = {
      ...workflow,
      ...data,
      id: workflow.id,
      created_at: workflow.created_at,
    };
    this.workflows.set(id, updated);
    return updated;
  }

  getWorkflow(id: string): WorkflowExecution | undefined {
    return this.workflows.get(id);
  }

  getWorkflows(): WorkflowExecution[] {
    return Array.from(this.workflows.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // 采集清单相关方法

  /**
   * 添加到待采集清单
   */
  addToPendingCollection(data: {
    source: '1688' | 'taobao' | 'pinduoduo';
    source_url: string;
    source_id?: string;
    product_name?: string;
    keyword?: string;
    added_from?: 'selection_agent' | 'manual';
    selection_report_id?: string;
  }): CollectionItem {
    const id = this.generateId('COL');
    const now = this.now();
    const item: CollectionItem = {
      id,
      source: data.source,
      source_url: data.source_url,
      source_id: data.source_id,
      product_name: data.product_name,
      keyword: data.keyword,
      status: 'pending',
      added_from: data.added_from || 'manual',
      selection_report_id: data.selection_report_id,
      created_at: now,
    };
    this.pendingCollections.set(id, item);
    return item;
  }

  /**
   * 获取待采集清单列表
   */
  getPendingCollections(): CollectionItem[] {
    return Array.from(this.pendingCollections.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * 更新采集清单状态
   */
  updatePendingCollection(id: string, data: Partial<CollectionItem>): CollectionItem | undefined {
    const item = this.pendingCollections.get(id);
    if (!item) return undefined;
    
    const updated = {
      ...item,
      ...data,
      id: item.id,
      created_at: item.created_at,
      collected_at: data.status === 'collected' ? this.now() : item.collected_at,
    };
    this.pendingCollections.set(id, updated);
    return updated;
  }

  /**
   * 从待采集清单移除
   */
  removePendingCollection(id: string): boolean {
    return this.pendingCollections.delete(id);
  }

  // 公用采集箱方法

  /**
   * 添加到公用采集箱
   */
  addToPublicCollection(data: {
    collection_id: string;
    product_id: string;
    product_name: string;
    product_name_en?: string;
    source: '1688' | 'taobao' | 'pinduoduo';
    source_url: string;
    source_id?: string;
    supplier_name?: string;
    cost_price?: number;
    images?: string[];
    category?: string;
  }): PublicCollectionItem {
    const id = this.generateId('PUB');
    const now = this.now();
    const item: PublicCollectionItem = {
      id,
      collection_id: data.collection_id,
      product_id: data.product_id,
      product_name: data.product_name,
      product_name_en: data.product_name_en,
      source: data.source,
      source_url: data.source_url,
      source_id: data.source_id,
      supplier_name: data.supplier_name,
      cost_price: data.cost_price,
      images: data.images,
      category: data.category,
      claimed: false,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };
    this.publicCollections.set(id, item);
    return item;
  }

  /**
   * 获取公用采集箱列表
   */
  getPublicCollections(claimed?: boolean): PublicCollectionItem[] {
    let items = Array.from(this.publicCollections.values());
    if (claimed !== undefined) {
      items = items.filter(item => item.claimed === claimed);
    }
    return items.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * 获取公用采集箱单个商品
   */
  getPublicCollection(id: string): PublicCollectionItem | undefined {
    return this.publicCollections.get(id);
  }

  /**
   * 认领公用采集箱商品到店铺
   */
  claimPublicCollection(id: string, shopId: string, shopName: string): PublicCollectionItem | undefined {
    const item = this.publicCollections.get(id);
    if (!item || item.claimed) return undefined;

    const updated: PublicCollectionItem = {
      ...item,
      claimed: true,
      claimed_by: 'current_user',
      claimed_at: this.now(),
      claimed_shop_id: shopId,
      status: 'claimed',
      updated_at: this.now(),
    };
    this.publicCollections.set(id, updated);
    return updated;
  }

  /**
   * 更新公用采集箱商品
   */
  updatePublicCollection(id: string, data: Partial<PublicCollectionItem>): PublicCollectionItem | undefined {
    const item = this.publicCollections.get(id);
    if (!item) return undefined;
    
    const updated = {
      ...item,
      ...data,
      id: item.id,
      updated_at: this.now(),
    };
    this.publicCollections.set(id, updated);
    return updated;
  }

  /**
   * 从公用采集箱移除
   */
  removePublicCollection(id: string): boolean {
    return this.publicCollections.delete(id);
  }

  /**
   * 获取公用采集箱统计数据
   */
  getPublicCollectionStats(): { total: number; pending: number; claimed: number } {
    const items = Array.from(this.publicCollections.values());
    return {
      total: items.length,
      pending: items.filter(item => !item.claimed).length,
      claimed: items.filter(item => item.claimed).length,
    };
  }

  /**
   * 检查链接是否已在采集清单中
   */
  isInPendingCollection(source_url: string): boolean {
    return Array.from(this.pendingCollections.values()).some(
      item => item.source_url === source_url
    );
  }

  // 平台凭证配置方法

  /**
   * 平台凭证配置
   */
  private platformConfigs: Map<string, {
    id: string;
    platform_id: string;
    name: string;
    config: Record<string, string>;
    created_at: string;
    updated_at: string;
  }> = new Map();

  /**
   * 获取所有平台配置
   */
  getPlatforms(): Array<{
    id: string;
    platform_id: string;
    name: string;
    config: Record<string, string>;
    created_at: string;
    updated_at: string;
  }> {
    return Array.from(this.platformConfigs.values());
  }

  /**
   * 获取单个平台配置
   */
  getPlatform(platform_id: string): {
    id: string;
    platform_id: string;
    name: string;
    config: Record<string, string>;
    created_at: string;
    updated_at: string;
  } | undefined {
    return this.platformConfigs.get(platform_id);
  }

  /**
   * 更新或创建平台配置
   */
  updatePlatform(platform_id: string, data: {
    name: string;
    config?: Record<string, string>;
  }): {
    id: string;
    platform_id: string;
    name: string;
    config: Record<string, string>;
    created_at: string;
    updated_at: string;
  } {
    const now = this.now();
    const existing = this.platformConfigs.get(platform_id);
    
    const platform: {
      id: string;
      platform_id: string;
      name: string;
      config: Record<string, string>;
      created_at: string;
      updated_at: string;
    } = {
      id: existing?.id || this.generateId('PLT'),
      platform_id,
      name: data.name,
      config: data.config || existing?.config || {},
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    
    this.platformConfigs.set(platform_id, platform);
    return platform;
  }

  /**
   * 删除平台配置
   */
  deletePlatform(platform_id: string): boolean {
    return this.platformConfigs.delete(platform_id);
  }

  /**
   * 妙手ERP配置
   */
  private _miaoshouConfig: MiaoshouConfig | null = null;

  getMiaoshouConfig(): MiaoshouConfig | null {
    return this._miaoshouConfig;
  }

  saveMiaoshouConfig(config: MiaoshouConfig): MiaoshouConfig {
    this._miaoshouConfig = { ...config, updated_at: new Date().toISOString() };
    return this._miaoshouConfig;
  }

  /**
   * 测试妙手ERP连接
   * 实际需要调用妙手ERP的API进行验证
   */
  async testMiaoshouConnection(config: MiaoshouConfig): Promise<{ success: boolean; message: string }> {
    // 模拟测试连接
    // 实际应该调用妙手ERP的授权API进行验证
    if (!config.phone || !config.password) {
      return { success: false, message: '请填写手机号和密码' };
    }
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟验证结果（实际应调用妙手ERP API）
    // 妙手ERP开放平台: https://open.myshopapps.com/
    // 这里返回成功，实际使用时需要对接真实API
    return { success: true, message: '连接成功' };
  }
}

// 单例模式
function getStore(): LobsterStore {
  // 使用 globalThis 替代 global，兼容浏览器和 Node.js 环境
  const g = globalThis as typeof globalThis & { __LOBSTER_STORE__: LobsterStore | undefined };
  if (!g.__LOBSTER_STORE__) {
    g.__LOBSTER_STORE__ = new LobsterStore();
  }
  return g.__LOBSTER_STORE__;
}

export const store = getStore();
export default store;

// 采购单类型（供 API routes 使用）
export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  products: {
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  expected_arrival?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

// 全局采购数据存储


// 妙手ERP配置类型
export interface MiaoshouConfig {
  id?: string;
  phone: string;
  password: string;
  cookies?: string;
  status?: 'connected' | 'disconnected' | 'testing' | 'error';
  lastSync?: string;
  updated_at?: string;
};

