'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const users = [
    {
      id: 'U001',
      nickname: '王明',
      phone: '138****1234',
      avatar: '',
      shopType: 'TK印尼',
      trialDays: 0,
      isPaid: true,
      role: 'user',
      createdAt: '2024-02-10',
    },
    {
      id: 'U002',
      nickname: '李华',
      phone: '139****5678',
      avatar: '',
      shopType: 'TK泰国',
      trialDays: 2,
      isPaid: false,
      role: 'user',
      createdAt: '2024-02-18',
    },
    {
      id: 'U003',
      nickname: '张伟',
      phone: '137****9012',
      avatar: '',
      shopType: 'TK越南',
      trialDays: 0,
      isPaid: true,
      role: 'user',
      createdAt: '2024-02-05',
    },
    {
      id: 'U004',
      nickname: '刘芳',
      phone: '136****3456',
      avatar: '',
      shopType: 'TK马来西亚',
      trialDays: 1,
      isPaid: false,
      role: 'user',
      createdAt: '2024-02-19',
    },
  ];

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <h1 className="text-[18px] font-semibold text-[#1D2129]">用户管理</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-[#E8E8E8] shadow-sm">
            <CardContent className="p-4">
              <p className="text-[14px] text-[#4E5969] mb-2">总用户数</p>
              <p className="text-[24px] font-semibold text-[#1D2129]">1,256</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E8E8E8] shadow-sm">
            <CardContent className="p-4">
              <p className="text-[14px] text-[#4E5969] mb-2">付费用户</p>
              <p className="text-[24px] font-semibold text-[#1677FF]">328</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E8E8E8] shadow-sm">
            <CardContent className="p-4">
              <p className="text-[14px] text-[#4E5969] mb-2">试用用户</p>
              <p className="text-[24px] font-semibold text-[#FAAD14]">89</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E8E8E8] shadow-sm">
            <CardContent className="p-4">
              <p className="text-[14px] text-[#4E5969] mb-2">今日新增</p>
              <p className="text-[24px] font-semibold text-[#52C41A]">15</p>
            </CardContent>
          </Card>
        </div>

        {/* 用户列表 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                用户列表
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C9CDD4]" />
                <Input
                  placeholder="搜索用户昵称/手机号"
                  className="pl-10 h-9 w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E8E8]">
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">用户</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">手机号</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">店铺类型</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">状态</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">角色</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">注册时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-[#E8E8E8] hover:bg-[#F5F7FA]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar} alt={u.nickname} />
                          <AvatarFallback className="bg-[#1677FF] text-white text-[12px]">
                            {u.nickname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[13px] text-[#1D2129] font-medium">
                          {u.nickname}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {u.phone}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {u.shopType}
                    </TableCell>
                    <TableCell>
                      {u.isPaid ? (
                        <Badge className="bg-[#52C41A] text-white">付费用户</Badge>
                      ) : u.trialDays > 0 ? (
                        <Badge className="bg-[#FAAD14] text-white">
                          试用中 ({u.trialDays}天)
                        </Badge>
                      ) : (
                        <Badge variant="outline">试用过期</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {u.role === 'admin' ? '管理员' : '用户'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {u.createdAt}
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
