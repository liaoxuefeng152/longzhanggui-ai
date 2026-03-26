'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  BarChart3,
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Settings,
  Download,
  Eye,
  Zap,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Bell,
  Send,
  RotateCcw,
} from 'lucide-react';

interface OptimizationTask {
  id: string;
  type: 'low_roi' | 'high_conversion' | 'no_traffic' | 'high_dispute';
  productName: string;
  platform: 'TK' | 'Amazon';
  trigger: string;
  suggestion: string;
  autoAction: string;
  status: 'pending' | 'processing' | 'completed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface Report {
  id: string;
  type: 'daily' | 'weekly';
  date: string;
  platform: 'TK' | 'Amazon' | 'all';
  status: 'generated' | 'sent';
  sentAt?: string;
}

const mockOptimizationTasks: OptimizationTask[] = [
  {
    id: 'OPT001',
    type: 'low_roi',
    productName: '榨汁机-美国站',
    platform: 'Amazon',
    trigger: 'ROI < 1:1',
    suggestion: '广告暂停 + Listing重新优化',
    autoAction: '已触发广告暂停，待执行Listing优化',
    status: 'processing',
    priority: 'high',
    createdAt: '2026-03-21 03:00',
  },
  {
    id: 'OPT002',
    type: 'high_conversion',
    productName: '宠物喂食器-印尼站',
    platform: 'TK',
    trigger: '转化率 > 10%',
    suggestion: '广告预算增加20%',
    autoAction: '已自动增加广告预算',
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-03-21 03:00',
  },
  {
    id: 'OPT003',
    type: 'no_traffic',
    productName: '智能手环-泰国站',
    platform: 'TK',
    trigger: '7天曝光 < 1000',
    suggestion: '选品智能体重选同款替代商品',
    autoAction: '待触发选品智能体',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-03-21 03:00',
  },
  {
    id: 'OPT004',
    type: 'high_dispute',
    productName: 'LED化妆镜-越南站',
    platform: 'TK',
    trigger: '纠纷率 > 5%',
    suggestion: '商品下架 + 客服复盘',
    autoAction: '待确认后执行',
    status: 'pending',
    priority: 'high',
    createdAt: '2026-03-21 03:00',
  },
];

const mockReports: Report[] = [
  { id: 'RPT001', type: 'daily', date: '2026-03-21', platform: 'all', status: 'sent', sentAt: '2026-03-21 03:30' },
  { id: 'RPT002', type: 'weekly', date: '2026-03-15~21', platform: 'all', status: 'generated' },
  { id: 'RPT003', type: 'daily', date: '2026-03-20', platform: 'all', status: 'sent', sentAt: '2026-03-20 03:30' },
];

const taskTriggerRules = [
  {
    id: 'TR001',
    condition: '低ROI商品',
    trigger: 'ROI < 1:1',
    action: '自动触发「广告暂停+Listing重新优化」任务',
    status: 'active',
  },
  {
    id: 'TR002',
    condition: '高转化商品',
    trigger: '转化率 > 10%',
    action: '自动触发「广告预算增加20%」任务',
    status: 'active',
  },
  {
    id: 'TR003',
    condition: '无流量商品',
    trigger: '7天曝光 < 1000',
    action: '自动触发「选品智能体重选同款替代商品」任务',
    status: 'active',
  },
  {
    id: 'TR004',
    condition: '高纠纷率商品',
    trigger: '纠纷率 > 5%',
    action: '自动触发「商品下架+客服复盘」任务',
    status: 'active',
  },
];

