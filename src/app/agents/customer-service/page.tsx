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
  Headphones,
  Search,
  Shield,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Settings,
  Globe,
  Languages,
  Clock,
  Send,
  Package,
  Truck,
  DollarSign,
  Users,
  Bot,
  User,
  ArrowRightLeft,
  Ban,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateCustomerReply, handleDispute } from '@/lib/api/ai-agents';

interface CustomerTicket {
  id: string;
  platform: 'TK' | 'Amazon';
  type: 'inquiry' | 'dispute' | 'refund' | 'shipping';
  status: 'pending' | 'processing' | 'resolved' | 'escalated';
  customer: string;
  language: string;
  subject: string;
  aiHandled: boolean;
  complianceChecked: boolean;
  satisfaction?: number;
  createdAt: string;
  reply?: string;
}

interface DisputeCase {
  id: string;
  platform: 'TK' | 'Amazon';
  type: 'refund' | 'return' | 'a-to-z';
  orderId: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'resolved';
  solution: string;
  aiSuggested: boolean;
  createdAt: string;
}

const mockTickets: CustomerTicket[] = [
  {
    id: 'TK001',
    platform: 'TK',
    type: 'inquiry',
    status: 'resolved',
    customer: 'Budi Santoso',
    language: '印尼语',
    subject: '询问物流状态 - 订单#TK20260321001',
    aiHandled: true,
    complianceChecked: true,
    satisfaction: 5,
    createdAt: '2026-03-21 14:30',
  },
  {
    id: 'AM001',
    platform: 'Amazon',
    type: 'dispute',
    status: 'processing',
    customer: 'John Smith',
    language: '英语',
    subject: '申请退款 - 商品与描述不符',
    aiHandled: true,
    complianceChecked: true,
    createdAt: '2026-03-21 13:15',
  },
  {
    id: 'TK002',
    platform: 'TK',
    type: 'shipping',
    status: 'pending',
    customer: 'Somchai Thai',
    language: '泰语',
    subject: '包裹未送达 - 订单#TK20260320098',
    aiHandled: false,
    complianceChecked: false,
    createdAt: '2026-03-21 12:00',
  },
  {
    id: 'AM002',
    platform: 'Amazon',
    type: 'refund',
    status: 'resolved',
    customer: 'Maria Garcia',
    language: '西班牙语',
    subject: 'A-to-Z索赔申请',
    aiHandled: true,
    complianceChecked: true,
    satisfaction: 4,
    createdAt: '2026-03-21 11:45',
  },
];

const mockDisputes: DisputeCase[] = [
  {
    id: 'DSP001',
    platform: 'Amazon',
    type: 'a-to-z',
    orderId: 'AM20260321001',
    customer: 'John Smith',
    amount: 89.99,
    status: 'processing',
    solution: '全额退款',
    aiSuggested: true,
    createdAt: '2026-03-21 13:15',
  },
  {
    id: 'DSP002',
    platform: 'TK',
    type: 'refund',
    orderId: 'TK20260320098',
    customer: 'Somchai Thai',
    amount: 25.50,
    status: 'pending',
    solution: '补发商品',
    aiSuggested: true,
    createdAt: '2026-03-21 12:00',
  },
];

const languageSupport = [
  { code: 'id', name: '印尼语', platform: 'TK', accuracy: 98.5 },
  { code: 'th', name: '泰语', platform: 'TK', accuracy: 97.2 },
  { code: 'vi', name: '越南语', platform: 'TK', accuracy: 96.8 },
  { code: 'en', name: '英语', platform: 'Amazon', accuracy: 99.1 },
  { code: 'de', name: '德语', platform: 'Amazon', accuracy: 98.3 },
  { code: 'ja', name: '日语', platform: 'Amazon', accuracy: 97.5 },
];

const complianceWords = [
  { id: 'CW001', word: '好评返现', replacement: '感谢您的支持', status: 'active' },
  { id: 'CW002', word: '留评有礼', replacement: '如有问题请联系我们', status: 'active' },
  { id: 'CW003', word: '100%有效', replacement: '效果显著', status: 'active' },
  { id: 'CW004', word: '最好', replacement: '优质', status: 'active' },
];

