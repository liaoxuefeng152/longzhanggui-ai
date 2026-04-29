import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库 - 采购单
interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  products: {
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  expected_arrival?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}


// 初始化数据
function getPurchases(): PurchaseOrder[] {
  if (!global.__erp_purchases) {
    global.__erp_purchases = [
      {
        id: 'PO-001',
        po_number: 'PO-20240115-001',
        supplier_id: 'SUP-001',
        supplier_name: '深圳电子工厂',
        products: [
          {
            product_id: 'PROD-001',
            product_name: '无线蓝牙耳机',
            sku: 'EAR-BT-001',
            quantity: 100,
            unit_price: 45.00,
          },
        ],
        total_amount: 4500.00,
        status: 'pending',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        notes: '急需，请尽快发货',
      },
      {
        id: 'PO-002',
        po_number: 'PO-20240114-002',
        supplier_id: 'SUP-002',
        supplier_name: '广州服装批发',
        products: [
          {
            product_id: 'PROD-002',
            product_name: '运动T恤',
            sku: 'TSH-SPT-002',
            quantity: 200,
            unit_price: 28.00,
          },
        ],
        total_amount: 5600.00,
        status: 'confirmed',
        expected_arrival: '2024-01-20',
        created_at: '2024-01-14T14:20:00Z',
        updated_at: '2024-01-14T16:00:00Z',
      },
      {
        id: 'PO-003',
        po_number: 'PO-20240113-003',
        supplier_id: 'SUP-001',
        supplier_name: '深圳电子工厂',
        products: [
          {
            product_id: 'PROD-003',
            product_name: '智能手表',
            sku: 'WATCH-SMT-003',
            quantity: 50,
            unit_price: 120.00,
          },
        ],
        total_amount: 6000.00,
        status: 'shipped',
        expected_arrival: '2024-01-18',
        created_at: '2024-01-13T09:15:00Z',
        updated_at: '2024-01-15T08:00:00Z',
      },
      {
        id: 'PO-004',
        po_number: 'PO-20240112-004',
        supplier_id: 'SUP-003',
        supplier_name: '义乌小商品城',
        products: [
          {
            product_id: 'PROD-004',
            product_name: '手机壳',
            sku: 'CASE-PHN-004',
            quantity: 500,
            unit_price: 8.50,
          },
        ],
        total_amount: 4250.00,
        status: 'received',
        created_at: '2024-01-12T11:45:00Z',
        updated_at: '2024-01-17T10:30:00Z',
      },
      {
        id: 'PO-005',
        po_number: 'PO-20240111-005',
        supplier_id: 'SUP-002',
        supplier_name: '广州服装批发',
        products: [
          {
            product_id: 'PROD-005',
            product_name: '休闲裤',
            sku: 'PANT-CAS-005',
            quantity: 150,
            unit_price: 35.00,
          },
        ],
        total_amount: 5250.00,
        status: 'cancelled',
        created_at: '2024-01-11T15:30:00Z',
        updated_at: '2024-01-12T09:00:00Z',
        notes: '供应商缺货，取消订单',
      },
    ];
  }
  return global.__erp_purchases;
}

// GET - 获取采购单列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword')?.toLowerCase();
  const status = searchParams.get('status');
  const supplierId = searchParams.get('supplier_id');

  let purchases = getPurchases();

  // 过滤
  if (keyword) {
    purchases = purchases.filter(p => 
      p.po_number.toLowerCase().includes(keyword) ||
      p.supplier_name.toLowerCase().includes(keyword) ||
      p.products.some(prod => 
        prod.product_name.toLowerCase().includes(keyword) ||
        prod.sku.toLowerCase().includes(keyword)
      )
    );
  }

  if (status) {
    purchases = purchases.filter(p => p.status === status);
  }

  if (supplierId) {
    purchases = purchases.filter(p => p.supplier_id === supplierId);
  }

  return NextResponse.json({
    success: true,
    purchases,
    total: purchases.length,
  });
}

// POST - 创建采购单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplier_id, supplier_name, products, expected_arrival, notes } = body;

    // 验证必填字段
    if (!supplier_name || !products || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: '缺少必填字段',
      }, { status: 400 });
    }

    // 计算总金额
    const total_amount = products.reduce((sum: number, p: any) => {
      return sum + (p.quantity * p.unit_price);
    }, 0);

    // 生成采购单号
    const date = new Date();
    const po_number = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(getPurchases().length + 1).padStart(3, '0')}`;

    const newPurchase: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      po_number,
      supplier_id: supplier_id || 'SUP-DEFAULT',
      supplier_name,
      products,
      total_amount,
      status: 'pending',
      expected_arrival,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes,
    };

    getPurchases().push(newPurchase);

    return NextResponse.json({
      success: true,
      message: '采购单创建成功',
      purchase: newPurchase,
    });
  } catch (error) {
    console.error('创建采购单失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建采购单失败',
    }, { status: 500 });
  }
}
