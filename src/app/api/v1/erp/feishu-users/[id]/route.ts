/**
 * 飞书用户详情API路由
 * GET: 获取用户详情
 * PUT: 更新用户
 * DELETE: 删除用户
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFeishuUserById,
  updateFeishuUser as updateUser,
  deleteFeishuUser as deleteUser,
  updateFeishuUserCallCount,
} from '@/lib/data/feishu-users-store';

/**
 * GET /api/v1/erp/feishu-users/[id]
 * 获取用户详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getFeishuUserById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在', message: `用户 ${params.id} 不存在` },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { error: '获取用户详情失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/erp/feishu-users/[id]
 * 更新用户
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const user = updateUser(params.id, body);

    return NextResponse.json(user);
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { error: '更新用户失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/erp/feishu-users/[id]
 * 删除用户
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteUser(params.id);

    if (!success) {
      return NextResponse.json(
        { error: '用户不存在', message: `用户 ${params.id} 不存在` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { error: '删除用户失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
