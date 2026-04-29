import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

// 获取所有平台配置
export async function GET() {
  try {
    const platforms = store.getPlatforms();
    return NextResponse.json({
      success: true,
      data: {
        platforms: platforms,
      },
    });
  } catch (error) {
    console.error('Error getting platforms:', error);
    return NextResponse.json(
      { success: false, error: '获取平台配置失败' },
      { status: 500 }
    );
  }
}

// 创建或更新平台配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, platform_id, name, credentials, config } = body;

    // 支持 platform 或 platform_id 参数
    const platformId = platform_id || platform;
    
    if (!platformId) {
      return NextResponse.json(
        { success: false, error: '缺少平台ID参数' },
        { status: 400 }
      );
    }

    // 从 PLATFORMS 获取平台名称，或使用传入的名称
    const platformName = name || `平台 ${platformId}`;

    // 构建配置对象
    const platformConfig = {
      ...(config || {}),
      ...(credentials ? {
        api_key: credentials.api_key,
        api_secret: credentials.api_secret,
        webhook_secret: credentials.webhook_secret,
      } : {}),
    };

    const updated = store.updatePlatform(platformId, {
      name: platformName,
      config: platformConfig,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating platform:', error);
    return NextResponse.json(
      { success: false, error: '更新平台配置失败' },
      { status: 500 }
    );
  }
}
