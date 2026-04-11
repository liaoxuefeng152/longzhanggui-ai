/**
 * 权限检查工具
 * 用于在组件和API中检查用户权限
 */

// 权限检查函数
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // 全部权限
  if (userPermissions.includes('*')) {
    return true;
  }

  // 精确匹配
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // 通配符匹配 (e.g., 'erp.*' matches 'erp.products.view')
  const [requiredCategory] = requiredPermission.split('.');
  
  for (const perm of userPermissions) {
    if (perm.endsWith('.*')) {
      const permCategory = perm.replace('.*', '');
      if (requiredPermission.startsWith(permCategory + '.')) {
        return true;
      }
    }
  }

  return false;
}

// 批量权限检查
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(perm => hasPermission(userPermissions, perm));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(perm => hasPermission(userPermissions, perm));
}

// 权限分组
export function getPermissionGroups(): { category: string; permissions: { code: string; name: string }[] }[] {
  return [
    {
      category: '控制台',
      permissions: [
        { code: 'dashboard.view', name: '查看控制台' },
        { code: 'dashboard.edit', name: '编辑控制台' },
      ],
    },
    {
      category: 'ERP - 商品管理',
      permissions: [
        { code: 'erp.products.view', name: '查看商品' },
        { code: 'erp.products.create', name: '创建商品' },
        { code: 'erp.products.edit', name: '编辑商品' },
        { code: 'erp.products.delete', name: '删除商品' },
        { code: 'erp.products.import', name: '导入商品' },
        { code: 'erp.products.export', name: '导出商品' },
      ],
    },
    {
      category: 'ERP - 订单管理',
      permissions: [
        { code: 'erp.orders.view', name: '查看订单' },
        { code: 'erp.orders.edit', name: '处理订单' },
        { code: 'erp.orders.delete', name: '删除订单' },
        { code: 'erp.orders.export', name: '导出订单' },
        { code: 'erp.orders.sync', name: '同步订单' },
      ],
    },
    {
      category: 'ERP - 库存管理',
      permissions: [
        { code: 'erp.inventory.view', name: '查看库存' },
        { code: 'erp.inventory.edit', name: '编辑库存' },
        { code: 'erp.inventory.adjust', name: '调整库存' },
      ],
    },
    {
      category: 'ERP - 采购管理',
      permissions: [
        { code: 'erp.purchase.view', name: '查看采购' },
        { code: 'erp.purchase.create', name: '创建采购' },
        { code: 'erp.purchase.approve', name: '审批采购' },
      ],
    },
    {
      category: 'ERP - 财务管理',
      permissions: [
        { code: 'erp.finance.view', name: '查看财务' },
        { code: 'erp.finance.edit', name: '编辑财务' },
        { code: 'erp.finance.export', name: '导出报表' },
      ],
    },
    {
      category: 'ERP - 物流管理',
      permissions: [
        { code: 'erp.logistics.view', name: '查看物流' },
        { code: 'erp.logistics.edit', name: '编辑物流' },
      ],
    },
    {
      category: 'AI 智能体',
      permissions: [
        { code: 'ai_agents.select_products', name: '选品智能体' },
        { code: 'ai_agents.image_design', name: '图片设计' },
        { code: 'ai_agents.video_generation', name: '视频生成' },
        { code: 'ai_agents.listing_optimize', name: 'Listing优化' },
        { code: 'ai_agents.advertising', name: '广告投放' },
        { code: 'ai_agents.customer_service', name: 'AI客服' },
        { code: 'ai_agents.data_review', name: '数据复盘' },
      ],
    },
    {
      category: '店铺管理',
      permissions: [
        { code: 'shops.view', name: '查看店铺' },
        { code: 'shops.edit', name: '编辑店铺' },
        { code: 'shops.delete', name: '删除店铺' },
        { code: 'shops.sync', name: '同步数据' },
      ],
    },
    {
      category: '定时任务',
      permissions: [
        { code: 'scheduler.view', name: '查看任务' },
        { code: 'scheduler.edit', name: '编辑任务' },
        { code: 'scheduler.execute', name: '执行任务' },
      ],
    },
    {
      category: '数据报表',
      permissions: [
        { code: 'reports.view', name: '查看报表' },
        { code: 'reports.export', name: '导出报表' },
      ],
    },
    {
      category: '用户权限',
      permissions: [
        { code: 'users.view', name: '查看用户' },
        { code: 'users.create', name: '创建用户' },
        { code: 'users.edit', name: '编辑用户' },
        { code: 'users.delete', name: '删除用户' },
        { code: 'roles.view', name: '查看角色' },
        { code: 'roles.edit', name: '编辑角色' },
      ],
    },
    {
      category: '系统设置',
      permissions: [
        { code: 'settings.view', name: '查看设置' },
        { code: 'settings.edit', name: '编辑设置' },
      ],
    },
  ];
}

// 页面权限映射
export const PAGE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['dashboard.view'],
  '/erp/products': ['erp.products.view'],
  '/erp/orders': ['erp.orders.view'],
  '/erp/inventory': ['erp.inventory.view'],
  '/erp/purchase': ['erp.purchase.view'],
  '/erp/finance': ['erp.finance.view'],
  '/erp/logistics': ['erp.logistics.view'],
  '/ai-agents': ['ai_agents.*'],
  '/workflows': ['workflows.*'],
  '/shops': ['shops.view'],
  '/scheduler': ['scheduler.view'],
  '/users': ['users.view'],
  '/roles': ['roles.view'],
  '/reports': ['reports.view'],
  '/settings': ['settings.view'],
};

// 检查用户是否有页面访问权限
export function canAccessPage(userPermissions: string[], pathname: string): boolean {
  const requiredPermissions = PAGE_PERMISSIONS[pathname];
  
  if (!requiredPermissions) {
    return true; // 未配置的页面默认允许访问
  }

  return hasAnyPermission(userPermissions, requiredPermissions);
}
