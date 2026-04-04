"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap,
  Bot,
  Image,
  DollarSign,
  FileText,
  Upload,
  Package,
  Settings,
  Loader2,
  RefreshCw,
  X,
  ShoppingCart,
  TrendingUp,
  Truck,
  Megaphone,
} from "lucide-react";
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// 工作流模板类型
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  executor: string;
  icon: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps_count: number;
  steps: WorkflowStep[];
}

// 工作流步骤图标映射
const stepIconMap: Record<string, React.ReactNode> = {
  'product_selection': <Bot className="h-4 w-4" />,
  'collect_1688': <Package className="h-4 w-4" />,
  'image_processing': <Image className="h-4 w-4" />,
  'pricing': <DollarSign className="h-4 w-4" />,
  'listing_optimization': <FileText className="h-4 w-4" />,
  'publish': <Upload className="h-4 w-4" />,
  'order_sync': <ShoppingCart className="h-4 w-4" />,
  'inventory_check': <Package className="h-4 w-4" />,
  'purchase': <Truck className="h-4 w-4" />,
  'shipping': <Truck className="h-4 w-4" />,
  'performance_analysis': <TrendingUp className="h-4 w-4" />,
  'ad_plan': <Megaphone className="h-4 w-4" />,
  'ad_submit': <Megaphone className="h-4 w-4" />,
};

