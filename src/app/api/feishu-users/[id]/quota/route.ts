/**
 * 用户配额管理API路由
 * PUT: 更新用户配额
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateFeishuUser } from '@/lib/data/feishu-users-store';

/**
 * PUT /api/feishu-users/[id]/quota
 * 更新用户配额
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quota } = body;

    if (typeof quota !== 'number' || quota < 0) {
      return NextResponse.json(
        { error: '无效的配额值', message: '配额必须是正数' },
        { status: 400 }
      );
    }

    const user = updateFeishuUser(id, { call_quota: quota });

    return NextResponse.json({ success: true, message: '配额更新成功', data: user });
  } catch (error) {
    console.error('更新用户配额失败:', error);
    return NextResponse.json(
      { error: '更新用户配额失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
