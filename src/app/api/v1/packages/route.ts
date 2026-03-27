import { NextRequest, NextResponse } from 'next/server';
import { getAllPackages, addPackage, Package } from '@/lib/data/packages-store';

/**
 * 获取套餐列表
 * GET /api/v1/packages
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') === 'true';

    let packages = getAllPackages();

    if (activeOnly) {
      packages = packages.filter(p => p.is_active);
    }

    return NextResponse.json({
      packages: packages,
    });
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return NextResponse.json(
      { error: '获取套餐列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建套餐
 * POST /api/v1/packages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      call_quota,
      call_limit,
      duration,
      duration_days,
      features,
      agent_access,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: '请填写套餐名称' },
        { status: 400 }
      );
    }

    const newPackage: Package = {
      id: `PKG-${Date.now()}`,
      name,
      price: parseFloat(price) || 0,
      call_quota: parseInt(call_quota) || 100000,
      call_limit: parseInt(call_limit) || 1000,
      duration: parseInt(duration) || 30,
      duration_days: parseInt(duration_days) || 30,
      features: features || [],
      agent_access: agent_access || [],
      user_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addPackage(newPackage);

    return NextResponse.json({
      success: true,
      message: '套餐创建成功',
      data: newPackage,
    });
  } catch (error) {
    console.error('创建套餐失败:', error);
    return NextResponse.json(
      { error: '创建套餐失败' },
      { status: 500 }
    );
  }
}
