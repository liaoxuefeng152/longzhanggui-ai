'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  RefreshCw,
  Unlink,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPlatformBindings,
  getPlatformBindingStats,
  createPlatformBinding,
  deletePlatformBinding,
  syncPlatformBinding,
  type PlatformBinding,
  type PlatformBindingStats,
  type CreatePlatformBindingRequest,
} from '@/lib/api/platform-bindings';

export default function PlatformBindingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bindings, setBindings] = useState<PlatformBinding[]>([]);
  const [stats, setStats] = useState<PlatformBindingStats>({ total: 0, active: 0, expired: 0, error: 0 });
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePlatformBindingRequest>({
    platform: '',
    account_name: '',
    shop_id: '',
    region: '',
    api_key: '',
    api_secret: '',
    auth_type: 'API授权',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bindingsRes, statsRes] = await Promise.all([
        getPlatformBindings({ page_size: 100 }),
        getPlatformBindingStats(),
      ]);
      setBindings(bindingsRes.bindings);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to fetch platform bindings:', error);
      toast.error('获取平台绑定列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router, fetchData]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: '正常', className: 'bg-success text-white' },
      expired: { label: '已过期', className: 'bg-warning text-white' },
      error: { label: '异常', className: 'bg-destructive text-white' },
    };
    const c = config[status];
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'TK小店': '🛒',
      'TK Ads': '📢',
      'TK创作者': '🎬',
      '亚马逊': '📦',
      '店小秘ERP': '🏢',
    };
    return icons[platform] || '🔗';
  };

  const handleUnbind = async (bindingId: string) => {
    try {
      await deletePlatformBinding(bindingId);
      setBindings((prev) => prev.filter((b) => b.id !== bindingId));
      toast.success('解绑成功');
      // 重新获取统计
      const statsRes = await getPlatformBindingStats();
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to unbind:', error);
      toast.error('解绑失败');
    }
  };

  const handleSync = async (bindingId: string) => {
    try {
      setSyncingId(bindingId);
      const result = await syncPlatformBinding(bindingId);
      if (result.success) {
        toast.success(`同步成功: ${result.message}`);
        // 刷新数据
        fetchData();
      } else {
        toast.error(`同步失败: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to sync:', error);
      toast.error('同步失败');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.platform || !formData.account_name || !formData.shop_id) {
      toast.error('请填写必填项');
      return;
    }

    try {
      setSubmitting(true);
      await createPlatformBinding(formData);
      toast.success('绑定成功');
      setIsDialogOpen(false);
      setFormData({
        platform: '',
        account_name: '',
        shop_id: '',
        region: '',
        api_key: '',
        api_secret: '',
        auth_type: 'API授权',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create binding:', error);
      toast.error('绑定失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">平台账号绑定</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              TK小店/亚马逊/ERP · API授权 · 数据同步
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                绑定新平台
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>绑定平台账号</DialogTitle>
                <DialogDescription>选择平台类型并完成授权配置</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">平台类型 *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TK小店">TK小店</SelectItem>
                      <SelectItem value="TK Ads">TK Ads</SelectItem>
                      <SelectItem value="TK创作者">TK创作者</SelectItem>
                      <SelectItem value="亚马逊">亚马逊</SelectItem>
                      <SelectItem value="店小秘ERP">店小秘ERP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">账号名称 *</Label>
                  <Input
                    className="col-span-3"
                    placeholder="输入账号名称"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">店铺ID *</Label>
                  <Input
                    className="col-span-3"
                    placeholder="输入店铺ID"
                    value={formData.shop_id}
                    onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">区域</Label>
                  <Input
                    className="col-span-3"
                    placeholder="输入区域"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">API密钥</Label>
                  <Input
                    className="col-span-3"
                    placeholder="输入API Key"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">授权方式</Label>
                  <Select
                    value={formData.auth_type}
                    onValueChange={(value) => setFormData({ ...formData, auth_type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择授权方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="API授权">API授权</SelectItem>
                      <SelectItem value="OAuth2.0">OAuth2.0</SelectItem>
                      <SelectItem value="SP-API">SP-API</SelectItem>
                      <SelectItem value="API Key">API Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  授权绑定
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">已绑定平台</div>
              <div className="text-[24px] font-semibold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">正常连接</div>
              <div className="text-[24px] font-semibold text-success">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">需要续期</div>
              <div className="text-[24px] font-semibold text-warning">{stats.expired}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">异常连接</div>
              <div className="text-[24px] font-semibold text-destructive">{stats.error}</div>
            </CardContent>
          </Card>
        </div>

        {/* 绑定列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-[15px] font-medium">平台账号列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bindings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>暂无绑定数据</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">平台</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">账号名称</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">店铺ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">区域</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">授权方式</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">到期时间</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">最后同步</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bindings.map((binding) => (
                    <TableRow key={binding.id} className="border-border hover:bg-muted/30">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPlatformIcon(binding.platform)}</span>
                          <span className="text-[13px] font-medium">{binding.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground">{binding.account_name}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground font-mono">{binding.shop_id}</TableCell>
                      <TableCell className="text-[13px] text-foreground">{binding.region}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">{binding.auth_type}</Badge>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{binding.expire_time}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{binding.last_sync}</TableCell>
                      <TableCell>{getStatusBadge(binding.status)}</TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSync(binding.id)}
                            disabled={syncingId === binding.id}
                            title="同步数据"
                          >
                            {syncingId === binding.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="查看详情"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnbind(binding.id)}
                            className="text-destructive hover:text-destructive"
                            title="解绑"
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
