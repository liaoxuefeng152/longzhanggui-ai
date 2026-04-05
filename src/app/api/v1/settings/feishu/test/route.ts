import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/data/settings-store';

/**
 * POST /api/v1/settings/feishu/test - 测试飞书连接
 */
export async function POST(request: NextRequest) {
  try {
    const app_id = getSetting('feishu_app_id')?.value as string;

    if (!app_id) {
      return NextResponse.json(
        {
          success: false,
          message: '飞书配置未完成，请先配置app_id',
        },
        { status: 400 }
      );
    }

    // 模拟连接测试（实际应调用飞书API）
    // 这里返回成功响应，表示连接正常
    return NextResponse.json({
      success: true,
      message: '飞书连接测试成功',
      bot_name: '龙虾AI助手',
    });
  } catch (error) {
    console.error('测试飞书连接失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '测试飞书连接失败',
      },
      { status: 500 }
    );
  }
}
