/**
 * 飞书用户数据存储层
 * 用于存储飞书用户信息，实现用户管理功能
 */

import type { FeishuUser, PackageType, UserStatus } from '@/lib/api/feishu-users';

// 全局存储
const GLOBAL_KEY = '__feishu_users_store__';

interface FeishuUsersStore {
  users: FeishuUser[];
  nextId: number;
}

// 初始化存储
function getStore(): FeishuUsersStore {
  if (!(global as any)[GLOBAL_KEY]) {
    (global as any)[GLOBAL_KEY] = {
      users: [],
      nextId: 1,
    };
  }
  return (global as any)[GLOBAL_KEY];
}

/**
 * 获取所有用户
 */
export function getAllFeishuUsers(): FeishuUser[] {
  const store = getStore();
  return store.users;
}

/**
 * 根据ID获取用户
 */
export function getFeishuUserById(id: string): FeishuUser | undefined {
  const store = getStore();
  return store.users.find((u) => u.id === id);
}

/**
 * 根据open_id获取用户
 */
export function getFeishuUserByOpenId(open_id: string): FeishuUser | undefined {
  const store = getStore();
  return store.users.find((u) => u.open_id === open_id);
}

/**
 * 创建用户
 */
export function createFeishuUser(data: {
  open_id: string;
  nickname: string;
  package_type: PackageType;
  agent_permissions: string[];
  trial_days?: number;
  call_quota?: number;
}): FeishuUser {
  const store = getStore();
  const now = new Date().toISOString();

  // 检查open_id是否已存在
  const existing = getFeishuUserByOpenId(data.open_id);
  if (existing) {
    throw new Error(`open_id ${data.open_id} 已存在`);
  }

  // 计算到期时间
  let expireTime: string | undefined;
  if (data.trial_days && data.trial_days > 0) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + data.trial_days);
    expireTime = expireDate.toISOString();
  }

  // 根据套餐类型确定套餐名称
  const packageNameMap: Record<PackageType, string> = {
    basic: '基础版',
    advanced: '进阶版',
    flagship: '旗舰版',
  };

  const newUser: FeishuUser = {
    id: `user_${store.nextId++}`,
    open_id: data.open_id,
    nickname: data.nickname,
    status: data.trial_days ? 'trial' : 'active',
    package_type: data.package_type,
    package_name: packageNameMap[data.package_type],
    expire_time: expireTime,
    agent_permissions: data.agent_permissions,
    call_quota: data.call_quota || 100,
    call_used: 0,
    call_limit: data.call_quota || 100,
    created_at: now,
    updated_at: now,
  };

  store.users.push(newUser);
  return newUser;
}

/**
 * 更新用户
 */
export function updateFeishuUser(id: string, data: Partial<{
  nickname: string;
  package_type: PackageType;
  agent_permissions: string[];
  call_quota: number;
  status: UserStatus;
  expire_time?: string;
}>): FeishuUser {
  const store = getStore();
  const userIndex = store.users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    throw new Error(`用户 ${id} 不存在`);
  }

  const user = store.users[userIndex];
  const now = new Date().toISOString();

  // 更新字段
  if (data.nickname !== undefined) {
    user.nickname = data.nickname;
  }
  if (data.package_type !== undefined) {
    user.package_type = data.package_type;
    const packageNameMap: Record<PackageType, string> = {
      basic: '基础版',
      advanced: '进阶版',
      flagship: '旗舰版',
    };
    user.package_name = packageNameMap[data.package_type];
  }
  if (data.agent_permissions !== undefined) {
    user.agent_permissions = data.agent_permissions;
  }
  if (data.call_quota !== undefined) {
    const diff = data.call_quota - user.call_quota;
    user.call_quota = data.call_quota;
    user.call_limit = data.call_quota;
  }
  if (data.status !== undefined) {
    user.status = data.status;
  }
  if (data.expire_time !== undefined) {
    user.expire_time = data.expire_time;
  }

  user.updated_at = now;

  store.users[userIndex] = user;
  return user;
}

/**
 * 删除用户
 */
export function deleteFeishuUser(id: string): boolean {
  const store = getStore();
  const userIndex = store.users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return false;
  }

  store.users.splice(userIndex, 1);
  return true;
}

/**
 * 更新用户调用次数
 */
export function updateFeishuUserCallCount(id: string, count: number): FeishuUser {
  const store = getStore();
  const user = store.users.find((u) => u.id === id);

  if (!user) {
    throw new Error(`用户 ${id} 不存在`);
  }

  user.call_used = count;
  user.updated_at = new Date().toISOString();

  return user;
}

/**
 * 分页查询用户
 */
