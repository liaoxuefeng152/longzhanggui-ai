'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const stats = [
    {
      title: '今日模型调用',
      value: '12,580',
      change: '+15.2%',
      trend: 'up',
    },
    {
      title: '在线用户',
      value: '256',
      change: '+32',
      trend: 'up',
    },
    {
      title: '今日订单',
      value: '¥8,650',
      change: '+23.5%',
      trend: 'up',
    },
    {
      title: '推广裂变',
      value: '今日带来 89 人',
      change: '转化率 12.5%',
      trend: 'stable',
    },
  ];

  const trendData = [
    { date: '02-14', calls: 8500 },
    { date: '02-15', calls: 9200 },
    { date: '02-16', calls: 8800 },
    { date: '02-17', calls: 10500 },
    { date: '02-18', calls: 11800 },
    { date: '02-19', calls: 11200 },
    { date: '02-20', calls: 12580 },
  ];

  const recentUsers = [
    {
      id: '1',
      nickname: '王明',
      avatar: '',
      shopType: 'TK印尼',
      createdAt: '2024-02-20 14:32',
    },
    {
      id: '2',
      nickname: '李华',
      avatar: '',
      shopType: 'TK泰国',
      createdAt: '2024-02-20 13:15',
    },
    {
      id: '3',
      nickname: '张伟',
      avatar: '',
      shopType: 'TK越南',
      createdAt: '2024-02-20 11:48',
    },
    {
      id: '4',
      nickname: '刘芳',
      avatar: '',
      shopType: 'TK马来西亚',
      createdAt: '2024-02-20 10:25',
    },
    {
      id: '5',
      nickname: '陈静',
      avatar: '',
      shopType: 'TK印尼',
      createdAt: '2024-02-20 09:12',
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-[18px] font-semibold text-[#1D2129]">控制台</h1>
          <p className="text-[14px] text-[#717C89] mt-1">欢迎回来，{user.nickname}</p>
        </div>

        {/* 数据卡片 */}
        <div className="grid grid-cols-2 gap-5">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-[#E8E8E8] shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[14px] text-[#4E5969] mb-3">{stat.title}</p>
                    <p className="text-[24px] font-semibold text-[#1D2129] mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-[#52C41A]" />
                      <span className="text-[12px] text-[#52C41A]">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 趋势图 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-[14px] font-medium text-[#4E5969]">
              近7日模型调用趋势
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E8" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#717C89' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#717C89' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#1677FF"
                    strokeWidth={2}
                    dot={{ fill: '#1677FF', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 最新用户 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-[14px] font-medium text-[#4E5969]">
              最新用户
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E8E8]">
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">用户</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">店铺类型</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969] text-right">注册时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id} className="border-[#E8E8E8] hover:bg-[#F5F7FA]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.nickname} />
                          <AvatarFallback className="bg-[#1677FF] text-white text-[12px]">
                            {user.nickname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[13px] text-[#1D2129]">{user.nickname}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {user.shopType}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969] text-right">
                      {user.createdAt}
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
