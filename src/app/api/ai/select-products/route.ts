import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 模拟选品数据源
const MOCK_SOURCE_PRODUCTS = [
  {
    name: '宠物自动喂食器 5L大容量 智能定时',
    category: '宠物用品',
    sales_trend: 89.5,
    profit_margin: 42.3,
    source_url: 'https://detail.1688.com/offer/123456.html',
    supplier_name: '义乌宠物用品厂',
    cost_price: 45.5,
  },
  {
    name: '便携式榨汁机 USB充电 迷你随身杯',
    category: '家居电器',
    sales_trend: 76.8,
    profit_margin: 38.5,
    source_url: 'https://detail.1688.com/offer/234567.html',
    supplier_name: '深圳小家电有限公司',
    cost_price: 38.0,
  },
  {
    name: '隐形蓝牙耳机 运动入耳式 超长续航',
    category: '数码配件',
    sales_trend: 92.3,
    profit_margin: 48.6,
    source_url: 'https://detail.1688.com/offer/345678.html',
    supplier_name: '东莞数码科技',
    cost_price: 28.5,
  },
  {
    name: '瑜伽垫加厚防滑 NBR材质 环保无味',
    category: '运动健身',
    sales_trend: 65.4,
    profit_margin: 35.2,
    source_url: 'https://detail.1688.com/offer/456789.html',
    supplier_name: '河北体育用品厂',
    cost_price: 22.0,
  },
  {
    name: '多功能收纳盒 折叠式 衣物整理神器',
    category: '家居收纳',
    sales_trend: 58.9,
    profit_margin: 52.3,
    source_url: 'https://detail.1688.com/offer/567890.html',
    supplier_name: '台州塑料制品',
    cost_price: 12.5,
  },
  {
    name: 'LED化妆镜 带灯充电式 桌面折叠镜',
    category: '美妆工具',
    sales_trend: 81.2,
    profit_margin: 45.8,
    source_url: 'https://detail.1688.com/offer/678901.html',
    supplier_name: '义乌美妆工具厂',
    cost_price: 35.0,
  },
  {
    name: '车载手机支架 重力感应 出风口通用',
    category: '汽车用品',
    sales_trend: 71.5,
    profit_margin: 38.9,
    source_url: 'https://detail.1688.com/offer/789012.html',
    supplier_name: '金华汽配有限公司',
    cost_price: 18.0,
  },
  {
    name: '保温杯大容量 316不锈钢 便携水杯',
    category: '生活用品',
    sales_trend: 85.6,
    profit_margin: 41.2,
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
    const autoSave = body.auto_save !== false; // 默认保存到商品库
    
    // 过滤符合利润率要求的产品
    let filteredProducts = [...MOCK_SOURCE_PRODUCTS].filter(
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // 保存到商品库
    const savedProducts = [];
    for (const item of filteredProducts) {
      // 计算成本
      const costPrice = item.cost_price;
      const domesticShipping = 5;
      const firstMileShipping = 15;
      const totalCost = costPrice + domesticShipping + firstMileShipping;
      
      // 创建商品
      const product = store.createProduct({
        name_zh: item.name,
        name_en: item.name,
        category: item.category,
        source_url: item.source_url,
        supplier_name: item.supplier_name,
        cost_price: costPrice,
        domestic_shipping: domesticShipping,
        first_mile_shipping: firstMileShipping,
        total_cost: totalCost,
        selection_score: item.sales_trend,
        sales_trend: item.sales_trend,
        profit_margin: item.profit_margin,
        image_status: 'pending',
        listing_status: 'pending',
        compliance_status: 'pending',
        status: 'selected', // 选品完成状态
      });
      
      savedProducts.push({
        id: product.id,
        name: item.name,
        category: item.category,
        platform: platform,
        sales_trend: item.sales_trend,
        profit_margin: item.profit_margin,
        compliance_status: 'pending',
        supply_chain: 'matched',
        purchase_cycle: 5,
        stock_cost_ratio: 30,
        predicted_profit: item.profit_margin * totalCost / 100,
        source_url: item.source_url,
        supplier_name: item.supplier_name,
        cost_price: costPrice,
      });
    }
    
    return NextResponse.json({
      success: true,
      data: savedProducts,
      message: `成功筛选出 ${savedProducts.length} 个潜力商品${autoSave ? '，已保存到商品库' : ''}`,
    });
  } catch (error) {
    console.error('Select products error:', error);
    return NextResponse.json(
      { success: false, data: [], error: '选品分析失败' },
      { status: 500 }
    );
  }
}
