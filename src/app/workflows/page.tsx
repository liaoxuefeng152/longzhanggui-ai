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
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWizard, setShowWizard] = useState(false);

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

// 新品上架向导组件
function ProductWizardDialog({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [params, setParams] = useState({
    category: '宠物用品',
    platform: 'tiktok',
    region: 'id',
    count: 3,
  });

  const steps = [
    { name: '选品', icon: <Search className="h-4 w-4" /> },
    { name: '采集', icon: <Upload className="h-4 w-4" /> },
    { name: 'Listing', icon: <FileText className="h-4 w-4" /> },
    { name: '图片', icon: <Image className="h-4 w-4" /> },
    { name: '定价', icon: <DollarSign className="h-4 w-4" /> },
    { name: '确认', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const handleExecute = async () => {
    setIsExecuting(true);
    toast.success('选品分析中...');
    
    setTimeout(() => {
      setIsExecuting(false);
      toast.success('选品完成！已找到3个潜力商品');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-semibold">新品上架向导</h2>
              <p className="text-[14px] text-white/80">AI全流程：选品 → 采集 → Listing → 图片 → 定价</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>
          
          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mt-6 px-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex flex-col items-center ${i <= currentStep ? 'text-white' : 'text-white/50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i < currentStep ? 'bg-white text-primary' :
                    i === currentStep ? 'bg-white/30 text-white' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                  </div>
                  <span className="text-[11px] mt-1">{step.name}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-1 ${i < currentStep ? 'bg-white' : 'bg-white/30'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-medium">设置选品参数</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] text-muted-foreground">目标类目</label>
                  <select 
                    value={params.category}
                    onChange={(e) => setParams({...params, category: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-[14px]"
                  >
                    <option>宠物用品</option>
                    <option>家居用品</option>
                    <option>3C数码</option>
                    <option>服装配饰</option>
                    <option>美妆护肤</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] text-muted-foreground">目标平台</label>
                  <select 
                    value={params.platform}
                    onChange={(e) => setParams({...params, platform: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-[14px]"
                  >
                    <option value="tiktok">TikTok Shop</option>
                    <option value="shopee">Shopee</option>
                    <option value="lazada">Lazada</option>
                    <option value="amazon">Amazon</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] text-muted-foreground">目标站点</label>
                  <select 
                    value={params.region}
                    onChange={(e) => setParams({...params, region: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-[14px]"
                  >
                    <option value="id">印尼</option>
                    <option value="th">泰国</option>
                    <option value="vn">越南</option>
                    <option value="my">马来西亚</option>
                    <option value="ph">菲律宾</option>
                    <option value="sg">新加坡</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] text-muted-foreground">选品数量</label>
                  <select 
                    value={params.count}
                    onChange={(e) => setParams({...params, count: parseInt(e.target.value)})}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-[14px]"
                  >
                    <option value="3">3个</option>
                    <option value="5">5个</option>
                    <option value="10">10个</option>
                    <option value="20">20个</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-medium">添加1688货源链接</h3>
              <p className="text-[13px] text-muted-foreground">输入1688商品链接或搜索页链接，系统将自动采集商品信息</p>
              <textarea 
                placeholder="粘贴1688链接，每行一个..."
                className="w-full h-32 px-3 py-2 border border-border rounded-lg text-[14px] resize-none"
              />
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                支持1688商品详情页和搜索页
              </div>
            </div>
          )}

          {currentStep >= 2 && currentStep < 5 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  {isExecuting ? (
                    <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <h3 className="text-[16px] font-medium">
                  {isExecuting ? '处理中...' : '已完成'}
                </h3>
                <p className="text-[13px] text-muted-foreground mt-2">
                  {steps[currentStep].name}处理完成，{currentStep < 5 ? '点击下一步继续' : '准备确认上架'}
                </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-medium">确认上架信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-[12px] text-muted-foreground">选品数量</p>
                  <p className="text-[18px] font-semibold">3 个</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-[12px] text-muted-foreground">采集商品</p>
                  <p className="text-[18px] font-semibold">3 个</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-[12px] text-muted-foreground">处理图片</p>
                  <p className="text-[18px] font-semibold">9 张</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-[12px] text-muted-foreground">预计利润率</p>
                  <p className="text-[18px] font-semibold text-green-600">35%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="border-t p-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            上一步
          </Button>
          
          {currentStep === 0 ? (
            <Button
              onClick={() => {
                handleExecute();
                setCurrentStep(1);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              开始AI选品
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              下一步
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              确认上架
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
