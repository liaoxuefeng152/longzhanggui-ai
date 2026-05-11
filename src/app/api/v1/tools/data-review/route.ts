import { NextRequest, NextResponse } from 'next/server';

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

// 获取模拟业务数据（实际项目中应从数据库获取）
function getMockBusinessData(dateRange?: { start: string; end: string }) {
  const now = new Date();
  const days = dateRange ? 
    Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)) : 7;
  
  const dailyMetrics = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const baseSales = 10000 + Math.random() * 8000;
    const orders = Math.floor(baseSales / 200) + Math.floor(Math.random() * 20);
    dailyMetrics.push({
      date: date.toISOString().split('T')[0],
      sales: Math.round(baseSales * 100) / 100,
      orders,
      profit: Math.round(baseSales * 0.18 * 100) / 100,
      adSpend: Math.round(baseSales * 0.1 * 100) / 100,
      roas: 1.5 + Math.random() * 2,
      conversionRate: 2 + Math.random() * 2,
    });
  }

  const productMetrics = [
    { id: 'P001', product_id: 'PROD001', product_name: '蓝牙耳机无线降噪', platform: 'tiktok', category: '3C数码', sales: 15680.50, orders: 42, profit: 2838.12, adSpend: 1568.05, roas: 2.8, conversionRate: 3.2, trend: 'up' },
    { id: 'P002', product_id: 'PROD002', product_name: '宠物自动喂食器5L', platform: 'tiktok', category: '宠物用品', sales: 12350.80, orders: 35, profit: 2117.68, adSpend: 1235.08, roas: 2.5, conversionRate: 3.5, trend: 'up' },
    { id: 'P003', product_id: 'PROD003', product_name: '便携式榨汁机USB', platform: 'amazon', category: '厨房用品', sales: 8920.00, orders: 28, profit: 1650.40, adSpend: 892.00, roas: 3.2, conversionRate: 4.1, trend: 'stable' },
    { id: 'P004', product_id: 'PROD004', product_name: 'LED化妆镜台式带灯', platform: 'tiktok', category: '美妆工具', sales: 5680.00, orders: 22, profit: 980.20, adSpend: 852.00, roas: 1.8, conversionRate: 2.2, trend: 'down' },
    { id: 'P005', product_id: 'PROD005', product_name: '智能手表运动防水', platform: 'shopee', category: '3C数码', sales: 4520.00, orders: 15, profit: 720.30, adSpend: 452.00, roas: 2.5, conversionRate: 2.8, trend: 'stable' },
  ];

  const platformMetrics = [
    { platform: 'TikTok', sales: 28050.30, orders: 77, profit: 4957.80, adSpend: 2805.03, roas: 2.7 },
    { platform: 'Amazon', sales: 8920.00, orders: 28, profit: 1650.40, adSpend: 892.00, roas: 3.2 },
    { platform: 'Shopee', sales: 4520.00, orders: 15, profit: 720.30, adSpend: 452.00, roas: 2.5 },
  ];

  const categoryMetrics = [
    { category: '3C数码', sales: 20200.50, orders: 57, profit: 3558.42, count: 2 },
    { category: '宠物用品', sales: 12350.80, orders: 35, profit: 2117.68, count: 1 },
    { category: '厨房用品', sales: 8920.00, orders: 28, profit: 1650.40, count: 1 },
    { category: '美妆工具', sales: 5680.00, orders: 22, profit: 980.20, count: 1 },
  ];

  return {
    dailyMetrics,
    productMetrics,
    platformMetrics,
    categoryMetrics,
    summary: {
      totalSales: 41490.30,
      totalOrders: 120,
      totalProfit: 7327.50,
      totalAdSpend: 4149.03,
      avgRoas: 2.7,
      avgConversionRate: 3.1,
    }
  };
}

