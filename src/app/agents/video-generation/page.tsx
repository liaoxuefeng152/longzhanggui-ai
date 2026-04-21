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
  Video,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Download,
  Eye,
  Zap,
  FileVideo,
  Mic,
  Subtitles,
  MessageSquare,
  AlertTriangle,
  Upload,
  Clock,
  Film,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateVideo, GenerateVideoRequest } from '@/lib/api/ai-agents';

interface VideoScene {
  description: string;
  duration: number;
}

interface VideoTask {
  id: string;
  productName: string;
  type: 'script' | 'voiceover' | 'slideshow' | 'full';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  complianceStatus: 'passed' | 'failed' | 'checking';
  preCheckResult?: {
    passed: boolean;
    issues: string[];
  };
  duration?: number;
  publishStatus: 'draft' | 'published' | 'scheduled';
  generatedAt?: string;
  videoUrl?: string;
  scenes?: VideoScene[];
  resolution?: string;
  ratio?: string;
  fps?: number;
}

const mockVideoTasks: VideoTask[] = [
  {
    id: 'VID001',
    productName: '宠物自动喂食器 5L大容量',
    type: 'full',
    status: 'completed',
    complianceStatus: 'passed',
    preCheckResult: { passed: true, issues: [] },
    duration: 45,
    publishStatus: 'published',
    generatedAt: '2026-03-21 14:30',
    videoUrl: '/placeholder-video.mp4',
  },
  {
    id: 'VID002',
    productName: '便携式榨汁机 USB充电',
    type: 'slideshow',
    status: 'completed',
    complianceStatus: 'passed',
    preCheckResult: { passed: true, issues: [] },
    duration: 30,
    publishStatus: 'draft',
    generatedAt: '2026-03-21 13:15',
  },
  {
    id: 'VID003',
    productName: 'LED化妆镜 台式带灯',
    type: 'full',
    status: 'failed',
    complianceStatus: 'failed',
    preCheckResult: { passed: false, issues: ['脚本包含夸大宣传词', '禁用语检测失败'] },
    publishStatus: 'draft',
    generatedAt: '2026-03-21 12:00',
  },
  {
    id: 'VID004',
    productName: '智能手环 运动监测',
    type: 'voiceover',
    status: 'processing',
    complianceStatus: 'checking',
    publishStatus: 'draft',
  },
];

const tkComplianceRules = [
  { id: 'VCR001', name: '脚本夸大宣传词过滤', status: 'active', checkCount: 560, passRate: 98.5 },
  { id: 'VCR002', name: '禁用语检测', status: 'active', checkCount: 560, passRate: 99.2 },
  { id: 'VCR003', name: '视频时长/比例校验', status: 'active', checkCount: 560, passRate: 100 },
  { id: 'VCR004', name: 'TK官方预检接口', status: 'active', checkCount: 560, passRate: 97.8 },
];

