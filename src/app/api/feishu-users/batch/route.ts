/**
 * 批量操作用户API路由
 * POST: 批量操作用户
 */

import { NextRequest, NextResponse } from 'next/server';
import { batchFeishuUsersOperation } from '@/lib/data/feishu-users-store';

/**
 * POST /api/v1/erp/feishu-users/batch
 * 批量操作用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user_ids, action, renew_days } = body;

    // 验证必填字段
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: '请选择要操作的用户', message: 'user_ids 为必填项且必须是非空数组' },
        { status: 400 }
      );
    }

    if (!action || !['activate', 'deactivate', 'renew'].includes(action)) {
      return NextResponse.json(
        { error: '无效的操作类型', message: 'action 必须是 activate、deactivate 或 renew' },
        { status: 400 }
      );
    }

    if (action === 'renew' && (!renew_days || typeof renew_days !== 'number' || renew_days <= 0)) {
      return NextResponse.json(
        { error: '请输入续费天数', message: 'renew_days 为必填项且必须是正数' },
        { status: 400 }
      );
    }

    // 执行批量操作
    const result = batchFeishuUsersOperation({ user_ids, action, renew_days });

    return NextResponse.json(result);
  } catch (error) {
    console.error('批量操作用户失败:', error);
    return NextResponse.json(
      { error: '批量操作用户失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
