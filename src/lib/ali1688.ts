/**
 * 1688 API 客户端
 * 对接阿里巴巴1688开放平台 - 分销商品详情接口
 * 签名算法: HMAC-SHA1（已验证可用）
 */

import crypto from 'crypto';

// 1688 API 配置 - 缓存动态配置
let _cachedConfig: {
  appKey: string;
  appSecret: string;
  accessToken: string;
  apiBaseUrl: string;
  fetchedAt: number;
} | null = null;

const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取1688 API配置
 * 优先从平台配置API读取，环境变量作为fallback
 */
async function getAli1688Config(): Promise<{
  appKey: string;
  appSecret: string;
  accessToken: string;
  apiBaseUrl: string;
}> {
  // 检查缓存
  if (_cachedConfig && Date.now() - _cachedConfig.fetchedAt < CONFIG_CACHE_TTL) {
    return _cachedConfig;
  }

  // 尝试从平台配置API获取
  try {
    const baseUrl = process.env.DEPLOY_RUN_PORT 
      ? `http://localhost:${process.env.DEPLOY_RUN_PORT}` 
      : 'http://localhost:5000';
    const resp = await fetch(`${baseUrl}/api/v1/platforms`, {
      cache: 'no-store',
    });
    if (resp.ok) {
      const data = await resp.json();
      const platforms = data.data || data.platforms || [];
      const platform = platforms.find((p: any) => p.id === '1688' || p.platform === '1688');
      if (platform?.credentials?.api_key && platform?.credentials?.api_secret) {
        _cachedConfig = {
          appKey: platform.credentials.api_key,
          appSecret: platform.credentials.api_secret,
          accessToken: platform.credentials.access_token || process.env.ALI_1688_ACCESS_TOKEN || '',
          apiBaseUrl: 'https://gw.open.1688.com/openapi',
          fetchedAt: Date.now(),
        };
        return _cachedConfig;
      }
    }
  } catch {
    // 平台配置API不可用，使用环境变量fallback
  }

  // Fallback: 环境变量
  const envConfig = {
    appKey: process.env.ALI_1688_APP_KEY || '',
    appSecret: process.env.ALI_1688_APP_SECRET || '',
    accessToken: process.env.ALI_1688_ACCESS_TOKEN || '',
    apiBaseUrl: 'https://gw.open.1688.com/openapi' as const,
  };
  
  _cachedConfig = { ...envConfig, fetchedAt: Date.now() };
  return _cachedConfig;
}

/**
 * 清除配置缓存（配置更新后调用）
 */
export function clearAli1688ConfigCache() {
  _cachedConfig = null;
}

/**
 * 生成 1688 API HMAC-SHA1 签名
 * 
 * 签名串格式: apiPath + appKey + key1value1 + key2value2 + ...
 * 签名方法: hmac-sha1(appSecret, signStr).hexdigest().upper()
 */
function generateHmacSha1Sign(
  apiPath: string,
  appKey: string,
  params: Record<string, string>,
  appSecret: string
): string {
  // 1. 构建签名串: apiPath + appKey + 按key字母排序的参数键值对
  const sortedKeys = Object.keys(params).sort();
  const paramStr = sortedKeys.map((key) => `${key}${params[key]}`).join('');
  const signStr = `${apiPath}/${appKey}${paramStr}`;

  // 2. HMAC-SHA1 签名
  const signature = crypto
    .createHmac('sha1', appSecret)
    .update(signStr, 'utf8')
    .digest('hex')
    .toUpperCase();

  return signature;
}

/**
 * 调用1688分销商品详情API
 * API: alibaba.fenxiao.productInfo.get
 */
