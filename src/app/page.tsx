'use client';

import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Search, ShoppingCart, TrendingUp, FileText, Zap, AlertTriangle, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const router = useRouter();

  const quickActions = [
    { label: '开始选品', icon: Search, path: '/select', color: 'from-[#00EEFF] to-[#00B8D4]' },
    { label: '一键上新', icon: ShoppingCart, path: '/publish', color: 'from-[#7B61FF] to-[#6349E3]' },
    { label: '诊断广告', icon: TrendingUp, path: '/ads', color: 'from-[#FF9800] to-[#F57C00]' },
    { label: '查看日报', icon: FileText, path: '/', color: 'from-[#00E676] to-[#00C853]' },
  ];

  const todayActivities = [
    { type: 'success', message: '选品完成：无线耳机，利润率 35%', time: '2分钟前' },
    { type: 'info', message: '图片处理完成：5 张主图已生成', time: '15分钟前' },
    { type: 'warning', message: '广告告警：ACOS 45%，建议优化', time: '1小时前' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部欢迎栏 */}
        <Card className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                欢迎回来！
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B]">今日上新</span>
                  <span className="text-[#00EEFF] font-bold text-lg">3 个</span>
                </div>
                <div className="w-px h-4 bg-[#1E293B]" />
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B]">广告花费</span>
                  <span className="text-[#FF9800] font-bold text-lg">RM 450</span>
                </div>
                <div className="w-px h-4 bg-[#1E293B]" />
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B]">ROI</span>
                  <span className="text-[#00E676] font-bold text-lg">1.8</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost"
                onClick={() => router.push('/feishu')}
                className="bg-[rgba(0,238,255,0.1)] text-[#00EEFF] hover:bg-[rgba(0,238,255,0.2)] border border-[rgba(0,238,255,0.3)]"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                飞书绑定
              </Button>
              <Button 
                variant="ghost"
                onClick={() => router.push('/settings')}
                className="bg-[#1E293B] text-white hover:bg-[#2D3748]"
              >
                <Settings className="w-4 h-4 mr-2" />
                系统设置
              </Button>
            </div>
          </div>
        </Card>

        {/* 数据卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card p-5 border-[rgba(0,238,255,0.3)]">
            <div className="text-[#64748B] text-sm mb-1">选品分析</div>
            <div className="digital-number text-3xl font-bold text-[#00EEFF]">15</div>
            <div className="text-[#64748B] text-xs mt-1">个商品</div>
          </Card>

          <Card className="glass-card p-5">
            <div className="text-[#64748B] text-sm mb-1">上新待发</div>
            <div className="digital-number text-3xl font-bold text-[#7B61FF]">3</div>
            <div className="text-[#64748B] text-xs mt-1">个商品</div>
          </Card>

          <Card className="glass-card p-5">
            <div className="text-[#64748B] text-sm mb-1">广告 ROI</div>
            <div className="digital-number text-3xl font-bold text-[#FF9800]">1.8</div>
            <div className="text-[#64748B] text-xs mt-1">今日</div>
          </Card>

          <Card className="glass-card p-5">
            <div className="text-[#64748B] text-sm mb-1">今日订单</div>
            <div className="digital-number text-3xl font-bold text-[#00E676]">28</div>
            <div className="text-[#64748B] text-xs mt-1">单</div>
          </Card>
        </div>

        {/* 快捷操作 */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00EEFF]" />
            快捷操作
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.path}
                  onClick={() => router.push(action.path)}
                  className={`h-auto py-5 flex flex-col gap-2 bg-gradient-to-br ${action.color} text-[#0B101A] hover:opacity-90 transition-all hover:scale-105`}
                >
                  <Icon className="w-7 h-7" />
                  <span className="font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </Card>

        {/* 今日动态 */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FF9800]" />
            今日动态
          </h3>
          <div className="space-y-3">
            {todayActivities.map((activity, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  activity.type === 'warning' 
                    ? 'bg-[rgba(255,64,129,0.1)] border-[rgba(255,64,129,0.3)] animate-alert-pulse' 
                    : activity.type === 'success'
                    ? 'bg-[rgba(0,238,255,0.1)] border-[rgba(0,238,255,0.3)]'
                    : 'bg-[rgba(255,255,255,0.02)] border-[#1E293B]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${
                      activity.type === 'warning' ? 'text-[#FF4081]' : 
                      activity.type === 'success' ? 'text-[#00EEFF]' : 'text-[#94A3B8]'
                    }`}>
                      {activity.message}
                    </p>
                  </div>
                  <span className="text-[#64748B] text-xs ml-4">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
