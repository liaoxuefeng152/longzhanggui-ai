'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Store,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ShoppingCart,
  Package,
  DollarSign,
  Link2,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  platform: 'tiktok' | 'amazon' | 'shopee' | 'lazada' | 'tokopedia';
  region: string;
  currency: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  credentials: Record<string, string>;
  config: {
    auto_sync: boolean;
    sync_interval: number;
    notify_email?: string;
  };
  stats: {
    total_orders: number;
    total_sales: number;
    total_products: number;
    last_sync?: string;
  };
  platform_info?: {
    name: string;
    icon: string;
    color: string;
    regions: string[];
    currencies: string[];
  };
  created_at: string;
  updated_at: string;
}

interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  regions: string[];
  currencies: string[];
}

const PLATFORMS: Record<string, PlatformConfig> = {
  tiktok: {
    name: 'TikTok Shop',
    icon: '🎵',
    color: '#FF0050',
    regions: ['美国', '英国', '东南亚', '中东'],
    currencies: ['USD', 'GBP', 'SGD'],
  },
  amazon: {
    name: 'Amazon',
    icon: '📦',
    color: '#FF9900',
    regions: ['美国', '英国', '德国', '日本', '澳洲'],
    currencies: ['USD', 'GBP', 'EUR', 'JPY', 'AUD'],
  },
  shopee: {
    name: 'Shopee',
    icon: '🛒',
    color: '#EE4D2D',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  lazada: {
    name: 'Lazada',
    icon: '🏪',
    color: '#0F1472',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  tokopedia: {
    name: 'Tokopedia',
    icon: '🏬',
    color: '#42D06D',
    regions: ['印尼'],
    currencies: ['IDR'],
  },
};

export default function ShopsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingShop, setSyncingShop] = useState<string | null>(null);

  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // 创建表单
  const [createForm, setCreateForm] = useState({
    name: '',
    platform: 'tiktok' as string,
    region: '美国',
    currency: 'USD',
    api_key: '',
    api_secret: '',
    store_id: '',
    auto_sync: true,
    sync_interval: 5,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchShops();
  }, [router]);

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/v1/shops');
      const data = await response.json();
      if (data.success) {
        setShops(data.data.shops);
      }
    } catch (error) {
      console.error('获取店铺失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建店铺
  const handleCreate = async () => {
    if (!createForm.name || !createForm.platform) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const response = await fetch('/api/v1/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          platform: createForm.platform,
          region: createForm.region,
          currency: createForm.currency,
          credentials: {
            api_key: createForm.api_key,
            api_secret: createForm.api_secret,
            store_id: createForm.store_id,
          },
          config: {
            auto_sync: createForm.auto_sync,
            sync_interval: createForm.sync_interval,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('店铺创建成功');
        setIsCreateOpen(false);
        resetForm();
        fetchShops();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('创建失败');
    }
  };

  // 删除店铺
  const handleDelete = async (shop: Shop) => {
    if (!confirm(`确定删除店铺「${shop.name}」吗？`)) return;

    try {
      const response = await fetch(`/api/v1/shops?id=${shop.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('店铺已删除');
        fetchShops();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 同步店铺
  const handleSync = async (shop: Shop) => {
    setSyncingShop(shop.id);
    setSelectedShop(shop);

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_type: 'all' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('同步任务已启动');
        setIsSyncOpen(true);
        // 等待3秒后刷新
        setTimeout(fetchShops, 5000);
      }
    } catch (error) {
      toast.error('同步启动失败');
    } finally {
      setSyncingShop(null);
    }
  };

  // 更新店铺状态
  const handleToggleStatus = async (shop: Shop) => {
    try {
      const newStatus = shop.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/v1/shops`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shop.id, status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`店铺已${newStatus === 'active' ? '启用' : '停用'}`);
        fetchShops();
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const resetForm = () => {
    setCreateForm({
      name: '',
      platform: 'tiktok',
      region: '美国',
      currency: 'USD',
      api_key: '',
      api_secret: '',
      store_id: '',
      auto_sync: true,
      sync_interval: 5,
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: '已启用', className: 'bg-green-500/10 text-green-500' },
      inactive: { label: '已停用', className: 'bg-muted text-muted-foreground' },
      suspended: { label: '已封禁', className: 'bg-red-500/10 text-red-500' },
      pending: { label: '待配置', className: 'bg-yellow-500/10 text-yellow-500' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 按平台分组
  const groupedShops = shops.reduce((acc, shop) => {
    if (!acc[shop.platform]) {
      acc[shop.platform] = [];
    }
    acc[shop.platform].push(shop);
    return acc;
  }, {} as Record<string, Shop[]>);

  // 统计
  const totalOrders = shops.reduce((sum, s) => sum + s.stats.total_orders, 0);
  const totalSales = shops.reduce((sum, s) => sum + s.stats.total_sales, 0);
  const activeShops = shops.filter(s => s.status === 'active').length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
              <Store className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">店铺管理</h1>
              <p className="text-[14px] text-muted-foreground">多平台店铺绑定 · 数据同步 · 运营监控</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加店铺
          </Button>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">店铺总数</div>
                  <div className="text-[24px] font-semibold">{shops.length}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">启用店铺</div>
                  <div className="text-[24px] font-semibold text-green-500">{activeShops}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">累计订单</div>
                  <div className="text-[24px] font-semibold">{totalOrders}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">累计销售额</div>
                  <div className="text-[24px] font-semibold text-success">${totalSales.toFixed(2)}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 店铺列表 */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : shops.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暂无店铺</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                点击上方按钮添加您的第一个店铺
              </p>
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加店铺
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedShops).map(([platform, platformShops]) => {
              const config = PLATFORMS[platform] || PLATFORMS.tiktok;
              return (
                <div key={platform}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{config.icon}</span>
                    <h2 className="text-[16px] font-semibold">{config.name}</h2>
                    <Badge variant="outline">{platformShops.length} 个店铺</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {platformShops.map((shop) => (
                      <Card 
                        key={shop.id} 
                        className="bg-white border-border shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                style={{ backgroundColor: `${config.color}15` }}
                              >
                                {config.icon}
                              </div>
                              <div>
                                <h3 className="font-medium">{shop.name}</h3>
                                <p className="text-[11px] text-muted-foreground">
                                  {shop.region} · {shop.currency}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(shop.status)}
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-muted/50 rounded-lg p-2 text-center">
                              <div className="text-[12px] text-muted-foreground">订单</div>
                              <div className="text-[14px] font-semibold">{shop.stats.total_orders}</div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-2 text-center">
                              <div className="text-[12px] text-muted-foreground">销售额</div>
                              <div className="text-[14px] font-semibold">${(shop.stats.total_sales / 1000).toFixed(1)}k</div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-2 text-center">
                              <div className="text-[12px] text-muted-foreground">商品</div>
                              <div className="text-[14px] font-semibold">{shop.stats.total_products}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-3">
                            <span>
                              {shop.stats.last_sync 
                                ? `最后同步: ${new Date(shop.stats.last_sync).toLocaleString('zh-CN')}`
                                : '从未同步'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-border">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleSync(shop)}
                              disabled={syncingShop === shop.id || shop.status !== 'active'}
                            >
                              {syncingShop === shop.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedShop(shop);
                                setIsConfigOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleStatus(shop)}
                            >
                              {shop.status === 'active' ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(shop)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 创建店铺对话框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>添加店铺</DialogTitle>
              <DialogDescription>配置您的电商平台店铺</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">店铺名称</Label>
                <Input
                  id="name"
                  placeholder="例如：TikTok美国旗舰店"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">平台</Label>
                  <Select
                    value={createForm.platform}
                    onValueChange={(value) => {
                      const config = PLATFORMS[value];
                      setCreateForm({ 
                        ...createForm, 
                        platform: value,
                        region: config?.regions[0] || '美国',
                        currency: config?.currencies[0] || 'USD',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PLATFORMS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">地区</Label>
                  <Select
                    value={createForm.region}
                    onValueChange={(value) => setCreateForm({ ...createForm, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(PLATFORMS[createForm.platform]?.regions || []).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">货币</Label>
                <Select
                  value={createForm.currency}
                  onValueChange={(value) => setCreateForm({ ...createForm, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(PLATFORMS[createForm.platform]?.currencies || []).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-[14px] font-medium mb-3">API 认证配置</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    placeholder="输入平台提供的 API Key"
                    value={createForm.api_key}
                    onChange={(e) => setCreateForm({ ...createForm, api_key: e.target.value })}
                  />
                </div>

                <div className="space-y-2 mt-3">
                  <Label htmlFor="api_secret">API Secret</Label>
                  <Input
                    id="api_secret"
                    type="password"
                    placeholder="输入平台提供的 API Secret"
                    value={createForm.api_secret}
                    onChange={(e) => setCreateForm({ ...createForm, api_secret: e.target.value })}
                  />
                </div>

                <div className="space-y-2 mt-3">
                  <Label htmlFor="store_id">Store ID / Shop ID</Label>
                  <Input
                    id="store_id"
                    placeholder="输入店铺ID"
                    value={createForm.store_id}
                    onChange={(e) => setCreateForm({ ...createForm, store_id: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-[14px] font-medium mb-3">同步设置</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-medium">自动同步</div>
                    <div className="text-[12px] text-muted-foreground">自动同步订单和库存数据</div>
                  </div>
                  <Switch
                    checked={createForm.auto_sync}
                    onCheckedChange={(checked) => setCreateForm({ ...createForm, auto_sync: checked })}
                  />
                </div>

                {createForm.auto_sync && (
                  <div className="mt-3">
                    <Label htmlFor="sync_interval">同步间隔（分钟）</Label>
                    <Select
                      value={String(createForm.sync_interval)}
                      onValueChange={(value) => setCreateForm({ ...createForm, sync_interval: Number(value) })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">每5分钟</SelectItem>
                        <SelectItem value="15">每15分钟</SelectItem>
                        <SelectItem value="30">每30分钟</SelectItem>
                        <SelectItem value="60">每小时</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}>取消</Button>
              <Button onClick={handleCreate}>添加店铺</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 店铺配置对话框 */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>店铺配置</DialogTitle>
              <DialogDescription>{selectedShop?.name}</DialogDescription>
            </DialogHeader>
            {selectedShop && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <div className="text-[12px] text-muted-foreground">店铺ID</div>
                    <div className="font-mono">{selectedShop.id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">状态</div>
                    {getStatusBadge(selectedShop.status)}
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">平台</div>
                    <div>{PLATFORMS[selectedShop.platform]?.icon} {PLATFORMS[selectedShop.platform]?.name}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">地区</div>
                    <div>{selectedShop.region} · {selectedShop.currency}</div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[14px] font-medium">API 认证</div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowCredentials(!showCredentials)}
                    >
                      {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {selectedShop.credentials?.api_key && (
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between bg-muted/50 rounded-lg p-2">
                        <span className="text-muted-foreground">API Key</span>
                        <span className="font-mono">
                          {showCredentials 
                            ? selectedShop.credentials.api_key 
                            : '***' + (selectedShop.credentials.api_key.slice(-4) || '****')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="text-[14px] font-medium mb-3">同步设置</div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span>自动同步</span>
                    <Badge variant={selectedShop.config.auto_sync ? 'default' : 'outline'}>
                      {selectedShop.config.auto_sync ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[13px] mt-2">
                    <span>同步间隔</span>
                    <span>{selectedShop.config.sync_interval} 分钟</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 同步进度对话框 */}
        <Dialog open={isSyncOpen} onOpenChange={setIsSyncOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>数据同步中</DialogTitle>
              <DialogDescription>
                正在同步 {selectedShop?.name} 的数据...
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>正在连接平台API...</span>
              </div>
              <div className="bg-muted rounded-lg p-3 text-[12px] font-mono text-muted-foreground">
                [{new Date().toLocaleTimeString()}] 正在获取订单数据...<br/>
                [{new Date().toLocaleTimeString()}] 正在同步商品信息...<br/>
                [{new Date().toLocaleTimeString()}] 正在更新库存数据...
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsSyncOpen(false);
                fetchShops();
              }}>后台同步</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
