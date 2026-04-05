/**
 * 商品数据存储
 * 用于在API路由之间共享数据
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  images: string[];
  specs: Record<string, string>;
  cost_price: number;
  selling_price: number;
  margin: number;
  currency: string;
  status: 'draft' | 'selected' | 'processing' | 'ready' | 'published' | 'archived';
  source: string;
  source_url: string;
  tags: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  platform_ids: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// 初始化商品数据
const initialProducts: Product[] = [
  {
    id: 'PROD-001',
    sku: 'SKU-SW-S5-BLK',
    name: '智能手表 S5',
    category: '电子产品',
    brand: 'TechBrand',
    description: '多功能智能手表，支持心率监测、GPS定位、防水等功能',
    images: ['/images/products/watch-s5-1.jpg'],
    specs: {
      '屏幕尺寸': '1.4英寸',
      '电池续航': '7天',
      '防水等级': 'IP68',
      '连接方式': '蓝牙5.0',
    },
    cost_price: 85.00,
    selling_price: 89.99,
    margin: 5.88,
    currency: 'USD',
    status: 'published',
    source: '1688',
    source_url: '',
    tags: ['智能手表', '可穿戴设备', 'GPS'],
    weight: 0.05,
    dimensions: {
      length: 10,
      width: 5,
      height: 2,
    },
    platform_ids: {
      'amazon-us': 'B08ABC123',
    },
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'PROD-002',
    sku: 'SKU-BT-WHT',
    name: '无线蓝牙耳机',
    category: '电子产品',
    brand: 'AudioPro',
    description: '真无线蓝牙耳机，主动降噪，Hi-Fi音质',
    images: ['/images/products/headphones-bt-1.jpg'],
    specs: {
      '降噪深度': '40dB',
      '电池续航': '8小时',
      '充电盒': '支持快充',
      '蓝牙版本': '5.2',
    },
    cost_price: 45.00,
    selling_price: 49.99,
    margin: 11.09,
    currency: 'USD',
    status: 'published',
    source: '1688',
    source_url: '',
    tags: ['蓝牙耳机', '降噪', '无线'],
    weight: 0.03,
    dimensions: {
      length: 6,
      width: 4,
      height: 3,
    },
    platform_ids: {
      'amazon-us': 'B08DEF456',
      'ebay-uk': '123456789',
    },
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'PROD-003',
    sku: 'SKU-PB-20K',
    name: '便携式充电宝',
    category: '配件',
    brand: 'PowerTech',
    description: '20000mAh大容量充电宝，支持快充，双USB输出',
    images: ['/images/products/powerbank-20k-1.jpg'],
    specs: {
      '容量': '20000mAh',
      '输出功率': '18W',
      '输入接口': 'Type-C',
      '输出接口': 'USB-A x2',
    },
    cost_price: 35.00,
    selling_price: 45.00,
    margin: 28.57,
    currency: 'USD',
    status: 'published',
    source: '1688',
    source_url: '',
    tags: ['充电宝', '移动电源', '快充'],
    weight: 0.4,
    dimensions: {
      length: 15,
      width: 7,
      height: 3,
    },
    platform_ids: {
      'shopify-ca': '987654321',
    },
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// 全局商品数据存储
const globalForProducts = globalThis as unknown as {
  products: Product[] | undefined;
};

export const productsStore = globalForProducts.products || initialProducts;

if (process.env.NODE_ENV !== 'production') {
  globalForProducts.products = productsStore;
}

// 辅助函数
export function getAllProducts(): Product[] {
  return productsStore;
}

export function getProductById(id: string): Product | undefined {
  return productsStore.find(p => p.id === id);
}

export function getProductBySku(sku: string): Product | undefined {
  return productsStore.find(p => p.sku === sku);
}

export function addProduct(product: Product): void {
  productsStore.push(product);
}

export function updateProduct(id: string, updates: Partial<Product>): Product | undefined {
  const index = productsStore.findIndex(p => p.id === id);
  if (index !== -1) {
    productsStore[index] = {
      ...productsStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return productsStore[index];
  }
  return undefined;
}

export function deleteProduct(id: string): boolean {
  const index = productsStore.findIndex(p => p.id === id);
  if (index !== -1) {
    productsStore.splice(index, 1);
    return true;
  }
  return false;
}
