/**
 * 供应商数据存储
 * 用于在API路由之间共享数据
 */

export interface Supplier {
  id: string;
  name: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: {
    country: string;
    province: string;
    city: string;
    street: string;
    postal_code: string;
  };
  business_license: string;
  products: string[];
  rating: number;
  total_orders: number;
  total_amount: number;
  payment_terms: string;
  delivery_terms: string;
  notes: string;
  status: 'active' | 'inactive' | 'blacklisted';
  created_at: string;
  updated_at: string;
}

// 初始化供应商数据
const initialSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: '义乌小商品供应链',
    company_name: '义乌市小商品供应链有限公司',
    contact_person: '张经理',
    phone: '+86 138-0000-0001',
    email: 'zhang@yiwu-supply.com',
    address: {
      country: '中国',
      province: '浙江省',
      city: '义乌市',
      street: '义乌国际商贸城A区1楼',
      postal_code: '322000',
    },
    business_license: '3307000000000001',
    products: ['智能手表', '便携式充电宝', '蓝牙耳机'],
    rating: 4.8,
    total_orders: 156,
    total_amount: 2450000.00,
    payment_terms: '预付款30%，发货前付清',
    delivery_terms: 'FOB深圳',
    notes: '主要供应商，合作稳定',
    status: 'active',
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'SUP-002',
    name: '深圳电子配件批发',
    company_name: '深圳市电子配件批发有限公司',
    contact_person: '李经理',
    phone: '+86 139-0000-0002',
    email: 'li@sz-electronics.com',
    address: {
      country: '中国',
      province: '广东省',
      city: '深圳市',
      street: '华强北电子世界3楼',
      postal_code: '518000',
    },
    business_license: '4403000000000001',
    products: ['蓝牙耳机', '数据线', '充电器'],
    rating: 4.5,
    total_orders: 89,
    total_amount: 1280000.00,
    payment_terms: '月结30天',
    delivery_terms: 'EXW深圳',
    notes: '电子产品供应商',
    status: 'active',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'SUP-003',
    name: '东莞塑胶制品厂',
    company_name: '东莞市塑胶制品有限公司',
    contact_person: '王经理',
    phone: '+86 137-0000-0003',
    email: 'wang@dg-plastic.com',
    address: {
      country: '中国',
      province: '广东省',
      city: '东莞市',
      street: '虎门镇工业区A栋',
      postal_code: '523000',
    },
    business_license: '4419000000000001',
    products: ['手机壳', '保护套', '支架'],
    rating: 4.2,
    total_orders: 45,
    total_amount: 560000.00,
    payment_terms: '预付款50%',
    delivery_terms: 'FOB东莞',
    notes: '性价比高，但交期不稳定',
    status: 'active',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// 全局供应商数据存储
const globalForSuppliers = globalThis as unknown as {
  suppliers: Supplier[] | undefined;
};

export const suppliersStore = globalForSuppliers.suppliers || initialSuppliers;

if (process.env.NODE_ENV !== 'production') {
  globalForSuppliers.suppliers = suppliersStore;
}

// 辅助函数
export function getAllSuppliers(): Supplier[] {
  return suppliersStore;
}

export function getSupplierById(id: string): Supplier | undefined {
  return suppliersStore.find(s => s.id === id);
}

export function addSupplier(supplier: Supplier): void {
  suppliersStore.push(supplier);
}

export function updateSupplier(id: string, updates: Partial<Supplier>): Supplier | undefined {
  const index = suppliersStore.findIndex(s => s.id === id);
  if (index !== -1) {
    suppliersStore[index] = {
      ...suppliersStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return suppliersStore[index];
  }
  return undefined;
}

export function deleteSupplier(id: string): boolean {
  const index = suppliersStore.findIndex(s => s.id === id);
  if (index !== -1) {
    suppliersStore.splice(index, 1);
    return true;
  }
  return false;
}
