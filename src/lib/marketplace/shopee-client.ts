/**
 * Shopee Open Platform API Client
 * 
 * Implements HMAC-SHA256 signing, token management, and core API calls
 * for Shopee Open Platform v2 APIs.
 * 
 * Reference: https://open.shopee.com/documents
 */

import crypto from 'crypto';

// Shopee region endpoints
const SHOPEE_ENDPOINTS: Record<string, string> = {
  SG: 'https://partner.shopeemobile.com',  // Singapore
  MY: 'https://partner.shopeemobile.com',  // Malaysia
  TH: 'https://partner.shopeemobile.com',  // Thailand  
  ID: 'https://partner.shopeemobile.com',  // Indonesia
  VN: 'https://partner.shopeemobile.com',  // Vietnam
  PH: 'https://partner.shopeemobile.com',  // Philippines
  TW: 'https://partner.shopee.tw',          // Taiwan
};

// Shopee authorization URLs
const SHOPEE_AUTH_URLS: Record<string, string> = {
  SG: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
  MY: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
  TH: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
  ID: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
  VN: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
  PH: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
  TW: 'https://partner.shopee.tw/api/v2/shop/auth_partner',
};

export interface ShopeeCredentials {
  partner_id: string;
  partner_key: string;
  shop_id?: string;
  access_token?: string;
  refresh_token?: string;
  region: string;
}

export interface ShopeeConfig {
  credentials: ShopeeCredentials;
  sandbox?: boolean;  // Use sandbox environment
}

export interface ShopeeResponse<T> {
  error: string;
  message: string;
  request_id: string;
  data?: T;
}

/**
 * Generate HMAC-SHA256 signature for Shopee API
 * 
 * Signature = HMAC-SHA256(partner_key, partner_id + path + timestamp + access_token + shop_id + body)
 */
function generateSignature(
  partnerKey: string,
  partnerId: string,
  path: string,
  timestamp: number,
  accessToken?: string,
  shopId?: string,
  body?: string
): string {
  // Build the base string for signing
  let baseString = `${partnerId}${path}${timestamp}`;
  
  // Add access_token if provided (for authenticated APIs)
  if (accessToken) {
    baseString += accessToken;
  }
  
  // Add shop_id if provided
  if (shopId) {
    baseString += shopId;
  }
  
  // Add request body for POST requests
  if (body) {
    baseString += body;
  }
  
  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', partnerKey)
    .update(baseString)
    .digest('hex');
  
  return signature;
}

/**
 * Shopee API Client Class
 */
export class ShopeeClient {
  private credentials: ShopeeCredentials;
  private sandbox: boolean;
  private baseUrl: string;
  
  constructor(config: ShopeeConfig) {
    this.credentials = config.credentials;
    this.sandbox = config.sandbox || false;
    this.baseUrl = SHOPEE_ENDPOINTS[this.credentials.region] || SHOPEE_ENDPOINTS.SG;
    
    if (this.sandbox) {
      this.baseUrl = this.baseUrl.replace('partner.', 'partner.test.');
    }
  }
  
  /**
   * Make API request to Shopee
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    params: Record<string, any> = {},
    body?: any,
    requireAuth: boolean = true
  ): Promise<ShopeeResponse<T>> {
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = this.credentials.partner_id;
    const partnerKey = this.credentials.partner_key;
    const accessToken = this.credentials.access_token;
    const shopId = this.credentials.shop_id;
    
    // Generate signature
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = generateSignature(
      partnerKey,
      partnerId,
      path,
      timestamp,
      requireAuth ? accessToken : undefined,
      requireAuth ? shopId : undefined,
      method === 'POST' ? bodyStr : undefined
    );
    
    // Build URL with common parameters
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.append('partner_id', partnerId);
    url.searchParams.append('timestamp', timestamp.toString());
    url.searchParams.append('sign', signature);
    
    if (requireAuth) {
      if (accessToken) {
        url.searchParams.append('access_token', accessToken);
      }
      if (shopId) {
        url.searchParams.append('shop_id', shopId);
      }
    }
    
    // Add additional params
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
    
    // Make request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json() as ShopeeResponse<T>;
    
    // Check for errors
    if (data.error && data.error !== '0') {
      throw new ShopeeApiError(data.error, data.message || 'API调用失败', data.request_id);
    }
    
    return data;
  }
  
  /**
   * Generate authorization URL for shop authorization
   */
  generateAuthUrl(redirectUrl: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/shop/auth_partner';
    const partnerId = this.credentials.partner_id;
    const partnerKey = this.credentials.partner_key;
    
    // Generate signature for auth URL (no access_token, no shop_id, no body)
    const signature = generateSignature(partnerKey, partnerId, path, timestamp);
    
    const authUrl = new URL(`${this.baseUrl}${path}`);
    authUrl.searchParams.append('id', partnerId);
    authUrl.searchParams.append('token', signature);
    authUrl.searchParams.append('redirect', redirectUrl);
    
    return authUrl.toString();
  }
  
