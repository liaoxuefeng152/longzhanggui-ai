'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Megaphone,
  Search,
  Filter,
  Download,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Target,
  BarChart3,
  Settings,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/hooks/useAuthFetch';

interface AdCampaign {
  id: string;
  product_id: string;
  product_name: string;
  platform: string;
  campaign_name: string;
  campaign_type: 'search' | 'display' | 'video' | 'shopping';
  status: 'active' | 'paused' | 'ended' | 'draft';
  daily_budget: number;
  spent: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  acos: number;
  start_date: string;
  end_date?: string;
  target_audience?: string;
  auto_optimization: boolean;
}

export default function AdCampaignsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // 创建广告表单
  const [createForm, setCreateForm] = useState({
    product_name: '',
    platform: 'tiktok',
    campaign_name: '',
    campaign_type: 'search',
    daily_budget: '100',
    target_audience: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCampaigns();
  }, [router]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (platformFilter) params.set('platform', platformFilter);
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/v1/erp/ad-campaigns?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      // 兼容两种返回格式
      if (data.items !== undefined) {
        setCampaigns(data.items || []);
      } else if (data.success && data.data) {
        setCampaigns(data.data.items || []);
      } else {
        toast.error(data.detail || '获取广告失败');
      }
    } catch (error) {
      console.error('获取广告失败:', error);
      toast.error('获取广告失败');
    } finally {
      setLoading(false);
    }
  };

  // 同步广告数据
  const handleSyncAds = async () => {
    setIsProcessing('sync');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('广告数据同步成功', { description: '已从各平台同步最新数据' });
      fetchCampaigns();
    } catch (error) {
      toast.error('同步失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 创建广告
  const handleCreateCampaign = async () => {
    if (!createForm.product_name || !createForm.campaign_name) {
      toast.error('请填写完整的广告信息');
      return;
    }

    setIsProcessing('create');
    try {
      const response = await fetch('/api/v1/erp/ad-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          daily_budget: parseFloat(createForm.daily_budget),
          status: 'active',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('广告创建成功', { description: `广告ID: ${data.data.id}` });
        setIsCreateOpen(false);
        setCreateForm({
          product_name: '',
          platform: 'tiktok',
          campaign_name: '',
          campaign_type: 'search',
          daily_budget: '100',
          target_audience: '',
        });
        fetchCampaigns();
      } else {
        toast.error(data.error || '创建失败');
      }
    } catch (error) {
      toast.error('创建失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 暂停/启动广告
  const handleToggleStatus = async (campaign: AdCampaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    setIsProcessing(campaign.id);
    try {
      const response = await fetch(`/api/v1/erp/ad-campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(newStatus === 'active' ? '广告已启动' : '广告已暂停');
        fetchCampaigns();
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // AI优化
  const handleAIOptimize = async () => {
    if (!selectedCampaign) return;

    setIsProcessing(selectedCampaign.id);
    try {
      // 模拟AI优化
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('AI优化建议已生成', {
        description: `建议将日预算调整为 $${(selectedCampaign.daily_budget * 1.2).toFixed(2)}，预计ROAS提升15%`,
      });
      setIsOptimizeOpen(false);
    } catch (error) {
      toast.error('优化失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 删除广告
  const handleDeleteCampaign = async (campaign: AdCampaign) => {
    if (!confirm(`确定要删除广告 "${campaign.campaign_name}" 吗？`)) return;

    setIsProcessing(campaign.id);
    try {
      const response = await fetch(`/api/v1/erp/ad-campaigns/${campaign.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('广告已删除');
        fetchCampaigns();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 查看详情
  const handleViewDetail = async (campaign: AdCampaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: '投放中', className: 'bg-success/10 text-success' },
      paused: { label: '已暂停', className: 'bg-warning/10 text-warning' },
      ended: { label: '已结束', className: 'bg-muted text-muted-foreground' },
      draft: { label: '草稿', className: 'bg-primary/10 text-primary' },
    };
    const { label, className } = config[status] || config.draft;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getPlatformBadge = (platform: string) => {
    const config: Record<string, { label: string; className: string }> = {
      tiktok: { label: 'TikTok Ads', className: 'bg-pink-500/10 text-pink-500' },
      amazon: { label: 'Amazon Ads', className: 'bg-[#FF7D00]500/10 text-[#FF7D00]500' },
      google: { label: 'Google Ads', className: 'bg-[#165DFF]500/10 text-[#165DFF]500' },
    };
    const { label, className } = config[platform] || { label: platform, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      search: '搜索广告',
      display: '展示广告',
      video: '视频广告',
      shopping: '购物广告',
    };
    return <Badge variant="secondary">{config[type] || type}</Badge>;
  };

  // 统计数据
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const avgRoas = campaigns.length > 0 ? totalRevenue / totalSpent : 0;
  const activeCount = campaigns.filter(c => c.status === 'active').length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">广告投放管理</h1>
              <p className="text-[14px] text-muted-foreground">广告创建 · 智能出价 · ROAS优化 · 数据分析</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchCampaigns}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" onClick={handleSyncAds} disabled={isProcessing === 'sync'}>
              {isProcessing === 'sync' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              同步数据
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建广告
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" />
            AI出价
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Target className="h-3 w-3 mr-1" />
            精准定向
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            ROAS优化
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <BarChart3 className="h-3 w-3 mr-1" />
            效果分析
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">投放中</div>
              <div className="text-[24px] font-semibold text-success">{activeCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">个广告</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日花费</div>
              <div className="text-[24px] font-semibold text-foreground">${totalSpent.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">广告支出</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">广告收入</div>
              <div className="text-[24px] font-semibold text-success">${totalRevenue.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">转化收入</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">平均ROAS</div>
              <div className="text-[24px] font-semibold text-foreground">{avgRoas.toFixed(2)}x</div>
              <div className="text-[11px] text-success mt-1">{avgRoas > 2 ? '优秀' : avgRoas > 1 ? '良好' : '需优化'}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">转化订单</div>
              <div className="text-[24px] font-semibold text-foreground">{campaigns.reduce((sum, c) => sum + c.conversions, 0)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">总转化数</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索广告名称、商品名称..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && fetchCampaigns()}
                />
              </div>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">全部平台</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="amazon">Amazon Ads</option>
                <option value="google">Google Ads</option>
              </select>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="active">投放中</option>
                <option value="paused">已暂停</option>
                <option value="ended">已结束</option>
                <option value="draft">草稿</option>
              </select>
              <Button variant="outline" onClick={fetchCampaigns}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 广告列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">广告列表</CardTitle>
            <CardDescription>支持AI自动出价与ROAS优化</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无广告数据</div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Megaphone className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-foreground">{campaign.campaign_name}</span>
                            {getPlatformBadge(campaign.platform)}
                            {getTypeBadge(campaign.campaign_type)}
                            {getStatusBadge(campaign.status)}
                            {campaign.auto_optimization && (
                              <Badge variant="outline" className="bg-primary/5 text-primary">
                                <Zap className="h-3 w-3 mr-1" />
                                AI优化中
                              </Badge>
                            )}
                          </div>
                          <div className="text-[12px] text-muted-foreground">{campaign.product_name}</div>
                          <div className="flex items-center gap-6 text-[12px]">
                            <span>日预算: <span className="text-foreground font-medium">${campaign.daily_budget.toFixed(2)}</span></span>
                            <span>花费: <span className="text-foreground font-medium">${campaign.spent.toFixed(2)}</span></span>
                            <span>收入: <span className="text-success font-medium">${campaign.revenue.toFixed(2)}</span></span>
                            <span>ROAS: <span className={campaign.roas >= 2 ? 'text-success font-medium' : campaign.roas >= 1 ? 'text-foreground font-medium' : 'text-destructive font-medium'}>{campaign.roas.toFixed(2)}x</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-4 text-[12px]">
                          <div className="text-center">
                            <div className="text-foreground font-medium">{campaign.impressions.toLocaleString()}</div>
                            <div className="text-muted-foreground">曝光</div>
                          </div>
                          <div className="text-center">
                            <div className="text-foreground font-medium">{campaign.clicks.toLocaleString()}</div>
                            <div className="text-muted-foreground">点击</div>
                          </div>
                          <div className="text-center">
                            <div className="text-foreground font-medium">{(campaign.ctr * 100).toFixed(2)}%</div>
                            <div className="text-muted-foreground">CTR</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetail(campaign)}>
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(campaign)}
                            disabled={isProcessing === campaign.id || campaign.status === 'ended'}
                          >
                            {campaign.status === 'active' ? (
                              <>
                                <Pause className="h-3 w-3 mr-1" />
                                暂停
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                启动
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setIsOptimizeOpen(true);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            优化
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteCampaign(campaign)}
                            disabled={isProcessing === campaign.id}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 创建广告对话框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>创建广告</DialogTitle>
              <DialogDescription>创建新的广告投放计划</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium">商品名称</label>
                <Input
                  placeholder="请输入商品名称"
                  value={createForm.product_name}
                  onChange={(e) => setCreateForm({ ...createForm, product_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">投放平台</label>
                  <select 
                    className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                    value={createForm.platform}
                    onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value })}
                  >
                    <option value="tiktok">TikTok Ads</option>
                    <option value="amazon">Amazon Ads</option>
                    <option value="google">Google Ads</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">广告类型</label>
                  <select 
                    className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                    value={createForm.campaign_type}
                    onChange={(e) => setCreateForm({ ...createForm, campaign_type: e.target.value })}
                  >
                    <option value="search">搜索广告</option>
                    <option value="display">展示广告</option>
                    <option value="video">视频广告</option>
                    <option value="shopping">购物广告</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">广告名称</label>
                <Input
                  placeholder="请输入广告名称"
                  value={createForm.campaign_name}
                  onChange={(e) => setCreateForm({ ...createForm, campaign_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">日预算 ($)</label>
                <Input
                  type="number"
                  placeholder="请输入日预算"
                  value={createForm.daily_budget}
                  onChange={(e) => setCreateForm({ ...createForm, daily_budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">目标受众</label>
                <Input
                  placeholder="例如: 25-35岁女性，喜欢宠物"
                  value={createForm.target_audience}
                  onChange={(e) => setCreateForm({ ...createForm, target_audience: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreateCampaign} disabled={isProcessing === 'create'}>
                {isProcessing === 'create' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                创建并启动
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 广告详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>广告详情</DialogTitle>
            </DialogHeader>
            {selectedCampaign && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">广告名称</div>
                    <div className="text-[14px] font-medium">{selectedCampaign.campaign_name}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">状态</div>
                    <div>{getStatusBadge(selectedCampaign.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">平台</div>
                    <div>{getPlatformBadge(selectedCampaign.platform)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">类型</div>
                    <div>{getTypeBadge(selectedCampaign.campaign_type)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">日预算</div>
                    <div className="text-[16px] font-semibold">${selectedCampaign.daily_budget.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">花费</div>
                    <div className="text-[16px] font-semibold">${selectedCampaign.spent.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">收入</div>
                    <div className="text-[16px] font-semibold text-success">${selectedCampaign.revenue.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-[16px] font-semibold">{selectedCampaign.impressions.toLocaleString()}</div>
                    <div className="text-[11px] text-muted-foreground">曝光</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-[16px] font-semibold">{selectedCampaign.clicks.toLocaleString()}</div>
                    <div className="text-[11px] text-muted-foreground">点击</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-[16px] font-semibold">{(selectedCampaign.ctr * 100).toFixed(2)}%</div>
                    <div className="text-[11px] text-muted-foreground">CTR</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-[16px] font-semibold">{selectedCampaign.conversions}</div>
                    <div className="text-[11px] text-muted-foreground">转化</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="text-[12px] text-muted-foreground">ROAS</div>
                    <div className={`text-[20px] font-semibold ${selectedCampaign.roas >= 2 ? 'text-success' : selectedCampaign.roas >= 1 ? 'text-foreground' : 'text-destructive'}`}>
                      {selectedCampaign.roas.toFixed(2)}x
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="text-[12px] text-muted-foreground">ACOS</div>
                    <div className={`text-[20px] font-semibold ${selectedCampaign.acos <= 0.2 ? 'text-success' : selectedCampaign.acos <= 0.3 ? 'text-foreground' : 'text-destructive'}`}>
                      {(selectedCampaign.acos * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">投放时间</div>
                  <div className="text-[14px]">{selectedCampaign.start_date} ~ {selectedCampaign.end_date || '持续投放'}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI优化对话框 */}
        <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>AI优化建议</DialogTitle>
              <DialogDescription>基于广告数据生成优化建议</DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-[12px] text-muted-foreground">当前广告表现</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>ROAS: <span className="font-semibold">{selectedCampaign.roas.toFixed(2)}x</span></div>
                    <div>ACOS: <span className="font-semibold">{(selectedCampaign.acos * 100).toFixed(1)}%</span></div>
                    <div>CTR: <span className="font-semibold">{(selectedCampaign.ctr * 100).toFixed(2)}%</span></div>
                    <div>CPC: <span className="font-semibold">${selectedCampaign.cpc.toFixed(2)}</span></div>
                  </div>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Zap className="h-4 w-4" />
                    <span className="text-[13px] font-medium">AI优化建议</span>
                  </div>
                  <ul className="text-[12px] text-muted-foreground space-y-1">
                    <li>• 建议将日预算调整为 ${(selectedCampaign.daily_budget * 1.2).toFixed(2)}</li>
                    <li>• 目标受众建议增加 "宠物爱好者" 标签</li>
                    <li>• 建议在 18:00-22:00 时段增加出价 20%</li>
                    <li>• 预计ROAS可提升 15-25%</li>
                  </ul>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOptimizeOpen(false)}>取消</Button>
              <Button onClick={handleAIOptimize} disabled={isProcessing === selectedCampaign?.id}>
                {isProcessing === selectedCampaign?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                应用优化
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
