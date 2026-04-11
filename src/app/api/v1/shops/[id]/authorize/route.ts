import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

// 店铺授权
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { store_id } = body;

    const shops = globalStore.shops || [];
    const index = shops.findIndex((s: any) => s.id === id);

    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: '店铺不存在',
      }, { status: 404 });
    }

    const shop = shops[index];
    
    // 检查平台是否已配置凭证
    const platformCredentials = (globalStore as any).platformCredentials?.[shop.platform];
    if (!platformCredentials?.api_key || !platformCredentials?.api_secret) {
      return NextResponse.json({
        success: false,
        error: '该平台尚未配置 API 凭证，请联系管理员',
      }, { status: 400 });
    }

    // 模拟OAuth授权流程（实际应该跳转到平台授权页面）
    // 这里简化处理，直接标记为已授权
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 更新店铺授权状态
    shops[index] = {
      ...shop,
      authorization_status: 'authorized',
      store_id: store_id || `store_${Date.now()}`,
      credentials: {
        access_token: `token_${Date.now()}`,
        refresh_token: `refresh_${Date.now()}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
      },
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    globalStore.shops = shops;

    // 记录操作日志
    globalStore.operationLogs?.push({
      id: `log_${Date.now()}`,
      action: 'authorize_shop',
      target: id,
      target_name: shop.name,
      operator: 'system',
      result: 'success',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        shop: shops[index],
        message: '店铺授权成功',
        redirect_url: null, // 实际应该返回平台授权跳转URL
      },
    });
  } catch (error) {
    console.error('店铺授权失败:', error);
    return NextResponse.json({
      success: false,
      error: '店铺授权失败',
    }, { status: 500 });
  }
}
