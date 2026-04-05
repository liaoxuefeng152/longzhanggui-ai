/**
 * 订单数据存储
 * 用于在API路由之间共享数据
 */

export interface Order {
  id: string;
  order_no: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  platform: string;
  marketplace: string;
  products: Array<{
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  payment_method: string;
  shipping_address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  tracking_number: string | null;
  carrier: string | null;
  ordered_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

// 初始化订单数据
const initialOrders: Order[] = [
  {
    id: 'ORD-20250110001',
    order_no: 'ORD-20250110001',
    customer_id: 'CUST-001',
    customer_name: 'John Smith',
    customer_email: 'john.smith@email.com',
    platform: 'Amazon',
    marketplace: 'US',
    products: [
      {
        product_id: 'PROD-001',
        product_name: '智能手表 S5',
        sku: 'SKU-SW-S5-BLK',
        quantity: 1,
        unit_price: 89.99,
        total_price: 89.99,
      },
    ],
    subtotal: 89.99,
    shipping_cost: 5.99,
    tax: 7.20,
    total_amount: 103.18,
    currency: 'USD',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'Credit Card',
    shipping_address: {
      name: 'John Smith',
      phone: '+1 234-567-8900',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'US',
    },
    tracking_number: '1Z999AA10123456784',
    carrier: 'UPS',
    ordered_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    shipped_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    delivered_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: '',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'ORD-20250112001',
    order_no: 'ORD-20250112001',
    customer_id: 'CUST-002',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.j@email.com',
    platform: 'eBay',
    marketplace: 'UK',
    products: [
      {
        product_id: 'PROD-002',
        product_name: '无线蓝牙耳机',
        sku: 'SKU-BT-WHT',
        quantity: 2,
        unit_price: 49.99,
        total_price: 99.98,
      },
    ],
    subtotal: 99.98,
    shipping_cost: 8.99,
    tax: 0,
    total_amount: 108.97,
    currency: 'GBP',
    status: 'shipped',
    payment_status: 'paid',
    payment_method: 'PayPal',
    shipping_address: {
      name: 'Sarah Johnson',
      phone: '+44 7911 123456',
      address: '45 High Street',
      city: 'London',
      state: 'England',
      postal_code: 'E1 6AN',
      country: 'UK',
    },
    tracking_number: 'RM123456789GB',
    carrier: 'Royal Mail',
    ordered_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    shipped_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    delivered_at: null,
    notes: '客户要求快速配送',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  },
  {
    id: 'ORD-20250115001',
    order_no: 'ORD-20250115001',
    customer_id: 'CUST-003',
    customer_name: 'Michael Chen',
    customer_email: 'm.chen@email.com',
    platform: 'Shopify',
    marketplace: 'CA',
    products: [
      {
        product_id: 'PROD-003',
        product_name: '便携式充电宝',
        sku: 'SKU-PB-20K',
        quantity: 1,
        unit_price: 45.00,
        total_price: 45.00,
      },
    ],
    subtotal: 45.00,
    shipping_cost: 0,
    tax: 5.85,
    total_amount: 50.85,
    currency: 'CAD',
    status: 'processing',
    payment_status: 'paid',
    payment_method: 'Credit Card',
    shipping_address: {
      name: 'Michael Chen',
      phone: '+1 416-555-0123',
      address: '789 Bay Street',
      city: 'Toronto',
      state: 'Ontario',
      postal_code: 'M5G 2C8',
      country: 'CA',
    },
    tracking_number: null,
    carrier: null,
    ordered_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    shipped_at: null,
    delivered_at: null,
    notes: '等待商品到货',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// 全局订单数据存储
const globalForOrders = globalThis as unknown as {
  orders: Order[] | undefined;
};

export const ordersStore = globalForOrders.orders || initialOrders;

if (process.env.NODE_ENV !== 'production') {
  globalForOrders.orders = ordersStore;
}

// 辅助函数
export function getAllOrders(): Order[] {
  return ordersStore;
}

export function getOrderById(id: string): Order | undefined {
  return ordersStore.find(o => o.id === id);
}

export function getOrderByOrderNo(orderNo: string): Order | undefined {
  return ordersStore.find(o => o.order_no === orderNo);
}

export function addOrder(order: Order): void {
  ordersStore.push(order);
}

export function updateOrder(id: string, updates: Partial<Order>): Order | undefined {
  const index = ordersStore.findIndex(o => o.id === id);
  if (index !== -1) {
    ordersStore[index] = {
      ...ordersStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return ordersStore[index];
  }
  return undefined;
}

export function deleteOrder(id: string): boolean {
  const index = ordersStore.findIndex(o => o.id === id);
  if (index !== -1) {
    ordersStore.splice(index, 1);
    return true;
  }
  return false;
}
