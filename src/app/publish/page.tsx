'use client';

import { useState } from 'react';
import { ShoppingCart, Link, Image, FileText, Play, Zap, Eye, Save, Send, Store, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PublishPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');

  const [options, setOptions] = useState({
    imageProcess: true,
    generateListing: true,
    generateVideo: false,
    smartPricing: true,
  });

  const handleCollect = () => {
    if (!url) {
      toast.error('请输入1688商品链接');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      toast.success('采集成功！');
    }, 1500);
  };

  const handlePublish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      toast.success('发布成功！');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-[#00EEFF]" />
        <div>
          <h1 className="text-2xl font-bold text-white">上新中心</h1>
          <p className="text-[#64748B]">1688采集 · AI生成 · 一键发布</p>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= s 
                ? 'bg-[#00EEFF] text-[#0B101A]' 
                : 'bg-[#1E293B] text-[#64748B]'
            }`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span className={`text-sm ${step >= s ? 'text-white' : 'text-[#64748B]'}`}>
              {s === 1 ? '采集商品' : s === 2 ? 'AI处理' : '完成发布'}
            </span>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#00EEFF]' : 'bg-[#1E293B]'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="glass-card p-8 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">输入1688商品链接</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <Input
                  placeholder="https://detail.1688.com/offer/xxx.html"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-14 tech-input text-lg"
                />
              </div>
              <Button 
                onClick={handleCollect}
                disabled={loading}
                className="h-14 px-8 btn-neon-primary"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0B101A] border-t-transparent rounded-full animate-spin" />
                    采集中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    一键采集
                  </div>
                )}
              </Button>
            </div>
            <p className="text-center text-[#64748B] text-sm">
              或 <button className="text-[#00EEFF] hover:underline">手动添加商品</button>
            </p>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：AI处理选项 */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00EEFF]" />
              AI处理选项
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-[rgba(0,238,255,0.05)] border border-[rgba(0,238,255,0.2)]">
                <Checkbox 
                  id="image" 
                  checked={options.imageProcess}
                  onCheckedChange={(c) => setOptions({...options, imageProcess: !!c})}
                  className="border-[#00EEFF] data-[state=checked]:bg-[#00EEFF] data-[state=checked]:text-[#0B101A]"
                />
                <div className="flex-1">
                  <Label htmlFor="image" className="text-white font-medium flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    AI图片处理
                  </Label>
                  <p className="text-[#64748B] text-sm mt-1">白底图、翻译、AI优化</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-xl bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.2)]">
                <Checkbox 
                  id="listing" 
                  checked={options.generateListing}
                  onCheckedChange={(c) => setOptions({...options, generateListing: !!c})}
                  className="border-[#7B61FF] data-[state=checked]:bg-[#7B61FF] data-[state=checked]:text-white"
                />
                <div className="flex-1">
                  <Label htmlFor="listing" className="text-white font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    生成Listing
                  </Label>
                  <p className="text-[#64748B] text-sm mt-1">标题、描述、关键词</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-xl bg-[rgba(255,152,0,0.05)] border border-[rgba(255,152,0,0.2)]">
                <Checkbox 
                  id="video" 
                  checked={options.generateVideo}
                  onCheckedChange={(c) => setOptions({...options, generateVideo: !!c})}
                  className="border-[#FF9800] data-[state=checked]:bg-[#FF9800] data-[state=checked]:text-white"
                />
                <div className="flex-1">
                  <Label htmlFor="video" className="text-white font-medium flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    生成15秒带货视频
                  </Label>
                  <p className="text-[#64748B] text-sm mt-1">AI短视频生成</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-xl bg-[rgba(0,230,118,0.05)] border border-[rgba(0,230,118,0.2)]">
                <Checkbox 
                  id="pricing" 
                  checked={options.smartPricing}
                  onCheckedChange={(c) => setOptions({...options, smartPricing: !!c})}
                  className="border-[#00E676] data-[state=checked]:bg-[#00E676] data-[state=checked]:text-[#0B101A]"
                />
                <div className="flex-1">
                  <Label htmlFor="pricing" className="text-white font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    智能定价
                  </Label>
                  <p className="text-[#64748B] text-sm mt-1">竞品参考、利润最优</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 右侧：内容预览 + 发布选择 */}
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#7B61FF]" />
                选择发布店铺
              </h3>
              <div className="space-y-4">
                <Select defaultValue="shopee">
                  <SelectTrigger className="h-12 tech-input">
                    <SelectValue placeholder="选择平台" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="lazada">Lazada</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="shop1">
                  <SelectTrigger className="h-12 tech-input">
                    <SelectValue placeholder="选择店铺" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                    <SelectItem value="shop1">深圳数码店</SelectItem>
                    <SelectItem value="shop2">广州服饰店</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="my">
                  <SelectTrigger className="h-12 tech-input">
                    <SelectValue placeholder="选择站点" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                    <SelectItem value="my">马来站</SelectItem>
                    <SelectItem value="th">泰国站</SelectItem>
                    <SelectItem value="vn">越南站</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#00EEFF]" />
                内容预览
              </h3>
              <div className="space-y-4">
                <div className="aspect-square rounded-xl bg-[#1E293B] flex items-center justify-center text-6xl">
                  🎧
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">无线蓝牙耳机 TWS 入耳式 降噪</p>
                  <p className="text-[#00EEFF] text-xl font-bold">RM 79.00</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 bg-[#1E293B] text-white hover:bg-[#2D3748]">
                <Save className="w-5 h-5 mr-2" />
                保存草稿
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 h-12 btn-neon-primary"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0B101A] border-t-transparent rounded-full animate-spin" />
                    发布中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    发布到店铺
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="glass-card p-12 max-w-xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-[rgba(0,238,255,0.2)] flex items-center justify-center mx-auto mb-6 animate-neon-pulse">
            <CheckCircle2 className="w-12 h-12 text-[#00EEFF]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">发布成功！</h2>
          <p className="text-[#64748B] mb-8">商品已成功发布到 Shopee 深圳店（马来站）</p>
          <div className="flex gap-4 justify-center">
            <Button variant="ghost" className="h-12 px-6 bg-[#1E293B] text-white hover:bg-[#2D3748]">
              查看商品
            </Button>
            <Button 
              onClick={() => { setStep(1); setUrl(''); }}
              className="h-12 px-6 btn-neon-primary"
            >
              继续上新
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
