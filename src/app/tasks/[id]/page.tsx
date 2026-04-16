'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, Bot, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface TaskDetail {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  user: string;
  params?: Record<string, any>;
  result?: any;
  error?: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const taskId = params?.id as string;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    setIsLoading(true);
    try {
      // 模拟任务详情数据
      const mockTask: TaskDetail = {
        id: taskId,
        type: getTaskType(taskId),
        status: getTaskStatus(taskId),
        createdAt: getTaskTime(taskId),
        completedAt: getTaskStatus(taskId) === 'completed' ? getTaskTime(taskId) : undefined,
        user: getTaskUser(taskId),
        params: {
          category: '宠物用品',
          platform: 'tiktok',
          region: 'id',
        },
        result: getTaskResult(taskId),
      };
      setTask(mockTask);
    } catch (error) {
      console.error('获取任务详情失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 根据任务ID生成模拟数据
  const getTaskType = (id: string): string => {
    const typeMap: Record<string, string> = {
      'T202402200001': '选品智能体',
      'T202402200002': '图片设计',
      'T202402200003': 'Listing优化',
      'T202402200004': '广告投放',
      'T202402200005': 'AI客服',
      'T202402200006': '视频生成',
      'T202402200007': '数据复盘',
      'T202402200008': '选品智能体',
      'T202402200009': '智能助理-问询',
      'T202402200010': '智能助理-日报',
    };
    return typeMap[id] || '未知任务';
  };

  const getTaskStatus = (id: string): string => {
    const statusMap: Record<string, string> = {
      'T202402200001': 'completed',
      'T202402200002': 'running',
      'T202402200003': 'completed',
      'T202402200004': 'blocked',
      'T202402200005': 'completed',
      'T202402200006': 'error',
      'T202402200007': 'completed',
      'T202402200008': 'pending',
      'T202402200009': 'completed',
      'T202402200010': 'completed',
    };
    return statusMap[id] || 'pending';
  };

  const getTaskTime = (id: string): string => {
    const timeMap: Record<string, string> = {
      'T202402200001': '2024-02-20 14:32:15',
      'T202402200002': '2024-02-20 14:30:08',
      'T202402200003': '2024-02-20 14:28:45',
      'T202402200004': '2024-02-20 14:25:33',
      'T202402200005': '2024-02-20 14:22:18',
      'T202402200006': '2024-02-20 14:20:05',
      'T202402200007': '2024-02-20 14:15:42',
      'T202402200008': '2024-02-20 14:10:28',
      'T202402200009': '2024-02-20 14:08:15',
      'T202402200010': '2024-02-20 14:05:00',
    };
    return timeMap[id] || new Date().toISOString();
  };

  const getTaskUser = (id: string): string => {
    const userMap: Record<string, string> = {
      'T202402200001': '张明',
      'T202402200002': '李华',
      'T202402200003': '王芳',
      'T202402200004': '赵伟',
      'T202402200005': '刘静',
      'T202402200006': '陈强',
      'T202402200007': '周敏',
      'T202402200008': '吴洋',
      'T202402200009': '阿峰',
      'T202402200010': '系统',
    };
    return userMap[id] || '未知用户';
  };

  const getTaskResult = (id: string): any => {
    const status = getTaskStatus(id);
    if (status === 'completed') {
      return {
        message: '任务执行成功',
        summary: '已成功完成选品分析，找到3个优质候选商品',
        items: [
          { name: '宠物自动喂食器', score: 95, profit: '35%' },
          { name: '宠物饮水机', score: 88, profit: '28%' },
          { name: '宠物玩具套装', score: 82, profit: '32%' },
        ],
      };
    } else if (status === 'error') {
      return {
        message: '任务执行失败',
        error: '图片处理超时，请重试',
      };
    } else if (status === 'blocked') {
      return {
        message: '任务被风控拦截',
        reason: '广告预算超过阈值（500元），需要管理员确认',
      };
    }
    return null;
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: '待执行', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: Clock },
    running: { label: '执行中', color: 'text-blue-600', bgColor: 'bg-blue-600/10', icon: Bot },
    completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-600/10', icon: CheckCircle },
    error: { label: '异常', color: 'text-red-600', bgColor: 'bg-red-600/10', icon: AlertTriangle },
    blocked: { label: '风控拦截', color: 'text-orange-600', bgColor: 'bg-orange-600/10', icon: XCircle },
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout user={user} onLogout={() => router.push('/login')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout user={user} onLogout={() => router.push('/login')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">任务不存在</div>
        </div>
      </MainLayout>
    );
  }

  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">任务详情</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              任务ID: {task.id}
            </p>
          </div>
        </div>

        {/* 任务基本信息 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-[15px] font-medium">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[12px] text-muted-foreground">任务ID</p>
                <p className="text-[14px] font-medium">{task.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-muted-foreground">任务类型</p>
                <p className="text-[14px] font-medium">{task.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-muted-foreground">任务状态</p>
                <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-muted-foreground">操作用户</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[14px]">{task.user}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] text-muted-foreground">创建时间</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[14px]">{task.createdAt}</span>
                </div>
              </div>
              {task.completedAt && (
                <div className="space-y-1">
                  <p className="text-[12px] text-muted-foreground">完成时间</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-[14px]">{task.completedAt}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 任务参数 */}
        {task.params && (
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="px-6 py-4 border-b border-border">
              <CardTitle className="text-[15px] font-medium">任务参数</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {Object.entries(task.params).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-[13px] text-muted-foreground w-24">{key}:</span>
                    <span className="text-[14px] font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 任务结果 */}
        {task.result && (
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="px-6 py-4 border-b border-border">
              <CardTitle className="text-[15px] font-medium">执行结果</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {task.result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-[14px] text-red-600 font-medium">{task.result.error}</p>
                </div>
              ) : task.result.reason ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-[14px] text-orange-600 font-medium">{task.result.message}</p>
                  <p className="text-[13px] text-orange-600 mt-2">{task.result.reason}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[14px] text-green-600 font-medium">{task.result.message}</p>
                  <p className="text-[13px] text-muted-foreground">{task.result.summary}</p>
                  {task.result.items && (
                    <div className="mt-4">
                      <p className="text-[13px] font-medium mb-2">候选商品：</p>
                      <div className="space-y-2">
                        {task.result.items.map((item: any, index: number) => (
                          <div key={index} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-[14px]">{item.name}</span>
                            <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                              <span>评分: {item.score}</span>
                              <span>利润率: {item.profit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBack}>
            返回列表
          </Button>
          {task.status === 'error' && (
            <Button onClick={() => window.location.reload()}>
              重新执行
            </Button>
          )}
          {task.status === 'blocked' && (
            <Button>
              联系管理员
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
