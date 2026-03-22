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
  Shield,
  Ban,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getTaskLogs,
  getTaskLogStats,
  retryTask,
  TaskLog,
  TaskLogStats,
} from '@/lib/api/task-logs';
import { logout } from '@/lib/api/auth';

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: { label: '待执行', icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  running: { label: '执行中', icon: RefreshCw, color: 'text-primary', bgColor: 'bg-primary/10' },
  completed: { label: '已完成', icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  failed: { label: '失败', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  blocked: { label: '风控拦截', icon: Shield, color: 'text-warning', bgColor: 'bg-warning/10' },
  cancelled: { label: '已取消', icon: Ban, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

export default function TaskLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [stats, setStats] = useState<TaskLogStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<TaskLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 获取任务日志
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        getTaskLogs({
          page: 1,
          page_size: 100,
          status: filterStatus === 'all' ? undefined : filterStatus,
          agent_id: filterAgent === 'all' ? undefined : filterAgent,
        }),
        getTaskLogStats(),
      ]);
      setLogs(logsRes.logs);
      setStats(statsRes);
    } catch (error) {
      console.error('获取任务日志失败:', error);
      toast.error('获取任务日志失败');
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
    fetchLogs();
  }, [router, filterStatus, filterAgent]);

  // 过滤日志
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.task_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // 重试任务
  const handleRetry = async (logId: string) => {
    try {
      await retryTask(logId);
      toast.success('任务已重新执行');
      fetchLogs();
    } catch (error) {
      console.error('重试任务失败:', error);
      toast.error('重试任务失败');
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

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
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
              <div className="text-[20px] font-semibold text-foreground">{stats?.total_tasks || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">已完成</div>
              <div className="text-[20px] font-semibold text-success">{stats?.success_count || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">失败</div>
              <div className="text-[20px] font-semibold text-destructive">{stats?.failed_count || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">成功率</div>
              <div className="text-[20px] font-semibold text-foreground">
                {stats?.total_tasks ? Math.round((stats.success_count / stats.total_tasks) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">平均耗时</div>
              <div className="text-[20px] font-semibold text-foreground">{stats?.avg_duration || 0}s</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">总Tokens</div>
              <div className="text-[20px] font-semibold text-foreground">{stats?.total_tokens?.toLocaleString() || 0}</div>
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
                  placeholder="搜索任务ID"
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
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="blocked">风控拦截</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 日志列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无任务日志数据
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">任务ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">智能体</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">操作</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">耗时(s)</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">Tokens</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">创建时间</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-muted/30">
                      <TableCell className="px-6 text-[13px] font-medium text-primary">{log.task_id.substring(0, 12)}...</TableCell>
                      <TableCell className="text-[13px] text-foreground">{log.agent_id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-[13px] text-foreground">{log.action}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{log.duration || '-'}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{log.tokens_used?.toLocaleString() || '-'}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setIsDetailOpen(true);
                            }}
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {log.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetry(log.id)}
                              title="重试"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
              <DialogTitle>任务详情 - {selectedLog?.task_id.substring(0, 12)}...</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">任务ID</div>
                    <div className="text-[14px] font-mono">{selectedLog.task_id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">智能体</div>
                    <div className="text-[14px] font-medium">{selectedLog.agent_id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">操作类型</div>
                    <div className="text-[14px]">{selectedLog.action}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">状态</div>
                    <div>{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">耗时</div>
                    <div className="text-[14px]">{selectedLog.duration || 0}s</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">Tokens使用</div>
                    <div className="text-[14px]">{selectedLog.tokens_used?.toLocaleString() || 0}</div>
                  </div>
                </div>
                {selectedLog.input && (
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">输入</div>
                    <div className="text-[13px] bg-muted/30 p-3 rounded-md font-mono max-h-[100px] overflow-y-auto">
                      {JSON.stringify(selectedLog.input, null, 2)}
                    </div>
                  </div>
                )}
                {selectedLog.output && (
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">输出</div>
                    <div className="text-[13px] bg-muted/30 p-3 rounded-md font-mono max-h-[100px] overflow-y-auto">
                      {JSON.stringify(selectedLog.output, null, 2)}
                    </div>
                  </div>
                )}
                {selectedLog.error && (
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1">错误信息</div>
                    <div className="text-[13px] bg-destructive/10 p-3 rounded-md text-destructive">
                      {selectedLog.error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
