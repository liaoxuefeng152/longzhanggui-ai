'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Settings,
  Key,
  Globe,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Loader2,
  Save,
  ExternalLink,
} from 'lucide-react';

// 平台配置信息
interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  api_doc_url: string;
  regions: string[];
  currencies: string[];
  has_credentials: boolean;
  credentials?: {
    api_key?: string;
    api_secret?: string;
    webhook_secret?: string;
  };
  status: 'configured' | 'unconfigured' | 'error';
  last_updated?: string;
}

// 平台配置数据
const PLATFORMS: Record<string, Omit<PlatformConfig, 'has_credentials' | 'credentials' | 'status' | 'last_updated'>> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Shop',
    icon: '🎵',
    color: '#FF0050',
    api_doc_url: 'https://partner.tiktok.com/product',
    regions: ['美国', '英国', '东南亚', '中东'],
    currencies: ['USD', 'GBP', 'SGD'],
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    icon: '📦',
    color: '#FF9900',
    api_doc_url: 'https://developer.amazonservices.com',
    regions: ['美国', '英国', '德国', '日本', '澳洲'],
    currencies: ['USD', 'GBP', 'EUR', 'JPY', 'AUD'],
  },
  shopee: {
    id: 'shopee',
    name: 'Shopee',
    icon: '🛒',
    color: '#EE4D2D',
    api_doc_url: 'https://partner.shopeemobile.com',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  lazada: {
    id: 'lazada',
    name: 'Lazada',
    icon: '🏪',
    color: '#0F1472',
    api_doc_url: 'https://open.lazada.com',
    regions: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'],
    currencies: ['SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP'],
  },
  tokopedia: {
    id: 'tokopedia',
    name: 'Tokopedia',
    icon: '🏬',
    color: '#42D06D',
    api_doc_url: 'https://developer.tokopedia.com',
    regions: ['印尼'],
    currencies: ['IDR'],
  },
};

