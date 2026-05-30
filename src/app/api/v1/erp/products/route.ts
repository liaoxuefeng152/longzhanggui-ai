import { NextRequest, NextResponse } from 'next/server';

// 安全解析JSON字符串
function safeParseJSON(str: any): any {
  if (!str) return [];
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

// 模拟商品数据（直接从store复制）
const mockProducts = [
  {
    id: 'PROD001',
    internal_sku: 'SKU-PET-001',
    name_zh: '宠物自动喂食器 5L大容量',
    name_en: 'Automatic Pet Feeder 5L',
    category: '宠物用品',
    source_url: 'https://1688.com/product/1',
    supplier_name: '深圳市电子科技有限公司',
    cost_price: 89,
    domestic_shipping: 5,
    first_mile_shipping: 15,
    total_cost: 109,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 89.5,
    sales_trend: 92,
    profit_margin: 42,
    total_sales: 156,
    total_orders: 89,
    total_profit: 12800,
    created_at: '2026-03-15 10:30:00',
    updated_at: '2026-03-21 14:20:00',
  },
  {
    id: 'PROD002',
    internal_sku: 'SKU-HOME-001',
    name_zh: '便携式榨汁机 USB充电',
    name_en: 'Portable Juicer USB Rechargeable',
    category: '家居电器',
    source_url: 'https://1688.com/product/2',
    supplier_name: '深圳市电子科技有限公司',
    cost_price: 45,
    domestic_shipping: 4,
    first_mile_shipping: 12,
    total_cost: 61,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 76.2,
    total_sales: 89,
    total_orders: 52,
    total_profit: 6800,
    created_at: '2026-03-16 15:20:00',
    updated_at: '2026-03-21 11:00:00',
  },
  {
    id: 'PROD003',
    internal_sku: 'SKU-BEAUTY-001',
    name_zh: 'LED化妆镜 台式带灯',
    name_en: 'LED Makeup Mirror Desktop',
    category: '美妆工具',
    source_url: 'https://1688.com/product/3',
    supplier_name: '广州市家居用品有限公司',
    cost_price: 35,
    domestic_shipping: 3,
    first_mile_shipping: 10,
    total_cost: 48,
    image_status: 'processing',
    listing_status: 'pending',
    compliance_status: 'checking',
    status: 'processing',
    selection_score: 68.4,
    created_at: '2026-03-18 09:45:00',
    updated_at: '2026-03-21 10:30:00',
  },
  {
    id: 'PROD004',
    internal_sku: 'SKU-ELEC-001',
    name_zh: '智能手环 运动监测',
    name_en: 'Smart Fitness Tracker',
    category: '电子数码',
    source_url: 'https://1688.com/product/4',
    supplier_name: '深圳市电子科技有限公司',
    cost_price: 68,
    domestic_shipping: 5,
    first_mile_shipping: 18,
    total_cost: 91,
    image_status: 'pending',
    listing_status: 'pending',
    compliance_status: 'failed',
    compliance_issues: ['含禁售品类'],
    status: 'draft',
    selection_score: 45.2,
    created_at: '2026-03-17 14:10:00',
    updated_at: '2026-03-20 16:45:00',
  },
  // 妙手ERP风格商品 - iPad/平板保护套
  {
    id: 'PROD005',
    internal_sku: 'SKU-IPAD-001',
    name_zh: '苹果 iPad Pro 11寸磁吸拆分保护壳 带笔槽 防摔 透明 2024款',
    name_en: 'Apple iPad Pro 11 inch Magnetic Split Case with Pen Slot',
    category: '平板电脑配件>平板电脑保护套/壳',
    source_url: 'https://detail.1688.com/offer/965485657984.html',
    supplier_name: 'CoolShield源工厂',
    cost_price: 27.80,
    domestic_shipping: 0,
    first_mile_shipping: 8,
    total_cost: 35.80,
    weight_kg: 0.4,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 92.5,
    sales_trend: 88,
    profit_margin: 38,
    total_sales: 63931,
    total_orders: 28543,
    total_profit: 156800,
    created_at: '2026-04-22 22:35:44',
    updated_at: '2026-04-22 22:35:44',
  },
  {
    id: 'PROD006',
    internal_sku: 'SKU-IPAD-002',
    name_zh: '适用2025苹果iPad Pro 11寸磁吸拆分保护壳 带笔槽 防摔 10.2旋转',
    name_en: 'Compatible 2025 Apple iPad Pro 11 inch Magnetic Split Case',
    category: '平板电脑配件>平板电脑保护套/壳',
    source_url: 'https://detail.1688.com/offer/735049329987.html',
    supplier_name: 'CoolShield源工厂',
    cost_price: 26.00,
    domestic_shipping: 0,
    first_mile_shipping: 8,
    total_cost: 34.00,
    weight_kg: 0.45,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 90.1,
    sales_trend: 85,
    profit_margin: 36,
    total_sales: 970227,
    total_orders: 432156,
    total_profit: 892000,
    created_at: '2026-04-22 18:43:08',
    updated_at: '2026-04-22 18:43:08',
  },
  {
    id: 'PROD007',
    internal_sku: 'SKU-KINDLE-001',
    name_zh: '适用Kindle 2024保护套 四角防摔透明 K12 KPW6 KC TPU软壳',
    name_en: 'Compatible Kindle 2024 Case Four Corner Protection',
    category: '电子教育设备>电子书阅读器',
    source_url: 'https://detail.1688.com/offer/846511244072.html',
    supplier_name: 'Kindle源工厂',
    cost_price: 5.00,
    domestic_shipping: 0,
    first_mile_shipping: 5,
    total_cost: 10.00,
    weight_kg: 0.06,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 78.3,
    sales_trend: 72,
    profit_margin: 45,
    total_sales: 1558903,
    total_orders: 689234,
    total_profit: 1256000,
    created_at: '2026-04-22 18:17:38',
    updated_at: '2026-04-22 18:17:38',
  },
  {
    id: 'PROD008',
    internal_sku: 'SKU-IPAD-003',
    name_zh: '蒂连卡通笔槽平板套 三折智能Ipad套立体贴公仔苹果平板套',
    name_en: 'Cute Cartoon Pen Slot Tablet Case',
    category: '平板电脑配件>平板电脑保护套/壳',
    source_url: 'https://detail.1688.com/offer/813938123647.html',
    supplier_name: '卡通源工厂',
    cost_price: 23.00,
    domestic_shipping: 0,
    first_mile_shipping: 8,
    total_cost: 31.00,
    weight_kg: 10.0,
    image_status: 'done',
    listing_status: 'processing',
    compliance_status: 'passed',
    status: 'processing',
    selection_score: 65.8,
    sales_trend: 58,
    profit_margin: 32,
    total_sales: 776,
    total_orders: 345,
    total_profit: 8920,
    created_at: '2026-04-22 10:06:04',
    updated_at: '2026-04-22 10:06:04',
  },
  {
    id: 'PROD009',
    internal_sku: 'SKU-HUAWEI-001',
    name_zh: '25款适用华为平板MatePad 11.5S保护套 带笔槽 亚克力 防弯 Mini',
    name_en: 'Compatible Huawei MatePad 11.5S Case',
    category: '平板电脑配件>平板电脑保护套/壳',
    source_url: 'https://detail.1688.com/offer/892235798691.html',
    supplier_name: '华为源工厂',
    cost_price: 12.90,
    domestic_shipping: 0,
    first_mile_shipping: 6,
    total_cost: 18.90,
    weight_kg: 0.22,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 82.4,
    sales_trend: 79,
    profit_margin: 41,
    total_sales: 489588,
    total_orders: 218765,
    total_profit: 687000,
    created_at: '2026-04-22 09:46:34',
    updated_at: '2026-04-22 09:46:34',
  },
  {
    id: 'PROD010',
    internal_sku: 'SKU-SAMSUNG-001',
    name_zh: 'Samsung Tab S10 Lite 硅胶 带笔槽 透明 防摔',
    name_en: 'Samsung Tab S10 Lite Silicone Case',
    category: '平板电脑配件>平板电脑保护套/壳',
    source_url: 'https://detail.1688.com/offer/972683855031.html',
    supplier_name: '三星源工厂',
    cost_price: 18.00,
    domestic_shipping: 0,
    first_mile_shipping: 7,
    total_cost: 25.00,
    weight_kg: 0.222,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 75.6,
    sales_trend: 68,
    profit_margin: 35,
    total_sales: 248798,
    total_orders: 110432,
    total_profit: 345600,
    created_at: '2026-04-22 08:26:31',
    updated_at: '2026-04-22 08:26:31',
  },
  {
    id: 'PROD011',
    internal_sku: 'SKU-IPAD-004',
    name_zh: '2024新款iPad Air 6代保护套 MINI67 防弯 Pro 亚克力 皮套',
    name_en: '2024 New iPad Air 6 Case',
    category: '平板电脑配件>平板电脑保护套/壳',
    source_url: 'https://detail.1688.com/offer/645129833123.html',
    supplier_name: '苹果源工厂',
    cost_price: 14.00,
    domestic_shipping: 0,
    first_mile_shipping: 6,
    total_cost: 20.00,
    weight_kg: 0.3,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 80.2,
    sales_trend: 76,
    profit_margin: 39,
    total_sales: 2769,
    total_orders: 1234,
    total_profit: 45600,
    created_at: '2026-04-22 00:04:57',
    updated_at: '2026-04-22 00:04:57',
  },
  {
    id: 'PROD012',
    internal_sku: 'SKU-IPAD-005',
    name_zh: '720度旋转适用苹果iPad Pro保护套 Air5 平板 亚克力',
    name_en: '720 Rotation iPad Pro Case',
    category: '平板电脑配件>平板电脑保护套/壳',
    source_url: 'https://detail.1688.com/offer/848146517875.html',
    supplier_name: '旋转源工厂',
    cost_price: 13.50,
    domestic_shipping: 0,
    first_mile_shipping: 6,
    total_cost: 19.50,
    weight_kg: 0.24,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 77.8,
    sales_trend: 71,
    profit_margin: 37,
    total_sales: 445319,
    total_orders: 198234,
    total_profit: 589000,
    created_at: '2026-04-21 15:59:24',
    updated_at: '2026-04-21 15:59:24',
  },
  {
    id: 'PROD013',
    internal_sku: 'SKU-CABLE-001',
    name_zh: '正品Type-C公对公数据线 PD快充线 双头 MacBook充电线',
    name_en: 'Original Type-C Male to Male Cable PD Fast Charge',
    category: '手机配件>充电线、充电器&转换器',
    source_url: 'https://detail.1688.com/offer/723487849652.html',
    supplier_name: '数据线源工厂',
    cost_price: 19.90,
    domestic_shipping: 0,
    first_mile_shipping: 4,
    total_cost: 23.90,
    weight_kg: 0.05,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 71.3,
    sales_trend: 65,
    profit_margin: 42,
    total_sales: 14809,
    total_orders: 6578,
    total_profit: 125000,
    created_at: '2026-04-18 12:51:42',
    updated_at: '2026-04-18 12:51:42',
  },
  {
    id: 'PROD014',
    internal_sku: 'SKU-STAND-001',
    name_zh: '手机全金属360度旋转支架 桌面机械平板通用折叠 解压便携式',
    name_en: '360 Rotation Metal Phone Stand',
    category: '手机配件>手机支架',
    source_url: 'https://detail.1688.com/offer/954865221024.html',
    supplier_name: '支架源工厂',
    cost_price: 1.48,
    domestic_shipping: 0,
    first_mile_shipping: 3,
    total_cost: 4.48,
    weight_kg: 0.09,
    image_status: 'done',
    listing_status: 'done',
    compliance_status: 'passed',
    status: 'published',
    selection_score: 68.9,
    sales_trend: 62,
    profit_margin: 55,
    total_sales: 300,
    total_orders: 134,
    total_profit: 8900,
    created_at: '2026-04-18 12:03:09',
    updated_at: '2026-04-18 12:03:09',
  },
  {
    id: 'PROD015',
    internal_sku: 'SKU-NEW-001',
    name_zh: '无线蓝牙耳机 降噪款',
    name_en: 'Wireless Bluetooth Earbuds ANC',
    category: '电子数码>耳机',
    source_url: 'https://detail.1688.com/offer/123456789.html',
    supplier_name: '音频源工厂',
    cost_price: 58,
    domestic_shipping: 0,
    first_mile_shipping: 12,
    total_cost: 70,
    weight_kg: 0.15,
    image_status: 'pending',
    listing_status: 'pending',
    compliance_status: 'pending',
    status: 'selected',
    selection_score: 85.2,
    sales_trend: 82,
    profit_margin: 40,
    created_at: '2026-04-23 09:00:00',
    updated_at: '2026-04-23 09:00:00',
  },
  {
    id: 'PROD016',
    internal_sku: 'SKU-NEW-002',
    name_zh: '智能手表 儿童定位版',
    name_en: 'Smart Watch Kids GPS',
    category: '电子数码>智能手表',
    source_url: 'https://detail.1688.com/offer/234567890.html',
    supplier_name: '手表源工厂',
    cost_price: 89,
    domestic_shipping: 0,
    first_mile_shipping: 15,
    total_cost: 104,
    weight_kg: 0.2,
    image_status: 'pending',
    listing_status: 'pending',
    compliance_status: 'checking',
    status: 'processing',
    selection_score: 72.6,
    sales_trend: 68,
    profit_margin: 35,
    created_at: '2026-04-23 10:30:00',
    updated_at: '2026-04-23 10:30:00',
  },
];

// 内存存储（模拟数据库）
let products = [...mockProducts];

// GET - 获取商品列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '100');

    // 优先从Python后端获取真实数据
    try {
      const authHeader = request.headers.get('authorization') || '';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const backendResponse = await fetch(
        `${backendUrl}/api/v1/erp/products?keyword=${encodeURIComponent(keyword)}&status=${encodeURIComponent(status)}&page=${page}&page_size=${pageSize}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {}),
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        if (backendData.items && Array.isArray(backendData.items)) {
          // 解析images字段（后端存储为JSON字符串）
          const items = backendData.items.map((p: any) => ({
            ...p,
            images: typeof p.images === 'string' ? safeParseJSON(p.images) : (p.images || []),
            processed_images: typeof p.processed_images === 'string' ? safeParseJSON(p.processed_images) : (p.processed_images || []),
            skus: typeof p.skus === 'string' ? safeParseJSON(p.skus) : (p.skus || []),
            category: p.category_name || p.category,
          }));
          return NextResponse.json({
            items,
            total: backendData.total || items.length,
            page: backendData.page || page,
            page_size: backendData.page_size || pageSize,
          });
        }
      }
    } catch (backendError) {
      console.warn('[ERP商品API] 后端不可用，使用本地数据:', (backendError as Error).message);
    }

    // Fallback: 本地内存数据

    // 筛选
    let filteredProducts = products;
    if (keyword) {
      filteredProducts = filteredProducts.filter(p =>
        p.name_zh.toLowerCase().includes(keyword.toLowerCase()) ||
        p.internal_sku.toLowerCase().includes(keyword.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(keyword.toLowerCase()))
      );
    }
    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }

    // 排序（按创建时间倒序）
    filteredProducts = filteredProducts.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // 分页
    const total = filteredProducts.length;
    const startIndex = (page - 1) * pageSize;
    const items = filteredProducts.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      items,
      total,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { error: '获取商品列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建商品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProduct = {
      id: `PROD${String(products.length + 1).padStart(3, '0')}`,
      internal_sku: body.internal_sku || `SKU-NEW-${Date.now()}`,
      name_zh: body.name_zh,
      name_en: body.name_en || '',
      category: body.category_name || body.category || '',
      source_url: body.source_url || '',
      supplier_name: body.supplier_name || '',
      cost_price: body.cost_price || 0,
      domestic_shipping: body.domestic_shipping || 0,
      first_mile_shipping: body.first_mile_shipping || 0,
      total_cost: (body.cost_price || 0) + (body.domestic_shipping || 0) + (body.first_mile_shipping || 0),
      image_status: 'pending',
      listing_status: 'pending',
      compliance_status: 'pending',
      status: body.status || 'selected',
      selection_score: 0,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    products.unshift(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    );
  }
}
