'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Image,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Settings,
  Download,
  Eye,
  Zap,
  Palette,
  Layers,
  FileImage,
  AlertTriangle,
  Upload,
  Wand2,
  RotateCcw,
  Loader2,
  Trash2,
  Copy,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

// 图片处理模式类型
type ImageProcessMode = 'translate' | 'optimize' | 'remove_watermark' | 'white_background';

interface ImageTask {
  id: string;
  product_id?: string;
  productName: string;
  type: 'main' | 'background' | 'a-plus' | 'cover' | 'translate';
  platform: 'TK' | 'Amazon';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  complianceStatus: 'passed' | 'failed' | 'checking';
  complianceIssues: string[];
  generatedAt?: string;
  imageUrl?: string;
  processedUrl?: string;
  prompt?: string;
  originalUrl?: string;
  targetLanguage?: string;
  translations?: Array<{ original: string; translated: string; position: string }>;
  analysis?: Record<string, unknown>;
  productDescription?: string;
}

// 调用图片处理API
async function processImage(
  imageUrl: string,
  mode: ImageProcessMode,
  targetLanguage?: string,
  productDescription?: string
) {
  const response = await fetch('/api/ai/process-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      mode,
      target_language: targetLanguage || 'en',
      product_description: productDescription,
    }),
  });
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '图片处理失败');
  }
  return result.data;
}

// 调用图片生成API
// 图片处理结果类型
interface ImageProcessResult {
  processed_url: string;
  original_url?: string;
  translations?: Array<{ original: string; translated: string; position: string }>;
  target_language_name?: string;
  analysis?: Record<string, unknown>;
}

// 调用图片生成API
interface ImageGenerateResult {
  imageUrl: string;
  size: string;
  model: string;
}

// 调用图片生成API
async function generateImage(
  productName: string,
  productDescription?: string,
  style?: string,
  type?: string
): Promise<ImageGenerateResult> {
  // 构建生成提示词
  const prompt = `Professional e-commerce product photography for: ${productName}
${productDescription ? `Product description: ${productDescription}` : ''}
Style: ${style || 'clean, professional, high-end commercial photography'}
Requirements:
- Clean white or neutral background
- Professional studio lighting
- High resolution, sharp details
- Suitable for online marketplace (TikTok Shop / Amazon)
- Eye-catching product presentation`;

  // 调用图片生成API
  const response = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      size: '2K',
      watermark: false,
    }),
  });
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '图片生成失败');
  }
  return {
    imageUrl: result.data.image_url || result.data.image_urls?.[0],
    size: result.data.size || '2K',
    model: result.data.model || 'unknown',
  };
}

