/**
 * 套餐管理 API - 套餐详情
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPackageById, updatePackage, deletePackage } from '@/lib/data/packages-store';

// GET /api/packages/[id] - 获取套餐详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pkg = getPackageById(id);

  if (!pkg) {
    return NextResponse.json(
      { success: false, message: '套餐不存在' },
      { status: 404 }
    );
  }

  return NextResponse.json({ package: pkg });
}

// PUT /api/packages/[id] - 更新套餐
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updatePackage(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: '套餐不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: updated,
    });
  } catch (error) {
    console.error('更新套餐失败:', error);
    return NextResponse.json(
      { success: false, message: '更新套餐失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/packages/[id] - 删除套餐
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = deletePackage(id);

  if (!success) {
    return NextResponse.json(
      { success: false, message: '套餐不存在' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: '套餐已删除',
  });
}
