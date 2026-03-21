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
  UserPlus,
  Download,
  MessageSquare,
  Ban,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FeishuUser {
  id: string;
  nickname: string;
  avatar: string;
  feishuId: string;
  platform: string;
  packageType: string;
  expireDate: string;
  totalCalls: number;
  todayCalls: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
  lastActiveAt: string;
}

export default function FeishuUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPackage, setFilterPackage] = useState<string>('all');

  const [users, setUsers] = useState<FeishuUser[]>([
    {
      id: 'U001',
      nickname: '张明',
      avatar: '',
      feishuId: 'ou_xxxx1',
      platform: 'TK印尼',
      packageType: '专业版',
      expireDate: '2024-03-20',
      totalCalls: 12580,
      todayCalls: 156,
      status: 'active',
      createdAt: '2024-01-15',
      lastActiveAt: '2024-02-20 14:32',
    },
    {
      id: 'U002',
      nickname: '李华',
      avatar: '',
      feishuId: 'ou_xxxx2',
      platform: 'TK泰国',
      packageType: '试用版',
      expireDate: '2024-02-18',
      totalCalls: 320,
      todayCalls: 12,
      status: 'expired',
      createdAt: '2024-02-15',
      lastActiveAt: '2024-02-18 09:15',
    },
    {
      id: 'U003',
      nickname: '王芳',
      avatar: '',
      feishuId: 'ou_xxxx3',
      platform: '亚马逊美国',
      packageType: '企业版',
      expireDate: '2024-12-31',
      totalCalls: 85620,
      todayCalls: 423,
      status: 'active',
      createdAt: '2023-12-01',
      lastActiveAt: '2024-02-20 15:10',
    },
    {
      id: 'U004',
      nickname: '赵伟',
      avatar: '',
      feishuId: 'ou_xxxx4',
      platform: 'TK越南',
      packageType: '基础版',
      expireDate: '2024-04-15',
      totalCalls: 4520,
      todayCalls: 89,
      status: 'active',
      createdAt: '2024-01-20',
      lastActiveAt: '2024-02-20 12:45',
    },
    {
      id: 'U005',
      nickname: '刘静',
      avatar: '',
      feishuId: 'ou_xxxx5',
      platform: 'TK马来西亚',
      packageType: '专业版',
      expireDate: '2024-05-01',
      totalCalls: 6890,
      todayCalls: 201,
      status: 'active',
      createdAt: '2024-01-25',
      lastActiveAt: '2024-02-20 14:58',
    },
    {
      id: 'U006',
      nickname: '陈强',
      avatar: '',
      feishuId: 'ou_xxxx6',
      platform: '亚马逊欧洲',
      packageType: '试用版',
      expireDate: '2024-02-10',
      totalCalls: 180,
      todayCalls: 0,
      status: 'disabled',
      createdAt: '2024-02-07',
      lastActiveAt: '2024-02-10 16:20',
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

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.feishuId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchPackage = filterPackage === 'all' || u.packageType === filterPackage;
    return matchSearch && matchStatus && matchPackage;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: '正常', className: 'bg-success text-white' },
      expired: { label: '已过期', className: 'bg-warning text-white' },
      disabled: { label: '已禁用', className: 'bg-destructive text-white' },
    };
    const config = statusMap[status] || statusMap.disabled;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPackageBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      试用版: 'bg-muted text-muted-foreground',
      基础版: 'bg-primary/10 text-primary',
      专业版: 'bg-success/10 text-success',
      企业版: 'bg-warning/10 text-warning',
    };
    return (
      <Badge variant="outline" className={typeMap[type] || ''}>
        {type}
      </Badge>
    );
  };

  const handleDisableUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'disabled' ? 'active' : 'disabled' }
          : u
      )
    );
    toast.success('用户状态已更新');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
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
              <div className="text-[24px] font-semibold text-foreground">256</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">活跃用户</div>
              <div className="text-[24px] font-semibold text-success">198</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">付费用户</div>
              <div className="text-[24px] font-semibold text-primary">142</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">到期预警</div>
              <div className="text-[24px] font-semibold text-warning">15</div>
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
                  <SelectItem value="expired">已过期</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPackage} onValueChange={setFilterPackage}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="套餐类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部套餐</SelectItem>
                  <SelectItem value="试用版">试用版</SelectItem>
                  <SelectItem value="基础版">基础版</SelectItem>
                  <SelectItem value="专业版">专业版</SelectItem>
                  <SelectItem value="企业版">企业版</SelectItem>
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
          <CardHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-medium">用户列表</CardTitle>
              <span className="text-[13px] text-muted-foreground">
                共 {filteredUsers.length} 个用户
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30">
                  <TableHead className="text-[12px] font-medium text-muted-foreground px-6">用户</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">飞书ID</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">套餐</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">到期时间</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">今日调用</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">最后活跃</TableHead>
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
                        <div>
                          <div className="text-[13px] font-medium text-foreground">{u.nickname}</div>
                          <div className="text-[11px] text-muted-foreground">{u.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground font-mono">
                      {u.feishuId}
                    </TableCell>
                    <TableCell className="text-[13px] text-foreground">{u.platform}</TableCell>
                    <TableCell>{getPackageBadge(u.packageType)}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{u.expireDate}</TableCell>
                    <TableCell className="text-[13px] text-foreground">{u.todayCalls}</TableCell>
                    <TableCell>{getStatusBadge(u.status)}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">{u.lastActiveAt}</TableCell>
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
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            续费/升级
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDisableUser(u.id)}>
                            {u.status === 'disabled' ? (
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
