import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 采集单个1688商品
 * POST /api/v1/1688/collect
 * 优先使用Python后端，如果后端不可用则尝试网页采集
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: '请提供商品链接' },
        { status: 400 }
      );
    }

    // 验证1688链接
    if (!url.includes('1688.com')) {
      return NextResponse.json(
        { success: false, message: '请输入有效的1688商品链接' },
        { status: 400 }
      );
    }

    // 尝试调用Python后端
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/1688/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      }
    } catch (backendError) {
      console.log('Python后端不可用，尝试网页采集');
    }

    // 提取商品ID
    const offerIdMatch = url.match(/offer\/(\d+)\.html/);
    const offerId = offerIdMatch ? offerIdMatch[1] : Date.now().toString();

    // 使用网页采集
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 从HTML中提取数据（使用多种选择器）
      let title = '';
      const titleSelectors = [
        'title',
        'h1.d-title',
        'h1.offer-title',
        '.title-text',
        'meta[property="og:title"]',
        'meta[name="keywords"]',
        '[data-spm="1000983"]',
      ];

      for (const selector of titleSelectors) {
        if (selector.startsWith('meta')) {
          title = $(selector).attr('content') || '';
        } else {
          title = $(selector).text().trim();
        }
        if (title && title !== '未获取到商品标题') break;
      }

      // 如果是meta title，去除后缀
      if (title && title.includes(' - ')) {
        title = title.split(' - ')[0];
      }

      // 提取价格
      let price = 0;
      const priceText = $('script').filter(function() {
        return $(this).text().includes('price');
      }).text() || $('.price-now .value').text();

      const priceMatch = priceText.match(/price["\s:]+([\d.]+)/i);
      if (priceMatch) {
        price = parseFloat(priceMatch[1]);
      }

      // 提取图片
      const images: string[] = [];
      $('img').each((i, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src');
        if (src && src.includes('alicdn') && !src.includes('.gif')) {
          if (!images.includes(src)) {
            images.push(src);
          }
        }
      });

      // 如果没有采集到有效数据，说明页面需要登录或JS渲染
      if (!title || title.length < 3) {
        return NextResponse.json({
          success: false,
          message: '该商品页面需要登录才能采集完整数据，或页面使用了JavaScript渲染',
          error_type: 'REQUIRES_LOGIN_OR_JS',
          suggestion: '请使用Python后端（使用Selenium/Playwright）或手动添加商品'
        }, { status: 403 });
      }

      const collectedData = {
        id: offerId,
        title: title || '未获取到商品标题',
        price: price || 0,
        original_price: price * 1.2 || 0,
        images: images.length > 0 ? images.slice(0, 5) : [],
        specs: ['标准规格'],
        description: '商品页面采集成功，详细信息请访问原始链接',
        supplier: {
          name: '未知供应商',
          credit: '未认证',
          location: '未知地区',
        },
        sales: {
          volume: 0,
          rate: 0,
        },
        shipping: {
          min_qty: 1,
          lead_time: '未获取到',
          stock: 0,
        },
        collected_at: new Date().toISOString(),
        data_source: 'web_scraping',
        data_quality: 'partial',
      };

      return NextResponse.json({
        success: true,
        data: collectedData,
        message: '采集成功（部分数据）'
      }, { status: 200 });

    } catch (crawlError: any) {
      console.error('网页采集错误:', crawlError.message);

      // 如果采集失败，说明1688有反爬或需要特殊处理
      return NextResponse.json({
        success: false,
        message: '网页采集失败：' + crawlError.message,
        error_type: 'CRAWL_FAILED',
        suggestion: '1688网站有反爬虫机制，需要使用Python后端（配合Selenium/Playwright）才能完整采集',
        debug_info: {
          url: url,
          error: crawlError.message
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('采集失败:', error);
    return NextResponse.json(
      { success: false, message: '采集失败，请稍后重试' },
      { status: 500 }
    );
  }
}
