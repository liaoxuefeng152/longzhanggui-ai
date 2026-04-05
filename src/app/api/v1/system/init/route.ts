import { NextRequest, NextResponse } from 'next/server';
import { taskScheduler, predefinedSchedules } from '@/lib/scheduler';
import { ruleEngine } from '@/lib/rules-engine';

/**
 * 初始化无人运营系统
 */
export async function POST(request: NextRequest) {
  try {
    // 初始化规则引擎
    ruleEngine.initializeDefaultRules();

    // 添加预定义的定时任务（这些任务需要在实际使用时注册具体的执行函数）
    const schedules = predefinedSchedules.map(schedule => ({
      ...schedule,
      task: async () => {
        console.log(`执行定时任务: ${schedule.name}`);
        // TODO: 实际的任务执行逻辑
      },
    }));

    schedules.forEach(schedule => {
      taskScheduler.addSchedule(schedule);
    });

    // 启动调度器
    taskScheduler.start();

    return NextResponse.json({
      success: true,
      message: '无人运营系统初始化成功',
      data: {
        rulesInitialized: ruleEngine.getRules().length,
        schedulesInitialized: schedules.length,
        schedulerRunning: true,
      },
    });
  } catch (error) {
    console.error('初始化系统失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '初始化失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取系统状态
 */
export async function GET(request: NextRequest) {
  try {
    const rules = ruleEngine.getRules();
    const schedules = taskScheduler.getSchedules();
    const evaluationHistory = ruleEngine.getEvaluationHistory().slice(-10); // 最近10条

    return NextResponse.json({
      success: true,
      data: {
        rules: {
          total: rules.length,
          enabled: rules.filter(r => r.enabled).length,
          byCategory: {
            risk: rules.filter(r => r.category === 'risk').length,
            compliance: rules.filter(r => r.category === 'compliance').length,
            pricing: rules.filter(r => r.category === 'pricing').length,
            inventory: rules.filter(r => r.category === 'inventory').length,
          },
        },
        schedules: {
          total: schedules.length,
          enabled: schedules.filter(s => s.enabled).length,
          nextExecutions: schedules.map(s => ({
            id: s.id,
            name: s.name,
            enabled: s.enabled,
            cron: s.cron,
          })),
        },
        recentEvaluations: evaluationHistory,
      },
    });
  } catch (error) {
    console.error('获取系统状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取状态失败',
      },
      { status: 500 }
    );
  }
}
