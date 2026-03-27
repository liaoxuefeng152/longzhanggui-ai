import { NextRequest, NextResponse } from 'next/server';
import { getPackageById, updatePackage, deletePackage } from '@/lib/data/packages-store';

/**
 * 获取套餐详情
 * GET /api/v1/packages/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = getPackageById(id);

    if (!pkg) {
      return NextResponse.json(
        { error: '套餐不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('获取套餐详情失败:', error);
    return NextResponse.json(
      { error: '获取套餐详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新套餐
 * PUT /api/v1/packages/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 更新套餐
    const updatedPkg = updatePackage(id, body);

    if (!updatedPkg) {
      return NextResponse.json(
        { error: '套餐不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '套餐更新成功',
      data: updatedPkg,
    });
  } catch (error) {
    console.error('更新套餐失败:', error);
    return NextResponse.json(
      { error: '更新套餐失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除套餐
 * DELETE /api/v1/packages/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = deletePackage(id);

    if (!deleted) {
      return NextResponse.json(
        { error: '套餐不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '套餐已删除',
    });
  } catch (error) {
    console.error('删除套餐失败:', error);
    return NextResponse.json(
      { error: '删除套餐失败' },
      { status: 500 }
    );
  }
}
