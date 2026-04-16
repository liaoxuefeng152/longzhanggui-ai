'use client';

import { useState } from 'react';
import { Shield, Store, CheckCircle, XCircle, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  status: 'authorized' | 'unauthorized' | 'expired';
}

interface Shop {
  id: string;
  platform: string;
  name: string;
  site: string;
  status: 'active' | 'expired';
  createdAt: string;
}

export default function PlatformAuthPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'shopee', name: 'Shopee', logo: 'S', color: 'from-[#00B8D4] to-[#00838F]', status: 'authorized' },
    { id: 'lazada', name: 'Lazada', logo: 'L', color: 'from-[#FF9800] to-[#F57C00]', status: 'unauthorized' },
    { id: 'tiktok', name: 'TikTok Shop', logo: 'T', color: 'from-[#1E293B] to-[#0B101A]', status: 'unauthorized' },
  ]);

  const [shops, setShops] = useState<Shop[]>([
    { id: '1', platform: 'Shopee', name: '深圳数码店', site: '马来站', status: 'active', createdAt: '2024-01-15' },
    { id: '2', platform: 'Shopee', name: '广州服饰店', site: '泰国站', status: 'expired', createdAt: '2024-02-20' },
  ]);

  const [deletingShop, setDeletingShop] = useState<string | null>(null);

  const handleAuthorize = (platform: Platform) => {
    toast.info(`正在跳转${platform.name}授权页面...`);
    setTimeout(() => {
      setPlatforms(platforms.map(p => 
        p.id === platform.id ? { ...p, status: 'authorized' } : p
      ));
      toast.success(`${platform.name}授权成功！`);
    }, 1500);
  };

  const handleRevoke = (shopId: string) => {
    setShops(shops.filter(s => s.id !== shopId));
    setDeletingShop(null);
    toast.success('已解除授权');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-[#00EEFF]" />
        <div>
          <h1 className="text-2xl font-bold text-white">平台授权中心</h1>
          <p className="text-[#64748B]">店铺绑定 · 无授权不上新</p>
        </div>
      </div>

      {/* 平台授权卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {platforms.map((platform) => (
          <Card key={platform.id} className="glass-card p-6 hover:border-[rgba(0,238,255,0.4)] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                <span className="text-white text-2xl font-bold">{platform.logo}</span>
              </div>
              <Badge className={`
                ${platform.status === 'authorized' ? 'bg-[rgba(0,238,255,0.2)] text-[#00EEFF] border-[rgba(0,238,255,0.3)]' : ''}
                ${platform.status === 'unauthorized' ? 'bg-[rgba(100,116,139,0.2)] text-[#64748B] border-[rgba(100,116,139,0.3)]' : ''}
                ${platform.status === 'expired' ? 'bg-[rgba(255,64,129,0.2)] text-[#FF4081] border-[rgba(255,64,129,0.3)]' : ''}
              `}>
                {platform.status === 'authorized' && '已授权'}
                {platform.status === 'unauthorized' && '未授权'}
                {platform.status === 'expired' && '已过期'}
              </Badge>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">{platform.name}</h3>
            <p className="text-[#64748B] text-sm mb-4">
              {platform.status === 'authorized' ? '授权状态正常，可正常使用' : '点击按钮完成平台授权'}
            </p>

            {platform.status === 'authorized' ? (
              <Button 
                variant="ghost" 
                className="w-full bg-[rgba(0,238,255,0.1)] text-[#00EEFF] hover:bg-[rgba(0,238,255,0.2)] border border-[rgba(0,238,255,0.3)]"
                onClick={() => handleAuthorize(platform)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                重新授权
              </Button>
            ) : (
              <Button 
                onClick={() => handleAuthorize(platform)}
                className="w-full btn-neon-primary"
              >
                前往授权
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* 已绑定店铺列表 */}
      <Card className="glass-card">
        <div className="p-6 border-b border-[#1E293B]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-[#00EEFF]" />
            已绑定店铺
          </h3>
        </div>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E293B] hover:bg-transparent">
                <TableHead className="text-[#64748B]">平台</TableHead>
                <TableHead className="text-[#64748B]">店铺名</TableHead>
                <TableHead className="text-[#64748B]">站点</TableHead>
                <TableHead className="text-[#64748B]">状态</TableHead>
                <TableHead className="text-[#64748B]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.id} className="border-[#1E293B] hover:bg-[rgba(0,238,255,0.05)]">
                  <TableCell className="text-white font-medium">{shop.platform}</TableCell>
                  <TableCell className="text-white">{shop.name}</TableCell>
                  <TableCell className="text-[#94A3B8]">{shop.site}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`status-indicator ${shop.status === 'active' ? 'status-online' : 'status-error'}`} />
                      <span className={shop.status === 'active' ? 'text-[#00EEFF]' : 'text-[#FF4081]'}>
                        {shop.status === 'active' ? '已授权' : '已过期'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog open={deletingShop === shop.id} onOpenChange={(open) => !open && setDeletingShop(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#FF4081] hover:text-[#FF4081] hover:bg-[rgba(255,64,129,0.1)]"
                          onClick={() => setDeletingShop(shop.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          解除授权
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[rgba(15,22,36,0.95)] border-[#1E293B]">
                        <DialogHeader>
                          <DialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-[#FF4081]" />
                            确认解除授权
                          </DialogTitle>
                          <DialogDescription className="text-[#64748B]">
                            确定要解除「{shop.name}」的授权吗？此操作不可撤销。
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-3">
                          <Button 
                            variant="ghost" 
                            onClick={() => setDeletingShop(null)}
                            className="text-[#64748B] hover:text-white"
                          >
                            取消
                          </Button>
                          <Button 
                            onClick={() => handleRevoke(shop.id)}
                            className="bg-[#FF4081] hover:bg-[#F50057] text-white"
                          >
                            确认解除
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
