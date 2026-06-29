import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 模拟数据 - 实际应从数据库查询
    const mockLog = {
      id,
      task_id: `task-${id}`,
      agent_id: 'video-generation',
      agent_name: '视频生成',
      action: '商品视频',
      status: 'success',
      duration: 45.0,
      tokens_used: 0,
      cost: 0.50,
      request_params: { prompt: '宠物喂食器展示视频', duration: 15 },
      response_summary: '生成15秒商品展示视频',
      created_at: '2026-06-29 00:59:40',
      // 详细输出
      output_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      output_storage_key: 'mov_bbb_0b6cc2d7.mp4',
    };

    return NextResponse.json(mockLog);
  } catch (error) {
    console.error('[TaskLog Detail API] Error:', error);
    return NextResponse.json({ error: '获取任务详情失败' }, { status: 500 });
  }
}

// 重试任务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 模拟重试逻辑
    return NextResponse.json({
      message: '任务重试已提交',
      task_id: id,
      status: 'processing',
    });
  } catch (error) {
    console.error('[TaskLog Retry API] Error:', error);
    return NextResponse.json({ error: '重试任务失败' }, { status: 500 });
  }
}