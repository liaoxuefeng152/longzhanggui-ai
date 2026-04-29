import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { MiaoshouDAL } from '@/lib/db/dal';

/**
 * 妙手ERP商品采集API
 * 
 * 使用妙手ERP授权信息采集1688商品
 */

// 妙手ERP API配置
const MIAOSHOU_CONFIG = {
  appKey: process.env.MIAOSHOU_APP_KEY || '',
  appSecret: process.env.MIAOSHOU_APP_SECRET || '',
  apiBaseUrl: 'https://open.miaoshouerp.com/openapi',
};

/**
 * 生成妙手API签名
 */
function generateSign(params: Record<string, string>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const paramStr = sortedKeys.map(key => key + params[key]).join('');
  const signStr = appSecret + paramStr + appSecret;
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

/**
 * 调用妙手API
 */
async function callMiaoshouApi(
  method: string,
  params: Record<string, string>
): Promise<any> {
  const appKey = MIAOSHOU_CONFIG.appKey;
  const appSecret = MIAOSHOU_CONFIG.appSecret;
  
  if (!appKey || !appSecret) {
    // 尝试从数据库获取配置
    const dbConfig = MiaoshouDAL.get();
    if (dbConfig && (dbConfig as any).appKey) {
      // 使用数据库中的配置
    } else {
      throw new Error('请先在妙手ERP配置中填写AppKey和AppSecret');
    }
  }

  const timestamp = Date.now().toString();

  const baseParams: Record<string, string> = {
    appKey: appKey || '',
    method,
    timestamp,
    format: 'json',
    version: '1.0',
    ...params,
  };

  const sign = generateSign(baseParams, appSecret || '');
  baseParams.sign = sign;

  const queryString = Object.entries(baseParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const requestUrl = `${MIAOSHOU_CONFIG.apiBaseUrl}?${queryString}`;

  console.log('[妙手API] Request URL:', requestUrl.substring(0, 150) + '...');

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`妙手API请求失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[妙手API] 调用失败:', error);
    throw error;
  }
}

/**
 * 解析1688商品链接获取 offerId
 */
function parseOfferIdFromUrl(url: string): string | null {
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
 * 根据1688商品链接查询商品信息
 */
async function getProductByOfferId(offerId: string): Promise<any> {
  try {
    // 妙手API - 根据1688链接查询商品
    const result = await callMiaoshouApi('miaoshou.product.get', {
      platform: '1688',
      offerId,
    });

    if (result && result.code === 0 && result.data) {
      return {
        success: true,
        data: {
          offer_id: offerId,
          title: result.data.title || result.data.productName || '',
          price: parseFloat(result.data.price || 0),
          cost_price: parseFloat(result.data.costPrice || 0),
          images: result.data.images || [],
          details: result.data.description || '',
          supplier: {
            name: result.data.supplierName || '',
            url: result.data.supplierUrl || '',
          },
          category: result.data.category || '',
          sales: result.data.sales || 0,
          stock: result.data.stock || 0,
          location: result.data.location || '',
          weight: result.data.weight || 0,
          skus: result.data.skus || [],
        },
      };
    }

    return null;
  } catch (error) {
    console.error('[妙手] 查询商品失败:', error);
    return null;
  }
}

/**
 * 搜索妙手中的商品
 */
async function searchProducts(keywords: string): Promise<any[]> {
  try {
    const result = await callMiaoshouApi('miaoshou.product.search', {
      keywords,
      page: '1',
      pageSize: '20',
    });

    if (result && result.code === 0 && result.data) {
      return result.data.list || [];
    }

    return [];
  } catch (error) {
    console.error('[妙手] 搜索商品失败:', error);
    return [];
  }
}

/**
 * POST - 采集商品
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, offerId } = body;

    // 解析1688链接获取offerId
    const parsedOfferId = offerId || (url ? parseOfferIdFromUrl(url) : null);

    if (!parsedOfferId) {
      return NextResponse.json({
        success: false,
        error: '无法解析1688商品链接，请确保链接格式正确',
      }, { status: 400 });
    }

    console.log('[妙手采集] 开始采集商品, offerId:', parsedOfferId);

    // 尝试使用妙手API获取商品信息
    const productData = await getProductByOfferId(parsedOfferId);

    if (productData) {
      return NextResponse.json({
        success: true,
        data: productData.data,
        source: 'miaoshou',
        message: '通过妙手ERP采集成功',
      });
    }

    // 妙手API失败，返回友好的错误提示
    return NextResponse.json({
      success: false,
      error: '妙手ERP未找到该商品，请确保：\n1. 已正确配置妙手ERP的AppKey和AppSecret\n2. 该商品已在妙手ERP中存在\n3. 妙手ERP已授权1688平台',
    }, { status: 400 });

  } catch (error: any) {
    console.error('[妙手采集] 错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '采集失败，请检查妙手ERP配置',
    }, { status: 500 });
  }
}

/**
 * GET - 获取妙手中的商品列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords') || '';

    const products = await searchProducts(keywords);

    return NextResponse.json({
      success: true,
      data: products,
      source: 'miaoshou',
    });

  } catch (error: any) {
    console.error('[妙手商品列表] 错误:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '获取商品列表失败',
    }, { status: 500 });
  }
}
