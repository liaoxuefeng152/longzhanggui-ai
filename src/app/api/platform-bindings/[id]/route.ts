/**
 * 平台绑定详情API路由
 * GET: 获取平台绑定详情
 * PUT: 更新平台绑定
 * DELETE: 删除平台绑定
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPlatformBindingById,
  updatePlatformBinding as updateBinding,
  deletePlatformBinding as deleteBinding,
} from '@/lib/data/platform-bindings-store';

/**
 * GET /api/platform-bindings/[id]
 * 获取平台绑定详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const binding = getPlatformBindingById(id);

    if (!binding) {
      return NextResponse.json(
        { error: '平台绑定不存在', message: `平台绑定 ${id} 不存在` },
        { status: 404 }
      );
    }

    return NextResponse.json(binding);
  } catch (error) {
    console.error('获取平台绑定详情失败:', error);
    return NextResponse.json(
      { error: '获取平台绑定详情失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/platform-bindings/[id]
 * 更新平台绑定
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const binding = updateBinding(id, body);

    if (!binding) {
      return NextResponse.json(
        { error: '平台绑定不存在', message: `平台绑定 ${id} 不存在` },
        { status: 404 }
      );
    }

    return NextResponse.json(binding);
  } catch (error) {
    console.error('更新平台绑定失败:', error);
    return NextResponse.json(
      { error: '更新平台绑定失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform-bindings/[id]
 * 删除平台绑定
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteBinding(id);

    if (!success) {
      return NextResponse.json(
        { error: '平台绑定不存在', message: `平台绑定 ${id} 不存在` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '解绑成功' });
  } catch (error) {
    console.error('删除平台绑定失败:', error);
    return NextResponse.json(
      { error: '删除平台绑定失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
