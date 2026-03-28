import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = store.getWorkflow(id);
    
    if (!workflow) {
      return NextResponse.json({ success: false, error: '工作流不存在' }, { status: 404 });
    }

    // 计算进度
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    const progress = workflow.total_steps > 0 
      ? Math.round((completedSteps / workflow.total_steps) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...workflow,
        progress,
        completed_steps: completedSteps,
      }
    });
  } catch (error) {
    console.error('Get workflow status error:', error);
    return NextResponse.json({ success: false, error: '获取工作流状态失败' }, { status: 500 });
  }
}
