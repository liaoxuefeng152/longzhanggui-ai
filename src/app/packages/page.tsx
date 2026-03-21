'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Plus,
  Edit,
  Trash2,
  Check,
  Crown,
  Zap,
  Star,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';

interface Package {
  id: string;
  name: string;
  type: 'trial' | 'basic' | 'pro' | 'enterprise';
  price: number;
  duration: number;
  features: string[];
  callLimit: number;
  agentAccess: string[];
  status: 'active' | 'inactive';
  userCount: number;
}

export default function PackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [packages, setPackages] = useState<Package[]>([
    {
      id: 'P001',
      name: '试用版',
      type: 'trial',
      price: 0,
      duration: 3,
      features: ['客服智能体', '每日50次调用', '基础数据分析'],
      callLimit: 50,
      agentAccess: ['AI客服智能体'],
      status: 'active',
      userCount: 128,
    },
    {
      id: 'P002',
      name: '基础版',
      type: 'basic',
      price: 299,
      duration: 30,
      features: ['客服智能体', 'Listing优化智能体', '每日200次调用', '数据报表'],
      callLimit: 200,
      agentAccess: ['AI客服智能体', 'Listing优化智能体'],
      status: 'active',
      userCount: 86,
    },
    {
      id: 'P003',
      name: '专业版',
      type: 'pro',
      price: 899,
      duration: 30,
      features: ['全部智能体', '每日1000次调用', '优先支持', 'API接入', '自定义Prompt'],
      callLimit: 1000,
      agentAccess: ['全部智能体'],
      status: 'active',
      userCount: 42,
    },
    {
      id: 'P004',
      name: '企业版',
      type: 'enterprise',
      price: 2999,
      duration: 30,
      features: ['全部智能体', '无限调用', '专属客户经理', '定制开发', '私有化部署'],
      callLimit: 999999,
      agentAccess: ['全部智能体'],
      status: 'active',
      userCount: 14,
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

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      trial: Gift,
      basic: Star,
      pro: Zap,
      enterprise: Crown,
    };
    return iconMap[type] || Star;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      trial: 'bg-muted text-muted-foreground',
      basic: 'bg-primary/10 text-primary',
      pro: 'bg-success/10 text-success',
      enterprise: 'bg-warning/10 text-warning',
    };
    return colorMap[type] || 'bg-muted';
  };

  const handleDeletePackage = (packageId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== packageId));
    toast.success('套餐已删除');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">套餐管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              套餐定价 · 功能配置 · 用户统计
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPackage(null)}>
                <Plus className="h-4 w-4 mr-2" />
                新增套餐
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPackage ? '编辑套餐' : '新增套餐'}</DialogTitle>
                <DialogDescription>配置套餐信息和功能权限</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">套餐名称</Label>
                  <Input className="col-span-3" placeholder="请输入套餐名称" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">价格(元/月)</Label>
                  <Input type="number" className="col-span-3" placeholder="0" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">每日调用上限</Label>
                  <Input type="number" className="col-span-3" placeholder="1000" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 套餐卡片展示 */}
        <div className="grid grid-cols-4 gap-6">
          {packages.map((pkg) => {
            const Icon = getTypeIcon(pkg.type);
            return (
              <Card key={pkg.id} className={`bg-white border-border shadow-sm relative overflow-hidden ${pkg.type === 'pro' ? 'ring-2 ring-primary' : ''}`}>
                {pkg.type === 'pro' && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-2 py-0.5 rounded-bl">
                    推荐
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-full ${getTypeColor(pkg.type)} mx-auto flex items-center justify-center mb-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-[16px]">{pkg.name}</CardTitle>
                  <CardDescription>
                    <span className="text-[24px] font-bold text-foreground">¥{pkg.price}</span>
                    <span className="text-[12px] text-muted-foreground">/月</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center text-[12px] text-muted-foreground">
                    {pkg.userCount} 位用户订阅
                  </div>
                  <div className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[13px]">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingPackage(pkg);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 套餐对比表格 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-[15px] font-medium">套餐功能对比</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30">
                  <TableHead className="text-[12px] font-medium text-muted-foreground px-6">功能项</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-center">试用版</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-center">基础版</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-center">专业版</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-center">企业版</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">每日调用次数</TableCell>
                  <TableCell className="text-center text-[13px]">50次</TableCell>
                  <TableCell className="text-center text-[13px]">200次</TableCell>
                  <TableCell className="text-center text-[13px]">1000次</TableCell>
                  <TableCell className="text-center text-[13px]">无限</TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">选品智能体</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">图片设计智能体</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">视频生成智能体</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">Listing优化智能体</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">广告投放智能体</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">AI客服智能体</TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">数据复盘智能体</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">自定义Prompt</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-border">
                  <TableCell className="px-6 text-[13px] font-medium">私有化部署</TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="text-[10px]">-</Badge></TableCell>
                  <TableCell className="text-center"><Check className="h-4 w-4 text-success mx-auto" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
