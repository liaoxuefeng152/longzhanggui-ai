// 用户角色类型
export type UserRole = 'admin' | 'user' | 'guest';

// 用户信息接口
export interface User {
  id: string;
  username: string;
  role: UserRole;
  email?: string;
  avatar?: string;
}

// 路由权限配置
export interface RouteConfig {
  path: string;
  roles: UserRole[];
  label: string;
  isAdminOnly?: boolean;
}

// 所有需要权限控制的路由
export const ROUTE_CONFIG: RouteConfig[] = [
  // ============ 管理端路由 (admin) ============
  { 
    path: '/platforms', 
    roles: ['admin'], 
    label: '平台配置',
    isAdminOnly: true 
  },
  { 
    path: '/users', 
    roles: ['admin'], 
    label: '用户管理',
    isAdminOnly: true 
  },
  { 
    path: '/roles', 
    roles: ['admin'], 
    label: '角色管理',
    isAdminOnly: true 
  },
  { 
    path: '/settings', 
    roles: ['admin'], 
    label: '系统设置',
    isAdminOnly: true 
  },
  { 
    path: '/feishu', 
    roles: ['admin'], 
    label: '飞书配置',
    isAdminOnly: true 
  },
  { 
    path: '/platform', 
    roles: ['admin'], 
    label: '数据源配置',
    isAdminOnly: true 
  },
  { 
    path: '/models', 
    roles: ['admin'], 
    label: '模型管理',
    isAdminOnly: true 
  },
  { 
    path: '/prompts', 
    roles: ['admin'], 
    label: 'Prompt管理',
    isAdminOnly: true 
  },
  { 
    path: '/workflows', 
    roles: ['admin'], 
    label: '工作流管理',
    isAdminOnly: true 
  },
  { 
    path: '/scheduler', 
    roles: ['admin'], 
    label: '定时任务',
    isAdminOnly: true 
  },
  { 
    path: '/reports', 
    roles: ['admin'], 
    label: '系统报表',
    isAdminOnly: true 
  },
  { 
    path: '/task-logs', 
    roles: ['admin'], 
    label: '任务日志',
    isAdminOnly: true 
  },
  
  // ============ 客户端路由 (admin + user) ============
  { 
    path: '/dashboard', 
    roles: ['admin', 'user'], 
    label: '控制台' 
  },
  { 
    path: '/shops', 
    roles: ['admin', 'user'], 
    label: '我的店铺' 
  },
  { 
    path: '/erp', 
    roles: ['admin', 'user'], 
    label: 'ERP系统' 
  },
  { 
    path: '/agents', 
    roles: ['admin', 'user'], 
    label: 'AI智能体' 
  },
  { 
    path: '/ai-agents', 
    roles: ['admin', 'user'], 
    label: '智能体中心' 
  },
  { 
    path: '/orders', 
    roles: ['admin', 'user'], 
    label: '订单管理' 
  },
  { 
    path: '/products', 
    roles: ['admin', 'user'], 
    label: '商品管理' 
  },
  { 
    path: '/customer-tickets', 
    roles: ['admin', 'user'], 
    label: '工单管理' 
  },
  { 
    path: '/select', 
    roles: ['admin', 'user'], 
    label: '智能选品' 
  },
  { 
    path: '/publish', 
    roles: ['admin', 'user'], 
    label: '快速上新' 
  },
  { 
    path: '/ads', 
    roles: ['admin', 'user'], 
    label: '广告管理' 
  },
  { 
    path: '/authorize', 
    roles: ['admin', 'user'], 
    label: '授权管理' 
  },
  { 
    path: '/packages', 
    roles: ['admin', 'user'], 
    label: '套餐管理' 
  },
  
  // ============ 公共路由 (无需登录) ============
  { 
    path: '/login', 
    roles: ['guest'], 
    label: '登录' 
  },
];

// 获取路由配置
export function getRouteConfig(path: string): RouteConfig | undefined {
  return ROUTE_CONFIG.find(route => path.startsWith(route.path));
}

// 检查用户是否有权访问路由
export function canAccessRoute(user: User | null, path: string): boolean {
  // 未登录
  if (!user) {
    return path === '/login';
  }
  
  const routeConfig = getRouteConfig(path);
  
  // 未配置的路由默认允许访问
  if (!routeConfig) {
    return true;
  }
  
  // 检查角色
  return routeConfig.roles.includes(user.role);
}

// 获取用户可访问的路由
export function getAccessibleRoutes(user: User | null): RouteConfig[] {
  if (!user) {
    return ROUTE_CONFIG.filter(route => route.roles.includes('guest'));
  }
  
  return ROUTE_CONFIG.filter(route => route.roles.includes(user.role));
}

// 判断是否为管理端路由
export function isAdminRoute(path: string): boolean {
  const routeConfig = getRouteConfig(path);
  return routeConfig?.isAdminOnly || false;
}

// 判断是否为客户端路由
export function isClientRoute(path: string): boolean {
  const routeConfig = getRouteConfig(path);
  return routeConfig !== undefined && !routeConfig.isAdminOnly;
}
