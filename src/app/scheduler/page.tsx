'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Zap,
  Clock,
  Play,
  Pause,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  ShoppingCart,
  Package,
  Truck,
  FileText,
  TrendingUp,
  RefreshCcw,
  Database,
  History,
  Settings,
  Bell,
} from 'lucide-react';

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
  template?: {
    icon: string;
    color: string;
  };
}

interface TaskTemplate {
  type: string;
  name: string;
  description: string;
  defaultCron: string;
  icon: string;
  color: string;
}

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
  logs?: string[];
}

const TASK_ICONS: Record<string, React.ElementType> = {
  ShoppingCart,
  Package,
  Truck,
  FileText,
  TrendingUp,
  AlertTriangle,
  RefreshCcw,
  Database,
};

const CRON_PRESETS = [
  { label: '每5分钟', value: '*/5 * * * *' },
  { label: '每15分钟', value: '*/15 * * * *' },
  { label: '每30分钟', value: '*/30 * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每2小时', value: '0 */2 * * *' },
  { label: '每4小时', value: '0 */4 * * *' },
  { label: '每天凌晨', value: '0 3 * * *' },
  { label: '每天早上', value: '0 9 * * *' },
  { label: '每天中午', value: '0 12 * * *' },
  { label: '每天下午', value: '0 18 * * *' },
];

