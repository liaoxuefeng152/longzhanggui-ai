'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Megaphone,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Zap,
  BarChart3,
  Eye,
  Ban,
  AlertOctagon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { createAdCampaign } from '@/lib/api/ai-agents';

interface AdCampaign {
  id: string;
  name: string;
  platform: 'TK Ads' | 'Amazon PPC';
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  clicks: number;
  conversions: number;
  roi: number;
  cpc: number;
  riskStatus: 'normal' | 'warning' | 'danger';
  riskReasons: string[];
}

interface RiskAlert {
  id: string;
  type: 'budget' | 'roi' | 'cpc';
  severity: 'warning' | 'danger';
  message: string;
  campaign: string;
  triggeredAt: string;
  action: 'auto_paused' | 'pending_confirm';
}

const mockCampaigns: AdCampaign[] = [
  {
    id: 'AD001',
    name: '宠物喂食器-印尼站-爆款推流',
    platform: 'TK Ads',
    status: 'active',
    budget: 300,
    spent: 185.6,
    clicks: 1250,
    conversions: 42,
    roi: 2.3,
    cpc: 0.15,
    riskStatus: 'normal',
    riskReasons: [],
  },
  {
    id: 'AD002',
    name: '榨汁机-美国站-关键词竞价',
    platform: 'Amazon PPC',
    status: 'paused',
    budget: 200,
    spent: 156.8,
    clicks: 890,
    conversions: 15,
    roi: 0.85,
    cpc: 0.18,
    riskStatus: 'danger',
    riskReasons: ['ROI低于1:1', '已达预算78%'],
  },
  {
    id: 'AD003',
    name: '化妆镜-印尼站-视频加热',
    platform: 'TK Ads',
    status: 'active',
    budget: 250,
    spent: 198.5,
    clicks: 1560,
    conversions: 38,
    roi: 1.8,
    cpc: 0.13,
    riskStatus: 'warning',
    riskReasons: ['接近日预算上限'],
  },
  {
    id: 'AD004',
    name: '智能手环-美国站-品牌词',
    platform: 'Amazon PPC',
    status: 'active',
    budget: 500,
    spent: 320.2,
    clicks: 2100,
    conversions: 68,
    roi: 1.5,
    cpc: 0.15,
    riskStatus: 'normal',
    riskReasons: [],
  },
];

const mockRiskAlerts: RiskAlert[] = [
  {
    id: 'RA001',
    type: 'roi',
    severity: 'danger',
    message: 'ROI低于1:1，已自动暂停广告',
    campaign: '榨汁机-美国站-关键词竞价',
    triggeredAt: '2026-03-21 14:30',
    action: 'auto_paused',
  },
  {
    id: 'RA002',
    type: 'budget',
    severity: 'warning',
    message: '单日消耗接近预设阈值（79%）',
    campaign: '化妆镜-印尼站-视频加热',
    triggeredAt: '2026-03-21 13:15',
    action: 'pending_confirm',
  },
];

const riskControlRules = [
  {
    id: 'RC001',
    name: '预算风控',
    description: '单店铺单日广告消耗≤500元/天',
    threshold: '500元/天',
    action: '超阈值暂停所有广告',
    status: 'active',
  },
  {
    id: 'RC002',
    name: 'ROI风控',
    description: '单商品广告ROI＜1:1时自动暂停',
    threshold: 'ROI ≥ 1:1',
    action: '自动暂停该商品广告',
    status: 'active',
  },
  {
    id: 'RC003',
    name: '点击成本风控（TK）',
    description: 'TK Ads单次点击＞0.5美元时降低出价',
    threshold: '≤0.5美元',
    action: '自动降低出价20%',
    status: 'active',
  },
  {
    id: 'RC004',
    name: '点击成本风控（亚马逊）',
    description: '亚马逊PPC单次点击＞1美元时降低出价',
    threshold: '≤1美元',
    action: '自动降低出价20%',
    status: 'active',
  },
];

