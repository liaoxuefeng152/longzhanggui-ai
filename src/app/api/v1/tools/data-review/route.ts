import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/storage/database/supabase-client';

// 数据复盘请求接口
interface DataReviewRequest {
  dateRange?: {
    start: string;
    end: string;
  };
  platforms?: string[];
  metrics?: string[];
  reportType?: 'daily' | 'weekly' | 'monthly' | 'custom';
}

// 从数据库获取业务数据
async function getBusinessData(dateRange?: { start: string; end: string }) {
  try {
    // 查询商品数据
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('查询商品失败:', productsError);
    }
    
    // 查询订单数据
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');
    
    if (ordersError) {
      console.error('查询订单失败:', ordersError);
    }
    
    // 查询广告数据
    const { data: adCampaigns, error: adsError } = await supabase
      .from('ad_campaigns')
      .select('*');
    
    if (adsError) {
      console.error('查询广告失败:', adsError);
    }
    
    // 构建商品指标数据
    const productMetrics = (products || []).map(product => ({
      id: product.id,
      product_id: product.sku,
      product_name: product.name,
      platform: product.platform || 'shopee',
      category: product.category || '其他',
      sales: product.sell_price || 0,
      orders: 0, // 暂无订单数据
      profit: (product.sell_price || 0) - (product.purchase_price || 0),
      adSpend: 0, // 暂无广告数据
      roas: 0,
      conversionRate: 0,
      trend: 'stable',
    }));
    
    // 构建平台指标数据（从商品数据聚合）
    const platformMap = new Map();
    productMetrics.forEach(p => {
      const platform = p.platform || 'shopee';
      if (!platformMap.has(platform)) {
        platformMap.set(platform, { platform, sales: 0, orders: 0, profit: 0, adSpend: 0, count: 0 });
      }
      const stats = platformMap.get(platform);
      stats.sales += p.sales;
      stats.orders += p.orders;
      stats.profit += p.profit;
      stats.adSpend += p.adSpend;
      stats.count += 1;
    });
    
    const platformMetrics = Array.from(platformMap.values()).map(p => ({
      ...p,
      roas: p.adSpend > 0 ? p.sales / p.adSpend : 0,
    }));
    
    // 构建类目指标数据（从商品数据聚合）
    const categoryMap = new Map();
    productMetrics.forEach(p => {
      const category = p.category || '其他';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { category, sales: 0, orders: 0, profit: 0, count: 0 });
      }
      const stats = categoryMap.get(category);
      stats.sales += p.sales;
      stats.orders += p.orders;
      stats.profit += p.profit;
      stats.count += 1;
    });
    
    const categoryMetrics = Array.from(categoryMap.values());
    
    // 构建每日指标数据（暂无真实数据，返回空数组）
    const dailyMetrics: any[] = [];
    
    // 计算汇总数据
    const summary = {
      totalSales: productMetrics.reduce((sum, p) => sum + p.sales, 0),
      totalOrders: productMetrics.reduce((sum, p) => sum + p.orders, 0),
      totalProfit: productMetrics.reduce((sum, p) => sum + p.profit, 0),
      totalAdSpend: platformMetrics.reduce((sum, p) => sum + p.adSpend, 0),
      avgRoas: platformMetrics.length > 0 
        ? platformMetrics.reduce((sum, p) => sum + p.roas, 0) / platformMetrics.length 
        : 0,
      avgConversionRate: productMetrics.length > 0 
        ? productMetrics.reduce((sum, p) => sum + p.conversionRate, 0) / productMetrics.length 
        : 0,
    };
    
    return {
      dailyMetrics,
      productMetrics,
      platformMetrics,
      categoryMetrics,
      summary,
      hasData: (products?.length || 0) > 0,
    };
  } catch (error) {
    console.error('获取业务数据失败:', error);
    return {
      dailyMetrics: [],
      productMetrics: [],
      platformMetrics: [],
      categoryMetrics: [],
      summary: {
        totalSales: 0,
        totalOrders: 0,
        totalProfit: 0,
        totalAdSpend: 0,
        avgRoas: 0,
        avgConversionRate: 0,
      },
      hasData: false,
    };
  }
}

