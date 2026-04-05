import { NextRequest, NextResponse } from 'next/server';
import { getAllFinanceRecords } from '@/lib/data/finance-store';

/**
 * 获取财务汇总
 * GET /api/v1/erp/finance/summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const records = getAllFinanceRecords();

    // 计算汇总数据
    const incomeRecords = records.filter(r => r.type === 'income');
    const expenseRecords = records.filter(r => r.type === 'expense');

    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // 按类别分组
    const incomeByCategory = incomeRecords.reduce((acc, r) => {
      const key = `${r.category} - ${r.subcategory}`;
      acc[key] = (acc[key] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    const expenseByCategory = expenseRecords.reduce((acc, r) => {
      const key = `${r.category} - ${r.subcategory}`;
      acc[key] = (acc[key] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_profit: netProfit,
        profit_margin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
        income_records_count: incomeRecords.length,
        expense_records_count: expenseRecords.length,
      },
      income_breakdown: incomeByCategory,
      expense_breakdown: expenseByCategory,
    });
  } catch (error) {
    console.error('获取财务汇总失败:', error);
    return NextResponse.json(
      { error: '获取财务汇总失败' },
      { status: 500 }
    );
  }
}
