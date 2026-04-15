/**
 * 选品智能体 API
 * 支持 TikTok Shop 选品分析
 */

import { NextRequest, NextResponse } from 'next/server';

// 模拟选品数据生成
function generateMockProducts(count: number, category?: string) {
  const categories = category ? [category] : ['3C数码', '家居用品', '美妆工具', '宠物用品', '运动户外'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  const productTemplates = [
    { name: '无线蓝牙耳机', price: 15.99, profit: 8.5, sales: 2500 },
    { name: '智能手环手表', price: 25.99, profit: 12.8, sales: 1800 },
    { name: '便携充电宝', price: 12.99, profit: 6.2, sales: 3200 },
    { name: '折叠手机支架', price: 8.99, profit: 4.5, sales: 4500 },
    { name: 'LED补光灯', price: 18.99, profit: 9.8, sales: 2100 },
    { name: '多功能收纳盒', price: 11.99, profit: 5.8, sales: 2800 },
    { name: '迷你加湿器', price: 14.99, profit: 7.5, sales: 1900 },
    { name: '宠物自动饮水机', price: 22.99, profit: 11.2, sales: 1500 },
    { name: '瑜伽阻力带套装', price: 9.99, profit: 5.2, sales: 3800 },
    { name: '睫毛夹套装', price: 6.99, profit: 3.8, sales: 5200 },
  ];

  return productTemplates.slice(0, count).map((template, index) => ({
    id: `PROD-${Date.now()}-${index}`,
    name: template.name,
    category: randomCategory,
    platform: 'tiktok',
    site: 'id',
    sales_trend: 60 + Math.floor(Math.random() * 30),
    profit_margin: 30 + Math.floor(Math.random() * 25),
    compliance_status: 'passed',
    supply_chain: 'matched',
    purchase_cycle: 5 + Math.floor(Math.random() * 5),
    stock_cost_ratio: 25 + Math.floor(Math.random() * 20),
    predicted_profit: template.profit,
    cost_price: template.price - template.profit,
    source_url: 'https://1688.com/product/' + Math.random().toString(36).substring(7),
    supplier_name: '优质供应商-' + (index + 1),
    image_url: `https://picsum.photos/seed/${Date.now() + index}/400/400`,
    rating: 4.5 + Math.random() * 0.5,
    reviews: 100 + Math.floor(Math.random() * 900),
    competition_level: ['低', '中', '高'][Math.floor(Math.random() * 3)],
    recommendation: Math.random() > 0.5 ? '强烈推荐' : '建议观望',
  }));
}

// POST /api/v1/ai/select-products - 选品分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, site, category, count = 10, min_profit_rate = 0.3 } = body;

    // 模拟 AI 分析延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 生成选品结果
    const products = generateMockProducts(count, category);

    // 过滤利润率
    const filteredProducts = min_profit_rate > 0
      ? products.filter(p => p.profit_margin / 100 >= min_profit_rate)
      : products;

    const analysis = `
## 选品分析报告

**市场概况**: ${site === 'id' ? '印尼' : site === 'th' ? '泰国' : '东南亚'} TikTok Shop 市场持续增长

**推荐品类**:
1. **3C数码配件** - 无线耳机、充电设备需求旺盛
2. **家居收纳** - 小型收纳用品在东南亚市场热销
3. **美妆工具** - 便携化妆工具增速明显

**风险提示**:
- 部分品类竞争激烈，建议差异化选品
- 注意目标市场的合规要求
- 提前对接供应链，避免断货

**建议**: 优先选择利润率高、竞争度适中的商品
    `.trim();

    return NextResponse.json({
      success: true,
      products: filteredProducts.length > 0 ? filteredProducts : products,
      count: filteredProducts.length || count,
      category: category || '综合',
      platform: platform || 'tiktok',
      site: site || 'id',
      analysis,
      summary: {
        total_analyzed: 50,
        recommended: filteredProducts.length || count,
        avg_profit_rate: '35%',
        avg_daily_sales: '2500+',
      },
    });
  } catch (error: any) {
    console.error('选品失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '选品服务暂时不可用' },
      { status: 500 }
    );
  }
}
