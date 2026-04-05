/**
 * 定时任务调度器
 * 用于自动触发工作流和定期执行任务
 */

export interface ScheduleConfig {
  id: string;
  name: string;
  description?: string;
  cron: string; // cron表达式
  enabled: boolean;
  task: () => Promise<void>;
  timezone?: string;
  retryTimes?: number;
  timeout?: number;
}

export interface ScheduleExecution {
  scheduleId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  error?: string;
  duration?: number;
}

class TaskScheduler {
  private schedules: Map<string, ScheduleConfig> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private executions: Map<string, ScheduleExecution[]> = new Map();
  private running: boolean = false;

  /**
   * 启动调度器
   */
  start(): void {
    if (this.running) {
      console.warn('调度器已在运行中');
      return;
    }

    this.running = true;
    console.log('定时任务调度器已启动');

    // 重新调度所有启用的任务
    for (const [id, schedule] of this.schedules) {
      if (schedule.enabled) {
        this.scheduleTask(id);
      }
    }
  }

  /**
   * 停止调度器
   */
  stop(): void {
    if (!this.running) {
      console.warn('调度器未运行');
      return;
    }

    this.running = false;

    // 清除所有定时器
    for (const [id, timer] of this.timers) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    console.log('定时任务调度器已停止');
  }

  /**
   * 添加定时任务
   */
  addSchedule(schedule: ScheduleConfig): void {
    this.schedules.set(schedule.id, schedule);
    this.executions.set(schedule.id, []);

    if (this.running && schedule.enabled) {
      this.scheduleTask(schedule.id);
    }

    console.log(`定时任务已添加: ${schedule.name}`);
  }

  /**
   * 移除定时任务
   */
  removeSchedule(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.schedules.delete(id);
    this.executions.delete(id);

    console.log(`定时任务已移除: ${id}`);
  }