export default function ReviewAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'processing'>('online');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      low_roi: '低ROI优化',
      high_conversion: '高转化加推',
      no_traffic: '无流量重选',
      high_dispute: '高纠纷处理',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待执行', className: 'bg-warning/10 text-warning border-warning/20' },
      processing: { label: '执行中', className: 'bg-primary/10 text-primary border-primary/20' },
      completed: { label: '已完成', className: 'bg-success/10 text-success border-success/20' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; className: string }> = {
      high: { label: '高', className: 'bg-destructive/10 text-destructive border-destructive/20' },
      medium: { label: '中', className: 'bg-warning/10 text-warning border-warning/20' },
      low: { label: '低', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[priority] || config.low;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">数据复盘智能体</h1>
              <p className="text-[14px] text-muted-foreground">销售分析 · 流量分析 · ROI计算 · 自动化任务转化</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={agentStatus === 'online' ? 'bg-success text-white' : 'bg-warning text-white'}>
              {agentStatus === 'online' ? '在线运行' : agentStatus === 'processing' ? '处理中' : '离线'}
            </Badge>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button onClick={() => toast.success('数据复盘报告生成中...')}>
              <Play className="h-4 w-4 mr-2" />
              生成报告
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" />
            自动任务转化
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <BarChart3 className="h-3 w-3 mr-1" />
            销售分析
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            流量分析
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <DollarSign className="h-3 w-3 mr-1" />
            ROI计算
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日销售额</div>
              <div className="text-[24px] font-semibold text-foreground">¥12,580</div>
              <div className="text-[11px] text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                18% vs 昨日
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">订单数</div>
              <div className="text-[24px] font-semibold text-foreground">156</div>
              <div className="text-[11px] text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                12% vs 昨日
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">平均ROI</div>
              <div className="text-[24px] font-semibold text-success">2.35</div>
              <div className="text-[11px] text-muted-foreground mt-1">目标 ≥1:1</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">转化率</div>
              <div className="text-[24px] font-semibold text-foreground">8.6%</div>
              <div className="text-[11px] text-muted-foreground mt-1">行业平均 5%</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">560</div>
              <div className="text-[11px] text-muted-foreground mt-1">DeepSeek-V3</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">数据概览</TabsTrigger>
            <TabsTrigger value="tasks">优化任务</TabsTrigger>
            <TabsTrigger value="rules">转化规则</TabsTrigger>
            <TabsTrigger value="reports">报告管理</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 数据概览 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">平台销售分布</CardTitle>
                  <CardDescription>TK东南亚 vs 亚马逊美国站</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px]">TK东南亚</span>
                        <span className="text-[13px] font-medium">¥7,280 (58%)</span>
                      </div>
                      <Progress value={58} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px]">亚马逊美国站</span>
                        <span className="text-[13px] font-medium">¥5,300 (42%)</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">TOP商品表现</CardTitle>
                  <CardDescription>按销售额排序</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: '宠物喂食器', sales: 3280, roi: 2.8, trend: 'up' },
                      { name: '便携榨汁机', sales: 2150, roi: 1.5, trend: 'down' },
                      { name: 'LED化妆镜', sales: 1890, roi: 2.1, trend: 'up' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-4">{i + 1}</span>
                          <span className="text-[12px]">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px]">¥{item.sales}</span>
                          <span className={`text-[11px] ${item.roi >= 2 ? 'text-success' : 'text-warning'}`}>ROI {item.roi}</span>
                          {item.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 复盘摘要 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">今日复盘摘要</CardTitle>
                <CardDescription>AI自动分析生成，每日凌晨3点更新</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <div className="text-[12px] text-success font-medium mb-1">表现优秀</div>
                    <div className="text-[20px] font-semibold text-foreground">12</div>
                    <div className="text-[11px] text-muted-foreground">高转化商品</div>
                  </div>
                  <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="text-[12px] text-warning font-medium mb-1">需要关注</div>
                    <div className="text-[20px] font-semibold text-foreground">3</div>
                    <div className="text-[11px] text-muted-foreground">低ROI商品</div>
                  </div>
                  <div className="p-3 bg-muted/30 border border-border rounded-lg">
                    <div className="text-[12px] text-muted-foreground font-medium mb-1">无流量</div>
                    <div className="text-[20px] font-semibold text-foreground">2</div>
                    <div className="text-[11px] text-muted-foreground">需重新选品</div>
                  </div>
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div className="text-[12px] text-destructive font-medium mb-1">高纠纷</div>
                    <div className="text-[20px] font-semibold text-foreground">1</div>
                    <div className="text-[11px] text-muted-foreground">需下架处理</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 优化任务 */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">自动化优化任务</CardTitle>
                <CardDescription>复盘结果自动转化为优化任务，推送至龙虾调度中枢自动执行</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockOptimizationTasks.map((task) => (
                    <div key={task.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-foreground">{task.productName}</span>
                          <Badge variant="outline" className="text-[11px]">{task.platform}</Badge>
                          <Badge variant="outline" className="text-[11px]">{getTaskTypeLabel(task.type)}</Badge>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-[12px] mb-2">
                        <div>
                          <span className="text-muted-foreground">触发条件: </span>
                          <span className="text-foreground font-medium">{task.trigger}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">建议操作: </span>
                          <span className="text-primary font-medium">{task.suggestion}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">自动动作: </span>
                          <span className="text-foreground">{task.autoAction}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">{task.createdAt}</span>
                        <div className="flex items-center gap-2">
                          {task.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => toast.info('已跳过该任务')}>跳过</Button>
                              <Button size="sm" onClick={() => toast.success('正在执行数据复盘任务...')}>
                                <Send className="h-3 w-3 mr-1" />
                                执行
                              </Button>
                            </>
                          )}
                          {task.status === 'processing' && (
                            <Button variant="outline" size="sm" onClick={() => toast.info('正在查看任务进度...')}>
                              <Eye className="h-3 w-3 mr-1" />
                              查看进度
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 转化规则 */}
          <TabsContent value="rules" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">复盘→任务自动化转化规则</CardTitle>
                <CardDescription>实现"运营→分析→优化"的自动化循环，无人工干预也能持续优化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taskTriggerRules.map((rule) => (
                    <div key={rule.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-foreground">{rule.condition}</span>
                            <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary">{rule.trigger}</Badge>
                          </div>
                          <div className="text-[12px] text-muted-foreground">
                            触发动作: <span className="text-primary">{rule.action}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success">已启用</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 报告管理 */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">复盘报告</CardTitle>
                <CardDescription>日报（每日凌晨3点）、周报（每周一凌晨3点）</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.type === 'daily' ? 'bg-primary/10' : 'bg-success/10'}`}>
                          <FileText className={`h-5 w-5 ${report.type === 'daily' ? 'text-primary' : 'text-success'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-foreground">
                              {report.type === 'daily' ? '日报' : '周报'}
                            </span>
                            <Badge variant="outline" className="text-[11px]">{report.platform === 'all' ? '全平台' : report.platform}</Badge>
                          </div>
                          <div className="text-[12px] text-muted-foreground">{report.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {report.status === 'sent' ? (
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已推送飞书
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-warning/10 text-warning">
                            <Clock className="h-3 w-3 mr-1" />
                            待发送
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={() => toast.info('正在查看报告详情...')}>
                          <Eye className="h-3 w-3 mr-1" />
                          查看
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.success('报告已导出')}>
                          <Download className="h-3 w-3 mr-1" />
                          导出
                        </Button>
                        {report.status !== 'sent' && (
                          <Button size="sm" onClick={() => toast.success('报告已发送')}>
                            <Send className="h-3 w-3 mr-1" />
                            发送
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 配置设置 */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">智能体配置</CardTitle>
                <CardDescription>模型选择、复盘频率、任务转化规则配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">DeepSeek-V3 用于数据分析和报告生成</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="deepseek">DeepSeek-V3</option>
                      <option value="doubao">豆包-Seed-1.8</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">日报生成时间</div>
                      <div className="text-[11px] text-muted-foreground">每日凌晨3点自动生成并发送</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">03:00</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">周报生成时间</div>
                      <div className="text-[11px] text-muted-foreground">每周一凌晨3点自动生成并发送</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">周一 03:00</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">自动任务转化</div>
                      <div className="text-[11px] text-muted-foreground">复盘结果自动转化为优化任务，推送至调度中枢</div>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success">已启用</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">数据源</div>
                      <div className="text-[11px] text-muted-foreground">ERP全量销售、订单、广告、物流、客服数据</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('正在打开配置页面...')}>
                      <Settings className="h-4 w-4 mr-2" />
                      配置
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
