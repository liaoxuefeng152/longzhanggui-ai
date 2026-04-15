import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 模拟运营日报数据
    const today = new Date().toISOString().split('T')[0];
    
    const report = {
      date: today,
      summary: {
        orders: 23,
        ordersTrend: 15,
        sales: 687.5,
        salesTrend: 12,
        visitors: 456,
        visitorsTrend: -3,
        conversionRate: 5.04,
        conversionTrend: 0.5,
      },
      topProducts: [
        { id: 'SKU-001', name: '宠物饮水机', sales: 15, revenue: 375 },
        { id: 'SKU-002', name: '手机支架', sales: 8, revenue: 159.92 },
        { id: 'SKU-003', name: '折叠伞', sales: 5, revenue: 99.95 },
      ],
      alerts: [
        { type: 'inventory', product: 'SKU-001', message: '库存不足（剩余3件）', level: 'warning' },
        { type: 'ad', product: 'SKU-002', message: '广告ACOS偏高（32%）', level: 'info' },
      ],
      platformBreakdown: [
        { platform: 'TikTok', orders: 12, revenue: 356.4 },
        { platform: 'Shopee', orders: 8, revenue: 240.8 },
        { platform: 'Lazada', orders: 3, revenue: 90.3 },
      ],
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Daily Report Error:', error);
    return NextResponse.json(
      { error: '获取日报失败' },
      { status: 500 }
    );
  }
}
