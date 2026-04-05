/**
 * 飞书用户管理API路由
 * GET: 获取用户列表
 * POST: 创建用户
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllFeishuUsers,
  createFeishuUser as createUser,
  getFeishuUsersPaginated,
  batchFeishuUsersOperation,
} from '@/lib/data/feishu-users-store';

/**
 * GET /api/v1/erp/feishu-users
 * 获取飞书用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page');
    const pageSize = searchParams.get('page_size');
    const status = searchParams.get('status');
    const packageType = searchParams.get('package_type');
    const search = searchParams.get('search');

    // 如果有分页参数，使用分页查询
    if (page || pageSize || status || packageType || search) {
      const result = getFeishuUsersPaginated({
        page: page ? parseInt(page, 10) : undefined,
        page_size: pageSize ? parseInt(pageSize, 10) : undefined,
        status: status || undefined,
        package_type: packageType || undefined,
        search: search || undefined,
      });
      return NextResponse.json(result);
    }

    // 否则返回所有用户
    const users = getAllFeishuUsers();
    return NextResponse.json({
      users,
      total: users.length,
      page: 1,
      page_size: users.length,
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/erp/feishu-users
 * 创建飞书用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { open_id, nickname, package_type, agent_permissions, trial_days, call_quota } = body;

    // 验证必填字段
    if (!open_id || !nickname) {
      return NextResponse.json(
        { error: '请填写必填字段', message: 'open_id 和 nickname 为必填项' },
        { status: 400 }
      );
    }

    if (!package_type) {
      return NextResponse.json(
        { error: '请选择套餐类型', message: 'package_type 为必填项' },
        { status: 400 }
      );
    }

    // 创建用户
    const user = createUser({
      open_id,
      nickname,
      package_type,
      agent_permissions: agent_permissions || [],
      trial_days,
      call_quota,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { error: '创建用户失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
