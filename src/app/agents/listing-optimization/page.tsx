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
  FileText,
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
  Tag,
  Type,
  List,
  AlertTriangle,
  Globe,
  Languages,
  TrendingUp,
  Copy,
  Edit3,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { optimizeListing, suggestKeywords, ListingResult } from '@/lib/api/ai-agents';

interface ListingTask {
  id: string;
  productName: string;
  platform: 'TK' | 'Amazon';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  complianceStatus: 'passed' | 'failed' | 'checking';
  complianceIssues: string[];
  components: {
    title: boolean;
    bullets: boolean;
    aplus: boolean;
    keywords: boolean;
    tags: boolean;
  };
  generatedAt?: string;
  result?: ListingResult;
}

const mockListingTasks: ListingTask[] = [
  {
    id: 'LST001',
    productName: '宠物自动喂食器 5L大容量',
    platform: 'TK',
    status: 'completed',
    complianceStatus: 'passed',
    complianceIssues: [],
    components: { title: true, bullets: false, aplus: false, keywords: true, tags: true },
    generatedAt: '2026-03-21 14:30',
  },
  {
    id: 'LST002',
    productName: '便携式榨汁机 USB充电',
    platform: 'Amazon',
    status: 'completed',
    complianceStatus: 'passed',
    complianceIssues: [],
    components: { title: true, bullets: true, aplus: true, keywords: true, tags: false },
    generatedAt: '2026-03-21 13:15',
  },
  {
    id: 'LST003',
    productName: 'LED化妆镜 台式带灯',
    platform: 'Amazon',
    status: 'failed',
    complianceStatus: 'failed',
    complianceIssues: ['包含医疗功效词', '诱导好评词检测失败'],
    components: { title: true, bullets: true, aplus: false, keywords: true, tags: false },
    generatedAt: '2026-03-21 12:00',
  },
  {
    id: 'LST004',
    productName: '智能手环 运动监测',
    platform: 'TK',
    status: 'processing',
    complianceStatus: 'checking',
    complianceIssues: [],
    components: { title: true, bullets: false, aplus: false, keywords: true, tags: true },
  },
];

const tkComplianceRules = [
  { id: 'LCR001', name: '夸大宣传词过滤', status: 'active', checkCount: 780, passRate: 98.2 },
  { id: 'LCR002', name: '敏感词检测', status: 'active', checkCount: 780, passRate: 99.5 },
  { id: 'LCR003', name: '违规标签过滤', status: 'active', checkCount: 780, passRate: 97.8 },
];

const amazonComplianceRules = [
  { id: 'LCR004', name: '诱导好评词过滤', status: 'active', checkCount: 640, passRate: 99.1 },
  { id: 'LCR005', name: '医疗功效词过滤', status: 'active', checkCount: 640, passRate: 98.5 },
  { id: 'LCR006', name: '禁售词检测', status: 'active', checkCount: 640, passRate: 99.8 },
];

