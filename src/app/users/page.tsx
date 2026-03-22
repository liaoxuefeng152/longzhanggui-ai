'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers } from '@/lib/api';
import type { SystemUser as User } from '@/lib/api';
import { logout } from '@/lib/api/auth';

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers({ page: 1, page_size: 20 });
      setUsers(response.items);
      setTotal(response.total);
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
  }, [router]);

  // 过滤用户
  const filteredUsers = users.filter(u => 
    u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  );

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-white">正常</Badge>;
      case 'inactive':
        return <Badge variant="outline">禁用</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 获取角色徽章
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary text-white">管理员</Badge>;
      case 'user':
        return <Badge variant="outline">用户</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">用户管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              管理员账户管理 · 权限配置 · 状态管理
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增用户
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">总用户数</p>
              <p className="text-[28px] font-semibold text-foreground">{total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">管理员</p>
              <p className="text-[28px] font-semibold text-primary">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">正常用户</p>
              <p className="text-[28px] font-semibold text-success">
                {users.filter(u => u.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-[13px] text-muted-foreground mb-1">禁用用户</p>
              <p className="text-[28px] font-semibold text-destructive">
                {users.filter(u => u.status !== 'active').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 用户列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-medium">用户列表</CardTitle>
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户昵称/手机号"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                    <TableHead className="text-[12px] font-medium text-muted-foreground">手机号</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">角色</TableHead>
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
                            <AvatarImage src={u.avatar} alt={u.nickname} />
                            <AvatarFallback className="bg-primary text-white text-[12px]">
                              {u.nickname.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px] text-foreground font-medium">
                            {u.nickname}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {u.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                      </TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell>{getStatusBadge(u.status)}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" title="编辑">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="删除">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
