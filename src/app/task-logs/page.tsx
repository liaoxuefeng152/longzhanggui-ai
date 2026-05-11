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
  RefreshCw,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

// 任务日志类型
interface TaskLog {
  id: string;
  task_id: string;
  agent_id: string;
  agent_name: string;
  action: string;
  status: 'success' | 'failed' | 'processing';
  duration: number;
  tokens_used: number;
  cost: number;
  error_message?: string;
  request_params?: Record<string, unknown>;
  response_summary?: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
}

export default function TaskLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<TaskLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    avgDuration: 0,
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/task-logs', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        // 使用模拟数据
        setLogs(mockLogs);
        setStats(calculateStats(mockLogs));
      }
    } catch (error) {
      console.error('获取日志失败:', error);
      setLogs(mockLogs);
      setStats(calculateStats(mockLogs));
    }
    setIsLoading(false);
  };

  // 模拟数据
  const mockLogs: TaskLog[] = [
    {
      id: '1',
      task_id: 'TASK-20240320-001',
      agent_id: 'product-selection',
      agent_name: '选品SKILL',
      action: 'AI选品分析',
      status: 'success',
      duration: 3250,
      tokens_used: 1200,
      cost: 0.12,
      response_summary: '推荐3款宠物用品，热销趋势良好',
      created_at: '2024-03-20 14:30:25',
      user_id: 'U001',
      user_name: '张三',
    },
    {
      id: '2',
      task_id: 'TASK-20240320-002',
      agent_id: 'image-design',
      agent_name: '图片SKILL',
      action: '图片翻译处理',
      status: 'success',
      duration: 5200,
      tokens_used: 800,
      cost: 0.08,
      response_summary: '成功翻译5张主图，保留原有排版',
      created_at: '2024-03-20 14:25:10',
      user_id: 'U002',
      user_name: '李四',
    },
    {
      id: '3',
      task_id: 'TASK-20240320-003',
      agent_id: 'listing-optimization',
      agent_name: 'Listing优化',
      action: '标题优化',
      status: 'failed',
      duration: 1500,
      tokens_used: 600,
      cost: 0.06,
      error_message: '模型API调用超时，请重试',
      created_at: '2024-03-20 14:20:55',
      user_id: 'U001',
      user_name: '张三',
    },
    {
      id: '4',
      task_id: 'TASK-20240320-004',
      agent_id: 'advertising',
      agent_name: '广告投放',
      action: '创建广告计划',
      status: 'success',
      duration: 2800,
      tokens_used: 950,
      cost: 0.10,
      response_summary: '广告计划创建成功，预算设置合理',
      created_at: '2024-03-20 14:15:30',
      user_id: 'U003',
      user_name: '王五',
    },
    {
      id: '5',
      task_id: 'TASK-20240320-005',
      agent_id: 'video-generation',
      agent_name: '视频生成',
      action: '短视频生成',
      status: 'processing',
      duration: 0,
      tokens_used: 0,
      cost: 0,
      response_summary: '任务进行中，预计3分钟完成',
      created_at: '2024-03-20 14:10:00',
      user_id: 'U002',
      user_name: '李四',
    },
    {
      id: '6',
      task_id: 'TASK-20240319-006',
      agent_id: 'customer-service',
      agent_name: 'AI客服',
      action: '自动回复生成',
      status: 'success',
      duration: 1200,
      tokens_used: 450,
      cost: 0.05,
      response_summary: '生成3条回复建议，已选择最佳方案',
      created_at: '2024-03-19 16:45:20',
      user_id: 'U001',
      user_name: '张三',
    },
    {
      id: '7',
      task_id: 'TASK-20240319-007',
      agent_id: 'data-review',
      agent_name: '数据复盘',
      action: '周报生成',
      status: 'success',
      duration: 6800,
      tokens_used: 2100,
      cost: 0.21,
      response_summary: '本周销售增长12%，广告ROI提升8%',
      created_at: '2024-03-19 09:00:00',
      user_id: 'U003',
      user_name: '王五',
    },
  ];

  const calculateStats = (logList: TaskLog[]) => {
    const completed = logList.filter((l) => l.status !== 'processing');
    const successCount = completed.filter((l) => l.status === 'success').length;
    const avgDuration =
      completed.length > 0
        ? Math.round(completed.reduce((sum, l) => sum + l.duration, 0) / completed.length)
        : 0;
    return {
      total: logList.length,
      success: successCount,
      failed: completed.length - successCount,
      avgDuration,
    };
  };

  // 过滤日志
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.task_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesAgent = filterAgent === 'all' || log.agent_id === filterAgent;
    return matchesSearch && matchesStatus && matchesAgent;
  });

  // 查看详情
  const handleViewDetail = (log: TaskLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  // 复制任务ID
  const handleCopyId = (taskId: string) => {
    navigator.clipboard.writeText(taskId);
    toast.success('任务ID已复制');
  };

  // 导出日志
  const handleExport = () => {
    const headers = ['任务ID', 'SKILL', '操作', '状态', '耗时(ms)', 'Tokens', '成本(元)', '时间'];
    const rows = filteredLogs.map((log) => [
      log.task_id,
      log.agent_name,
      log.action,
      log.status === 'success' ? '成功' : log.status === 'failed' ? '失败' : '进行中',
      log.duration || '-',
      log.tokens_used || '-',
      log.cost ? `¥${log.cost.toFixed(2)}` : '-',
      log.created_at,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `任务日志_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('日志导出成功');
  };

  const getStatusBadge = (status: TaskLog['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">成功</Badge>;
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      case 'processing':
        return <Badge variant="secondary">进行中</Badge>;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms === 0) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">任务日志</h1>
          <p className="text-sm text-muted-foreground mt-1">
            记录SKILL执行日志，便于问题排查和运营分析
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">总任务数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.success}</div>
                  <p className="text-xs text-muted-foreground">成功</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.failed}</div>
                  <p className="text-xs text-muted-foreground">失败</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
                  <p className="text-xs text-muted-foreground">平均耗时</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务ID/SKILL/操作..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-72"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="processing">进行中</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="SKILL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部SKILL</SelectItem>
                <SelectItem value="product-selection">选品SKILL</SelectItem>
                <SelectItem value="image-design">图片SKILL</SelectItem>
                <SelectItem value="video-generation">视频生成</SelectItem>
                <SelectItem value="listing-optimization">Listing优化</SelectItem>
                <SelectItem value="advertising">广告投放</SelectItem>
                <SelectItem value="customer-service">AI客服</SelectItem>
                <SelectItem value="data-review">数据复盘</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadLogs} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
          </div>
        </div>

        {/* 日志列表 */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>暂无日志数据</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead>
                    <TableHead>SKILL</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>成本</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">{log.task_id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyId(log.task_id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.agent_name}</Badge>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{formatDuration(log.duration)}</TableCell>
                      <TableCell>{log.tokens_used > 0 ? log.tokens_used.toLocaleString() : '-'}</TableCell>
                      <TableCell>{log.cost > 0 ? `¥${log.cost.toFixed(2)}` : '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.created_at}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(log)}>
                          <Eye className="h-4 w-4" />
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>任务详情</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">任务ID</p>
                    <p className="font-mono">{selectedLog.task_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SKILL</p>
                    <p>{selectedLog.agent_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">操作</p>
                    <p>{selectedLog.action}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">状态</p>
                    {getStatusBadge(selectedLog.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">耗时</p>
                    <p>{formatDuration(selectedLog.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens使用</p>
                    <p>{selectedLog.tokens_used > 0 ? selectedLog.tokens_used.toLocaleString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">成本</p>
                    <p>{selectedLog.cost > 0 ? `¥${selectedLog.cost.toFixed(2)}` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">执行时间</p>
                    <p>{selectedLog.created_at}</p>
                  </div>
                </div>

                {selectedLog.error_message && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">错误信息</p>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                      {selectedLog.error_message}
                    </div>
                  </div>
                )}

                {selectedLog.response_summary && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">响应摘要</p>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                      {selectedLog.response_summary}
                    </div>
                  </div>
                )}

                {selectedLog.request_params && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">请求参数</p>
                    <pre className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-auto">
                      {JSON.stringify(selectedLog.request_params, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.user_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">操作用户</p>
                    <p>{selectedLog.user_name}</p>
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
