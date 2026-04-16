'use client';

import { useState } from 'react';
import { FileText, Search, Filter, Edit, Send, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';

interface Draft {
  id: string;
  name: string;
  image: string;
  platform: string;
  shop: string;
  status: 'draft' | 'ready';
  createdAt: string;
}

export default function DraftsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const drafts: Draft[] = [
    { id: '1', name: '无线蓝牙耳机 TWS 入耳式', image: '🎧', platform: 'Shopee', shop: '深圳数码店', status: 'ready', createdAt: '2024-01-15' },
    { id: '2', name: '智能手表 运动手环', image: '⌚', platform: 'Shopee', shop: '广州服饰店', status: 'draft', createdAt: '2024-01-14' },
    { id: '3', name: '便携充电宝 20000mAh', image: '🔋', platform: 'Lazada', shop: '深圳数码店', status: 'ready', createdAt: '2024-01-13' },
  ];

  const toggleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === drafts.length ? [] : drafts.map(d => d.id));
  };

  const handleDelete = (id: string) => {
    setDeletingId(null);
    toast.success('已删除草稿');
  };

  const handlePublish = (draft: Draft) => {
    toast.success(`正在发布：${draft.name}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-[#00EEFF]" />
        <div>
          <h1 className="text-2xl font-bold text-white">草稿箱</h1>
          <p className="text-[#64748B]">未发布商品管理</p>
        </div>
      </div>

      {/* 筛选栏 + 批量操作 */}
      <Card className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <Input placeholder="搜索草稿" className="pl-10 w-64 h-10 tech-input" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-32 h-10 tech-input">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="draft">草稿中</SelectItem>
                <SelectItem value="ready">待发布</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-32 h-10 tech-input">
                <SelectValue placeholder="平台" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="shopee">Shopee</SelectItem>
                <SelectItem value="lazada">Lazada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[#64748B] text-sm">已选 {selected.length} 项</span>
              <Button variant="ghost" size="sm" className="h-9 bg-[#1E293B] text-white">
                批量编辑
              </Button>
              <Button size="sm" className="h-9 btn-neon-primary">
                批量发布
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 草稿列表 */}
      <Card className="glass-card">
        <div className="p-6 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={selected.length === drafts.length && drafts.length > 0}
              onCheckedChange={toggleSelectAll}
              className="border-[#00EEFF] data-[state=checked]:bg-[#00EEFF] data-[state=checked]:text-[#0B101A]"
            />
            <span className="text-[#64748B] text-sm">全选</span>
          </div>
        </div>
        <div className="divide-y divide-[#1E293B]">
          {drafts.map((draft) => (
            <div key={draft.id} className="p-6 flex items-center gap-4 hover:bg-[rgba(0,238,255,0.05)] transition-colors">
              <Checkbox 
                checked={selected.includes(draft.id)}
                onCheckedChange={() => toggleSelect(draft.id)}
                className="border-[#00EEFF] data-[state=checked]:bg-[#00EEFF] data-[state=checked]:text-[#0B101A]"
              />
              <div className="w-16 h-16 rounded-xl bg-[#1E293B] flex items-center justify-center text-3xl">
                {draft.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{draft.name}</p>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span className="text-[#94A3B8]">{draft.platform}</span>
                  <span className="text-[#64748B]">·</span>
                  <span className="text-[#94A3B8]">{draft.shop}</span>
                  <span className="text-[#64748B]">·</span>
                  <span className="text-[#64748B]">{draft.createdAt}</span>
                </div>
              </div>
              <Badge className={`
                ${draft.status === 'ready' ? 'bg-[rgba(0,238,255,0.2)] text-[#00EEFF] border-[rgba(0,238,255,0.3)]' : ''}
                ${draft.status === 'draft' ? 'bg-[rgba(100,116,139,0.2)] text-[#64748B] border-[rgba(100,116,139,0.3)]' : ''}
              `}>
                {draft.status === 'ready' ? '待发布' : '草稿中'}
              </Badge>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-9 text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  编辑
                </Button>
                {draft.status === 'ready' && (
                  <Button 
                    size="sm"
                    onClick={() => handlePublish(draft)}
                    className="h-9 bg-[rgba(0,238,255,0.1)] text-[#00EEFF] hover:bg-[rgba(0,238,255,0.2)] border border-[rgba(0,238,255,0.3)]"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    发布
                  </Button>
                )}
                <Dialog open={deletingId === draft.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-9 text-[#FF4081] hover:text-[#FF4081] hover:bg-[rgba(255,64,129,0.1)]"
                      onClick={() => setDeletingId(draft.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[rgba(15,22,36,0.95)] border-[#1E293B]">
                    <DialogHeader>
                      <DialogTitle className="text-white">确认删除</DialogTitle>
                      <DialogDescription className="text-[#64748B]">
                        确定要删除草稿「{draft.name}」吗？此操作不可撤销。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                      <Button 
                        variant="ghost" 
                        onClick={() => setDeletingId(null)}
                        className="text-[#64748B] hover:text-white"
                      >
                        取消
                      </Button>
                      <Button 
                        onClick={() => handleDelete(draft.id)}
                        className="bg-[#FF4081] hover:bg-[#F50057] text-white"
                      >
                        确认删除
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>
    </MainLayout>
  );
}
