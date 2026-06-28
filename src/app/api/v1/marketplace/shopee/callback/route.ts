/**
 * Shopee OAuth Callback Route
 * 
 * Handles the redirect after shop owner authorizes the app.
 * Receives `code` and `shop_id` parameters, exchanges for access_token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlatform, updatePlatform, getPlatforms } from '@/lib/storage/database';
import { ShopeeClient, ShopeeCredentials } from '@/lib/marketplace/shopee-client';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const shopId = request.nextUrl.searchParams.get('shop_id');
    
    if (!code || !shopId) {
      return NextResponse.json({
        success: false,
        error: '缺少授权参数',
        message: '授权回调需要 code 和 shop_id 参数',
      }, { status: 400 });
    }
    
    // Find the platform configuration that matches this shop_id
    const platforms = await getPlatforms();
    const platform = platforms.find(p => p.shop_id === shopId || p.platform_code?.includes('shopee'));
    
    if (!platform) {
      return NextResponse.json({
        success: false,
        error: '未找到对应平台配置',
        message: `shop_id=${shopId} 没有匹配的平台配置`,
      }, { status: 404 });
    }
    
    // Create Shopee client with existing credentials
    const credentials: ShopeeCredentials = {
      partner_id: platform.partner_id || '',
      partner_key: platform.partner_key || '',
      shop_id: shopId,
      region: platform.region || 'SG',
    };
    
    const client = new ShopeeClient({
      credentials,
      sandbox: false,
    });
    
    // Exchange code for tokens
    const tokens = await client.getAccessToken(code, shopId);
    
    // Calculate expiration times
    const now = new Date();
    const tokenExpiresAt = new Date(now.getTime() + tokens.expire_in * 1000);
    const refreshExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);  // 30 days
    
    // Update platform with tokens
    await updatePlatform(platform.id, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokenExpiresAt.toISOString(),
      refresh_expires_at: refreshExpiresAt.toISOString(),
      authorized_at: now.toISOString(),
      shop_id: shopId,
      auth_status: 'authorized',
      last_auth_error: null,
    });
    
    // Get shop info to verify
    const updatedCredentials = {
      ...credentials,
      access_token: tokens.access_token,
    };
    
    const updatedClient = new ShopeeClient({
      credentials: updatedCredentials,
    });
    
    let shopInfo = null;
    try {
      shopInfo = await updatedClient.getShopInfo();
      
      // Update shop name and status
      await updatePlatform(platform.id, {
        shop_name: shopInfo.shop_name,
        shop_status: shopInfo.status,
      });
    } catch (e) {
      // Ignore get_shop_info error, tokens are valid
    }
    
    // Return success with redirect to platform management page
    const redirectUrl = new URL('/shops/platforms', request.url);
    redirectUrl.searchParams.append('authorized', 'success');
    redirectUrl.searchParams.append('platform', platform.id);
    redirectUrl.searchParams.append('shop_name', shopInfo?.shop_name || '');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Shopee OAuth callback error:', error);
    
    const message = error instanceof Error ? error.message : '授权失败';
    
    // Redirect to error page
    const redirectUrl = new URL('/shops/platforms', request.url);
    redirectUrl.searchParams.append('authorized', 'failed');
    redirectUrl.searchParams.append('error', message);
    
    return NextResponse.redirect(redirectUrl);
  }
}