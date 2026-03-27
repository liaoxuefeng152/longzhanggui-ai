'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { processImage, batchProcessImages, ImageProcessResult, ImageProcessMode } from '@/lib/api/ai-agents';

interface ImageTask {
  id: string;
  productName: string;
  type: 'main' | 'background' | 'a-plus' | 'cover';
  platform: 'TK' | 'Amazon';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  complianceStatus: 'passed' | 'failed' | 'checking';
  complianceIssues: string[];
  generatedAt?: string;
  imageUrl?: string;
  processedUrl?: string;
  // AI分析结果
  mode?: string;
  modeLabel?: string;
  analysis?: Record<string, any>;
  aiResponse?: string;
}

const mockImageTasks: ImageTask[] = [
  {
    id: 'IMG001',
    productName: '宠物自动喂食器 5L大容量',
    type: 'main',
    platform: 'TK',
    status: 'completed',
    complianceStatus: 'passed',
    complianceIssues: [],
    generatedAt: '2026-03-21 14:30',
    imageUrl: '/placeholder-main.jpg',
  },
  {
    id: 'IMG002',
    productName: '便携式榨汁机 USB充电',
    type: 'a-plus',
    platform: 'Amazon',
    status: 'completed',
    complianceStatus: 'passed',
    complianceIssues: [],
    generatedAt: '2026-03-21 13:15',
    imageUrl: '/placeholder-aplus.jpg',
  },
  {
    id: 'IMG003',
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
    productName: '智能手环 运动监测',
    type: 'cover',
    platform: 'TK',
    status: 'processing',
    complianceStatus: 'checking',
    complianceIssues: [],
  },
];

const complianceRules = [
  { id: 'ICR001', name: 'TK宗教/政治元素过滤', status: 'active', checkCount: 890, passRate: 99.5 },
  { id: 'ICR002', name: '亚马逊夸大宣传图过滤', status: 'active', checkCount: 720, passRate: 98.2 },
  { id: 'ICR003', name: '图片尺寸/格式校验', status: 'active', checkCount: 1610, passRate: 100 },
  { id: 'ICR004', name: '诱导好评图过滤', status: 'active', checkCount: 720, passRate: 99.8 },
];

