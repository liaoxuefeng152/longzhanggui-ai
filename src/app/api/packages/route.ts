/**
 * 套餐管理 API - 套餐列表
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllPackages, packagesStore } from '@/lib/data/packages-store';

// GET /api/packages - 获取套餐列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const activeOnly = searchParams.get('active_only') === 'true';

  let packages = getAllPackages();

  // 如果需要只返回激活的套餐
  if (activeOnly) {
    packages = packages.filter(pkg => pkg.is_active);
  }

  return NextResponse.json({
    packages,
    total: packages.length,
  });
}

// POST /api/packages - 创建套餐
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 生成新套餐ID
    const newId = `PKG-${Date.now().toString(36).toUpperCase()}`;

    const newPackage = {
      id: newId,
      name: body.name || '新套餐',
      description: body.description || '',
      price: body.price || 0,
      call_quota: body.call_quota || 100000,
      call_limit: body.call_limit || 1000,
      duration: body.duration || 30,
      duration_days: body.duration_days || 30,
      features: body.features || [],
      agent_access: body.agent_access || [],
      user_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    packagesStore.push(newPackage);

    return NextResponse.json({
      success: true,
      package: newPackage,
    });
  } catch (error) {
    console.error('创建套餐失败:', error);
    return NextResponse.json(
      { success: false, message: '创建套餐失败' },
      { status: 500 }
    );
  }
}
