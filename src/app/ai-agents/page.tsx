'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Bot,
  Search,
  Package,
  Image as ImageIcon,
  Video,
  FileText,
  Megaphone,
  Headphones,
  BarChart3,
  ArrowRight,
  Play,
  Settings,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// 智能体完整配置
const AGENTS_CONFIG = [
  {
    id: 'product-selection',
    name: '选品智能体',
    icon: Package,
    priority: 'P0',
    status: 'active',
    description: '爆款挖掘、竞品分析、利润核算、供应链匹配',
    platform: 'TK/亚马逊',
    features: ['爆款挖掘', '竞品分析', '利润核算', '供应链匹配'],
    compliance: true,
    riskControl: false,
    dataSource: '选品工具API',
    output: '爆品清单',
    color: 'blue',
  },
  {
    id: 'image-design',
    name: '图片智能体',
    icon: ImageIcon,
    priority: 'P0',
    status: 'active',
    description: '图片翻译模式(OCR+翻译)、优化模式(去水印/白底图)、合规校验',
    platform: 'TK/亚马逊',
    features: ['OCR识别', '图片翻译', '去水印', '白底图', '合规校验'],
    compliance: true,
    riskControl: false,
    dataSource: 'ERP商品库',
    output: '处理后的图片',
    color: 'purple',
  },
  {
    id: 'listing-optimization',
    name: 'Listing优化智能体',
    icon: FileText,
    priority: 'P1',
    status: 'active',
    description: '标题/五点描述/A+内容优化、关键词挖掘、平台差异化适配',
    platform: 'TK/亚马逊',
    features: ['标题优化', '五点描述', 'A+内容', '关键词挖掘', '平台适配'],
    compliance: true,
    riskControl: false,
    dataSource: 'ERP商品库',
    output: '优化后Listing',
    color: 'green',
  },
  {
    id: 'advertising',
    name: '广告投放智能体',
    icon: Megaphone,
    priority: 'P1',
    status: 'active',
    description: '预算分配、出价建议、关键词挖掘、广告风控引擎',
    platform: 'TK Ads/亚马逊PPC',
    features: ['预算分配', '出价建议', '关键词挖掘', '风控引擎'],
    compliance: false,
    riskControl: true,
    riskRules: ['日消耗≤500元', 'ROI≥1:1', '点击成本≤0.5/1美元'],
    dataSource: 'ERP订单/广告数据',
    output: '广告计划',
    color: 'orange',
  },
  {
    id: 'customer-service',
    name: 'AI客服智能体',
    icon: Headphones,
    priority: 'P1',
    status: 'active',
    description: '多语种回复、纠纷处理、话术合规、物流轨迹查询',
    platform: 'TK/亚马逊',
    features: ['多语种回复', '纠纷处理', '话术合规', '物流查询'],
    compliance: true,
    riskControl: false,
    disputeRules: ['自动退款≤50美元', '高金额转人工'],
    dataSource: 'ERP订单/商品/物流',
    output: '回复内容/纠纷方案',
    color: 'cyan',
  },
  {
    id: 'data-review',
    name: '数据复盘智能体',
    icon: BarChart3,
    priority: 'P1',
    status: 'active',
    description: '销售分析、流量分析、ROI计算、自动化任务转化',
    platform: '全平台',
    features: ['销售分析', '流量分析', 'ROI计算', '任务转化'],
    compliance: false,
    riskControl: false,
    taskConversion: ['ROI<1:1→暂停广告', '转化率>10%→增加预算'],
    dataSource: 'ERP全量数据',
    output: '分析报告+任务清单',
    color: 'indigo',
  },
  {
    id: 'video-generation',
    name: '视频生成智能体',
    icon: Video,
    priority: 'P2',
    status: 'active',
    description: '脚本生成、AI配音、字幕、图文轮播视频（v1.0只做脚本+配音）',
    platform: 'TK东南亚',
    features: ['脚本生成', 'AI配音', '字幕生成', '图文轮播'],
    compliance: true,
    riskControl: false,
    dataSource: 'ERP商品库',
    output: '脚本+配音文件',
    color: 'pink',
  },
];

// 颜色映射 - 优化渐变
const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-blue-500/25', gradient: 'from-blue-500/20 to-blue-500/5' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-600', border: 'border-purple-500/25', gradient: 'from-purple-500/20 to-purple-500/5' },
  green: { bg: 'bg-green-500/15', text: 'text-green-600', border: 'border-green-500/25', gradient: 'from-green-500/20 to-green-500/5' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-600', border: 'border-orange-500/25', gradient: 'from-orange-500/20 to-orange-500/5' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-600', border: 'border-cyan-500/25', gradient: 'from-cyan-500/20 to-cyan-500/5' },
  indigo: { bg: 'bg-indigo-500/15', text: 'text-indigo-600', border: 'border-indigo-500/25', gradient: 'from-indigo-500/20 to-indigo-500/5' },
  pink: { bg: 'bg-pink-500/15', text: 'text-pink-600', border: 'border-pink-500/25', gradient: 'from-pink-500/20 to-pink-500/5' },
};

