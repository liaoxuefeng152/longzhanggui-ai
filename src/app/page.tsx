'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  Rocket,
  BarChart3,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
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

  const todayStats = {
    sales: 4280,
    adSpend: 350,
    newProducts: 8,
    pendingItems: 2,
    roi: 1.8,
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
  ];

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')} useNewNavigation={true}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* 欢迎栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">👋 欢迎回来！</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              今日上新 {todayStats.newProducts} 个 | 广告花费 ${todayStats.adSpend} | ROI {todayStats.roi}
            </p>
          </div>
        </div>

        {/* 数据卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow border-[#22C97A]/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">选品</p>
              <p className="text-3xl font-bold text-[#22C97A]">15个</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">上新</p>
              <p className="text-3xl font-bold text-foreground">3待发</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">广告</p>
              <p className="text-3xl font-bold text-foreground">ROI 1.8</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">数据</p>
              <p className="text-3xl font-bold text-foreground">--</p>
            </CardContent>
          </Card>
        </div>

        {/* 快捷操作 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px]">快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Button 
                size="lg" 
                className="h-24 text-lg bg-[#22C97A] hover:bg-[#1EAF6A]"
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

              <Button 
                size="lg" 
                className="h-24 text-lg"
                variant="outline"
              >
                <FileText className="h-6 w-6 mr-2" />
                📋 查看日报
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
                      <Button variant="ghost" size="sm" className="text-[#22C97A]">
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
                        <span className="text-[12px] text-[#22C97A]">{task.action}</span>
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