export default function ImageAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'processing'>('online');
  const [imageTasks, setImageTasks] = useState<ImageTask[]>(mockImageTasks);
  const [imageUrl, setImageUrl] = useState('');
  const [processMode, setProcessMode] = useState<ImageProcessMode>('translate');
  const [targetLanguage, setTargetLanguage] = useState('th'); // 默认泰语
  const [availableLanguages, setAvailableLanguages] = useState<{code: string, name: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 预览对话框状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTask, setPreviewTask] = useState<ImageTask | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    // 获取支持的语言列表
    fetch('/api/ai/process-image')
      .then(res => res.json())
      .then(data => {
        if (data.languages) {
          setAvailableLanguages(data.languages);
        }
      })
      .catch(err => console.error('获取语言列表失败:', err));
  }, [router]);

  // 处理图片
  const handleProcessImage = async () => {
    if (!imageUrl) {
      toast.error('请先输入图片URL');
      setActiveTab('tasks'); // 自动切换到任务Tab
      return;
    }

    setIsProcessing(true);
    setAgentStatus('processing');

    try {
      const result = await processImage({
        image_url: imageUrl,
        mode: processMode,
        source_language: 'zh',
        target_language: targetLanguage,
      });

      if (result.success && result.data) {
        // 更新任务列表
        const newTask: ImageTask = {
          id: result.data.task_id,
          productName: result.data.mode_label || '图片处理',
          type: 'main',
          platform: 'TK',
          status: result.data.status === 'completed' ? 'completed' : 'processing',
          complianceStatus: 'passed',
          complianceIssues: [],
          generatedAt: new Date().toLocaleString('zh-CN'),
          imageUrl: imageUrl,
          processedUrl: result.data.processed_url,
          mode: result.data.mode,
          modeLabel: result.data.mode_label,
          analysis: result.data.analysis,
          aiResponse: result.data.ai_response,
        };
        setImageTasks([newTask, ...imageTasks]);
        toast.success(`${result.data.mode_label || '图片处理'}完成！`);
        setImageUrl('');
      } else {
        toast.error('图片处理失败，请重试');
      }
    } catch (error: any) {
      console.error('图片处理失败:', error);
      toast.error(error.message || '图片处理失败');
    } finally {
      setIsProcessing(false);
      setAgentStatus('online');
    }
  };

  // 预览图片
  const handlePreview = (task: ImageTask) => {
    if (task.status !== 'completed') {
      toast.error('任务未完成，无法预览');
      return;
    }
    setPreviewTask(task);
    setPreviewScale(1);
    setPreviewOpen(true);
  };

  // 下载图片
  const handleDownload = async (task: ImageTask) => {
    if (task.status !== 'completed') {
      toast.error('任务未完成，无法下载');
      return;
    }
    
    const downloadUrl = task.processedUrl || task.imageUrl;
    if (!downloadUrl) {
      toast.error('没有可下载的图片');
      return;
    }

    setIsDownloading(task.id);
    try {
      // 使用 fetch + blob 模式下载，支持跨域
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('下载失败');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${task.productName}_${task.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 释放 blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('图片已下载');
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('图片下载失败，请重试');
    } finally {
      setIsDownloading(null);
    }
  };

  // 重新生成
  const handleRegenerate = (task: ImageTask) => {
    toast.info('正在重新生成图片...');
    // 更新任务状态为处理中
    setImageTasks(imageTasks.map(t => 
      t.id === task.id ? { ...t, status: 'processing' as const, complianceStatus: 'checking' as const } : t
    ));
    
    // 模拟重新生成
    setTimeout(() => {
      setImageTasks(imageTasks.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: 'completed' as const, 
          complianceStatus: 'passed' as const,
          generatedAt: new Date().toLocaleString('zh-CN'),
        } : t
      ));
      toast.success('图片重新生成成功');
    }, 2000);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      main: '主图',
      background: '背景替换',
      'a-plus': 'A+页面',
      cover: '视频封面',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-muted text-muted-foreground' },
      processing: { label: '生成中', className: 'bg-primary/10 text-primary border-primary/20' },
      completed: { label: '已完成', className: 'bg-success/10 text-success border-success/20' },
      failed: { label: '失败', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      passed: { label: '合规通过', className: 'bg-success/10 text-success border-success/20' },
      failed: { label: '合规失败', className: 'bg-destructive/10 text-destructive border-destructive/20' },
      checking: { label: '校验中', className: 'bg-warning/10 text-warning border-warning/20' },
    };
    const { label, className } = config[status] || config.checking;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Image className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">图片设计智能体</h1>
              <p className="text-[14px] text-muted-foreground">主图生成 · 背景替换 · A+页面设计 · 图片合规校验</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={agentStatus === 'online' ? 'bg-success text-white' : 'bg-warning text-white'}>
              {agentStatus === 'online' ? '在线运行' : agentStatus === 'processing' ? '处理中' : '离线'}
            </Badge>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button onClick={handleProcessImage} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  处理图片
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            合规校验
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Palette className="h-3 w-3 mr-1" />
            AI生成
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Layers className="h-3 w-3 mr-1" />
            背景替换
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <FileImage className="h-3 w-3 mr-1" />
            A+设计
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日设计</div>
              <div className="text-[24px] font-semibold text-foreground">89</div>
              <div className="text-[11px] text-success mt-1">↑ 15% vs 昨日</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">合规通过率</div>
              <div className="text-[24px] font-semibold text-success">97.2%</div>
              <div className="text-[11px] text-muted-foreground mt-1">自动重试≤2次</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">TK主图</div>
              <div className="text-[24px] font-semibold text-foreground">45</div>
              <div className="text-[11px] text-muted-foreground mt-1">含视频封面</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">亚马逊A+</div>
              <div className="text-[24px] font-semibold text-foreground">23</div>
              <div className="text-[11px] text-muted-foreground mt-1">含6附图</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">1,620</div>
              <div className="text-[11px] text-muted-foreground mt-1">豆包-Seed-1.8</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tasks">设计任务</TabsTrigger>
            <TabsTrigger value="compliance">合规校验</TabsTrigger>
            <TabsTrigger value="templates">设计模板</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 设计任务 */}
          <TabsContent value="tasks" className="space-y-4">
            {/* 图片处理输入 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">图片处理</CardTitle>
                <CardDescription>输入图片URL，选择处理模式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="输入图片URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setImageUrl('https://coze-coding-project.tos.coze.site/coze_storage_7608954168073814022/image/generate_image_d1e6b0ad-1978-48f3-bf60-3ec3a77e021e.jpeg?sign=1806182168-96989f516b-0-ef9561ab93d1fb763cac1eea349143c8ad28e5bcc613a0f2b6820c49dc800755')}
                  >
                    中文翻译测试
                  </Button>
                  <select 
                    className="px-4 py-2 border border-border rounded-md text-[14px]"
                    value={processMode}
                    onChange={(e) => setProcessMode(e.target.value as ImageProcessMode)}
                  >
                    <option value="translate">翻译模式</option>
                    <option value="optimize">优化模式</option>
                    <option value="remove_watermark">去水印</option>
                    <option value="white_background">白底图</option>
                  </select>
                  {/* 目标语言选择 - 仅翻译模式显示 */}
                  {processMode === 'translate' && (
                    <select 
                      className="px-4 py-2 border border-border rounded-md text-[14px] bg-primary/5"
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                    >
                      {availableLanguages.length > 0 ? (
                        availableLanguages.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="th">Thai (泰语)</option>
                          <option value="vi">Vietnamese (越南语)</option>
                          <option value="id">Indonesian (印尼语)</option>
                          <option value="ms">Malay (马来语)</option>
                          <option value="en">English</option>
                          <option value="pt">Portuguese (葡萄牙语)</option>
                          <option value="es">Spanish (西班牙语)</option>
                          <option value="ja">Japanese (日语)</option>
                          <option value="ko">Korean (韩语)</option>
                          <option value="ar">Arabic (阿拉伯语)</option>
                        </>
                      )}
                    </select>
                  )}
                  <Button onClick={handleProcessImage} disabled={isProcessing || !imageUrl}>
                    {isProcessing ? (
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
                </div>
                
                {/* 翻译模式说明 */}
                {processMode === 'translate' && (
                  <div className="p-3 bg-primary/5 rounded-lg text-[12px] text-muted-foreground">
                    <strong className="text-primary">图片翻译说明：</strong>
                    将自动识别图片中的中文文字，翻译成目标语言，并生成新的图片。文字位置和样式会尽量保持一致。
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 操作栏 */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索商品名称..."
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">全部类型</option>
                    <option value="main">主图</option>
                    <option value="background">背景替换</option>
                    <option value="a-plus">A+页面</option>
                    <option value="cover">视频封面</option>
                  </select>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">全部状态</option>
                    <option value="completed">已完成</option>
                    <option value="processing">生成中</option>
                    <option value="failed">失败</option>
                    <option value="pending">待处理</option>
                  </select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    批量导出
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 任务列表 */}
            <div className="grid grid-cols-2 gap-4">
              {imageTasks.map((task) => (
                <Card key={task.id} className="bg-white border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {task.status === 'processing' ? (
                          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                        ) : task.status === 'failed' ? (
                          <AlertTriangle className="h-10 w-10 text-destructive" />
                        ) : (task.processedUrl || task.imageUrl) ? (
                          <img 
                            src={task.processedUrl || task.imageUrl} 
                            alt={task.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 图片加载失败时显示占位图标
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<svg class="h-10 w-10 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                              }
                            }}
                          />
                        ) : (
                          <Image className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-foreground">{task.productName}</span>
                            <Badge variant="outline" className="text-[11px]">{getTypeLabel(task.type)}</Badge>
                            <Badge variant="outline" className="text-[11px]">{task.platform}</Badge>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          {getComplianceBadge(task.complianceStatus)}
                          {task.complianceIssues.length > 0 && (
                            <span className="text-[11px] text-destructive">
                              问题: {task.complianceIssues.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ID: {task.id} · {task.generatedAt || '生成中...'}
                          {task.modeLabel && <span className="ml-2 text-primary">· {task.modeLabel}</span>}
                        </div>
                        
                        {/* AI分析结果摘要 */}
                        {task.status === 'completed' && task.analysis && (
                          <div className="mt-2 p-2 bg-primary/5 rounded text-[11px]">
                            {/* 翻译结果显示 */}
                            {task.analysis.translations && task.analysis.translations.length > 0 && (
                              <div className="space-y-1 mb-2">
                                <div className="text-muted-foreground font-medium">
                                  📝 翻译结果 ({task.analysis.target_language_name || '目标语言'}):
                                </div>
                                {task.analysis.translations.slice(0, 3).map((t: any, i: number) => (
                                  <div key={i} className="flex items-start gap-2 pl-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground line-through">{t.original}</span>
                                    <span className="text-primary">→</span>
                                    <span className="text-foreground font-medium">{t.translated}</span>
                                  </div>
                                ))}
                                {task.analysis.translations.length > 3 && (
                                  <div className="text-muted-foreground pl-2">
                                    还有 {task.analysis.translations.length - 3} 处翻译...
                                  </div>
                                )}
                              </div>
                            )}
                            {task.analysis.quality_score && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">质量评分:</span>
                                <span className="text-foreground font-medium">{task.analysis.quality_score}/10</span>
                              </div>
                            )}
                            {task.analysis.has_watermark !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">水印检测:</span>
                                <span className={task.analysis.has_watermark ? 'text-warning' : 'text-success font-medium'}>
                                  {task.analysis.has_watermark ? '检测到水印' : '无水印'}
                                </span>
                              </div>
                            )}
                            {task.analysis.subject && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">识别主体:</span>
                                <span className="text-foreground font-medium">{task.analysis.subject}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={task.status !== 'completed'}
                            onClick={() => handlePreview(task)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            预览
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={task.status !== 'completed' || isDownloading === task.id}
                            onClick={() => handleDownload(task)}
                          >
                            {isDownloading === task.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                下载中...
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 mr-1" />
                                下载
                              </>
                            )}
                          </Button>
                          {task.aiResponse && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setPreviewTask(task);
                                setPreviewOpen(true);
                              }}
                            >
                              <FileImage className="h-3 w-3 mr-1" />
                              详情
                            </Button>
                          )}
                          {task.complianceStatus === 'failed' && (
                            <Button size="sm" onClick={() => handleRegenerate(task)}>
                              <RotateCcw className="h-3 w-3 mr-1" />
                              重新生成
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 合规校验 */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">图片合规规则</CardTitle>
                  <CardDescription>过滤平台禁示元素，校验图片尺寸/格式</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complianceRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-foreground">{rule.name}</div>
                            <div className="text-[11px] text-muted-foreground">{rule.checkCount}次校验</div>
                          </div>
                        </div>
                        <div className="text-[14px] font-semibold text-success">{rule.passRate}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">违规自动处理</CardTitle>
                  <CardDescription>违规图片自动重新生成（最多2次），仍违规则推送告警</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-[13px] font-medium text-foreground">TK违规元素</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        宗教元素、政治元素、夸大宣传图自动过滤替换
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-[13px] font-medium text-foreground">亚马逊违规元素</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        诱导好评图、夸大宣传图自动过滤替换
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-[13px] font-medium text-foreground">尺寸格式规范</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        TK: 800x800px以上 | 亚马逊: 1000x1000px以上
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 设计模板 */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">设计模板库</CardTitle>
                <CardDescription>按平台/场景分类的设计模板</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'TK主图模板', count: 12, color: 'bg-pink-500/10 text-pink-500' },
                    { name: 'TK封面模板', count: 8, color: 'bg-purple-500/10 text-purple-500' },
                    { name: '亚马逊主图模板', count: 15, color: 'bg-orange-500/10 text-orange-500' },
                    { name: 'A+页面模板', count: 6, color: 'bg-blue-500/10 text-blue-500' },
                  ].map((template) => (
                    <div key={template.name} className="p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                      <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mb-3`}>
                        <FileImage className="h-6 w-6" />
                      </div>
                      <div className="text-[13px] font-medium text-foreground">{template.name}</div>
                      <div className="text-[11px] text-muted-foreground">{template.count}个模板</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 配置设置 */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">智能体配置</CardTitle>
                <CardDescription>模型选择、Prompt模板、输出参数配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">生成模型</div>
                      <div className="text-[11px] text-muted-foreground">豆包-Seed-1.8 + 图片生成API</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      配置
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">合规重试次数</div>
                      <div className="text-[11px] text-muted-foreground">违规图片自动重新生成，最多2次</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">2次</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">默认输出格式</div>
                      <div className="text-[11px] text-muted-foreground">PNG格式，高清输出</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">PNG</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 图片预览对话框 */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                图片预览
              </DialogTitle>
              <DialogDescription>
                {previewTask?.productName} - {previewTask?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {/* 缩放控制 */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewScale(Math.max(0.25, previewScale - 0.25))}
                  disabled={previewScale <= 0.25}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(previewScale * 100)}%
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewScale(Math.min(3, previewScale + 0.25))}
                  disabled={previewScale >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewScale(1)}
                >
                  重置
                </Button>
              </div>
              
              {/* 图片预览区域 */}
              <div className="w-full overflow-auto bg-muted/30 rounded-lg p-4 flex items-center justify-center" style={{ maxHeight: '60vh' }}>
                {previewTask?.processedUrl || previewTask?.imageUrl ? (
                  <img
                    src={previewTask.processedUrl || previewTask.imageUrl}
                    alt={previewTask.productName}
                    style={{ 
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'center',
                      transition: 'transform 0.2s ease-in-out',
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                    className="rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="text-muted-foreground py-12">暂无图片</div>
                )}
              </div>
              
              {/* 任务信息 */}
              {previewTask && (
                <div className="w-full space-y-4">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">类型:</span>
                      <Badge variant="outline">{getTypeLabel(previewTask.type)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">平台:</span>
                      <Badge variant="outline">{previewTask.platform}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">合规状态:</span>
                      {getComplianceBadge(previewTask.complianceStatus)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">生成时间:</span>
                      <span>{previewTask.generatedAt}</span>
                    </div>
                    {previewTask.modeLabel && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">处理模式:</span>
                        <Badge variant="outline" className="text-primary">{previewTask.modeLabel}</Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* AI分析结果 */}
                  {previewTask.analysis && (
                    <div className="w-full p-4 bg-muted/30 rounded-lg">
                      <div className="text-[13px] font-medium text-foreground mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        AI分析结果
                      </div>
                      <div className="space-y-2 text-[12px]">
                        {/* 翻译结果 */}
                        {previewTask.analysis.original_texts && (
                          <div className="p-2 bg-white rounded">
                            <div className="text-muted-foreground mb-1">原文内容:</div>
                            <div className="text-foreground">{previewTask.analysis.original_texts.join(' | ')}</div>
                          </div>
                        )}
                        {previewTask.analysis.translated_texts && (
                          <div className="p-2 bg-primary/5 rounded">
                            <div className="text-muted-foreground mb-1">翻译结果:</div>
                            <div className="text-foreground font-medium">{previewTask.analysis.translated_texts.join(' | ')}</div>
                          </div>
                        )}
                        {previewTask.analysis.notes && (
                          <div className="text-muted-foreground italic">{previewTask.analysis.notes}</div>
                        )}
                        
                        {/* 优化结果 */}
                        {previewTask.analysis.quality_score && (
                          <div className="flex items-center gap-4 p-2 bg-white rounded">
                            <div>
                              <span className="text-muted-foreground">质量评分: </span>
                              <span className="text-foreground font-semibold">{previewTask.analysis.quality_score}/10</span>
                            </div>
                            {previewTask.analysis.product_detected && (
                              <div>
                                <span className="text-muted-foreground">识别产品: </span>
                                <span className="text-foreground">{previewTask.analysis.product_detected}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {previewTask.analysis.issues && previewTask.analysis.issues.length > 0 && (
                          <div className="p-2 bg-warning/10 rounded">
                            <div className="text-warning mb-1">发现问题:</div>
                            <ul className="list-disc list-inside text-foreground">
                              {previewTask.analysis.issues.map((issue: string, i: number) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {previewTask.analysis.suggestions && previewTask.analysis.suggestions.length > 0 && (
                          <div className="p-2 bg-success/10 rounded">
                            <div className="text-success mb-1">优化建议:</div>
                            <ul className="list-disc list-inside text-foreground">
                              {previewTask.analysis.suggestions.map((suggestion: string, i: number) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* 水印检测 */}
                        {previewTask.analysis.has_watermark !== undefined && (
                          <div className="flex items-center gap-4 p-2 bg-white rounded">
                            <div>
                              <span className="text-muted-foreground">水印检测: </span>
                              <span className={previewTask.analysis.has_watermark ? 'text-warning font-medium' : 'text-success font-medium'}>
                                {previewTask.analysis.has_watermark ? '检测到水印' : '无水印'}
                              </span>
                            </div>
                            {previewTask.analysis.watermark_position && (
                              <div>
                                <span className="text-muted-foreground">位置: </span>
                                <span className="text-foreground">{previewTask.analysis.watermark_position}</span>
                              </div>
                            )}
                            {previewTask.analysis.removal_difficulty && (
                              <div>
                                <span className="text-muted-foreground">去除难度: </span>
                                <span className="text-foreground">{previewTask.analysis.removal_difficulty}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 白底图分析 */}
                        {previewTask.analysis.subject && (
                          <div className="p-2 bg-white rounded space-y-2">
                            <div>
                              <span className="text-muted-foreground">识别主体: </span>
                              <span className="text-foreground font-medium">{previewTask.analysis.subject}</span>
                            </div>
                            {previewTask.analysis.current_background && (
                              <div>
                                <span className="text-muted-foreground">当前背景: </span>
                                <span className="text-foreground">{previewTask.analysis.current_background}</span>
                              </div>
                            )}
                            {previewTask.analysis.cutout_difficulty && (
                              <div>
                                <span className="text-muted-foreground">抠图难度: </span>
                                <span className="text-foreground">{previewTask.analysis.cutout_difficulty}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* AI原始响应 */}
                  {previewTask.aiResponse && !previewTask.analysis && (
                    <div className="w-full p-4 bg-muted/30 rounded-lg max-h-[200px] overflow-auto">
                      <div className="text-[13px] font-medium text-foreground mb-2">AI响应:</div>
                      <div className="text-[12px] text-muted-foreground whitespace-pre-wrap">{previewTask.aiResponse}</div>
                    </div>
                  )}
                </div>
              )}
              
              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  关闭
                </Button>
                {previewTask && (
                  <Button 
                    onClick={() => {
                      handleDownload(previewTask);
                      setPreviewOpen(false);
                    }}
                    disabled={isDownloading === previewTask.id}
                  >
                    {isDownloading === previewTask.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        下载中...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        下载图片
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
