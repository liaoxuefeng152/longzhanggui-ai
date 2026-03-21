'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';

interface Ticket {
  id: string;
  customer: string;
  platform: string;
  type: 'inquiry' | 'complaint' | 'refund' | 'dispute';
  subject: string;
  status: 'pending' | 'processing' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  agent: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  messages: number;
}

const typeConfig: Record<string, { label: string; className: string }> = {
  inquiry: { label: '咨询', className: 'bg-primary/10 text-primary' },
  complaint: { label: '投诉', className: 'bg-warning/10 text-warning' },
  refund: { label: '退款', className: 'bg-destructive/10 text-destructive' },
  dispute: { label: '纠纷', className: 'bg-destructive text-white' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'bg-warning/10 text-warning' },
  processing: { label: '处理中', className: 'bg-primary/10 text-primary' },
  resolved: { label: '已解决', className: 'bg-success text-white' },
  escalated: { label: '已升级', className: 'bg-destructive text-white' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: '低', className: 'bg-muted text-muted-foreground' },
  medium: { label: '中', className: 'bg-warning/10 text-warning' },
  high: { label: '高', className: 'bg-destructive/10 text-destructive' },
};

export default function CustomerTicketsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const tickets: Ticket[] = [
    {
      id: 'TK001',
      customer: 'Ahmad Suryadi',
      platform: 'TK印尼',
      type: 'inquiry',
      subject: '询问发货时间',
      status: 'resolved',
      priority: 'low',
      agent: 'AI客服',
      createdAt: '2024-02-20 10:30',
      updatedAt: '2024-02-20 10:35',
      language: '印尼语',
      messages: 3,
    },
    {
      id: 'TK002',
      customer: 'Somsak Prasert',
      platform: 'TK泰国',
      type: 'dispute',
      subject: '商品与描述不符，要求退款',
      status: 'processing',
      priority: 'high',
      agent: 'AI客服',
      createdAt: '2024-02-20 09:15',
      updatedAt: '2024-02-20 11:20',
      language: '泰语',
      messages: 8,
    },
    {
      id: 'TK003',
      customer: 'Nguyen Van A',
      platform: 'TK越南',
      type: 'complaint',
      subject: '物流时间过长',
      status: 'pending',
      priority: 'medium',
      agent: '-',
      createdAt: '2024-02-20 08:45',
      updatedAt: '2024-02-20 08:45',
      language: '越南语',
      messages: 1,
    },
    {
      id: 'AMZ001',
      customer: 'John Smith',
      platform: '亚马逊美国',
      type: 'refund',
      subject: 'A-to-Z索赔申请',
      status: 'escalated',
      priority: 'high',
      agent: '人工客服',
      createdAt: '2024-02-19 16:20',
      updatedAt: '2024-02-20 09:00',
      language: '英语',
      messages: 12,
    },
    {
      id: 'TK004',
      customer: 'Dewi Lestari',
      platform: 'TK印尼',
      type: 'inquiry',
      subject: '产品使用咨询',
      status: 'resolved',
      priority: 'low',
      agent: 'AI客服',
      createdAt: '2024-02-19 14:30',
      updatedAt: '2024-02-19 14:35',
      language: '印尼语',
      messages: 4,
    },
    {
      id: 'TK005',
      customer: 'Maria Santos',
      platform: 'TK菲律宾',
      type: 'complaint',
      subject: '收到破损商品',
      status: 'processing',
      priority: 'high',
      agent: 'AI客服',
      createdAt: '2024-02-19 11:00',
      updatedAt: '2024-02-19 15:30',
      language: '英语',
      messages: 6,
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const filteredTickets = tickets.filter((t) => {
    const matchSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">客服工单</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              多语种客服 · 纠纷处理 · 话术合规
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">今日工单</div>
              <div className="text-[20px] font-semibold text-foreground">86</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">待处理</div>
              <div className="text-[20px] font-semibold text-warning">23</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">处理中</div>
              <div className="text-[20px] font-semibold text-primary">15</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">已解决</div>
              <div className="text-[20px] font-semibold text-success">48</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">AI处理率</div>
              <div className="text-[20px] font-semibold text-foreground">92%</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选区 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索工单号/客户名"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="resolved">已解决</SelectItem>
                  <SelectItem value="escalated">已升级</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="inquiry">咨询</SelectItem>
                  <SelectItem value="complaint">投诉</SelectItem>
                  <SelectItem value="refund">退款</SelectItem>
                  <SelectItem value="dispute">纠纷</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterType('all'); }}>
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 工单列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30">
                  <TableHead className="text-[12px] font-medium text-muted-foreground px-6">工单号</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">客户</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">类型</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">主题</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">优先级</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">处理人</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">语言</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-border hover:bg-muted/30">
                    <TableCell className="px-6 text-[13px] font-medium text-primary">{ticket.id}</TableCell>
                    <TableCell className="text-[13px] text-foreground">{ticket.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">{ticket.platform}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${typeConfig[ticket.type].className} border-0 text-[11px]`}>
                        {typeConfig[ticket.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-foreground max-w-[150px] truncate">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${priorityConfig[ticket.priority].className} border-0 text-[11px]`}>
                        {priorityConfig[ticket.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[ticket.status].className}>
                        {statusConfig[ticket.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{ticket.agent}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{ticket.language}</TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsDetailOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 详情弹窗 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>工单详情 - {selectedTicket?.id}</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">客户</div>
                    <div className="text-[14px] font-medium">{selectedTicket.customer}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">平台/语言</div>
                    <div className="text-[14px]">{selectedTicket.platform} · {selectedTicket.language}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">工单类型</div>
                    <Badge variant="outline" className={`${typeConfig[selectedTicket.type].className} border-0`}>
                      {typeConfig[selectedTicket.type].label}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">状态</div>
                    <Badge className={statusConfig[selectedTicket.status].className}>
                      {statusConfig[selectedTicket.status].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">主题</div>
                  <div className="text-[14px] bg-muted/30 p-3 rounded-md">{selectedTicket.subject}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">对话记录 ({selectedTicket.messages}条)</div>
                  <div className="bg-muted/30 p-3 rounded-md h-[150px] overflow-y-auto text-[13px]">
                    <div className="text-muted-foreground text-center">对话记录加载中...</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">转人工处理</Button>
                  <Button className="flex-1">AI自动回复</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
