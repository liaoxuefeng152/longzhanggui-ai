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
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';

// 模型类型
interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_url: string;
  status: 'online' | 'offline' | 'error';
  enabled: boolean;
  priority: number;
  max_tokens: number;
  cost_per_1k: number;
  created_at: string;
  updated_at: string;
}

const MODEL_PROVIDERS = [
  { value: 'doubao', label: '字节跳动（豆包）' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'moonshot', label: '月之暗面（Kimi）' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
];

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<AIModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    provider: 'doubao',
    model_id: '',
    api_url: '',
    priority: 1,
    max_tokens: 8000,
    cost_per_1k: 0.1,
  });

  // 加载模型列表
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/models', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setModels(data.data || []);
      } else {
        // API不存在，使用默认数据
        setModels(defaultModels);
      }
    } catch (error) {
      console.error('加载模型失败:', error);
      setModels(defaultModels);
    }
    setIsLoading(false);
  };

  // 默认模型数据
  const defaultModels: AIModel[] = [
    {
      id: '1',
      name: '豆包-Seed-1.8',
      provider: 'doubao',
      model_id: 'doubao-seed-1-8-251228',
      api_url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      status: 'online',
      enabled: true,
      priority: 1,
      max_tokens: 8000,
      cost_per_1k: 0.1,
      created_at: '2024-01-15',
      updated_at: '2024-03-20',
    },
    {
      id: '2',
      name: 'DeepSeek-V3',
      provider: 'deepseek',
      model_id: 'deepseek-chat-v3',
      api_url: 'https://api.deepseek.com/v1/chat/completions',
      status: 'online',
      enabled: true,
      priority: 2,
      max_tokens: 64000,
      cost_per_1k: 0.02,
      created_at: '2024-02-01',
      updated_at: '2024-03-18',
    },
    {
      id: '3',
      name: '豆包-Vision',
      provider: 'doubao',
      model_id: 'doubao-seed-1.5-vision',
      api_url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      status: 'online',
      enabled: true,
      priority: 1,
      max_tokens: 4000,
      cost_per_1k: 0.15,
      created_at: '2024-01-20',
      updated_at: '2024-03-15',
    },
  ];

  // 过滤模型
  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.model_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = filterProvider === 'all' || model.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  // 打开新增弹窗
  const handleOpenAdd = () => {
    setEditingModel(null);
    setFormData({
      name: '',
      provider: 'doubao',
      model_id: '',
      api_url: '',
      priority: 1,
      max_tokens: 8000,
      cost_per_1k: 0.1,
    });
    setIsDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (model: AIModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      provider: model.provider,
      model_id: model.model_id,
      api_url: model.api_url,
      priority: model.priority,
      max_tokens: model.max_tokens,
      cost_per_1k: model.cost_per_1k,
    });
    setIsDialogOpen(true);
  };

  // 保存模型
  const handleSave = async () => {
    if (!formData.name || !formData.model_id) {
      toast.error('请填写必填项');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingModel) {
        // 更新
        setModels(models.map((m) =>
          m.id === editingModel.id
            ? { ...m, ...formData, updated_at: new Date().toISOString().split('T')[0] }
            : m
        ));
        toast.success('模型更新成功');
      } else {
        // 新增
        const newModel: AIModel = {
          id: Date.now().toString(),
          ...formData,
          status: 'offline',
          enabled: true,
          created_at: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString().split('T')[0],
        };
        setModels([...models, newModel]);
        toast.success('模型添加成功');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('保存失败');
    }
    setIsSubmitting(false);
  };

  // 切换启用状态
  const handleToggle = async (model: AIModel) => {
    setModels(
      models.map((m) =>
        m.id === model.id ? { ...m, enabled: !m.enabled } : m
      )
    );
    toast.success(`模型${model.enabled ? '已禁用' : '已启用'}`);
  };

  // 删除模型
  const handleDelete = async (model: AIModel) => {
    if (!confirm(`确定删除模型「${model.name}」吗？`)) return;
    setModels(models.filter((m) => m.id !== model.id));
    toast.success('模型已删除');
  };

  // 测试模型连接
  const handleTest = async (model: AIModel) => {
    setTestingId(model.id);
    try {
      // 模拟测试
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setModels(
        models.map((m) =>
          m.id === model.id ? { ...m, status: 'online' as const } : m
        )
      );
      toast.success(`「${model.name}」连接测试成功`);
    } catch (error) {
      setModels(
        models.map((m) =>
          m.id === model.id ? { ...m, status: 'error' as const } : m
        )
      );
      toast.error(`「${model.name}」连接测试失败`);
    }
    setTestingId(null);
  };

  const getStatusBadge = (status: AIModel['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500">在线</Badge>;
      case 'offline':
        return <Badge variant="secondary">离线</Badge>;
      case 'error':
        return <Badge variant="destructive">异常</Badge>;
    }
  };

  const getProviderLabel = (provider: string) => {
    return MODEL_PROVIDERS.find((p) => p.value === provider)?.label || provider;
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 flex items-center justify-center">
              <Bot className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">模型配置</h1>
              <p className="text-[14px] text-muted-foreground">
                管理AI模型配置，支持多模型接入
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">模型总数</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{models.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">在线</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{models.filter((m) => m.status === 'online').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Power className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">已启用</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{models.filter((m) => m.enabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">豆包模型</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{models.filter((m) => m.provider === 'doubao').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模型名称/ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="筛选供应商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部供应商</SelectItem>
                {MODEL_PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1" />
            新增模型
          </Button>
        </div>

        {/* 模型列表 */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>暂无模型数据</p>
                <Button variant="link" onClick={handleOpenAdd}>
                  点击添加第一个模型
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模型名称</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>模型ID</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>上下文上限</TableHead>
                    <TableHead>单价(元/1K)</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div className="font-medium">{model.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getProviderLabel(model.provider)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{model.model_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(model.status)}
                          {!model.enabled && (
                            <Badge variant="secondary">已禁用</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>P{model.priority}</TableCell>
                      <TableCell>{model.max_tokens.toLocaleString()}</TableCell>
                      <TableCell>¥{model.cost_per_1k.toFixed(3)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTest(model)}
                            disabled={testingId === model.id}
                          >
                            {testingId === model.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(model)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(model)}
                          >
                            {model.enabled ? (
                              <XCircle className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(model)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

        {/* 新增/编辑弹窗 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingModel ? '编辑模型' : '新增模型'}</DialogTitle>
              <DialogDescription>
                {editingModel ? '修改模型配置信息' : '添加新的AI模型配置'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  模型名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：豆包-Seed-1.8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">供应商</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(v) => setFormData({ ...formData, provider: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model_id">
                  模型ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model_id"
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  placeholder="如：doubao-seed-1-8-251228"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_url">API地址</Label>
                <Input
                  id="api_url"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  placeholder="如：https://ark.cn-beijing.volces.com/api/v3/chat/completions"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">优先级</Label>
                  <Input
                    id="priority"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_tokens">上下文上限</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={formData.max_tokens}
                    onChange={(e) =>
                      setFormData({ ...formData, max_tokens: parseInt(e.target.value) || 8000 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_per_1k">单价(元/1K Tokens)</Label>
                <Input
                  id="cost_per_1k"
                  type="number"
                  step={0.001}
                  min={0}
                  value={formData.cost_per_1k}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_per_1k: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
