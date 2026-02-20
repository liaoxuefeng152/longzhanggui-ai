'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function PromptsPage() {
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

  const categories = ['客服', '营销文案', '小语种翻译', '选品分析', '自推广'];

  const prompts = [
    {
      id: '1',
      name: '印尼语客服询盘回复',
      category: '客服',
      content: '你是一位专业的TK印尼语客服，请用印尼语回复用户的询盘...',
      model: '豆包API',
      agent: '客服智能体',
      version: 'v2.1',
      isActive: true,
      createdAt: '2024-02-18',
    },
    {
      id: '2',
      name: 'TK短视频标题生成',
      category: '营销文案',
      content: '请为TK短视频生成吸引人的标题，要求包含热门标签...',
      model: '豆包API',
      agent: '自推广智能体',
      version: 'v1.5',
      isActive: true,
      createdAt: '2024-02-15',
    },
    {
      id: '3',
      name: '马来语订单催促',
      category: '客服',
      content: '请用马来语发送友好的订单催促消息...',
      model: '豆包API',
      agent: '客服智能体',
      version: 'v1.0',
      isActive: true,
      createdAt: '2024-02-10',
    },
    {
      id: '4',
      name: '卖家群推广文案',
      category: '自推广',
      content: '生成用于卖家群转发的推广文案，突出产品优势...',
      model: '豆包API',
      agent: '自推广智能体',
      version: 'v1.2',
      isActive: false,
      createdAt: '2024-02-08',
    },
  ];

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold text-[#1D2129]">Prompt中心</h1>
          <Button className="bg-[#1677FF] hover:bg-[#0F62FE] h-9">
            <Plus className="h-4 w-4 mr-2" />
            新增模板
          </Button>
        </div>

        {/* 分类筛选 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-[#1677FF] text-white border-[#1677FF] hover:bg-[#1677FF]"
              >
                全部
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="hover:bg-[#E6F7FF] hover:text-[#1677FF] hover:border-[#1677FF] cursor-pointer"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prompt列表 */}
        <Card className="bg-white border-[#E8E8E8] shadow-sm">
          <CardHeader className="px-4 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                Prompt模板
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C9CDD4]" />
                <Input
                  placeholder="搜索模板名称/关键词"
                  className="pl-10 h-9 w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E8E8]">
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">模板名称</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">分类</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">模型</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">关联智能体</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">版本</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969]">状态</TableHead>
                  <TableHead className="text-[13px] font-medium text-[#4E5969] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((prompt) => (
                  <TableRow key={prompt.id} className="border-[#E8E8E8] hover:bg-[#F5F7FA]">
                    <TableCell className="text-[13px] text-[#1D2129] font-medium">
                      {prompt.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[12px]">
                        {prompt.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {prompt.model}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {prompt.agent}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#4E5969]">
                      {prompt.version}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          prompt.isActive
                            ? 'bg-[#52C41A] text-white'
                            : 'bg-[#C9CDD4] text-white'
                        }
                      >
                        {prompt.isActive ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="h-8 p-1">
                          <Edit className="h-4 w-4 text-[#4E5969]" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 p-1">
                          <Trash2 className="h-4 w-4 text-[#F5222D]" />
                        </Button>
                      </div>
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
