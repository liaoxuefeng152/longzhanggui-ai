'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
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
  Key,
  Shield,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  platform: 'tiktok' | 'amazon' | 'shopee' | 'lazada' | 'tokopedia';
  region: string;
  currency: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  authorization_status: 'authorized' | 'unauthorized' | 'expired';
  store_id?: string;
  config: {
    auto_sync: boolean;
    sync_interval: number;
  };
  stats: {
    total_orders: number;
    total_sales: number;
    total_products: number;
    last_sync?: string;
  };
  created_at: string;
  updated_at: string;
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  regions: string[];
  currencies: string[];
  has_credentials: boolean;
}

interface User {
  nickname: string;
  avatar?: string;
  role: 'user' | 'admin';
  id?: string;
  name?: string;
}

const PLATFORMS: Record<string, Omit<PlatformConfig, 'has_credentials'>> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Shop',
    icon: '🎵',
    color: '#FF0050',
    regions: ['美国', '英国', '东南亚', '中东'],
    currencies: ['USD', 'GBP', 'SGD'],
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    icon: '📦',
    color: '#FF9900',
    regions: ['美国', '英国', '德国', '日本', '澳洲'],
    currencies: ['USD', 'GBP', 'EUR', 'JPY', 'AUD'],
  },
  shopee: {
    id: 'shopee',
    name: 'Shopee',
    icon: '🛒',
    color: '#EE4D2D',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  lazada: {
    id: 'lazada',
    name: 'Lazada',
    icon: '🏪',
    color: '#0F1472',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  tokopedia: {
    id: 'tokopedia',
    name: 'Tokopedia',
    icon: '🏬',
    color: '#42D06D',
    regions: ['印尼'],
    currencies: ['IDR'],
  },
};

export default function ShopsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingShop, setSyncingShop] = useState<string | null>(null);

  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // 创建表单（简化版：不需要填写API凭证）
  const [createForm, setCreateForm] = useState({
    name: '',
    platform: 'tiktok',
    region: '美国',
    currency: 'USD',
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
    const parsedUser = JSON.parse(userData);
    // 确保用户有 nickname 字段
    const userWithNickname: User = {
      nickname: parsedUser.nickname || parsedUser.name || '用户',
      avatar: parsedUser.avatar,
      role: parsedUser.role || 'user',
      id: parsedUser.id,
      name: parsedUser.name,
    };
    setUser(userWithNickname);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      // 并行获取店铺列表和平台配置
      const [shopsRes, platformsRes] = await Promise.all([
        fetch('/api/v1/shops'),
        fetch('/api/v1/platforms'),
      ]);
      
      const [shopsData, platformsData] = await Promise.all([
        shopsRes.json(),
        platformsRes.json(),
      ]);
      
      if (shopsData.success) {
        setShops(shopsData.data.shops);
      }
      
      if (platformsData.success) {
        setPlatformConfigs(platformsData.data.platforms);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 检查平台是否已配置凭证
  const isPlatformConfigured = (platformId: string) => {
    const config = platformConfigs.find(p => p.id === platformId);
    return config?.has_credentials;
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
          store_id: createForm.store_id,
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
        fetchData();
        
        // 如果平台未配置凭证，提示用户
        if (!isPlatformConfigured(createForm.platform)) {
          toast.warning('该平台尚未配置 API 凭证，请联系管理员');
        } else {
          // 打开授权对话框
          setSelectedShop(data.data.shop);
          setIsAuthOpen(true);
        }
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
        fetchData();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 同步店铺
  const handleSync = async (shop: Shop) => {
    if (shop.authorization_status !== 'authorized') {
      toast.error('请先完成店铺授权');
      setSelectedShop(shop);
      setIsAuthOpen(true);
      return;
    }
    
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
        setTimeout(fetchData, 5000);
      }
    } catch (error) {
      toast.error('同步启动失败');
    } finally {
      setSyncingShop(null);
    }
  };

  // 授权店铺
  const handleAuthorize = async (shop: Shop) => {
    setSelectedShop(shop);
    setIsAuthOpen(true);
  };

  // 执行授权
  const executeAuthorization = async () => {
    if (!selectedShop) return;

    try {
      // 模拟OAuth授权流程
      const response = await fetch(`/api/v1/shops/${selectedShop.id}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: createForm.store_id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('店铺授权成功');
        setIsAuthOpen(false);
        fetchData();
      } else {
        toast.error(data.error || '授权失败');
      }
    } catch (error) {
      toast.error('授权失败');
    }
  };

  // 更新店铺状态
  const handleToggleStatus = async (shop: Shop) => {
    try {
      const newStatus = shop.status === 'active' ? 'inactive' : 'active';
      const response = await fetch('/api/v1/shops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shop.id, status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`店铺已${newStatus === 'active' ? '启用' : '停用'}`);
        fetchData();
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
      store_id: '',
      auto_sync: true,
      sync_interval: 5,
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: '已启用', className: 'bg-[#00B42A]500/10 text-[#00B42A]500' },
      inactive: { label: '已停用', className: 'bg-muted text-muted-foreground' },
      suspended: { label: '已封禁', className: 'bg-[#F53F3F]500/10 text-[#F53F3F]500' },
      pending: { label: '待配置', className: 'bg-yellow-500/10 text-yellow-500' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getAuthBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      authorized: { 
        label: '已授权', 
        className: 'bg-[#00B42A]500/10 text-[#00B42A]500',
        icon: <CheckCircle className="h-3 w-3" />
      },
      unauthorized: { 
        label: '未授权', 
        className: 'bg-yellow-500/10 text-yellow-500',
        icon: <AlertCircle className="h-3 w-3" />
      },
      expired: { 
        label: '授权过期', 
        className: 'bg-[#F53F3F]500/10 text-[#F53F3F]500',
        icon: <XCircle className="h-3 w-3" />
      },
    };
    const { label, className, icon } = config[status] || config.unauthorized;
    return (
      <Badge variant="outline" className={className}>
        {icon} {label}
      </Badge>
    );
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
  const authorizedShops = shops.filter(s => s.authorization_status === 'authorized').length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
              <Store className="h-7 w-7 text-[#FF7D00]500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">店铺管理</h1>
              <p className="text-[14px] text-muted-foreground">多平台店铺绑定 · 授权管理 · 数据同步</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/shops/platforms')}>
              <Shield className="h-4 w-4 mr-2" />
              平台配置
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加店铺
            </Button>
          </div>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-[#165DFF]500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-[#165DFF]500 mt-0.5" />
              <div className="text-[13px]">
                <p className="font-medium text-foreground mb-1">简化授权流程</p>
                <p className="text-muted-foreground">
                  添加店铺时无需填写 API 凭证。API 凭证由管理员在「平台配置」中统一管理，
                  您只需点击「授权」按钮完成店铺绑定即可。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">店铺总数</div>
                  <div className="text-[24px] font-semibold">{shops.length}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#FF7D00]500/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-[#FF7D00]500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">已授权</div>
                  <div className="text-[24px] font-semibold text-[#00B42A]500">{authorizedShops}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#00B42A]500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-[#00B42A]500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">启用店铺</div>
                  <div className="text-[24px] font-semibold text-[#165DFF]500">{activeShops}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#165DFF]500/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-[#165DFF]500" />
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
                <div className="w-10 h-10 rounded-lg bg-[#165DFF]500/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-[#165DFF]500" />
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
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
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
              const platformConfigured = isPlatformConfigured(platform);
              
              return (
                <div key={platform}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{config.icon}</span>
                    <h2 className="text-[16px] font-semibold">{config.name}</h2>
                    <Badge variant="outline">{platformShops.length} 个店铺</Badge>
                    {!platformConfigured && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        平台未配置
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                            <div className="flex items-center gap-2">
                              {getAuthBadge(shop.authorization_status)}
                              {getStatusBadge(shop.status)}
                            </div>
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
                                ? `同步: ${new Date(shop.stats.last_sync).toLocaleString('zh-CN')}`
                                : '从未同步'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-border">
                            {shop.authorization_status !== 'authorized' ? (
                              <Button 
                                variant="default"
                                size="sm" 
                                className="flex-1 bg-[#00B42A]500 hover:bg-[#00B42A]600"
                                onClick={() => handleAuthorize(shop)}
                              >
                                <Key className="h-4 w-4 mr-1" />
                                去授权
                              </Button>
                            ) : (
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
                                同步数据
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedShop(shop);
                                setIsAuthOpen(true);
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
                              className="text-[#F53F3F]500 hover:text-[#F53F3F]600"
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

        {/* 创建店铺对话框（简化版） */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>添加店铺</DialogTitle>
              <DialogDescription>
                填写店铺基本信息，无需填写 API 凭证
              </DialogDescription>
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
                      {Object.entries(PLATFORMS).map(([key, config]) => {
                        const configured = isPlatformConfigured(key);
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{config.icon} {config.name}</span>
                              {!configured && (
                                <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500">
                                  需配置
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
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

              {/* 平台凭证状态提示 */}
              {!isPlatformConfigured(createForm.platform) ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-[12px]">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-600 mb-1">该平台尚未配置 API 凭证</p>
                      <p className="text-muted-foreground">
                        请先让管理员在「平台配置」页面配置 {PLATFORMS[createForm.platform]?.name} 的 API 凭证，
                        否则店铺添加后无法正常同步数据。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#00B42A]500/10 border border-green-500/20 rounded-lg p-3 text-[12px]">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00B42A]500 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#00B42A]600 mb-1">平台已配置 API 凭证</p>
                      <p className="text-muted-foreground">
                        添加店铺后，点击「去授权」按钮即可完成店铺绑定。
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

        {/* 授权对话框 */}
        <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>店铺授权</DialogTitle>
              <DialogDescription>
                {selectedShop?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedShop && (
              <div className="space-y-4 py-4">
                {selectedShop.authorization_status === 'authorized' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-[#00B42A]500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-[#00B42A]500" />
                    </div>
                    <h3 className="text-[16px] font-medium mb-2">店铺已授权</h3>
                    <p className="text-[13px] text-muted-foreground">
                      该店铺已完成授权，可以正常同步数据
                    </p>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-[12px] text-left">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">店铺ID</span>
                        <span className="font-mono">{selectedShop.store_id || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">平台</span>
                        <span>{PLATFORMS[selectedShop.platform]?.icon} {PLATFORMS[selectedShop.platform]?.name}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#165DFF]500/10 border border-blue-500/20 rounded-lg p-4 text-[13px]">
                      <div className="flex items-start gap-3">
                        <Key className="h-5 w-5 text-[#165DFF]500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground mb-2">如何完成授权？</p>
                          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                            <li>点击下方「前往授权」按钮</li>
                            <li>跳转到 {PLATFORMS[selectedShop.platform]?.name} 授权页面</li>
                            <li>登录您的店铺账号并确认授权</li>
                            <li>授权成功后返回本系统</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store_id_auth">店铺 ID / Store ID <span className="text-muted-foreground font-normal">(可选)</span></Label>
                      <Input
                        id="store_id_auth"
                        placeholder="输入店铺ID（如已授权可留空）"
                        value={createForm.store_id}
                        onChange={(e) => setCreateForm({ ...createForm, store_id: e.target.value })}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        部分平台授权后会自动获取店铺ID
                      </p>
                    </div>

                    {/* 平台凭证状态 */}
                    {!isPlatformConfigured(selectedShop.platform) && (
                      <div className="bg-[#F53F3F]500/10 border border-red-500/20 rounded-lg p-3 text-[12px]">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-[#F53F3F]500 mt-0.5" />
                          <div>
                            <p className="font-medium text-[#F53F3F]600 mb-1">平台未配置 API 凭证</p>
                            <p className="text-muted-foreground">
                              该平台的 API 凭证尚未配置，无法进行授权。
                              请先让管理员在「平台配置」页面配置 {PLATFORMS[selectedShop.platform]?.name} 的 API 凭证。
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setIsAuthOpen(false);
                                router.push('/shops/platforms');
                              }}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              前往平台配置
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedShop?.authorization_status === 'authorized' ? (
                <Button variant="outline" onClick={() => setIsAuthOpen(false)}>
                  关闭
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsAuthOpen(false)}>
                    取消
                  </Button>
                  <Button 
                    onClick={executeAuthorization}
                    disabled={!isPlatformConfigured(selectedShop?.platform || '')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    前往授权
                  </Button>
                </>
              )}
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
                fetchData();
              }}>后台同步</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
