'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Loader2,
  ChevronDown,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getFeishuUsers,
  getFeishuUserStats,
  createFeishuUser,
  updateFeishuUser,
  deleteFeishuUser,
  batchUserOperation,
  type FeishuUser,
  type FeishuUserStats,
  type FeishuUserRequest,
  type PackageType,
  PACKAGE_CONFIG,
} from '@/lib/api/feishu-users';
import { logout } from '@/lib/api/auth';

// 智能体列表（用于权限配置）
const AGENTS = [
  { id: 'product-selection', name: '选品智能体' },
  { id: 'image-design', name: '图片设计智能体' },
  { id: 'video-gen', name: '视频生成智能体' },
  { id: 'listing-opt', name: 'Listing优化智能体' },
  { id: 'ad-Placement', name: '广告投放智能体' },
  { id: 'customer-service', name: '客服智能体' },
  { id: 'data-review', name: '数据复盘智能体' },
];

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<FeishuUser[]>([]);
  const [stats, setStats] = useState<FeishuUserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    trial: 0,
    expiring_soon: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPackage, setFilterPackage] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FeishuUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeishuUserRequest>({
    open_id: '',
    nickname: '',
    package_type: 'basic',
    agent_permissions: [],
    trial_days: 7,
    call_quota: 100,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        getFeishuUsers({ page_size: 100 }),
        getFeishuUserStats(),
      ]);
      setUsers(usersRes.users);
      setStats(statsRes);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router, fetchData]);

  // 过滤用户
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.open_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.mobile && u.mobile.includes(searchTerm));
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchPackage = filterPackage === 'all' || u.package_type === filterPackage;
    return matchSearch && matchStatus && matchPackage;
  });

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 单个选择
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string, expireTime?: string) => {
    // 检查是否即将到期
    if (status === 'active' && expireTime) {
      const expireDate = new Date(expireTime);
      const now = new Date();
      const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays > 0) {
        return (
          <Badge className="bg-warning text-white">
            <Clock className="h-3 w-3 mr-1" />
            即将到期
          </Badge>
        );
      }
    }

    const config: Record<string, { label: string; className: string }> = {
      active: { label: '正常', className: 'bg-success text-white' },
      inactive: { label: '禁用', className: 'bg-muted text-muted-foreground' },
      expired: { label: '已到期', className: 'bg-destructive text-white' },
      trial: { label: '试用', className: 'bg-primary/10 text-primary' },
    };
    const c = config[status] || { label: status, className: 'bg-muted' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  // 获取套餐徽章
  const getPackageBadge = (packageType?: PackageType) => {
    if (!packageType) return <Badge variant="outline">未绑定</Badge>;
    const config = PACKAGE_CONFIG[packageType];
    return <Badge className={config.color}>{config.name}</Badge>;
  };

  // 检查是否到期
  const isExpired = (expireTime?: string) => {
    if (!expireTime) return false;
    return new Date(expireTime) < new Date();
  };

  // 检查是否即将到期
  const isExpiringSoon = (expireTime?: string) => {
    if (!expireTime) return false;
    const expireDate = new Date(expireTime);
    const now = new Date();
    const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      open_id: '',
      nickname: '',
      package_type: 'basic',
      agent_permissions: [],
      trial_days: 7,
      call_quota: 100,
    });
    setIsDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (u: FeishuUser) => {
    setEditingUser(u);
    setFormData({
      open_id: u.open_id,
      nickname: u.nickname,
      package_type: u.package_type || 'basic',
      agent_permissions: u.agent_permissions || [],
      call_quota: u.call_quota,
    });
    setIsDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.open_id || !formData.nickname) {
      toast.error('请填写必填项');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        await updateFeishuUser(editingUser.id, formData);
        toast.success('用户更新成功');
      } else {
        await createFeishuUser(formData);
        toast.success('用户创建成功');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(editingUser ? '更新用户失败' : '创建用户失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除用户
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该用户吗？')) return;
    try {
      await deleteFeishuUser(id);
      toast.success('用户删除成功');
      fetchData();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除用户失败');
    }
  };

  // 批量操作
  const handleBatchAction = async (action: 'activate' | 'deactivate' | 'renew' | 'export') => {
    if (selectedIds.length === 0) {
      toast.error('请先选择用户');
      return;
    }

    try {
      if (action === 'export') {
        // 导出数据
        const selectedUsers = users.filter((u) => selectedIds.includes(u.id));
        const csvContent = [
          ['用户ID', '用户名', '飞书账号', '套餐', '到期时间', '状态', '调用次数'].join(','),
          ...selectedUsers.map((u) =>
            [u.id, u.nickname, u.open_id, u.package_name || '', u.expire_time || '', u.status, u.call_used].join(',')
          ),
        ].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('导出成功');
        return;
      }

      const result = await batchUserOperation({
        user_ids: selectedIds,
        action,
        renew_days: action === 'renew' ? 30 : undefined,
      });
      toast.success(`成功操作 ${result.affected} 个用户`);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error('批量操作失败:', error);
      toast.error('批量操作失败');
    }
  };

  // 跳转用户详情
  const handleViewDetail = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  // 权限切换
  const handlePermissionChange = (agentId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agent_permissions: checked
        ? [...prev.agent_permissions, agentId]
        : prev.agent_permissions.filter((id) => id !== agentId),
    }));
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
            <h1 className="text-[18px] font-semibold text-foreground">用户管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              卖家用户管理 · 套餐绑定 · 权限配置 · 状态管控
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    批量操作 ({selectedIds.length})
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBatchAction('activate')}>
                    批量启用
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchAction('deactivate')}>
                    批量禁用
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchAction('renew')}>
                    批量续费
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchAction('export')}>
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              新增用户
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-6 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">总用户数</p>
              <p className="text-[24px] font-semibold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">正常用户</p>
              <p className="text-[24px] font-semibold text-success">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">试用用户</p>
              <p className="text-[24px] font-semibold text-primary">{stats.trial}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">禁用用户</p>
              <p className="text-[24px] font-semibold text-muted-foreground">{stats.inactive}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">已到期</p>
              <p className="text-[24px] font-semibold text-destructive">{stats.expired}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">即将到期</p>
              <p className="text-[24px] font-semibold text-warning">{stats.expiring_soon}</p>
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
                  placeholder="搜索用户名/飞书账号/手机号"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="用户状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="trial">试用</SelectItem>
                  <SelectItem value="expired">已到期</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPackage} onValueChange={setFilterPackage}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="套餐类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部套餐</SelectItem>
                  <SelectItem value="basic">基础版</SelectItem>
                  <SelectItem value="advanced">进阶版</SelectItem>
                  <SelectItem value="flagship">旗舰版</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPackage('all');
                }}
              >
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">暂无用户数据</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="px-4 w-12">
                      <Checkbox
                        checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">用户ID</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">用户名</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">飞书账号</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">套餐类型</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">到期时间</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">智能体权限</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">操作次数</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-4">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const expired = isExpired(u.expire_time);
                    const expiringSoon = isExpiringSoon(u.expire_time);
                    return (
                      <TableRow
                        key={u.id}
                        className={`border-border hover:bg-muted/30 ${
                          expired ? 'bg-destructive/5' : expiringSoon ? 'bg-warning/5' : ''
                        }`}
                      >
                        <TableCell className="px-4">
                          <Checkbox
                            checked={selectedIds.includes(u.id)}
                            onCheckedChange={(checked) => handleSelect(u.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="text-[12px] text-muted-foreground font-mono">
                          {u.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-[13px] font-medium text-primary hover:underline"
                            onClick={() => handleViewDetail(u.id)}
                          >
                            {u.nickname}
                          </button>
                        </TableCell>
                        <TableCell className="text-[12px] text-muted-foreground">{u.open_id}</TableCell>
                        <TableCell>{getPackageBadge(u.package_type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-[12px] text-muted-foreground">
                              {u.expire_time || '-'}
                            </span>
                            {expiringSoon && <AlertTriangle className="h-3 w-3 text-warning" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.agent_permissions?.slice(0, 3).map((agentId) => {
                              const agent = AGENTS.find((a) => a.id === agentId);
                              return (
                                <Badge key={agentId} variant="outline" className="text-[10px]">
                                  {agent?.name || agentId}
                                </Badge>
                              );
                            })}
                            {(u.agent_permissions?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{(u.agent_permissions?.length || 0) - 3}
                              </Badge>
                            )}
                            {(!u.agent_permissions || u.agent_permissions.length === 0) && (
                              <span className="text-[12px] text-muted-foreground">无权限</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-foreground">
                          {u.call_used} / {u.call_quota}
                        </TableCell>
                        <TableCell>{getStatusBadge(u.status, u.expire_time)}</TableCell>
                        <TableCell className="text-right px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetail(u.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(u)}>
                                <Edit className="h-4 w-4 mr-2" />
                                编辑用户
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => fetchData()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                刷新状态
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(u.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除用户
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 新增/编辑用户弹窗 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? '编辑用户' : '新增用户'}</DialogTitle>
              <DialogDescription>
                {editingUser ? '修改用户信息和权限配置' : '创建新用户并配置权限'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">飞书账号 *</Label>
                <Input
                  className="col-span-3"
                  placeholder="输入飞书 open_id"
                  value={formData.open_id}
                  onChange={(e) => setFormData({ ...formData, open_id: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">用户名 *</Label>
                <Input
                  className="col-span-3"
                  placeholder="输入用户名"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">套餐选择</Label>
                <Select
                  value={formData.package_type}
                  onValueChange={(value: PackageType) =>
                    setFormData({ ...formData, package_type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">基础版</SelectItem>
                    <SelectItem value="advanced">进阶版</SelectItem>
                    <SelectItem value="flagship">旗舰版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!editingUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">试用时长</Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      value={formData.trial_days}
                      onChange={(e) =>
                        setFormData({ ...formData, trial_days: Number(e.target.value) })
                      }
                    />
                    <span className="text-[13px] text-muted-foreground">天</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">调用配额</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-24"
                    value={formData.call_quota}
                    onChange={(e) =>
                      setFormData({ ...formData, call_quota: Number(e.target.value) })
                    }
                  />
                  <span className="text-[13px] text-muted-foreground">次/月</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">智能体权限</Label>
                <div className="col-span-3 space-y-2">
                  {AGENTS.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={agent.id}
                        checked={formData.agent_permissions.includes(agent.id)}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(agent.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={agent.id} className="text-[13px] font-normal">
                        {agent.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingUser ? '保存修改' : '创建用户'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
