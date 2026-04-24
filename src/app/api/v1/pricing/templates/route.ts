import { NextRequest, NextResponse } from 'next/server';

// 定价模板类型
interface PricingTemplate {
  id: string;
  name: string;
  site: string;
  type: string;
  exchangeRate: number | null;
  profit: {
    method: 'cost_rate' | 'price_rate';
    rate: number;
    discount: number;
  };
  cost: {
    shipping: {
      method: 'official' | 'custom';
      amount: number;
      weightBased: boolean;
      merchantShare: boolean;
    };
    platform: {
      commission: number;
      transactionFee: number;
      vat: number;
      tariff: number;
      withdrawalFee: number;
      influencerFee: number;
      infrastructureFee: number;
      growthServiceFee: number;
    };
    otherFees: number;
  };
  rounding: {
    scope: 'before_tax' | 'display';
    method: 'none' | 'up' | 'down' | 'round';
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 全局存储
const templates: PricingTemplate[] = [
  {
    id: 'T001',
    name: '3C模板',
    site: 'TH',
    type: 'cross_border',
    exchangeRate: 5.1,
    profit: {
      method: 'cost_rate',
      rate: 30,
      discount: 100,
    },
    cost: {
      shipping: {
        method: 'official',
        amount: 16.76,
        weightBased: true,
        merchantShare: false,
      },
      platform: {
        commission: 5.35,
        transactionFee: 3.21,
        vat: 7,
        tariff: 10,
        withdrawalFee: 1,
        influencerFee: 0,
        infrastructureFee: 0.23,
        growthServiceFee: 0,
      },
      otherFees: 2,
    },
    rounding: {
      scope: 'before_tax',
      method: 'none',
      amount: 0,
    },
    createdAt: '2024-01-10 10:00:00',
    updatedAt: '2024-01-15 14:30:00',
  },
  {
    id: 'T002',
    name: '美妆模板',
    site: 'ID',
    type: 'cross_border',
    exchangeRate: 2100,
    profit: {
      method: 'cost_rate',
      rate: 35,
      discount: 95,
    },
    cost: {
      shipping: {
        method: 'official',
        amount: 18.5,
        weightBased: true,
        merchantShare: false,
      },
      platform: {
        commission: 6,
        transactionFee: 2.5,
        vat: 10,
        tariff: 15,
        withdrawalFee: 1,
        influencerFee: 5,
        infrastructureFee: 0.5,
        growthServiceFee: 0,
      },
      otherFees: 3,
    },
    rounding: {
      scope: 'before_tax',
      method: 'round',
      amount: 9,
    },
    createdAt: '2024-01-08 09:00:00',
    updatedAt: '2024-01-12 16:00:00',
  },
  {
    id: 'T003',
    name: '家居模板',
    site: 'MY',
    type: 'cross_border',
    exchangeRate: null,
    profit: {
      method: 'price_rate',
      rate: 25,
      discount: 100,
    },
    cost: {
      shipping: {
        method: 'custom',
        amount: 20,
        weightBased: false,
        merchantShare: false,
      },
      platform: {
        commission: 4.5,
        transactionFee: 2,
        vat: 6,
        tariff: 8,
        withdrawalFee: 0.5,
        influencerFee: 0,
        infrastructureFee: 0.15,
        growthServiceFee: 0,
      },
      otherFees: 1,
    },
    rounding: {
      scope: 'display',
      method: 'up',
      amount: 9,
    },
    createdAt: '2024-01-05 11:00:00',
    updatedAt: '2024-01-14 10:00:00',
  },
];

// 站点映射
const siteNames: Record<string, string> = {
  'TH': '泰国',
  'ID': '印尼',
  'VN': '越南',
  'MY': '马来西亚',
  'PH': '菲律宾',
  'SG': '新加坡',
};

// 利润方式映射
const profitMethodNames: Record<string, string> = {
  'cost_rate': '成本利润率',
  'price_rate': '售价利润率',
};

// 获取模板列表
export async function GET() {
  const result = templates.map(t => ({
    ...t,
    siteName: siteNames[t.site] || t.site,
    profitMethodName: profitMethodNames[t.profit.method],
  }));
  return NextResponse.json({ success: true, data: result });
}

// 创建模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newTemplate: PricingTemplate = {
      id: `T${Date.now()}`,
      name: body.name,
      site: body.site || 'TH',
      type: body.type || 'cross_border',
      exchangeRate: body.exchangeRate || null,
      profit: body.profit || {
        method: 'cost_rate',
        rate: 30,
        discount: 100,
      },
      cost: body.cost || {
        shipping: {
          method: 'official',
          amount: 0,
          weightBased: true,
          merchantShare: false,
        },
        platform: {
          commission: 5,
          transactionFee: 2,
          vat: 7,
          tariff: 10,
          withdrawalFee: 1,
          influencerFee: 0,
          infrastructureFee: 0,
          growthServiceFee: 0,
        },
        otherFees: 0,
      },
      rounding: body.rounding || {
        scope: 'before_tax',
        method: 'none',
        amount: 0,
      },
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    
    templates.push(newTemplate);
    
    return NextResponse.json({
      success: true,
      data: {
        ...newTemplate,
        siteName: siteNames[newTemplate.site],
        profitMethodName: profitMethodNames[newTemplate.profit.method],
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 400 });
  }
}

// 更新模板
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const index = templates.findIndex(t => t.id === body.id);
    
    if (index === -1) {
      return NextResponse.json({ success: false, error: '模板不存在' }, { status: 404 });
    }
    
    templates[index] = {
      ...templates[index],
      name: body.name ?? templates[index].name,
      site: body.site ?? templates[index].site,
      type: body.type ?? templates[index].type,
      exchangeRate: body.exchangeRate ?? templates[index].exchangeRate,
      profit: body.profit ?? templates[index].profit,
      cost: body.cost ?? templates[index].cost,
      rounding: body.rounding ?? templates[index].rounding,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    
    return NextResponse.json({
      success: true,
      data: {
        ...templates[index],
        siteName: siteNames[templates[index].site],
        profitMethodName: profitMethodNames[templates[index].profit.method],
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 400 });
  }
}

// 删除模板
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID参数' }, { status: 400 });
    }
    
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: '模板不存在' }, { status: 404 });
    }
    
    templates.splice(index, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 400 });
  }
}
