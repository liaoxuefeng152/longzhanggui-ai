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
  Eye,
  MessageCircle,
  Filter,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerTicket {
  id: string;
  platform: 'TK' | 'Amazon';
  type: 'inquiry' | 'dispute' | 'refund' | 'shipping';
  status: 'pending' | 'processing' | 'resolved' | 'escalated';
  customer: string;
  language: string;
  subject: string;
  message: string;
  aiHandled: boolean;
  complianceChecked: boolean;
  satisfaction?: number;
  createdAt: string;
  reply?: string;
  order_id?: string;
}

interface ReplyTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  createdAt: string;
}

interface Dispute {
  id: string;
  ticketId: string;
  platform: 'TK' | 'Amazon';
  type: 'return' | 'quality' | 'shipping' | 'payment';
  status: 'pending' | 'investigating' | 'resolved';
  customer: string;
  reason: string;
  aiSuggestion?: string;
  createdAt: string;
}

interface AgentConfig {
  model: 'doubao-mini' | 'doubao-pro' | 'deepseek-lite';
  autoTranslate: boolean;
  defaultLanguage: string;
}

export default function CustomerServicePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 智能体在线状态
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline'>('online');
  
  // 回复模板
  const [templates, setTemplates] = useState<ReplyTemplate[]>([
    {
      id: 'TPL001',
      name: '物流查询模板',
      category: 'shipping',
      content: '尊敬的客户，您好！关于您询问的物流状态，您的订单正在配送中，预计[X]天内到达。感谢您的耐心等待！',
      createdAt: '2026-03-20',
    },
    {
      id: 'TPL002',
      name: '退款申请模板',
      category: 'refund',
      content: '尊敬的客户，您好！我们已收到您的退款申请，正在审核中。审核通过后将在[3-5]个工作日内完成退款。',
      createdAt: '2026-03-20',
    },
    {
      id: 'TPL003',
      name: '商品质量反馈',
      category: 'quality',
      content: '尊敬的客户，非常抱歉给您带来不好的体验。请您提供更多详细信息，我们会尽快为您处理并提供满意的解决方案。',
      createdAt: '2026-03-20',
    },
  ]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReplyTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'shipping',
    content: '',
  });
  
  // 纠纷处理
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  
  // 智能体配置
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    model: 'doubao-mini',
    autoTranslate: true,
    defaultLanguage: 'en',
  });
  
  // 对话框状态
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicket | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // 回复表单
  const [replyForm, setReplyForm] = useState({
    message: '',
    language: 'auto',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    // 加载智能体状态
    const savedAgentStatus = localStorage.getItem('agentStatus') as 'online' | 'offline' | null;
    if (savedAgentStatus) {
      setAgentStatus(savedAgentStatus);
    }
    
    // 加载智能体配置
    const savedConfig = localStorage.getItem('agentConfig');
    if (savedConfig) {
      setAgentConfig(JSON.parse(savedConfig));
    }
    
    // 加载回复模板
    const savedTemplates = localStorage.getItem('replyTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
    
    fetchTickets();
    
    // 初始化纠纷数据（如果有dispute类型的工单）
    const mockDisputes: Dispute[] = [
      {
        id: 'DSP001',
        ticketId: 'TK003',
        platform: 'TK',
        type: 'quality',
        status: 'pending',
        customer: 'Siti Rahayu',
        reason: '收到的商品与描述不符，质量有问题',
        createdAt: '2026-03-21 10:30',
      },
      {
        id: 'DSP002',
        ticketId: 'AMZ002',
        platform: 'Amazon',
        type: 'return',
        status: 'investigating',
        customer: 'John Smith',
        reason: '要求退货，收到商品已损坏',
        aiSuggestion: '建议解决方案：\n\n1. 立即与客户联系，了解具体情况\n2. 提供退货退款或换货选项\n3. 补偿优惠券或积分作为歉意\n4. 优化产品和服务流程，防止类似问题\n\n预计处理时间：3-5个工作日',
        createdAt: '2026-03-21 09:15',
      },
    ];
    setDisputes(mockDisputes);
  }, [router]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const mockTickets: CustomerTicket[] = [
        {
          id: 'TK001',
          platform: 'TK',
          type: 'inquiry',
          status: 'resolved',
          customer: 'Budi Santoso',
          language: '印尼语',
          subject: '询问物流状态 - 订单#TK20260321001',
          message: '你好，我的订单什么时候能到？已经发货3天了。',
          aiHandled: true,
          complianceChecked: true,
          satisfaction: 5,
          createdAt: '2026-03-21 14:30',
          reply: '您好，您的订单目前正在运输中，预计明天到达。感谢您的耐心等待！',
        },
        {
          id: 'AM001',
          platform: 'Amazon',
          type: 'dispute',
          status: 'processing',
          customer: 'John Smith',
          language: '英语',
          subject: '申请退款 - 商品与描述不符',
          message: 'The product I received is different from the description. I want a refund.',
          aiHandled: true,
          complianceChecked: true,
          createdAt: '2026-03-21 13:15',
          order_id: 'AM20260321002',
        },
        {
          id: 'TK002',
          platform: 'TK',
          type: 'shipping',
          status: 'pending',
          customer: 'Somchai Thai',
          language: '泰语',
          subject: '物流异常 - 无法派送',
          message: '快递员联系不上我，请问可以重新派送吗？',
          aiHandled: false,
          complianceChecked: true,
          createdAt: '2026-03-21 12:00',
          order_id: 'TK20260320003',
        },
        {
          id: 'AM002',
          platform: 'Amazon',
          type: 'refund',
          status: 'pending',
          customer: 'Emma Wilson',
          language: '英语',
          subject: '退款申请 - 商品质量问题',
          message: 'The product has a quality issue. The button is broken.',
          aiHandled: false,
          complianceChecked: true,
          createdAt: '2026-03-20 16:45',
        },
      ];
      setTickets(mockTickets);
    } catch (error) {
      toast.error('获取工单失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换智能体状态
  const toggleAgentStatus = () => {
    const newStatus = agentStatus === 'online' ? 'offline' : 'online';
    
    if (newStatus === 'offline') {
      // 切换到离线需要确认
      if (!confirm('确定要切换到离线状态吗？离线后AI将不会自动处理新工单。')) {
        return;
      }
    }
    
    setAgentStatus(newStatus);
    localStorage.setItem('agentStatus', newStatus);
    
    if (newStatus === 'online') {
      toast.success('智能体已上线', { description: 'AI将自动处理新工单' });
    } else {
      toast.warning('智能体已离线', { description: '新工单将不会自动处理' });
    }
  };

  // 回复模板管理
  const handleUseTemplate = (template: ReplyTemplate) => {
    setReplyForm(prev => ({
      ...prev,
      message: template.content,
    }));
    setIsReplyOpen(true);
    toast.success('模板已应用', { description: template.name });
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', category: 'shipping', content: '' });
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: ReplyTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      category: template.category,
      content: template.content,
    });
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('确定要删除此模板吗？')) return;
    const newTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(newTemplates);
    localStorage.setItem('replyTemplates', JSON.stringify(newTemplates));
    toast.success('模板已删除');
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      toast.error('请填写模板名称和内容');
      return;
    }

    let newTemplates;
    if (editingTemplate) {
      // 编辑现有模板
      newTemplates = templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...templateForm }
          : t
      );
      toast.success('模板已更新');
    } else {
      // 新增模板
      const newTemplate: ReplyTemplate = {
        id: `TPL${Date.now()}`,
        ...templateForm,
        createdAt: new Date().toISOString().split('T')[0],
      };
      newTemplates = [newTemplate, ...templates];
      toast.success('模板已添加');
    }

    setTemplates(newTemplates);
    localStorage.setItem('replyTemplates', JSON.stringify(newTemplates));
    
    setIsTemplateDialogOpen(false);
    setTemplateForm({ name: '', category: 'shipping', content: '' });
    setEditingTemplate(null);
  };

  // 纠纷处理
  const handleGenerateSolution = async (dispute: Dispute) => {
    setIsGeneratingSolution(true);
    try {
      // 模拟AI生成解决方案
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const solution = `建议解决方案：\n\n1. 立即与客户联系，了解具体情况\n2. 提供退货退款或换货选项\n3. 补偿优惠券或积分作为歉意\n4. 优化产品和服务流程，防止类似问题\n\n预计处理时间：3-5个工作日`;
      
      setDisputes(prev => prev.map(d => 
        d.id === dispute.id 
          ? { ...d, aiSuggestion: solution, status: 'investigating' as const }
          : d
      ));
      
      toast.success('AI解决方案已生成');
    } catch (error) {
      toast.error('生成失败');
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  const handleResolveDispute = (disputeId: string) => {
    if (!confirm('确定要解决此纠纷吗？')) return;
    setDisputes(prev => prev.map(d => 
      d.id === disputeId ? { ...d, status: 'resolved' as const } : d
    ));
    toast.success('纠纷已解决');
  };

  // 配置设置
  const handleSaveConfig = () => {
    localStorage.setItem('agentConfig', JSON.stringify(agentConfig));
    toast.success('配置已保存');
  };

  // AI自动回复
  const handleAIReply = async (ticket: CustomerTicket) => {
    if (agentStatus === 'offline') {
      toast.error('智能体离线中', { description: '请先切换到在线状态' });
      return;
    }

    setIsProcessing(ticket.id);
    try {
      // 模拟AI生成回复
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiReply = `尊敬的 ${ticket.customer}，\n\n感谢您联系我们。关于您反馈的问题，我们非常重视。\n\n我们正在处理您的请求，预计将在24小时内给您一个满意的答复。\n\n如有任何问题，请随时联系我们。\n\n祝好，\n客服团队`;
      
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { 
          ...t, 
          status: 'resolved' as const,
          aiHandled: true,
          reply: aiReply,
        } : t
      ));
      
      toast.success('AI回复已发送');
    } catch (error) {
      toast.error('发送失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 手动回复
  const handleManualReply = async () => {
    if (!selectedTicket || !replyForm.message.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    setIsProcessing(selectedTicket.id);
    try {
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { 
          ...t, 
          status: 'resolved' as const,
          reply: replyForm.message,
        } : t
      ));
      
      toast.success('回复已发送');
      setIsReplyOpen(false);
      setReplyForm({ message: '', language: 'auto' });
    } catch (error) {
      toast.error('发送失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 转人工
  const handleEscalate = async (ticket: CustomerTicket) => {
    setIsProcessing(ticket.id);
    try {
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, status: 'escalated' as const } : t
      ));
      toast.success('已转人工处理');
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 关闭工单
  const handleCloseTicket = async (ticket: CustomerTicket) => {
    if (!confirm('确定要关闭此工单吗？')) return;
    
    setIsProcessing(ticket.id);
    try {
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, status: 'resolved' as const } : t
      ));
      toast.success('工单已关闭');
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 查看详情
  const handleViewDetail = (ticket: CustomerTicket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  // 打开回复
  const handleOpenReply = (ticket: CustomerTicket) => {
    setSelectedTicket(ticket);
    setReplyForm({ message: '', language: 'auto' });
    setIsReplyOpen(true);
  };

  // 评价满意
  const handleRatePositive = async (ticket: CustomerTicket) => {
    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, satisfaction: 5 } : t
    ));
    toast.success('已标记为满意');
  };

  // 评价不满意
  const handleRateNegative = async (ticket: CustomerTicket) => {
    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, satisfaction: 1 } : t
    ));
    toast.success('已标记为不满意');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-warning/10 text-warning' },
      processing: { label: '处理中', className: 'bg-primary/10 text-primary' },
      resolved: { label: '已解决', className: 'bg-success/10 text-success' },
      escalated: { label: '已转人工', className: 'bg-[#165DFF]500/10 text-[#165DFF]500' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
      inquiry: { label: '咨询', className: 'bg-[#165DFF]500/10 text-[#165DFF]500' },
      dispute: { label: '纠纷', className: 'bg-destructive/10 text-destructive' },
      refund: { label: '退款', className: 'bg-warning/10 text-warning' },
      shipping: { label: '物流', className: 'bg-[#165DFF]500/10 text-[#165DFF]500' },
    };
    const { label, className } = config[type] || config.inquiry;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getPlatformBadge = (platform: string) => {
    const config: Record<string, { label: string; className: string }> = {
      TK: { label: 'TikTok', className: 'bg-pink-500/10 text-pink-500' },
      Amazon: { label: 'Amazon', className: 'bg-[#FF7D00]500/10 text-[#FF7D00]500' },
    };
    const { label, className } = config[platform] || { label: platform, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 统计数据
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const processingTickets = tickets.filter(t => t.status === 'processing').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const aiHandledRate = tickets.length > 0 ? (tickets.filter(t => t.aiHandled).length / tickets.length * 100) : 0;

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
              <h1 className="text-[18px] font-semibold text-foreground">客服智能体</h1>
              <p className="text-[14px] text-muted-foreground">AI客服 · 多语言翻译 · 纠纷处理 · 合规回复</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchTickets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Badge 
              className={`cursor-pointer transition-colors ${
                agentStatus === 'online' 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              }`}
              onClick={toggleAgentStatus}
            >
              <Bot className={`h-3 w-3 mr-1 ${agentStatus === 'offline' ? 'text-gray-300' : ''}`} />
              {agentStatus === 'online' ? 'AI在线' : 'AI离线'}
            </Badge>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Languages className="h-3 w-3 mr-1" />
            多语言翻译
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            合规回复
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            纠纷处理
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Globe className="h-3 w-3 mr-1" />
            跨时区覆盖
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日工单</div>
              <div className="text-[24px] font-semibold text-foreground">{totalTickets}</div>
              <div className="text-[11px] text-muted-foreground mt-1">全部工单</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">待处理</div>
              <div className="text-[24px] font-semibold text-warning">{pendingTickets}</div>
              <div className="text-[11px] text-muted-foreground mt-1">需回复</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">处理中</div>
              <div className="text-[24px] font-semibold text-primary">{processingTickets}</div>
              <div className="text-[11px] text-muted-foreground mt-1">进行中</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已解决</div>
              <div className="text-[24px] font-semibold text-success">{resolvedTickets}</div>
              <div className="text-[11px] text-muted-foreground mt-1">完成处理</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">AI处理率</div>
              <div className="text-[24px] font-semibold text-success">{aiHandledRate.toFixed(1)}%</div>
              <div className="text-[11px] text-muted-foreground mt-1">自动响应</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tickets">工单列表</TabsTrigger>
            <TabsTrigger value="disputes">纠纷处理</TabsTrigger>
            <TabsTrigger value="templates">回复模板</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 工单列表 */}
          <TabsContent value="tickets" className="space-y-4">
            {/* 筛选条件 */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索工单..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select 
                    className="px-4 py-2 border border-border rounded-md text-[14px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">全部状态</option>
                    <option value="pending">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="resolved">已解决</option>
                    <option value="escalated">已转人工</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 工单列表 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">客服工单</CardTitle>
                <CardDescription>AI自动回复 + 人工介入 + 合规校验</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    加载中...
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">暂无工单数据</div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              ticket.status === 'resolved' ? 'bg-success/10' : 
                              ticket.status === 'escalated' ? 'bg-[#165DFF]500/10' : 'bg-warning/10'
                            }`}>
                              {ticket.aiHandled ? (
                                <Bot className="h-5 w-5 text-primary" />
                              ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-muted-foreground">#{ticket.id}</span>
                                {getPlatformBadge(ticket.platform)}
                                {getTypeBadge(ticket.type)}
                                {getStatusBadge(ticket.status)}
                                {ticket.aiHandled && (
                                  <Badge variant="outline" className="bg-primary/5 text-primary">
                                    <Bot className="h-3 w-3 mr-1" />
                                    AI处理
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[14px] font-medium text-foreground">{ticket.subject}</div>
                              <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                                <span>客户: <span className="text-foreground">{ticket.customer}</span></span>
                                <span>语言: <span className="text-foreground">{ticket.language}</span></span>
                                <span>时间: <span className="text-foreground">{ticket.createdAt}</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetail(ticket)}>
                              <Eye className="h-3 w-3 mr-1" />
                              详情
                            </Button>
                            {(ticket.status === 'pending' || ticket.status === 'processing') && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAIReply(ticket)}
                                  disabled={isProcessing === ticket.id || agentStatus === 'offline'}
                                  title={agentStatus === 'offline' ? '智能体离线中，无法自动回复' : 'AI自动回复'}
                                >
                                  {isProcessing === ticket.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <Bot className={`h-3 w-3 mr-1 ${agentStatus === 'offline' ? 'text-muted-foreground' : ''}`} />
                                  )}
                                  AI回复
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleOpenReply(ticket)}
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  回复
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEscalate(ticket)}
                                  disabled={isProcessing === ticket.id}
                                >
                                  <ArrowRightLeft className="h-3 w-3 mr-1" />
                                  转人工
                                </Button>
                              </>
                            )}
                            {ticket.status === 'resolved' && (
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRatePositive(ticket)}
                                >
                                  <ThumbsUp className="h-3 w-3 text-success" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRateNegative(ticket)}
                                >
                                  <ThumbsDown className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 纠纷处理 */}
          <TabsContent value="disputes" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">纠纷案件</CardTitle>
                <CardDescription>AI辅助纠纷处理，自动生成解决方案</CardDescription>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-warning" />
                    <div>暂无待处理纠纷</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {disputes.map((dispute) => (
                      <Card key={dispute.id} className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-foreground">{dispute.customer}</span>
                                <Badge variant="outline">{dispute.platform}</Badge>
                                {getStatusBadge(dispute.status)}
                              </div>
                              <div className="text-[13px] text-muted-foreground">
                                纠纷原因: {dispute.reason}
                              </div>
                              {dispute.aiSuggestion && (
                                <div className="p-3 bg-[#165DFF]50 border border-blue-200 rounded-lg">
                                  <div className="text-[12px] font-medium text-[#165DFF]700 mb-1">AI 解决方案:</div>
                                  <div className="text-[12px] text-[#165DFF]600 whitespace-pre-line">
                                    {dispute.aiSuggestion}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!dispute.aiSuggestion && (
                                <Button
                                  size="sm"
                                  onClick={() => handleGenerateSolution(dispute)}
                                  disabled={isGeneratingSolution}
                                >
                                  {isGeneratingSolution ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3 w-3 mr-1" />
                                  )}
                                  生成方案
                                </Button>
                              )}
                              {dispute.status !== 'resolved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolveDispute(dispute.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  解决
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 回复模板 */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-medium">常用回复模板</div>
              <Button size="sm" onClick={handleAddTemplate}>
                <Plus className="h-4 w-4 mr-1" />
                新增模板
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-[15px]">{template.name}</CardTitle>
                        <CardDescription className="text-[11px]">
                          分类: {template.category} · 创建于 {template.createdAt}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[13px] text-muted-foreground p-3 bg-muted/30 rounded-lg mb-3">
                      {template.content}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Send className="h-3 w-3 mr-2" />
                      使用此模板
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 配置设置 */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">智能体配置</CardTitle>
                <CardDescription>模型选择、回复模板、多语言配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">当前使用豆包-Mini进行客服回复</div>
                    </div>
                    <select 
                      className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={agentConfig.model}
                      onChange={(e) => setAgentConfig({ ...agentConfig, model: e.target.value as any })}
                    >
                      <option value="doubao-mini">豆包-Mini</option>
                      <option value="doubao-pro">豆包-Pro</option>
                      <option value="deepseek-lite">DeepSeek-Lite</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">自动翻译</div>
                      <div className="text-[11px] text-muted-foreground">自动将客户消息翻译为目标语言</div>
                    </div>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        agentConfig.autoTranslate ? 'bg-primary' : 'bg-muted'
                      }`}
                      onClick={() => setAgentConfig({ ...agentConfig, autoTranslate: !agentConfig.autoTranslate })}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          agentConfig.autoTranslate ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">默认语言</div>
                      <div className="text-[11px] text-muted-foreground">自动回复使用的默认语言</div>
                    </div>
                    <select 
                      className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={agentConfig.defaultLanguage}
                      onChange={(e) => setAgentConfig({ ...agentConfig, defaultLanguage: e.target.value })}
                    >
                      <option value="en">English (英语)</option>
                      <option value="id">Indonesian (印尼语)</option>
                      <option value="th">Thai (泰语)</option>
                      <option value="vi">Vietnamese (越南语)</option>
                      <option value="zh">Chinese (中文)</option>
                    </select>
                  </div>
                  <Button onClick={handleSaveConfig} className="w-full">
                    保存配置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>工单详情</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">工单ID</div>
                    <div className="font-mono text-[14px]">#{selectedTicket.id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">状态</div>
                    <div>{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">平台</div>
                    <div>{getPlatformBadge(selectedTicket.platform)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">类型</div>
                    <div>{getTypeBadge(selectedTicket.type)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">主题</div>
                  <div className="text-[14px] font-medium">{selectedTicket.subject}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">客户消息</div>
                  <div className="p-3 bg-muted/30 rounded-lg text-[14px]">{selectedTicket.message}</div>
                </div>
                {selectedTicket.reply && (
                  <div>
                    <div className="text-[12px] text-muted-foreground">回复内容</div>
                    <div className="p-3 bg-success/10 rounded-lg text-[14px]">{selectedTicket.reply}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">客户</div>
                    <div className="text-[14px]">{selectedTicket.customer}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">语言</div>
                    <div className="text-[14px]">{selectedTicket.language}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">创建时间</div>
                  <div className="text-[14px]">{selectedTicket.createdAt}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 回复对话框 */}
        <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>回复客户</DialogTitle>
              <DialogDescription>{selectedTicket?.subject}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-[12px] text-muted-foreground mb-1">客户消息</div>
                <div className="text-[13px]">{selectedTicket?.message}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">回复内容</label>
                <textarea 
                  className="w-full h-32 p-3 border border-border rounded-md text-[14px] resize-none"
                  placeholder="请输入回复内容..."
                  value={replyForm.message}
                  onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[13px] font-medium">翻译语言</label>
                <select 
                  className="px-3 py-2 border border-border rounded-md text-[14px]"
                  value={replyForm.language}
                  onChange={(e) => setReplyForm({ ...replyForm, language: e.target.value })}
                >
                  <option value="auto">自动检测</option>
                  <option value="id">印尼语</option>
                  <option value="th">泰语</option>
                  <option value="vi">越南语</option>
                  <option value="en">英语</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplyOpen(false)}>取消</Button>
              <Button onClick={handleManualReply} disabled={isProcessing === selectedTicket?.id}>
                {isProcessing === selectedTicket?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                发送回复
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 模板编辑对话框 */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? '编辑模板' : '新增模板'}</DialogTitle>
              <DialogDescription>
                {editingTemplate ? '修改回复模板内容' : '创建新的回复模板'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium">模板名称 *</label>
                <input
                  type="text"
                  placeholder="例如：物流查询模板"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">分类</label>
                <select 
                  className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                >
                  <option value="shipping">物流</option>
                  <option value="refund">退款</option>
                  <option value="quality">商品质量</option>
                  <option value="payment">支付</option>
                  <option value="general">通用</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">模板内容 *</label>
                <textarea
                  className="w-full h-32 p-3 border border-border rounded-md text-[14px] resize-none"
                  placeholder="请输入模板内容，可使用 [X] 作为占位符"
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                />
                <div className="text-[11px] text-muted-foreground">
                  提示：使用 [X] 作为可替换内容的占位符
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>取消</Button>
              <Button onClick={handleSaveTemplate}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
