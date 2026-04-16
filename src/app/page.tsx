'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, ShoppingCart, AlertTriangle, CheckCircle, Clock, Calendar, Plus, ArrowUp, ArrowDown, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import MainLayout from '@/components/layout/MainLayout';

// 模拟数据
const mockData = {
  stats: {
    todayRevenue: 52860,
    yesterdayRevenue: 46720,
    revenueGrowth: 13.1,
    todayOrders: 86,
    yesterdayOrders: 72,
    ordersGrowth: 19.4,
    adsCost: 12580,
    yesterdayAdsCost: 11200,
    adsGrowth: 12.3,
    inventoryAlert: 5,
  },
  recentAlerts: [
    { id: 1, type: 'stock', title: '库存不足预警', desc: 'SKU-2024001 仅剩余 5 件', time: '刚刚', level: 'warning' },
    { id: 2, type: 'order', title: '新订单通知', desc: '今日新增 15 个订单', time: '5分钟前', level: 'info' },
    { id: 3, type: 'ads', title: '广告ROI下降', desc: 'US站广告ROI降至 2.1', time: '10分钟前', level: 'warning' },
    { id: 4, type: 'system', title: '系统更新提醒', desc: '新功能已上线', time: '1小时前', level: 'success' },
  ],
  hotProducts: [
    { id: 1, name: '宠物自动喂食器', orders: 32, sales: 12800, trend: 'up' },
    { id: 2, name: 'LED氛围灯串', orders: 28, sales: 5600, trend: 'up' },
    { id: 3, name: '手机支架', orders: 25, sales: 3750, trend: 'down' },
  ],
  todoList: [
    { id: 1, title: '审核新品图片', desc: '3个待审核', status: 'pending', priority: 'high' },
    { id: 2, title: '优化广告预算', desc: 'US站ROI下降', status: 'in_progress', priority: 'high' },
    { id: 3, title: '回复用户消息', desc: '12条未读', status: 'pending', priority: 'medium' },
    { id: 4, title: '更新库存数据', desc: '同步最新库存', status: 'completed', priority: 'low' },
  ],
  recentActivity: [
    { id: 1, action: '创建了新品', product: '宠物智能饮水机', time: '2分钟前', user: 'AI助手' },
    { id: 2, action: '优化了Listing', product: 'LED氛围灯', time: '15分钟前', user: 'AI助手' },
    { id: 3, action: '调整了广告预算', product: '手机支架', time: '1小时前', user: '您' },
    { id: 4, action: '上架了商品', product: '宠物玩具套装', time: '2小时前', user: 'AI助手' },
  ],
};

