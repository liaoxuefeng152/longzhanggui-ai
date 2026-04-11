/**
 * 角色管理 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  level: number; // 1-100, 越高权限越大
  permissions: string[];
  is_system: boolean; // 系统内置角色不可删除
  user_count: number;
  created_at: string;
  updated_at: string;
}

// 系统内置角色
const SYSTEM_ROLES: Role[] = [
  {
    id: 'role_owner',
    name: '创始人/老板',
    code: 'owner',
    description: '拥有系统全部权限，负责公司整体运营决策',
    level: 100,
    permissions: ['*'], // 全部权限
    is_system: true,
    user_count: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_admin',
    name: '管理员',
    code: 'admin',
    description: '拥有大部分管理权限，协助老板进行日常运营管理',
    level: 90,
    permissions: [
      'dashboard.view', 'dashboard.edit',
      'erp.*', // ERP全部权限
      'ai_agents.*',
      'workflows.*',
      'shops.*',
      'scheduler.*',
      'reports.*',
      'settings.view', 'settings.edit',
    ],
    is_system: true,
    user_count: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_operator',
    name: '运营专员',
    code: 'operator',
    description: '负责日常运营操作，包括商品管理、订单处理等',
    level: 60,
    permissions: [
      'dashboard.view',
      'erp.products.view', 'erp.products.edit', 'erp.products.create',
      'erp.orders.*',
      'erp.inventory.*',
      'erp.logistics.*',
      'ai_agents.select_products', 'ai_agents.image_design', 'ai_agents.listing_optimize',
      'shops.view',
      'reports.view',
    ],
    is_system: true,
    user_count: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_finance',
    name: '财务专员',
    code: 'finance',
    description: '负责财务相关操作，包括财务报表、成本核算等',
    level: 50,
    permissions: [
      'dashboard.view',
      'erp.finance.*',
      'erp.orders.view',
      'erp.products.view',
      'reports.*',
    ],
    is_system: true,
    user_count: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_customer_service',
    name: '客服专员',
    code: 'customer_service',
    description: '负责客户咨询、售后处理、工单管理等',
    level: 40,
    permissions: [
      'dashboard.view',
      'erp.orders.view', 'erp.orders.edit',
      'erp.logistics.view',
      'ai_agents.customer_service',
      'tickets.*',
      'customers.*',
    ],
    is_system: true,
    user_count: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// 权限清单
const PERMISSION_LIST = [
  { category: '控制台', permissions: ['dashboard.view', 'dashboard.edit'] },
  { category: 'ERP-商品', permissions: ['erp.products.view', 'erp.products.edit', 'erp.products.create', 'erp.products.delete'] },
  { category: 'ERP-订单', permissions: ['erp.orders.view', 'erp.orders.edit', 'erp.orders.delete', 'erp.orders.export'] },
  { category: 'ERP-库存', permissions: ['erp.inventory.view', 'erp.inventory.edit', 'erp.inventory.adjust'] },
  { category: 'ERP-采购', permissions: ['erp.purchase.view', 'erp.purchase.create', 'erp.purchase.approve'] },
  { category: 'ERP-财务', permissions: ['erp.finance.view', 'erp.finance.edit', 'erp.finance.export'] },
  { category: 'ERP-物流', permissions: ['erp.logistics.view', 'erp.logistics.edit'] },
  { category: 'AI智能体', permissions: ['ai_agents.*', 'ai_agents.select_products', 'ai_agents.image_design', 'ai_agents.listing_optimize', 'ai_agents.advertising', 'ai_agents.customer_service', 'ai_agents.data_review'] },
  { category: '店铺管理', permissions: ['shops.view', 'shops.edit', 'shops.delete', 'shops.sync'] },
  { category: '任务调度', permissions: ['scheduler.view', 'scheduler.edit', 'scheduler.execute'] },
  { category: '数据报表', permissions: ['reports.view', 'reports.export'] },
  { category: '系统设置', permissions: ['settings.view', 'settings.edit'] },
];

// 获取所有角色
export async function GET() {
  // 初始化系统角色
  if (!globalStore.roles) {
    globalStore.roles = [...SYSTEM_ROLES];
  }

  // 更新用户数量
  const users = Array.from(globalStore.users?.values() || []);
  globalStore.roles = globalStore.roles.map((role: Role) => ({
    ...role,
    user_count: users.filter(u => u.role_id === role.id).length,
  }));

  return NextResponse.json({
    success: true,
    data: {
      roles: globalStore.roles,
      permissions: PERMISSION_LIST,
    },
  });
}

// 创建自定义角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, level, permissions } = body;

    if (!name || !code || level === undefined || !permissions) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查代码是否重复
    const existing = globalStore.roles?.find((r: Role) => r.code === code);
    if (existing) {
      return NextResponse.json(
        { success: false, error: '角色代码已存在' },
        { status: 400 }
      );
    }

    const role: Role = {
      id: `role_${Date.now()}`,
      name,
      code,
      description: description || '',
      level,
      permissions,
      is_system: false,
      user_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!globalStore.roles) {
      globalStore.roles = [...SYSTEM_ROLES];
    }
    globalStore.roles.push(role);

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建角色失败' },
      { status: 500 }
    );
  }
}

// 更新角色
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少角色ID' },
        { status: 400 }
      );
    }

    const roles = globalStore.roles || [];
    const index = roles.findIndex((r: Role) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 系统角色不可修改
    if (roles[index].is_system) {
      return NextResponse.json(
        { success: false, error: '系统角色不可修改' },
        { status: 403 }
      );
    }

    // 不能修改代码
    delete updates.code;
    delete updates.id;
    delete updates.is_system;

    roles[index] = {
      ...roles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    globalStore.roles = roles;

    return NextResponse.json({
      success: true,
      data: roles[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新角色失败' },
      { status: 500 }
    );
  }
}

// 删除角色
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少角色ID' },
        { status: 400 }
      );
    }

    const roles = globalStore.roles || [];
    const index = roles.findIndex((r: Role) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 系统角色不可删除
    if (roles[index].is_system) {
      return NextResponse.json(
        { success: false, error: '系统角色不可删除' },
        { status: 403 }
      );
    }

    // 检查是否有用户使用此角色
    if (roles[index].user_count > 0) {
      return NextResponse.json(
        { success: false, error: '该角色下有用户，无法删除' },
        { status: 400 }
      );
    }

    roles.splice(index, 1);
    globalStore.roles = roles;

    return NextResponse.json({
      success: true,
      message: '角色已删除',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除角色失败' },
      { status: 500 }
    );
  }
}
