'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Trash2,
  Copy,
  History,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface PromptTemplate {
  id: string;
  name: string;
  agent: string;
  platform: string;
  status: 'enabled' | 'disabled';
  version: string;
  createdAt: string;
  updatedAt: string;
  abTestGroup?: string;
}

const agentCategories = [
  { id: 'selection', label: '选品Prompt', icon: '🔍' },
  { id: 'image', label: '图片设计Prompt', icon: '🖼️' },
  { id: 'video', label: '短视频Prompt', icon: '🎬' },
  { id: 'listing', label: 'Listing优化Prompt', icon: '📝' },
  { id: 'advertising', label: '广告Prompt', icon: '📢' },
  { id: 'customer', label: '客服Prompt', icon: '💬' },
  { id: 'review', label: '复盘Prompt', icon: '📊' },
];

export default function PromptsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

  const [prompts, setPrompts] = useState<PromptTemplate[]>([
    {
      id: 'P001',
      name: 'TK东南亚选品分析模板',
      agent: '选品智能体',
      platform: 'TK东南亚',
      status: 'enabled',
      version: 'v2.1',
      createdAt: '2024-02-18 14:30',
      updatedAt: '2024-02-20 09:15',
      abTestGroup: 'A组',
    },
    {
      id: 'P002',
      name: '亚马逊美国站选品模板',
      agent: '选品智能体',
      platform: '亚马逊',
      status: 'enabled',
      version: 'v1.8',
      createdAt: '2024-02-15 10:20',
      updatedAt: '2024-02-19 16:45',
    },
    {
      id: 'P003',
      name: 'TK主图设计Prompt',
      agent: '图片设计智能体',
      platform: 'TK东南亚',
      status: 'enabled',
      version: 'v1.5',
      createdAt: '2024-02-12 08:00',
      updatedAt: '2024-02-18 11:30',
    },
    {
      id: 'P004',
      name: '亚马逊A+页面设计模板',
      agent: '图片设计智能体',
      platform: '亚马逊',
      status: 'disabled',
      version: 'v1.0',
      createdAt: '2024-02-10 15:45',
      updatedAt: '2024-02-10 15:45',
    },
    {
      id: 'P005',
      name: 'TK短视频带货脚本',
      agent: '视频生成智能体',
      platform: 'TK东南亚',
      status: 'enabled',
      version: 'v2.0',
      createdAt: '2024-02-08 12:00',
      updatedAt: '2024-02-17 14:20',
      abTestGroup: 'B组',
    },
    {
      id: 'P006',
      name: 'Listing标题优化模板',
      agent: 'Listing优化智能体',
      platform: 'TK/亚马逊',
      status: 'enabled',
      version: 'v3.2',
      createdAt: '2024-02-05 09:30',
      updatedAt: '2024-02-20 10:00',
    },
    {
      id: 'P007',
      name: 'TK广告投放策略Prompt',
      agent: '广告投放智能体',
      platform: 'TK Ads',
      status: 'enabled',
      version: 'v1.3',
      createdAt: '2024-02-03 16:20',
      updatedAt: '2024-02-16 08:45',
    },
    {
      id: 'P008',
      name: '印尼语客服回复模板',
      agent: 'AI客服智能体',
      platform: 'TK印尼',
      status: 'enabled',
      version: 'v2.5',
      createdAt: '2024-02-01 11:15',
      updatedAt: '2024-02-19 17:30',
      abTestGroup: 'A组',
    },
    {
      id: 'P009',
      name: '周度数据复盘模板',
      agent: '数据复盘智能体',
      platform: '全平台',
      status: 'enabled',
      version: 'v1.1',
      createdAt: '2024-01-28 14:00',
      updatedAt: '2024-02-15 09:00',
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

  const filteredPrompts = prompts.filter((prompt) => {
    const matchSearch =
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === 'all') return matchSearch;
    
    const categoryMap: Record<string, string> = {
      selection: '选品智能体',
      image: '图片设计智能体',
      video: '视频生成智能体',
      listing: 'Listing优化智能体',
      advertising: '广告投放智能体',
      customer: 'AI客服智能体',
      review: '数据复盘智能体',
    };
    
    return matchSearch && prompt.agent === categoryMap[activeCategory];
  });

  const handleToggleStatus = (promptId: string) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId
          ? { ...p, status: p.status === 'enabled' ? 'disabled' : 'enabled' }
          : p
      )
    );
    toast.success('状态已更新');
  };

  const handleDeletePrompt = (promptId: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    toast.success('模板已删除');
  };

  const handleCopyPrompt = (prompt: PromptTemplate) => {
    const newPrompt: PromptTemplate = {
      ...prompt,
      id: `P${String(prompts.length + 1).padStart(3, '0')}`,
      name: `${prompt.name} (副本)`,
      status: 'disabled',
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    setPrompts((prev) => [...prev, newPrompt]);
    toast.success('模板已复制');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">Prompt中心管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              七大智能体Prompt模板 · 版本管控 · AB测试
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPrompt(null)}>
                <Plus className="h-4 w-4 mr-2" />
                新增模板
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPrompt ? '编辑Prompt模板' : '新增Prompt模板'}</DialogTitle>
                <DialogDescription>
                  配置智能体Prompt模板，支持变量插入和AB测试
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">模板名称</Label>
                  <Input
                    id="name"
                    placeholder="请输入模板名称"
                    className="col-span-3"
                    defaultValue={editingPrompt?.name || ''}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="agent" className="text-right">绑定智能体</Label>
                  <Select defaultValue={editingPrompt?.agent || ''}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择智能体" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="选品智能体">选品智能体</SelectItem>
                      <SelectItem value="图片设计智能体">图片设计智能体</SelectItem>
                      <SelectItem value="视频生成智能体">视频生成智能体</SelectItem>
                      <SelectItem value="Listing优化智能体">Listing优化智能体</SelectItem>
                      <SelectItem value="广告投放智能体">广告投放智能体</SelectItem>
                      <SelectItem value="AI客服智能体">AI客服智能体</SelectItem>
                      <SelectItem value="数据复盘智能体">数据复盘智能体</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="platform" className="text-right">适用平台</Label>
                  <Select defaultValue={editingPrompt?.platform || ''}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TK东南亚">TK东南亚</SelectItem>
                      <SelectItem value="TK印尼">TK印尼</SelectItem>
                      <SelectItem value="TK泰国">TK泰国</SelectItem>
                      <SelectItem value="TK越南">TK越南</SelectItem>
                      <SelectItem value="亚马逊">亚马逊</SelectItem>
                      <SelectItem value="TK/亚马逊">TK/亚马逊</SelectItem>
                      <SelectItem value="全平台">全平台</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="abTest" className="text-right">AB测试分组</Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="不参与AB测试" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">不参与AB测试</SelectItem>
                      <SelectItem value="A">A组</SelectItem>
                      <SelectItem value="B">B组</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">Prompt内容</Label>
                  <div className="col-span-3 space-y-2">
                    <Textarea
                      id="content"
                      placeholder="请输入Prompt内容，可使用 {{变量名}} 插入动态变量"
                      className="min-h-[200px] font-mono text-[13px]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-muted-foreground">快速插入变量：</span>
                      <Button variant="outline" size="sm" className="h-6 text-[11px]">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {'{{商品名称}}'}
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-[11px]">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {'{{平台}}'}
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-[11px]">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {'{{用户语言}}'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="versionNote" className="text-right">版本备注</Label>
                  <Input
                    id="versionNote"
                    placeholder="如：优化了合规校验逻辑"
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

        {/* 分类导航栏 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 border-b border-border rounded-none">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
                >
                  全部
                </TabsTrigger>
                {agentCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* 搜索区 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="relative max-w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模板名称/ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Prompt模板列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-medium">模板列表</CardTitle>
              <span className="text-[13px] text-muted-foreground">
                共 {filteredPrompts.length} 个模板
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30">
                  <TableHead className="text-[12px] font-medium text-muted-foreground px-6">模板ID</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">模板名称</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">绑定智能体</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">版本</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">AB测试</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">更新时间</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map((prompt) => (
                  <TableRow key={prompt.id} className="border-border hover:bg-muted/30">
                    <TableCell className="text-[13px] font-medium text-primary px-6">
                      {prompt.id}
                    </TableCell>
                    <TableCell className="text-[13px] text-foreground font-medium">
                      {prompt.name}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {prompt.agent}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {prompt.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          prompt.status === 'enabled'
                            ? 'bg-success text-white'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {prompt.status === 'enabled' ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {prompt.version}
                    </TableCell>
                    <TableCell>
                      {prompt.abTestGroup ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {prompt.abTestGroup}
                        </Badge>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {prompt.updatedAt}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPrompt(prompt);
                            setIsDialogOpen(true);
                          }}
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPrompt(prompt)}
                          title="复制"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(prompt.id)}
                          title={prompt.status === 'enabled' ? '禁用' : '启用'}
                        >
                          {prompt.status === 'enabled' ? (
                            <ToggleRight className="h-4 w-4 text-success" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="版本历史"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePrompt(prompt.id)}
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
