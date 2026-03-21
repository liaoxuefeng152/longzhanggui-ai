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
} from 'lucide-react';

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
            <Button>
              <Play className="h-4 w-4 mr-2" />
              新建设计
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
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {task.status === 'completed' ? (
                          <Image className="h-10 w-10 text-muted-foreground" />
                        ) : task.status === 'processing' ? (
                          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                        ) : (
                          <AlertTriangle className="h-10 w-10 text-destructive" />
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
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button variant="outline" size="sm" disabled={task.status !== 'completed'}>
                            <Eye className="h-3 w-3 mr-1" />
                            预览
                          </Button>
                          <Button variant="outline" size="sm" disabled={task.status !== 'completed'}>
                            <Download className="h-3 w-3 mr-1" />
                            下载
                          </Button>
                          {task.complianceStatus === 'failed' && (
                            <Button size="sm">
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
      </div>
    </MainLayout>
  );
}
