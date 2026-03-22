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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MoreHorizontal,
  Download,
  MessageSquare,
  Ban,
  CheckCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  getFeishuUsers,
  updateUserQuota,
  FeishuUser,
} from '@/lib/api/feishu-users';
import { logout } from '@/lib/api/auth';

export default function FeishuUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<FeishuUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getFeishuUsers({ page: 1, page_size: 100, status: filterStatus === 'all' ? undefined : filterStatus });
      setUsers(response.users);
      setTotalUsers(response.total);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
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
    fetchUsers();
  }, [router, filterStatus]);

  // 过滤用户
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.nickname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.open_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: '正常', className: 'bg-success text-white' },
      inactive: { label: '已过期', className: 'bg-warning text-white' },
      disabled: { label: '已禁用', className: 'bg-destructive text-white' },
    };
    const config = statusMap[status] || statusMap.disabled;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // 处理禁用/启用用户
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      // TODO: 调用更新用户状态API
      toast.success('用户状态已更新');
      fetchUsers();
    } catch (error) {
      console.error('更新用户状态失败:', error);
      toast.error('更新用户状态失败');
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
            <h1 className="text-[18px] font-semibold text-foreground">飞书用户管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              终端用户数据 · 套餐管理 · 使用统计
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">总用户数</div>
              <div className="text-[24px] font-semibold text-foreground">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">活跃用户</div>
              <div className="text-[24px] font-semibold text-success">
                {users.filter(u => u.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">总调用次数</div>
              <div className="text-[24px] font-semibold text-primary">
                {users.reduce((sum, u) => sum + u.call_used, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">总配额</div>
              <div className="text-[24px] font-semibold text-warning">
                {users.reduce((sum, u) => sum + u.call_quota, 0).toLocaleString()}
              </div>
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
                  placeholder="搜索用户昵称/ID/飞书ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="用户状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="inactive">已过期</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-medium">用户列表</CardTitle>
              <span className="text-[13px] text-muted-foreground">
                共 {filteredUsers.length} 个用户
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无用户数据
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">用户</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">飞书ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">已用/配额</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">注册时间</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-border hover:bg-muted/30">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar} alt={u.nickname || ''} />
                            <AvatarFallback className="bg-primary text-white text-[12px]">
                              {(u.nickname || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-[13px] font-medium text-foreground">{u.nickname || '-'}</div>
                            <div className="text-[11px] text-muted-foreground">{u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground font-mono">
                        {u.open_id.substring(0, 12)}...
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground">
                        <span className="font-medium">{u.call_used.toLocaleString()}</span>
                        <span className="text-muted-foreground"> / {u.call_quota.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(u.status)}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              发送消息
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const quota = prompt('请输入新的配额:', String(u.call_quota));
                              if (quota) {
                                updateUserQuota(u.id, parseInt(quota) || 0).then(() => {
                                  toast.success('配额已更新');
                                  fetchUsers();
                                }).catch((err) => {
                                  console.error('更新配额失败:', err);
                                  toast.error('更新配额失败');
                                });
                              }
                            }}>
                              调整配额
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(u.id, u.status)}>
                              {u.status === 'inactive' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  启用用户
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  禁用用户
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
