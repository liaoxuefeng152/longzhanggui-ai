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
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  Prompt,
  PromptCreate,
  PromptUpdate,
} from '@/lib/api/prompts';
import { logout } from '@/lib/api/auth';

const agentCategories = [
  { id: 'product-selection', label: '选品Prompt', icon: '🔍' },
  { id: 'image-design', label: '图片设计Prompt', icon: '🖼️' },
  { id: 'video-generation', label: '短视频Prompt', icon: '🎬' },
  { id: 'listing-optimization', label: 'Listing优化Prompt', icon: '📝' },
  { id: 'advertising', label: '广告Prompt', icon: '📢' },
  { id: 'customer-service', label: '客服Prompt', icon: '💬' },
  { id: 'data-review', label: '复盘Prompt', icon: '📊' },
];

export default function PromptsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState<PromptCreate>({
    name: '',
    category: 'general',
    agent_type: 'product-selection',
    platform: 'all',
    content: '',
    variables: {},
  });

  // 获取Prompt列表
  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await getPrompts({ page: 1, page_size: 100 });
      setPrompts(response.items);
    } catch (error) {
      console.error('获取Prompt列表失败:', error);
      toast.error('获取Prompt列表失败');
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
    fetchPrompts();
  }, [router]);

  // 过滤Prompt
  const filteredPrompts = prompts.filter((prompt) => {
    const matchSearch =
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === 'all') return matchSearch;
    
    return matchSearch && prompt.agent_type === activeCategory;
  });

  // 切换状态
  const handleToggleStatus = async (prompt: Prompt) => {
    try {
      const newStatus = prompt.status === 'active' ? 'inactive' : 'active';
      await updatePrompt(prompt.id, { status: newStatus });
      toast.success('状态已更新');
      fetchPrompts();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  // 删除Prompt
  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('确定要删除该Prompt模板吗？')) return;
    try {
      await deletePrompt(promptId);
      toast.success('模板已删除');
      fetchPrompts();
    } catch (error) {
      console.error('删除模板失败:', error);
      toast.error('删除模板失败');
    }
  };

  // 复制Prompt
  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      await createPrompt({
        name: `${prompt.name} (副本)`,
        category: prompt.category || 'general',
        agent_type: prompt.agent_type,
        platform: prompt.platform,
        content: prompt.content,
        variables: prompt.variables || {},
      });
      toast.success('模板已复制');
      fetchPrompts();
    } catch (error) {
      console.error('复制模板失败:', error);
      toast.error('复制模板失败');
    }
  };

  // 编辑Prompt
  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      category: prompt.category || 'general',
      agent_type: prompt.agent_type,
      platform: prompt.platform,
      content: prompt.content,
      variables: prompt.variables || {},
    });
    setIsDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setEditingPrompt(null);
    setFormData({
      name: '',
      category: 'general',
      agent_type: 'product-selection',
      platform: 'all',
      content: '',
      variables: {},
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.name || !formData.content) {
      toast.error('请填写必填项');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPrompt) {
        // 更新
        const updateData: PromptUpdate = {
          name: formData.name,
          category: formData.category,
          agent_type: formData.agent_type,
          platform: formData.platform,
          content: formData.content,
          variables: formData.variables,
        };
        await updatePrompt(editingPrompt.id, updateData);
        toast.success('模板已更新');
      } else {
        // 创建
        await createPrompt(formData);
        toast.success('模板已创建');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchPrompts();
    } catch (error) {
      console.error('保存模板失败:', error);
      toast.error('保存模板失败');
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
            <h1 className="text-[18px] font-semibold text-foreground">Prompt中心管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              七大智能体Prompt模板 · 版本管控 · AB测试
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
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
                  <Label htmlFor="name" className="text-right">模板名称 <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="请输入模板名称"
                    className="col-span-3"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="agent_type" className="text-right">绑定智能体</Label>
                  <Select value={formData.agent_type} onValueChange={(v) => setFormData({ ...formData, agent_type: v })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择智能体" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="platform" className="text-right">适用平台</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全平台</SelectItem>
                      <SelectItem value="tiktok">TK东南亚</SelectItem>
                      <SelectItem value="tiktok-id">TK印尼</SelectItem>
                      <SelectItem value="tiktok-th">TK泰国</SelectItem>
                      <SelectItem value="tiktok-vn">TK越南</SelectItem>
                      <SelectItem value="amazon">亚马逊</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">Prompt内容 <span className="text-destructive">*</span></Label>
                  <div className="col-span-3 space-y-2">
                    <Textarea
                      id="content"
                      placeholder="请输入Prompt内容，可使用 {{变量名}} 插入动态变量"
                      className="min-h-[200px] font-mono text-[13px]"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-muted-foreground">快速插入变量：</span>
                      <Button variant="outline" size="sm" className="h-6 text-[11px]"
                        onClick={() => setFormData({ ...formData, content: formData.content + '{{商品名称}}' })}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        {'{{商品名称}}'}
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-[11px]"
                        onClick={() => setFormData({ ...formData, content: formData.content + '{{平台}}' })}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        {'{{平台}}'}
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-[11px]"
                        onClick={() => setFormData({ ...formData, content: formData.content + '{{用户语言}}' })}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        {'{{用户语言}}'}
                      </Button>
                    </div>
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
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模板名称/ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={fetchPrompts} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无Prompt模板数据
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">模板ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">模板名称</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">绑定智能体</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">版本</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">更新时间</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrompts.map((prompt) => (
                    <TableRow key={prompt.id} className="border-border hover:bg-muted/30">
                      <TableCell className="text-[13px] font-medium text-primary px-6">
                        {prompt.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground font-medium">
                        {prompt.name}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {agentCategories.find(c => c.id === prompt.agent_type)?.label || prompt.agent_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">
                          {prompt.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            prompt.status === 'active'
                              ? 'bg-success text-white'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {prompt.status === 'active' ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        v{prompt.version}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {new Date(prompt.updated_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPrompt(prompt)}
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
                            onClick={() => handleToggleStatus(prompt)}
                            title={prompt.status === 'active' ? '禁用' : '启用'}
                          >
                            {prompt.status === 'active' ? (
                              <ToggleRight className="h-4 w-4 text-success" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
