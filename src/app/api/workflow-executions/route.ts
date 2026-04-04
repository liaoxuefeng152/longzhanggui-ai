import { NextResponse } from 'next/server';
import store from '@/lib/store';

/**
 * API: 获取工作流执行列表（前端使用）
 */
export async function GET() {
  try {
    const executions = store.getWorkflows();

    return NextResponse.json({
      success: true,
      data: executions.map(w => ({
        id: w.id,
        template_name: w.template_name,
        product_id: w.product_id,
        product_name: w.product_name,
        status: w.status,
        current_step: w.current_step,
        total_steps: w.total_steps,
        started_at: w.started_at,
        completed_at: w.completed_at,
        steps: w.steps.map(s => ({
          id: s.id,
          name: s.name,
          status: s.status,
        })),
      })),
    });
  } catch (error) {
    console.error('Get workflow executions error:', error);
    return NextResponse.json(
      { success: false, error: '获取工作流执行列表失败' },
      { status: 500 }
    );
  }
}