export default function AdvertisingAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'processing'>('online');
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(mockCampaigns);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>(mockRiskAlerts);
  
  // 新建广告对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAd, setNewAd] = useState({
    product_id: '',
    platform: 'tiktok',
    daily_budget: 100,
    target_acos: 0.2,
  });

  // 详情对话框状态
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // API配置对话框状态
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 创建广告
  const handleCreateAd = async () => {
    if (!newAd.product_id.trim()) {
      toast.error('请输入产品ID');
      return;
    }

    setIsCreating(true);
    setAgentStatus('processing');

    try {
      const result = await createAdCampaign({
        product_id: newAd.product_id,
        platform: newAd.platform,
        daily_budget: newAd.daily_budget,
        target_acos: newAd.target_acos,
      });

      if (result.success && result.data) {
        const newCampaign: AdCampaign = {
          id: result.data.campaign_id || result.data.id || `campaign-${Date.now()}`,
          name: `广告计划-${newAd.product_id}`,
          platform: newAd.platform === 'tiktok' ? 'TK Ads' : 'Amazon PPC',
          status: 'active',
          budget: newAd.daily_budget,
          spent: 0,
          clicks: 0,
          conversions: 0,
          roi: 0,
          cpc: 0,
          riskStatus: 'normal',
          riskReasons: [],
        };
        setCampaigns([newCampaign, ...campaigns]);
        toast.success('广告计划创建成功！');
        setIsDialogOpen(false);
        setNewAd({
          product_id: '',
          platform: 'tiktok',
          daily_budget: 100,
          target_acos: 0.2,
        });
      } else {
        // 显示具体错误信息
        const errorMsg = result.data?.error || result.data?.message || '创建广告失败';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('创建广告失败:', error);
      toast.error(error.message || '创建广告失败');
    } finally {
      setIsCreating(false);
      setAgentStatus('online');
    }
  };

  // 暂停广告
  const handlePauseAd = (campaign: AdCampaign) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaign.id ? { ...c, status: 'paused' as const } : c
    ));
    toast.success(`广告"${campaign.name}"已暂停`);
  };

  // 查看详情
  const handleViewDetails = (campaign: AdCampaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
  };

  // 确认执行告警
  const handleConfirmAlert = (alert: RiskAlert) => {
    setRiskAlerts(prev => prev.filter(a => a.id !== alert.id));
    toast.success(`已确认执行: ${alert.message}`);
    
    // 根据告警类型执行相应操作
    if (alert.type === 'budget') {
      // 预算告警：暂停对应广告
      const campaign = campaigns.find(c => c.name === alert.campaign);
      if (campaign) {
        handlePauseAd(campaign);
      }
    }
  };

  // 拒绝告警
  const handleRejectAlert = (alert: RiskAlert) => {
    setRiskAlerts(prev => prev.filter(a => a.id !== alert.id));
    toast.success(`已拒绝告警: ${alert.message}`);
  };

  // 打开API配置
  const handleOpenConfig = () => {
    setIsConfigDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: '投放中', className: 'bg-success/10 text-success border-success/20' },
      paused: { label: '已暂停', className: 'bg-warning/10 text-warning border-warning/20' },
      ended: { label: '已结束', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status] || config.ended;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getRiskBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      normal: { label: '正常', className: 'bg-success/10 text-success border-success/20' },
      warning: { label: '预警', className: 'bg-warning/10 text-warning border-warning/20' },
      danger: { label: '风险', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const { label, className } = config[status] || config.normal;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
              <Megaphone className="h-7 w-7 text-orange-600" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">广告投放智能体</h1>
              <p className="text-[14px] text-muted-foreground">预算分配 · 出价建议 · 关键词挖掘 · 广告风控引擎</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              风控
            </Badge>
            <Badge className={agentStatus === 'online' ? 'bg-success text-white' : 'bg-warning text-white'}>
              {agentStatus === 'online' ? '在线运行' : agentStatus === 'processing' ? '处理中' : '离线'}
            </Badge>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              新建广告
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-warning/5 text-warning border-warning/20">
            <Shield className="h-3 w-3 mr-1" />
            风控引擎
          </Badge>
          <Badge variant="outline" className="bg-orange-500/5 text-orange-600 border-orange-500/20">
            <Target className="h-3 w-3 mr-1" />
            预算分配
          </Badge>
          <Badge variant="outline" className="bg-orange-500/5 text-orange-600 border-orange-500/20">
            <DollarSign className="h-3 w-3 mr-1" />
            出价建议
          </Badge>
          <Badge variant="outline" className="bg-orange-500/5 text-orange-600 border-orange-500/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            关键词挖掘
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日消耗</div>
              <div className="text-[24px] font-semibold text-foreground">¥860.1</div>
              <div className="text-[11px] text-muted-foreground mt-1">预算上限 ¥500/店</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">平均ROI</div>
              <div className="text-[24px] font-semibold text-success">1.86</div>
              <div className="text-[11px] text-muted-foreground mt-1">目标 ≥1:1</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">投放中广告</div>
              <div className="text-[24px] font-semibold text-foreground">12</div>
              <div className="text-[11px] text-muted-foreground mt-1">已暂停 3</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">风控触发</div>
              <div className="text-[24px] font-semibold text-warning">2</div>
              <div className="text-[11px] text-muted-foreground mt-1">今日告警</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">890</div>
              <div className="text-[11px] text-muted-foreground mt-1">DeepSeek-V3</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="campaigns">广告计划</TabsTrigger>
            <TabsTrigger value="risk">风控中心</TabsTrigger>
            <TabsTrigger value="alerts">告警记录</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 广告计划 */}
          <TabsContent value="campaigns" className="space-y-4">
            {/* 操作栏 */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索广告计划..."
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">全部平台</option>
                    <option value="TK">TK Ads</option>
                    <option value="Amazon">亚马逊PPC</option>
                  </select>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">全部状态</option>
                    <option value="active">投放中</option>
                    <option value="paused">已暂停</option>
                    <option value="ended">已结束</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* 广告列表 */}
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-white border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-foreground">{campaign.name}</span>
                          <Badge variant="outline" className="text-[11px]">{campaign.platform}</Badge>
                          {getStatusBadge(campaign.status)}
                          {getRiskBadge(campaign.riskStatus)}
                        </div>
                        {campaign.riskReasons.length > 0 && (
                          <div className="flex items-center gap-2 text-[11px] text-warning">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{campaign.riskReasons.join(' · ')}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-6 gap-4">
                          <div>
                            <div className="text-[11px] text-muted-foreground">预算</div>
                            <div className="text-[13px] font-medium">¥{campaign.budget}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">消耗</div>
                            <div className="text-[13px] font-medium">¥{campaign.spent}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">点击</div>
                            <div className="text-[13px] font-medium">{campaign.clicks.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">转化</div>
                            <div className="text-[13px] font-medium">{campaign.conversions}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">ROI</div>
                            <div className={`text-[13px] font-medium ${campaign.roi >= 1 ? 'text-success' : 'text-destructive'}`}>
                              {campaign.roi}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">CPC</div>
                            <div className={`text-[13px] font-medium ${campaign.cpc <= 0.5 ? 'text-success' : 'text-warning'}`}>
                              ${campaign.cpc}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(campaign)}>
                          <Eye className="h-3 w-3 mr-1" />
                          详情
                        </Button>
                        {campaign.status === 'active' ? (
                          <Button variant="outline" size="sm" onClick={() => handlePauseAd(campaign)}>
                            <Pause className="h-3 w-3 mr-1" />
                            暂停
                          </Button>
                        ) : campaign.status === 'paused' ? (
                          <Button size="sm" onClick={() => {
                            setCampaigns(prev => prev.map(c => 
                              c.id === campaign.id ? { ...c, status: 'active' as const } : c
                            ));
                            toast.success(`广告"${campaign.name}"已恢复投放`);
                          }}>
                            <Play className="h-3 w-3 mr-1" />
                            恢复
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 风控中心 */}
          <TabsContent value="risk" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Shield className="h-5 w-5 text-warning" />
                  广告风控引擎
                </CardTitle>
                <CardDescription>风控规则触发后自动止损，杜绝无人值守下的重大损失</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskControlRules.map((rule) => (
                    <div key={rule.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-foreground">{rule.name}</span>
                            <Badge variant="outline" className="bg-success/10 text-success text-[10px]">已启用</Badge>
                          </div>
                          <div className="text-[12px] text-muted-foreground">{rule.description}</div>
                          <div className="flex items-center gap-4 text-[11px]">
                            <span className="text-muted-foreground">阈值: <span className="text-foreground font-medium">{rule.threshold}</span></span>
                            <span className="text-muted-foreground">触发动作: <span className="text-warning font-medium">{rule.action}</span></span>
                          </div>
                        </div>
                        <div className="text-[12px] text-muted-foreground">每小时校验1次</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 风控阈值说明 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">固化风控阈值（v1.0）</CardTitle>
                <CardDescription>v1.0版本阈值为固化值，后续版本支持自定义配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-[13px] font-medium text-foreground mb-2">TK Ads 阈值</div>
                    <div className="space-y-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">单次点击成本</span>
                        <span className="text-foreground font-medium">≤ $0.5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">单店日消耗</span>
                        <span className="text-foreground font-medium">≤ ¥500</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">商品ROI</span>
                        <span className="text-foreground font-medium">≥ 1:1</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-[13px] font-medium text-foreground mb-2">亚马逊PPC 阈值</div>
                    <div className="space-y-2 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">单次点击成本</span>
                        <span className="text-foreground font-medium">≤ $1.0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">单店日消耗</span>
                        <span className="text-foreground font-medium">≤ ¥500</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">商品ROI</span>
                        <span className="text-foreground font-medium">≥ 1:1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 告警记录 */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">风控告警记录</CardTitle>
                <CardDescription>风控触发后推送飞书告警，敏感操作需管理员确认</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${alert.severity === 'danger' ? 'border-destructive/50 bg-destructive/5' : 'border-warning/50 bg-warning/5'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert.severity === 'danger' ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                          {alert.severity === 'danger' ? (
                            <Ban className="h-4 w-4 text-destructive" />
                          ) : (
                            <AlertOctagon className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-medium text-foreground">{alert.message}</span>
                            <Badge variant="outline" className={`text-[10px] ${alert.severity === 'danger' ? 'border-destructive/50 text-destructive' : 'border-warning/50 text-warning'}`}>
                              {alert.severity === 'danger' ? '严重' : '警告'}
                            </Badge>
                          </div>
                          <div className="text-[12px] text-muted-foreground mb-2">
                            广告计划: {alert.campaign}
                          </div>
                          <div className="flex items-center gap-4 text-[11px]">
                            <span className="text-muted-foreground">触发时间: {alert.triggeredAt}</span>
                            <Badge variant="outline" className={`text-[10px] ${alert.action === 'auto_paused' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                              {alert.action === 'auto_paused' ? '已自动暂停' : '待确认'}
                            </Badge>
                          </div>
                        </div>
                        {alert.action === 'pending_confirm' && (
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectAlert(alert)}
                            >
                              拒绝
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleConfirmAlert(alert)}
                            >
                              确认执行
                            </Button>
                          </div>
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
                <CardDescription>模型选择、风控阈值、平台API配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">DeepSeek-V3 用于广告策略分析</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="deepseek">DeepSeek-V3</option>
                      <option value="doubao">豆包-Seed-1.8</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">风控校验频率</div>
                      <div className="text-[11px] text-muted-foreground">每小时校验1次风控阈值</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">1小时/次</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">敏感操作确认</div>
                      <div className="text-[11px] text-muted-foreground">广告单日消耗≥500元需管理员确认</div>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success">已启用</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">API对接</div>
                      <div className="text-[11px] text-muted-foreground">TK Ads / 亚马逊PPC API</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOpenConfig}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      配置
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 新建广告对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>新建广告计划</DialogTitle>
              <DialogDescription>
                创建新的广告投放计划，AI将自动优化出价和关键词
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">产品ID *</label>
                <input
                  type="text"
                  placeholder="例如：PROD001"
                  value={newAd.product_id}
                  onChange={(e) => setNewAd({ ...newAd, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">投放平台</label>
                <Select
                  value={newAd.platform}
                  onValueChange={(value) => setNewAd({ ...newAd, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok Ads</SelectItem>
                    <SelectItem value="amazon">Amazon PPC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">日预算（元）</label>
                <input
                  type="number"
                  placeholder="100"
                  value={newAd.daily_budget}
                  onChange={(e) => setNewAd({ ...newAd, daily_budget: parseFloat(e.target.value) || 100 })}
                  className="w-full px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">目标ACOS (%)</label>
                <input
                  type="number"
                  placeholder="20"
                  value={newAd.target_acos * 100}
                  onChange={(e) => setNewAd({ ...newAd, target_acos: (parseFloat(e.target.value) || 20) / 100 })}
                  className="w-full px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateAd} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    创建广告
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>广告详情 - {selectedCampaign?.name}</DialogTitle>
            </DialogHeader>
            {selectedCampaign && (
              <div className="space-y-6 py-4">
                {/* 基本信息 */}
                <div className="space-y-3">
                  <div className="text-[13px] font-medium text-foreground">基本信息</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-1">广告计划</div>
                      <div className="text-[13px] font-medium text-foreground">{selectedCampaign.name}</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-1">投放平台</div>
                      <div className="text-[13px] font-medium text-foreground">{selectedCampaign.platform}</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-1">状态</div>
                      <div className="text-[13px]">{getStatusBadge(selectedCampaign.status)}</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-1">风险状态</div>
                      <div className="text-[13px]">{getRiskBadge(selectedCampaign.riskStatus)}</div>
                    </div>
                  </div>
                </div>

                {/* 核心指标 */}
                <div className="space-y-3">
                  <div className="text-[13px] font-medium text-foreground">核心指标</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-2">预算使用</div>
                      <div className="text-[20px] font-semibold text-foreground">
                        ¥{selectedCampaign.spent.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        总预算 ¥{selectedCampaign.budget}
                      </div>
                      <Progress value={(selectedCampaign.spent / selectedCampaign.budget) * 100} className="mt-2 h-1" />
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-2">点击数</div>
                      <div className="text-[20px] font-semibold text-foreground">
                        {selectedCampaign.clicks}
                      </div>
                      <div className={`text-[11px] mt-1 ${selectedCampaign.cpc <= 0.5 ? 'text-success' : 'text-warning'}`}>
                        CPC ¥{selectedCampaign.cpc}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-2">转化数</div>
                      <div className="text-[20px] font-semibold text-foreground">
                        {selectedCampaign.conversions}
                      </div>
                      <div className={`text-[11px] mt-1 ${selectedCampaign.roi >= 1 ? 'text-success' : 'text-destructive'}`}>
                        ROI {selectedCampaign.roi.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 风险信息 */}
                {selectedCampaign.riskReasons.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[13px] font-medium text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      风险提示
                    </div>
                    <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                      <ul className="space-y-2">
                        {selectedCampaign.riskReasons.map((reason, index) => (
                          <li key={index} className="text-[12px] text-warning flex items-start gap-2">
                            <AlertOctagon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 转化数据 */}
                <div className="space-y-3">
                  <div className="text-[13px] font-medium text-foreground">转化数据</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-1">转化率</div>
                      <div className="text-[14px] font-medium text-foreground">
                        {selectedCampaign.clicks > 0 
                          ? ((selectedCampaign.conversions / selectedCampaign.clicks) * 100).toFixed(2) + '%'
                          : '0%'}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[11px] text-muted-foreground mb-1">平均转化成本</div>
                      <div className="text-[14px] font-medium text-foreground">
                        ¥{selectedCampaign.conversions > 0 
                          ? (selectedCampaign.spent / selectedCampaign.conversions).toFixed(2)
                          : '0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailOpen(false)}>
                关闭
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API配置对话框 */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>API 配置</DialogTitle>
              <DialogDescription>
                配置广告平台的 API 连接信息
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* TikTok Ads API 配置 */}
              <div className="space-y-3">
                <div className="text-[13px] font-medium text-foreground flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-orange-600" />
                  TikTok Ads API
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[12px] text-muted-foreground mb-1 block">Access Token</label>
                    <input
                      type="password"
                      placeholder="输入 Access Token"
                      className="w-full px-3 py-2 border border-border rounded-md text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground mb-1 block">Advertiser ID</label>
                    <input
                      type="text"
                      placeholder="输入 Advertiser ID"
                      className="w-full px-3 py-2 border border-border rounded-md text-[13px]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border my-4" />

              {/* Amazon PPC API 配置 */}
              <div className="space-y-3">
                <div className="text-[13px] font-medium text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-success" />
                  Amazon PPC API
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[12px] text-muted-foreground mb-1 block">Seller ID</label>
                    <input
                      type="text"
                      placeholder="输入 Seller ID"
                      className="w-full px-3 py-2 border border-border rounded-md text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground mb-1 block">Marketplace ID</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md text-[13px]">
                      <option value="ATVPDKIKX0DER">美国 (US)</option>
                      <option value="A1PA6795UKMFR9">欧洲 (EU)</option>
                      <option value="A2Q3Y263D00KWC">日本 (JP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground mb-1 block">AWS Access Key ID</label>
                    <input
                      type="text"
                      placeholder="输入 Access Key ID"
                      className="w-full px-3 py-2 border border-border rounded-md text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground mb-1 block">AWS Secret Key</label>
                    <input
                      type="password"
                      placeholder="输入 Secret Key"
                      className="w-full px-3 py-2 border border-border rounded-md text-[13px]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={() => {
                setIsConfigDialogOpen(false);
                toast.success('API 配置已保存');
              }}>
                保存配置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
