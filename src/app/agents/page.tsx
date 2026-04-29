'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Bot,
  Search,
  ShoppingCart,
  Image,
  Video,
  FileText,
  Megaphone,
  Headphones,
  BarChart3,
  Settings,
  Play,
  RefreshCw,
  Shield,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getAgents, Agent as AgentType } from '@/lib/api/agents';
import { logout } from '@/lib/api/auth';

// SKILL图标映射
const agentIcons: Record<string, any> = {
  'product-selection': ShoppingCart,
  'image-design': Image,
  'video-generation': Video,
  'listing-optimization': FileText,
  'advertising': Megaphone,
  'customer-service': Headphones,
  'data-review': BarChart3,
  'pricing': DollarSign,
};

// SKILL彩虹配色映射
const agentColors: Record<string, { bg: string; text: string; gradient: string }> = {
  'product-selection': { bg: 'bg-blue-500/10', text: 'text-blue-500', gradient: 'from-blue-500/20 to-cyan-400/5' },
  'image-design': { bg: 'bg-purple-500/10', text: 'text-purple-500', gradient: 'from-purple-500/20 to-pink-400/5' },
  'video-generation': { bg: 'bg-pink-500/10', text: 'text-pink-500', gradient: 'from-pink-500/20 to-rose-400/5' },
  'listing-optimization': { bg: 'bg-green-500/10', text: 'text-green-500', gradient: 'from-green-500/20 to-emerald-400/5' },
  'advertising': { bg: 'bg-orange-500/10', text: 'text-orange-500', gradient: 'from-orange-500/20 to-amber-400/5' },
  'customer-service': { bg: 'bg-cyan-500/10', text: 'text-cyan-500', gradient: 'from-cyan-500/20 to-teal-400/5' },
  'data-review': { bg: 'bg-indigo-500/10', text: 'text-indigo-500', gradient: 'from-indigo-500/20 to-violet-400/5' },
  'pricing': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', gradient: 'from-emerald-500/20 to-teal-400/5' },
};

// SKILL描述映射
const agentDescriptions: Record<string, { description: string; platform: string; features: string[]; compliance: boolean; riskControl: boolean }> = {
  'product-selection': {
    description: '爆款挖掘、竞品分析、利润核算、合规+供应链校验',
    platform: 'TK/亚马逊',
    features: ['爆款挖掘', '竞品分析', '利润核算', '供应链匹配'],
    compliance: true,
    riskControl: false,
  },
  'image-design': {
    description: '主图生成、背景替换、A+页面设计、图片合规校验',
    platform: 'TK/亚马逊',
    features: ['主图生成', '背景替换', 'A+页面设计', '合规校验'],
    compliance: true,
    riskControl: false,
  },
  'video-generation': {
    description: '脚本生成、AI配音、字幕、图文轮播视频、合规预检',
    platform: 'TK东南亚',
    features: ['脚本生成', 'AI配音', '图文轮播', '合规预检'],
    compliance: true,
    riskControl: false,
  },
  'listing-optimization': {
    description: '标题/五点/A+优化、关键词挖掘、平台差异化合规校验',
    platform: 'TK/亚马逊',
    features: ['标题优化', '五点描述', '关键词挖掘', '合规校验'],
    compliance: true,
    riskControl: false,
  },
  'advertising': {
    description: '预算分配、出价建议、关键词挖掘、广告风控引擎',
    platform: 'TK Ads/亚马逊PPC',
    features: ['预算分配', '出价建议', '关键词挖掘', '风控引擎'],
    compliance: false,
    riskControl: true,
  },
  'customer-service': {
    description: '多语种回复、纠纷处理、话术合规、物流轨迹查询',
    platform: 'TK/亚马逊',
    features: ['多语种回复', '纠纷处理', '话术合规', '物流查询'],
    compliance: true,
    riskControl: false,
  },
  'data-review': {
    description: '销售分析、流量分析、ROI计算、自动化任务转化',
    platform: '全平台',
    features: ['销售分析', '流量分析', 'ROI计算', '任务转化'],
    compliance: false,
    riskControl: false,
  },
  'pricing': {
    description: '竞品监控、保本计算、智能调价、盈亏保护',
    platform: 'Shopee/Lazada/TK',
    features: ['竞品监控', '保本计算', '智能调价', '盈亏保护'],
    compliance: false,
    riskControl: true,
  },
};

export default function AgentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 获取SKILL列表
  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await getAgents({ page: 1, page_size: 20 });
      setAgents(response.items);
      // 计算总调用次数
      const total = response.items.reduce((sum, a) => sum + (a.total_calls || 0), 0);
      setTotalCalls(total);
    } catch (error) {
      console.error('获取SKILL列表失败:', error);
      toast.error('获取SKILL列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchAgents();
  }, [router]);

  // 过滤SKILL
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: '在线', className: 'bg-success text-white' },
      inactive: { label: '离线', className: 'bg-muted text-muted-foreground' },
      error: { label: '异常', className: 'bg-destructive text-white' },
    };
    const config = statusMap[status] || statusMap.inactive;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // 忽略错误
    }
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 flex items-center justify-center">
              <Bot className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">SKILL调度配置</h1>
              <p className="text-[14px] text-muted-foreground">
                AISKILL工厂 · 7大核心SKILL · 合规+风控
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索SKILL"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md text-[14px] w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button variant="outline" onClick={fetchAgents} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              刷新状态
            </Button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">在线SKILL</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {agents.filter(a => a.status === 'active').length}/{agents.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总调用次数</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{totalCalls.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">SKILL类型</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{agents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">合规校验</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">已启用</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SKILL卡片列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无SKILL数据
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredAgents.map((agent) => {
              const Icon = agentIcons[agent.type] || BarChart3;
              const meta = agentDescriptions[agent.type] || {
                description: agent.description || '',
                platform: '全平台',
                features: [],
                compliance: false,
                riskControl: false,
              };
              const colors = agentColors[agent.type] || { bg: 'bg-primary/10', text: 'text-primary', gradient: '' };
              
              return (
                <Card key={agent.id} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", colors.gradient || 'bg-primary/10')}>
                          <Icon className={cn("h-6 w-6", colors.text)} />
                        </div>
                        <div>
                          <CardTitle className="text-[16px] font-semibold">{agent.name}</CardTitle>
                          <CardDescription className="text-[12px]">{meta.platform}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {meta.compliance && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <Shield className="h-3 w-3 mr-1" />
                            合规
                          </Badge>
                        )}
                        {meta.riskControl && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            风控
                          </Badge>
                        )}
                        {getStatusBadge(agent.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[13px] text-muted-foreground">{meta.description}</p>
                    
                    {meta.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {meta.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-[11px]">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                      <div>
                        <div className="text-[12px] text-muted-foreground">调用次数</div>
                        <div className="text-[13px] font-medium text-foreground">{agent.total_calls?.toLocaleString() || 0}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-muted-foreground">状态</div>
                        <div className="text-[13px] font-medium text-success">
                          {agent.status === 'active' ? '运行中' : '已停止'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/agents/${agent.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          配置详情
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={fetchAgents}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
