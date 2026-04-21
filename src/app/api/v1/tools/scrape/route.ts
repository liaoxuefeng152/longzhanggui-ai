import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

/**
 * 商品采集工具 API - 真实实现
 * 
 * 功能：
 * - 支持平台：1688、淘宝、天猫、京东、拼多多
 * - 通过HTML解析 + AI辅助提取商品信息
 */

// 平台配置
const PLATFORM_CONFIG = {
  '1688': {
    name: '1688',
    domains: ['1688.com', 'm.1688.com', 'detail.1688.com'],
    idPattern: /offer\/(\d+)\.html|offerId=(\d+)/,
    searchUrl: (id: string) => `https://s.1688.com/selloffer/offer_search.htm?keywords=${id}`,
  },
  'taobao': {
    name: '淘宝',
    domains: ['taobao.com', 'm.taobao.com', 'item.taobao.com'],
    idPattern: /id=(\d+)/,
    searchUrl: (id: string) => `https://s.taobao.com/search?q=${id}`,
  },
  'tmall': {
    name: '天猫',
    domains: ['tmall.com', 'detail.tmall.com'],
    idPattern: /id=(\d+)/,
    searchUrl: (id: string) => `https://list.tmall.com/search_product.htm?q=${id}`,
  },
  'jd': {
    name: '京东',
    domains: ['jd.com', 'item.jd.com', 'm.jd.com'],
    idPattern: /item\.jd\.com\/(\d+)/,
    searchUrl: (id: string) => `https://search.jd.com/Search?keyword=${id}`,
  },
  'pdd': {
    name: '拼多多',
    domains: ['pinduoduo.com', 'yangkeduo.com', 'mobile.yangkeduo.com'],
    idPattern: /goods_id=(\d+)/,
    searchUrl: (id: string) => `https://mobile.yangkeduo.com/goods.html?goods_id=${id}`,
  }
};

type Platform = keyof typeof PLATFORM_CONFIG;

interface ScrapeResult {
  success: boolean;
  platform?: string;
  productId?: string;
  data?: {
    title: string;
    price: number;
    original_price?: number;
    main_image?: string;
    images: string[];
    description?: string;
    shop_name?: string;
    shop_url?: string;
    specifications?: Record<string, string>;
    stock?: number;
    sales?: number;
    location?: string;
  };
  error?: string;
}

// 检测平台
function detectPlatform(url: string): Platform | null {
  for (const [key, config] of Object.entries(PLATFORM_CONFIG)) {
    if (config.domains.some(domain => url.includes(domain))) {
      return key as Platform;
    }
  }
  return null;
}

// 提取商品ID
function extractProductId(url: string, platform: Platform): string | null {
  const config = PLATFORM_CONFIG[platform];
  const match = url.match(config.idPattern);
  if (match) {
    return match[1] || match[2];
  }
  return null;
}

// 请求页面HTML
async function fetchPageHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.error('Fetch page error:', error);
    return null;
  }
}

