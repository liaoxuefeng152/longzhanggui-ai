import { NextResponse } from 'next/server';
import { supabase } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    // 从数据库查询真实统计数据
    
    // 1. 商品统计
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // 2. 订单统计
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    // 3. 库存统计
    const { count: totalInventory } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
    
    // 4. 供应商统计
    const { count: totalSuppliers } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    // 5. AI任务统计
    const { data: aiTasks } = await supabase
      .from('ai_tasks')
      .select('agent_id, status');
    
    // 6. 最近订单
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, buyer_name, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    // 汇总AI任务统计
    const agentStats = {
      product_selection: { tasks: 0, success: 0 },
      image_design: { tasks: 0, success: 0 },
      video_generation: { tasks: 0, success: 0 },
      listing_optimization: { tasks: 0, success: 0 },
      advertising: { tasks: 0, success: 0 },
      customer_service: { tasks: 0, success: 0 },
      data_review: { tasks: 0, success: 0 }
    };
    
    if (aiTasks && aiTasks.length > 0) {
      aiTasks.forEach(task => {
        const agentId = task.agent_id?.replace('-', '_') as keyof typeof agentStats;
        if (agentStats[agentId]) {
          agentStats[agentId].tasks++;
          if (task.status === 'success' || task.status === 'completed') {
            agentStats[agentId].success++;
          }
        }
      });
    }
    
    // 计算成功率
    const aiAgents = Object.entries(agentStats).map(([key, value]) => ({
      agent_id: key.replace('_', '-'),
      tasks: value.tasks,
      success_rate: value.tasks > 0 ? Math.round((value.success / value.tasks) * 100) : 0
    }));
    
    const stats = {
      success: true,
      data: {
        overview: {
          total_products: totalProducts || 0,
          total_orders: totalOrders || 0,
          total_revenue: 0, // 需要从财务表计算
          pending_orders: 0, // 需要根据状态过滤
          total_suppliers: totalSuppliers || 0,
          total_inventory: totalInventory || 0
        },
        products: {
          draft: 0,
          selected: 0,
          processing: 0,
          ready: 0,
          published: 0,
          archived: 0
          // 需要根据status分组统计
        },
        orders: {
          pending: 0,
          processing: 0,
          shipped: 0,
          completed: 0
          // 需要根据status分组统计
        },
        ai_agents: aiAgents,
        recent_orders: recentOrders?.map(order => ({
          id: order.id,
          customer: order.buyer_name || '未知',
          amount: order.total_amount || 0,
          status: order.status,
          created_at: order.created_at
        })) || []
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Dashboard API] 查询失败:', error);
    // 返回空数据而不是模拟数据
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_products: 0,
          total_orders: 0,
          total_revenue: 0,
          pending_orders: 0,
          total_suppliers: 0,
          total_inventory: 0
        },
        products: { draft: 0, selected: 0, processing: 0, ready: 0, published: 0, archived: 0 },
        orders: { pending: 0, processing: 0, shipped: 0, completed: 0 },
        ai_agents: [],
        recent_orders: []
      }
    });
  }
}