'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AgentsPage() {
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

  const agents = [
    {
      id: '1',
      name: '客服智能体',
      type: 'customer_service',
      description: '提供多语种自动客服服务，支持印尼语、马来语、泰语、越南语、英语',
      status: 'active',
      model: '豆包API',
      calls: 8560,
      successRate: 98.5,
      createdAt: '2024-02-01',
    },
    {
      id: '2',
      name: '自推广智能体',
      type: 'marketing',
      description: '自动生成推广素材、追踪裂变关系、发放裂变奖励，实现产品自带推广能力',
      status: 'active',
      model: '豆包API',
      calls: 3240,
      successRate: 95.2,
      createdAt: '2024-02-05',
    },
  ];

  const quickActions = [
    {
      title: '客服智能体',
      description: '多语种自动客服，24小时值守',
      icon: MessageSquare,
      href: '/agents/customer-service',
      color: 'bg-[#1677FF]',
    },
    {
      title: '自推广智能体',
      description: '自动生成推广素材，追踪裂变',
      icon: Zap,
      href: '/agents/marketing',
      color: 'bg-[#FAAD14]',
    },
  ];

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold text-[#1D2129]">智能体工厂</h1>
          <Button className="bg-[#1677FF] hover:bg-[#0F62FE] h-9">
            <Plus className="h-4 w-4 mr-2" />
            新增智能体
          </Button>
        </div>

        {/* 快速入口 */}
        <div className="grid grid-cols-2 gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="bg-white border-[#E8E8E8] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`${action.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[16px] font-semibold text-[#1D2129] mb-2">
                          {action.title}
                        </h3>
                        <p className="text-[14px] text-[#717C89]">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 智能体列表 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-[14px] font-medium text-[#4E5969]">
              智能体管理
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E8E8]">
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">智能体名称</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">类型</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">描述</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">状态</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">调用次数</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">成功率</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} className="border-[#E8E8E8] hover:bg-[#F5F7FA]">
                    <TableCell className="text-[13px] text-[#1D2129] font-medium">
                      {agent.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[12px]">
                        {agent.type === 'customer_service' ? '客服' : '推广'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969] max-w-xs truncate">
                      {agent.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          agent.status === 'active'
                            ? 'bg-[#52C41A] text-white'
                            : 'bg-[#C9CDD4] text-white'
                        }
                      >
                        {agent.status === 'active' ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {agent.calls.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {agent.successRate}%
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {agent.createdAt}
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
