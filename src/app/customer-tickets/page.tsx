'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
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
  RefreshCw,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getTickets,
  getTicketStats,
  closeTicket,
  assignTicket,
  Ticket,
  TicketStats,
} from '@/lib/api/tickets';
import { logout } from '@/lib/api/auth';

const typeConfig: Record<string, { label: string; className: string }> = {
  inquiry: { label: '咨询', className: 'bg-primary/10 text-primary' },
  complaint: { label: '投诉', className: 'bg-warning/10 text-warning' },
  refund: { label: '退款', className: 'bg-destructive/10 text-destructive' },
  dispute: { label: '纠纷', className: 'bg-destructive text-white' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'bg-warning/10 text-warning' },
  open: { label: '待处理', className: 'bg-warning/10 text-warning' },
  processing: { label: '处理中', className: 'bg-primary/10 text-primary' },
  in_progress: { label: '处理中', className: 'bg-primary/10 text-primary' },
  resolved: { label: '已解决', className: 'bg-success text-white' },
  closed: { label: '已关闭', className: 'bg-muted text-muted-foreground' },
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // 获取工单列表
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        getTickets({
          page: 1,
          page_size: 100,
          status: filterStatus === 'all' ? undefined : filterStatus,
          priority: filterPriority === 'all' ? undefined : filterPriority,
        }),
        getTicketStats(),
      ]);
      setTickets(ticketsRes.tickets);
      setStats(statsRes);
    } catch (error) {
      console.error('获取工单列表失败:', error);
      toast.error('获取工单列表失败');
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
    fetchTickets();
  }, [router, filterStatus, filterPriority]);

  // 过滤工单
  const filteredTickets = tickets.filter((t) => {
    const matchSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // 关闭工单
  const handleCloseTicket = async (ticketId: string) => {
    const resolution = prompt('请输入解决方案:');
    if (!resolution) return;
    
    setIsClosing(true);
    try {
      await closeTicket(ticketId, resolution);
      toast.success('工单已关闭');
      setIsDetailOpen(false);
      fetchTickets();
    } catch (error) {
      console.error('关闭工单失败:', error);
      toast.error('关闭工单失败');
    } finally {
      setIsClosing(false);
    }
  };

  // 分配工单
  const handleAssignTicket = async (ticketId: string) => {
    const assignedTo = prompt('请输入分配给的用户ID:');
    if (!assignedTo) return;
    
    try {
      await assignTicket(ticketId, assignedTo);
      toast.success('工单已分配');
      fetchTickets();
    } catch (error) {
      console.error('分配工单失败:', error);
      toast.error('分配工单失败');
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

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // 获取优先级徽章
  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority] || priorityConfig.low;
    return (
      <Badge variant="outline" className={`${config.className} border-0 text-[11px]`}>
        {config.label}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">客服工单</h1>
              <p className="text-[14px] text-muted-foreground">多语种客服 · 纠纷处理 · 话术合规</p>
            </div>
          </div>
        </div>

        {/* 统计卡片 - 工作台风格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总工单</p>
                  <p className="text-[20px] font-semibold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">待处理</p>
                  <p className="text-[20px] font-semibold text-amber-600">{stats?.open || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">处理中</p>
                  <p className="text-[20px] font-semibold text-purple-600">{stats?.in_progress || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">已解决</p>
                  <p className="text-[20px] font-semibold text-green-600">{stats?.resolved || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">已关闭</div>
              <div className="text-[20px] font-semibold text-muted-foreground">{stats?.closed || 0}</div>
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
                  placeholder="搜索工单ID/标题/用户ID"
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
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部优先级</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchTickets} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 工单列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无工单数据
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">工单ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">标题</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">用户ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">优先级</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">处理人</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">创建时间</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="border-border hover:bg-muted/30">
                      <TableCell className="px-6 text-[13px] font-medium text-primary">
                        {ticket.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground max-w-[200px] truncate">
                        {ticket.title}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {ticket.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {ticket.assigned_to || '-'}
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleString('zh-CN')}
                      </TableCell>
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
            )}
          </CardContent>
        </Card>

        {/* 详情弹窗 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>工单详情</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">工单ID</div>
                    <div className="text-[14px] font-mono">{selectedTicket.id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">用户ID</div>
                    <div className="text-[14px]">{selectedTicket.user_id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">优先级</div>
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">状态</div>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">创建时间</div>
                    <div className="text-[14px]">
                      {new Date(selectedTicket.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">处理人</div>
                    <div className="text-[14px]">{selectedTicket.assigned_to || '未分配'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">标题</div>
                  <div className="text-[14px] bg-muted/30 p-3 rounded-md">{selectedTicket.title}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">内容</div>
                  <div className="text-[14px] bg-muted/30 p-3 rounded-md max-h-[150px] overflow-y-auto">
                    {selectedTicket.content}
                  </div>
                </div>
                {selectedTicket.resolution && (
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">解决方案</div>
                    <div className="text-[14px] bg-success/10 p-3 rounded-md">
                      {selectedTicket.resolution}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleAssignTicket(selectedTicket.id)}
                  >
                    分配处理
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    disabled={isClosing || selectedTicket.status === 'closed'}
                  >
                    {isClosing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    关闭工单
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