// 生成AI分析提示词
function generateAnalysisPrompt(data: ReturnType<typeof getMockBusinessData>, reportType: string) {
  const prompt = `你是跨境电商数据分析师，正在为老板生成运营数据复盘报告。

## 数据概览
- 总销售额: $${data.summary.totalSales.toFixed(2)}
- 总订单数: ${data.summary.totalOrders}
- 总利润: $${data.summary.totalProfit.toFixed(2)}
- 总广告花费: $${data.summary.totalAdSpend.toFixed(2)}
- 平均ROAS: ${data.summary.avgRoas.toFixed(2)}
- 平均转化率: ${data.summary.avgConversionRate.toFixed(2)}%

## 每日数据
${data.dailyMetrics.map(m => `- ${m.date}: 销售额$${m.sales.toFixed(2)}, 订单${m.orders}, ROAS ${m.roas.toFixed(2)}`).join('\n')}

## TOP商品表现
${data.productMetrics.map(p => `- ${p.product_name} (${p.platform}): 销售额$${p.sales.toFixed(2)}, ROAS ${p.roas.toFixed(2)}, 趋势${p.trend}`).join('\n')}

## 平台分布
${data.platformMetrics.map(p => `- ${p.platform}: 销售额$${p.sales.toFixed(2)}, ROAS ${p.roas.toFixed(2)}`).join('\n')}

请生成一份专业的运营复盘报告，包含：
1. **数据摘要**: 核心指标总结
2. **亮点分析**: 表现最好的商品/平台
3. **问题诊断**: 需要关注的问题
4. **优化建议**: 具体可执行的建议

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
function generateAIInsights(data: ReturnType<typeof getMockBusinessData>) {
  const insights = [];

  // 分析TOP商品
  const topProduct = data.productMetrics.reduce((max, p) => p.sales > max.sales ? p : max);
  insights.push({
    id: `INS-${Date.now()}-1`,
    type: 'opportunity',
    title: `${topProduct.product_name}表现亮眼`,
    description: `该商品销售额$${topProduct.sales.toFixed(2)}，ROAS达到${topProduct.roas.toFixed(2)}，是本期表现最好的商品。`,
    impact: `占总销售额的 ${((topProduct.sales / data.summary.totalSales) * 100).toFixed(1)}%`,
    action: '建议适当增加广告预算，扩大流量入口',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  // 分析低ROAS商品
  const lowRoasProducts = data.productMetrics.filter(p => p.roas < 2.0);
  if (lowRoasProducts.length > 0) {
    const totalLoss = lowRoasProducts.reduce((sum, p) => sum + (p.sales * 0.1 - p.profit), 0);
    insights.push({
      id: `INS-${Date.now()}-2`,
      type: 'warning',
      title: `${lowRoasProducts.length}个商品ROAS偏低`,
      description: lowRoasProducts.map(p => `${p.product_name}(ROAS ${p.roas.toFixed(2)})`).join('、') + ' 的ROAS低于2.0，广告投入产出不成正比。',
      impact: `预估额外亏损约 $${totalLoss.toFixed(2)}/月`,
      action: '建议优化Listing或调整广告策略',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
  }

  // 分析平台表现
  const bestPlatform = data.platformMetrics.reduce((max, p) => p.roas > max.roas ? p : max);
  insights.push({
    id: `INS-${Date.now()}-3`,
    type: 'suggestion',
    title: `${bestPlatform.platform}平台ROI最高`,
    description: `${bestPlatform.platform}平台ROAS达到${bestPlatform.roas.toFixed(2)}，是当前投资回报率最高的平台。`,
    impact: `可考虑将更多预算分配到该平台`,
    action: '增加平台广告投放占比',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  // 分析增长趋势
  if (data.dailyMetrics.length >= 2) {
    const recentDay = data.dailyMetrics[data.dailyMetrics.length - 1];
    const prevDay = data.dailyMetrics[data.dailyMetrics.length - 2];
    const growthRate = ((recentDay.sales - prevDay.sales) / prevDay.sales * 100).toFixed(1);
    
    insights.push({
      id: `INS-${Date.now()}-4`,
      type: growthRate.startsWith('-') ? 'warning' : 'opportunity',
      title: `今日销售额${parseFloat(growthRate) > 0 ? '增长' : '下降'} ${Math.abs(parseFloat(growthRate))}%`,
      description: `昨日销售额$${prevDay.sales.toFixed(2)}，今日销售额$${recentDay.sales.toFixed(2)}。`,
      impact: `环比 ${parseFloat(growthRate) > 0 ? '正' : '负'}增长`,
      action: growthRate.startsWith('-') ? '分析下降原因，调整运营策略' : '保持当前策略，继续观察',
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

    // 获取业务数据
    const data = getMockBusinessData(dateRange);

    // 过滤数据（如果有平台筛选）
    let filteredData = data;
    if (platforms && platforms.length > 0) {
      filteredData = {
        ...data,
        productMetrics: data.productMetrics.filter(p => platforms.includes(p.platform)),
        platformMetrics: data.platformMetrics.filter(p => platforms.includes(p.platform)),
      };
      // 重新计算汇总
      filteredData.summary = {
        totalSales: filteredData.productMetrics.reduce((sum, p) => sum + p.sales, 0),
        totalOrders: filteredData.productMetrics.reduce((sum, p) => sum + p.orders, 0),
        totalProfit: filteredData.productMetrics.reduce((sum, p) => sum + p.profit, 0),
        totalAdSpend: filteredData.productMetrics.reduce((sum, p) => sum + p.adSpend, 0),
        avgRoas: filteredData.productMetrics.length > 0 
          ? filteredData.productMetrics.reduce((sum, p) => sum + p.roas, 0) / filteredData.productMetrics.length 
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
      // AI调用失败时返回模拟报告
      console.warn('AI分析调用失败，使用默认报告:', aiError.message);
      aiReport = `## 数据复盘报告

### 数据摘要
- 本期总销售额：**$${filteredData.summary.totalSales.toFixed(2)}**
- 总订单数：**${filteredData.summary.totalOrders}** 单
- 总利润：**$${filteredData.summary.totalProfit.toFixed(2)}**
- 广告花费：**$${filteredData.summary.totalAdSpend.toFixed(2)}**
- 平均ROAS：**${filteredData.summary.avgRoas.toFixed(2)}**

### 运营分析
1. **整体表现**：本期运营数据表现良好，${filteredData.summary.avgRoas >= 2.5 ? '广告ROI达到预期' : '广告ROI有优化空间'}。

2. **TOP商品**：${filteredData.productMetrics[0]?.product_name || '暂无数据'}表现最佳，贡献了主要销售额。

3. **平台分布**：${filteredData.platformMetrics.map(p => `${p.platform}(${((p.sales / filteredData.summary.totalSales) * 100).toFixed(1)}%)`).join('、')}。

### 优化建议
- ${filteredData.summary.avgRoas < 2.5 ? '建议优化广告投放策略，提高ROAS' : '建议保持当前投放策略'}
- 关注低ROAS商品，及时调整或淘汰
- 增加高转化率商品的曝光`;
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

    const data = getMockBusinessData({
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
