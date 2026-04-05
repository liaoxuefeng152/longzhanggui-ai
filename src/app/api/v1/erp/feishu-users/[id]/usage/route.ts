/**
 * 用户使用情况API路由
 * GET: 获取用户使用情况
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFeishuUserById } from '@/lib/data/feishu-users-store';

/**
 * GET /api/v1/erp/feishu-users/[id]/usage
 * 获取用户使用情况
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

    // 模拟每日使用情况数据
    const today = new Date();
    const dailyUsage = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        calls: Math.floor(Math.random() * 20) + 1,
      };
    });

    const totalCalls = dailyUsage.reduce((sum, day) => sum + day.calls, 0);
    const totalTokens = totalCalls * 1000; // 假设每次调用平均1000 tokens

    return NextResponse.json({
      daily_usage: dailyUsage,
      total_calls: totalCalls,
      total_tokens: totalTokens,
    });
  } catch (error) {
    console.error('获取用户使用情况失败:', error);
    return NextResponse.json(
      { error: '获取用户使用情况失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
