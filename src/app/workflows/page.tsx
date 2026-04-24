"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import {
  Zap,
  Bot,
  Package,
  ShoppingCart,
  Headphones,
  TrendingUp,
  AlertTriangle,
  Megaphone,
  Clock,
  ArrowRight,
  Search,
  Image,
  Video,
  FileText,
  BarChart3,
  Plus,
  Upload,
  DollarSign,
  ListChecks,
  CheckCircle2,
  Truck,
  RefreshCw,
  Play,
  Eye,
  FileBox,
} from "lucide-react";

// 今日概览数据
const todayStats = {
  pendingOrders: 3,
  pendingShipments: 5,
  pendingReplies: 8,
  inventoryAlerts: 2,
  adRoi: 3.2,
  dailySales: 12580,
};

// 待办事项
const todoItems = [
  { id: 1, type: 'order', text: '3个订单待处理', priority: 'high', link: '/erp/orders' },
  { id: 2, type: 'ship', text: '5个订单待发货', priority: 'high', link: '/erp/orders?status=pending' },
  { id: 3, type: 'customer', text: '8条客服消息待回复', priority: 'medium', link: '/customer-tickets' },
  { id: 4, type: 'inventory', text: '2个商品库存不足预警', priority: 'medium', link: '/erp/inventory?alert=true' },
  { id: 5, type: 'listing', text: '10个商品待上架', priority: 'low', link: '/erp/products?status=ready' },
];

// AI智能体配置
const aiAgents = [
  { id: 'product-selection', name: '选品智能体', icon: <Search className="h-5 w-5" />, color: 'bg-blue-500', href: '/agents/product-selection', desc: 'AI选品分析' },
  { id: 'image-design', name: '图片设计', icon: <Image className="h-5 w-5" />, color: 'bg-purple-500', href: '/agents/image-design', desc: '图片翻译优化' },
  { id: 'video-generation', name: '视频生成', icon: <Video className="h-5 w-5" />, color: 'bg-pink-500', href: '/agents/video-generation', desc: 'AI视频创作' },
  { id: 'listing-optimization', name: 'Listing优化', icon: <FileText className="h-5 w-5" />, color: 'bg-green-500', href: '/agents/listing-optimization', desc: '标题描述优化' },
  { id: 'advertising', name: '广告投放', icon: <Megaphone className="h-5 w-5" />, color: 'bg-orange-500', href: '/agents/advertising', desc: '智能广告优化' },
  { id: 'customer-service', name: 'AI客服', icon: <Headphones className="h-5 w-5" />, color: 'bg-cyan-500', href: '/agents/customer-service', desc: '智能客服处理' },
  { id: 'data-review', name: '数据复盘', icon: <BarChart3 className="h-5 w-5" />, color: 'bg-indigo-500', href: '/agents/data-review', desc: '数据分析报告' },
];

