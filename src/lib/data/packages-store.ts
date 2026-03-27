/**
 * 套餐数据存储
 * 用于在API路由之间共享数据
 */

export interface Package {
  id: string;
  name: string;
  price: number;
  call_quota: number;
  call_limit: number;
  duration: number;
  duration_days: number;
  features: string[];
  agent_access: string[];
  user_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 初始化套餐数据
const initialPackages: Package[] = [
  {
    id: 'PKG-001',
    name: '免费试用',
    price: 0,
    call_quota: 10000,
    call_limit: 100,
    duration: 7,
    duration_days: 7,
    features: ['每日100次AI调用', '选品智能体', '图片处理智能体', '基础数据分析'],
    agent_access: ['product-selection', 'image-design'],
    user_count: 156,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'PKG-002',
    name: '基础版',
    price: 299,
    call_quota: 100000,
    call_limit: 500,
    duration: 30,
    duration_days: 30,
    features: ['每日500次AI调用', '选品智能体', '图片处理智能体', 'Listing优化智能体', '客服智能体', '数据复盘'],
    agent_access: ['product-selection', 'image-design', 'listing-optimization', 'customer-service', 'data-review'],
    user_count: 89,
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'PKG-003',
    name: '专业版',
    price: 699,
    call_quota: 500000,
    call_limit: 2000,
    duration: 30,
    duration_days: 30,
    features: ['每日2000次AI调用', '全部AI智能体', '视频生成智能体', '广告投放智能体', '优先技术支持', 'API接口调用'],
    agent_access: ['all'],
    user_count: 45,
    is_active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'PKG-004',
    name: '企业版',
    price: 2999,
    call_quota: 999999,
    call_limit: 999999,
    duration: 30,
    duration_days: 30,
    features: ['无限AI调用', '全部AI智能体', '专属客户经理', '定制化开发', '私有化部署支持', 'SLA保障'],
    agent_access: ['all'],
    user_count: 12,
    is_active: true,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// 全局套餐数据存储
// 使用globalThis确保在热更新时数据不会丢失
const globalForPackages = globalThis as unknown as {
  packages: Package[] | undefined;
};

export const packagesStore = globalForPackages.packages || initialPackages;

// 在开发环境保存数据
if (process.env.NODE_ENV !== 'production') {
  globalForPackages.packages = packagesStore;
}

// 辅助函数
export function getAllPackages(): Package[] {
  return packagesStore;
}

export function getPackageById(id: string): Package | undefined {
  return packagesStore.find(p => p.id === id);
}

export function addPackage(pkg: Package): void {
  packagesStore.push(pkg);
}

export function updatePackage(id: string, updates: Partial<Package>): Package | undefined {
  const index = packagesStore.findIndex(p => p.id === id);
  if (index !== -1) {
    packagesStore[index] = {
      ...packagesStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return packagesStore[index];
  }
  return undefined;
}

export function deletePackage(id: string): boolean {
  const index = packagesStore.findIndex(p => p.id === id);
  if (index !== -1) {
    packagesStore[index].is_active = false;
    packagesStore[index].updated_at = new Date().toISOString();
    return true;
  }
  return false;
}