export default function AIAgentsCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalCalls, setTotalCalls] = useState(1234);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 过滤智能体
  const filteredAgents = AGENTS_CONFIG.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 统计数据
  const activeCount = AGENTS_CONFIG.filter(a => a.status === 'active').length;
  const complianceCount = AGENTS_CONFIG.filter(a => a.compliance).length;
  const riskControlCount = AGENTS_CONFIG.filter(a => a.riskControl).length;

  const handleLogout = () => {
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">AI智能体中心</h1>
              <p className="text-sm text-muted-foreground">
                7大AI智能体 · 合规校验 · 风控引擎 · 全链路自动化
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              {activeCount}/{AGENTS_CONFIG.length} 在线
            </Badge>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              刷新状态
            </Button>
          </div>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-blue-500 font-medium">智能选品</span>
              </div>
              <div className="text-xl font-semibold text-foreground">AI驱动</div>
              <div className="text-xs text-muted-foreground">爆款挖掘+竞品分析</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-purple-500 font-medium">图片处理</span>
              </div>
              <div className="text-xl font-semibold text-foreground">双模式</div>
              <div className="text-xs text-muted-foreground">翻译模式+优化模式</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 font-medium">合规校验</span>
              </div>
              <div className="text-xl font-semibold text-foreground">{complianceCount}个</div>
              <div className="text-xs text-muted-foreground">内置合规检查</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-orange-500 font-medium">风控引擎</span>
              </div>
              <div className="text-xl font-semibold text-foreground">{riskControlCount}个</div>
              <div className="text-xs text-muted-foreground">实时风险监控</div>
            </CardContent>
          </Card>
        </div>

        {/* 智能体列表 */}
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="grid">卡片视图</TabsTrigger>
              <TabsTrigger value="list">列表视图</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索智能体..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-md text-sm w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* 卡片视图 */}
          <TabsContent value="grid" className="space-y-0">
            <div className="grid grid-cols-2 gap-4">
              {filteredAgents.map((agent) => {
                const Icon = agent.icon;
                const colors = colorMap[agent.color];
                return (
                  <Card key={agent.id} className={cn(
                    `bg-gradient-to-br ${colors.gradient} ${colors.border} shadow-sm`,
                    'hover:shadow-lg hover:shadow-primary/10',
                    'transition-all duration-300 ease-out group animate-fade-in',
                    'hover:-translate-y-1 hover:border-primary/30'
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            `w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`,
                            'shadow-sm group-hover:shadow-md transition-shadow duration-300'
                          )}>
                            <Icon className={cn(`h-6 w-6 ${colors.text}`, 'group-hover:scale-110 transition-transform duration-300')} />
                          </div>
                          <div>
                            <CardTitle className="text-base group-hover:text-primary transition-colors">{agent.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge className={cn(
                                agent.priority === 'P0'
                                  ? 'bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-600 border-red-500/30 shadow-sm'
                                  : 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 text-yellow-600 border-yellow-500/30 shadow-sm',
                                'text-xs font-medium'
                              )}>
                                {agent.priority}
                              </Badge>
                              <Badge className="bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-600 border-green-500/30 text-xs font-medium shadow-sm animate-pulse-glow">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                在线
                              </Badge>
                              {agent.compliance && (
                                <Badge variant="outline" className="bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-600 border-green-500/30 text-xs font-medium">
                                  <Shield className="h-3 w-3 mr-1" />
                                  合规
                                </Badge>
                              )}
                              {agent.riskControl && (
                                <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-600 border-orange-500/30 text-xs font-medium">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  风控
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
                      
                      {/* 功能标签 */}
                      <div className="flex flex-wrap gap-1.5">
                        {agent.features.slice(0, 4).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-white/60 border-border/50">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      {/* 数据来源和输出 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <Search className="h-3 w-3" />
                          <span>{agent.dataSource}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          <span>{agent.output}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" className="flex-1 shadow-sm hover:shadow-md" asChild>
                          <Link href={`/agents/${agent.id}`}>
                            <Play className="h-3 w-3 mr-1" />
                            执行
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="shadow-sm hover:shadow-md" asChild>
                          <Link href={`/agents/${agent.id}`}>
                            <Settings className="h-3 w-3 mr-1" />
                            配置
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* 列表视图 */}
          <TabsContent value="list" className="space-y-0">
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="p-3 font-medium">智能体</th>
                      <th className="p-3 font-medium">优先级</th>
                      <th className="p-3 font-medium">平台</th>
                      <th className="p-3 font-medium">功能</th>
                      <th className="p-3 font-medium">合规/风控</th>
                      <th className="p-3 font-medium">状态</th>
                      <th className="p-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAgents.map((agent) => {
                      const Icon = agent.icon;
                      const colors = colorMap[agent.color];
                      return (
                        <tr key={agent.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded ${colors.bg} flex items-center justify-center`}>
                                <Icon className={`h-4 w-4 ${colors.text}`} />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{agent.name}</div>
                                <div className="text-xs text-muted-foreground">{agent.description.slice(0, 30)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={agent.priority === 'P0' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-600'}>
                              {agent.priority}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">{agent.platform}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {agent.features.slice(0, 2).map((f, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                              ))}
                              {agent.features.length > 2 && (
                                <Badge variant="secondary" className="text-xs">+{agent.features.length - 2}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {agent.compliance && <Shield className="h-4 w-4 text-green-500" />}
                              {agent.riskControl && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                              {!agent.compliance && !agent.riskControl && <span className="text-muted-foreground">-</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-success/10 text-success">在线</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/agents/${agent.id}`}>
                                  <Play className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/agents/${agent.id}`}>
                                  <Settings className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 快捷入口 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">快捷功能</CardTitle>
            <CardDescription>常用操作入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/workflows">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm">工作台</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/erp/collection">
                  <Package className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">1688采集</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/models">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">模型配置</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/prompts">
                  <FileText className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Prompt中心</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
