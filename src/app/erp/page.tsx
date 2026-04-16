'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  Warehouse,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Users,
  Globe,
  Bot,
  Sparkles,
} from 'lucide-react';

export default function ERPDashboardPage() {
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

  const modules = [
    {
      title: '商品管理',
      description: '商品库 · 成本核算 · 图片处理 · 合规校验',
      icon: Package,
      href: '/erp/products',
      stats: [
        { label: '商品总数', value: '1,234' },
        { label: '在售商品', value: '856' },
      ],
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: '库存管理',
      description: '库存预警 · 多仓管理 · 周转分析 · 自动补货',
      icon: Warehouse,
      href: '/erp/inventory',
      stats: [
        { label: '可售库存', value: '12,456' },
        { label: '预警商品', value: '23' },
      ],
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: '采购管理',
      description: '采购申请 · 供应商管理 · 入库验收 · 成本控制',
      icon: ShoppingCart,
      href: '/erp/purchase',
      stats: [
        { label: '待处理', value: '12' },
        { label: '本月采购', value: '¥45,678' },
      ],
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      title: '订单管理',
      description: '订单同步 · 异常处理 · 利润核算 · 物流追踪',
      icon: Globe,
      href: '/erp/orders',
      stats: [
        { label: '今日订单', value: '156' },
        { label: '待发货', value: '23' },
      ],
      color: 'bg-pink-500/10 text-pink-500',
    },
    {
      title: '财务管理',
      description: '收支统计 · 利润分析 · 成本核算 · 财务报表',
      icon: DollarSign,
      href: '/erp/finance',
      stats: [
        { label: '本月销售额', value: '$89,234' },
        { label: '毛利率', value: '32.5%' },
      ],
      color: 'bg-green-500/10 text-green-500',
    },
  ];

  const aiFeatures = [
    {
      title: '1688采集',
      description: '一键采集1688商品信息',
      icon: Bot,
      status: 'pending',
    },
    {
      title: '图片智能体',
      description: '翻译+优化图片处理',
      icon: Sparkles,
      status: 'pending',
    },
    {
      title: 'Listing优化',
      description: 'AI优化商品Listing',
      icon: TrendingUp,
      status: 'pending',
    },
    {
      title: '智能定价',
      description: '基于竞争分析定价',
      icon: BarChart3,
      status: 'pending',
    },
  ];

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">ERP系统概览</h1>
              <p className="text-[14px] text-muted-foreground">跨境电商一站式运营管理平台</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              系统正常
            </Badge>
          </div>
        </div>

        {/* 核心统计 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日销售额</div>
              <div className="text-[24px] font-semibold text-foreground">$12,345</div>
              <div className="flex items-center gap-1 text-[11px] text-success mt-1">
                <TrendingUp className="h-3 w-3" />
                +15.3% 较昨日
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日订单</div>
              <div className="text-[24px] font-semibold text-foreground">156</div>
              <div className="text-[11px] text-muted-foreground mt-1">待发货 23 笔</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">毛利润</div>
              <div className="text-[24px] font-semibold text-success">$4,567</div>
              <div className="text-[11px] text-muted-foreground mt-1">毛利率 37%</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">库存预警</div>
              <div className="text-[24px] font-semibold text-warning">23</div>
              <div className="text-[11px] text-muted-foreground mt-1">SKU需补货</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">异常订单</div>
              <div className="text-[24px] font-semibold text-destructive">5</div>
              <div className="text-[11px] text-muted-foreground mt-1">需人工处理</div>
            </CardContent>
          </Card>
        </div>

        {/* 功能模块 */}
        <div className="grid grid-cols-3 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.href}
                className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(module.href)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-[15px] mt-3">{module.title}</CardTitle>
                  <CardDescription className="text-[12px]">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    {module.stats.map((stat, idx) => (
                      <div key={idx}>
                        <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                        <div className="text-[14px] font-medium text-foreground">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI智能功能 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-[15px]">AI智能功能</CardTitle>
              </div>
              <Badge variant="outline" className="text-[11px]">
                <Clock className="h-3 w-3 mr-1" />
                开发中
              </Badge>
            </div>
            <CardDescription>基于LangGraph的AI智能体，助力跨境电商运营</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {aiFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={idx}
                    className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-[14px] font-medium text-foreground">{feature.title}</div>
                    </div>
                    <div className="text-[12px] text-muted-foreground">{feature.description}</div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                        即将上线
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 系统架构说明 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">系统架构</CardTitle>
            <CardDescription>ERP模块作为数据中枢和执行中枢，与AI智能体协同工作</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 bg-muted/30 rounded-lg">
                <div className="text-[13px] font-medium text-foreground mb-2">数据中枢</div>
                <div className="text-[12px] text-muted-foreground">
                  商品库、订单数据、库存数据、财务数据统一管理，为AI智能体提供数据支撑
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-[13px] font-medium text-primary mb-2">AI智能体</div>
                <div className="text-[12px] text-muted-foreground">
                  选品、图片、Listing、广告、客服、复盘等7大AI智能体协同工作
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 p-4 bg-muted/30 rounded-lg">
                <div className="text-[13px] font-medium text-foreground mb-2">执行中枢</div>
                <div className="text-[12px] text-muted-foreground">
                  自动执行采购、调价、客服回复等操作，实现无人化运营
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
