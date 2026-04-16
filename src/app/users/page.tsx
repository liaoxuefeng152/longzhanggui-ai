'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Lock,
  Unlock,
  Trash2,
  Shield,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role_id: string;
  role_name: string;
  role_level: number;
  status: 'active' | 'inactive' | 'locked';
  last_login?: string;
  login_count: number;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
  level: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 创建表单
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setRoles(data.data.roles);
      }
    } catch (error) {
      console.error('获取用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建用户
  const handleCreate = async () => {
    if (!createForm.username || !createForm.email || !createForm.password || !createForm.role_id) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('用户创建成功');
        setIsCreateOpen(false);
        resetForm();
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('创建失败');
    }
  };

  // 切换用户状态
  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch('/api/v1/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, action: 'toggle_status' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`用户已${user.status === 'active' ? '停用' : '启用'}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 删除用户
  const handleDelete = async (user: User) => {
    if (!confirm(`确定删除用户「${user.username}」吗？`)) return;

    try {
      const response = await fetch(`/api/v1/users?id=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('用户已删除');
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 重置密码
  const handleResetPassword = async (user: User) => {
    try {
      const response = await fetch('/api/v1/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, action: 'reset_password' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('密码重置成功，已发送邮件');
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const resetForm = () => {
    setCreateForm({
      username: '',
      email: '',
      phone: '',
      password: '',
      role_id: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
      active: { label: '已启用', className: 'bg-[#00B42A]500/10 text-[#00B42A]500', icon: CheckCircle },
      inactive: { label: '已停用', className: 'bg-muted text-muted-foreground', icon: XCircle },
      locked: { label: '已锁定', className: 'bg-[#F53F3F]500/10 text-[#F53F3F]500', icon: Lock },
    };
    const { label, className, icon: Icon } = config[status] || config.inactive;
    return (
      <Badge variant="outline" className={cn('gap-1', className)}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getRoleBadge = (level: number) => {
    if (level >= 90) return <Badge className="bg-[#165DFF]500/10 text-[#165DFF]500">管理员</Badge>;
    if (level >= 50) return <Badge className="bg-[#165DFF]500/10 text-[#165DFF]500">运营</Badge>;
    return <Badge variant="outline">普通</Badge>;
  };

  // 过滤用户
  const filteredUsers = users.filter(u => 
    u.username.includes(searchKeyword) || 
    u.email.includes(searchKeyword) ||
    u.role_name.includes(searchKeyword)
  );

  // 统计
  const activeCount = users.filter(u => u.status === 'active').length;
  const adminCount = users.filter(u => u.role_level >= 90).length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
              <Users className="h-7 w-7 text-[#00B42A]500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">用户管理</h1>
              <p className="text-[14px] text-muted-foreground">用户账号 · 角色分配 · 权限控制</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground">用户总数</div>
              <div className="text-[24px] font-semibold">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground">启用用户</div>
              <div className="text-[24px] font-semibold text-[#00B42A]500">{activeCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground">管理员</div>
              <div className="text-[24px] font-semibold text-[#165DFF]500">{adminCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground">角色数量</div>
              <div className="text-[24px] font-semibold">{roles.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名、邮箱或角色..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 用户列表 */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">加载中...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchKeyword ? '没有找到匹配的用户' : '暂无用户'}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[16px] font-medium text-primary">
                          {u.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{u.username}</span>
                          {getStatusBadge(u.status)}
                          {getRoleBadge(u.role_level)}
                        </div>
                        <div className="flex items-center gap-4 text-[12px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </span>
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {u.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {u.role_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-[12px] text-muted-foreground">
                        <div>登录 {u.login_count} 次</div>
                        {u.last_login && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(u.last_login).toLocaleDateString('zh-CN')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'active' ? '停用' : '启用'}
                        >
                          {u.status === 'active' ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResetPassword(u)}
                          title="重置密码"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(u)}
                          className="text-[#F53F3F]500 hover:text-[#F53F3F]600"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 创建用户对话框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加用户</DialogTitle>
              <DialogDescription>创建新的用户账号并分配角色</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  placeholder="输入用户名"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号（可选）</Label>
                <Input
                  id="phone"
                  placeholder="+86 138xxxxxxxx"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">初始密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="设置初始密码"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">分配角色</Label>
                <Select
                  value={createForm.role_id}
                  onValueChange={(value) => setCreateForm({ ...createForm, role_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} (Lv.{role.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}>取消</Button>
              <Button onClick={handleCreate}>创建用户</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
