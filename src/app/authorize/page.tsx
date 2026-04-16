'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, Link2, Smartphone, Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

// 模拟平台数据
const mockPlatforms = [
  {
    id: 1,
    name: 'TikTok Shop',
    icon: '🎵',
    sites: [
      { id: 'us', name: '美区', status: 'connected', lastSync: '2分钟前' },
      { id: 'uk', name: '英区', status: 'connected', lastSync: '5分钟前' },
      { id: 'id', name: '印尼', status: 'disconnected', lastSync: '-' },
    ],
  },
  {
    id: 2,
    name: 'Shopee',
    icon: '🛒',
    sites: [
      { id: 'my', name: '马来', status: 'connected', lastSync: '10分钟前' },
      { id: 'th', name: '泰国', status: 'pending', lastSync: '授权中' },
    ],
  },
  {
    id: 3,
    name: 'Lazada',
    icon: '🛍️',
    sites: [
      { id: 'sg', name: '新加坡', status: 'disconnected', lastSync: '-' },
    ],
  },
];

export default function AuthorizePage() {
  const [platforms, setPlatforms] = useState(mockPlatforms);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState({
    name: '',
    apiKey: '',
    apiSecret: '',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-[#E8FFEA] text-[#00B42A] hover:bg-[#E8FFEA]">已连接</Badge>;
      case 'pending':
        return <Badge className="bg-[#FFF7E8] text-[#FF7D00] hover:bg-[#FFF7E8]">授权中</Badge>;
      case 'disconnected':
        return <Badge className="bg-[#F2F3F5] text-[#86909C] hover:bg-[#F2F3F5]">未连接</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-[#00B42A]" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-[#FF7D00]" />;
      case 'disconnected':
        return <AlertCircle className="w-5 h-5 text-[#86909C]" />;
      default:
        return null;
    }
  };

  const handleAddPlatform = () => {
    if (!newPlatform.name) {
      toast.error('请输入平台名称');
      return;
    }
    toast.success('平台添加成功');
    setIsAddDialogOpen(false);
    setNewPlatform({ name: '', apiKey: '', apiSecret: '' });
  };

  const handleAuthorize = (platformId: number, siteId: string) => {
    toast.success('开始授权流程');
  };

  const handleSync = (platformId: number, siteId: string) => {
    toast.success('开始同步数据');
  };

  const handleDelete = (platformId: number) => {
    setPlatforms(platforms.filter(p => p.id !== platformId));
    toast.success('平台已删除');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">平台授权</h1>
            <p className="text-[#86909C] mt-1">管理您的电商平台授权</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                添加平台
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新平台</DialogTitle>
                <DialogDescription>
                  配置您要连接的电商平台
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#4E5969]">平台名称</label>
                  <Input
                    placeholder="例如：TikTok Shop"
                    value={newPlatform.name}
                    onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                    className="input-minimal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#4E5969]">API Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                    <Input
                      placeholder="请输入API Key"
                      value={newPlatform.apiKey}
                      onChange={(e) => setNewPlatform({ ...newPlatform, apiKey: e.target.value })}
                      className="pl-10 input-minimal"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#4E5969]">API Secret</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                    <Input
                      type="password"
                      placeholder="请输入API Secret"
                      value={newPlatform.apiSecret}
                      onChange={(e) => setNewPlatform({ ...newPlatform, apiSecret: e.target.value })}
                      className="pl-10 input-minimal"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button className="btn-primary" onClick={handleAddPlatform}>
                  确认添加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 平台卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <Card key={platform.id} className="card-minimal overflow-hidden">
              <div className="p-5 border-b border-[#E5E6EB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F2F3F5] flex items-center justify-center text-2xl">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1D2129]">{platform.name}</h3>
                      <p className="text-sm text-[#86909C]">{platform.sites.length} 个站点</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-[#4E5969] hover:text-[#1D2129]">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#F53F3F] hover:text-[#F53F3F] hover:bg-[#FFECE8]"
                      onClick={() => handleDelete(platform.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {platform.sites.map((site: any) => (
                    <div key={site.id} className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(site.status)}
                        <div>
                          <p className="font-medium text-[#1D2129]">{site.name}</p>
                          <p className="text-xs text-[#86909C]">最后同步：{site.lastSync}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(site.status)}
                        {site.status === 'connected' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#165DFF]"
                            onClick={() => handleSync(platform.id, site.id)}
                          >
                            同步
                          </Button>
                        )}
                        {site.status === 'disconnected' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#165DFF]"
                            onClick={() => handleAuthorize(platform.id, site.id)}
                          >
                            <Link2 className="w-4 h-4 mr-1" />
                            授权
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 授权说明卡片 */}
        <Card className="card-minimal">
          <div className="p-5 border-b border-[#E5E6EB]">
            <h3 className="text-lg font-semibold text-[#1D2129]">授权说明</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E8F3FF] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#165DFF]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#1D2129] mb-1">安全授权</h4>
                  <p className="text-sm text-[#86909C]">所有API凭证采用加密存储，仅用于平台数据同步</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E8FFEA] flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-[#00B42A]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#1D2129] mb-1">实时同步</h4>
                  <p className="text-sm text-[#86909C]">订单、库存数据每5分钟自动同步一次</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFF7E8] flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-[#FF7D00]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#1D2129] mb-1">权限管理</h4>
                  <p className="text-sm text-[#86909C]">仅申请必要的API权限，保护您的数据安全</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
