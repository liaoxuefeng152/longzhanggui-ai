'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const salesData = [
  { date: '02-14', sales: 4250, orders: 86 },
  { date: '02-15', sales: 5180, orders: 102 },
  { date: '02-16', sales: 4890, orders: 95 },
  { date: '02-17', sales: 5620, orders: 118 },
  { date: '02-18', sales: 6340, orders: 125 },
  { date: '02-19', sales: 5890, orders: 112 },
  { date: '02-20', sales: 6850, orders: 138 },
];

const platformData = [
  { name: 'TK印尼', value: 45, color: '#165DFF' },
  { name: 'TK泰国', value: 25, color: '#00B42A' },
  { name: 'TK越南', value: 15, color: '#FF7D00' },
  { name: '亚马逊', value: 15, color: '#722ED1' },
];

const agentPerformance = [
  { name: '选品智能体', tasks: 185, success: 98.5 },
  { name: '图片设计', tasks: 162, success: 97.2 },
  { name: '视频生成', tasks: 98, success: 95.8 },
  { name: 'Listing优化', tasks: 142, success: 96.5 },
  { name: '广告投放', tasks: 89, success: 94.2 },
  { name: 'AI客服', tasks: 210, success: 99.1 },
  { name: '数据复盘', tasks: 56, success: 97.8 },
];

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">数据报表</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              销售分析 · 智能体效能 · 自动化任务转化
            </p>
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报表
            </Button>
          </div>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">总销售额</p>
                  <p className="text-[28px] font-semibold text-foreground">$38,720</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-[12px] text-success">+15.2%</span>
                    <span className="text-[12px] text-muted-foreground">vs上周</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">总订单数</p>
                  <p className="text-[28px] font-semibold text-foreground">776</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-[12px] text-success">+8.5%</span>
                    <span className="text-[12px] text-muted-foreground">vs上周</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">活跃用户</p>
                  <p className="text-[28px] font-semibold text-foreground">198</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-[12px] text-success">+12</span>
                    <span className="text-[12px] text-muted-foreground">新增</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-muted-foreground mb-1">平均转化率</p>
                  <p className="text-[28px] font-semibold text-foreground">3.8%</p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance} layout="vertical">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
