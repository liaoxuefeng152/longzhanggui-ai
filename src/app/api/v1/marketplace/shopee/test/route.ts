/**
 * Shopee Connection Test Route
 * 
 * Tests the connection to Shopee API using stored credentials.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlatformByCode, updatePlatformByCode, Platform } from '@/lib/storage/database';
import { ShopeeClient, ShopeeCredentials, ShopeeApiError } from '@/lib/marketplace/shopee-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platformCode = body.platform_id || body.platform_code;
    
    if (!platformCode) {
      return NextResponse.json({
        success: false,
        error: '缺少 platform_code 参数',
      }, { status: 400 });
    }
    
    // Get platform configuration
    const platform = await getPlatformByCode(platformCode);
    
    if (!platform) {
      return NextResponse.json({
        success: false,
        error: '平台配置不存在',
      }, { status: 404 });
    }
    
    // Check required credentials
    if (!platform.partner_id || !platform.partner_key) {
      return NextResponse.json({
        success: false,
        error: '缺少必要凭证',
        missing_fields: ['partner_id', 'partner_key'].filter(f => !platform[f as keyof Platform]),
        hint: '请先配置 Partner ID 和 Partner Key',
      }, { status: 400 });
    }
    
    // Build credentials
    const credentials: ShopeeCredentials = {
      partner_id: platform.partner_id,
      partner_key: platform.partner_key,
      shop_id: platform.shop_id,
      access_token: platform.access_token,
      region: platform.region || 'SG',
    };
    
    // Create client
    const client = new ShopeeClient({
      credentials,
      sandbox: false,
    });
    
    // Test different scenarios based on available credentials
    
    // Scenario 1: Have access_token - test full API access
    if (credentials.access_token && credentials.shop_id) {
      try {
        const shopInfo = await client.getShopInfo();
        
        await updatePlatformByCode(platformCode, {
          shop_name: shopInfo.shop_name,
          shop_status: shopInfo.status,
          auth_status: 'authorized',
          last_auth_error: null,
        });
        
        return NextResponse.json({
          success: true,
          connected: true,
          shop_id: credentials.shop_id,
          shop_name: shopInfo.shop_name,
          shop_status: shopInfo.status,
          region: platform.region,
          message: '连接成功',
        });
      } catch (error) {
        if (error instanceof ShopeeApiError) {
          // Token might be expired
          if (error.code === 'invalid_access_token' || error.code === 'access_token_expired') {
            // Try refresh token
            if (platform.refresh_token) {
              try {
                const tokens = await client.refreshAccessToken(
                  platform.refresh_token,
                  credentials.shop_id
                );
                
                // Update tokens
                const now = new Date();
                await updatePlatformByCode(platformCode, {
                  access_token: tokens.access_token,
                  refresh_token: tokens.refresh_token,
                  token_expires_at: new Date(now.getTime() + tokens.expire_in * 1000).toISOString(),
                  auth_status: 'authorized',
                });
                
                // Retry with new token
                const newClient = new ShopeeClient({
                  credentials: {
                    ...credentials,
                    access_token: tokens.access_token,
                  },
                });
                
                const shopInfo = await newClient.getShopInfo();
                
                return NextResponse.json({
                  success: true,
                  connected: true,
                  shop_id: credentials.shop_id,
                  shop_name: shopInfo.shop_name,
                  shop_status: shopInfo.status,
                  message: 'Token已刷新，连接成功',
                  token_refreshed: true,
                });
              } catch (refreshError) {
                await updatePlatformByCode(platformCode, {
                  auth_status: 'expired',
                  last_auth_error: 'Token已过期，需要重新授权',
                });
                
                return NextResponse.json({
                  success: false,
                  connected: false,
                  error: 'access_token已过期，refresh_token刷新失败',
                  hint: '需要重新授权店铺',
                  auth_url: client.generateAuthUrl(`${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/v1/marketplace/shopee/callback`),
                });
              }
            } else {
              await updatePlatformByCode(platformCode, {
                auth_status: 'expired',
                last_auth_error: 'access_token已过期',
              });
              
              return NextResponse.json({
                success: false,
                connected: false,
                error: 'access_token已过期，没有refresh_token',
                hint: '需要重新授权店铺',
                auth_url: client.generateAuthUrl(`${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/v1/marketplace/shopee/callback`),
              });
            }
          }
          
          await updatePlatformByCode(platformCode, {
            auth_status: 'error',
            last_auth_error: `${error.code}: ${error.message}`,
          });
          
          return NextResponse.json({
            success: false,
            connected: false,
            error: error.message,
            error_code: error.code,
          });
        }
        
        throw error;
      }
    }
    
    // Scenario 2: Have shop_id but no access_token - need authorization
    if (credentials.shop_id && !credentials.access_token) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: '店铺已配置但未授权',
        shop_id: credentials.shop_id,
        hint: '需要完成店铺授权',
        auth_url: client.generateAuthUrl(`${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/v1/marketplace/shopee/callback`),
      });
    }
    
    // Scenario 3: No shop_id - just test partner credentials
    try {
      // Use public API to test partner credentials (no auth required)
      const region = credentials.region || 'SG';
      const host = ShopeeClient.getHost(region);
      
      // Simple ping test - call get_shopee_info (public endpoint)
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/api/v2/public/get_shopee_info';
      const sign = ShopeeClient.generateSign(timestamp, path, credentials.partner_id, credentials.partner_key, '');
      
      const url = `${host}${path}?partner_id=${credentials.partner_id}&timestamp=${timestamp}&sign=${sign}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        await updatePlatformByCode(platformCode, {
          auth_status: 'error',
          last_auth_error: `${data.error}: ${data.message || 'Partner凭证无效'}`,
        });
        
        return NextResponse.json({
          success: false,
          connected: false,
          error: 'Partner凭证验证失败',
          error_code: data.error,
          hint: '请检查 Partner ID 和 Partner Key 是否正确',
        });
      }
      
      await updatePlatformByCode(platformCode, {
        auth_status: 'pending',
        last_auth_error: null,
      });
      
      return NextResponse.json({
        success: true,
        connected: false,  // Connected to API but shop not authorized
        partner_valid: true,
        region: platform.region,
        shopee_info: data,
        hint: 'Partner凭证有效，需要授权店铺',
        auth_url: credentials.shop_id 
          ? client.generateAuthUrl(`${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/v1/marketplace/shopee/callback`)
          : null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Partner凭证测试失败';
      
      await updatePlatformByCode(platformCode, {
        auth_status: 'error',
        last_auth_error: message,
      });
      
      return NextResponse.json({
        success: false,
        connected: false,
        error: message,
        hint: '请检查 Partner ID 和 Partner Key 是否正确',
      });
    }
  } catch (error) {
    console.error('Shopee test connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '测试连接失败',
    }, { status: 500 });
  }
}

// Type for platform with all fields
interface Platform {
  id: string;
  platform_code: string;
  partner_id?: string;
  partner_key?: string;
  shop_id?: string;
  access_token?: string;
  refresh_token?: string;
  region?: string;
  auth_status?: string;
}