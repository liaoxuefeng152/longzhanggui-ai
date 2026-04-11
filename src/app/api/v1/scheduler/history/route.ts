/**
 * 定时任务执行历史 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

interface TaskExecution {
  id: string;
  task_id: string;
  task_name: string;
  task_type: string;
  status: 'running' | 'success' | 'failed';
  start_time: string;
  end_time?: string;
  duration?: number;
  result?: string;
  error?: string;
  logs: string[];
}

// 获取执行历史
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('task_id');
  const limit = parseInt(searchParams.get('limit') || '50');

  let executions = globalStore.taskExecutions || [];

  // 按任务筛选
  if (taskId) {
    executions = executions.filter((e: TaskExecution) => e.task_id === taskId);
  }

  // 按时间倒序
  executions.sort((a: TaskExecution, b: TaskExecution) => 
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  // 分页
  const total = executions.length;
  const page = Math.ceil(total / limit);
  const items = executions.slice(0, limit);

  return NextResponse.json({
    success: true,
    data: {
      items,
      total,
      page,
      limit,
    },
  });
}

// 创建执行记录（内部调用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, task_name, task_type, action } = body;

    if (!task_id || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!globalStore.taskExecutions) {
      globalStore.taskExecutions = [];
    }

    if (action === 'start') {
      // 记录开始
      const execution: TaskExecution = {
        id: `exec_${Date.now()}`,
        task_id,
        task_name,
        task_type,
        status: 'running',
        start_time: new Date().toISOString(),
        logs: [`[${new Date().toISOString()}] 任务开始执行`],
      };

      globalStore.taskExecutions.push(execution);

      return NextResponse.json({
        success: true,
        data: execution,
      });
    }

    if (action === 'complete') {
      // 查找正在执行的记录
      const running = globalStore.taskExecutions.find(
        (e: TaskExecution) => e.task_id === task_id && e.status === 'running'
      );

      if (running) {
        running.status = 'success';
        running.end_time = new Date().toISOString();
        running.duration = new Date(running.end_time).getTime() - new Date(running.start_time).getTime();
        running.result = body.result || '执行成功';
        running.logs.push(`[${running.end_time}] 任务执行完成`);
      }

      return NextResponse.json({
        success: true,
        data: running,
      });
    }

    if (action === 'fail') {
      const running = globalStore.taskExecutions.find(
        (e: TaskExecution) => e.task_id === task_id && e.status === 'running'
      );

      if (running) {
        running.status = 'failed';
        running.end_time = new Date().toISOString();
        running.duration = new Date(running.end_time).getTime() - new Date(running.start_time).getTime();
        running.error = body.error || '执行失败';
        running.logs.push(`[${running.end_time}] 任务执行失败: ${running.error}`);
      }

      return NextResponse.json({
        success: true,
        data: running,
      });
    }

    return NextResponse.json(
      { success: false, error: '未知操作' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}

// 添加执行日志
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, log } = body;

    if (!task_id || !log) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const running = globalStore.taskExecutions?.find(
      (e: TaskExecution) => e.task_id === task_id && e.status === 'running'
    );

    if (running) {
      running.logs.push(`[${new Date().toISOString()}] ${log}`);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}