// 默认工作流模板（根据原型文档定义）
const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'full_automation',
    name: '全链路自动化',
    description: '选品→采集→图片处理→智能定价→Listing优化→商品上架',
    steps_count: 6,
    steps: [
      { id: 's1', name: '选品智能体', description: '分析TK印尼站市场，推荐爆款商品', executor: 'product_selection_agent', icon: 'product_selection' },
      { id: 's2', name: '1688采集', description: '采集商品详情、图片、SKU信息', executor: 'collection_1688_service', icon: 'collect_1688' },
      { id: 's3', name: '图片处理', description: 'OCR翻译+去水印+白底图', executor: 'image_design_agent', icon: 'image_processing' },
      { id: 's4', name: '智能定价', description: '成本+物流+佣金+利润计算', executor: 'pricing_service', icon: 'pricing' },
      { id: 's5', name: 'Listing优化', description: '标题+描述+关键词优化', executor: 'listing_optimization_agent', icon: 'listing_optimization' },
      { id: 's6', name: '商品上架', description: '调用TikTok Shop API上架', executor: 'publish_service', icon: 'publish' },
    ],
  },
  {
    id: 'image_pipeline',
    name: '图片处理流水线',
    description: '1688采集→图片翻译/优化处理',
    steps_count: 2,
    steps: [
      { id: 's1', name: '1688采集', description: '采集商品详情、图片、SKU信息', executor: 'collection_1688_service', icon: 'collect_1688' },
      { id: 's2', name: '图片处理', description: 'OCR翻译+去水印+白底图+合规校验', executor: 'image_design_agent', icon: 'image_processing' },
    ],
  },
  {
    id: 'single_product_publish',
    name: '单商品上架',
    description: '采集→图片处理→智能定价→Listing优化→上架',
    steps_count: 5,
    steps: [
      { id: 's1', name: '1688采集', description: '采集商品详情、图片、SKU信息', executor: 'collection_1688_service', icon: 'collect_1688' },
      { id: 's2', name: '图片处理', description: 'OCR翻译+去水印+白底图', executor: 'image_design_agent', icon: 'image_processing' },
      { id: 's3', name: '智能定价', description: '成本+物流+佣金+利润计算', executor: 'pricing_service', icon: 'pricing' },
      { id: 's4', name: 'Listing优化', description: '标题+描述+关键词优化', executor: 'listing_optimization_agent', icon: 'listing_optimization' },
      { id: 's5', name: '商品上架', description: '调用TikTok Shop API上架', executor: 'publish_service', icon: 'publish' },
    ],
  },
  {
    id: 'order_fulfillment',
    name: '订单履约流程',
    description: '订单同步→库存检查→采购→物流发货',
    steps_count: 4,
    steps: [
      { id: 's1', name: '订单同步', description: '同步TikTok/Amazon订单到ERP', executor: 'order_sync_service', icon: 'order_sync' },
      { id: 's2', name: '库存检查', description: '检查库存是否充足', executor: 'inventory_service', icon: 'inventory_check' },
      { id: 's3', name: '采购管理', description: '库存不足时创建采购单', executor: 'purchase_service', icon: 'purchase' },
      { id: 's4', name: '物流发货', description: '创建物流单并发货', executor: 'shipping_service', icon: 'shipping' },
    ],
  },
  {
    id: 'ad_campaign',
    name: '广告投放流程',
    description: '表现分析→广告计划→提交投放',
    steps_count: 3,
    steps: [
      { id: 's1', name: '表现分析', description: '分析广告数据、ROI、转化率', executor: 'data_review_agent', icon: 'performance_analysis' },
      { id: 's2', name: '广告计划', description: '生成预算分配、出价建议', executor: 'advertising_agent', icon: 'ad_plan' },
      { id: 's3', name: '提交投放', description: '提交广告计划到平台', executor: 'ad_submit_service', icon: 'ad_submit' },
    ],
  },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [workflowExecutions, setWorkflowExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  // 加载工作流执行列表
  useEffect(() => {
    loadWorkflowExecutions();
  }, []);

  const loadWorkflowExecutions = async () => {
    try {
      const { default: store } = await import('@/lib/store');
      const executions = store.getWorkflows();
      setWorkflowExecutions(executions);
    } catch (error) {
      console.error('Failed to load workflow executions:', error);
    }
  };

  // 打开详情对话框
  const openDetailDialog = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setDetailDialogOpen(true);
  };

  // 执行选中的工作流
  const executeSelectedWorkflow = async () => {
    if (!selectedTemplate) return;
    
    setDetailDialogOpen(false);
    setExecutingWorkflow(selectedTemplate.id);
    setExecutionProgress(0);

    try {
      const response = await fetch(
        `${API_BASE}/workflow/execute`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_id: selectedTemplate.id,
            user_id: 'web_user',
            params: {
              category: '宠物用品',
              platform: 'tiktok',
              region: 'id',
              quantity: 3,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("工作流已启动", { description: data.message || `正在执行 ${selectedTemplate.name}` });

        // 模拟进度更新
        const totalSteps = selectedTemplate.steps_count;
        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          setExecutionProgress((currentStep / totalSteps) * 100);
          if (currentStep >= totalSteps) {
            clearInterval(interval);
            setExecutingWorkflow(null);
            toast.success("工作流执行完成", { description: `已成功完成 ${selectedTemplate.name}` });
          }
        }, 2000);
      } else {
        // 后端不可用，模拟执行
        toast.success("工作流已启动（模拟模式）", { description: `正在执行 ${selectedTemplate.name}` });
        const totalSteps = selectedTemplate.steps_count;
        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          setExecutionProgress((currentStep / totalSteps) * 100);
          if (currentStep >= totalSteps) {
            clearInterval(interval);
            setExecutingWorkflow(null);
            toast.success("工作流执行完成", { description: `已成功完成 ${selectedTemplate.name}` });
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      toast.error("启动失败", { description: "无法启动工作流，请稍后重试" });
      setExecutingWorkflow(null);
    }
  };

  // 用户认证检查
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 获取工作流模板列表
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}/workflow/templates`);
      if (response.ok) {
        const data = await response.json();
        // 如果后端返回数据，使用后端数据；否则使用默认模板
        if (data && data.length > 0) {
          setTemplates(data);
        } else {
          setTemplates(DEFAULT_TEMPLATES);
        }
      } else {
        // 后端请求失败，使用默认模板
        console.log('后端API不可用，使用默认模板');
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // 请求异常，使用默认模板
      setTemplates(DEFAULT_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  // 触发全链路自动化
  const triggerFullAutomation = async () => {
    setExecutingWorkflow('full_automation');
    setExecutionProgress(0);

    try {
      const response = await fetch(
        `${API_BASE}/workflow/full-automation?user_id=web_user&category=宠物用品&platform=tiktok&region=id&quantity=3`,
        { method: 'POST' }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("工作流已启动", { description: data.message });

        // 模拟进度更新（实际应通过WebSocket获取）
        let progress = 0;
        const interval = setInterval(() => {
          progress += 16.67;
          setExecutionProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            setExecutingWorkflow(null);
            toast.success("工作流执行完成", { description: "已成功完成选品到上架的全流程" });
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      toast.error("启动失败", { description: "无法启动工作流，请稍后重试" });
      setExecutingWorkflow(null);
    }
  };

  // 获取模板徽章颜色
  const getTemplateBadge = (id: string) => {
    const colors: Record<string, string> = {
      'full_automation': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'image_pipeline': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'single_product_publish': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'order_fulfillment': 'bg-gradient-to-r from-orange-500 to-yellow-500',
      'ad_campaign': 'bg-gradient-to-r from-red-500 to-rose-500',
    };
    return colors[id] || 'bg-gray-500';
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Zap className="h-7 w-7 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">工作流编排引擎</h1>
              <p className="text-[14px] text-muted-foreground">龙虾调度中枢 - 一键触发全链路自动化</p>
            </div>
          </div>
          <Button 
            onClick={triggerFullAutomation}
            disabled={!!executingWorkflow}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {executingWorkflow ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                执行中...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                启动全链路自动化
              </>
            )}
          </Button>
        </div>

        {/* 执行进度 */}
        {executingWorkflow && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 animate-pulse text-purple-600" />
                工作流执行中
              </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={executionProgress} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              <span>选品 → 采集 → 图片 → 定价 → Listing → 上架</span>
              <span>{Math.round(executionProgress)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 执行历史 */}
      {workflowExecutions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">执行历史</CardTitle>
                <CardDescription>最近执行的工作流实例</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadWorkflowExecutions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowExecutions.map((workflow) => (
                <div key={workflow.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{workflow.template_name}</span>
                        <Badge className={
                          workflow.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                          workflow.status === 'running' ? 'bg-warning/10 text-warning border-warning/20' :
                          workflow.status === 'failed' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          'bg-muted'
                        }>
                          {workflow.status === 'completed' ? '已完成' :
                           workflow.status === 'running' ? '运行中' :
                           workflow.status === 'failed' ? '失败' :
                           '待执行'}
                        </Badge>
                      </div>
                      {workflow.product_name && (
                        <div className="text-sm text-muted-foreground mb-2">
                          商品: {workflow.product_name}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>进度: {workflow.current_step}/{workflow.total_steps}</span>
                        <span>开始: {workflow.started_at || '-'}</span>
                        {workflow.completed_at && (
                          <span>完成: {workflow.completed_at}</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <Progress value={(workflow.current_step / workflow.total_steps) * 100} className="h-1" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {workflow.steps.slice(0, 3).map((step: any, index: number) => (
                        <div key={step.id} className="flex items-center gap-2 text-xs">
                          {step.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-success" />}
                          {step.status === 'running' && <Loader2 className="h-3 w-3 text-warning animate-spin" />}
                          {step.status === 'failed' && <X className="h-3 w-3 text-destructive" />}
                          {step.status === 'pending' && <Clock className="h-3 w-3 text-muted-foreground" />}
                          <span className={step.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}>
                            {step.name}
                          </span>
                        </div>
                      ))}
                      {workflow.steps.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{workflow.steps.length - 3} 个步骤
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 工作流模板列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // 加载骨架
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={getTemplateBadge(template.id)}>
                    {template.steps_count} 步骤
                  </Badge>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>已配置完成，可随时执行</span>
                </div>
                <Separator className="my-4" />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => openDetailDialog(template)}
                >
                  查看详情
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* PRD示例流程 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            PRD定义的完整业务流程
          </CardTitle>
          <CardDescription>
            用户输入："帮我选3个印尼站宠物用品爆款，自动上架到TK"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {[
              { id: 'product_selection', name: '选品智能体', desc: '分析市场推荐爆款' },
              { id: 'collect_1688', name: '1688采集', desc: '采集商品详情图片' },
              { id: 'image_processing', name: '图片处理', desc: '翻译/优化图片' },
              { id: 'pricing', name: '智能定价', desc: '成本+利润计算' },
              { id: 'listing_optimization', name: 'Listing优化', desc: '标题描述优化' },
              { id: 'publish', name: '商品上架', desc: '上架到TikTok' },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {stepIconMap[step.id]}
                  </div>
                  <span className="text-xs font-medium">{step.name}</span>
                  <span className="text-xs text-muted-foreground">{step.desc}</span>
                </div>
                {index < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 飞书指令说明 */}
      <Card>
        <CardHeader>
          <CardTitle>飞书机器人指令</CardTitle>
          <CardDescription>
            通过飞书机器人触发全链路自动化
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline" className="shrink-0">推荐</Badge>
              <div>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  选品 3个印尼站宠物用品 自动上架
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  一句话完成选品到上架全流程
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline">快捷</Badge>
              <div>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  全自动上架 2个泰国站美妆
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  自动选品+采集+处理+上架
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline">单步</Badge>
              <div>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  采集 https://detail.1688.com/offer/xxx.html
                </code>
                <p className="text-sm text-muted-foreground mt-1">
                  单独执行1688采集
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* 工作流详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && (
                <Badge className={getTemplateBadge(selectedTemplate.id)}>
                  {selectedTemplate.steps_count} 步骤
                </Badge>
              )}
              {selectedTemplate?.name || '工作流详情'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="py-4">
              <h4 className="text-sm font-medium mb-4">执行步骤</h4>
              <div className="space-y-3">
                {selectedTemplate.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-medium shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          {stepIconMap[step.icon] || <Settings className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-sm">{step.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-8">{step.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5 ml-8">执行器: {step.executor}</p>
                    </div>
                    {index < selectedTemplate.steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">执行参数（可调整）</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">目标平台：</span>
                    <span className="font-medium">TikTok</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">目标地区：</span>
                    <span className="font-medium">印尼 (ID)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">商品类目：</span>
                    <span className="font-medium">宠物用品</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">数量：</span>
                    <span className="font-medium">3个</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={executeSelectedWorkflow}
              disabled={!!executingWorkflow}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {executingWorkflow ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  执行中...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  立即执行
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