export default function VideoAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'processing'>('online');
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>(mockVideoTasks);
  
  // 新建视频对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newVideo, setNewVideo] = useState({
    product_name: '',
    video_type: 'full' as 'script' | 'voiceover' | 'slideshow' | 'full',
    duration: 30,
    style: 'promotional',
  });
  
  // 预览对话框状态
  const [previewTask, setPreviewTask] = useState<VideoTask | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // 存储生成的脚本内容
  const [taskScripts, setTaskScripts] = useState<Record<string, string>>({});
  // 存储生成的场景列表
  const [taskScenes, setTaskScenes] = useState<Record<string, VideoScene[]>>({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 新建视频
  const handleGenerateVideo = async () => {
    if (!newVideo.product_name.trim()) {
      toast.error('请输入产品名称或视频描述');
      return;
    }

    setIsGenerating(true);
    setAgentStatus('processing');

    try {
      // 将产品名称作为视频描述传递给后端
      const request: GenerateVideoRequest = {
        prompt: newVideo.product_name,
        duration: newVideo.duration,
        resolution: '720p',
        ratio: '16:9',
      };

      const result = await generateVideo(request);

      if (result.success && result.videoUrl) {
        const newTask: VideoTask = {
          id: result.taskId || `task-${Date.now()}`,
          productName: newVideo.product_name,
          type: newVideo.video_type,
          status: 'completed',
          complianceStatus: 'passed',
          preCheckResult: { passed: true, issues: [] },
          duration: result.duration || newVideo.duration,
          publishStatus: 'draft',
          generatedAt: new Date().toLocaleString('zh-CN'),
          videoUrl: result.videoUrl,
          scenes: [],
          resolution: result.resolution,
          ratio: result.ratio,
          fps: 30,
        };
        setVideoTasks([newTask, ...videoTasks]);
        
        toast.success('视频生成成功！');
        setIsDialogOpen(false);
        setNewVideo({
          product_name: '',
          video_type: 'full',
          duration: 30,
          style: 'promotional',
        });
      } else {
        toast.error('视频生成失败');
      }
    } catch (error: any) {
      console.error('视频生成失败:', error);
      toast.error(error.message || '视频生成失败');
    } finally {
      setIsGenerating(false);
      setAgentStatus('online');
    }
  };

  // 预览视频
  const handlePreview = async (task: VideoTask) => {
    setPreviewTask(task);
    setIsPreviewOpen(true);
    
    // 如果没有脚本内容，从API获取
    if (!taskScripts[task.id]) {
      try {
        const result = await generateVideo({
          prompt: task.productName,
          duration: task.duration || 5,
          resolution: task.resolution || '720p',
          ratio: task.ratio || '16:9',
        });
        if (result.success && result.videoUrl) {
          // 更新视频URL
          setVideoTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, videoUrl: result.videoUrl } : t
          ));
        }
      } catch (error) {
        console.error('获取脚本失败:', error);
      }
    }
  };

  // 发布视频
  const handlePublish = async (task: VideoTask) => {
    toast.loading('正在发布到TK创作者后台...', { id: 'publish' });
    
    // 模拟发布过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 更新任务状态
    setVideoTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, publishStatus: 'published' as const } : t
    ));
    
    toast.success('视频已成功发布到TK创作者后台！', { id: 'publish' });
  };

  // 重新生成视频
  const handleRetry = async (task: VideoTask) => {
    toast.loading('正在重新生成视频...', { id: 'retry' });
    setAgentStatus('processing');
    
    try {
      const result = await generateVideo({
        prompt: task.productName,
        duration: task.duration || 5,
        resolution: task.resolution || '720p',
        ratio: task.ratio || '16:9',
      });
      
      if (result.success && result.videoUrl) {
        setVideoTasks(prev => prev.map(t => 
          t.id === task.id ? {
            ...t,
            status: 'completed' as const,
            complianceStatus: 'passed' as const,
            preCheckResult: { passed: true, issues: [] },
            videoUrl: result.videoUrl,
            scenes: [],
            resolution: result.resolution,
            ratio: result.ratio,
            fps: 30,
            generatedAt: new Date().toLocaleString('zh-CN'),
          } : t
        ));
        
        toast.success('视频重新生成成功！', { id: 'retry' });
      }
    } catch (error: any) {
      toast.error(error.message || '重新生成失败', { id: 'retry' });
    } finally {
      setAgentStatus('online');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      script: '脚本生成',
      voiceover: 'AI配音',
      slideshow: '图文轮播',
      full: '完整视频',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-muted text-muted-foreground' },
      processing: { label: '生成中', className: 'bg-pink-100 text-pink-600 border-pink-500/20' },
      completed: { label: '已完成', className: 'bg-success/10 text-success border-success/20' },
      failed: { label: '失败', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getPublishBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      draft: { label: '草稿', className: 'bg-muted text-muted-foreground' },
      published: { label: '已发布', className: 'bg-success/10 text-success border-success/20' },
      scheduled: { label: '定时发布', className: 'bg-warning/10 text-warning border-warning/20' },
    };
    const { label, className } = config[status] || config.draft;
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
            <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center">
              <Video className="h-7 w-7 text-pink-600" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">视频生成智能体</h1>
              <p className="text-[14px] text-muted-foreground">脚本生成 · AI配音 · 图文轮播 · TK合规预检</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-pink-100 text-pink-500 border-pink-500/20">
              TK东南亚专属
            </Badge>
            <Badge className={agentStatus === 'online' ? 'bg-success text-white' : 'bg-warning text-white'}>
              {agentStatus === 'online' ? '在线运行' : agentStatus === 'processing' ? '处理中' : '离线'}
            </Badge>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              新建视频
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-pink-500/5 text-pink-600 border-pink-500/20">
            <Shield className="h-3 w-3 mr-1" />
            合规预检
          </Badge>
          <Badge variant="outline" className="bg-pink-500/5 text-pink-600 border-pink-500/20">
            <FileVideo className="h-3 w-3 mr-1" />
            脚本生成
          </Badge>
          <Badge variant="outline" className="bg-pink-500/5 text-pink-600 border-pink-500/20">
            <Mic className="h-3 w-3 mr-1" />
            AI配音
          </Badge>
          <Badge variant="outline" className="bg-pink-500/5 text-pink-600 border-pink-500/20">
            <Subtitles className="h-3 w-3 mr-1" />
            字幕生成
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日生成</div>
              <div className="text-[24px] font-semibold text-foreground">45</div>
              <div className="text-[11px] text-success mt-1">↑ 12% vs 昨日</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">合规预检通过率</div>
              <div className="text-[24px] font-semibold text-success">95.8%</div>
              <div className="text-[11px] text-muted-foreground mt-1">对接TK官方接口</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已发布</div>
              <div className="text-[24px] font-semibold text-foreground">32</div>
              <div className="text-[11px] text-muted-foreground mt-1">直达创作者后台</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">平均时长</div>
              <div className="text-[24px] font-semibold text-foreground">38s</div>
              <div className="text-[11px] text-muted-foreground mt-1">图文轮播为主</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">980</div>
              <div className="text-[11px] text-muted-foreground mt-1">豆包-Seed-1.8</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tasks">视频任务</TabsTrigger>
            <TabsTrigger value="compliance">合规预检</TabsTrigger>
            <TabsTrigger value="publish">发布管理</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 视频任务 */}
          <TabsContent value="tasks" className="space-y-4">
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
                    <option value="full">完整视频</option>
                    <option value="slideshow">图文轮播</option>
                    <option value="script">脚本生成</option>
                    <option value="voiceover">AI配音</option>
                  </select>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">全部状态</option>
                    <option value="completed">已完成</option>
                    <option value="processing">生成中</option>
                    <option value="failed">失败</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* 任务列表 */}
            <div className="space-y-3">
              {videoTasks.map((task) => (
                <Card key={task.id} className="bg-white border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {task.status === 'completed' ? (
                          <div className="relative">
                            <Video className="h-8 w-8 text-muted-foreground" />
                            {task.duration && (
                              <span className="absolute -bottom-1 -right-1 text-[10px] bg-black/70 text-white px-1 rounded">
                                {task.duration}s
                              </span>
                            )}
                          </div>
                        ) : task.status === 'processing' ? (
                          <RefreshCw className="h-8 w-8 text-pink-600 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-foreground">{task.productName}</span>
                            <Badge variant="outline" className="text-[11px]">{getTypeLabel(task.type)}</Badge>
                            {getStatusBadge(task.status)}
                            {getPublishBadge(task.publishStatus)}
                          </div>
                          {getComplianceBadge(task.complianceStatus)}
                        </div>
                        {task.preCheckResult && !task.preCheckResult.passed && (
                          <div className="flex items-center gap-2 text-[11px] text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            <span>预检问题: {task.preCheckResult.issues.join('、')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          <span>ID: {task.id}</span>
                          <span>{task.generatedAt || '生成中...'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={task.status !== 'completed'}
                          onClick={() => handlePreview(task)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          预览
                        </Button>
                        {task.status === 'completed' && task.publishStatus === 'draft' && (
                          <Button size="sm" onClick={() => handlePublish(task)}>
                            <Upload className="h-3 w-3 mr-1" />
                            发布
                          </Button>
                        )}
                        {task.status === 'failed' && (
                          <Button size="sm" onClick={() => handleRetry(task)}>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            重新生成
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 合规预检 */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">TK视频合规规则</CardTitle>
                  <CardDescription>对接TK官方预检接口，做基础违规扫描</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tkComplianceRules.map((rule) => (
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
                  <CardTitle className="text-[15px]">预检流程</CardTitle>
                  <CardDescription>仅发布预检合规的视频，违规自动重新生成</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">1</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">脚本过滤</div>
                        <div className="text-[11px] text-muted-foreground">过滤夸大宣传词、禁用语</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">2</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">时长比例校验</div>
                        <div className="text-[11px] text-muted-foreground">校验视频时长/比例符合TK要求</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">3</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">TK官方预检</div>
                        <div className="text-[11px] text-muted-foreground">对接官方接口，基础违规扫描</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">4</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">自动重试</div>
                        <div className="text-[11px] text-muted-foreground">违规视频自动重新生成（最多2次）</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 发布管理 */}
          <TabsContent value="publish" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">TK创作者后台发布</CardTitle>
                <CardDescription>合规视频直接发布到TK创作者后台</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Clock className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">定时发布</div>
                    <div className="text-[11px] text-muted-foreground">设置发布时间</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Sparkles className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">即时发布</div>
                    <div className="text-[11px] text-muted-foreground">生成即发布</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Film className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">批量发布</div>
                    <div className="text-[11px] text-muted-foreground">多视频排队发布</div>
                  </div>
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
                      <div className="text-[11px] text-muted-foreground">豆包-Seed-1.8 + 视频生成API</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      配置
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">配音语言</div>
                      <div className="text-[11px] text-muted-foreground">印尼语/泰语/越南语</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="id">印尼语</option>
                      <option value="th">泰语</option>
                      <option value="vi">越南语</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">默认视频时长</div>
                      <div className="text-[11px] text-muted-foreground">图文轮播推荐30-60秒</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">30-60秒</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">合规重试次数</div>
                      <div className="text-[11px] text-muted-foreground">违规视频自动重新生成，最多2次</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">2次</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 新建视频对话框 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>新建视频</DialogTitle>
              <DialogDescription>
                输入产品信息，AI将自动生成视频脚本和内容
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">产品名称 *</label>
                <input
                  type="text"
                  placeholder="例如：宠物自动喂食器 5L大容量"
                  value={newVideo.product_name}
                  onChange={(e) => setNewVideo({ ...newVideo, product_name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">视频类型</label>
                <Select
                  value={newVideo.video_type}
                  onValueChange={(value: any) => setNewVideo({ ...newVideo, video_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="script">脚本生成</SelectItem>
                    <SelectItem value="voiceover">AI配音</SelectItem>
                    <SelectItem value="slideshow">图文轮播</SelectItem>
                    <SelectItem value="full">完整视频</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">视频时长（秒）</label>
                <Select
                  value={newVideo.duration.toString()}
                  onValueChange={(value) => setNewVideo({ ...newVideo, duration: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15秒</SelectItem>
                    <SelectItem value="30">30秒</SelectItem>
                    <SelectItem value="45">45秒</SelectItem>
                    <SelectItem value="60">60秒</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-foreground">视频风格</label>
                <Select
                  value={newVideo.style}
                  onValueChange={(value) => setNewVideo({ ...newVideo, style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">促销风格</SelectItem>
                    <SelectItem value="tutorial">教程风格</SelectItem>
                    <SelectItem value="lifestyle">生活场景</SelectItem>
                    <SelectItem value="review">评测风格</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleGenerateVideo} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始生成
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 预览对话框 */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>视频预览 - {previewTask?.productName}</DialogTitle>
              <DialogDescription>
                查看生成的视频脚本和内容
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 视频信息 */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-[11px] text-muted-foreground">视频类型</div>
                  <div className="text-[13px] font-medium">{previewTask && getTypeLabel(previewTask.type)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">时长</div>
                  <div className="text-[13px] font-medium">{previewTask?.duration || 30}秒</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">分辨率</div>
                  <div className="text-[13px] font-medium">{previewTask?.resolution || '720p'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">比例</div>
                  <div className="text-[13px] font-medium">{previewTask?.ratio || '9:16'}</div>
                </div>
              </div>
              
              {/* 视频预览区 */}
              {previewTask?.videoUrl ? (
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-foreground">视频播放</div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      src={previewTask.videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      preload="metadata"
                    >
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>帧率: {previewTask?.fps || 24} FPS</span>
                    <span>•</span>
                    <a 
                      href={previewTask.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:underline"
                    >
                      在新窗口打开
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-[12px]">视频生成中或暂无视频</p>
                  </div>
                </div>
              )}
              
              {/* 场景列表 */}
              {(taskScenes[previewTask?.id || ''] || previewTask?.scenes)?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-foreground">场景分镜</div>
                  <div className="space-y-2">
                    {(taskScenes[previewTask?.id || ''] || previewTask?.scenes)?.map((scene: VideoScene, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] text-foreground">{scene.description}</p>
                        </div>
                        <div className="text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded">
                          {scene.duration}秒
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 脚本内容 */}
              <div className="space-y-2">
                <div className="text-[13px] font-medium text-foreground">视频脚本</div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <pre className="text-[12px] text-foreground whitespace-pre-wrap font-sans">
                    {taskScripts[previewTask?.id || ''] || '暂无脚本内容'}
                  </pre>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                关闭
              </Button>
              {previewTask?.videoUrl && (
                <Button variant="outline" onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewTask.videoUrl!;
                  link.download = `video_${previewTask.id}.mp4`;
                  link.target = '_blank';
                  link.click();
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  下载视频
                </Button>
              )}
              {previewTask?.publishStatus === 'draft' && (
                <Button onClick={() => {
                  setIsPreviewOpen(false);
                  handlePublish(previewTask);
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  发布到TK
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                if (taskScripts[previewTask?.id || '']) {
                  navigator.clipboard.writeText(taskScripts[previewTask?.id || ''] || '');
                  toast.success('脚本已复制到剪贴板');
                }
              }}>
                复制脚本
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
