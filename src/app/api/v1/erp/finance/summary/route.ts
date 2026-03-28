import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 获取财务记录
    let records = Array.from(store.financeRecords.values());
    
    if (startDate) {
      records = records.filter(r => r.record_date >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.record_date <= endDate);
    }

    // 按日期分组汇总
    const dailySummaries: Record<string, {
      date: string;
      total_sales: number;
      total_cost: number;
      shipping_fee: number;
      platform_fee: number;
      ad_cost: number;
      other_cost: number;
      gross_profit: number;
      order_count: number;
      refund_amount: number;
    }> = {};

    for (const record of records) {
      const date = record.record_date;
      if (!dailySummaries[date]) {
        dailySummaries[date] = {
          date,
          total_sales: 0,
          total_cost: 0,
          shipping_fee: 0,
          platform_fee: 0,
          ad_cost: 0,
          other_cost: 0,
          gross_profit: 0,
          order_count: 0,
          refund_amount: 0,
        };
      }

      const summary = dailySummaries[date];
      switch (record.record_type) {
        case 'income':
          summary.total_sales += record.amount;
          break;
        case 'expense':
          if (record.category === '采购成本') summary.total_cost += record.amount;
          else if (record.category === '物流费用') summary.shipping_fee += record.amount;
          else if (record.category === '平台佣金') summary.platform_fee += record.amount;
          else if (record.category === '广告费用') summary.ad_cost += record.amount;
          else summary.other_cost += record.amount;
          break;
        case 'refund':
          summary.refund_amount += record.amount;
          break;
      }
    }

    // 计算毛利润
    for (const date in dailySummaries) {
      const s = dailySummaries[date];
      s.gross_profit = s.total_sales - s.total_cost - s.shipping_fee - s.platform_fee - s.ad_cost - s.other_cost;
    }

    // 转换为数组并排序
    const items = Object.values(dailySummaries).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: { items, total: items.length }
    });
  } catch (error) {
    console.error('Get finance summary error:', error);
    return NextResponse.json({ success: false, error: '获取财务汇总失败' }, { status: 500 });
  }
}