export function getFeishuUsersPaginated(params: {
  page?: number;
  page_size?: number;
  status?: string;
  package_type?: string;
  search?: string;
}): { users: FeishuUser[]; total: number; page: number; page_size: number } {
  const store = getStore();
  let filteredUsers = [...store.users];

  // 状态过滤
  if (params.status) {
    filteredUsers = filteredUsers.filter((u) => u.status === params.status);
  }

  // 套餐类型过滤
  if (params.package_type) {
    filteredUsers = filteredUsers.filter((u) => u.package_type === params.package_type);
  }

  // 搜索过滤
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.nickname.toLowerCase().includes(searchLower) ||
        u.open_id.toLowerCase().includes(searchLower)
    );
  }

  // 分页
  const page = params.page || 1;
  const pageSize = params.page_size || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total: filteredUsers.length,
    page,
    page_size: pageSize,
  };
}

/**
 * 批量操作用户
 */
export function batchFeishuUsersOperation(data: {
  user_ids: string[];
  action: 'activate' | 'deactivate' | 'renew';
  renew_days?: number;
}): { success: boolean; affected: number } {
  const store = getStore();
  let affected = 0;

  for (const userId of data.user_ids) {
    const user = store.users.find((u) => u.id === userId);
    if (!user) continue;

    if (data.action === 'activate') {
      user.status = 'active';
      affected++;
    } else if (data.action === 'deactivate') {
      user.status = 'inactive';
      affected++;
    } else if (data.action === 'renew' && data.renew_days) {
      const currentExpire = user.expire_time ? new Date(user.expire_time) : new Date();
      const newExpire = new Date(currentExpire);
      newExpire.setDate(newExpire.getDate() + data.renew_days);
      user.expire_time = newExpire.toISOString();
      user.status = 'active';
      affected++;
    }

    user.updated_at = new Date().toISOString();
  }

  return { success: true, affected };
}

/**
 * 重置存储（用于测试）
 */
export function resetFeishuUsersStore(): void {
  (global as any)[GLOBAL_KEY] = {
    users: [],
    nextId: 1,
  };
}

/**
 * 初始化示例数据
 */
export function initSampleFeishuUsers(): void {
  const store = getStore();
  if (store.users.length > 0) return;

  const now = new Date();
  const expireDate = new Date(now);
  expireDate.setDate(expireDate.getDate() + 30);

  const expiringSoonDate = new Date(now);
  expiringSoonDate.setDate(expiringSoonDate.getDate() + 5);

  const expiredDate = new Date(now);
  expiredDate.setDate(expiredDate.getDate() - 10);

  const sampleUsers: Omit<FeishuUser, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      open_id: 'ou_xxxxxx1',
      nickname: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      status: 'active',
      package_type: 'advanced',
      package_name: '进阶版',
      expire_time: expireDate.toISOString(),
      agent_permissions: ['product-selection', 'image-design', 'listing-optimization'],
      call_quota: 1000,
      call_used: 234,
      call_limit: 1000,
    },
    {
      open_id: 'ou_xxxxxx2',
      nickname: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
      status: 'trial',
      package_type: 'basic',
      package_name: '基础版',
      expire_time: expiringSoonDate.toISOString(),
      agent_permissions: ['product-selection'],
      call_quota: 100,
      call_used: 67,
      call_limit: 100,
    },
    {
      open_id: 'ou_xxxxxx3',
      nickname: '王五',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
      status: 'expired',
      package_type: 'basic',
      package_name: '基础版',
      expire_time: expiredDate.toISOString(),
      agent_permissions: ['product-selection', 'customer-service'],
      call_quota: 100,
      call_used: 100,
      call_limit: 100,
    },
    {
      open_id: 'ou_xxxxxx4',
      nickname: '赵六',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
      status: 'active',
      package_type: 'flagship',
      package_name: '旗舰版',
      expire_time: expireDate.toISOString(),
      agent_permissions: [
        'product-selection',
        'image-design',
        'video-generation',
        'listing-optimization',
        'ad-campaign',
        'customer-service',
        'data-review',
      ],
      call_quota: 5000,
      call_used: 1234,
      call_limit: 5000,
    },
    {
      open_id: 'ou_xxxxxx5',
      nickname: '钱七',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qianqi',
      status: 'inactive',
      package_type: 'basic',
      package_name: '基础版',
      expire_time: undefined,
      agent_permissions: [],
      call_quota: 100,
      call_used: 0,
      call_limit: 100,
    },
  ];

  for (const user of sampleUsers) {
    store.users.push({
      ...user,
      id: `user_${store.nextId++}`,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }
}

// 自动初始化示例数据
initSampleFeishuUsers();
