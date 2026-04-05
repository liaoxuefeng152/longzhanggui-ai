/**
 * 平台绑定同步API路由
 * POST: 同步平台绑定数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncPlatformBinding as syncBinding } from '@/lib/data/platform-bindings-store';

/**
 * POST /api/platform-bindings/[id]/sync
 * 同步平台绑定数据
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = syncBinding(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('同步平台绑定失败:', error);
    return NextResponse.json(
      { success: false, message: '同步失败' },
      { status: 500 }
    );
  }
}
