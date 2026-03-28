import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('product_id');
    
    let workflows = store.getWorkflows();
    
    // 过滤
    if (status) {
      workflows = workflows.filter(w => w.status === status);
    }
    if (productId) {
      workflows = workflows.filter(w => w.product_id === productId);
    }

    // 添加进度信息
    const workflowsWithProgress = workflows.map(w => {
      const completedSteps = w.steps.filter(s => s.status === 'completed').length;
      const progress = w.total_steps > 0 
        ? Math.round((completedSteps / w.total_steps) * 100) 
        : 0;
      return {
        ...w,
        progress,
        completed_steps: completedSteps,
      };
    });

    return NextResponse.json({
      success: true,
      data: workflowsWithProgress,
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    return NextResponse.json({ success: false, error: '获取工作流列表失败' }, { status: 500 });
  }
}
