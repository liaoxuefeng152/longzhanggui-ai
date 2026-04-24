'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileBox,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Calculator,
  Settings,
  DollarSign,
  ChevronRight,
  Globe,
  Percent,
  X,
} from 'lucide-react';

interface PricingTemplate {
  id: string;
  name: string;
  site: string;
  siteName: string;
  type: string;
  profitMethod: string;
  profitMethodName: string;
  profitRate: number;
  discount: number;
  exchangeRate: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function PricingTemplatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 新建/编辑弹窗
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    name: '',
    site: 'TH',
    profitMethod: 'cost_rate',
    profitRate: 30,
    discount: 100,
    exchangeRate: '',
  });

  // 获取用户信息
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 加载模板列表
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/pricing/templates');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      toast.error('加载失败');
    }
    setIsLoading(false);
  };

  // 打开新建弹窗
  const openCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      name: '',
      site: 'TH',
      profitMethod: 'cost_rate',
      profitRate: 30,
      discount: 100,
      exchangeRate: '',
    });
    setDialogOpen(true);
  };

  // 打开编辑弹窗
  const openEditDialog = (template: any) => {
    setDialogMode('edit');
    setFormData({
      name: template.name,
      site: template.site,
      profitMethod: template.profit?.method || 'cost_rate',
      profitRate: template.profit?.rate || 30,
      discount: template.profit?.discount || 100,
      exchangeRate: template.exchangeRate?.toString() || '',
    });
    setDialogOpen(true);
  };

  // 保存模板
  const saveTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入模板名称');
      return;
    }

    const payload = {
      name: formData.name,
      site: formData.site,
      profit: {
        method: formData.profitMethod,
        rate: formData.profitRate,
        discount: formData.discount,
      },
      exchangeRate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : null,
    };

    try {
      const url = dialogMode === 'create' 
        ? '/api/v1/pricing/templates' 
        : '/api/v1/pricing/templates';
      
      const response = await fetch(url, {
        method: dialogMode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dialogMode === 'edit' ? templates.find(t => t.id === (templates[0] as any)?.id)?.id : undefined, ...payload }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(dialogMode === 'create' ? '创建成功' : '更新成功');
        setDialogOpen(false);
        loadTemplates();
      } else {
        toast.error(result.error || '操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 删除模板
  const deleteTemplate = async (id: string) => {
    if (!confirm('确定要删除这个模板吗？')) return;

    try {
      const response = await fetch(`/api/v1/pricing/templates?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        toast.success('删除成功');
        loadTemplates();
      } else {
        toast.error(result.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 复制模板
  const copyTemplate = async (template: any) => {
    const payload = {
      name: `${template.name} (副本)`,
      site: template.site,
      profit: template.profit,
      exchangeRate: template.exchangeRate,
    };

    try {
      const response = await fetch('/api/v1/pricing/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('复制成功');
        loadTemplates();
      } else {
        toast.error(result.error || '复制失败');
      }
    } catch (error) {
      toast.error('复制失败');
    }
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-400/5 flex items-center justify-center">
              <FileBox className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">定价模板</h1>
              <p className="text-[14px] text-muted-foreground">预设定价规则，快速计算商品售价</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            新建模板
          </Button>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
            <Settings className="h-3 w-3 mr-1" />
            成本配置
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
            <Percent className="h-3 w-3 mr-1" />
            利润设置
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
            <Calculator className="h-3 w-3 mr-1" />
            售价试算
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
            <DollarSign className="h-3 w-3 mr-1" />
            一键定价
          </Badge>
        </div>

        {/* 模板列表 */}
        {isLoading ? (
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">加载中...</div>
            </CardContent>
          </Card>
        ) : templates.length === 0 ? (
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileBox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">暂无定价模板</h3>
              <p className="text-muted-foreground mt-1">点击上方按钮创建您的第一个定价模板</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                新建模板
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FileBox className="h-4 w-4 text-emerald-500" />
                      </div>
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      <Globe className="h-3 w-3 mr-1" />
                      {template.siteName}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">利润方式</div>
                      <div className="font-medium">{template.profitMethodName}</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">利润率</div>
                      <div className="font-medium text-emerald-600">{template.profitRate}%</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">折扣</div>
                      <div className="font-medium">{template.discount / 10}折</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">汇率</div>
                      <div className="font-medium">{template.exchangeRate || '自动获取'}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    更新于 {template.updatedAt}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => router.push(`/workflows/pricing-templates/${template.id}`)}
                    >
                      <Settings className="h-3 w-3" />
                      编辑
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyTemplate(template)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 新建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? '新建定价模板' : '编辑定价模板'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' ? '创建新的定价模板，快速设置定价规则' : '修改模板配置，更新定价规则'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">模板名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：3C模板、美妆模板"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">目标站点</Label>
              <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择目标站点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TH">泰国</SelectItem>
                  <SelectItem value="ID">印尼</SelectItem>
                  <SelectItem value="VN">越南</SelectItem>
                  <SelectItem value="MY">马来西亚</SelectItem>
                  <SelectItem value="PH">菲律宾</SelectItem>
                  <SelectItem value="SG">新加坡</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitMethod">利润方式</Label>
              <Select value={formData.profitMethod} onValueChange={(value) => setFormData({ ...formData, profitMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost_rate">成本利润率</SelectItem>
                  <SelectItem value="price_rate">售价利润率</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profitRate">利润率 (%)</Label>
                <Input
                  id="profitRate"
                  type="number"
                  value={formData.profitRate}
                  onChange={(e) => setFormData({ ...formData, profitRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">折扣</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchangeRate">汇率（留空自动获取）</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.01"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                placeholder="如：5.1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={saveTemplate}>
              {dialogMode === 'create' ? '创建' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