// 从HTML中提取商品信息
function extractProductFromHtml(html: string, platform: Platform): Partial<ScrapeResult['data']> {
  const $ = cheerio.load(html);
  const result: Partial<ScrapeResult['data']> = {};
  
  try {
    switch (platform) {
      case '1688':
        // 1688页面是动态渲染的，尝试从meta标签和script中提取
        result.title = $('meta[property="og:title"]').attr('content') || 
                       $('title').text().replace(' - 阿里巴巴', '').trim() ||
                       $('h1[class*="title"]').text().trim();
        
        // 尝试从页面script中提取价格
        const priceMatch = html.match(/"price"\s*:\s*"?(\d+\.?\d*)"?/);
        if (priceMatch) {
          result.price = parseFloat(priceMatch[1]);
        }
        
        // 提取图片
        const images: string[] = [];
        $('img[src*="cbu"]').each((_, el) => {
          const src = $(el).attr('src');
          if (src && !src.includes('placeholder')) {
            images.push(src.replace(/\_\d+x\d+\./, '.'));
          }
        });
        result.images = images.slice(0, 10);
        result.main_image = images[0];
        
        // 店铺名称
        result.shop_name = $('a[class*="shop"]').text().trim() ||
                          $('div[class*="company"]').text().trim();
        break;
        
      case 'taobao':
      case 'tmall':
        result.title = $('meta[name="keywords"]').attr('content')?.split(',')[0] ||
                       $('title').text().replace('-淘宝网', '').replace('-天猫', '').trim();
        
        // 从script中提取数据
        const gPageData = html.match(/g_page_config\s*=\s*(\{[\s\S]*?\});/);
        if (gPageData) {
          try {
            const data = JSON.parse(gPageData[1]);
            const itemData = data?.itemInfo?.itemDO;
            if (itemData) {
              result.title = itemData.title || result.title;
              result.price = itemData.priceWap ? parseFloat(itemData.priceWap) : undefined;
              const galleryImages = itemData.galleryImages || [];
              result.images = galleryImages;
              if (galleryImages.length > 0) {
                result.main_image = galleryImages[0];
              }
              result.sales = itemData.sellCount ? parseInt(itemData.sellCount) : undefined;
            }
          } catch {
            // JSON解析失败，使用默认值
          }
        }
        
        result.shop_name = $('a[class*="shop"]').text().trim() ||
                          $('span[class*="shopName"]').text().trim();
        break;
        
      case 'jd':
        result.title = $('meta[name="keywords"]').attr('content')?.split(',')[0] ||
                       $('.sku-name').text().trim() ||
                       $('title').text().replace('-京东', '').trim();
        
        // 京东价格
        const jdPrice = $('.price .p-price span').text() || 
                        $('.summary-price-wrap .price').text();
        if (jdPrice) {
          result.price = parseFloat(jdPrice.replace(/[^\d.]/g, ''));
        }
        
        // 京东图片
        const jdImages: string[] = [];
        $('#spec-list img, .preview-wrap img').each((_, el) => {
          const src = $(el).attr('src') || $(el).attr('data-src');
          if (src && src.includes('img14')) {
            jdImages.push(src.replace(/\/s\d+x\d+_/, '/').replace(/\/n\d\//, '/n1/'));
          }
        });
        result.images = jdImages.slice(0, 10);
        result.main_image = jdImages[0];
        
        result.shop_name = $('.name a').text().trim() ||
                          $('.shop-name a').text().trim();
        break;
        
      case 'pdd':
        result.title = $('meta[property="og:title"]').attr('content') ||
                       $('title').text().trim();
        result.main_image = $('meta[property="og:image"]').attr('content');
        result.images = result.main_image ? [result.main_image] : [];
        break;
    }
  } catch (error) {
    console.error('Extract error:', error);
  }
  
  return result;
}

// 使用AI增强提取（调用LLM解析）
async function enhanceWithAI(html: string, platform: string, productId: string): Promise<Partial<ScrapeResult['data']>> {
  try {
    // 截取HTML关键部分，避免内容过长
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const keywords = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
    
    // 构建上下文
    const context = {
      platform,
      productId,
      title: titleMatch?.[1] || '',
      description: metaDesc?.[1] || '',
      keywords: keywords?.[1] || '',
      htmlSnippet: html.substring(0, 3000),
    };
    
    // 调用LLM解析
    const response = await fetch(`${process.env.DEPLOY_RUN_PORT ? `http://localhost:${process.env.DEPLOY_RUN_PORT}` : 'http://localhost:5000'}/api/v1/ai/chat-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `请从以下网页信息中提取商品详情，返回JSON格式：
{
  "title": "商品标题",
  "price": 数字价格,
  "shop_name": "店铺名称",
  "description": "商品简介"
}

网页信息：
平台: ${context.platform}
商品ID: ${context.productId}
标题: ${context.title}
描述: ${context.description}
关键词: ${context.keywords}

只返回JSON，不要其他内容。`,
        session_id: 'scrape',
      }),
    });

    // 读取流式响应
    const reader = response.body?.getReader();
    if (!reader) return {};
    
    const decoder = new TextDecoder();
    let fullContent = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content') {
              fullContent += data.content;
            }
          } catch {
            continue;
          }
        }
      }
    }
    
    // 尝试解析JSON
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {};
  } catch (error) {
    console.error('AI enhance error:', error);
    return {};
  }
}

// 真实采集商品信息
async function scrapeProductInfo(url: string, platform: Platform, productId: string): Promise<ScrapeResult> {
  // 1. 尝试获取页面HTML
  const html = await fetchPageHtml(url);
  
  if (!html) {
    // 页面请求失败，尝试通过搜索获取基本信息
    return {
      success: false,
      platform: PLATFORM_CONFIG[platform].name,
      productId,
      error: '无法获取页面内容，请检查链接是否正确或稍后重试'
    };
  }
  
  // 检查是否是404页面
  if (html.includes('404') && html.includes('阿里巴巴')) {
    return {
      success: false,
      platform: PLATFORM_CONFIG[platform].name,
      productId,
      error: '商品不存在或已下架'
    };
  }
  
  // 2. 从HTML中提取商品信息
  let extractedData = extractProductFromHtml(html, platform) || {};
  
  // 3. 如果数据不完整，尝试AI增强
  if (!extractedData.title || !extractedData.price) {
    const aiData = await enhanceWithAI(html, platform, productId);
    extractedData = { ...extractedData, ...aiData };
  }
  
  // 4. 验证数据完整性
  if (!extractedData.title) {
    // 即使标题没有获取到，也返回一个基本的记录，方便用户手动补充
    return {
      success: true,
      platform: PLATFORM_CONFIG[platform].name,
      productId,
      data: {
        title: `商品 ${productId}`,
        price: 0,
        images: [],
        description: '采集信息不完整，请手动补充商品详情',
        shop_name: extractedData.shop_name,
      },
      error: '部分信息采集失败，请手动补充'
    };
  }
  
  return {
    success: true,
    platform: PLATFORM_CONFIG[platform].name,
    productId,
    data: {
      title: extractedData.title || '未知商品',
      price: extractedData.price || 0,
      original_price: extractedData.original_price,
      main_image: extractedData.main_image,
      images: extractedData.images || [],
      description: extractedData.description,
      shop_name: extractedData.shop_name,
      specifications: extractedData.specifications,
      sales: extractedData.sales,
      location: extractedData.location,
    }
  };
}

// 单个商品采集
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: '请提供商品链接' },
        { status: 400 }
      );
    }

    // 检测平台
    const platform = detectPlatform(url);
    if (!platform) {
      return NextResponse.json({
        success: false,
        error: '不支持的平台，目前支持：1688、淘宝、天猫、京东、拼多多'
      }, { status: 400 });
    }

    // 提取商品ID
    const productId = extractProductId(url, platform);
    if (!productId) {
      return NextResponse.json({
        success: false,
        error: '无法识别商品ID，请检查链接格式'
      }, { status: 400 });
    }

    // 采集商品信息
    const result = await scrapeProductInfo(url, platform, productId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { success: false, error: '采集失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 批量采集
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供商品链接数组' },
        { status: 400 }
      );
    }

    if (urls.length > 10) {
      return NextResponse.json(
        { success: false, error: '单次最多采集10个商品' },
        { status: 400 }
      );
    }

    // 并行采集
    const results: ScrapeResult[] = [];
    
    for (const url of urls) {
      const platform = detectPlatform(url);
      if (!platform) {
        results.push({
          success: false,
          error: `不支持的平台: ${url}`
        });
        continue;
      }

      const productId = extractProductId(url, platform);
      if (!productId) {
        results.push({
          success: false,
          error: `无法识别商品ID: ${url}`
        });
        continue;
      }

      const result = await scrapeProductInfo(url, platform, productId);
      results.push(result);
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      total: urls.length,
      successCount,
      failedCount: urls.length - successCount,
      results
    });
  } catch (error) {
    console.error('Batch scrape error:', error);
    return NextResponse.json(
      { success: false, error: '批量采集失败' },
      { status: 500 }
    );
  }
}
