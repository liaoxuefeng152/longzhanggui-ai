'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import {
  getReportOverview,
  getReportUsage,
  getReportAgents,
  ReportOverview,
  ReportUsage,
  ReportAgents,
} from '@/lib/api/reports';
import { logout } from '@/lib/api/auth';

// 默认数据
const defaultPlatformData = [
  { name: 'TK印尼', value: 45, color: '#165DFF' },
  { name: 'TK泰国', value: 25, color: '#00B42A' },
  { name: 'TK越南', value: 15, color: '#FF7D00' },
  { name: '亚马逊', value: 15, color: '#722ED1' },
];

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [usage, setUsage] = useState<ReportUsage | null>(null);
  const [agents, setAgents] = useState<ReportAgents | null>(null);

  // 计算日期范围
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    };
  };

  // 获取报表数据
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      const [overviewRes, usageRes, agentsRes] = await Promise.all([
        getReportOverview(dateRange),
        getReportUsage(dateRange),
        getReportAgents(dateRange),
      ]);
      setOverview(overviewRes);
      setUsage(usageRes);
      setAgents(agentsRes);
    } catch (error) {
      console.error('获取报表数据失败:', error);
      toast.error('获取报表数据失败');
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
    fetchReports();
  }, [router, timeRange]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // 忽略错误
    }
    router.push('/login');
  };

  // 导出报表
  const handleExportReport = () => {
    try {
      if (!overview || !usage || !agents) {
        toast.error('暂无报表数据可导出');
        return;
      }

      // 创建CSV内容
      const csvContent = [
        ['数据报表导出', '', '', ''],
        [`导出时间: ${new Date().toLocaleString('zh-CN')}`, '', '', ''],
        [`时间范围: ${timeRange}`, '', '', ''],
        ['', '', '', ''],
        ['核心指标', '', '', ''],
        ['总销售额', overview.total_sales || 0, '美元', ''],
        ['总订单数', overview.total_orders || 0, '单', ''],
        ['活跃用户', overview.active_users || 0, '人', ''],
        ['平均转化率', `${(overview.conversion_rate || 0).toFixed(1)}%`, '', ''],
        ['', '', '', ''],
        ['使用情况', '', '', ''],
        ['总调用次数', usage.total_calls || 0, '次', ''],
        ['总Tokens消耗', usage.total_tokens || 0, 'tokens', ''],
        ['智能体数量', agents.agents?.length || 0, '个', ''],
        ['', '', '', ''],
        ['销售趋势', '', '', ''],
        ['日期', '销售额', '订单数', ''],
        ...(overview.sales_trend || []).map(t => [t.date, t.sales || 0, t.orders || 0]),
        ['', '', '', ''],
        ['平台分布', '', '', ''],
        ['平台', '占比', '', ''],
        ...(overview.platform_distribution || []).map(p => [p.name, `${p.value}%`, '', '']),
        ['', '', '', ''],
        ['智能体效能', '', '', ''],
        ['智能体名称', '任务数', '成功率', ''],
        ...(agents.agents || []).map(a => [a.name, a.total_tasks || 0, `${(a.success_rate || 0).toFixed(1)}%`]),
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败');
    }
  };

  // 转换智能体效能数据
  const agentPerformanceData = agents?.agents?.map(a => ({
    name: a.name,
    tasks: a.total_tasks,
    success: a.success_rate,
  })) || [];

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">数据报表</h1>
              <p className="text-[14px] text-muted-foreground">
                销售分析 · 智能体效能 · 自动化任务转化
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">近7天</SelectItem>
                <SelectItem value="30d">近30天</SelectItem>
                <SelectItem value="90d">近90天</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportReport}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              导出报表
            </Button>
          </div>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总销售额</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ${overview?.total_sales?.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-[11px] text-green-600">+15.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总订单数</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {overview?.total_orders?.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-[11px] text-green-600">+8.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">活跃用户</p>
                  <p className="text-[28px] font-semibold text-foreground">
                    {overview?.active_users?.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-[12px] text-green-600">+12</span>
                    <span className="text-[12px] text-muted-foreground">新增</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">平均转化率</p>
                  <p className="text-[28px] font-semibold text-foreground">
                    {overview?.conversion_rate?.toFixed(1) || 0}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-[12px] text-destructive">-0.3%</span>
                    <span className="text-[12px] text-muted-foreground">vs上周</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 销售趋势 */}
          <Card className="bg-white border-border shadow-sm col-span-2">
            <CardHeader className="px-6 py-4 border-b border-border">
              <CardTitle className="text-[15px] font-medium">销售趋势</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overview?.sales_trend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#86909C' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#86909C' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E8E8E8',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        name="销售额($)"
                        stroke="#165DFF"
                        strokeWidth={2}
                        dot={{ fill: '#165DFF', r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        name="订单数"
                        stroke="#00B42A"
                        strokeWidth={2}
                        dot={{ fill: '#00B42A', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 平台分布 */}
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="px-6 py-4 border-b border-border">
              <CardTitle className="text-[15px] font-medium">平台分布</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview?.platform_distribution || defaultPlatformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(overview?.platform_distribution || defaultPlatformData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 使用情况统计 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">总调用次数</div>
              <div className="text-[24px] font-semibold text-foreground">
                {usage?.total_calls?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">总Tokens消耗</div>
              <div className="text-[24px] font-semibold text-foreground">
                {usage?.total_tokens?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">智能体数量</div>
              <div className="text-[24px] font-semibold text-foreground">
                {agents?.agents?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 智能体效能 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-[15px] font-medium">智能体效能分析</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : agentPerformanceData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  暂无智能体数据
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E8E8E8" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#86909C' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 13, fill: '#4E5969' }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8E8E8',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="tasks" name="任务数" fill="#165DFF" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="success" name="成功率(%)" fill="#00B42A" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