async function getFenxiaoProductInfo(offerId: string): Promise<any> {
  const config = await getAli1688Config();
  
  if (!config.appKey || !config.appSecret) {
    throw new Error('请先配置1688 API凭证（AppKey / AppSecret），在平台配置中填写');
  }

  if (!config.accessToken) {
    throw new Error('请先配置1688 Access Token，在平台配置中填写');
  }

  // API路径定义
  const apiNamespace = 'com.alibaba.fenxiao';
  const apiName = 'alibaba.fenxiao.productInfo.get';
  const apiVersion = '1';
  const apiPath = `param2/${apiVersion}/${apiNamespace}/${apiName}`;

  // 业务参数（按key字母排序用于签名）
  const bizParams: Record<string, string> = {
    access_token: config.accessToken,
    offerId: offerId,
  };

  // 生成签名
  const sign = generateHmacSha1Sign(
    apiPath,
    config.appKey,
    bizParams,
    config.appSecret
  );

  // 构建请求URL
  const queryString = Object.entries(bizParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  const requestUrl = `${config.apiBaseUrl}/${apiPath}/${config.appKey}?${queryString}&_aop_signature=${sign}`;

  console.log('[1688 API] 采集商品:', offerId);
  console.log('[1688 API] 签名串:', `${apiPath}${config.appKey}access_token***offerId${offerId}`);
  console.log('[1688 API] 签名:', sign);

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`1688 API HTTP错误: ${response.status}`);
  }

  const data = await response.json();
  console.log('[1688 API] 响应:', JSON.stringify(data).substring(0, 300));

  // 检查1688 API业务错误码
  const errorCode = data?.error_code || data?.errorCode || '';
  const errorMsg = data?.error_message || data?.errorMessage || data?.message || '';

  if (errorCode || errorMsg) {
    // 区分token过期和签名错误
    if (errorCode === '400' || errorMsg.includes('authorized') || errorMsg.includes('token') || errorMsg.includes('expired')) {
      throw new Error(`1688 API Token已过期，请更新access_token。错误: ${errorCode} ${errorMsg}`);
    }
    if (errorMsg.includes('SignatureInvalid') || errorMsg.includes('SignatureMissing')) {
      throw new Error(`1688 API签名错误: ${errorCode} ${errorMsg}`);
    }
    throw new Error(`1688 API业务错误: ${errorCode} ${errorMsg}`);
  }

  return data;
}

/**
 * 解析1688商品链接获取 offerId
 */
