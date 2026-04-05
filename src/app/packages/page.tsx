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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  Crown,
  Zap,
  Star,
  Gift,
  RefreshCw,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  Package,
  PackageCreate,
  PackageUpdate,
} from '@/lib/api/packages';
import { logout } from '@/lib/api/auth';

export default function PackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState<PackageCreate>({
    name: '',
    description: '',
    price: 0,
    call_quota: 1000000,
    call_limit: 1000,
    duration: 30,
    duration_days: 30,
    features: [],
    agent_access: [],
  });

  // 获取套餐列表
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await getPackages();
      setPackages(response.packages);
    } catch (error) {
      console.error('获取套餐列表失败:', error);
      toast.error('获取套餐列表失败');
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
    fetchPackages();
  }, [router]);

  // 获取套餐图标
  const getTypeIcon = (name: string) => {
    if (name.includes('试用')) return Gift;
    if (name.includes('基础')) return Star;
    if (name.includes('专业') || name.includes('Pro')) return Zap;
    if (name.includes('企业')) return Crown;
    return Star;
  };

  // 获取套餐颜色
  const getTypeColor = (name: string) => {
    if (name.includes('试用')) return 'bg-muted text-muted-foreground';
    if (name.includes('基础')) return 'bg-primary/10 text-primary';
    if (name.includes('专业') || name.includes('Pro')) return 'bg-success/10 text-success';
    if (name.includes('企业')) return 'bg-warning/10 text-warning';
    return 'bg-muted';
  };

  // 删除套餐
  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('确定要删除该套餐吗？')) return;
    try {
      await deletePackage(packageId);
      toast.success('套餐已删除');
      fetchPackages();
    } catch (error) {
      console.error('删除套餐失败:', error);
      toast.error('删除套餐失败');
    }
  };

  // 编辑套餐
  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      call_quota: pkg.call_quota || 1000000,
      call_limit: pkg.call_limit,
      duration: pkg.duration || 30,
      duration_days: pkg.duration_days,
      features: pkg.features || [],
      agent_access: pkg.agent_access || [],
    });
    setIsDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      call_quota: 1000000,
      call_limit: 1000,
      duration: 30,
      duration_days: 30,
      features: [],
      agent_access: [],
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('请填写套餐名称');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPackage) {
        // 更新
        const updateData: PackageUpdate = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          call_quota: formData.call_quota,
          call_limit: formData.call_limit,
          duration: formData.duration,
          duration_days: formData.duration_days,
          features: formData.features,
          agent_access: formData.agent_access,
        };
        await updatePackage(editingPackage.id, updateData);
        toast.success('套餐已更新');
      } else {
        // 创建
        await createPackage(formData);
        toast.success('套餐已创建');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('保存套餐失败:', error);
      toast.error('保存套餐失败');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">套餐管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              套餐定价 · 功能配置 · 用户统计
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
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
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">套餐名称 <span className="text-destructive">*</span></Label>
                  <div className="col-span-3 space-y-3">
                    <Input
                      placeholder="请输入套餐名称"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Textarea
                      placeholder="请输入套餐描述，说明该套餐的适用场景和主要特点"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">价格(元/月)</Label>
                  <Input
                    type="number"
                    className="col-span-3"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">有效天数</Label>
                  <Input
                    type="number"
                    className="col-span-3"
                    placeholder="30"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">每日调用上限</Label>
                  <Input
                    type="number"
                    className="col-span-3"
                    placeholder="1000"
                    value={formData.call_limit}
                    onChange={(e) => setFormData({ ...formData, call_limit: parseInt(e.target.value) || 1000 })}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">功能权益</Label>
                  <div className="col-span-3 space-y-2">
                    {[
                      '无限AI调用',
                      '全部AI智能体',
                      '专属客户经理',
                      '定制化开发',
                      '私有化部署支持',
                      'SLA保障',
                      '视频生成智能体',
                      '广告投放智能体',
                      'API接口调用',
                      '优先技术支持',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={formData.features?.includes(feature)}
                          onCheckedChange={(checked) => {
                            const newFeatures = checked
                              ? [...(formData.features || []), feature]
                              : (formData.features || []).filter((f) => f !== feature);
                            setFormData({ ...formData, features: newFeatures });
                          }}
                        />
                        <Label htmlFor={`feature-${feature}`} className="text-[13px] font-normal">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 操作栏 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">
                共 {packages.length} 个套餐
              </span>
              <Button variant="outline" onClick={fetchPackages} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无套餐数据
          </div>
        ) : (
          <>
            {/* 套餐卡片展示 */}
            <div className="grid grid-cols-4 gap-6">
              {packages.map((pkg) => {
                const Icon = getTypeIcon(pkg.name);
                return (
                  <Card key={pkg.id} className={`bg-white border-border shadow-sm relative overflow-hidden ${pkg.name.includes('专业') ? 'ring-2 ring-primary' : ''}`}>
                    {pkg.name.includes('专业') && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-2 py-0.5 rounded-bl">
                        推荐
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className={`w-12 h-12 rounded-full ${getTypeColor(pkg.name)} mx-auto flex items-center justify-center mb-2`}>
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
                        {pkg.user_count || 0} 位用户订阅
                      </div>
                      {pkg.description && (
                        <div className="flex items-start gap-2 text-[12px] text-muted-foreground bg-muted/30 p-2 rounded">
                          <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{pkg.description}</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {pkg.features?.map((feature, idx) => (
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
                          onClick={() => handleEditPackage(pkg)}
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
                      {packages.map((pkg) => (
                        <TableHead key={pkg.id} className="text-[12px] font-medium text-muted-foreground text-center">
                          {pkg.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">每日调用次数</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center text-[13px]">
                          {pkg.call_limit === 999999 ? '无限' : `${pkg.call_limit}次`}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">有效天数</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center text-[13px]">
                          {pkg.duration_days}天
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">选品智能体</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center">
                          {pkg.agent_access?.includes('product-selection') || pkg.agent_access?.includes('all') ? (
                            <Check className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[10px]">-</Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">图片设计智能体</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center">
                          {pkg.agent_access?.includes('image-design') || pkg.agent_access?.includes('all') ? (
                            <Check className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[10px]">-</Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">视频生成智能体</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center">
                          {pkg.agent_access?.includes('video-generation') || pkg.agent_access?.includes('all') ? (
                            <Check className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[10px]">-</Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">Listing优化智能体</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center">
                          {pkg.agent_access?.includes('listing-optimization') || pkg.agent_access?.includes('all') ? (
                            <Check className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[10px]">-</Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">AI客服智能体</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center">
                          {pkg.agent_access?.includes('customer-service') || pkg.agent_access?.includes('all') ? (
                            <Check className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[10px]">-</Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="px-6 text-[13px] font-medium">数据复盘智能体</TableCell>
                      {packages.map((pkg) => (
                        <TableCell key={pkg.id} className="text-center">
                          {pkg.agent_access?.includes('data-review') || pkg.agent_access?.includes('all') ? (
                            <Check className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[10px]">-</Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
