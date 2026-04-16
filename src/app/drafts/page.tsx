'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Edit, Rocket, Eye } from 'lucide-react';

export default function DraftsPage() {
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

  if (!user) return null;

  // 模拟草稿数据
  const drafts = [
    { id: 1, name: '宠物自动饮水机 3.5L', status: '待发布', lastUpdated: '2小时前', images: 5 },
    { id: 2, name: '无线蓝牙耳机 降噪款', status: '处理中', lastUpdated: '10分钟前', images: 3 },
    { id: 3, name: '便携式榨汁杯 USB充电', status: '需修改', lastUpdated: '昨天', images: 4 },
    { id: 4, name: '智能手环 运动防水', status: '待发布', lastUpdated: '3天前', images: 6 },
    { id: 5, name: '迷你加湿器 静音款', status: '需修改', lastUpdated: '1周前', images: 2 },
  ];

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')} useNewNavigation={true}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-[#165DFF]" />
              草稿箱 ({drafts.length})
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="pending">待发布</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="needs_edit">需修改</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="搜索..." className="w-48" />
          </div>
        </div>

        {/* 草稿列表 */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-16">图片</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground">商品名</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-24">状态</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-32">最后更新</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-32">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => (
                    <tr key={draft.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground opacity-30" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px]">{draft.name}</td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            draft.status === '待发布'
                              ? 'bg-blue-100 text-blue-700'
                              : draft.status === '处理中'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {draft.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {draft.lastUpdated}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push('/publish')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {draft.status === '待发布' && (
                            <Button 
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              <Rocket className="h-4 w-4 mr-1" />
                              发布
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
