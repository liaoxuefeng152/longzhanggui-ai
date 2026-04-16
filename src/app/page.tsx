'use client';

import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Home, Search, ShoppingCart, TrendingUp, FileText, Zap, AlertTriangle, TrendingDown, TrendingUp as TrendingUpIcon } from 'lucide-react';
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

  const recentAlerts = [
    { type: 'warning', message: 'Shopee 深圳店库存预警：蓝牙音箱库存不足 50 件', time: '2分钟前' },
    { type: 'success', message: '上新成功：无线耳机已发布到 Shopee 马来站', time: '15分钟前' },
    { type: 'error', message: '广告 ROI 异常：户外灯串广告 ROI 低于 1.5', time: '1小时前' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* 欢迎栏 */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              欢迎回来，龙掌柜 👋
            </h1>
            <p className="text-[#64748B]">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[#00EEFF] text-sm font-medium">系统运行正常</div>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="status-indicator status-online" />
              <span className="text-[#64748B] text-xs">AI 引擎在线</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card p-6 border-[rgba(0,238,255,0.3)]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(0,238,255,0.2)] flex items-center justify-center">
              <Search className="w-6 h-6 text-[#00EEFF]" />
            </div>
            <Badge className="bg-[rgba(0,238,255,0.2)] text-[#00EEFF] border-[rgba(0,238,255,0.3)]">
              +12%
            </Badge>
          </div>
          <div className="digital-number text-3xl font-bold text-white mb-1">28</div>
          <div className="text-[#64748B]">选品分析</div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(123,97,255,0.2)] flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#7B61FF]" />
            </div>
            <Badge className="bg-[rgba(123,97,255,0.2)] text-[#7B61FF] border-[rgba(123,97,255,0.3)]">
              +5
            </Badge>
          </div>
          <div className="digital-number text-3xl font-bold text-white mb-1">12</div>
          <div className="text-[#64748B]">待上新</div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(255,152,0,0.2)] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#FF9800]" />
            </div>
            <Badge className="bg-[rgba(255,152,0,0.2)] text-[#FF9800] border-[rgba(255,152,0,0.3)]">
              2.8
            </Badge>
          </div>
          <div className="digital-number text-3xl font-bold text-white mb-1">2.8</div>
          <div className="text-[#64748B]">广告 ROI</div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(0,230,118,0.2)] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#00E676]" />
            </div>
            <Badge className="bg-[rgba(0,230,118,0.2)] text-[#00E676] border-[rgba(0,230,118,0.3)]">
              +18%
            </Badge>
          </div>
          <div className="digital-number text-3xl font-bold text-white mb-1">156</div>
          <div className="text-[#64748B]">今日订单</div>
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
                className={`h-auto py-6 flex flex-col gap-2 bg-gradient-to-br ${action.color} text-[#0B101A] hover:opacity-90 transition-all hover:scale-105`}
              >
                <Icon className="w-8 h-8" />
                <span className="font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* 实时动态 */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#FF9800]" />
          今日动态
        </h3>
        <div className="space-y-3">
          {recentAlerts.map((alert, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border transition-all ${
                alert.type === 'error' 
                  ? 'bg-[rgba(255,64,129,0.1)] border-[rgba(255,64,129,0.3)] animate-alert-pulse' 
                  : alert.type === 'warning'
                  ? 'bg-[rgba(255,152,0,0.1)] border-[rgba(255,152,0,0.3)]'
                  : 'bg-[rgba(0,238,255,0.1)] border-[rgba(0,238,255,0.3)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm ${
                    alert.type === 'error' ? 'text-[#FF4081]' : 
                    alert.type === 'warning' ? 'text-[#FF9800]' : 'text-[#00EEFF]'
                  }`}>
                    {alert.message}
                  </p>
                </div>
                <span className="text-[#64748B] text-xs ml-4">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>
    </MainLayout>
  );
}
