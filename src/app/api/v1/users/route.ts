/**
 * 用户管理 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role_id: string;
  role_name: string;
  role_level: number;
  status: 'active' | 'inactive' | 'locked';
  last_login?: string;
  login_count: number;
  shop_ids?: string[]; // 可见店铺
  created_at: string;
  updated_at: string;
}

// 获取所有用户
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roleId = searchParams.get('role_id');

  let users = Array.from(globalStore.users?.values() || []);

  // 按角色筛选
  if (roleId) {
    users = users.filter((u: User) => u.role_id === roleId);
  }

  // 按状态排序
  users.sort((a: User, b: User) => {
    const statusOrder = { active: 0, inactive: 1, locked: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // 获取角色信息
  const roles = globalStore.roles || [];

  return NextResponse.json({
    success: true,
    data: {
      users,
      roles,
      total: users.length,
    },
  });
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, phone, password, role_id, shop_ids } = body;

    if (!username || !email || !password || !role_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查用户名/邮箱是否重复
    const existingUsers = Array.from(globalStore.users?.values() || []);
    if (existingUsers.some((u: User) => u.username === username)) {
      return NextResponse.json(
        { success: false, error: '用户名已存在' },
        { status: 400 }
      );
    }
    if (existingUsers.some((u: User) => u.email === email)) {
      return NextResponse.json(
        { success: false, error: '邮箱已存在' },
        { status: 400 }
      );
    }

    // 获取角色信息
    const roles = globalStore.roles || [];
    const role = roles.find((r: any) => r.id === role_id);

    if (!role) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 400 }
      );
    }

    const user: User = {
      id: `user_${Date.now()}`,
      username,
      email,
      phone,
      role_id,
      role_name: role.name,
      role_level: role.level,
      status: 'active',
      login_count: 0,
      shop_ids: shop_ids || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!globalStore.users) {
      globalStore.users = new Map();
    }
    globalStore.users.set(user.id, user);

    // 记录操作日志
    globalStore.operationLogs?.push({
      id: `log_${Date.now()}`,
      action: 'create_user',
      target: user.id,
      target_name: username,
      operator: 'system',
      result: 'success',
      created_at: new Date().toISOString(),
    });

    // 移除敏感信息返回
    const { ...safeUser } = user;
    return NextResponse.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建用户失败' },
      { status: 500 }
    );
  }
}

// 批量更新用户状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const user = globalStore.users?.get(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    if (action === 'toggle_status') {
      user.status = user.status === 'active' ? 'inactive' : 'active';
    } else if (action === 'lock') {
      user.status = 'locked';
    } else if (action === 'reset_password') {
      // 模拟密码重置
      return NextResponse.json({
        success: true,
        message: '密码重置成功，已发送邮件',
      });
    } else {
      // 直接更新
      delete updates.id;
      Object.assign(user, updates);
    }

    user.updated_at = new Date().toISOString();
    globalStore.users?.set(id, user);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    if (!globalStore.users?.has(id)) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 不能删除自己
    const currentUser = request.headers.get('x-user-id');
    if (id === currentUser) {
      return NextResponse.json(
        { success: false, error: '不能删除当前登录用户' },
        { status: 400 }
      );
    }

    globalStore.users?.delete(id);

    return NextResponse.json({
      success: true,
      message: '用户已删除',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
