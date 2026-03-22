'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Edit,
  Power,
  Trash2,
  FileText,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getModels,
  createModel,
  updateModel,
  deleteModel,
  testModel,
  Model,
  ModelCreate,
  ModelUpdate,
} from '@/lib/api/models';
import { logout } from '@/lib/api/auth';

// 模型提供商选项
const MODEL_PROVIDERS = [
  { value: 'doubao', label: '字节跳动' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'moonshot', label: '月之暗面' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'local', label: '本地部署' },
];

export default function ModelsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState<ModelCreate>({
    name: '',
    model_id: '',
    provider: 'doubao',
    api_key: '',
    endpoint: '',
    daily_limit: 1000000,
  });

  // 获取模型列表
  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const response = await getModels({ page: 1, page_size: 100 });
      setModels(response.items);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      toast.error('获取模型列表失败');
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
    fetchModels();
  }, [router]);

  // 过滤模型
  const filteredModels = models.filter((model) => {
    const matchSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.model_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || model.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: '在线', className: 'bg-success/10 text-success border-success/20' },
      inactive: { label: '离线', className: 'bg-muted text-muted-foreground border-muted' },
      error: { label: '异常', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const config = statusMap[status] || statusMap.inactive;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // 获取负载率颜色
  const getLoadRateColor = (todayUsed: number, dailyLimit: number) => {
    const rate = dailyLimit > 0 ? (todayUsed / dailyLimit) * 100 : 0;
    if (rate >= 80) return 'text-destructive';
    if (rate >= 60) return 'text-warning';
    return 'text-success';
  };

  // 计算负载率
  const calculateLoadRate = (todayUsed: number, dailyLimit: number) => {
    return dailyLimit > 0 ? Math.round((todayUsed / dailyLimit) * 100) : 0;
  };

  // 切换模型状态
  const handleToggleStatus = async (model: Model) => {
    try {
      const newStatus = model.status === 'active' ? 'inactive' : 'active';
      await updateModel(model.id, { status: newStatus });
      toast.success('状态已更新');
      fetchModels();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  // 删除模型
  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('确定要删除该模型吗？')) return;
    try {
      await deleteModel(modelId);
      toast.success('模型已删除');
      fetchModels();
    } catch (error) {
      console.error('删除模型失败:', error);
      toast.error('删除模型失败');
    }
  };

  // 测试模型连通性
  const handleTestModel = async (modelId: string) => {
    toast.info('正在测试模型连通性...');
    try {
      const result = await testModel(modelId);
      if (result.success) {
        toast.success(`测试成功，延迟 ${result.latency}ms`);
      } else {
        toast.error(`测试失败: ${result.message}`);
      }
    } catch (error) {
      console.error('测试模型失败:', error);
      toast.error('测试模型失败');
    }
  };

  // 编辑模型
  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      model_id: model.model_id,
      provider: model.provider,
      api_key: model.api_key,
      endpoint: model.endpoint || '',
      daily_limit: model.daily_limit,
    });
    setIsDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setEditingModel(null);
    setFormData({
      name: '',
      model_id: '',
      provider: 'doubao',
      api_key: '',
      endpoint: '',
      daily_limit: 1000000,
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.name || !formData.model_id || !formData.api_key) {
      toast.error('请填写必填项');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingModel) {
        // 更新
        const updateData: ModelUpdate = {
          name: formData.name,
          model_id: formData.model_id,
          provider: formData.provider,
          api_key: formData.api_key,
          endpoint: formData.endpoint,
          daily_limit: formData.daily_limit,
        };
        await updateModel(editingModel.id, updateData);
        toast.success('模型已更新');
      } else {
        // 创建
        await createModel(formData);
        toast.success('模型已创建');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchModels();
    } catch (error) {
      console.error('保存模型失败:', error);
      toast.error('保存模型失败');
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
            <h1 className="text-[18px] font-semibold text-foreground">模型路由管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              AI模型统一调度中心 · 负载均衡 · 故障切换
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                新增模型
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingModel ? '编辑模型' : '新增模型'}</DialogTitle>
                <DialogDescription>
                  配置AI模型接入参数，支持本地部署和公有云API
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">模型名称 <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="请输入模型名称"
                    className="col-span-3"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model_id" className="text-right">模型ID <span className="text-destructive">*</span></Label>
                  <Input
                    id="model_id"
                    placeholder="如：doubao-pro-4k"
                    className="col-span-3"
                    value={formData.model_id}
                    onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="provider" className="text-right">提供商</Label>
                  <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择提供商" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_PROVIDERS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endpoint" className="text-right">API地址</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.example.com/v1"
                    className="col-span-3"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="api_key" className="text-right">API密钥 <span className="text-destructive">*</span></Label>
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="请输入API密钥"
                    className="col-span-3"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="daily_limit" className="text-right">每日限额</Label>
                  <Input
                    id="daily_limit"
                    type="number"
                    placeholder="1000000"
                    className="col-span-3"
                    value={formData.daily_limit}
                    onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) || 0 })}
                  />
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

        {/* 筛选区 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模型名称/ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="运行状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">在线</SelectItem>
                  <SelectItem value="inactive">离线</SelectItem>
                  <SelectItem value="error">异常</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchModels} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 模型列表表格 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-medium">模型列表</CardTitle>
              <span className="text-[13px] text-muted-foreground">
                共 {filteredModels.length} 个模型
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无模型数据
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">模型ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">模型名称</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">提供商</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">模型标识</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">运行状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">调用次数</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">今日已用</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">每日限额</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">负载率</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => {
                    const loadRate = calculateLoadRate(model.today_used, model.daily_limit);
                    return (
                      <TableRow key={model.id} className="border-border hover:bg-muted/30">
                        <TableCell className="text-[13px] font-medium text-primary px-6">
                          {model.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-[13px] text-foreground font-medium">
                          {model.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {MODEL_PROVIDERS.find(p => p.value === model.provider)?.label || model.provider}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">
                          {model.model_id}
                        </TableCell>
                        <TableCell>{getStatusBadge(model.status)}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">
                          {model.today_used.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[13px] text-foreground">
                          {model.today_used.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">
                          {model.daily_limit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`text-[13px] font-medium ${getLoadRateColor(model.today_used, model.daily_limit)}`}>
                            {loadRate}%
                          </span>
                          {loadRate >= 80 && (
                            <AlertTriangle className="inline-block h-3 w-3 ml-1 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditModel(model)}
                              title="编辑"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(model)}
                              title={model.status === 'active' ? '禁用' : '启用'}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTestModel(model.id)}
                              title="测试连通性"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteModel(model.id)}
                              className="text-destructive hover:text-destructive"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