export default function PlatformConfigPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, PlatformConfig>>({});
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  // 配置表单
  const [configForm, setConfigForm] = useState<{
    platform: string;
    api_key: string;
    api_secret: string;
    webhook_secret: string;
  }>({
    platform: '',
    api_key: '',
    api_secret: '',
    webhook_secret: '',
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);
    setUser(user);
    
    // 检查是否有管理员权限
    if (user.role !== 'founder' && user.role !== 'admin') {
      toast.error('只有管理员才能配置平台API');
      router.push('/dashboard');
      return;
    }
    
    fetchPlatformConfigs();
  }, [router]);

  const fetchPlatformConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/platforms', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setPlatformConfigs(data.data.platforms);
      }
    } catch (error) {
      console.error('获取平台配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfig = (platformId: string) => {
    const platform = PLATFORMS[platformId];
    const existing = platformConfigs[platformId];
    
    setConfigForm({
      platform: platformId,
      api_key: existing?.credentials?.api_key || '',
      api_secret: existing?.credentials?.api_secret || '',
      webhook_secret: existing?.credentials?.webhook_secret || '',
    });
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!configForm.platform) return;
    
    setSavingPlatform(configForm.platform);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/platforms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          platform: configForm.platform,
          credentials: {
            api_key: configForm.api_key,
            api_secret: configForm.api_secret,
            webhook_secret: configForm.webhook_secret,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${PLATFORMS[configForm.platform].name} 配置已保存`);
        setIsConfigOpen(false);
        fetchPlatformConfigs();
      } else {
        toast.error(data.error || data.detail || '保存失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存失败');
    } finally {
      setSavingPlatform(null);
    }
  };

  const handleTestConnection = async (platformId: string) => {
    setTestingPlatform(platformId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/platforms/${platformId}/test`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${PLATFORMS[platformId].name} 连接测试成功`);
      } else {
        toast.error(data.error || data.detail || '连接测试失败');
      }
    } catch (error) {
      console.error('连接测试失败:', error);
      toast.error('连接测试失败');
    } finally {
      setTestingPlatform(null);
    }
  };

  const getMaskedValue = (value: string | undefined) => {
    if (!value) return '未配置';
    if (value.length <= 8) return '***';
    return '***' + value.slice(-4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const getStatusBadge = (status: PlatformConfig['status']) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      configured: { 
        label: '已配置', 
        className: 'bg-[#00B42A]500/10 text-[#00B42A]500',
        icon: <CheckCircle className="h-3 w-3" />
      },
      unconfigured: { 
        label: '未配置', 
        className: 'bg-muted text-muted-foreground',
        icon: <XCircle className="h-3 w-3" />
      },
      error: { 
        label: '配置错误', 
        className: 'bg-[#F53F3F]500/10 text-[#F53F3F]500',
        icon: <XCircle className="h-3 w-3" />
      },
    };
    const { label, className, icon } = config[status] || config.unconfigured;
    return (
      <Badge variant="outline" className={className}>
        {icon} {label}
      </Badge>
    );
  };

  // 计算统计
  const configuredCount = Object.values(platformConfigs).filter(p => p.status === 'configured').length;
  const totalCount = Object.keys(PLATFORMS).length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
              <Shield className="h-7 w-7 text-[#165DFF]500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">平台 API 配置</h1>
              <p className="text-[14px] text-muted-foreground">管理员统一配置各平台认证凭证</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/shops')}>
            <Globe className="h-4 w-4 mr-2" />
            店铺管理
          </Button>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-[#165DFF]500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#165DFF]500 mt-0.5" />
              <div className="text-[13px]">
                <p className="font-medium text-foreground mb-1">管理员统一配置模式</p>
                <p className="text-muted-foreground">
                  此页面用于配置各平台的 API 凭证。配置完成后，普通用户添加店铺时只需填写基本信息，
                  无需再填写敏感的 API Key/Secret，点击「授权」按钮即可完成店铺绑定。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">已配置平台</div>
                  <div className="text-[24px] font-semibold text-[#00B42A]500">{configuredCount}</div>
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
                  <div className="text-[12px] text-muted-foreground">未配置平台</div>
                  <div className="text-[24px] font-semibold text-yellow-500">{totalCount - configuredCount}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-muted-foreground">支持的平台</div>
                  <div className="text-[24px] font-semibold">{totalCount}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#165DFF]500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-[#165DFF]500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 平台配置列表 */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(PLATFORMS).map(([platformId, platform]) => {
              const config = platformConfigs[platformId];
              const hasCredentials = config?.status === 'configured';
              
              return (
                <Card key={platformId} className="bg-white border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${platform.color}15` }}
                        >
                          {platform.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-[16px] font-semibold">{platform.name}</h3>
                            {getStatusBadge(config?.status || 'unconfigured')}
                          </div>
                          <p className="text-[13px] text-muted-foreground mb-3">
                            {platform.regions.join(' · ')} · {platform.currencies.join(' / ')}
                          </p>
                          
                          {/* 已配置的凭证预览 */}
                          {hasCredentials && config?.credentials && (
                            <div className="flex items-center gap-4 text-[12px]">
                              {config.credentials.api_key && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Key className="h-3 w-3" />
                                  <span>API Key: {getMaskedValue(config.credentials.api_key)}</span>
                                </div>
                              )}
                              {config.credentials.api_secret && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Key className="h-3 w-3" />
                                  <span>API Secret: {getMaskedValue(config.credentials.api_secret)}</span>
                                </div>
                              )}
                              {config.last_updated && (
                                <span className="text-muted-foreground">
                                  更新于 {new Date(config.last_updated).toLocaleDateString('zh-CN')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(platform.api_doc_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          API文档
                        </Button>
                        {hasCredentials && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTestConnection(platformId)}
                            disabled={testingPlatform === platformId}
                          >
                            {testingPlatform === platformId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            测试连接
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => handleOpenConfig(platformId)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {hasCredentials ? '修改配置' : '配置'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 配置对话框 */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                配置 {configForm.platform ? PLATFORMS[configForm.platform]?.name : ''} API
              </DialogTitle>
              <DialogDescription>
                填写平台提供的 API 凭证信息
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-[#165DFF]500/5 rounded-lg p-3 text-[12px] text-muted-foreground">
                <p className="font-medium text-foreground mb-1">提示</p>
                <p>
                  请前往对应平台的开发者后台获取 API 凭证。配置后，普通用户添加店铺时无需再填写这些敏感信息。
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api_key"
                    type={showCredentials[configForm.platform] ? 'text' : 'password'}
                    placeholder="输入平台提供的 API Key"
                    value={configForm.api_key}
                    onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowCredentials({ 
                      ...showCredentials, 
                      [configForm.platform]: !showCredentials[configForm.platform] 
                    })}
                  >
                    {showCredentials[configForm.platform] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_secret">API Secret</Label>
                <Input
                  id="api_secret"
                  type={showCredentials[configForm.platform] ? 'text' : 'password'}
                  placeholder="输入平台提供的 API Secret"
                  value={configForm.api_secret}
                  onChange={(e) => setConfigForm({ ...configForm, api_secret: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret <span className="text-muted-foreground font-normal">(可选)</span></Label>
                <Input
                  id="webhook_secret"
                  type={showCredentials[configForm.platform] ? 'text' : 'password'}
                  placeholder="输入 Webhook 回调密钥"
                  value={configForm.webhook_secret}
                  onChange={(e) => setConfigForm({ ...configForm, webhook_secret: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={handleSaveConfig}
                disabled={savingPlatform === configForm.platform}
              >
                {savingPlatform === configForm.platform ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存配置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
