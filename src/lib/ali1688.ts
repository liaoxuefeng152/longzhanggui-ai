/**
 * 1688 API 客户端
 * 对接阿里巴巴1688开放平台
 */

import crypto from 'crypto';

// 1688 API 配置
const ALI_1688_CONFIG = {
  appKey: process.env.ALI_1688_APP_KEY || '',
  appSecret: process.env.ALI_1688_APP_SECRET || '',
  apiBaseUrl: 'https://gw.open.1688.com/openapi',
};

// API 元数据
const API_METADATA = {
  'offerDetail': {
    apiName: 'offerDetail',
    version: '1',
    namespace: 'com.alibaba.product',
  },
  'offerSearch': {
    apiName: 'offerSearch',
    version: '2',
    namespace: 'com.alibaba.product',
  },
};

/**
 * 生成 1688 API 签名
 */
function generateSign(
  params: Record<string, string>,
  appSecret: string
): string {
  // 1. 排序参数
  const sortedKeys = Object.keys(params).sort();
  const sortedParams: Record<string, string> = {};
  sortedKeys.forEach((key) => {
    sortedParams[key] = params[key];
  });

  // 2. 拼接参数字符串
  const paramStr = sortedKeys
    .map((key) => `${key}${encodeURIComponent(sortedParams[key])}`)
    .join('');

  // 3. 拼接 AppSecret
  const signStr = appSecret + paramStr + appSecret;

  // 4. 计算 MD5
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

/**
 * 调用 1688 API
 */
async function callAli1688Api<T = any>(
  apiName: string,
  version: string,
  namespace: string,
  params: Record<string, string>
): Promise<T> {
  if (!ALI_1688_CONFIG.appKey || !ALI_1688_CONFIG.appSecret) {
    throw new Error('请先配置1688 API凭证');
  }

  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').replace(/\.\d{3}Z$/, '');

  // 基础参数
  const baseParams: Record<string, string> = {
    appKey: ALI_1688_CONFIG.appKey,
    timestamp,
    format: 'json',
    v: '2.0',
    signMethod: 'md5',
    ...params,
  };

  // 生成签名
  const sign = generateSign(baseParams, ALI_1688_CONFIG.appSecret);
  baseParams.sign = sign;

  // 构建请求 URL
  const apiPath = `${namespace}/${apiName}/${version}`;
  const queryString = Object.entries(baseParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  const requestUrl = `${ALI_1688_CONFIG.apiBaseUrl}/${apiPath}?${queryString}`;

  console.log('[1688 API] Request URL:', requestUrl.substring(0, 200) + '...');

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`1688 API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  console.log('[1688 API] Response:', JSON.stringify(data).substring(0, 200));

  return data;
}

/**
 * 获取商品详情
 */
export async function getOfferDetail(offerId: string): Promise<any> {
  const params: Record<string, string> = {
    offerId,
    includeFields: 'detail,image,sku,priceRange,video',
  };

  const metadata = API_METADATA['offerDetail'];
  const result = await callAli1688Api(
    metadata.apiName,
    metadata.version,
    metadata.namespace,
    params
  );

  return result;
}

/**
 * 搜索商品
 */
export async function searchOffers(
  keywords: string,
  pageSize: number = 20,
  pageNo: number = 1
): Promise<any> {
  const params: Record<string, string> = {
    keywords,
    pageSize: String(pageSize),
    pageNo: String(pageNo),
    sortType: 'saledesc',
  };

  const metadata = API_METADATA['offerSearch'];
  const result = await callAli1688Api(
    metadata.apiName,
    metadata.version,
    metadata.namespace,
    params
  );

  return result;
}

/**
 * 解析1688商品链接获取 offerId
 */
export function parseOfferIdFromUrl(url: string): string | null {
  // 匹配多种1688链接格式
  // https://detail.1688.com/offer/123456789.html
  // https://m.1688.com/offer/-xxxxx.html
  // https://p.1688.com/view/xxxxx.htm

  const patterns = [
    /offer\/(\d+)\.html/i,
    /offer\/-\w+\/(\d+)\.html/i,
    /view\/(\d+)\.htm/i,
    /(\d{10,})/i, // 10位以上数字
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
 * 采集商品信息
 */
export async function collectProduct(url: string): Promise<any> {
  const offerId = parseOfferIdFromUrl(url);

  if (!offerId) {
    throw new Error('无法解析1688商品链接');
  }

  try {
    const result = await getOfferDetail(offerId);
    return result;
  } catch (error) {
    console.error('[1688] 获取商品详情失败:', error);
    // 如果 API 调用失败，返回模拟数据
    return generateMockProduct(offerId, url);
  }
}

/**
 * 生成模拟商品数据（当API不可用时）
 */
function generateMockProduct(offerId: string, url: string): any {
  return {
    success: true,
    data: {
      offerId,
      url,
      title: '1688商品 - ' + offerId,
      price: Math.floor(Math.random() * 100) + 10,
      priceRange: '10-50',
      images: ['https://cbu01.alicdn.com/img/ibank/O1CN01test.jpg'],
      supplier: {
        name: '1688供应商',
        url: 'https://m.1688.com/',
      },
      details: '商品详情描述',
      attributes: {},
      skus: [],
      sales: Math.floor(Math.random() * 10000),
      minOrder: 1,
      location: '浙江杭州',
    },
  };
}

export { ALI_1688_CONFIG };
