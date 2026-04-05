/**
 * 财务数据存储
 * 用于在API路由之间共享数据
 */

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory: string;
  amount: number;
  currency: string;
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  transaction_date: string;
  due_date: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

// 初始化财务数据
const initialFinanceRecords: FinanceRecord[] = [
  {
    id: 'FIN-001',
    type: 'income',
    category: '销售收入',
    subcategory: 'Amazon US',
    amount: 103.18,
    currency: 'USD',
    description: '订单 ORD-20250110001',
    reference_id: 'ORD-20250110001',
    reference_type: 'order',
    status: 'completed',
    transaction_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    due_date: null,
    payment_method: 'Credit Card',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'FIN-002',
    type: 'income',
    category: '销售收入',
    subcategory: 'eBay UK',
    amount: 108.97,
    currency: 'GBP',
    description: '订单 ORD-20250112001',
    reference_id: 'ORD-20250112001',
    reference_type: 'order',
    status: 'completed',
    transaction_date: new Date(Date.now() - 13 * 86400000).toISOString(),
    due_date: null,
    payment_method: 'PayPal',
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  },
  {
    id: 'FIN-003',
    type: 'expense',
    category: '采购成本',
    subcategory: '义乌小商品供应链',
    amount: 42500.00,
    currency: 'CNY',
    description: '采购单 PO-20250115001',
    reference_id: 'PO-20250115001',
    reference_type: 'purchase',
    status: 'completed',
    transaction_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    due_date: null,
    payment_method: 'Bank Transfer',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'FIN-004',
    type: 'expense',
    category: '广告费用',
    subcategory: 'Amazon Advertising',
    amount: 25.00,
    currency: 'USD',
    description: '2025年3月广告费',
    reference_id: 'AD-001',
    reference_type: 'ad_campaign',
    status: 'completed',
    transaction_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    due_date: null,
    payment_method: 'Credit Card',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'FIN-005',
    type: 'expense',
    category: '物流费用',
    subcategory: 'UPS',
    amount: 5.99,
    currency: 'USD',
    description: '订单 ORD-20250110001 运费',
    reference_id: 'LOG-001',
    reference_type: 'logistics',
    status: 'completed',
    transaction_date: new Date(Date.now() - 18 * 86400000).toISOString(),
    due_date: null,
    payment_method: 'Credit Card',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'FIN-006',
    type: 'expense',
    category: '物流费用',
    subcategory: 'Royal Mail',
    amount: 8.99,
    currency: 'GBP',
    description: '订单 ORD-20250112001 运费',
    reference_id: 'LOG-002',
    reference_type: 'logistics',
    status: 'completed',
    transaction_date: new Date(Date.now() - 13 * 86400000).toISOString(),
    due_date: null,
    payment_method: 'Credit Card',
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  },
  {
    id: 'FIN-007',
    type: 'expense',
    category: '平台费用',
    subcategory: 'Amazon',
    amount: 15.48,
    currency: 'USD',
    description: '订单 ORD-20250110001 平台佣金(15%)',
    reference_id: 'ORD-20250110001',
    reference_type: 'order',
    status: 'completed',
    transaction_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    due_date: null,
    payment_method: 'Automatic Deduction',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// 全局财务数据存储
const globalForFinance = globalThis as unknown as {
  financeRecords: FinanceRecord[] | undefined;
};

export const financeRecordsStore = globalForFinance.financeRecords || initialFinanceRecords;

if (process.env.NODE_ENV !== 'production') {
  globalForFinance.financeRecords = financeRecordsStore;
}

// 辅助函数
export function getAllFinanceRecords(): FinanceRecord[] {
  return financeRecordsStore;
}

export function getFinanceRecordById(id: string): FinanceRecord | undefined {
  return financeRecordsStore.find(f => f.id === id);
}

export function addFinanceRecord(record: FinanceRecord): void {
  financeRecordsStore.push(record);
}

export function updateFinanceRecord(id: string, updates: Partial<FinanceRecord>): FinanceRecord | undefined {
  const index = financeRecordsStore.findIndex(f => f.id === id);
  if (index !== -1) {
    financeRecordsStore[index] = {
      ...financeRecordsStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return financeRecordsStore[index];
  }
  return undefined;
}

export function deleteFinanceRecord(id: string): boolean {
  const index = financeRecordsStore.findIndex(f => f.id === id);
  if (index !== -1) {
    financeRecordsStore.splice(index, 1);
    return true;
  }
  return false;
}