// 生成AI分析提示词
function generateAnalysisPrompt(data: Awaited<ReturnType<typeof getBusinessData>>, reportType: string) {
  if (!data.hasData) {
    return `你是跨境电商数据分析师。
    
当前系统没有业务数据，请提示用户：
1. 需要先添加商品数据
2. 需要有订单数据才能生成复盘报告
3. 建议用户导入数据或等待业务运行一段时间后再查看复盘

请用中文回复，使用Markdown格式。`;
  }
  
  const prompt = `你是跨境电商数据分析师，正在为老板生成运营数据复盘报告。

## 数据概览
- 总销售额: $${data.summary.totalSales.toFixed(2)}
- 总订单数: ${data.summary.totalOrders}
- 总利润: $${data.summary.totalProfit.toFixed(2)}
- 总广告花费: $${data.summary.totalAdSpend.toFixed(2)}
- 平均ROAS: ${data.summary.avgRoas.toFixed(2)}
- 平均转化率: ${data.summary.avgConversionRate.toFixed(2)}%

## 商品数据
${data.productMetrics.length > 0 
  ? data.productMetrics.map(p => `- ${p.product_name} (${p.platform}): 成本$${(p.sales - p.profit).toFixed(2)}, 售价$${p.sales.toFixed(2)}`).join('\n')
  : '- 暂无商品数据'}

## 平台分布
${data.platformMetrics.length > 0 
  ? data.platformMetrics.map(p => `- ${p.platform}: 销售额$${p.sales.toFixed(2)}, 商品数${p.count}`).join('\n')
  : '- 暂无平台数据'}

请生成一份专业的运营复盘报告，包含：
1. **数据摘要**: 核心指标总结
2. **现状分析**: 当前数据状态
3. **建议**: 如何获取更完整的数据

请用中文回复，使用Markdown格式，保持专业且易于理解。`;

  return prompt;
}

// 调用AI模型进行数据复盘分析
async function invokeAIAnalysis(prompt: string) {
  try {
    const { LLMClient, Config } = await import('coze-coding-dev-sdk');
    
    const apiKey = process.env.COZE_API_KEY || process.env.NEXT_PUBLIC_COZE_API_KEY;
    if (!apiKey) {
      throw new Error('未配置API密钥');
    }

    const config = new Config({
      apiKey,
      baseUrl: process.env.COZE_API_BASE_URL || 'https://api.coze.cn',
    });
    const client = new LLMClient(config);

    const messages = [
      { role: 'user' as const, content: prompt }
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-pro-32k',
    });

    return response.content || '';
  } catch (error: any) {
    console.error('AI分析错误:', error);
    throw error;
  }
}

