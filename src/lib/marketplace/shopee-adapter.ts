/**
 * Shopee Business Adapter
 * 
 * High-level business operations for Shopee integration.
 * Wraps the ShopeeClient with business logic and local data sync.
 */

import { ShopeeClient, ShopeeCredentials, ShopeeApiError, createShopeeClientFromPlatform } from './shopee-client';
import { updatePlatform, getPlatform, Platform } from '@/lib/storage/database';

export interface ShopeeAdapterConfig {
  credentials: ShopeeCredentials;
  platformId: string;  // Database platform ID
  sandbox?: boolean;
}

/**
 * Shopee Business Adapter
 * 
 * Provides high-level operations:
 * - OAuth flow (generate auth URL, handle callback)
 * - Publish products to Shopee
 * - Sync orders
 * - Update inventory
 * - Check connection status
 */
export class ShopeeAdapter {
  private client: ShopeeClient;
  private platformId: string;
  private credentials: ShopeeCredentials;
  
  constructor(config: ShopeeAdapterConfig) {
    this.client = new ShopeeClient({
      credentials: config.credentials,
      sandbox: config.sandbox,
    });
    this.platformId = config.platformId;
    this.credentials = config.credentials;
  }
  
  /**
   * Generate authorization URL for shop owner to authorize
   * 
   * Usage: Redirect shop owner to this URL, they will login to Shopee Seller Center
   * and authorize your app. After authorization, they will be redirected back to
   * your redirect URL with a `code` parameter.
   */
  generateAuthorizationUrl(redirectUrl: string): string {
    return this.client.generateAuthUrl(redirectUrl);
  }
  
  /**
   * Complete OAuth flow after authorization callback
   * 
   * Called when shop owner authorizes and is redirected back with a code.
   * Exchanges the code for access_token and refresh_token, then saves to database.
   */
  async completeAuthorization(code: string, shopId: string): Promise<{
    success: boolean;
    shop_name?: string;
    error?: string;
  }> {
    try {
      // Exchange code for tokens
      const tokens = await this.client.getAccessToken(code, shopId);
      
      // Update credentials with new tokens
      this.credentials.access_token = tokens.access_token;
      this.credentials.refresh_token = tokens.refresh_token;
      
      // Recreate client with new tokens
      this.client = new ShopeeClient({
        credentials: this.credentials,
      });
      
      // Get shop info to verify connection
      const shopInfo = await this.client.getShopInfo();
      
      // Calculate expiration times
      const now = new Date();
      const tokenExpiresAt = new Date(now.getTime() + tokens.expire_in * 1000);
      const refreshExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);  // 30 days
      
      // Save tokens to database
      await updatePlatform(this.platformId, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokenExpiresAt.toISOString(),
        refresh_expires_at: refreshExpiresAt.toISOString(),
        authorized_at: now.toISOString(),
        shop_name: shopInfo.shop_name,
        shop_status: shopInfo.status,
        auth_status: 'authorized',
        shop_id: shopId,
      });
      
