import { NextRequest, NextResponse } from 'next/server';
import { getPlatforms, getPlatformByCode, updatePlatformCredentials, updatePlatformTokens, updatePlatformAuthStatus, Platform } from '@/lib/storage/database';

// GET /api/v1/platforms - Get all platforms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platformCode = searchParams.get('platform_code');
    
    if (platformCode) {
      const platform = await getPlatformByCode(platformCode);
      if (!platform) {
        return NextResponse.json({ error: '平台不存在' }, { status: 404 });
      }
      // Mask sensitive fields for display
      const maskedPlatform = {
        ...platform,
        partner_key: platform.partner_key ? '******' : null,
        access_token: platform.access_token ? '******' : null,
        refresh_token: platform.refresh_token ? '******' : null,
      };
      return NextResponse.json({ success: true, platform: maskedPlatform });
    }
    
    const platforms = await getPlatforms();
    // Mask sensitive fields for all platforms
    const maskedPlatforms = platforms.map(p => ({
      ...p,
      partner_key: p.partner_key ? '******' : null,
      access_token: p.access_token ? '******' : null,
      refresh_token: p.refresh_token ? '******' : null,
    }));
    return NextResponse.json({ success: true, platforms: maskedPlatforms });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '查询平台失败' 
    }, { status: 500 });
  }
}

// POST /api/v1/platforms - Update platform credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform_code, partner_id, partner_key, shop_id, shop_name } = body;
    
    if (!platform_code) {
      return NextResponse.json({ error: '缺少 platform_code' }, { status: 400 });
    }
    
    const existingPlatform = await getPlatformByCode(platform_code);
    if (!existingPlatform) {
      return NextResponse.json({ error: '平台不存在，请先在数据库中创建' }, { status: 404 });
    }
    
    const updated = await updatePlatformCredentials(platform_code, {
      partner_id,
      partner_key,
      shop_id,
      shop_name,
    });
    
    return NextResponse.json({ 
      success: true, 
      platform: {
        ...updated,
        partner_key: '******', // Mask in response
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '更新平台凭证失败' 
    }, { status: 500 });
  }
}

// PUT /api/v1/platforms - Update tokens after authorization
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform_code, access_token, refresh_token, token_expires_at, refresh_expires_at } = body;
    
    if (!platform_code || !access_token || !refresh_token) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    const updated = await updatePlatformTokens(platform_code, {
      access_token,
      refresh_token,
      token_expires_at,
      refresh_expires_at,
      authorized_at: new Date().toISOString(),
    });
    
    return NextResponse.json({ 
      success: true,
      platform: {
        ...updated,
        access_token: '******',
        refresh_token: '******',
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '更新Token失败' 
    }, { status: 500 });
  }
}