  /**
   * Exchange authorization code for access token
   * 
   * Called after user authorizes the shop, receives code in redirect URL
   */
  async getAccessToken(code: string, shopId: string): Promise<{
    access_token: string;
    refresh_token: string;
    expire_in: number;
    request_id: string;
  }> {
    const path = '/api/v2/auth/token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = this.credentials.partner_id;
    const partnerKey = this.credentials.partner_key;
    
    const body = {
      code,
      shop_id: parseInt(shopId),
      partner_id: parseInt(partnerId),
    };
    
    // Generate signature (no access_token needed for token exchange)
    const signature = generateSignature(
      partnerKey,
      partnerId,
      path,
      timestamp,
      undefined,
      undefined,
      JSON.stringify(body)
    );
    
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.append('partner_id', partnerId);
    url.searchParams.append('timestamp', timestamp.toString());
    url.searchParams.append('sign', signature);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (data.error && data.error !== '0') {
      throw new ShopeeApiError(data.error, data.message || '获取Token失败', data.request_id);
    }
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
      request_id: data.request_id,
    };
  }
  
  /**
   * Refresh access token using refresh_token
   */
  async refreshAccessToken(refreshToken: string, shopId: string): Promise<{
    access_token: string;
    refresh_token: string;
    expire_in: number;
    request_id: string;
  }> {
    const path = '/api/v2/auth/access_token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    const partnerId = this.credentials.partner_id;
    const partnerKey = this.credentials.partner_key;
    
    const body = {
      refresh_token: refreshToken,
      shop_id: parseInt(shopId),
      partner_id: parseInt(partnerId),
    };
    
    const signature = generateSignature(
      partnerKey,
      partnerId,
      path,
      timestamp,
      undefined,
      undefined,
      JSON.stringify(body)
    );
    
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.append('partner_id', partnerId);
    url.searchParams.append('timestamp', timestamp.toString());
    url.searchParams.append('sign', signature);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (data.error && data.error !== '0') {
      throw new ShopeeApiError(data.error, data.message || '刷新Token失败', data.request_id);
    }
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
      request_id: data.request_id,
    };
  }
  
  /**
   * Get shop info - Test API connection
   */
  async getShopInfo(): Promise<{
    shop_name: string;
    shop_id: string;
    region: string;
    status: string;
  }> {
    const response = await this.request<{ shop_name: string; shop_id: string; region: string; status: string }>(
      'GET',
      '/api/v2/shop/get_shop_info'
    );
    
    return response.data!;
  }
  
  /**
   * Add item (publish product) to Shopee
   */
  async addItem(product: {
    original_price: number;
    description: string;
    weight: number;
    item_name: string;
    item_status?: string;
    category_id?: number;
    image?: { image_url: string }[];
    stock?: number;
    brand?: { brand_id: number };
    logistics?: any[];
    attribute?: { attribute_id: number; attribute_value: string }[];
  }): Promise<{
    item_id: number;
    request_id: string;
  }> {
    const response = await this.request<{ item_id: number }>(
      'POST',
      '/api/v2/product/add_item',
      {},
      {
        original_price: product.original_price,
        description: product.description,
        weight: product.weight,
        item_name: product.item_name,
        item_status: product.item_status || 'NORMAL',
        category_id: product.category_id,
        image: product.image,
        stock: product.stock || 0,
        brand: product.brand,
        logistics: product.logistics,
        attribute: product.attribute,
      }
    );
    
    return {
      item_id: response.data!.item_id,
      request_id: response.request_id,
    };
  }
  
  /**
   * Update item
   */
  async updateItem(itemId: number, updates: Partial<{
    original_price: number;
    description: string;
    weight: number;
    item_name: string;
    item_status: string;
    stock: number;
    image: { image_url: string }[];
  }>): Promise<{ request_id: string }> {
    const response = await this.request(
      'POST',
      '/api/v2/product/update_item',
      {},
      {
        item_id: itemId,
        ...updates,
      }
    );
    
    return { request_id: response.request_id };
  }
  
  /**
   * Get item list
   */
  async getItemList(
    page: number = 1,
    pageSize: number = 20,
    itemStatus?: string
  ): Promise<{
    items: { item_id: number; item_status: string }[];
    total_count: number;
    request_id: string;
  }> {
    const params: Record<string, any> = {
      page_number: page,
      page_size: pageSize,
    };
    
    if (itemStatus) {
      params.item_status = itemStatus;
    }
    
    const response = await this.request<{
      items: { item_id: number; item_status: string }[];
      total_count: number;
    }>('GET', '/api/v2/product/get_item_list', params);
    
    return {
      items: response.data!.items,
      total_count: response.data!.total_count,
      request_id: response.request_id,
    };
  }
  
  /**
   * Get order list
   */
  async getOrderList(
    timeFrom: number,
    timeTo: number,
    page: number = 1,
    pageSize: number = 20,
    orderStatus?: string
  ): Promise<{
    order_list: { order_sn: string; order_status: string }[];
    request_id: string;
  }> {
    const params: Record<string, any> = {
      time_range_field: 'create_time',
      time_from: timeFrom,
      time_to: timeTo,
      page_number: page,
      page_size: pageSize,
    };
    
    if (orderStatus) {
      params.order_status = orderStatus;
    }
    
    const response = await this.request<{
      order_list: { order_sn: string; order_status: string }[];
    }>('GET', '/api/v2/order/get_order_list', params);
    
    return {
      order_list: response.data!.order_list,
      request_id: response.request_id,
    };
  }
  
  /**
   * Update stock
   */
  async updateStock(itemId: number, stock: number): Promise<{ request_id: string }> {
    const response = await this.request(
      'POST',
      '/api/v2/product/update_stock',
      {},
      {
        item_id: itemId,
        stock_list: [{ stock }],
      }
    );
    
    return { request_id: response.request_id };
  }
  
  /**
   * Get category list (for selecting product category)
   * Note: This is a public API, doesn't require auth
   */
  async getCategoryList(language: string = 'en'): Promise<{
    categories: { category_id: number; category_name: string; parent_id: number }[];
    request_id: string;
  }> {
    const response = await this.request<{
      categories: { category_id: number; category_name: string; parent_id: number }[];
    }>(
      'GET',
      '/api/v2/product/get_category',
      { language },
      undefined,
      false  // Public API, no auth required
    );
    
    return {
      categories: response.data!.categories,
      request_id: response.request_id,
    };
  }
}

/**
 * Shopee API Error class
 */
export class ShopeeApiError extends Error {
  public code: string;
  public requestId: string;
  
  constructor(code: string, message: string, requestId: string) {
    super(message);
    this.code = code;
    this.requestId = requestId;
    this.name = 'ShopeeApiError';
  }
}

/**
 * Helper function to create Shopee client from database config
 */
export async function createShopeeClientFromPlatform(platform: ShopeeCredentials, sandbox?: boolean): ShopeeClient {
  return new ShopeeClient({
    credentials: platform,
    sandbox: sandbox ?? process.env.NODE_ENV !== 'production',
  });
}