export default function ImageDesignPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<ImageTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  
  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ImageTask | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // 创建任务表单
  const [createForm, setCreateForm] = useState({
    product_name: '',
    type: 'main' as 'main' | 'background' | 'a-plus' | 'cover' | 'translate',
    platform: 'TK' as 'TK' | 'Amazon',
    prompt: '',
    image_url: '',
    target_language: 'en',
    product_description: '',
  });
  
  // 支持的语言列表
  const supportedLanguages = [
    { code: 'en', name: 'English (英语)' },
    { code: 'id', name: 'Indonesian (印尼语)' },
    { code: 'th', name: 'Thai (泰语)' },
    { code: 'vi', name: 'Vietnamese (越南语)' },
    { code: 'ms', name: 'Malay (马来语)' },
    { code: 'zh', name: 'Chinese (中文)' },
    { code: 'ja', name: 'Japanese (日语)' },
    { code: 'ko', name: 'Korean (韩语)' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // 模拟获取任务
      const mockTasks: ImageTask[] = [
        {
          id: 'IMG001',
          product_id: 'PROD001',
          productName: '宠物自动喂食器 5L大容量',
          type: 'main',
          platform: 'TK',
          status: 'completed',
          complianceStatus: 'passed',
          complianceIssues: [],
          generatedAt: '2026-03-21 14:30',
          processedUrl: '/images/product-main-1.jpg',
        },
        {
          id: 'IMG002',
          product_id: 'PROD002',
          productName: '便携式榨汁机 USB充电',
          type: 'a-plus',
          platform: 'Amazon',
          status: 'completed',
          complianceStatus: 'passed',
          complianceIssues: [],
          generatedAt: '2026-03-21 13:15',
          processedUrl: '/images/product-aplus-1.jpg',
        },
        {
          id: 'IMG003',
          product_id: 'PROD003',
          productName: 'LED化妆镜 台式带灯',
          type: 'background',
          platform: 'TK',
          status: 'failed',
          complianceStatus: 'failed',
          complianceIssues: ['包含宗教元素', '夸大宣传效果'],
          generatedAt: '2026-03-21 12:00',
        },
        {
          id: 'IMG004',
          product_id: 'PROD004',
          productName: '智能手环 运动监测',
          type: 'cover',
          platform: 'TK',
          status: 'processing',
          complianceStatus: 'checking',
          complianceIssues: [],
          prompt: '运动风格，科技感，蓝白配色',
        },
      ];
      setTasks(mockTasks);
    } catch (error) {
      toast.error('获取任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建图片任务
  const handleCreateTask = async () => {
    if (!createForm.product_name && !createForm.image_url) {
      toast.error('请输入商品名称或提供图片URL');
      return;
    }

    setIsProcessing('create');
    const taskId = `IMG${Date.now()}`;
    
    try {
      const newTask: ImageTask = {
        id: taskId,
        productName: createForm.product_name || '图片翻译任务',
        type: createForm.type,
        platform: createForm.platform,
        status: 'processing',
        complianceStatus: 'checking',
        complianceIssues: [],
        prompt: createForm.prompt,
        imageUrl: createForm.image_url,
        targetLanguage: createForm.target_language,
        productDescription: createForm.product_description,
      };
      
      setTasks([newTask, ...tasks]);
      toast.loading('正在处理...', { id: taskId });
      setIsCreateOpen(false);
      
      // 根据任务类型调用不同的API
      let result: ImageProcessResult | ImageGenerateResult;
      if (createForm.type === 'translate' && createForm.image_url) {
        // 图片翻译
        const processResult = await processImage(
          createForm.image_url,
          'translate',
          createForm.target_language,
          createForm.product_description
        );
        result = processResult;
        
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { 
            ...t, 
            status: 'completed', 
            complianceStatus: 'passed',
            generatedAt: new Date().toLocaleString(),
            processedUrl: (result as ImageProcessResult).processed_url,
            originalUrl: (result as ImageProcessResult).original_url,
            translations: (result as ImageProcessResult).translations,
            prompt: `翻译成 ${(result as ImageProcessResult).target_language_name}`,
          } : t
        ));
        toast.success('图片翻译完成！', { id: taskId });
        
      } else if (createForm.image_url && createForm.type !== 'main') {
        // 图片处理（优化/去水印/白底图）
        const modeMap: Record<string, ImageProcessMode> = {
          background: 'white_background',
          'a-plus': 'optimize',
          cover: 'optimize',
        };
        const processResult = await processImage(
          createForm.image_url,
          modeMap[createForm.type] || 'optimize',
          createForm.target_language
        );
        result = processResult;
        
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { 
            ...t, 
            status: 'completed', 
            complianceStatus: 'passed',
            generatedAt: new Date().toLocaleString(),
            processedUrl: (result as ImageProcessResult).processed_url,
            originalUrl: (result as ImageProcessResult).original_url,
            analysis: (result as ImageProcessResult).analysis,
          } : t
        ));
        toast.success('图片处理完成！', { id: taskId });
        
      } else {
        // AI生成图片
        const genResult = await generateImage(
          createForm.product_name,
          createForm.product_description,
          createForm.prompt
        );
        result = genResult;
        
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { 
            ...t, 
            status: 'completed', 
            complianceStatus: 'passed',
            generatedAt: new Date().toLocaleString(),
            processedUrl: (result as ImageGenerateResult).imageUrl,
            prompt: createForm.prompt || 'AI生成',
          } : t
        ));
        toast.success('图片生成完成！', { id: taskId });
      }
      
      setCreateForm({ 
        product_name: '', 
        type: 'main', 
        platform: 'TK', 
        prompt: '',
        image_url: '',
        target_language: 'en',
        product_description: '',
      });
    } catch (error: any) {
      console.error('创建任务失败:', error);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: 'failed', 
          complianceStatus: 'failed',
          complianceIssues: [error.message || '处理失败'],
        } : t
      ));
      toast.error(error.message || '任务创建失败', { id: taskId });
    } finally {
      setIsProcessing(null);
    }
  };

  // 批量处理
  const handleBatchProcess = async () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      toast.warning('没有待处理的任务');
      return;
    }

    setIsProcessing('batch');
    try {
      // 更新所有pending任务为processing
      setTasks(prev => prev.map(t => 
        t.status === 'pending' ? { ...t, status: 'processing' as const } : t
      ));
      
      toast.success('批量处理已启动', { description: `正在处理 ${pendingTasks.length} 个任务` });
      
      // 模拟批量完成
      setTimeout(() => {
        setTasks(prev => prev.map(t => 
          t.status === 'processing' ? { ...t, status: 'completed' as const, complianceStatus: 'passed' as const, generatedAt: new Date().toLocaleString() } : t
        ));
        toast.success('批量处理完成');
      }, 3000);
    } catch (error) {
      toast.error('批量处理失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 合规检查
  const handleComplianceCheck = async (task: ImageTask) => {
    setSelectedTask(task);
    setIsComplianceOpen(true);
    
    // 模拟检查
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // 重新生成
  const handleRegenerate = async (task: ImageTask) => {
    setIsProcessing(task.id);
    try {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'processing' as const, complianceStatus: 'checking' as const } : t
      ));
      
      toast.success('重新生成中...');
      
      setTimeout(() => {
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'completed' as const, complianceStatus: 'passed' as const, generatedAt: new Date().toLocaleString() } : t
        ));
        toast.success('重新生成完成');
      }, 2000);
    } catch (error) {
      toast.error('重新生成失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 下载图片
  const handleDownload = async (task: ImageTask) => {
    if (!task.processedUrl) {
      toast.warning('暂无可下载的图片');
      return;
    }

    try {
      toast.loading('正在下载...', { id: `download-${task.id}` });
      
      // 使用 fetch + blob 模式下载跨域图片
      const response = await fetch(task.processedUrl);
      if (!response.ok) {
        throw new Error('图片下载失败');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${task.productName}_${task.type}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('下载完成', { id: `download-${task.id}` });
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请稍后重试', { id: `download-${task.id}` });
    }
  };

  // 删除任务
  const handleDeleteTask = async (task: ImageTask) => {
    if (!confirm(`确定要删除任务 "${task.productName}" 吗？`)) return;
    
    setTasks(prev => prev.filter(t => t.id !== task.id));
    toast.success('任务已删除');
  };

  // 查看详情
  const handleViewDetail = (task: ImageTask) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  // 复制Prompt
  const handleCopyPrompt = (task: ImageTask) => {
    if (task.prompt) {
      navigator.clipboard.writeText(task.prompt);
      toast.success('Prompt已复制');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-warning/10 text-warning' },
      processing: { label: '处理中', className: 'bg-purple-500/10 text-purple-600' },
      completed: { label: '已完成', className: 'bg-success/10 text-success' },
      failed: { label: '失败', className: 'bg-destructive/10 text-destructive' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      passed: { label: '合规通过', className: 'bg-success/10 text-success' },
      failed: { label: '合规失败', className: 'bg-destructive/10 text-destructive' },
      checking: { label: '校验中', className: 'bg-warning/10 text-warning' },
    };
    const { label, className } = config[status] || config.checking;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className?: string }> = {
      main: { label: 'AI主图' },
      background: { label: '白底图' },
      'a-plus': { label: 'A+页面' },
      cover: { label: '封面图' },
      translate: { label: '图片翻译', className: 'bg-blue-100 text-blue-800' },
    };
    const item = config[type] || { label: type };
    return <Badge variant="secondary" className={item.className}>{item.label}</Badge>;
  };

  // 统计数据
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const processingTasks = tasks.filter(t => t.status === 'processing').length;
  const compliancePassed = tasks.filter(t => t.complianceStatus === 'passed').length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Image className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">图片设计智能体</h1>
              <p className="text-[14px] text-muted-foreground">AI生图 · 批量处理 · 合规校验 · 跨平台适配</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchTasks}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" onClick={handleBatchProcess} disabled={isProcessing === 'batch'}>
              {isProcessing === 'batch' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              批量处理
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-500/20">
            <Palette className="h-3 w-3 mr-1" />
            AI生图
          </Badge>
          <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-500/20">
            <Shield className="h-3 w-3 mr-1" />
            合规校验
          </Badge>
          <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-500/20">
            <Layers className="h-3 w-3 mr-1" />
            批量处理
          </Badge>
          <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-500/20">
            <FileImage className="h-3 w-3 mr-1" />
            跨平台适配
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">任务总数</div>
              <div className="text-[24px] font-semibold text-foreground">{totalTasks}</div>
              <div className="text-[11px] text-muted-foreground mt-1">图片任务</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已完成</div>
              <div className="text-[24px] font-semibold text-success">{completedTasks}</div>
              <div className="text-[11px] text-muted-foreground mt-1">生成完成</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">处理中</div>
              <div className="text-[24px] font-semibold text-purple-600">{processingTasks}</div>
              <div className="text-[11px] text-muted-foreground mt-1">正在生成</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">合规通过</div>
              <div className="text-[24px] font-semibold text-success">{compliancePassed}</div>
              <div className="text-[11px] text-muted-foreground mt-1">符合规范</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">680</div>
              <div className="text-[11px] text-muted-foreground mt-1">豆包-Vision</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tasks">任务列表</TabsTrigger>
            <TabsTrigger value="compliance">合规检查</TabsTrigger>
            <TabsTrigger value="templates">模板库</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 任务列表 */}
          <TabsContent value="tasks" className="space-y-4">
            {/* 筛选条件 */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索商品名称..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px]">
                    <option value="">全部类型</option>
                    <option value="main">主图</option>
                    <option value="background">背景图</option>
                    <option value="a-plus">A+页面</option>
                    <option value="cover">封面图</option>
                  </select>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px]">
                    <option value="">全部状态</option>
                    <option value="pending">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="completed">已完成</option>
                    <option value="failed">失败</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* 任务列表 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">图片任务</CardTitle>
                <CardDescription>支持主图、A+页面、背景图、封面图等多种类型</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    加载中...
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">暂无任务数据</div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              {task.status === 'completed' ? (
                                <Image className="h-8 w-8 text-success" />
                              ) : task.status === 'processing' ? (
                                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                              ) : (
                                <FileImage className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-foreground">{task.productName}</span>
                                {getTypeBadge(task.type)}
                                <Badge variant="outline">{task.platform}</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                {getStatusBadge(task.status)}
                                {getComplianceBadge(task.complianceStatus)}
                              </div>
                              {task.prompt && (
                                <div className="text-[12px] text-muted-foreground">
                                  Prompt: {task.prompt}
                                </div>
                              )}
                              {task.complianceIssues.length > 0 && (
                                <div className="flex items-center gap-1 text-[12px] text-destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                  {task.complianceIssues.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetail(task)}>
                              <Eye className="h-3 w-3 mr-1" />
                              详情
                            </Button>
                            {task.status === 'completed' && (
                              <Button variant="outline" size="sm" onClick={() => handleDownload(task)}>
                                <Download className="h-3 w-3 mr-1" />
                                下载
                              </Button>
                            )}
                            {(task.status === 'failed' || task.complianceStatus === 'failed') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRegenerate(task)}
                                disabled={isProcessing === task.id}
                              >
                                {isProcessing === task.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                )}
                                重试
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleComplianceCheck(task)}>
                              <Shield className="h-3 w-3 mr-1" />
                              合规
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => handleDeleteTask(task)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 合规检查 */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">图片合规校验</CardTitle>
                <CardDescription>TK/Amazon平台图片规范自动校验</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">TK主图规范</div>
                      <div className="text-[12px] text-muted-foreground">纯白背景、无水印、无Logo、无夸大宣传</div>
                    </div>
                    <Badge className="bg-success/10 text-success">通过率 98.5%</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">Amazon A+页面规范</div>
                      <div className="text-[12px] text-muted-foreground">品牌授权、图片尺寸、文字规范</div>
                    </div>
                    <Badge className="bg-success/10 text-success">通过率 97.2%</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">宗教/敏感元素检测</div>
                      <div className="text-[12px] text-muted-foreground">TK东南亚站点专属：自动检测宗教/敏感元素</div>
                    </div>
                    <Badge className="bg-warning/10 text-warning">检测中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 模板库 */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="text-[14px] font-medium">电商主图模板</div>
                  <div className="text-[12px] text-muted-foreground">适用于TK/Amazon主图</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Layers className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="text-[14px] font-medium">A+页面模板</div>
                  <div className="text-[12px] text-muted-foreground">Amazon品牌详情页</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <FileImage className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="text-[14px] font-medium">短视频封面模板</div>
                  <div className="text-[12px] text-muted-foreground">TK短视频封面设计</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 配置设置 */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">智能体配置</CardTitle>
                <CardDescription>模型选择、Prompt模板、处理参数配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">当前使用豆包-Vision进行图片处理</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px]">
                      <option value="doubao-vision">豆包-Vision</option>
                      <option value="gpt-4-vision">GPT-4 Vision</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">Prompt模板</div>
                      <div className="text-[11px] text-muted-foreground">图片生成Prompt模板管理</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      编辑模板
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 创建任务对话框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>新建图片任务</DialogTitle>
              <DialogDescription>
                {createForm.type === 'translate' ? '上传图片进行多语言翻译' : '使用AI生成或处理商品图片'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium">任务类型</label>
                <select 
                  className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                >
                  <option value="main">AI生成主图</option>
                  <option value="background">白底背景图</option>
                  <option value="a-plus">图片优化</option>
                  <option value="cover">封面图</option>
                  <option value="translate">图片翻译</option>
                </select>
              </div>
              
              {createForm.type === 'translate' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">图片URL *</label>
                    <Input
                      placeholder="请输入要翻译的图片URL"
                      value={createForm.image_url}
                      onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      请输入可公开访问的图片链接
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium">目标语言</label>
                      <select 
                        className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                        value={createForm.target_language}
                        onChange={(e) => setCreateForm({ ...createForm, target_language: e.target.value })}
                      >
                        {supportedLanguages.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium">目标平台</label>
                      <select 
                        className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                        value={createForm.platform}
                        onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value as any })}
                      >
                        <option value="TK">TikTok</option>
                        <option value="Amazon">Amazon</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">图片描述（可选）</label>
                    <Input
                      placeholder="描述图片内容或产品信息"
                      value={createForm.product_description}
                      onChange={(e) => setCreateForm({ ...createForm, product_description: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">商品名称 *</label>
                    <Input
                      placeholder="请输入商品名称"
                      value={createForm.product_name}
                      onChange={(e) => setCreateForm({ ...createForm, product_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">图片URL（可选）</label>
                    <Input
                      placeholder="如已有图片，可输入URL进行处理"
                      value={createForm.image_url}
                      onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      不填则由AI根据商品名称生成图片
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium">图片类型</label>
                      <select 
                        className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                        value={createForm.type}
                        onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                      >
                        <option value="main">主图</option>
                        <option value="background">背景图</option>
                        <option value="a-plus">A+页面</option>
                        <option value="cover">封面图</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium">目标平台</label>
                      <select 
                        className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                        value={createForm.platform}
                        onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value as any })}
                      >
                        <option value="TK">TikTok</option>
                        <option value="Amazon">Amazon</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">生成提示词</label>
                    <Input
                      placeholder="描述你想要的图片风格..."
                      value={createForm.prompt}
                      onChange={(e) => setCreateForm({ ...createForm, prompt: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreateTask} disabled={isProcessing === 'create'}>
                {isProcessing === 'create' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    开始处理
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>任务详情 - {selectedTask?.productName}</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4">
                {/* 图片展示 */}
                <div className="space-y-2">
                  <div className="text-[13px] font-medium">处理结果</div>
                  {selectedTask.processedUrl ? (
                    <div className="border border-border rounded-lg overflow-hidden">
                      {selectedTask.originalUrl && selectedTask.originalUrl !== selectedTask.processedUrl && (
                        <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50">
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1">原图</div>
                            <img 
                              src={selectedTask.originalUrl} 
                              alt="原图" 
                              className="w-full h-32 object-contain rounded bg-white"
                            />
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1">处理后</div>
                            <img 
                              src={selectedTask.processedUrl} 
                              alt="处理后" 
                              className="w-full h-32 object-contain rounded bg-white"
                            />
                          </div>
                        </div>
                      )}
                      {!selectedTask.originalUrl || selectedTask.originalUrl === selectedTask.processedUrl ? (
                        <img 
                          src={selectedTask.processedUrl} 
                          alt="生成的图片" 
                          className="w-full h-64 object-contain bg-white"
                        />
                      ) : null}
                    </div>
                  ) : selectedTask.status === 'processing' ? (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <FileImage className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* 翻译结果 */}
                {selectedTask.translations && selectedTask.translations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[13px] font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      翻译结果
                      <Badge variant="outline" className="text-[10px]">
                        {selectedTask.targetLanguage?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      {selectedTask.translations.map((t, index) => (
                        <div key={index} className="flex items-start gap-3 text-[12px]">
                          <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-muted-foreground">{t.original}</div>
                            <div className="text-foreground font-medium">→ {t.translated}</div>
                            <div className="text-[10px] text-muted-foreground/70">位置: {t.position}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">状态</div>
                    <div>{getStatusBadge(selectedTask.status)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">合规</div>
                    <div>{getComplianceBadge(selectedTask.complianceStatus)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">图片类型</div>
                    <div>{getTypeBadge(selectedTask.type)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">平台</div>
                    <div><Badge variant="outline">{selectedTask.platform}</Badge></div>
                  </div>
                </div>
                {selectedTask.prompt && (
                  <div>
                    <div className="text-[12px] text-muted-foreground">提示词</div>
                    <div className="text-[14px] bg-muted/30 rounded p-2">{selectedTask.prompt}</div>
                  </div>
                )}
                {selectedTask.generatedAt && (
                  <div>
                    <div className="text-[12px] text-muted-foreground">生成时间</div>
                    <div className="text-[14px]">{selectedTask.generatedAt}</div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>关闭</Button>
              {selectedTask?.status === 'completed' && selectedTask?.processedUrl && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (selectedTask?.processedUrl) {
                        const link = document.createElement('a');
                        link.href = selectedTask.processedUrl;
                        link.download = `image_${selectedTask.id}.jpg`;
                        link.target = '_blank';
                        link.click();
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 合规检查对话框 */}
        <Dialog open={isComplianceOpen} onOpenChange={setIsComplianceOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>合规检查结果</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center">
                  {selectedTask.complianceStatus === 'passed' ? (
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-success" />
                    </div>
                  ) : selectedTask.complianceStatus === 'failed' ? (
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-destructive" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-warning animate-spin" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-[16px] font-semibold">
                    {selectedTask.complianceStatus === 'passed' ? '合规通过' : 
                     selectedTask.complianceStatus === 'failed' ? '存在合规问题' : '检查中'}
                  </div>
                </div>
                {selectedTask.complianceIssues.length > 0 && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <div className="text-[12px] font-medium text-destructive mb-2">检测到以下问题：</div>
                    <ul className="text-[12px] text-muted-foreground space-y-1">
                      {selectedTask.complianceIssues.map((issue, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComplianceOpen(false)}>关闭</Button>
              {selectedTask?.complianceStatus === 'failed' && (
                <Button onClick={() => handleRegenerate(selectedTask)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重新生成
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