// 生成AI洞察
function generateAIInsights(data: Awaited<ReturnType<typeof getBusinessData>>) {
  const insights = [];
  
  if (!data.hasData) {
    insights.push({
      id: `INS-${Date.now()}-1`,
      type: 'warning',
      title: '暂无业务数据',
      description: '当前系统没有商品或订单数据，无法生成有效的复盘分析。',
      impact: '请先添加商品或导入订单数据',
      action: '前往ERP系统添加商品数据',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    return insights;
  }

  // 分析TOP商品（如果有数据）
  if (data.productMetrics.length > 0) {
    const topProduct = data.productMetrics.reduce((max, p) => p.sales > max.sales ? p : max, data.productMetrics[0]);
    insights.push({
      id: `INS-${Date.now()}-1`,
      type: 'opportunity',
      title: `${topProduct.product_name}销售额最高`,
      description: `该商品销售额$${topProduct.sales.toFixed(2)}，利润$${topProduct.profit.toFixed(2)}。`,
      impact: `占总销售额的 ${((topProduct.sales / data.summary.totalSales) * 100).toFixed(1)}%`,
      action: '建议持续关注该商品表现',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
  }

  // 分析平台分布
  if (data.platformMetrics.length > 0) {
    const mainPlatform = data.platformMetrics.reduce((max, p) => p.count > max.count ? p : max, data.platformMetrics[0]);
    insights.push({
      id: `INS-${Date.now()}-2`,
      type: 'suggestion',
      title: `${mainPlatform.platform}是主要销售平台`,
      description: `${mainPlatform.platform}平台有${mainPlatform.count}个商品，销售额$${mainPlatform.sales.toFixed(2)}。`,
      impact: `可考虑在其他平台拓展`,
      action: '评估其他平台的拓展机会',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
  }

  return insights;
}

// POST - 生成数据复盘报告
export async function POST(request: NextRequest) {
  try {
    const body: DataReviewRequest = await request.json();
    const { dateRange, platforms, reportType = 'weekly' } = body;

    // 从数据库获取业务数据
    const data = await getBusinessData(dateRange);

    // 过滤数据（如果有平台筛选）
    let filteredData = data;
    if (platforms && platforms.length > 0 && data.hasData) {
      filteredData = {
        ...data,
        productMetrics: data.productMetrics.filter(p => platforms.includes(p.platform)),
        platformMetrics: data.platformMetrics.filter(p => platforms.some(pl => p.platform.toLowerCase().includes(pl.toLowerCase()))),
      };
      // 重新计算汇总
      filteredData.summary = {
        totalSales: filteredData.productMetrics.reduce((sum, p) => sum + p.sales, 0),
        totalOrders: filteredData.productMetrics.reduce((sum, p) => sum + p.orders, 0),
        totalProfit: filteredData.productMetrics.reduce((sum, p) => sum + p.profit, 0),
        totalAdSpend: filteredData.platformMetrics.reduce((sum, p) => sum + p.adSpend, 0),
        avgRoas: filteredData.platformMetrics.length > 0 
          ? filteredData.platformMetrics.reduce((sum, p) => sum + p.roas, 0) / filteredData.platformMetrics.length 
          : 0,
        avgConversionRate: filteredData.productMetrics.length > 0 
          ? filteredData.productMetrics.reduce((sum, p) => sum + p.conversionRate, 0) / filteredData.productMetrics.length 
          : 0,
      };
    }

    // 生成AI分析
    const prompt = generateAnalysisPrompt(filteredData, reportType);
    
    let aiReport = '';
    try {
      aiReport = await invokeAIAnalysis(prompt);
    } catch (aiError: any) {
      console.warn('AI分析调用失败:', aiError.message);
      aiReport = `## 数据复盘报告

### 数据状态
当前系统数据：${filteredData.hasData ? '有数据' : '暂无数据'}

${filteredData.hasData ? `
### 数据摘要
- 本期总销售额：**$${filteredData.summary.totalSales.toFixed(2)}**
- 总商品数：**${filteredData.productMetrics.length}** 个
- 总利润：**$${filteredData.summary.totalProfit.toFixed(2)}**

### 商品分布
${filteredData.productMetrics.map(p => `- ${p.product_name}: 售价$${p.sales.toFixed(2)}`).join('\n')}
` : `
### 提示
当前系统没有业务数据，请：
1. 前往ERP添加商品
2. 导入订单数据
3. 配置广告投放
`}
`;
    }

    // 生成AI洞察
    const insights = generateAIInsights(filteredData);

    return NextResponse.json({
      success: true,
      data: {
        metrics: filteredData,
        aiReport,
        insights,
        reportType,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('数据复盘API错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '数据复盘失败' },
      { status: 500 }
    );
  }
}

// GET - 获取数据概览（简化版，用于页面初始加载）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const data = await getBusinessData({
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    });

    const insights = generateAIInsights(data);

    return NextResponse.json({
      success: true,
      data: {
        metrics: data,
        insights,
        updatedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('数据概览API错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取数据失败' },
      { status: 500 }
    );
  }
}