import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSettings,
  updateSettings,
} from '@/lib/data/settings-store';

/**
 * GET /api/v1/settings - 获取所有设置
 * Query参数:
 * - category: 可选，筛选设置分类
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const settings = getAllSettings(category);

    return NextResponse.json({
      settings,
      total: settings.length,
    });
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/settings - 批量更新设置
 * Body: { [key]: value }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求体
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '请求体格式错误' },
        { status: 400 }
      );
    }

    // 更新设置
    const updatedSettings = updateSettings(body);

    return NextResponse.json({
      success: true,
      message: '设置已保存',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('更新设置失败:', error);
    return NextResponse.json(
      { error: '更新设置失败' },
      { status: 500 }
    );
  }
}
