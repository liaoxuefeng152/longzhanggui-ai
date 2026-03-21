'use client';

import { useEffect, useState } from 'react';
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
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformBinding {
  id: string;
  platform: string;
  accountName: string;
  shopId: string;
  region: string;
  status: 'active' | 'expired' | 'error';
  authType: string;
  expireTime: string;
  lastSync: string;
  productCount: number;
  orderCount: number;
}

export default function PlatformBindingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [bindings, setBindings] = useState<PlatformBinding[]>([
    {
      id: 'B001',
      platform: 'TK小店',
      accountName: '印尼美妆店',
      shopId: 'shop_id_001',
      region: '印尼',
      status: 'active',
      authType: 'API授权',
      expireTime: '2024-08-15',
      lastSync: '2024-02-20 14:30',
      productCount: 156,
      orderCount: 892,
    },
    {
      id: 'B002',
      platform: 'TK小店',
      accountName: '泰国服装店',
      shopId: 'shop_id_002',
      region: '泰国',
      status: 'active',
      authType: 'API授权',
      expireTime: '2024-06-20',
      lastSync: '2024-02-20 14:25',
      productCount: 89,
      orderCount: 456,
    },
    {
      id: 'B003',
      platform: 'TK Ads',
      accountName: '东南亚广告账户',
      shopId: 'ads_account_001',
      region: '东南亚',
      status: 'active',
      authType: 'OAuth2.0',
      expireTime: '2024-05-10',
      lastSync: '2024-02-20 14:00',
      productCount: 0,
      orderCount: 0,
    },
    {
      id: 'B004',
      platform: '亚马逊',
      accountName: '美国站店铺',
      shopId: 'amz_us_001',
      region: '美国',
      status: 'active',
      authType: 'SP-API',
      expireTime: '2025-01-01',
      lastSync: '2024-02-20 13:45',
      productCount: 234,
      orderCount: 1256,
    },
    {
      id: 'B005',
      platform: '亚马逊',
      accountName: '欧洲站店铺',
      shopId: 'amz_eu_001',
      region: '欧洲',
      status: 'expired',
      authType: 'SP-API',
      expireTime: '2024-02-10',
      lastSync: '2024-02-10 08:00',
      productCount: 67,
      orderCount: 234,
    },
    {
      id: 'B006',
      platform: '店小秘ERP',
      accountName: '主ERP账户',
      shopId: 'erp_main_001',
      region: '全球',
      status: 'active',
      authType: 'API Key',
      expireTime: '永久有效',
      lastSync: '2024-02-20 14:35',
      productCount: 512,
      orderCount: 2838,
    },
    {
      id: 'B007',
      platform: 'TK创作者',
      accountName: '官方创作者账号',
      shopId: 'creator_001',
      region: '印尼',
      status: 'error',
      authType: 'OAuth2.0',
      expireTime: '2024-04-01',
      lastSync: '2024-02-18 10:00',
      productCount: 0,
      orderCount: 0,
    },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

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

  const handleUnbind = (bindingId: string) => {
    setBindings((prev) => prev.filter((b) => b.id !== bindingId));
    toast.success('解绑成功');
  };

  const handleSync = (bindingId: string) => {
    toast.success('同步任务已触发');
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
                  <Label className="text-right">平台类型</Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tk_shop">TK小店</SelectItem>
                      <SelectItem value="tk_ads">TK Ads</SelectItem>
                      <SelectItem value="tk_creator">TK创作者</SelectItem>
                      <SelectItem value="amazon">亚马逊</SelectItem>
                      <SelectItem value="erp">店小秘ERP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">账号名称</Label>
                  <Input className="col-span-3" placeholder="输入账号名称" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">店铺ID</Label>
                  <Input className="col-span-3" placeholder="输入店铺ID" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">API密钥</Label>
                  <Input className="col-span-3" placeholder="输入API Key" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>授权绑定</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">已绑定平台</div>
              <div className="text-[24px] font-semibold text-foreground">{bindings.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">正常连接</div>
              <div className="text-[24px] font-semibold text-success">
                {bindings.filter((b) => b.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">需要续期</div>
              <div className="text-[24px] font-semibold text-warning">
                {bindings.filter((b) => b.status === 'expired').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">异常连接</div>
              <div className="text-[24px] font-semibold text-destructive">
                {bindings.filter((b) => b.status === 'error').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 绑定列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-[15px] font-medium">平台账号列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                    <TableCell className="text-[13px] text-foreground">{binding.accountName}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground font-mono">{binding.shopId}</TableCell>
                    <TableCell className="text-[13px] text-foreground">{binding.region}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">{binding.authType}</Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{binding.expireTime}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">{binding.lastSync}</TableCell>
                    <TableCell>{getStatusBadge(binding.status)}</TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSync(binding.id)}
                          title="同步数据"
                        >
                          <RefreshCw className="h-4 w-4" />
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