// 快捷工作流
const quickWorkflows = [
  { 
    id: 'new-product', 
    name: '新品上架', 
    icon: <Plus className="h-5 w-5" />, 
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    description: 'AI全流程：选品→采集→Listing→图片→定价',
    steps: ['选品分析', '采集中心', 'Listing优化', '图片处理', '智能定价'],
    stats: { total: 156, today: 3 },
  },
  { 
    id: 'batch-collect', 
    name: '批量采集', 
    icon: <Upload className="h-5 w-5" />, 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    description: '从1688批量采集商品信息',
    steps: ['添加链接', '批量采集', '商品入库'],
    stats: { total: 2340, today: 28 },
  },
  { 
    id: 'batch-price', 
    name: '批量定价', 
    icon: <DollarSign className="h-5 w-5" />, 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    description: 'Excel批量计算商品最优售价',
    steps: ['导入数据', '成本核算', '批量定价'],
    stats: { total: 890, today: 45 },
  },
  { 
    id: 'batch-listing', 
    name: '批量优化', 
    icon: <FileText className="h-5 w-5" />, 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    description: '批量生成高质量Listing',
    steps: ['选择商品', 'AI优化', '批量发布'],
    stats: { total: 567, today: 12 },
  },
  { 
    id: 'pricing-template', 
    name: '定价模板', 
    icon: <FileBox className="h-5 w-5" />, 
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    description: '预设定价规则，快速计算商品售价',
    steps: ['创建模板', '配置规则', '一键定价'],
    stats: { total: 12, today: 0 },
  },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [productStats, setProductStats] = useState({
    selected: 0,
    processing: 0,
    ready: 0,
    published: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // 获取商品统计数据
    const fetchStats = async () => {
      const { default: store } = await import('@/lib/store');
      const products = store.getProducts();
      setProductStats({
        selected: products.filter((p: any) => p.status === 'selected').length,
        processing: products.filter((p: any) => p.status === 'processing').length,
        ready: products.filter((p: any) => p.status === 'ready').length,
        published: products.filter((p: any) => p.status === 'published').length,
      });
    };
    fetchStats();
  }, [router]);

  if (!user) return null;

  // 执行工作流 - 直接跳转到对应功能页面
  const handleOpenWizard = (workflowId: string) => {
    switch (workflowId) {
      case 'new-product':
        // 新品上架：跳转到选品智能体
        toast.success('开始新品上架流程', { description: '正在跳转到选品分析...' });
        router.push('/agents/product-selection');
        break;
      case 'batch-collect':
        // 批量采集：跳转到采集中心
        toast.success('开始批量采集', { description: '正在跳转到采集中心...' });
        router.push('/erp/collection');
        break;
      case 'batch-price':
        // 批量定价：跳转到商品列表
        toast.success('开始批量定价', { description: '正在跳转到商品管理...' });
        router.push('/erp/products?status=selected');
        break;
      case 'batch-listing':
        // 批量优化：跳转到Listing优化
        toast.success('开始批量优化', { description: '正在跳转到Listing优化...' });
        router.push('/agents/listing-optimization');
        break;
      case 'pricing-template':
        // 定价模板：跳转到定价模板列表
        toast.success('打开定价模板', { description: '正在跳转到定价模板...' });
        router.push('/workflows/pricing-templates');
        break;
      default:
        toast.info('功能开发中');
    }
  };

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/5 flex items-center justify-center">
              <Zap className="h-7 w-7 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">工作台</h1>
              <p className="text-[14px] text-muted-foreground">
                运营一站式入口，AI智能提效
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab(activeTab === 'overview' ? 'workflows' : 'overview')}
            >
              {activeTab === 'overview' ? (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  快捷工作流
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  概览
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-blue-700">有问题？试试</span>
              <span className="text-xs font-medium text-blue-600">龙掌柜跨境AI全能助手</span>
            </div>
          </div>
        </div>

        {/* Tab切换内容 */}
        {activeTab === 'overview' ? (
          <>
            {/* 今日概览 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[12px] text-muted-foreground">待处理订单</p>
                      <p className="text-[20px] font-semibold">{todayStats.pendingOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[12px] text-muted-foreground">待发货订单</p>
                      <p className="text-[20px] font-semibold">{todayStats.pendingShipments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Headphones className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[12px] text-muted-foreground">待回复消息</p>
                      <p className="text-[20px] font-semibold">{todayStats.pendingReplies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-[12px] text-muted-foreground">库存预警</p>
                      <p className="text-[20px] font-semibold">{todayStats.inventoryAlerts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[12px] text-muted-foreground">广告ROI</p>
                      <p className="text-[20px] font-semibold">{todayStats.adRoi}x</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-[12px] text-muted-foreground">今日销售额</p>
                      <p className="text-[20px] font-semibold">¥{todayStats.dailySales.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 商品状态概览 - 快速查看各状态商品数量 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle className="text-[16px]">商品状态概览</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/erp/products')}>
                    商品管理
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <CardDescription className="text-[13px]">
                  从选品到上架的全流程状态追踪
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <button 
                    onClick={() => router.push('/erp/products?status=selected')}
                    className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Search className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[13px] font-medium text-blue-700">已选品</span>
                    </div>
                    <p className="text-[24px] font-semibold text-blue-600">{productStats.selected}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">待采集详情</p>
                  </button>

                  <button 
                    onClick={() => router.push('/erp/products?status=processing')}
                    className="p-4 rounded-lg border border-yellow-200 bg-yellow-50/50 hover:bg-yellow-100/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[13px] font-medium text-yellow-700">处理中</span>
                    </div>
                    <p className="text-[24px] font-semibold text-yellow-600">{productStats.processing}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">图片/Listing处理</p>
                  </button>

                  <button 
                    onClick={() => router.push('/erp/products?status=ready')}
                    className="p-4 rounded-lg border border-green-200 bg-green-50/50 hover:bg-green-100/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[13px] font-medium text-green-700">待上架</span>
                    </div>
                    <p className="text-[24px] font-semibold text-green-600">{productStats.ready}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">可发布上架</p>
                  </button>

                  <button 
                    onClick={() => router.push('/erp/products?status=published')}
                    className="p-4 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[13px] font-medium text-purple-700">已上架</span>
                    </div>
                    <p className="text-[24px] font-semibold text-purple-600">{productStats.published}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">在售商品</p>
                  </button>

                  <button 
                    onClick={() => router.push('/agents/product-selection')}
                    className="p-4 rounded-lg border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[13px] font-medium text-primary">新增商品</span>
                    </div>
                    <p className="text-[14px] font-medium text-primary mt-3 group-hover:underline">
                      开始选品 →
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">AI智能选品分析</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* AI智能体入口 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle className="text-[16px]">AI智能体</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/agents/product-selection')}>
                    查看全部
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {aiAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => router.push(agent.href)}
                      className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center text-white mb-2 group-hover:scale-105 transition-transform`}>
                        {agent.icon}
                      </div>
                      <p className="text-[13px] font-medium text-foreground">{agent.name}</p>
                      <p className="text-[11px] text-muted-foreground">{agent.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 待办事项 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" />
                    <CardTitle className="text-[16px]">待办事项</CardTitle>
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                      {todoItems.length} 项
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todoItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.link)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.priority === 'high' ? 'bg-red-500' : 
                          item.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-[14px]">{item.text}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 快捷工作流入口 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-[16px]">快捷工作流</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('workflows')}>
                    管理工作流
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickWorkflows.map((workflow) => (
                    <button
                      key={workflow.id}
                      onClick={() => {
                        if (workflow.id === 'new-product') {
                          setShowWizard(true);
                        } else if (workflow.id === 'pricing-template') {
                          router.push('/workflows/pricing-templates');
                        } else {
                          toast.info(`${workflow.name}功能开发中`);
                        }
                      }}
                      className="relative overflow-hidden rounded-xl border border-border hover:border-primary/50 transition-all group p-4 text-left"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${workflow.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg ${workflow.bgColor} flex items-center justify-center text-primary`}>
                            {workflow.icon}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium">{workflow.name}</p>
                            <p className="text-[11px] text-muted-foreground">{workflow.stats.today} 今日执行</p>
                          </div>
                        </div>
                        <p className="text-[12px] text-muted-foreground mb-2">{workflow.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {workflow.steps.slice(0, 3).map((step, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                              {step}
                            </Badge>
                          ))}
                          {workflow.steps.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                              +{workflow.steps.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 快捷工作流管理 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-[16px]">快捷工作流</CardTitle>
                </div>
                <CardDescription>管理常用的工作流程，快速执行重复任务</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="relative overflow-hidden rounded-xl border border-border hover:border-primary/50 transition-all p-5"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${workflow.color} opacity-5`} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl ${workflow.bgColor} flex items-center justify-center text-primary`}>
                              {workflow.icon}
                            </div>
                            <div>
                              <h3 className="text-[15px] font-medium">{workflow.name}</h3>
                              <p className="text-[12px] text-muted-foreground">{workflow.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[12px] text-muted-foreground">
                              共 {workflow.stats.total} 次执行
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-[12px] text-green-600">
                              今日 {workflow.stats.today} 次
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[12px] text-muted-foreground">流程步骤：</span>
                          <div className="flex items-center gap-1">
                            {workflow.steps.map((step, i) => (
                              <React.Fragment key={i}>
                                <Badge variant="secondary" className="text-[11px]">
                                  {step}
                                </Badge>
                                {i < workflow.steps.length - 1 && (
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenWizard(workflow.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            执行
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            编辑
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 最近的执行记录 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[16px]">最近执行记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: '新品上架', time: '10分钟前', status: 'completed', result: '上架3个商品' },
                    { name: '批量采集', time: '30分钟前', status: 'completed', result: '采集28个商品' },
                    { name: '批量定价', time: '1小时前', status: 'completed', result: '处理45个商品' },
                    { name: 'Listing优化', time: '2小时前', status: 'completed', result: '优化12个商品' },
                  ].map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          record.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {record.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium">{record.name}</p>
                          <p className="text-[12px] text-muted-foreground">{record.result}</p>
                        </div>
                      </div>
                      <span className="text-[12px] text-muted-foreground">{record.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 工作流向导 */}
      {showWizard && (
        <ProductWizardDialog 
          open={showWizard} 
          onClose={() => setShowWizard(false)}
          onComplete={() => {
            setShowWizard(false);
            toast.success('新品上架流程已完成！');
          }} 
        />
      )}
    </MainLayout>
  );
}

// 新品上架入口组件 - 简化为两种场景入口
function ProductWizardDialog({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'collect' | null>(null);
  const [collectUrls, setCollectUrls] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);

  // 执行采集
  const handleCollect = async () => {
    const urls = collectUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      toast.error('请输入至少一个1688链接');
      return;
    }

    setIsCollecting(true);
    const toastId = toast.loading(`正在采集 ${urls.length} 个商品...`);
    
    try {
      const { default: store } = await import('@/lib/store');
      let successCount = 0;
      let partialCount = 0;
      
      for (const url of urls) {
        try {
          // 1. 采集商品详情
          const response = await fetch('/api/v1/tools/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url.trim() }),
          });
          const data = await response.json();
          
          if (data.success && data.data) {
            // 2. 创建商品记录
            store.createProduct({
              name_zh: data.data.title || '未命名商品',
              name_en: '',
              category: '',
              source_url: url.trim(),
              supplier_name: data.data.shop_name || '',
              cost_price: data.data.price || 0,
              domestic_shipping: 0,
              first_mile_shipping: 0,
              total_cost: data.data.price || 0,
              status: 'selected',
              selection_score: 60,
              selected_at: new Date().toISOString(),
              image_status: 'pending',
              listing_status: 'pending',
              compliance_status: 'pending',
            });
            successCount++;
            if (data.error) {
              partialCount++; // 部分信息采集失败
            }
          }
        } catch {
          // 单个失败不影响整体
        }
        
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (partialCount > 0) {
        toast.success(`采集完成！成功 ${successCount} 个，其中 ${partialCount} 个需补充详情`, {
          id: toastId,
          description: '部分商品信息不完整，请在商品管理中补充',
          action: {
            label: '去商品库',
            onClick: () => {
              onClose();
              router.push('/erp/products?status=selected');
            },
          },
        });
      } else {
        toast.success(`成功采集 ${successCount} 个商品！`, {
          id: toastId,
          action: {
            label: '去处理',
            onClick: () => {
              onClose();
              router.push('/erp/products?status=selected');
            },
          },
        });
      }
      
      if (successCount > 0) {
        onComplete();
        setCollectUrls('');
      }
    } catch (error) {
      toast.error('采集失败', { id: toastId });
    } finally {
      setIsCollecting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-semibold">新品上架</h2>
              <p className="text-[14px] text-white/80 mt-1">选择您的方式开始</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {!mode ? (
            // 选择入口
            <div className="space-y-4">
              <button
                onClick={() => {
                  onClose();
                  router.push('/agents/product-selection');
                }}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <Search className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-medium flex items-center gap-2">
                      AI智能选品
                      <Badge className="bg-purple-100 text-purple-700 text-[10px]">推荐</Badge>
                    </h3>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      告诉我您的需求，AI帮您分析市场、推荐商品、匹配供应商
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setMode('collect')}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-medium">我有链接，直接采集</h3>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      已有1688商品链接？直接采集商品信息入库
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
              </button>

              <div className="pt-4 border-t mt-4">
                <p className="text-[12px] text-muted-foreground text-center">
                  采集后的商品可在「商品管理」中继续处理图片、Listing、定价
                </p>
              </div>
            </div>
          ) : (
            // 采集模式
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                  ← 返回
                </Button>
              </div>
              
              <h3 className="text-[16px] font-medium">粘贴1688链接</h3>
              <p className="text-[13px] text-muted-foreground">
                支持商品详情页链接，每行一个，自动采集商品信息并入库
              </p>
              
              <textarea 
                value={collectUrls}
                onChange={(e) => setCollectUrls(e.target.value)}
                placeholder={`示例：
https://detail.1688.com/offer/123456.html
https://detail.1688.com/offer/789012.html`}
                className="w-full h-40 px-3 py-2 border border-border rounded-lg text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCollecting}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  支持批量采集，自动创建商品记录
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {collectUrls.split('\n').filter(url => url.trim()).length} 个链接
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  onClick={handleCollect}
                  disabled={isCollecting || !collectUrls.trim()}
                >
                  {isCollecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      采集中...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      开始采集
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
