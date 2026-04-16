'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Rocket,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  AlertTriangle,
  Package,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  // 模拟数据
  const todayStats = {
    sales: 4280,
    adSpend: 350,
    newProducts: 8,
    pendingItems: 2,
  };

  const recentActivities = [
    { id: 1, time: '10:32', text: '选品分析完成：宠物饮水机，利润率 35%', action: '查看', link: '/select' },
    { id: 2, time: '10:25', text: '图片处理完成：5张主图已生成', action: '预览', link: '/publish' },
    { id: 3, time: '10:18', text: '广告告警：今日ACOS 45%，建议优化', action: '优化', link: '/ads' },
    { id: 4, time: '09:45', text: '上架成功：无线蓝牙耳机已发布到Shopee', action: '查看', link: '/drafts' },
  ];

  const pendingTasks = [
    { id: 1, icon: Package, text: '草稿箱：12个待发布商品', action: '编辑发布', link: '/drafts' },
    { id: 2, icon: AlertTriangle, text: '广告待优化：2项', action: '去优化', link: '/ads' },
    { id: 3, icon: AlertTriangle, text: '库存预警：3个商品', action: '查看详情', link: '/settings' },
  ];

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')} useNewNavigation={true}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* 欢迎栏 */}
        <div>
          <h1 className="text-[20px] font-bold text-foreground">👋 欢迎回来！</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            今日上新 {todayStats.newProducts} 个，广告花费 ${todayStats.adSpend}
          </p>
        </div>

        {/* 核心数据卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">今日销售额</p>
              <p className="text-3xl font-bold text-foreground">
                ${todayStats.sales.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" />
                +20%
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">广告花费</p>
              <p className="text-3xl font-bold text-foreground">
                ${todayStats.adSpend.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingDown className="h-3 w-3" />
                -5%
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">今日上新</p>
              <p className="text-3xl font-bold text-foreground">
                {todayStats.newProducts}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" />
                +3
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-orange-200">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">待优化项</p>
              <p className="text-3xl font-bold text-orange-600">
                {todayStats.pendingItems}
              </p>
              <p className="text-xs text-orange-600 flex items-center gap-1 mt-2">
                <AlertTriangle className="h-3 w-3" />
                需要关注
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 快捷操作 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px]">快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                size="lg" 
                className="h-24 text-lg bg-[#165DFF] hover:bg-[#0F47D2]"
                onClick={() => router.push('/select')}
              >
                <Search className="h-6 w-6 mr-2" />
                🔍 开始选品
              </Button>

              <Button 
                size="lg" 
                className="h-24 text-lg bg-orange-500 hover:bg-orange-600"
                onClick={() => router.push('/publish')}
              >
                <Rocket className="h-6 w-6 mr-2" />
                🚀 一键上新
              </Button>

              <Button 
                size="lg" 
                className="h-24 text-lg"
                variant="outline"
                onClick={() => router.push('/ads')}
              >
                <BarChart3 className="h-6 w-6 mr-2" />
                📊 诊断广告
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* 今日动态 */}
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px]">今日动态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => router.push(activity.link)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] text-muted-foreground w-12">
                          {activity.time}
                        </span>
                        <span className="text-[14px]">{activity.text}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#165DFF]">
                        {activity.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 待处理任务 */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px]">待处理任务</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingTasks.map((task) => {
                    const Icon = task.icon;
                    return (
                      <button
                        key={task.id}
                        onClick={() => router.push(task.link)}
                        className="w-full text-left p-3 hover:bg-muted/50 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-orange-500" />
                          <span className="text-[14px]">{task.text}</span>
                        </div>
                        <span className="text-[12px] text-[#165DFF]">{task.action}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