      return {
        success: true,
        shop_name: shopInfo.shop_name,
      };
    } catch (error) {
      const message = error instanceof ShopeeApiError 
        ? `${error.code}: ${error.message}` 
        : error instanceof Error ? error.message : '授权失败';
      
      // Update platform with error
      await updatePlatform(this.platformId, {
        auth_status: 'error',
        last_auth_error: message,
      });
      
      return {
        success: false,
        error: message,
      };
    }
  }
  
  /**
   * Test connection to Shopee
   * 
   * Verifies that the access_token is valid by calling get_shop_info.
   */
  async testConnection(): Promise<{
    connected: boolean;
    shop_name?: string;
    shop_status?: string;
    error?: string;
  }> {
    try {
      // Check if token is expired
      const platform = await getPlatform(this.platformId);
      if (!platform) {
        return { connected: false, error: '平台配置不存在' };
      }
      
      if (platform.token_expires_at) {
        const expiresAt = new Date(platform.token_expires_at);
        if (expiresAt < new Date()) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (!refreshed.success) {
            return { connected: false, error: 'Token已过期，刷新失败' };
          }
        }
      }
      
      // Test API call
      const shopInfo = await this.client.getShopInfo();
      
      // Update platform status
      await updatePlatform(this.platformId, {
        shop_name: shopInfo.shop_name,
        shop_status: shopInfo.status,
        auth_status: 'authorized',
        last_auth_error: null,
      });
      
      return {
        connected: true,
        shop_name: shopInfo.shop_name,
        shop_status: shopInfo.status,
      };
    } catch (error) {
      const message = error instanceof ShopeeApiError 
        ? `${error.code}: ${error.message}` 
        : error instanceof Error ? error.message : '连接测试失败';
      
      // Update platform with error
      await updatePlatform(this.platformId, {
        auth_status: 'error',
        last_auth_error: message,
      });
      
      return {
        connected: false,
        error: message,
      };
    }
  }
  
  /**
   * Refresh access token using refresh_token
   */
  async refreshToken(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const platform = await getPlatform(this.platformId);
      if (!platform?.refresh_token) {
        return { success: false, error: '没有refresh_token' };
      }
      
      // Check if refresh_token is expired
      if (platform.refresh_expires_at) {
        const expiresAt = new Date(platform.refresh_expires_at);
        if (expiresAt < new Date()) {
          return { success: false, error: 'refresh_token已过期，需要重新授权' };
        }
      }
      
      // Refresh token
      const tokens = await this.client.refreshAccessToken(
        platform.refresh_token,
        platform.shop_id || this.credentials.shop_id!
      );
      
      // Update credentials
      this.credentials.access_token = tokens.access_token;
      this.credentials.refresh_token = tokens.refresh_token;
      
      // Recreate client
      this.client = new ShopeeClient({
        credentials: this.credentials,
      });
      
      // Save new tokens
      const now = new Date();
      await updatePlatform(this.platformId, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(now.getTime() + tokens.expire_in * 1000).toISOString(),
        refresh_expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        auth_status: 'authorized',
        last_auth_error: null,
      });
      
      return { success: true };
    } catch (error) {
      const message = error instanceof ShopeeApiError 
        ? `${error.code}: ${error.message}` 
        : error instanceof Error ? error.message : '刷新Token失败';
      
      await updatePlatform(this.platformId, {
        auth_status: 'error',
        last_auth_error: message,
      });
      
      return { success: false, error: message };
    }
  }
  
  /**
   * Publish a product to Shopee
   * 
   * Maps local product format to Shopee API format and calls add_item.
   */
  async publishProduct(product: {
    name: string;
    description: string;
    price: number;
    stock: number;
    weight: number;
    category_id?: number;
    images?: string[];
    attributes?: Record<string, string>;
  }): Promise<{
    success: boolean;
    item_id?: number;
    error?: string;
  }> {
    try {
      // Map to Shopee format
      const shopeeProduct = {
        item_name: product.name,
        description: product.description,
        original_price: product.price,
        weight: product.weight,
        stock: product.stock,
        category_id: product.category_id,
        item_status: 'NORMAL',
        image: product.images?.map(url => ({ image_url: url })),
        attribute: product.attributes 
          ? Object.entries(product.attributes).map(([id, value]) => ({
              attribute_id: parseInt(id),
              attribute_value: value,
            }))
          : undefined,
      };
      
      const result = await this.client.addItem(shopeeProduct);
      
      // Update sync time
      await updatePlatform(this.platformId, {
        last_product_sync: new Date().toISOString(),
      });
      
      return {
        success: true,
        item_id: result.item_id,
      };
    } catch (error) {
      const message = error instanceof ShopeeApiError 
        ? `${error.code}: ${error.message}` 
        : error instanceof Error ? error.message : '发布商品失败';
      
      return {
        success: false,
        error: message,
      };
    }
  }
  
  /**
   * Sync orders from Shopee
   * 
   * Pulls orders from Shopee API for a given time range.
   */
  async syncOrders(
    days: number = 7
  ): Promise<{
    success: boolean;
    orders?: { order_sn: string; order_status: string }[];
    total?: number;
    error?: string;
  }> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const from = now - days * 24 * 60 * 60;
      
      const result = await this.client.getOrderList(from, now, 1, 100);
      
      // Update sync time
      await updatePlatform(this.platformId, {
        last_order_sync: new Date().toISOString(),
      });
      
      return {
        success: true,
        orders: result.order_list,
        total: result.order_list.length,
      };
    } catch (error) {
      const message = error instanceof ShopeeApiError 
        ? `${error.code}: ${error.message}` 
        : error instanceof Error ? error.message : '同步订单失败';
      
      return {
        success: false,
        error: message,
      };
    }
  }
  
  /**
   * Update product stock
   */
  async updateStock(itemId: number, stock: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await this.client.updateStock(itemId, stock);
      
      await updatePlatform(this.platformId, {
        last_inventory_sync: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error) {
      const message = error instanceof ShopeeApiError 
        ? `${error.code}: ${error.message}` 
        : error instanceof Error ? error.message : '更新库存失败';
      
      return {
        success: false,
        error: message,
      };
    }
  }
  
  /**
   * Get available categories for the shop
   */
  async getCategories(): Promise<{
    success: boolean;
    categories?: { category_id: number; category_name: string; parent_id: number }[];
    error?: string;
  }> {
    try {
      const result = await this.client.getCategoryList();
      
      return {
        success: true,
        categories: result.categories,
      };
    } catch (error) {
      const message = error instanceof ShopeeApiError 
        ? `${error.code}: ${error.message}` 
        : error instanceof Error ? error.message : '获取类目失败';
      
      return {
        success: false,
        error: message,
      };
    }
  }
}

/**
 * Create Shopee adapter from platform database record
 */
export async function createShopeeAdapter(platform: Platform): ShopeeAdapter {
  const credentials: ShopeeCredentials = {
    partner_id: platform.partner_id || '',
    partner_key: platform.partner_key || '',
    shop_id: platform.shop_id,
    access_token: platform.access_token,
    refresh_token: platform.refresh_token,
    region: platform.region || 'SG',
  };
  
  return new ShopeeAdapter({
    credentials,
    platformId: platform.id,
    sandbox: false,  // Use production
  });
}