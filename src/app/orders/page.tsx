'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';

export default function OrdersPage() {
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

  const packages = [
    {
      id: 'trial',
      name: '试用版',
      price: 0,
      days: 3,
      features: ['客服智能体', '自推广智能体', 'Prompt模板', '100次/天模型调用'],
      popular: false,
    },
    {
      id: 'basic',
      name: '基础版',
      price: 299,
      days: 30,
      features: ['客服智能体', '自推广智能体', 'Prompt模板', '1000次/天模型调用', '优先客服支持'],
      popular: true,
    },
    {
      id: 'pro',
      name: '专业版',
      price: 799,
      days: 30,
      features: ['全部智能体', '无限模型调用', '定制Prompt', '专属客服', 'API接口访问', '数据报表'],
      popular: false,
    },
    {
      id: 'enterprise',
      name: '企业版',
      price: 1999,
      days: 30,
      features: ['全部专业版功能', '多店铺管理', '专属技术支持', 'SLA保障', '私有化部署'],
      popular: false,
    },
  ];

  const orders = [
    {
      id: 'O20240220001',
      userId: 'U001',
      userName: '王明',
      packageType: 'basic',
      amount: 299,
      days: 30,
      status: 'paid',
      createdAt: '2024-02-20 15:32:18',
    },
    {
      id: 'O20240220002',
      userId: 'U002',
      userName: '李华',
      packageType: 'trial',
      amount: 0,
      days: 3,
      status: 'paid',
      createdAt: '2024-02-20 14:15:45',
    },
    {
      id: 'O20240220003',
      userId: 'U003',
      userName: '张伟',
      packageType: 'pro',
      amount: 799,
      days: 30,
      status: 'pending',
      createdAt: '2024-02-20 13:08:23',
    },
  ];

  const getPackageName = (type: string) => {
    const pkg = packages.find(p => p.id === type);
    return pkg?.name || type;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold text-[#1D2129]">订单套餐</h1>
          <Button variant="outline" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            导出订单
          </Button>
        </div>

        {/* 套餐卡片 */}
        <div className="grid grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`bg-white border-[#E8E8E8] shadow-sm ${
                pkg.popular ? 'border-[#1677FF] border-2 relative' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-[#1677FF] text-white text-[12px] px-3 py-1 rounded-bl-lg">
                  热门
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-[16px] font-semibold text-[#1D2129]">
                  {pkg.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-[28px] font-bold text-[#1677FF]">
                    ¥{pkg.price}
                  </span>
                  <span className="text-[13px] text-[#717C89]">/{pkg.days}天</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="text-[13px] text-[#4E5969] flex items-start">
                      <span className="text-[#52C41A] mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-[#1677FF] hover:bg-[#0F62FE]'
                      : 'bg-white border-[#1677FF] text-[#1677FF] hover:bg-[#E6F7FF]'
                  } h-9`}
                >
                  选择套餐
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 订单列表 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                订单记录
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C9CDD4]" />
                <Input
                  placeholder="搜索订单号/用户"
                  className="pl-10 h-9 w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E8E8]">
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">订单号</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">用户</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">套餐</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">金额</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">天数</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">状态</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">下单时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-[#E8E8E8] hover:bg-[#F5F7FA]">
                    <TableCell className="text-[13px] text-[#1D2129] font-medium">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {order.userName}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {getPackageName(order.packageType)}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#1D2129] font-medium">
                      ¥{order.amount}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {order.days}天
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === 'paid'
                            ? 'bg-[#52C41A] text-white'
                            : order.status === 'pending'
                            ? 'bg-[#FAAD14] text-white'
                            : 'bg-[#F5222D] text-white'
                        }
                      >
                        {order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : '已取消'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {order.createdAt}
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
