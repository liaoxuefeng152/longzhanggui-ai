'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Plus,
  Upload,
  BarChart3,
  Settings,
  Bell,
  Calendar,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 快捷操作
  const quickActions = [
    {
      title: '采集商品',
      description: '从1688/亚马逊采集商品',
      icon: Package,
      href: '/erp/collection',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: '商品管理',
      description: '管理商品列表和编辑',
      icon: ShoppingCart,
      href: '/erp/products',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: '智能助理',
      description: 'AI辅助运营决策',
      icon: Bot,
      href: '/ai-assistant',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: '数据报表',
      description: '查看运营数据',
      icon: BarChart3,
      href: '/dashboard',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  // 待办事项
  const todoItems = [
    {
      id: 1,
      title: '商品 SKU-2024-001 库存不足',
      description: '剩余 3 件，建议立即补货',
      priority: 'high',
      time: '09:00',
    },
    {
      id: 2,
      title: '待处理订单 #TK-890',
      description: '买家催促发货',
      priority: 'medium',
      time: '10:30',
    },
    {
      id: 3,
      title: '广告 ACOS 偏高',
      description: '商品A广告ACOS达到32%',
      priority: 'low',
      time: '11:00',
    },
  ];

  // 今日动态
  const todayActivities = [
    {
      id: 1,
      action: '商品上架',
      target: '宠物饮水机',
      status: 'success',
      time: '14:32',
    },
    {
      id: 2,
      action: '采集商品',
      target: '10件商品',
      status: 'success',
      time: '14:15',
    },
    {
      id: 3,
      action: 'Listing优化',
      target: '手机支架',
      status: 'success',
      time: '13:45',
    },
    {
      id: 4,
      action: 'AI助理对话',
      target: '选品咨询',
      status: 'success',
      time: '13:20',
    },
    {
      id: 5,
      action: '订单同步',
      target: '23个订单',
      status: 'success',
      time: '12:00',
    },
  ];

  // 统计数据
  const stats = [
    {
      label: '今日订单',
      value: '23',
      unit: '单',
      trend: '+15%',
      trendUp: true,
      icon: ShoppingCart,
      color: 'text-blue-500',
    },
    {
      label: '今日销售额',
      value: '687',
      unit: '$',
      trend: '+12%',
      trendUp: true,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: '待处理',
      value: '5',
      unit: '单',
      trend: '-2',
      trendUp: false,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      label: '库存预警',
      value: '3',
      unit: '件',
      trend: '',
      trendUp: true,
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ];

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="p-6 space-y-6">
        {/* 欢迎区域 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold">
              早上好，{user.name || '老板'} 👋
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[12px]">
              <Sparkles className="h-3 w-3 mr-1" />
              AI 运营模式
            </Badge>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[24px] font-semibold">{stat.value}</span>
                      <span className="text-[12px] text-muted-foreground">{stat.unit}</span>
                    </div>
                    {stat.trend && (
                      <p className={`text-[11px] mt-1 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.trendUp ? '↑' : '↓'} {stat.trend}
                      </p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color.replace('text', 'bg')} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 快捷操作 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px] font-medium">快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center mb-3`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <span className="text-[14px] font-medium">{action.title}</span>
                  <span className="text-[12px] text-muted-foreground mt-1">{action.description}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 待办 + 今日动态 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 待办事项 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-medium">待办事项</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-[12px]">
                  查看全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todoItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.priority === 'high' ? 'bg-red-500' :
                      item.priority === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium">{item.title}</span>
                        <span className="text-[12px] text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 今日动态 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-medium">今日动态</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-[12px]">
                  查看全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium">{activity.action}</span>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {activity.target}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-[12px] text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部提示 */}
        <div className="bg-primary/5 rounded-lg p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-[14px] font-medium">智能助理随时待命</p>
            <p className="text-[12px] text-muted-foreground">
              有任何运营问题，随时告诉我！AI辅助决策，最终决定权在您手中。
            </p>
          </div>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => router.push('/ai-assistant')}
          >
            咨询助理
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
