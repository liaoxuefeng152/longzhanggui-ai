'use client';

import { TrendingUp, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';

export default function AdsOptimizationPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-8 h-8 text-[#00EEFF]" />
        <div>
          <h1 className="text-2xl font-bold text-white">广告优化</h1>
          <p className="text-[#64748B]">AI诊断 · 数据同步 · 智能优化</p>
        </div>
      </div>

      {/* 数据看板 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: '总花费', value: 'RM 12,450', color: 'text-[#FF9800]' },
          { label: '订单', value: '328', color: 'text-[#00EEFF]' },
          { label: 'ROI', value: '2.8', color: 'text-[#00E676]' },
          { label: 'ACOS', value: '32%', color: 'text-[#FF9800]' },
          { label: 'CTR', value: '2.4%', color: 'text-[#7B61FF]' },
          { label: 'CPC', value: 'RM 0.85', color: 'text-[#94A3B8]' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card p-4">
            <div className="digital-number text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-[#64748B] text-sm">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00EEFF]" />
          广告优化功能开发中...
        </h3>
        <p className="text-[#64748B]">
          广告诊断、一键优化等功能即将上线，敬请期待！
        </p>
      </Card>
      </div>
    </MainLayout>
  );
}