  /**
   * 更新定时任务
   */
  updateSchedule(id: string, updates: Partial<ScheduleConfig>): void {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`定时任务不存在: ${id}`);
    }

    const updated = { ...schedule, ...updates };
    this.schedules.set(id, updated);

    // 如果调度器正在运行，重新调度
    if (this.running) {
      this.removeSchedule(id);
      this.addSchedule(updated);
    }
  }

  /**
   * 启用/禁用定时任务
   */
  toggleSchedule(id: string, enabled: boolean): void {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`定时任务不存在: ${id}`);
    }

    this.updateSchedule(id, { enabled });
  }

  /**
   * 获取所有定时任务
   */
  getSchedules(): ScheduleConfig[] {
    return Array.from(this.schedules.values());
  }

  /**
   * 获取定时任务执行历史
   */
  getExecutions(scheduleId: string): ScheduleExecution[] {
    return this.executions.get(scheduleId) || [];
  }

  /**
   * 手动触发任务
   */
  async triggerTask(id: string): Promise<void> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`定时任务不存在: ${id}`);
    }

    await this.executeSchedule(schedule);
  }

  /**
   * 调度单个任务
   */
  private scheduleTask(id: string): void {
    const schedule = this.schedules.get(id);
    if (!schedule) return;

    // 计算下次执行时间
    const nextExecutionTime = this.calculateNextExecutionTime(schedule.cron);
    const delay = nextExecutionTime.getTime() - Date.now();

    // 设置定时器
    const timer = setTimeout(async () => {
      await this.executeSchedule(schedule);

      // 递归调度下一次执行
      if (schedule.enabled && this.running) {
        this.scheduleTask(id);
      }
    }, delay);

    this.timers.set(id, timer);

    console.log(`任务 ${schedule.name} 已调度，下次执行时间: ${nextExecutionTime.toLocaleString('zh-CN')}`);
  }

  /**
   * 执行定时任务
   */
  private async executeSchedule(schedule: ScheduleConfig): Promise<void> {
    const execution: ScheduleExecution = {
      scheduleId: schedule.id,
      startTime: new Date().toISOString(),
      status: 'running',
    };

    const executions = this.executions.get(schedule.id) || [];
    executions.push(execution);
    this.executions.set(schedule.id, executions);

    console.log(`开始执行定时任务: ${schedule.name}`);

    try {
      const startTime = Date.now();

      // 设置超时
      const taskPromise = schedule.task();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('任务执行超时')), schedule.timeout || 300000);
      });

      await Promise.race([taskPromise, timeoutPromise]);

      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.duration = Date.now() - startTime;

      console.log(`定时任务执行完成: ${schedule.name}，耗时: ${execution.duration}ms`);
    } catch (error) {
      execution.status = error instanceof Error && error.message === '任务执行超时' ? 'timeout' : 'failed';
      execution.error = error instanceof Error ? error.message : '未知错误';
      execution.endTime = new Date().toISOString();

      console.error(`定时任务执行失败: ${schedule.name}`, error);

      // 重试机制
      const retryTimes = schedule.retryTimes || 0;
      if (retryTimes > 0) {
        console.log(`任务将在 ${retryTimes} 次重试后停止`);
        // TODO: 实现重试逻辑
      }
    }
  }

  /**
   * 计算下次执行时间（简化版cron解析）
   * 注意：这是简化实现，生产环境建议使用 node-cron 库
   */
  private calculateNextExecutionTime(cron: string): Date {
    const now = new Date();
    const next = new Date(now);

    // 简单解析cron格式: "*/5 * * * *" (每5分钟)
    // 完整支持需要更复杂的解析器

    const parts = cron.split(' ');
    if (parts.length !== 5) {
      throw new Error(`无效的cron表达式: ${cron}`);
    }

    const [minute, hour, day, month, dayOfWeek] = parts;

    // 简单处理：如果是分钟级的定时，计算下次分钟
    if (minute.startsWith('*/')) {
      const interval = parseInt(minute.substring(2));
      next.setMinutes(Math.ceil(next.getMinutes() / interval) * interval);
      next.setSeconds(0);
      next.setMilliseconds(0);
    } else if (minute === '0') {
      // 每小时执行
      next.setMinutes(0);
      next.setSeconds(0);
      next.setMilliseconds(0);
      next.setHours(next.getHours() + 1);
    } else if (minute.startsWith('0 */')) {
      // 每N小时执行
      const interval = parseInt(minute.split(' ')[1]);
      next.setMinutes(0);
      next.setSeconds(0);
      next.setMilliseconds(0);
      next.setHours(next.getHours() + interval);
    } else {
      // 每天特定时间执行
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      next.setHours(hourNum, minuteNum, 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    }

    return next;
  }
}

// 导出单例
export const taskScheduler = new TaskScheduler();

// 预定义的定时任务
export const predefinedSchedules: Omit<ScheduleConfig, 'task'>[] = [
  {
    id: 'daily_data_sync',
    name: '每日数据同步',
    description: '每天凌晨2点同步平台数据',
    cron: '0 2 * * *',
    enabled: true,
    timezone: 'Asia/Shanghai',
    retryTimes: 3,
    timeout: 600000,
  },
  {
    id: 'hourly_ad_optimization',
    name: '每小时广告优化',
    description: '每小时检查广告ROI并自动优化',
    cron: '0 */1 * * *',
    enabled: true,
    timezone: 'Asia/Shanghai',
    retryTimes: 2,
    timeout: 300000,
  },
  {
    id: 'daily_order_sync',
    name: '每日订单同步',
    description: '每天凌晨3点同步订单数据',
    cron: '0 3 * * *',
    enabled: true,
    timezone: 'Asia/Shanghai',
    retryTimes: 3,
    timeout: 600000,
  },
  {
    id: 'weekly_data_review',
    name: '每周数据复盘',
    description: '每周一上午9点生成数据复盘报告',
    cron: '0 9 * * 1',
    enabled: true,
    timezone: 'Asia/Shanghai',
    retryTimes: 2,
    timeout: 300000,
  },
  {
    id: 'daily_inventory_check',
    name: '每日库存检查',
    description: '每天凌晨4点检查库存并预警',
    cron: '0 4 * * *',
    enabled: true,
    timezone: 'Asia/Shanghai',
    retryTimes: 2,
    timeout: 300000,
  },
];
