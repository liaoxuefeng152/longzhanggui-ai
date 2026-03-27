import { NextRequest, NextResponse } from 'next/server';

// 模拟选品数据
const MOCK_PRODUCTS = [
  {
    id: 'SP-001',
    name: '宠物自动喂食器 5L大容量 智能定时',
    category: '宠物用品',
    platform: 'tiktok',
    sales_trend: 89.5,
    profit_margin: 42.3,
    compliance_status: 'passed',
    supply_chain: 'matched',
    purchase_cycle: 5,
    stock_cost_ratio: 28,
    predicted_profit: 68.5,
    source_url: 'https://detail.1688.com/offer/123456.html',
    supplier_name: '义乌宠物用品厂',
    cost_price: 45.5,
  },
  {
    id: 'SP-002',
    name: '便携式榨汁机 USB充电 迷你随身杯',
    category: '家居电器',
    platform: 'tiktok',
    sales_trend: 76.8,
    profit_margin: 38.5,
    compliance_status: 'passed',
    supply_chain: 'matched',
    purchase_cycle: 7,
    stock_cost_ratio: 32,
    predicted_profit: 55.2,
    source_url: 'https://detail.1688.com/offer/234567.html',
    supplier_name: '深圳小家电有限公司',
    cost_price: 38.0,
  },
  {
    id: 'SP-003',
    name: '隐形蓝牙耳机 运动入耳式 超长续航',
    category: '数码配件',
    platform: 'tiktok',
    sales_trend: 92.3,
    profit_margin: 48.6,
    compliance_status: 'passed',
    supply_chain: 'matched',
    purchase_cycle: 3,
    stock_cost_ratio: 25,
    predicted_profit: 78.9,
    source_url: 'https://detail.1688.com/offer/345678.html',
    supplier_name: '东莞数码科技',
    cost_price: 28.5,
  },
  {
    id: 'SP-004',
    name: '瑜伽垫加厚防滑 NBR材质 环保无味',
    category: '运动健身',
    platform: 'tiktok',
    sales_trend: 65.4,
    profit_margin: 35.2,
    compliance_status: 'passed',
    supply_chain: 'checking',
    purchase_cycle: 10,
    stock_cost_ratio: 35,
    predicted_profit: 42.8,
    source_url: 'https://detail.1688.com/offer/456789.html',
    supplier_name: '河北体育用品厂',
    cost_price: 22.0,
  },
  {
    id: 'SP-005',
    name: '多功能收纳盒 折叠式 衣物整理神器',
    category: '家居收纳',
    platform: 'tiktok',
    sales_trend: 58.9,
    profit_margin: 52.3,
    compliance_status: 'passed',
    supply_chain: 'matched',
    purchase_cycle: 6,
    stock_cost_ratio: 20,
    predicted_profit: 65.7,
    source_url: 'https://detail.1688.com/offer/567890.html',
    supplier_name: '台州塑料制品',
    cost_price: 12.5,
  },
  {
    id: 'SP-006',
    name: 'LED化妆镜 带灯充电式 桌面折叠镜',
    category: '美妆工具',
    platform: 'tiktok',
    sales_trend: 81.2,
    profit_margin: 45.8,
    compliance_status: 'pending',
    supply_chain: 'matched',
    purchase_cycle: 4,
    stock_cost_ratio: 28,
    predicted_profit: 62.3,
    source_url: 'https://detail.1688.com/offer/678901.html',
    supplier_name: '义乌美妆工具厂',
    cost_price: 35.0,
  },
  {
    id: 'SP-007',
    name: '车载手机支架 重力感应 出风口通用',
    category: '汽车用品',
    platform: 'tiktok',
    sales_trend: 71.5,
    profit_margin: 38.9,
    compliance_status: 'passed',
    supply_chain: 'matched',
    purchase_cycle: 5,
    stock_cost_ratio: 30,
    predicted_profit: 48.6,
    source_url: 'https://detail.1688.com/offer/789012.html',
    supplier_name: '金华汽配有限公司',
    cost_price: 18.0,
  },
  {
    id: 'SP-008',
    name: '保温杯大容量 316不锈钢 便携水杯',
    category: '生活用品',
    platform: 'tiktok',
    sales_trend: 85.6,
    profit_margin: 41.2,
    compliance_status: 'passed',
    supply_chain: 'matched',
    purchase_cycle: 6,
    stock_cost_ratio: 26,
    predicted_profit: 58.9,
    source_url: 'https://detail.1688.com/offer/890123.html',
    supplier_name: '永康保温杯厂',
    cost_price: 32.0,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 解析请求参数
    const platform = body.platform || 'tiktok';
    const site = body.site || 'id';
    const count = body.count || 10;
    const minProfitRate = body.min_profit_rate || 0.3;
    const category = body.category;
    
    // 过滤符合利润率要求的产品
    let filteredProducts = MOCK_PRODUCTS.filter(
      (p) => p.profit_margin >= minProfitRate * 100
    );
    
    // 如果指定了类目，按类目过滤
    if (category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category.includes(category) || p.name.includes(category)
      );
    }
    
    // 限制返回数量
    filteredProducts = filteredProducts.slice(0, count);
    
    // 模拟AI处理延迟
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));
    
    return NextResponse.json({
      success: true,
      data: filteredProducts,
      message: `成功筛选出 ${filteredProducts.length} 个潜力商品`,
    });
  } catch (error) {
    console.error('Select products error:', error);
    return NextResponse.json(
      { success: false, data: [], error: '选品分析失败' },
      { status: 500 }
    );
  }
}