export default function SchedulerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  
  // 创建表单
  const [createForm, setCreateForm] = useState({
    name: '',
    type: '',
    cron_expression: '*/5 * * * *',
    enabled: true,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchTasks();
    fetchExecutions();
  }, [router]);

  // 定时刷新
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/v1/scheduler');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data.tasks);
        setTemplates(data.data.templates);
      }
    } catch (error) {
      console.error('获取任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/v1/scheduler/history?limit=20');
      const data = await response.json();
      if (data.success) {
        setExecutions(data.data.items);
      }
    } catch (error) {
      console.error('获取执行历史失败:', error);
    }
  };

  // 创建任务
  const handleCreate = async () => {
    if (!createForm.name || !createForm.type) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const response = await fetch('/api/v1/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('任务创建成功');
        setIsCreateOpen(false);
        setCreateForm({ name: '', type: '', cron_expression: '*/5 * * * *', enabled: true });
        fetchTasks();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('创建失败');
    }
  };

  // 切换任务状态
  const handleToggle = async (task: ScheduledTask) => {
    try {
      const response = await fetch('/api/v1/scheduler', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, action: 'toggle' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(task.enabled ? '任务已暂停' : '任务已启用');
        fetchTasks();
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 手动执行任务
  const handleRun = async (task: ScheduledTask) => {
    try {
      const response = await fetch('/api/v1/scheduler', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, action: 'run' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('任务已开始执行');
        fetchTasks();
        setTimeout(fetchExecutions, 3000);
      }
    } catch (error) {
      toast.error('执行失败');
    }
  };

  // 删除任务
  const handleDelete = async (task: ScheduledTask) => {
    if (!confirm(`确定删除任务「${task.name}」吗？`)) return;

    try {
      const response = await fetch(`/api/v1/scheduler?id=${task.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('任务已删除');
        fetchTasks();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 查看任务配置
  const handleViewConfig = (task: ScheduledTask) => {
    setSelectedTask(task);
    setIsConfigOpen(true);
  };

  // 查看执行日志
  const handleViewLogs = (task: ScheduledTask) => {
    setSelectedTask(task);
    setIsLogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
      idle: { label: '空闲', className: 'bg-muted text-muted-foreground', icon: Pause },
      running: { label: '执行中', className: 'bg-blue-500/10 text-blue-500', icon: Loader2 },
      success: { label: '成功', className: 'bg-green-500/10 text-green-500', icon: CheckCircle },
      failed: { label: '失败', className: 'bg-red-500/10 text-red-500', icon: XCircle },
    };
    const { label, className, icon: Icon } = config[status] || config.idle;
    return (
      <Badge variant="outline" className={cn('gap-1', className)}>
        <Icon className={cn('h-3 w-3', status === 'running' && 'animate-spin')} />
        {label}
      </Badge>
    );
  };

  const getTaskIcon = (iconName: string) => {
    const Icon = TASK_ICONS[iconName] || Zap;
    return Icon;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}秒`;
    return `${(ms / 60000).toFixed(1)}分钟`;
  };

  const formatNextRun = (dateStr?: string) => {
    if (!dateStr) return '未设置';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return '已过期';
    if (diff < 60000) return '即将执行';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟后`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时后`;
    return date.toLocaleString('zh-CN');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
              <Clock className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">定时任务调度</h1>
              <p className="text-[14px] text-muted-foreground">自动化任务配置 · 执行监控 · 异常告警</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchTasks}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">任务总数</div>
                  <div className="text-[24px] font-semibold">{tasks.length}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">执行中</div>
                  <div className="text-[24px] font-semibold text-blue-500">
                    {tasks.filter(t => t.status === 'running').length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">今日执行</div>
                  <div className="text-[24px] font-semibold text-green-500">
                    {executions.filter(e => e.status === 'success').length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">失败次数</div>
                  <div className="text-[24px] font-semibold text-red-500">
                    {executions.filter(e => e.status === 'failed').length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 任务列表和执行历史 */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks">
              <Zap className="h-4 w-4 mr-2" />
              任务列表
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              执行历史
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Settings className="h-4 w-4 mr-2" />
              任务模板
            </TabsTrigger>
          </TabsList>

          {/* 任务列表 */}
          <TabsContent value="tasks" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">暂无定时任务</p>
                  <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一个任务
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {tasks.map((task) => {
                  const Icon = getTaskIcon(task.template?.icon || 'Zap');
                  const color = task.template?.color || '#8B5CF6';
                  
                  return (
                    <Card key={task.id} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${color}15` }}
                            >
                              <Icon className="h-5 w-5" style={{ color }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{task.name}</h3>
                                {getStatusBadge(task.status)}
                              </div>
                              <p className="text-[12px] text-muted-foreground mt-1">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-[12px] text-muted-foreground">
                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                  {task.cron_expression}
                                </span>
                                <span>下次: {formatNextRun(task.next_run)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={task.enabled} 
                              onCheckedChange={() => handleToggle(task)}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRun(task)}
                              disabled={task.status === 'running'}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewLogs(task)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewConfig(task)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(task)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {task.last_run && (
                          <div className="mt-3 pt-3 border-t border-border text-[12px] text-muted-foreground">
                            上次执行: {new Date(task.last_run).toLocaleString('zh-CN')} 
                            {task.result && ` · ${task.result}`}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* 执行历史 */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {executions.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    暂无执行记录
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {executions.map((exec) => (
                      <div key={exec.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(exec.status)}
                          <div>
                            <div className="font-medium">{exec.task_name}</div>
                            <div className="text-[12px] text-muted-foreground">
                              开始于 {new Date(exec.start_time).toLocaleString('zh-CN')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                          <span>耗时: {formatDuration(exec.duration)}</span>
                          {exec.error && (
                            <span className="text-red-500 max-w-[200px] truncate">
                              {exec.error}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 任务模板 */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {templates.map((template) => {
                const Icon = getTaskIcon(template.icon);
                return (
                  <Card 
                    key={template.type} 
                    className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setCreateForm({
                        name: template.name,
                        type: template.type,
                        cron_expression: template.defaultCron,
                        enabled: true,
                      });
                      setIsCreateOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${template.color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: template.color }} />
                      </div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        {template.description}
                      </p>
                      <div className="mt-3 text-[11px] text-muted-foreground">
                        默认: {template.defaultCron}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* 创建任务对话框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>创建定时任务</DialogTitle>
              <DialogDescription>配置定时任务的名称、执行时间和参数</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">任务名称</Label>
                <Input
                  id="name"
                  placeholder="例如：每日订单同步"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">任务类型</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value) => setCreateForm({ ...createForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.type} value={t.type}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cron">执行周期</Label>
                <Select
                  value={createForm.cron_expression}
                  onValueChange={(value) => setCreateForm({ ...createForm, cron_expression: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRON_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label} ({preset.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cron-custom">自定义 Cron 表达式</Label>
                <Input
                  id="cron-custom"
                  placeholder="*/5 * * * *"
                  value={createForm.cron_expression}
                  onChange={(e) => setCreateForm({ ...createForm, cron_expression: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">
                  格式: 分 时 日 月 周 (0 * * * * = 每小时整点执行)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreate}>创建任务</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 任务配置对话框 */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>任务配置</DialogTitle>
              <DialogDescription>{selectedTask?.name}</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <div className="text-[12px] text-muted-foreground">任务ID</div>
                    <div className="font-mono">{selectedTask.id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">任务类型</div>
                    <div>{selectedTask.type}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">执行周期</div>
                    <div className="font-mono">{selectedTask.cron_expression}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">状态</div>
                    {getStatusBadge(selectedTask.status)}
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">上次执行</div>
                    <div>{selectedTask.last_run ? new Date(selectedTask.last_run).toLocaleString() : '从未执行'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">下次执行</div>
                    <div>{formatNextRun(selectedTask.next_run)}</div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 执行日志对话框 */}
        <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>执行日志</DialogTitle>
              <DialogDescription>{selectedTask?.name}</DialogDescription>
            </DialogHeader>
            <div className="bg-black/90 rounded-lg p-4 font-mono text-[12px] text-green-400 max-h-[400px] overflow-y-auto">
              {executions
                .filter(e => e.task_id === selectedTask?.id)
                .slice(0, 1)[0]?.logs?.map((log, idx) => (
                  <div key={idx} className="py-0.5">{log}</div>
                )) || (
                <div className="text-muted-foreground">暂无日志</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLogOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
