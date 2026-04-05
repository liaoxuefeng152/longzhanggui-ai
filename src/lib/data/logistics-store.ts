/**
 * 物流数据存储
 * 用于在API路由之间共享数据
 */

export interface Logistics {
  id: string;
  order_id: string;
  order_no: string;
  tracking_number: string;
  carrier: string;
  service_type: string;
  shipping_method: string;
  origin: {
    name: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
  };
  destination: {
    name: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
  };
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shipping_cost: number;
  currency: string;
  status: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'cancelled';
  estimated_delivery: string | null;
  actual_delivery: string | null;
  tracking_events: Array<{
    date: string;
    status: string;
    location: string;
    description: string;
  }>;
  notes: string;
  created_at: string;
  updated_at: string;
}

// 初始化物流数据
const initialLogistics: Logistics[] = [
  {
    id: 'LOG-001',
    order_id: 'ORD-20250110001',
    order_no: 'ORD-20250110001',
    tracking_number: '1Z999AA10123456784',
    carrier: 'UPS',
    service_type: 'Express Saver',
    shipping_method: 'air',
    origin: {
      name: '深圳仓',
      address: '深圳宝安机场货运中心',
      city: '深圳',
      country: '中国',
      postal_code: '518000',
    },
    destination: {
      name: 'John Smith',
      address: '123 Main Street',
      city: 'New York',
      country: 'US',
      postal_code: '10001',
    },
    weight: 0.5,
    dimensions: {
      length: 15,
      width: 10,
      height: 5,
    },
    shipping_cost: 5.99,
    currency: 'USD',
    status: 'delivered',
    estimated_delivery: new Date(Date.now() - 12 * 86400000).toISOString(),
    actual_delivery: new Date(Date.now() - 10 * 86400000).toISOString(),
    tracking_events: [
      {
        date: new Date(Date.now() - 18 * 86400000).toISOString(),
        status: 'picked_up',
        location: '深圳',
        description: '已揽收',
      },
      {
        date: new Date(Date.now() - 16 * 86400000).toISOString(),
        status: 'in_transit',
        location: '转运中心',
        description: '到达转运中心',
      },
      {
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        status: 'out_for_delivery',
        location: 'New York',
        description: '派送中',
      },
      {
        date: new Date(Date.now() - 10 * 86400000).toISOString(),
        status: 'delivered',
        location: 'New York',
        description: '已送达',
      },
    ],
    notes: '',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'LOG-002',
    order_id: 'ORD-20250112001',
    order_no: 'ORD-20250112001',
    tracking_number: 'RM123456789GB',
    carrier: 'Royal Mail',
    service_type: 'Tracked 48',
    shipping_method: 'air',
    origin: {
      name: '深圳仓',
      address: '深圳宝安机场货运中心',
      city: '深圳',
      country: '中国',
      postal_code: '518000',
    },
    destination: {
      name: 'Sarah Johnson',
      address: '45 High Street',
      city: 'London',
      country: 'UK',
      postal_code: 'E1 6AN',
    },
    weight: 0.3,
    dimensions: {
      length: 12,
      width: 8,
      height: 4,
    },
    shipping_cost: 8.99,
    currency: 'GBP',
    status: 'in_transit',
    estimated_delivery: new Date(Date.now() + 2 * 86400000).toISOString(),
    actual_delivery: null,
    tracking_events: [
      {
        date: new Date(Date.now() - 13 * 86400000).toISOString(),
        status: 'picked_up',
        location: '深圳',
        description: '已揽收',
      },
      {
        date: new Date(Date.now() - 11 * 86400000).toISOString(),
        status: 'in_transit',
        location: '香港',
        description: '到达香港分拨中心',
      },
      {
        date: new Date(Date.now() - 8 * 86400000).toISOString(),
        status: 'in_transit',
        location: '伦敦',
        description: '到达伦敦分拨中心',
      },
    ],
    notes: '客户要求快速配送',
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'LOG-003',
    order_id: 'ORD-20250115001',
    order_no: 'ORD-20250115001',
    tracking_number: '',
    carrier: '',
    service_type: '',
    shipping_method: '',
    origin: {
      name: '深圳仓',
      address: '深圳宝安机场货运中心',
      city: '深圳',
      country: '中国',
      postal_code: '518000',
    },
    destination: {
      name: 'Michael Chen',
      address: '789 Bay Street',
      city: 'Toronto',
      country: 'CA',
      postal_code: 'M5G 2C8',
    },
    weight: 0.4,
    dimensions: {
      length: 16,
      width: 9,
      height: 5,
    },
    shipping_cost: 0,
    currency: 'CAD',
    status: 'created',
    estimated_delivery: null,
    actual_delivery: null,
    tracking_events: [],
    notes: '等待商品到货后发货',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// 全局物流数据存储
const globalForLogistics = globalThis as unknown as {
  logistics: Logistics[] | undefined;
};

export const logisticsStore = globalForLogistics.logistics || initialLogistics;

if (process.env.NODE_ENV !== 'production') {
  globalForLogistics.logistics = logisticsStore;
}

// 辅助函数
export function getAllLogistics(): Logistics[] {
  return logisticsStore;
}

export function getLogisticsById(id: string): Logistics | undefined {
  return logisticsStore.find(l => l.id === id);
}

export function getLogisticsByOrderId(orderId: string): Logistics | undefined {
  return logisticsStore.find(l => l.order_id === orderId);
}

export function addLogistics(logistics: Logistics): void {
  logisticsStore.push(logistics);
}

export function updateLogistics(id: string, updates: Partial<Logistics>): Logistics | undefined {
  const index = logisticsStore.findIndex(l => l.id === id);
  if (index !== -1) {
    logisticsStore[index] = {
      ...logisticsStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return logisticsStore[index];
  }
  return undefined;
}

export function deleteLogistics(id: string): boolean {
  const index = logisticsStore.findIndex(l => l.id === id);
  if (index !== -1) {
    logisticsStore.splice(index, 1);
    return true;
  }
  return false;
}
