'use client';

import { useState } from 'react';
import { FileText, Edit, Trash2, Clock, CheckCircle, AlertCircle, ArrowRight, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// 模拟草稿数据
const mockDrafts = [
  {
    id: 1,
    name: '宠物智能饮水机',
    category: '宠物用品',
    status: 'editing',
    progress: 40,
    lastEdit: '5分钟前',
    image: '🐾',
  },
  {
    id: 2,
    name: 'LED氛围灯串',
    category: '家居装饰',
    status: 'pending',
    progress: 70,
    lastEdit: '1小时前',
    image: '💡',
  },
  {
    id: 3,
    name: '便携手机支架',
    category: '手机配件',
    status: 'ready',
    progress: 100,
    lastEdit: '2小时前',
    image: '📱',
  },
  {
    id: 4,
    name: '无线充电器',
    category: '3C数码',
    status: 'editing',
    progress: 20,
    lastEdit: '昨天',
    image: '🔋',
  },
];

export default function DraftsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [drafts, setDrafts] = useState(mockDrafts);

  const filteredDrafts = activeTab === 'all' 
    ? drafts 
    : drafts.filter(d => d.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'editing':
        return <Badge className="bg-[#E8F3FF] text-[#165DFF]">编辑中</Badge>;
      case 'pending':
        return <Badge className="bg-[#FFF7E8] text-[#FF7D00]">待处理</Badge>;
      case 'ready':
        return <Badge className="bg-[#E8FFEA] text-[#00B42A]">待上架</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'editing':
        return <Edit className="w-5 h-5 text-[#165DFF]" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-[#FF7D00]" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-[#00B42A]" />;
      default:
        return null;
    }
  };

  const handleDelete = (id: number) => {
    setDrafts(drafts.filter(d => d.id !== id));
    toast.success('草稿已删除');
  };

  const handlePublish = (id: number) => {
    toast.success('商品已上架！');
  };

  const handleContinueEdit = (id: number) => {
    router.push('/publish');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">草稿箱</h1>
            <p className="text-[#86909C] mt-1">管理您的商品草稿</p>
          </div>
          <Button className="btn-primary" onClick={() => router.push('/publish')}>
            <Plus className="w-4 h-4 mr-2" />
            新建草稿
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-lg bg-[#F2F3F5]">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              全部 ({drafts.length})
            </TabsTrigger>
            <TabsTrigger value="editing" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              编辑中 ({drafts.filter(d => d.status === 'editing').length})
            </TabsTrigger>
            <TabsTrigger value="ready" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              待上架 ({drafts.filter(d => d.status === 'ready').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredDrafts.length === 0 ? (
              <Card className="card-minimal">
                <div className="p-12 text-center">
                  <FileText className="w-16 h-16 text-[#C9CDD4] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#4E5969] mb-2">暂无草稿</h3>
                  <p className="text-[#86909C] mb-6">开始创建您的第一个商品草稿吧</p>
                  <Button className="btn-primary" onClick={() => router.push('/publish')}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    新建商品
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrafts.map((draft) => (
                  <Card key={draft.id} className="card-minimal">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-[#F2F3F5] flex items-center justify-center text-3xl">
                            {draft.image}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#1D2129]">{draft.name}</h3>
                            <p className="text-sm text-[#86909C]">{draft.category}</p>
                          </div>
                        </div>
                        {getStatusBadge(draft.status)}
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#86909C]">完成进度</span>
                          <span className="text-sm font-medium text-[#1D2129]">{draft.progress}%</span>
                        </div>
                        <Progress value={draft.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-[#86909C] mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>最后编辑：{draft.lastEdit}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-[#165DFF]"
                          onClick={() => handleContinueEdit(draft.id)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          继续编辑
                        </Button>
                        {draft.status === 'ready' && (
                          <Button 
                            size="sm" 
                            className="flex-1 btn-primary"
                            onClick={() => handlePublish(draft.id)}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            立即上架
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#F53F3F]"
                          onClick={() => handleDelete(draft.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
