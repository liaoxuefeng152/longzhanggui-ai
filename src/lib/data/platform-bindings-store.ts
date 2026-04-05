/**
 * 平台绑定数据存储层
 * 用于存储平台账号绑定信息
 */

export interface PlatformBinding {
  id: string;
  platform: string;
  account_name: string;
  shop_id: string;
  region: string;
  api_key: string;
  api_secret: string;
  auth_type: string;
  status: 'active' | 'expired' | 'error';
  expire_time: string;
  last_sync: string;
  product_count: number;
  order_count: number;
  created_at: string;
  updated_at: string;
}

// 全局存储
const GLOBAL_KEY = '__platform_bindings_store__';

interface PlatformBindingsStore {
  bindings: PlatformBinding[];
  nextId: number;
}

// 初始化存储
function getStore(): PlatformBindingsStore {
  if (!(global as any)[GLOBAL_KEY]) {
    (global as any)[GLOBAL_KEY] = {
      bindings: [],
      nextId: 1,
    };
  }
  return (global as any)[GLOBAL_KEY];
}

/**
 * 获取所有平台绑定
 */
export function getAllPlatformBindings(): PlatformBinding[] {
  const store = getStore();
  return store.bindings;
}

/**
 * 根据ID获取平台绑定
 */
export function getPlatformBindingById(id: string): PlatformBinding | undefined {
  const store = getStore();
  return store.bindings.find((b) => b.id === id);
}

/**
 * 创建平台绑定
 */
export function createPlatformBinding(data: {
  platform: string;
  account_name: string;
  shop_id: string;
  region: string;
  api_key: string;
  api_secret: string;
  auth_type: string;
}): PlatformBinding {
  const store = getStore();
  const now = new Date().toISOString();

  const newBinding: PlatformBinding = {
    id: `binding_${store.nextId++}`,
    platform: data.platform,
    account_name: data.account_name,
    shop_id: data.shop_id,
    region: data.region,
    api_key: data.api_key,
    api_secret: data.api_secret,
    auth_type: data.auth_type,
    status: 'active',
    expire_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    last_sync: now,
    product_count: 0,
    order_count: 0,
    created_at: now,
    updated_at: now,
  };

  store.bindings.push(newBinding);
  return newBinding;
}

/**
 * 更新平台绑定
 */
export function updatePlatformBinding(id: string, data: Partial<PlatformBinding>): PlatformBinding | undefined {
  const store = getStore();
  const bindingIndex = store.bindings.findIndex((b) => b.id === id);

  if (bindingIndex === -1) {
    return undefined;
  }

  const binding = store.bindings[bindingIndex];
  const now = new Date().toISOString();

  // 更新字段
  Object.assign(binding, data, { updated_at: now });

  store.bindings[bindingIndex] = binding;
  return binding;
}

/**
 * 删除平台绑定
 */
export function deletePlatformBinding(id: string): boolean {
  const store = getStore();
  const bindingIndex = store.bindings.findIndex((b) => b.id === id);

  if (bindingIndex === -1) {
    return false;
  }

  store.bindings.splice(bindingIndex, 1);
  return true;
}

/**
 * 分页查询平台绑定
 */
export function getPlatformBindingsPaginated(params: {
  page?: number;
  page_size?: number;
  platform?: string;
  status?: string;
}): { bindings: PlatformBinding[]; total: number; page: number; page_size: number } {
  const store = getStore();
  let filteredBindings = [...store.bindings];

  // 平台过滤
  if (params.platform) {
    filteredBindings = filteredBindings.filter((b) => b.platform === params.platform);
  }

  // 状态过滤
  if (params.status) {
    filteredBindings = filteredBindings.filter((b) => b.status === params.status);
  }

  // 分页
  const page = params.page || 1;
  const pageSize = params.page_size || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBindings = filteredBindings.slice(startIndex, endIndex);

  return {
    bindings: paginatedBindings,
    total: filteredBindings.length,
    page,
    page_size: pageSize,
  };
}

/**
 * 同步平台绑定
 */
export function syncPlatformBinding(id: string): { success: boolean; message: string; synced_products?: number; synced_orders?: number } {
  const binding = getPlatformBindingById(id);
  if (!binding) {
    return { success: false, message: '平台绑定不存在' };
  }

  const now = new Date().toISOString();

  // 更新绑定状态
  binding.status = 'active';
  binding.last_sync = now;
  binding.product_count = Math.floor(Math.random() * 1000);
  binding.order_count = Math.floor(Math.random() * 500);
  binding.updated_at = now;

  return {
    success: true,
    message: '同步成功',
    synced_products: binding.product_count,
    synced_orders: binding.order_count,
  };
}

/**
 * 初始化示例数据
 */
export function initSamplePlatformBindings(): void {
  const store = getStore();
  if (store.bindings.length > 0) return;

  const now = new Date();
  const sampleBindings: Omit<PlatformBinding, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      platform: 'TK小店',
      account_name: '东南亚小店01',
      shop_id: '712345678',
      region: '印尼',
      api_key: 'tk_live_********',
      api_secret: '********',
      auth_type: 'API授权',
      status: 'active',
      expire_time: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: now.toISOString(),
      product_count: 256,
      order_count: 1234,
    },
    {
      platform: '亚马逊',
      account_name: '北美店铺A',
      shop_id: 'A1B2C3D4E5',
      region: '北美',
      api_key: 'AKIAIOSFODNN7EXAMPLE',
      api_secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      auth_type: 'SP-API',
      status: 'active',
      expire_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: now.toISOString(),
      product_count: 512,
      order_count: 3456,
    },
    {
      platform: 'TK Ads',
      account_name: '广告账户01',
      shop_id: 'ADS123456',
      region: '马来西亚',
      api_key: 'ads_key_********',
      api_secret: '********',
      auth_type: 'OAuth2.0',
      status: 'active',
      expire_time: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: now.toISOString(),
      product_count: 0,
      order_count: 0,
    },
  ];

  for (const binding of sampleBindings) {
    store.bindings.push({
      ...binding,
      id: `binding_${store.nextId++}`,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }
}

// 自动初始化示例数据
initSamplePlatformBindings();
