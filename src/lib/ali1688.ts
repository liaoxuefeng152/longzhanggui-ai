/**
 * 1688 API 客户端
 * 对接阿里巴巴1688开放平台 - 分销商品详情接口
 * 签名算法: HMAC-SHA1（已验证可用）
 */

import crypto from 'crypto';

// 1688 API 配置
const ALI_1688_CONFIG = {
  appKey: process.env.ALI_1688_APP_KEY || '',
  appSecret: process.env.ALI_1688_APP_SECRET || '',
  accessToken: process.env.ALI_1688_ACCESS_TOKEN || '',
  apiBaseUrl: 'https://gw.open.1688.com/openapi',
};

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
  const signStr = `${apiPath}${appKey}${paramStr}`;

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
  if (!ALI_1688_CONFIG.appKey || !ALI_1688_CONFIG.appSecret) {
    throw new Error('请先配置1688 API凭证（ALI_1688_APP_KEY / ALI_1688_APP_SECRET）');
  }

  if (!ALI_1688_CONFIG.accessToken) {
    throw new Error('请先配置1688 Access Token（ALI_1688_ACCESS_TOKEN）');
  }

  // API路径定义
  const apiNamespace = 'com.alibaba.fenxiao';
  const apiName = 'alibaba.fenxiao.productInfo.get';
  const apiVersion = '1';
  const apiPath = `param2/${apiVersion}/${apiNamespace}/${apiName}`;

  // 业务参数（按key字母排序用于签名）
  const bizParams: Record<string, string> = {
    access_token: ALI_1688_CONFIG.accessToken,
    offerId: offerId,
  };

  // 生成签名
  const sign = generateHmacSha1Sign(
    apiPath,
    ALI_1688_CONFIG.appKey,
    bizParams,
    ALI_1688_CONFIG.appSecret
  );

  // 构建请求URL
  const queryString = Object.entries(bizParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  const requestUrl = `${ALI_1688_CONFIG.apiBaseUrl}/${apiPath}/${ALI_1688_CONFIG.appKey}?${queryString}&_aop_signature=${sign}`;

  console.log('[1688 API] 采集商品:', offerId);
  console.log('[1688 API] 签名串:', `${apiPath}${ALI_1688_CONFIG.appKey}access_token***offerId${offerId}`);
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
 */
function parseProductData(productInfo: any, offerId: string, url: string): any {
  // 从API返回中提取字段
  const title = productInfo.subject || productInfo.title || productInfo.name || '';
  const price = productInfo.referencePrice || productInfo.price || productInfo.priceRange || '';
  const images = (productInfo.imageUrls || productInfo.images || productInfo.picUrl || [])
    .map((img: string) => {
      // 补全https前缀
      if (img && !img.startsWith('http')) {
        return `https:${img}`;
      }
      return img;
    })
    .filter(Boolean);

  // 提取商品属性
  const attributes: Record<string, string> = {};
  if (productInfo.attributes && Array.isArray(productInfo.attributes)) {
    for (const attr of productInfo.attributes) {
      if (attr.attributeName && attr.attributeValue) {
        attributes[attr.attributeName] = attr.attributeValue;
      }
    }
  }
  if (productInfo.categoryName) {
    attributes['类目'] = productInfo.categoryName;
  }
  if (productInfo.brandName) {
    attributes['品牌'] = productInfo.brandName;
  }

  // 提取SKU信息
  const skus: any[] = [];
  if (productInfo.skuInfos && Array.isArray(productInfo.skuInfos)) {
    for (const sku of productInfo.skuInfos) {
      skus.push({
        name: sku.skuName || sku.name || '',
        values: sku.skuValues || sku.values || [],
        price: sku.skuPrice || sku.price || '',
        stock: sku.skuStock || sku.stock || 0,
      });
    }
  }

  // 供应商信息
  const supplier = {
    name: productInfo.supplierLoginId || productInfo.shopName || productInfo.supplierName || '',
    url: productInfo.supplierLoginId 
      ? `https://${productInfo.supplierLoginId}.1688.com` 
      : '',
    rating: productInfo.supplierRate || '',
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

export { ALI_1688_CONFIG };
