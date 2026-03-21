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
} from 'lucide-react';
import { toast } from 'sonner';

interface Model {
  id: string;
  name: string;
  type: 'local' | 'public';
  platform: string;
  status: 'online' | 'offline' | 'error';
  qpsLimit: number;
  currentQps: number;
  totalCalls: number;
  remainingQuota: number;
  loadRate: number;
}

export default function ModelsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  const [models, setModels] = useState<Model[]>([
    {
      id: 'M001',
      name: '豆包-Seed-1.8',
      type: 'public',
      platform: '字节跳动',
      status: 'online',
      qpsLimit: 100,
      currentQps: 45,
      totalCalls: 1258000,
      remainingQuota: 8742000,
      loadRate: 45,
    },
    {
      id: 'M002',
      name: 'DeepSeek-V3',
      type: 'public',
      platform: 'DeepSeek',
      status: 'online',
      qpsLimit: 50,
      currentQps: 32,
      totalCalls: 856000,
      remainingQuota: 6144000,
      loadRate: 64,
    },
    {
      id: 'M003',
      name: 'Kimi-128K',
      type: 'public',
      platform: '月之暗面',
      status: 'online',
      qpsLimit: 30,
      currentQps: 12,
      totalCalls: 425000,
      remainingQuota: 2575000,
      loadRate: 40,
    },
    {
      id: 'M004',
      name: '本地LLaMA-3',
      type: 'local',
      platform: '本地部署',
      status: 'offline',
      qpsLimit: 20,
      currentQps: 0,
      totalCalls: 12500,
      remainingQuota: 999999,
      loadRate: 0,
    },
    {
      id: 'M005',
      name: 'GPT-4-Turbo',
      type: 'public',
      platform: 'OpenAI',
      status: 'error',
      qpsLimit: 30,
      currentQps: 0,
      totalCalls: 320000,
      remainingQuota: 0,
      loadRate: 0,
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

  const filteredModels = models.filter((model) => {
    const matchSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || model.type === filterType;
    const matchStatus = filterStatus === 'all' || model.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      online: { label: '在线', className: 'bg-success/10 text-success border-success/20' },
      offline: { label: '离线', className: 'bg-muted text-muted-foreground border-muted' },
      error: { label: '异常', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const config = statusMap[status] || statusMap.offline;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getLoadRateColor = (rate: number) => {
    if (rate >= 80) return 'text-destructive';
    if (rate >= 60) return 'text-warning';
    return 'text-success';
  };

  const handleToggleStatus = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId
          ? { ...m, status: m.status === 'online' ? 'offline' : 'online' }
          : m
      )
    );
    toast.success('状态已更新');
  };

  const handleDeleteModel = (modelId: string) => {
    setModels((prev) => prev.filter((m) => m.id !== modelId));
    toast.success('模型已删除');
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setIsDialogOpen(true);
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">模型路由管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              AI模型统一调度中心 · 负载均衡 · 故障切换
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingModel(null)}>
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
                  <Label htmlFor="name" className="text-right">模型名称</Label>
                  <Input
                    id="name"
                    placeholder="请输入模型名称"
                    className="col-span-3"
                    defaultValue={editingModel?.name || ''}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">模型类型</Label>
                  <Select defaultValue={editingModel?.type || 'public'}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择模型类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">公有云API</SelectItem>
                      <SelectItem value="local">本地部署</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="platform" className="text-right">接入平台</Label>
                  <Input
                    id="platform"
                    placeholder="如：字节跳动、DeepSeek"
                    className="col-span-3"
                    defaultValue={editingModel?.platform || ''}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiUrl" className="text-right">API地址</Label>
                  <Input
                    id="apiUrl"
                    placeholder="https://api.example.com/v1"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">API密钥</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="请输入API密钥"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="qps" className="text-right">QPS阈值</Label>
                  <Input
                    id="qps"
                    type="number"
                    placeholder="100"
                    className="col-span-3"
                    defaultValue={editingModel?.qpsLimit || 100}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="loadLimit" className="text-right">负载上限</Label>
                  <Input
                    id="loadLimit"
                    type="number"
                    placeholder="80"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="模型类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="public">公有云API</SelectItem>
                  <SelectItem value="local">本地部署</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="运行状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                  <SelectItem value="error">异常</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
              >
                重置筛选
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
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30">
                  <TableHead className="text-[12px] font-medium text-muted-foreground px-6">模型ID</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">模型名称</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">类型</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">接入平台</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">运行状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">QPS上限</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">调用次数</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">剩余额度</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">负载率</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id} className="border-border hover:bg-muted/30">
                    <TableCell className="text-[13px] font-medium text-primary px-6">
                      {model.id}
                    </TableCell>
                    <TableCell className="text-[13px] text-foreground font-medium">
                      {model.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={model.type === 'local' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}>
                        {model.type === 'local' ? '本地' : '公有'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {model.platform}
                    </TableCell>
                    <TableCell>{getStatusBadge(model.status)}</TableCell>
                    <TableCell className="text-[13px] text-foreground">
                      {model.currentQps}/{model.qpsLimit}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {model.totalCalls.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {model.remainingQuota === 999999 ? '无限' : model.remainingQuota.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[13px] font-medium ${getLoadRateColor(model.loadRate)}`}>
                        {model.loadRate}%
                      </span>
                      {model.loadRate >= 80 && (
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
                          onClick={() => handleToggleStatus(model.id)}
                          title={model.status === 'online' ? '禁用' : '启用'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="查看日志"
                        >
                          <FileText className="h-4 w-4" />
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