export default function CustomerServiceAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'processing'>('online');
  const [tickets, setTickets] = useState<CustomerTicket[]>(mockTickets);
  const [customerMessage, setCustomerMessage] = useState('');
  const [replyLanguage, setReplyLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 生成客服回复
  const handleGenerateReply = async () => {
    if (!customerMessage) {
      toast.error('请输入客户消息');
      return;
    }

    setIsProcessing(true);
    setAgentStatus('processing');

    try {
      const result = await generateCustomerReply({
        message: customerMessage,
        language: replyLanguage,
      });

      if (result.success && result.data) {
        // 创建新工单
        const newTicket: CustomerTicket = {
          id: `TK${Date.now()}`,
          platform: 'TK',
          type: 'inquiry',
          status: 'resolved',
          customer: '客户',
          language: replyLanguage === 'id' ? '印尼语' : replyLanguage === 'th' ? '泰语' : '英语',
          subject: customerMessage.slice(0, 50) + '...',
          aiHandled: true,
          complianceChecked: true,
          createdAt: new Date().toLocaleString('zh-CN'),
          reply: result.data.reply,
        };
        setTickets([newTicket, ...tickets]);
        toast.success('AI回复已生成！');
        setCustomerMessage('');
      }
    } catch (error: any) {
      console.error('生成回复失败:', error);
      toast.error(error.message || '生成回复失败');
    } finally {
      setIsProcessing(false);
      setAgentStatus('online');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      inquiry: '咨询',
      dispute: '纠纷',
      refund: '退款',
      shipping: '物流',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-warning/10 text-warning border-warning/20' },
      processing: { label: '处理中', className: 'bg-primary/10 text-primary border-primary/20' },
      resolved: { label: '已解决', className: 'bg-success/10 text-success border-success/20' },
      escalated: { label: '已升级', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getSatisfactionStars = (score?: number) => {
    if (!score) return <span className="text-[11px] text-muted-foreground">未评价</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= score ? 'text-warning' : 'text-muted'}>★</span>
        ))}
      </div>
    );
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Headphones className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">AI客服智能体</h1>
              <p className="text-[14px] text-muted-foreground">多语种回复 · 纠纷处理 · 话术合规 · 物流轨迹查询</p>
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
            <Button onClick={() => toast.success('客服智能体已启动！')}>
              <Play className="h-4 w-4 mr-2" />
              启动客服
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            话术合规
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Languages className="h-3 w-3 mr-1" />
            多语种
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <MessageSquare className="h-3 w-3 mr-1" />
            纠纷处理
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Truck className="h-3 w-3 mr-1" />
            物流查询
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日会话</div>
              <div className="text-[24px] font-semibold text-foreground">328</div>
              <div className="text-[11px] text-success mt-1">↑ 25% vs 昨日</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">AI处理率</div>
              <div className="text-[24px] font-semibold text-success">92.3%</div>
              <div className="text-[11px] text-muted-foreground mt-1">自动回复+纠纷</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">纠纷处理</div>
              <div className="text-[24px] font-semibold text-foreground">15</div>
              <div className="text-[11px] text-muted-foreground mt-1">含A-to-Z索赔</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">满意度</div>
              <div className="text-[24px] font-semibold text-success">4.8</div>
              <div className="text-[11px] text-muted-foreground mt-1">5星满分</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">2,100</div>
              <div className="text-[11px] text-muted-foreground mt-1">豆包-Seed-1.8</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tickets">客服工单</TabsTrigger>
            <TabsTrigger value="disputes">纠纷处理</TabsTrigger>
            <TabsTrigger value="languages">多语种</TabsTrigger>
            <TabsTrigger value="compliance">话术合规</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 客服工单 */}
          <TabsContent value="tickets" className="space-y-4">
            {/* 操作栏 */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索工单、客户..."
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
                    <option value="pending">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="resolved">已解决</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* 工单列表 */}
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="bg-white border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-foreground">{ticket.subject}</span>
                          <Badge variant="outline" className="text-[11px]">{ticket.platform}</Badge>
                          <Badge variant="outline" className="text-[11px]">{getTypeLabel(ticket.type)}</Badge>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          <span>客户: {ticket.customer}</span>
                          <span>语言: {ticket.language}</span>
                          <span>ID: {ticket.id}</span>
                          <span>{ticket.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {ticket.aiHandled ? (
                            <Badge variant="outline" className="bg-success/10 text-success text-[10px]">
                              <Bot className="h-3 w-3 mr-1" />
                              AI已处理
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning text-[10px]">
                              <User className="h-3 w-3 mr-1" />
                              待人工
                            </Badge>
                          )}
                          {ticket.complianceChecked && (
                            <Badge variant="outline" className="bg-success/10 text-success text-[10px]">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              合规校验
                            </Badge>
                          )}
                          {ticket.satisfaction && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">满意度:</span>
                              {getSatisfactionStars(ticket.satisfaction)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info(`查看工单详情: ${ticket.subject}`)}>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          详情
                        </Button>
                        {ticket.status === 'pending' && (
                          <Button size="sm" onClick={() => toast.success('工单已处理！')}>
                            <Send className="h-3 w-3 mr-1" />
                            处理
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 纠纷处理 */}
          <TabsContent value="disputes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">纠纷处理中心</CardTitle>
                  <CardDescription>对接TK/亚马逊纠纷API，自动生成标准化和解方案</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockDisputes.map((dispute) => (
                      <div key={dispute.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-foreground">订单 #{dispute.orderId}</span>
                            <Badge variant="outline" className="text-[10px]">{dispute.platform}</Badge>
                            <Badge variant="outline" className="text-[10px]">{dispute.type === 'a-to-z' ? 'A-to-Z索赔' : dispute.type === 'refund' ? '退款' : '退货'}</Badge>
                          </div>
                          <Badge variant="outline" className={`${dispute.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-primary/10 text-primary border-primary/20'} text-[10px]`}>
                            {dispute.status === 'pending' ? '待处理' : '处理中'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-2">
                          客户: {dispute.customer} · 金额: ${dispute.amount}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] text-muted-foreground">AI建议方案:</span>
                          <span className="text-[11px] text-primary font-medium">{dispute.solution}</span>
                          {dispute.aiSuggested && (
                            <Badge variant="outline" className="bg-success/10 text-success text-[9px]">AI推荐</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => toast.info('已拒绝方案')}>拒绝</Button>
                          <Button size="sm" onClick={() => toast.success('已执行方案！')}>执行方案</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">纠纷处理规则</CardTitle>
                  <CardDescription>自动识别纠纷类型，生成标准化和解方案</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[12px] font-medium text-foreground mb-1">退款纠纷</div>
                      <div className="text-[11px] text-muted-foreground">
                        自动生成全额退款/补发商品方案，执行平台操作
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[12px] font-medium text-foreground mb-1">退货纠纷</div>
                      <div className="text-[11px] text-muted-foreground">
                        识别退货原因，生成分段处理方案
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[12px] font-medium text-foreground mb-1">A-to-Z索赔</div>
                      <div className="text-[11px] text-muted-foreground">
                        亚马逊专属，自动生成和解方案并执行
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-[12px] font-medium text-foreground mb-1">物流轨迹回复</div>
                      <div className="text-[11px] text-muted-foreground">
                        调用ERP物流数据，精准回复买家物流节点问题
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 多语种 */}
          <TabsContent value="languages" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">多语种支持</CardTitle>
                <CardDescription>TK东南亚（印尼语/泰语/越南语）+ 亚马逊（英语/德语/日语）</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {languageSupport.map((lang) => (
                    <div key={lang.code} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-[13px] font-medium text-foreground">{lang.name}</span>
                        <Badge variant="outline" className="text-[10px]">{lang.platform}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">翻译准确率</span>
                        <span className="text-success font-medium">{lang.accuracy}%</span>
                      </div>
                      <Progress value={lang.accuracy} className="h-1.5 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 话术合规 */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">话术合规过滤</CardTitle>
                <CardDescription>回复前校验平台禁用语，违规则自动替换为合规表述</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceWords.map((word) => (
                    <div key={word.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Ban className="h-4 w-4 text-destructive" />
                          <span className="text-[13px] text-destructive line-through">{word.word}</span>
                        </div>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-[13px] text-success">{word.replacement}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success text-[10px]">已启用</Badge>
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
                <CardDescription>模型选择、回复策略、话术模板配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">豆包-Seed-1.8 用于多语种客服回复</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="doubao">豆包-Seed-1.8</option>
                      <option value="deepseek">DeepSeek-V3</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">自动回复模式</div>
                      <div className="text-[11px] text-muted-foreground">AI自动回复 + 纠纷自动处理</div>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success">已启用</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">话术合规校验</div>
                      <div className="text-[11px] text-muted-foreground">回复前自动校验平台禁用语</div>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success">已启用</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">物流数据对接</div>
                      <div className="text-[11px] text-muted-foreground">ERP物流轨迹API</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      配置
                    </Button>
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