export default function HomePage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#FF7D00]" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#00B42A]" />;
      default:
        return <Clock className="w-5 h-5 text-[#86909C]" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-[#F53F3F]';
      case 'medium':
        return 'border-l-[#FF7D00]';
      default:
        return 'border-l-[#00B42A]';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">首页</h1>
            <p className="text-[#86909C] mt-1">欢迎回来，龙掌柜</p>
          </div>
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
            <TabsList className="bg-[#F2F3F5]">
              <TabsTrigger value="today" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
                今日
              </TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
                本周
              </TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
                本月
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 顶部核心指标卡片 - 第一行 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 销售额 */}
          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">销售额</p>
                <p className="text-2xl font-bold text-[#1D2129]">¥{formatNumber(mockData.stats.todayRevenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-sm flex items-center ${mockData.stats.revenueGrowth > 0 ? 'text-[#00B42A]' : 'text-[#F53F3F]'}`}>
                    {mockData.stats.revenueGrowth > 0 ? (
                      <ArrowUp className="w-4 h-4 mr-0.5" />
                    ) : (
                      <ArrowDown className="w-4 h-4 mr-0.5" />
                    )}
                    {Math.abs(mockData.stats.revenueGrowth)}%
                  </span>
                  <span className="text-[#86909C] text-sm">较昨日</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#E8F3FF] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#165DFF]" />
              </div>
            </div>
          </Card>

          {/* 订单量 */}
          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">订单量</p>
                <p className="text-2xl font-bold text-[#1D2129]">{mockData.stats.todayOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-sm flex items-center ${mockData.stats.ordersGrowth > 0 ? 'text-[#00B42A]' : 'text-[#F53F3F]'}`}>
                    {mockData.stats.ordersGrowth > 0 ? (
                      <ArrowUp className="w-4 h-4 mr-0.5" />
                    ) : (
                      <ArrowDown className="w-4 h-4 mr-0.5" />
                    )}
                    {Math.abs(mockData.stats.ordersGrowth)}%
                  </span>
                  <span className="text-[#86909C] text-sm">较昨日</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#E8FFEA] flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#00B42A]" />
              </div>
            </div>
          </Card>

          {/* 广告花费 */}
          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">广告花费</p>
                <p className="text-2xl font-bold text-[#1D2129]">¥{formatNumber(mockData.stats.adsCost)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-sm flex items-center ${mockData.stats.adsGrowth > 0 ? 'text-[#00B42A]' : 'text-[#F53F3F]'}`}>
                    {mockData.stats.adsGrowth > 0 ? (
                      <ArrowUp className="w-4 h-4 mr-0.5" />
                    ) : (
                      <ArrowDown className="w-4 h-4 mr-0.5" />
                    )}
                    {Math.abs(mockData.stats.adsGrowth)}%
                  </span>
                  <span className="text-[#86909C] text-sm">较昨日</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FFF7E8] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#FF7D00]" />
              </div>
            </div>
          </Card>

          {/* 库存预警 */}
          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">库存预警</p>
                <p className="text-2xl font-bold text-[#F53F3F]">{mockData.stats.inventoryAlert}</p>
                <p className="text-[#86909C] text-sm mt-2">需要补货</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FFECE8] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#F53F3F]" />
              </div>
            </div>
          </Card>
        </div>

        {/* 中间区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：待办事项 & 热门商品 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 待办事项 */}
            <Card className="card-minimal">
              <div className="p-5 border-b border-[#E5E6EB]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1D2129]">今日待办</h3>
                  <Button variant="ghost" size="sm" className="text-[#165DFF] hover:text-[#4080FF] hover:bg-[#E8F3FF]">
                    查看全部
                  </Button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {mockData.todoList.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border-l-4 bg-[#F7F8FA] ${getPriorityClass(item.priority)}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-[#00B42A] border-[#00B42A]' : 'border-[#C9CDD4]'
                    }`}>
                      {item.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${item.status === 'completed' ? 'text-[#86909C] line-through' : 'text-[#1D2129]'}`}>
                        {item.title}
                      </p>
                      <p className="text-sm text-[#86909C]">{item.desc}</p>
                    </div>
                    {item.status === 'pending' && (
                      <Button variant="ghost" size="sm" className="text-[#165DFF]">
                        开始
                      </Button>
                    )}
                    {item.status === 'in_progress' && (
                      <span className="text-sm text-[#FF7D00] flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        进行中
                      </span>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-[#165DFF] border border-dashed border-[#E5E6EB]">
                  <Plus className="w-4 h-4 mr-2" />
                  添加待办
                </Button>
              </div>
            </Card>

            {/* 热门商品 */}
            <Card className="card-minimal">
              <div className="p-5 border-b border-[#E5E6EB]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1D2129]">热门商品</h3>
                  <Button variant="ghost" size="sm" className="text-[#165DFF] hover:text-[#4080FF] hover:bg-[#E8F3FF]">
                    更多分析
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {mockData.hotProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#F2F3F5] flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-[#86909C]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1D2129]">{product.name}</p>
                        <p className="text-sm text-[#86909C]">{product.orders} 单</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#1D2129]">¥{formatNumber(product.sales)}</p>
                        <span className={`text-sm flex items-center justify-end ${product.trend === 'up' ? 'text-[#00B42A]' : 'text-[#F53F3F]'}`}>
                          {product.trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 mr-0.5" />
                          ) : (
                            <ArrowDown className="w-4 h-4 mr-0.5" />
                          )}
                          {product.trend === 'up' ? '上升' : '下降'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 右侧：AI消息 & 最近动态 */}
          <div className="space-y-6">
            {/* AI助手消息 */}
            <Card className="card-minimal bg-gradient-to-br from-[#E8F3FF] to-white">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#165DFF] to-[#4080FF] flex items-center justify-center">
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1D2129]">AI助手</p>
                    <p className="text-sm text-[#86909C]">智能运营伙伴</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4 border border-[#E5E6EB]">
                  <p className="text-[#1D2129] mb-2">早上好！今天有几件事需要您关注：</p>
                  <ul className="text-sm text-[#4E5969] space-y-1">
                    <li>• 5个商品库存不足</li>
                    <li>• US站广告ROI下降</li>
                    <li>• 新功能已上线</li>
                  </ul>
                </div>
                <Button className="w-full btn-primary">
                  开始对话
                </Button>
              </div>
            </Card>

            {/* 最近动态 */}
            <Card className="card-minimal">
              <div className="p-5 border-b border-[#E5E6EB]">
                <h3 className="text-lg font-semibold text-[#1D2129]">最近动态</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {mockData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#165DFF] mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-[#1D2129]">
                          <span className="text-[#165DFF] font-medium">{activity.user}</span>
                          {' '}{activity.action}
                        </p>
                        {activity.product && (
                          <p className="text-[#4E5969] text-sm">{activity.product}</p>
                        )}
                        <p className="text-[#86909C] text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 快捷操作 */}
            <Card className="card-minimal">
              <div className="p-5 border-b border-[#E5E6EB]">
                <h3 className="text-lg font-semibold text-[#1D2129]">快捷操作</h3>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                <Button 
                  variant="ghost" 
                  className="h-20 flex-col gap-2 bg-[#F2F3F5] hover:bg-[#E5E6EB]"
                  onClick={() => router.push('/select')}
                >
                  <Search className="w-6 h-6 text-[#165DFF]" />
                  <span className="text-[#1D2129]">智能选品</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-20 flex-col gap-2 bg-[#F2F3F5] hover:bg-[#E5E6EB]"
                  onClick={() => router.push('/publish')}
                >
                  <ShoppingCart className="w-6 h-6 text-[#165DFF]" />
                  <span className="text-[#1D2129]">快速上新</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-20 flex-col gap-2 bg-[#F2F3F5] hover:bg-[#E5E6EB]"
                  onClick={() => router.push('/ads')}
                >
                  <TrendingUp className="w-6 h-6 text-[#165DFF]" />
                  <span className="text-[#1D2129]">广告优化</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-20 flex-col gap-2 bg-[#F2F3F5] hover:bg-[#E5E6EB]"
                  onClick={() => router.push('/drafts')}
                >
                  <FileText className="w-6 h-6 text-[#165DFF]" />
                  <span className="text-[#1D2129]">草稿箱</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