export function parseOfferIdFromUrl(url: string): string | null {
  const patterns = [
    /offer\/(\d+)\.html/i,
    /offer\/-\w+\/(\d+)\.html/i,
    /view\/(\d+)\.htm/i,
    /(\d{10,})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * 采集商品信息 - 调用真实1688 API
 */
export async function collectProduct(url: string): Promise<any> {
  const offerId = parseOfferIdFromUrl(url);

  if (!offerId) {
    throw new Error('无法解析1688商品链接');
  }

  try {
    const result = await getFenxiaoProductInfo(offerId);
    
    // 检查API返回
    if (result.code !== undefined && result.code !== '200' && result.code !== 200) {
      const errorMsg = result.message || result.msg || `API错误 code=${result.code}`;
      console.error('[1688] API返回错误:', errorMsg);
      throw new Error(`1688 API错误: ${errorMsg}`);
    }

    // 解析API返回数据
    const productInfo = result.productInfo || result.product_info || result.data || result;
    return parseProductData(productInfo, offerId, url);
  } catch (error: any) {
    console.error('[1688] 采集失败:', error.message);
    throw error;
  }
}

/**
 * 解析1688 API返回的商品数据为统一格式
 * 
 * 分销版API(productInfo.get)返回结构:
 * - subject: 标题
 * - referencePrice: 参考价
 * - productImage.images: 图片URL数组
 * - productSkuInfos: SKU列表 [{cargoNumber, amountOnSale, price, skuId, attributes:[{attributeName, attributeValue}]}]
 * - productAttribute: 属性列表 [{attributeName, value}]
 * - supplierLoginId / sellerLoginId: 供应商登录ID
 * - categoryName: 类目名
 * - description: 详情HTML
 */
function parseProductData(productInfo: any, offerId: string, url: string): any {
  // 从API返回中提取字段
  const title = productInfo.subject || productInfo.title || productInfo.name || '';
  const price = productInfo.referencePrice || productInfo.price || productInfo.priceRange || '';

  // 解析图片 - 分销版API: productImage.images 是URL数组
  let images: string[] = [];
  const productImage = productInfo.productImage || productInfo.imageUrls || {};
  if (typeof productImage === 'object' && Array.isArray(productImage.images)) {
    images = productImage.images
      .map((img: string) => {
        if (img && !img.startsWith('http')) {
          return `https:${img}`;
        }
        return img;
      })
      .filter(Boolean);
  } else if (Array.isArray(productImage)) {
    // 兼容 imageUrls 直接是数组的情况
    images = productImage
      .map((img: string) => {
        if (typeof img === 'string' && img && !img.startsWith('http')) {
          return `https:${img}`;
        }
        return typeof img === 'string' ? img : '';
      })
      .filter(Boolean);
  } else if (Array.isArray(productInfo.images)) {
    images = productInfo.images
      .map((img: string) => {
        if (typeof img === 'string' && img && !img.startsWith('http')) {
          return `https:${img}`;
        }
        return typeof img === 'string' ? img : '';
      })
      .filter(Boolean);
  }

  // 提取商品属性 - 分销版API: productAttribute 是 [{attributeName, value}]
  const attributes: Record<string, string> = {};
  const attrList = productInfo.productAttribute || productInfo.attributes || productInfo.productFeatureList || [];
  if (Array.isArray(attrList)) {
    for (const attr of attrList) {
      if (attr && typeof attr === 'object') {
        const key = attr.attributeName || attr.name || '';
        const val = attr.value || attr.attributeValue || attr.attributeValueName || '';
        if (key && val) {
          attributes[key] = String(val);
        }
      }
    }
  }
  if (productInfo.categoryName) {
    attributes['类目'] = productInfo.categoryName;
  }
  if (productInfo.brandName) {
    attributes['品牌'] = productInfo.brandName;
  }

  // 提取SKU信息 - 分销版API: productSkuInfos 是 [{skuId, price, amountOnSale, cargoNumber, attributes}]
  const skus: any[] = [];
  const skuList = productInfo.productSkuInfos || productInfo.skuInfos || productInfo.skus || [];
  if (Array.isArray(skuList)) {
    for (const sku of skuList) {
      if (sku && typeof sku === 'object') {
        // attributes 是数组 [{attributeName, attributeValue}]
        let skuName = '';
        if (Array.isArray(sku.attributes)) {
          skuName = sku.attributes
            .map((a: any) => a.attributeValue || a.attributeName || '')
            .filter(Boolean)
            .join(' / ');
        } else if (typeof sku.attributes === 'string') {
          skuName = sku.attributes;
        } else {
          skuName = sku.name || sku.cargoNumber || '';
        }
        skus.push({
          sku_id: String(sku.skuId || ''),
          name: skuName,
          price: sku.price || sku.consignPrice || 0,
          stock: sku.amountOnSale || 0,
        });
      }
    }
  }

  // 供应商信息 - 分销版API: supplierLoginId / sellerLoginId
  const supplierLoginId = productInfo.supplierLoginId || productInfo.sellerLoginId || '';
  const supplierInfo = productInfo.supplierInfo || productInfo.sellerInfo || {};
  const supplier = {
    name: (typeof supplierInfo === 'object' ? (supplierInfo.companyName || supplierInfo.shopName || '') : '') || supplierLoginId || '',
    url: supplierLoginId ? `https://${supplierLoginId}.1688.com` : (typeof supplierInfo === 'object' ? supplierInfo.shopUrl || '' : ''),
    rating: typeof supplierInfo === 'object' ? supplierInfo.creditRating || 0 : 0,
  };

  return {
    success: true,
    data: {
      offer_id: offerId,
      url,
      title,
      price: String(price),
      price_range: typeof price === 'string' ? price : String(price),
      images,
      main_image: images[0] || '',
      details: productInfo.description || productInfo.details || '',
      attributes,
      skus,
      supplier,
      sales: productInfo.saleNum || productInfo.sales || 0,
      min_order: productInfo.minOrderQuantity || productInfo.minOrder || 1,
      weight: productInfo.weight || 0.5,
      location: productInfo.sendGoodsAddressName || productInfo.location || '',
      category_name: productInfo.categoryName || '',
      collect_method: 'alibaba_api',
    },
  };
}

/**
 * 获取商品详情（兼容旧接口）
 */
export async function getOfferDetail(offerId: string): Promise<any> {
  const result = await getFenxiaoProductInfo(offerId);
  return result;
}

/**
 * 搜索商品（暂不支持，返回空结果）
 */
export async function searchOffers(
  keywords: string,
  pageSize: number = 20,
  pageNo: number = 1
): Promise<any> {
  console.log('[1688] 搜索功能暂未接入API，keywords:', keywords);
  return {
    success: false,
    error: '搜索功能暂未接入1688 API',
    data: [],
  };
}

// Config is now loaded dynamically via getAli1688Config()
