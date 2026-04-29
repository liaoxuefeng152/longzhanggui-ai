import { NextResponse } from 'next/server';

export async function GET() {
  // 返回模拟的统计数据
  const stats = {
    success: true,
    data: {
      overview: {
        total_products: 156,
        total_orders: 89,
        total_revenue: 45678.5,
        pending_orders: 12
      },
      products: {
        draft: 23,
        selected: 45,
        processing: 34,
        ready: 28,
        published: 156,
        archived: 12
      },
      orders: {
        pending: 12,
        processing: 23,
        shipped: 45,
        completed: 89
      },
      ai_agents: {
        selection: { tasks: 45, success_rate: 92 },
        image: { tasks: 123, success_rate: 95 },
        listing: { tasks: 67, success_rate: 88 },
        ad: { tasks: 34, success_rate: 85 }
      },
      recent_orders: [
        { id: 'ORD001', customer: 'John Doe', amount: 299.99, status: 'pending', created_at: '2024-01-15' },
        { id: 'ORD002', customer: 'Jane Smith', amount: 149.50, status: 'shipped', created_at: '2024-01-14' },
        { id: 'ORD003', customer: 'Bob Wilson', amount: 89.00, status: 'completed', created_at: '2024-01-13' }
      ]
    }
  };

  return NextResponse.json(stats);
}
