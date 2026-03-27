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
} from "lucide-react";
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// 工作流模板类型
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps_count: number;
}

// 默认工作流模板（根据原型文档定义）
const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'full_automation',
    name: '全链路自动化',
    description: '选品→采集→图片处理→智能定价→Listing优化→商品上架',
    steps_count: 6,
  },
  {
    id: 'image_pipeline',
    name: '图片处理流水线',
    description: '1688采集→图片翻译/优化处理',
    steps_count: 2,
  },
  {
    id: 'single_product_publish',
    name: '单商品上架',
    description: '采集→图片处理→智能定价→Listing优化→上架',
    steps_count: 5,
  },
  {
    id: 'order_fulfillment',
    name: '订单履约流程',
    description: '订单同步→库存检查→采购→物流发货',
    steps_count: 4,
  },
  {
    id: 'ad_campaign',
    name: '广告投放流程',
    description: '表现分析→广告计划→提交投放',
    steps_count: 3,
  },
];

// 工作流步骤图标映射
const stepIconMap: Record<string, React.ReactNode> = {
  'product_selection': <Bot className="h-4 w-4" />,
  'collect_1688': <Package className="h-4 w-4" />,
  'image_processing': <Image className="h-4 w-4" />,
  'pricing': <DollarSign className="h-4 w-4" />,
  'listing_optimization': <FileText className="h-4 w-4" />,
  'publish': <Upload className="h-4 w-4" />,
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);

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
                  onClick={() => toast.info("功能开发中", { description: "工作流详情页面即将上线" })}
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
    </MainLayout>
  );
}
