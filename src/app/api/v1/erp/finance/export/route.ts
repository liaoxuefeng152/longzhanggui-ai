import { NextRequest, NextResponse } from 'next/server';

/**
 * 导出财务报表
 * GET /api/v1/erp/finance/export
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary'; // summary | detail
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    // 模拟财务数据
    const financeData = {
      summary: {
        total_sales: 125680.50,
        total_orders: 1256,
        total_cost: 75408.30,
        total_profit: 50272.20,
        profit_rate: 40.0,
        platform_fees: 12568.05,
        ad_spend: 8797.64,
        shipping_cost: 6284.03,
      },
      daily_data: [
        { date: '2026-03-20', sales: 4520.30, orders: 45, profit: 1808.12 },
        { date: '2026-03-21', sales: 5230.80, orders: 52, profit: 2092.32 },
        { date: '2026-03-22', sales: 4180.50, orders: 42, profit: 1672.20 },
        { date: '2026-03-23', sales: 6120.90, orders: 61, profit: 2448.36 },
        { date: '2026-03-24', sales: 5890.20, orders: 59, profit: 2356.08 },
        { date: '2026-03-25', sales: 4980.60, orders: 50, profit: 1992.24 },
        { date: '2026-03-26', sales: 5350.40, orders: 54, profit: 2140.16 },
      ],
      platform_breakdown: [
        { platform: 'TikTok', sales: 62840.25, orders: 628, profit: 25136.10 },
        { platform: 'Amazon', sales: 41130.80, orders: 411, profit: 16452.32 },
        { platform: 'Shopee', sales: 21709.45, orders: 217, profit: 8683.78 },
      ],
    };

    // 生成CSV内容
    let csvContent = '';
    
    if (reportType === 'summary') {
      // 汇总报表
      csvContent = '财务汇总报表\n';
      csvContent += `报表生成时间,${new Date().toLocaleString()}\n\n`;
      csvContent += '指标,金额(元)\n';
      csvContent += `总销售额,${financeData.summary.total_sales.toFixed(2)}\n`;
      csvContent += `总订单数,${financeData.summary.total_orders}\n`;
      csvContent += `总成本,${financeData.summary.total_cost.toFixed(2)}\n`;
      csvContent += `总利润,${financeData.summary.total_profit.toFixed(2)}\n`;
      csvContent += `利润率,${financeData.summary.profit_rate}%\n`;
      csvContent += `平台费用,${financeData.summary.platform_fees.toFixed(2)}\n`;
      csvContent += `广告支出,${financeData.summary.ad_spend.toFixed(2)}\n`;
      csvContent += `物流成本,${financeData.summary.shipping_cost.toFixed(2)}\n\n`;
      
      csvContent += '平台销售分布\n';
      csvContent += '平台,销售额,订单数,利润\n';
      financeData.platform_breakdown.forEach(item => {
        csvContent += `${item.platform},${item.sales.toFixed(2)},${item.orders},${item.profit.toFixed(2)}\n`;
      });
    } else {
      // 明细报表
      csvContent = '财务明细报表\n';
      csvContent += `报表生成时间,${new Date().toLocaleString()}\n`;
      csvContent += `查询日期范围,${startDate || '全部'} 至 ${endDate || '全部'}\n\n`;
      csvContent += '日期,销售额,订单数,利润\n';
      financeData.daily_data.forEach(item => {
        csvContent += `${item.date},${item.sales.toFixed(2)},${item.orders},${item.profit.toFixed(2)}\n`;
      });
      csvContent += `\n汇总,${financeData.summary.total_sales.toFixed(2)},${financeData.summary.total_orders},${financeData.summary.total_profit.toFixed(2)}\n`;
    }

    // 返回CSV文件
    const fileName = reportType === 'summary' ? 'finance_summary.csv' : 'finance_detail.csv';
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('导出报表失败:', error);
    return NextResponse.json(
      { success: false, message: '导出报表失败' },
      { status: 500 }
    );
  }
}
