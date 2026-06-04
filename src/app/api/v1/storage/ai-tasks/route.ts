/**
 * AI Tasks API - Unified task tracking
 * GET  /api/v1/storage/ai-tasks          - List tasks
 * POST /api/v1/storage/ai-tasks          - Create task
 * PUT  /api/v1/storage/ai-tasks?id=xxx   - Update task
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAiTask, updateAiTask, listAiTasks } from '@/lib/storage/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get('agent_type') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const tasks = await listAiTasks({ agentType, status, limit });
    return NextResponse.json({ success: true, tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await createAiTask({
      agentType: body.agent_type,
      action: body.action,
      inputParams: body.input_params,
    });
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
    }

    const body = await request.json();
    const task = await updateAiTask(id, body);
    return NextResponse.json({ success: true, task });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
