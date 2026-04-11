/**
 * 定时任务调度系统 API
 * 支持定时任务的管理、配置和执行
 */

import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

// 任务类型定义
interface ScheduledTask {
  id: string;
  name: string;
  type: string;
  description: string;
  cron_expression: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  result?: string;
  config: Record<string, any>;
}

// 预定义的任务模板
const TASK_TEMPLATES = [
  {
    type: 'order_sync',
    name: '订单同步',
    description: '从各平台自动同步订单数据',
    defaultCron: '*/5 * * * *', // 每5分钟
    icon: 'ShoppingCart',
    color: '#3B82F6',
  },
  {
    type: 'inventory_check',
    name: '库存盘点',
    description: '检查库存水位，生成补货建议',
    defaultCron: '0 2 * * *', // 每天凌晨2点
    icon: 'Package',
    color: '#10B981',
  },
  {
    type: 'logistics_track',
    name: '物流追踪',
    description: '批量查询物流状态，更新轨迹',
    defaultCron: '0 */2 * * *', // 每2小时
    icon: 'Truck',
    color: '#F59E0B',
  },
  {
    type: 'daily_report',
    name: '生成日报',
    description: '自动生成每日运营报表',
    defaultCron: '0 9 * * *', // 每天早上9点
    icon: 'FileText',
    color: '#8B5CF6',
  },
  {
    type: 'inventory_alert',
    name: '库存预警',
    description: '检测低库存商品并推送预警',
    defaultCron: '0 8,12,18 * * *', // 每天8点、12点、18点
    icon: 'AlertTriangle',
    color: '#EF4444',
  },
  {
    type: 'ad_optimize',
    name: '广告优化',
    description: '分析广告数据，自动优化出价',
    defaultCron: '0 */4 * * *', // 每4小时
    icon: 'TrendingUp',
    color: '#EC4899',
  },
  {
    type: 'refund_process',
    name: '退款处理',
    description: '自动处理退款请求',
    defaultCron: '*/15 * * * *', // 每15分钟
    icon: 'RefreshCw',
    color: '#06B6D4',
  },
  {
    type: 'data_backup',
    name: '数据备份',
    description: '自动备份系统数据',
    defaultCron: '0 3 * * *', // 每天凌晨3点
    icon: 'Database',
    color: '#6366F1',
  },
];

// 获取所有任务
export async function GET() {
  const tasks = globalStore.scheduledTasks || [];
  
  // 计算下次执行时间
  const tasksWithNextRun = tasks.map((task: ScheduledTask) => {
    return {
      ...task,
      template: TASK_TEMPLATES.find(t => t.type === task.type),
      next_run: calculateNextRun(task.cron_expression),
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      tasks: tasksWithNextRun,
      templates: TASK_TEMPLATES,
    },
  });
}

// 创建新任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, cron_expression, enabled, config } = body;

    if (!name || !type || !cron_expression) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const task: ScheduledTask = {
      id: `task_${Date.now()}`,
      name,
      type,
      description: TASK_TEMPLATES.find(t => t.type === type)?.description || '',
      cron_expression,
      enabled: enabled ?? true,
      status: 'idle',
      config: config || {},
      next_run: calculateNextRun(cron_expression),
    };

    // 保存到全局存储
    if (!globalStore.scheduledTasks) {
      globalStore.scheduledTasks = [];
    }
    globalStore.scheduledTasks.push(task);

    // 记录操作日志
    globalStore.operationLogs?.push({
      id: `log_${Date.now()}`,
      action: 'create_scheduled_task',
      target: task.id,
      target_name: task.name,
      operator: 'system',
      result: 'success',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建任务失败' },
      { status: 500 }
    );
  }
}

// 更新任务
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }

    const tasks = globalStore.scheduledTasks || [];
    const index = tasks.findIndex((t: ScheduledTask) => t.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    // 更新任务
    tasks[index] = {
      ...tasks[index],
      ...updates,
      next_run: updates.cron_expression 
        ? calculateNextRun(updates.cron_expression) 
        : tasks[index].next_run,
    };

    globalStore.scheduledTasks = tasks;

    return NextResponse.json({
      success: true,
      data: tasks[index],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新任务失败' },
      { status: 500 }
    );
  }
}

// 删除任务
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }

    const tasks = globalStore.scheduledTasks || [];
    const index = tasks.findIndex((t: ScheduledTask) => t.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    tasks.splice(index, 1);
    globalStore.scheduledTasks = tasks;

    return NextResponse.json({
      success: true,
      message: '任务已删除',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '删除任务失败' },
      { status: 500 }
    );
  }
}

// 手动触发任务执行
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const tasks = globalStore.scheduledTasks || [];
    const index = tasks.findIndex((t: ScheduledTask) => t.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    if (action === 'run') {
      // 模拟任务执行
      tasks[index].status = 'running';
      globalStore.scheduledTasks = tasks;

      // 模拟异步执行
      setTimeout(() => {
        const tasksInTimeout = globalStore.scheduledTasks || [];
        const idx = tasksInTimeout.findIndex((t: ScheduledTask) => t.id === id);
        if (idx !== -1) {
          tasksInTimeout[idx].status = 'success';
          tasksInTimeout[idx].last_run = new Date().toISOString();
          tasksInTimeout[idx].next_run = calculateNextRun(tasksInTimeout[idx].cron_expression);
          tasksInTimeout[idx].result = `${tasksInTimeout[idx].name} 执行成功`;
          globalStore.scheduledTasks = tasksInTimeout;
        }
      }, 2000);

      return NextResponse.json({
        success: true,
        message: '任务已开始执行',
      });
    }

    if (action === 'toggle') {
      tasks[index].enabled = !tasks[index].enabled;
      globalStore.scheduledTasks = tasks;

      return NextResponse.json({
        success: true,
        data: tasks[index],
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

// 计算下次执行时间（简化版）
function calculateNextRun(cronExpression: string): string {
  const now = new Date();
  const parts = cronExpression.split(' ');
  
  if (parts.length < 5) {
    return now.toISOString();
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  // 简单计算：基于分钟间隔
  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.replace('*/', ''));
    const nextMinutes = Math.ceil(now.getMinutes() / interval) * interval;
    const next = new Date(now);
    next.setMinutes(nextMinutes, 0, 0);
    if (next <= now) {
      next.setHours(next.getHours() + 1);
    }
    return next.toISOString();
  }

  // 默认：1小时后
  const next = new Date(now);
  next.setHours(next.getHours() + 1, 0, 0, 0);
  return next.toISOString();
}
