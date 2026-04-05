import { NextRequest, NextResponse } from 'next/server';
import {
  getSetting,
  updateSetting,
  deleteSetting,
} from '@/lib/data/settings-store';

/**
 * GET /api/v1/settings/:key - 获取单个设置
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const setting = getSetting(key);

    if (!setting) {
      return NextResponse.json(
        { error: '设置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/settings/:key - 更新单个设置
 * Body: { value: any }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const body = await request.json();

    // 验证请求体
    if (!body || body.value === undefined) {
      return NextResponse.json(
        { error: '请求体缺少value字段' },
        { status: 400 }
      );
    }

    // 更新设置
    const updatedSetting = updateSetting(key, body.value);

    return NextResponse.json({
      success: true,
      message: '设置已更新',
      setting: updatedSetting,
    });
  } catch (error) {
    console.error('更新设置失败:', error);
    return NextResponse.json(
      { error: '更新设置失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/settings/:key - 删除设置
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const deleted = deleteSetting(key);

    if (!deleted) {
      return NextResponse.json(
        { error: '设置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '设置已删除',
    });
  } catch (error) {
    console.error('删除设置失败:', error);
    return NextResponse.json(
      { error: '删除设置失败' },
      { status: 500 }
    );
  }
}
