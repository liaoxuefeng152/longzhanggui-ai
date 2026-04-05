/**
 * 平台绑定API路由
 * GET: 获取平台绑定列表
 * POST: 创建平台绑定
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPlatformBindings,
  createPlatformBinding as createBinding,
  getPlatformBindingsPaginated,
} from '@/lib/data/platform-bindings-store';

/**
 * GET /api/platform-bindings
 * 获取平台绑定列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get('page');
    const pageSize = searchParams.get('page_size');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    // 如果有分页参数，使用分页查询
    if (page || pageSize || platform || status) {
      const result = getPlatformBindingsPaginated({
        page: page ? parseInt(page, 10) : undefined,
        page_size: pageSize ? parseInt(pageSize, 10) : undefined,
        platform: platform || undefined,
        status: status || undefined,
      });
      return NextResponse.json(result);
    }

    // 否则返回所有绑定
    const bindings = getAllPlatformBindings();
    return NextResponse.json({
      bindings,
      total: bindings.length,
      page: 1,
      page_size: bindings.length,
    });
  } catch (error) {
    console.error('获取平台绑定列表失败:', error);
    return NextResponse.json(
      { error: '获取平台绑定列表失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform-bindings
 * 创建平台绑定
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { platform, account_name, shop_id, region, api_key, api_secret, auth_type } = body;

    // 验证必填字段
    if (!platform || !account_name || !shop_id || !api_key) {
      return NextResponse.json(
        { error: '请填写必填项', message: 'platform、account_name、shop_id、api_key 为必填项' },
        { status: 400 }
      );
    }

    // 创建平台绑定
    const binding = createBinding({
      platform,
      account_name,
      shop_id,
      region: region || '',
      api_key,
      api_secret: api_secret || '',
      auth_type: auth_type || 'API授权',
    });

    return NextResponse.json(binding, { status: 201 });
  } catch (error) {
    console.error('创建平台绑定失败:', error);
    return NextResponse.json(
      { error: '创建平台绑定失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
