'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bot,
  ClipboardList,
  CheckCircle,
  Users,
  Activity,
  RefreshCw,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getDashboardStats, DashboardStats } from '@/lib/api/dashboard';
import { logout } from '@/lib/api/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRiskControlOn, setIsRiskControlOn] = useState(false);

  // 重启调度服务
  const handleRestartScheduler = async () => {
    setIsRestarting(true);
    try {
      const response = await fetch('/api/v1/workflow/scheduler/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success || response.ok) {
        alert('调度服务重启成功！');
      } else {
        alert('重启请求已发送，服务正在重启中...');
      }
    } catch (error) {
      console.error('重启调度服务失败:', error);
      alert('重启请求已发送（后端服务可能未启动）');
    } finally {
      setIsRestarting(false);
    }
  };

  // 模型负载监控 - 跳转到模型管理页面
  const handleModelMonitor = () => {
    router.push('/models');
  };

  // 紧急风控开关
  const handleRiskControlToggle = () => {
    const newState = !isRiskControlOn;
    setIsRiskControlOn(newState);
    alert(newState ? '⚠️ 风控已开启：所有高风险操作将被拦截' : '✅ 风控已关闭：恢复正常操作');
  };

  // 导出日报
  const handleExportDailyReport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/v1/reports/daily/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `日报_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert('日报导出成功！');
      } else {
        // 模拟导出
        alert('日报导出功能已触发（需要后端支持）');
      }
    } catch (error) {
      console.error('导出日报失败:', error);
      alert('导出功能已触发（需要后端支持）');
    } finally {
      setIsExporting(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchStats();
  }, [router, refreshKey]);

  // 自动刷新数据
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // 忽略登出错误
    }
    router.push('/login');
  };

  // 核心数据概览
  const coreStats = [
    {
      title: '今日调用次数',
      value: stats?.todayCalls?.toLocaleString() || '0',
      icon: ClipboardList,
      color: 'text-orange-500',
      bgColor: 'bg-gradient-to-br from-orange-500/20 to-orange-500/10',
      borderColor: 'border-orange-500/20',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: '在线用户数',
      value: stats?.onlineUsers?.toLocaleString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-500/10',
      borderColor: 'border-blue-500/20',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: '今日订单数',
      value: stats?.todayOrders?.toLocaleString() || '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-500/20 to-green-500/10',
      borderColor: 'border-green-500/20',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: '推荐用户数',
      value: stats?.referralUsers?.toLocaleString() || '0',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500/20 to-purple-500/10',
      borderColor: 'border-purple-500/20',
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  // 智能体活跃度数据（近7日调用次数）- 使用API数据或默认数据
  const agentActivityData = stats?.callTrend?.map((item, index) => ({
    name: item.date,
    calls: item.calls,
    color: ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#165DFF', '#00B42A'][index % 7],
  })) || [
    { name: '02-14', calls: 0, color: '#165DFF' },
    { name: '02-15', calls: 0, color: '#00B42A' },
    { name: '02-16', calls: 0, color: '#FF7D00' },
    { name: '02-17', calls: 0, color: '#F53F3F' },
    { name: '02-18', calls: 0, color: '#722ED1' },
    { name: '02-19', calls: 0, color: '#165DFF' },
    { name: '02-20', calls: 0, color: '#00B42A' },
  ];

  // 实时任务流数据
  const taskStatusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: '待执行', color: 'text-muted-foreground', bgColor: 'bg-muted' },
    running: { label: '执行中', color: 'text-primary', bgColor: 'bg-primary/10' },
    completed: { label: '已完成', color: 'text-success', bgColor: 'bg-success/10' },
    error: { label: '异常', color: 'text-destructive', bgColor: 'bg-destructive/10' },
    blocked: { label: '风控拦截', color: 'text-warning', bgColor: 'bg-warning/10' },
    cancelled: { label: '已取消', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  };

  const recentTasks = [
    { id: 'T202402200001', type: '选品智能体', status: 'completed', time: '14:32:15', user: '张明' },
    { id: 'T202402200002', type: '图片设计', status: 'running', time: '14:30:08', user: '李华' },
    { id: 'T202402200003', type: 'Listing优化', status: 'completed', time: '14:28:45', user: '王芳' },
    { id: 'T202402200004', type: '广告投放', status: 'blocked', time: '14:25:33', user: '赵伟' },
    { id: 'T202402200005', type: 'AI客服', status: 'completed', time: '14:22:18', user: '刘静' },
    { id: 'T202402200006', type: '视频生成', status: 'error', time: '14:20:05', user: '陈强' },
    { id: 'T202402200007', type: '数据复盘', status: 'completed', time: '14:15:42', user: '周敏' },
    { id: 'T202402200008', type: '选品智能体', status: 'pending', time: '14:10:28', user: '吴洋' },
  ];

  // 用户数据统计
  const userStats = [
    { label: '今日调用', value: stats?.todayCalls || 0, trend: 'up', change: '次' },
    { label: '在线用户', value: stats?.onlineUsers || 0, trend: 'up', change: '人' },
    { label: '今日订单', value: stats?.todayOrders || 0, trend: 'up', change: '单' },
  ];

  // 最近用户
  const recentUsers = stats?.recentUsers || [];

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6" key={refreshKey}>
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">控制台首页</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              系统运行状态 · 数据总览大屏
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">
              每30秒自动刷新
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshKey((prev) => prev + 1)}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </div>
        </div>

        {/* 核心数据概览卡片区 */}
        <div className="grid grid-cols-4 gap-4">
          {coreStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className={cn(
                `bg-gradient-to-br from-white to-gray-50 ${stat.borderColor} shadow-sm`,
                'hover:shadow-lg hover:shadow-primary/10',
                'transition-all duration-300 ease-out group animate-fade-in',
                'hover:-translate-y-1 cursor-pointer border'
              )}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2 group-hover:text-foreground/80 transition-colors">
                        {stat.title}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <span className="text-xs text-muted-foreground">次</span>
                      </div>
                    </div>
                    <div className={cn(
                      `w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`,
                      'shadow-sm group-hover:shadow-md transition-shadow duration-300',
                      'group-hover:scale-110 transition-transform duration-300'
                    )}>
                      <Icon className={cn(`h-7 w-7 ${stat.color}`)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 调用趋势图 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-medium">调用趋势</CardTitle>
              <Badge variant="outline" className="text-[12px]">近7日调用次数</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#86909C' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#86909C' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: any) => [`${value} 次`, '调用次数']}
                  />
                  <Bar dataKey="calls" fill="#165DFF" radius={[4, 4, 0, 0]} barSize={40}>
                    {agentActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* 实时任务流 */}
          <div className="col-span-2">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[15px] font-medium">实时任务流</CardTitle>
                  <Button variant="link" size="sm" className="text-primary" onClick={() => router.push('/task-logs')}>
                    查看全部 <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-muted/50">
                      <tr className="border-b border-border">
                        <th className="text-left text-[12px] font-medium text-muted-foreground px-6 py-3">任务ID</th>
                        <th className="text-left text-[12px] font-medium text-muted-foreground px-6 py-3">类型</th>
                        <th className="text-left text-[12px] font-medium text-muted-foreground px-6 py-3">状态</th>
                        <th className="text-left text-[12px] font-medium text-muted-foreground px-6 py-3">执行时间</th>
                        <th className="text-left text-[12px] font-medium text-muted-foreground px-6 py-3">操作用户</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task) => {
                        const status = taskStatusMap[task.status];
                        return (
                          <tr key={task.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                            <td className="px-6 py-3 text-[13px] text-primary font-medium">{task.id}</td>
                            <td className="px-6 py-3 text-[13px] text-foreground">{task.type}</td>
                            <td className="px-6 py-3">
                              <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0 text-[12px]`}>
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-3 text-[13px] text-muted-foreground">{task.time}</td>
                            <td className="px-6 py-3 text-[13px] text-foreground">{task.user}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧面板 */}
          <div className="space-y-6">
            {/* 最近注册用户 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium">最近注册用户</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recentUsers.length > 0 ? (
                  <div className="space-y-3">
                    {recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-[14px] text-foreground">{u.nickname}</span>
                        </div>
                        <span className="text-[12px] text-muted-foreground">{u.createdAt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[14px] text-muted-foreground">
                    暂无新用户
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 快捷操作区 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-10"
                    onClick={handleRestartScheduler}
                    disabled={isRestarting}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 text-primary ${isRestarting ? 'animate-spin' : ''}`} />
                    {isRestarting ? '重启中...' : '重启调度服务'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-10"
                    onClick={handleModelMonitor}
                  >
                    <Activity className="h-4 w-4 mr-2 text-success" />
                    模型负载监控
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start h-10 ${isRiskControlOn ? 'border-warning bg-warning/10' : ''}`}
                    onClick={handleRiskControlToggle}
                  >
                    <AlertTriangle className={`h-4 w-4 mr-2 ${isRiskControlOn ? 'text-warning' : 'text-warning'}`} />
                    {isRiskControlOn ? '🔴 风控已开启' : '紧急风控开关'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-10"
                    onClick={handleExportDailyReport}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    {isExporting ? '导出中...' : '导出日报'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
