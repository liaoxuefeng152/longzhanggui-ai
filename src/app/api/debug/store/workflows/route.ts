import { NextResponse } from 'next/server';
import store from '@/lib/store';

/**
 * 调试API：查看全局存储中的工作流数据
 */
export async function GET() {
  try {
    const workflows = store.getWorkflows();

    return NextResponse.json({
      success: true,
      data: {
        total: workflows.length,
        workflows: workflows.map(w => ({
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
            started_at: s.started_at,
            completed_at: s.completed_at,
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    return NextResponse.json(
      { success: false, error: '获取工作流失败' },
      { status: 500 }
    );
  }
}
