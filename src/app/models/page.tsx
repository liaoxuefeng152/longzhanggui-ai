'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle, XCircle, Plus, Search } from 'lucide-react';

export default function ModelsPage() {
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

  const models = [
    {
      id: '1',
      name: '豆包API',
      status: 'active',
      totalTokens: 1258000,
      dailyLimit: 1000000,
      modelId: 'doubao-seed-1-8-251228',
    },
    {
      id: '2',
      name: 'OpenAI API',
      status: 'active',
      totalTokens: 856000,
      dailyLimit: 500000,
      modelId: 'gpt-4',
    },
  ];

  const logs = [
    {
      id: '1',
      time: '2024-02-20 15:32:18',
      userId: 'U001',
      scene: '客服智能体',
      model: '豆包API',
      tokens: 1250,
      status: 'success',
    },
    {
      id: '2',
      time: '2024-02-20 15:28:45',
      userId: 'U002',
      scene: '营销文案',
      model: '豆包API',
      tokens: 890,
      status: 'success',
    },
    {
      id: '3',
      time: '2024-02-20 15:15:23',
      userId: 'U003',
      scene: '自推广',
      model: 'OpenAI API',
      tokens: 560,
      status: 'failed',
      error: 'API超时',
    },
    {
      id: '4',
      time: '2024-02-20 15:10:11',
      userId: 'U004',
      scene: '客服智能体',
      model: '豆包API',
      tokens: 1580,
      status: 'success',
    },
  ];

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <h1 className="text-[18px] font-semibold text-[#1D2129]">模型路由</h1>

        {/* 模型管理 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4 flex items-center justify-between">
            <CardTitle className="text-[14px] font-medium text-[#4E5969]">
              模型管理
            </CardTitle>
            <Button className="bg-[#1677FF] hover:bg-[#0F62FE] h-9">
              <Plus className="h-4 w-4 mr-2" />
              新增模型
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E8E8]">
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">模型名称</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">状态</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">已调用Token</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id} className="border-[#E8E8E8] hover:bg-[#F5F7FA]">
                    <TableCell className="text-[13px] text-[#1D2129] font-medium">
                      {model.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          model.status === 'active'
                            ? 'border-[#52C41A] text-[#52C41A] bg-[#F0F9FF]'
                            : 'border-[#F5222D] text-[#F5222D] bg-[#FFF1F0]'
                        }
                      >
                        {model.status === 'active' ? '正常' : '异常'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {model.totalTokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[13px]"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          配置密钥
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[13px]"
                        >
                          限速设置
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 调用日志 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-[14px] font-medium text-[#4E5969]">
              模型调用日志
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C9CDD4]" />
                <Input
                  placeholder="搜索用户ID/场景"
                  className="pl-10 h-9 w-[300px]"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E8E8]">
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">时间</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">用户ID</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">场景</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">模型</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">消耗Token</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-[#E8E8E8] hover:bg-[#F5F7FA]">
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {log.time}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#1D2129] font-medium">
                      {log.userId}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {log.scene}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {log.model}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {log.tokens}
                    </TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-[#52C41A]" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-[#F5222D]" />
                          <span className="text-[12px] text-[#F5222D]">{log.error}</span>
                        </div>
                      )}
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
