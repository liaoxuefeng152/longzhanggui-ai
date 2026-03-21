'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  Download,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Ban,
} from 'lucide-react';

interface TaskLog {
  id: string;
  type: string;
  user: string;
  platform: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'blocked' | 'cancelled';
  complianceStatus: 'passed' | 'failed' | 'pending';
  riskStatus: 'normal' | 'warning' | 'blocked';
  duration: number;
  startTime: string;
  endTime: string;
  details: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: { label: '待执行', icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  running: { label: '执行中', icon: RefreshCw, color: 'text-primary', bgColor: 'bg-primary/10' },
  completed: { label: '已完成', icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  error: { label: '异常', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  blocked: { label: '风控拦截', icon: Shield, color: 'text-warning', bgColor: 'bg-warning/10' },
  cancelled: { label: '已取消', icon: Ban, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

export default function TaskLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<TaskLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [logs, setLogs] = useState<TaskLog[]>([
    {
      id: 'T202402200001',
      type: '选品智能体',
      user: '张明',
      platform: 'TK印尼',
      status: 'completed',
      complianceStatus: 'passed',
      riskStatus: 'normal',
      duration: 125,
      startTime: '2024-02-20 14:30:00',
      endTime: '2024-02-20 14:32:05',
      details: '成功筛选出5个合规爆款商品，已回写ERP',
    },
    {
      id: 'T202402200002',
      type: '图片设计智能体',
      user: '李华',
      platform: '亚马逊美国',
      status: 'running',
      complianceStatus: 'passed',
      riskStatus: 'normal',
      duration: 0,
      startTime: '2024-02-20 14:28:00',
      endTime: '',
      details: '正在生成主图...',
    },
    {
      id: 'T202402200003',
      type: 'Listing优化智能体',
      user: '王芳',
      platform: 'TK泰国',
      status: 'completed',
      complianceStatus: 'passed',
      riskStatus: 'normal',
      duration: 85,
      startTime: '2024-02-20 14:25:00',
      endTime: '2024-02-20 14:26:25',
      details: '标题优化完成，关键词挖掘完成，已同步至店铺',
    },
    {
      id: 'T202402200004',
      type: '广告投放智能体',
      user: '赵伟',
      platform: 'TK Ads',
      status: 'blocked',
      complianceStatus: 'passed',
      riskStatus: 'blocked',
      duration: 12,
      startTime: '2024-02-20 14:20:00',
      endTime: '2024-02-20 14:20:12',
      details: '风控触发：单日广告消耗已达500元上限，需管理员确认',
    },
    {
      id: 'T202402200005',
      type: 'AI客服智能体',
      user: '刘静',
      platform: 'TK越南',
      status: 'completed',
      complianceStatus: 'passed',
      riskStatus: 'normal',
      duration: 8,
      startTime: '2024-02-20 14:18:00',
      endTime: '2024-02-20 14:18:08',
      details: '已自动回复用户询盘，语言：越南语',
    },
    {
      id: 'T202402200006',
      type: '视频生成智能体',
      user: '陈强',
      platform: 'TK印尼',
      status: 'error',
      complianceStatus: 'failed',
      riskStatus: 'normal',
      duration: 45,
      startTime: '2024-02-20 14:15:00',
      endTime: '2024-02-20 14:15:45',
      details: '合规校验失败：视频脚本包含禁用词"100%有效"',
    },
    {
      id: 'T202402200007',
      type: '数据复盘智能体',
      user: '周敏',
      platform: '全平台',
      status: 'completed',
      complianceStatus: 'pending',
      riskStatus: 'normal',
      duration: 320,
      startTime: '2024-02-20 03:00:00',
      endTime: '2024-02-20 03:05:20',
      details: '日报生成完成，已推送飞书，已创建3个优化任务',
    },
    {
      id: 'T202402200008',
      type: '选品智能体',
      user: '吴洋',
      platform: '亚马逊美国',
      status: 'pending',
      complianceStatus: 'pending',
      riskStatus: 'normal',
      duration: 0,
      startTime: '2024-02-20 14:35:00',
      endTime: '',
      details: '任务已排队，等待执行...',
    },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchAgent = filterAgent === 'all' || log.type === filterAgent;
    return matchSearch && matchStatus && matchAgent;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      passed: { label: '合规通过', className: 'bg-success/10 text-success' },
      failed: { label: '合规失败', className: 'bg-destructive/10 text-destructive' },
      pending: { label: '待校验', className: 'bg-muted text-muted-foreground' },
    };
    const c = config[status];
    return <Badge variant="outline" className={`${c.className} border-0 text-[11px]`}>{c.label}</Badge>;
  };

  const getRiskBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      normal: { label: '正常', className: 'bg-success/10 text-success' },
      warning: { label: '预警', className: 'bg-warning/10 text-warning' },
      blocked: { label: '已拦截', className: 'bg-destructive/10 text-destructive' },
    };
    const c = config[status];
    return <Badge variant="outline" className={`${c.className} border-0 text-[11px]`}>{c.label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">任务日志</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              全链路操作记录 · 合规状态 · 风控状态
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出日志
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-6 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">总任务</div>
              <div className="text-[20px] font-semibold text-foreground">1,258</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">已完成</div>
              <div className="text-[20px] font-semibold text-success">1,180</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">执行中</div>
              <div className="text-[20px] font-semibold text-primary">45</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">异常</div>
              <div className="text-[20px] font-semibold text-destructive">12</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">风控拦截</div>
              <div className="text-[20px] font-semibold text-warning">8</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">成功率</div>
              <div className="text-[20px] font-semibold text-foreground">98.5%</div>
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
                  placeholder="搜索任务ID/用户"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="任务状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待执行</SelectItem>
                  <SelectItem value="running">执行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="error">异常</SelectItem>
                  <SelectItem value="blocked">风控拦截</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="智能体类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="选品智能体">选品智能体</SelectItem>
                  <SelectItem value="图片设计智能体">图片设计智能体</SelectItem>
                  <SelectItem value="视频生成智能体">视频生成智能体</SelectItem>
                  <SelectItem value="Listing优化智能体">Listing优化</SelectItem>
                  <SelectItem value="广告投放智能体">广告投放</SelectItem>
                  <SelectItem value="AI客服智能体">AI客服</SelectItem>
                  <SelectItem value="数据复盘智能体">数据复盘</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterAgent('all');
                }}
              >
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 日志列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30">
                  <TableHead className="text-[12px] font-medium text-muted-foreground px-6">任务ID</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">类型</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">用户</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">合规状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">风控状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">耗时(s)</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">开始时间</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-muted/30">
                    <TableCell className="px-6 text-[13px] font-medium text-primary">{log.id}</TableCell>
                    <TableCell className="text-[13px] text-foreground">{log.type}</TableCell>
                    <TableCell className="text-[13px] text-foreground">{log.user}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{log.platform}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{getComplianceBadge(log.complianceStatus)}</TableCell>
                    <TableCell>{getRiskBadge(log.riskStatus)}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {log.duration > 0 ? log.duration : '-'}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">{log.startTime}</TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
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
              <DialogTitle>任务详情 - {selectedLog?.id}</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">任务类型</div>
                    <div className="text-[14px] font-medium">{selectedLog.type}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">执行用户</div>
                    <div className="text-[14px] font-medium">{selectedLog.user}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">目标平台</div>
                    <div className="text-[14px] font-medium">{selectedLog.platform}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">任务状态</div>
                    <div>{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">开始时间</div>
                    <div className="text-[14px]">{selectedLog.startTime}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">结束时间</div>
                    <div className="text-[14px]">{selectedLog.endTime || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">合规状态</div>
                    <div>{getComplianceBadge(selectedLog.complianceStatus)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">风控状态</div>
                    <div>{getRiskBadge(selectedLog.riskStatus)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">执行详情</div>
                  <div className="text-[14px] bg-muted/30 p-3 rounded-md">{selectedLog.details}</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
