/**
 * 采购单数据存储
 * 用于在API路由之间共享数据
 */

export interface Purchase {
  id: string;
  order_no: string;
  supplier_id: string;
  supplier_name: string;
  products: Array<{
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  ordered_at: string | null;
  expected_delivery: string | null;
  actual_delivery: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

// 初始化采购单数据
const initialPurchases: Purchase[] = [
  {
    id: 'PO-20250115001',
    order_no: 'PO-20250115001',
    supplier_id: 'SUP-001',
    supplier_name: '义乌小商品供应链',
    products: [
      {
        product_id: 'PROD-001',
        product_name: '智能手表 S5',
        sku: 'SKU-SW-S5-BLK',
        quantity: 500,
        unit_price: 85.00,
        total_price: 42500.00,
      },
    ],
    total_amount: 42500.00,
    currency: 'CNY',
    status: 'received',
    payment_status: 'paid',
    ordered_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    expected_delivery: new Date(Date.now() - 10 * 86400000).toISOString(),
    actual_delivery: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: '第一批采购，质量验收合格',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'PO-20250120001',
    order_no: 'PO-20250120001',
    supplier_id: 'SUP-002',
    supplier_name: '深圳电子配件批发',
    products: [
      {
        product_id: 'PROD-002',
        product_name: '无线蓝牙耳机',
        sku: 'SKU-BT-WHT',
        quantity: 1000,
        unit_price: 45.00,
        total_price: 45000.00,
      },
    ],
    total_amount: 45000.00,
    currency: 'CNY',
    status: 'ordered',
    payment_status: 'partial',
    ordered_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    expected_delivery: new Date(Date.now() + 5 * 86400000).toISOString(),
    actual_delivery: null,
    notes: '预付款50%，货到付款50%',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'PO-20250125001',
    order_no: 'PO-20250125001',
    supplier_id: 'SUP-001',
    supplier_name: '义乌小商品供应链',
    products: [
      {
        product_id: 'PROD-003',
        product_name: '便携式充电宝',
        sku: 'SKU-PB-20K',
        quantity: 800,
        unit_price: 35.00,
        total_price: 28000.00,
      },
    ],
    total_amount: 28000.00,
    currency: 'CNY',
    status: 'pending',
    payment_status: 'unpaid',
    ordered_at: null,
    expected_delivery: new Date(Date.now() + 10 * 86400000).toISOString(),
    actual_delivery: null,
    notes: '待审批',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// 全局采购单数据存储
// 使用globalThis确保在热更新时数据不会丢失
const globalForPurchases = globalThis as unknown as {
  purchases: Purchase[] | undefined;
};

export const purchasesStore = globalForPurchases.purchases || initialPurchases;

// 在开发环境保存数据
if (process.env.NODE_ENV !== 'production') {
  globalForPurchases.purchases = purchasesStore;
}

// 辅助函数
export function getAllPurchases(): Purchase[] {
  return purchasesStore;
}

export function getPurchaseById(id: string): Purchase | undefined {
  return purchasesStore.find(p => p.id === id);
}

export function addPurchase(purchase: Purchase): void {
  purchasesStore.push(purchase);
}

export function updatePurchase(id: string, updates: Partial<Purchase>): Purchase | undefined {
  const index = purchasesStore.findIndex(p => p.id === id);
  if (index !== -1) {
    purchasesStore[index] = {
      ...purchasesStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return purchasesStore[index];
  }
  return undefined;
}

export function deletePurchase(id: string): boolean {
  const index = purchasesStore.findIndex(p => p.id === id);
  if (index !== -1) {
    purchasesStore.splice(index, 1);
    return true;
  }
  return false;
}
