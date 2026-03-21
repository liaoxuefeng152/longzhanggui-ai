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
} from 'lucide-react';

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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

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
      processing: { label: '生成中', className: 'bg-primary/10 text-primary border-primary/20' },
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
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">视频生成智能体</h1>
              <p className="text-[14px] text-muted-foreground">脚本生成 · AI配音 · 图文轮播 · TK合规预检</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/20">
              TK东南亚专属
            </Badge>
            <Badge className={agentStatus === 'online' ? 'bg-success text-white' : 'bg-warning text-white'}>
              {agentStatus === 'online' ? '在线运行' : agentStatus === 'processing' ? '处理中' : '离线'}
            </Badge>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              新建视频
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            合规预检
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <FileVideo className="h-3 w-3 mr-1" />
            脚本生成
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Mic className="h-3 w-3 mr-1" />
            AI配音
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
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
                          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
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
                        <Button variant="outline" size="sm" disabled={task.status !== 'completed'}>
                          <Eye className="h-3 w-3 mr-1" />
                          预览
                        </Button>
                        {task.status === 'completed' && task.publishStatus === 'draft' && (
                          <Button size="sm">
                            <Upload className="h-3 w-3 mr-1" />
                            发布
                          </Button>
                        )}
                        {task.status === 'failed' && (
                          <Button size="sm">
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
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">定时发布</div>
                    <div className="text-[11px] text-muted-foreground">设置发布时间</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">即时发布</div>
                    <div className="text-[11px] text-muted-foreground">生成即发布</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Film className="h-8 w-8 text-primary mx-auto mb-2" />
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
      </div>
    </MainLayout>
  );
}