export default function ListingAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'processing'>('online');
  const [listingTasks, setListingTasks] = useState<ListingTask[]>(mockListingTasks);
  const [productName, setProductName] = useState('');
  const [platform, setPlatform] = useState<'TK' | 'Amazon'>('TK');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 启动Listing优化
  const handleStartOptimization = async () => {
    if (!productName) {
      toast.error('请输入商品名称');
      return;
    }

    setIsProcessing(true);
    setAgentStatus('processing');

    try {
      const result = await optimizeListing({
        product_info: { name: productName },
        platform: platform.toLowerCase(),
        language: 'en',
      });

      if (result.success && result.data) {
        const newTask: ListingTask = {
          id: `LST${Date.now()}`,
          productName,
          platform,
          status: 'completed',
          complianceStatus: 'passed',
          complianceIssues: [],
          components: {
            title: true,
            bullets: platform === 'Amazon',
            aplus: platform === 'Amazon',
            keywords: true,
            tags: platform === 'TK',
          },
          generatedAt: new Date().toLocaleString('zh-CN'),
          result: result.data,
        };
        setListingTasks([newTask, ...listingTasks]);
        toast.success('Listing优化完成！');
        setProductName('');
      }
    } catch (error: any) {
      console.error('优化失败:', error);
      toast.error(error.message || '优化失败');
    } finally {
      setIsProcessing(false);
      setAgentStatus('online');
    }
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
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">Listing优化智能体</h1>
              <p className="text-[14px] text-muted-foreground">标题/五点/A+优化 · 关键词挖掘 · 平台差异化合规校验</p>
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
              新建优化
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
            <Type className="h-3 w-3 mr-1" />
            标题优化
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <List className="h-3 w-3 mr-1" />
            五点描述
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Tag className="h-3 w-3 mr-1" />
            关键词挖掘
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Globe className="h-3 w-3 mr-1" />
            平台差异化
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日优化</div>
              <div className="text-[24px] font-semibold text-foreground">78</div>
              <div className="text-[11px] text-success mt-1">↑ 18% vs 昨日</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">合规通过率</div>
              <div className="text-[24px] font-semibold text-success">96.5%</div>
              <div className="text-[11px] text-muted-foreground mt-1">自动重试≤2次</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">TK Listing</div>
              <div className="text-[24px] font-semibold text-foreground">35</div>
              <div className="text-[11px] text-muted-foreground mt-1">短标题+标签</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">亚马逊Listing</div>
              <div className="text-[24px] font-semibold text-foreground">43</div>
              <div className="text-[11px] text-muted-foreground mt-1">长标题+五点+A+</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">1,420</div>
              <div className="text-[11px] text-muted-foreground mt-1">DeepSeek-V3</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tasks">优化任务</TabsTrigger>
            <TabsTrigger value="compliance">合规校验</TabsTrigger>
            <TabsTrigger value="keywords">关键词库</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 优化任务 */}
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
                    <option value="">全部平台</option>
                    <option value="TK">TK东南亚</option>
                    <option value="Amazon">亚马逊</option>
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
              {listingTasks.map((task) => (
                <Card key={task.id} className="bg-white border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-foreground">{task.productName}</span>
                          <Badge variant="outline" className="text-[11px]">{task.platform}</Badge>
                          {getStatusBadge(task.status)}
                          {getComplianceBadge(task.complianceStatus)}
                        </div>
                        {task.complianceIssues.length > 0 && (
                          <div className="flex items-center gap-2 text-[11px] text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            <span>合规问题: {task.complianceIssues.join('、')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-muted-foreground">生成组件:</span>
                            {task.components.title && <Badge variant="outline" className="text-[10px]">标题</Badge>}
                            {task.components.bullets && <Badge variant="outline" className="text-[10px]">五点</Badge>}
                            {task.components.aplus && <Badge variant="outline" className="text-[10px]">A+</Badge>}
                            {task.components.keywords && <Badge variant="outline" className="text-[10px]">关键词</Badge>}
                            {task.components.tags && <Badge variant="outline" className="text-[10px]">标签</Badge>}
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ID: {task.id} · {task.generatedAt || '生成中...'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={task.status !== 'completed'}>
                          <Eye className="h-3 w-3 mr-1" />
                          预览
                        </Button>
                        <Button variant="outline" size="sm" disabled={task.status !== 'completed'}>
                          <Copy className="h-3 w-3 mr-1" />
                          复制
                        </Button>
                        {task.status === 'completed' && (
                          <Button size="sm">
                            <Zap className="h-3 w-3 mr-1" />
                            上架
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

          {/* 合规校验 */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] flex items-center gap-2">
                    <span>TK合规规则</span>
                    <Badge variant="outline" className="text-[11px]">短标题+标签</Badge>
                  </CardTitle>
                  <CardDescription>过滤夸大宣传词、敏感词、违规标签</CardDescription>
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
                  <CardTitle className="text-[15px] flex items-center gap-2">
                    <span>亚马逊合规规则</span>
                    <Badge variant="outline" className="text-[11px]">长标题+五点+A+</Badge>
                  </CardTitle>
                  <CardDescription>过滤诱导好评词、医疗功效词、禁售词</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {amazonComplianceRules.map((rule) => (
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
            </div>

            {/* 合规检测规则表 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">平台差异化合规检测规则</CardTitle>
                <CardDescription>按平台/站点预置禁售词库，自动识别和过滤</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">检测项</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">TK规则</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">亚马逊规则</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">禁售词</td>
                        <td className="py-3 px-4">武器、仿品、处方药、医疗功效等</td>
                        <td className="py-3 px-4">武器、仿品、处方药、医疗功效等</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">品牌检测</td>
                        <td className="py-3 px-4">识别知名品牌，需授权否则剔除</td>
                        <td className="py-3 px-4">识别知名品牌，需授权否则剔除</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">价格异常</td>
                        <td className="py-3 px-4">低于成本×0.8或高于均价×3告警</td>
                        <td className="py-3 px-4">低于成本×0.8或高于均价×3告警</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">平台差异</td>
                        <td className="py-3 px-4 text-pink-500">禁止"最好、100%有效"等夸大词</td>
                        <td className="py-3 px-4 text-orange-500">禁止"留评返现、好评有礼"等诱导词</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 关键词库 */}
          <TabsContent value="keywords" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-[13px] font-medium">热门关键词</span>
                  </div>
                  <div className="space-y-2">
                    {['宠物喂食器', '自动喂食', '5L大容量', '定时喂养', 'USB充电'].map((kw, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-[12px]">{kw}</span>
                        <Badge variant="outline" className="text-[10px]">热度 {90 - i * 5}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <span className="text-[13px] font-medium">TK标签库</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['#宠物好物', '#养宠必备', '#猫咪用品', '#狗狗零食', '#宠物智能', '#自动喂食', '#萌宠日常'].map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[11px]">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Languages className="h-5 w-5 text-primary" />
                    <span className="text-[13px] font-medium">多语种关键词</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { lang: '印尼语', kw: 'feeder otomatis' },
                      { lang: '泰语', kw: 'เครื่องให้อาหารอัตโนมัติ' },
                      { lang: '越南语', kw: 'bình thức ăn tự động' },
                      { lang: '英语', kw: 'automatic pet feeder' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-[11px] text-muted-foreground">{item.lang}</span>
                        <span className="text-[12px]">{item.kw}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">DeepSeek-V3 用于长文本生成</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="deepseek">DeepSeek-V3</option>
                      <option value="doubao">豆包-Seed-1.8</option>
                      <option value="kimi">Kimi</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">TK标题长度</div>
                      <div className="text-[11px] text-muted-foreground">短标题推荐60-80字符</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">60-80字符</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">亚马逊标题长度</div>
                      <div className="text-[11px] text-muted-foreground">长标题推荐150-200字符</div>
                    </div>
                    <div className="text-[14px] font-semibold text-foreground">150-200字符</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">合规重试次数</div>
                      <div className="text-[11px] text-muted-foreground">合规校验失败自动重新生成，最多2次</div>
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
