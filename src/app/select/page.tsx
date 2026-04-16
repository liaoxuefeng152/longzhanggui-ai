'use client';

import { useState } from 'react';
import { Search, TrendingUp, DollarSign, AlertTriangle, Target, BarChart3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductSelectionPage() {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState('shopee');
  const [site, setSite] = useState('my');

  const competitors = [
    { id: 1, name: '无线蓝牙耳机 TWS 入耳式', price: 'RM 59.00', sales: '2.3k', rating: '4.8', image: '🎧' },
    { id: 2, name: '智能手表 运动手环 心率监测', price: 'RM 129.00', sales: '1.8k', rating: '4.6', image: '⌚' },
    { id: 3, name: '便携充电宝 20000mAh 快充', price: 'RM 45.00', sales: '3.1k', rating: '4.7', image: '🔋' },
  ];

  const handleAnalyze = () => {
    if (!keyword) {
      toast.error('请输入关键词');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('分析完成！');
    }, 2000);
  };

  const addToDraft = (product: any) => {
    toast.success(`已加入草稿箱：${product.name}`);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <Search className="w-8 h-8 text-[#00EEFF]" />
        <div>
          <h1 className="text-2xl font-bold text-white">选品中心</h1>
          <p className="text-[#64748B]">AI市场分析 · 竞品挖掘 · 利润测算</p>
        </div>
      </div>

      {/* 搜索区 */}
      <Card className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="输入关键词，如：wireless earbuds"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-12 tech-input"
            />
          </div>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-40 h-12 tech-input">
              <SelectValue placeholder="选择平台" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F1628] border-[#1E293B]">
              <SelectItem value="shopee">Shopee</SelectItem>
              <SelectItem value="lazada">Lazada</SelectItem>
              <SelectItem value="tiktok">TikTok Shop</SelectItem>
            </SelectContent>
          </Select>
          <Select value={site} onValueChange={setSite}>
            <SelectTrigger className="w-32 h-12 tech-input">
              <SelectValue placeholder="站点" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F1628] border-[#1E293B]">
              <SelectItem value="my">马来站</SelectItem>
              <SelectItem value="th">泰国站</SelectItem>
              <SelectItem value="vn">越南站</SelectItem>
              <SelectItem value="id">印尼站</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAnalyze}
            disabled={loading}
            className="h-12 btn-neon-primary min-w-[140px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#0B101A] border-t-transparent rounded-full animate-spin" />
                分析中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                开始分析
              </div>
            )}
          </Button>
        </div>
      </Card>

      {/* AI分析结果 + 竞品列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI分析结果 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#00EEFF]" />
              AI分析结果
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(0,238,255,0.1)] border border-[rgba(0,238,255,0.2)]">
                <span className="text-[#94A3B8]">市场规模</span>
                <span className="text-[#00EEFF] font-bold text-xl">大</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(123,97,255,0.1)] border border-[rgba(123,97,255,0.2)]">
                <span className="text-[#94A3B8]">竞争度</span>
                <span className="text-[#7B61FF] font-bold text-xl">中</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.2)]">
                <span className="text-[#94A3B8]">建议利润率</span>
                <span className="text-[#00E676] font-bold text-xl">35%</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(255,152,0,0.1)] border border-[rgba(255,152,0,0.2)]">
                <span className="text-[#94A3B8]">风险提示</span>
                <span className="text-[#FF9800]">低</span>
              </div>
            </div>
          </Card>

          {/* 利润计算器 */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#7B61FF]" />
              利润计算器
            </h3>
            <div className="space-y-3">
              <Input placeholder="成本价 (CNY)" className="h-10 tech-input" />
              <Input placeholder="物流费 (CNY)" className="h-10 tech-input" />
              <Input placeholder="平台佣金 (%)" className="h-10 tech-input" defaultValue="6" />
              <div className="pt-2 border-t border-[#1E293B]">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#64748B]">建议售价</span>
                  <span className="text-[#00EEFF] font-bold">RM 79.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">预估利润率</span>
                  <span className="text-[#00E676] font-bold">32%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 竞品列表 */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <div className="p-6 border-b border-[#1E293B]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00EEFF]" />
                竞品列表
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {competitors.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B] hover:border-[rgba(0,238,255,0.3)] transition-all">
                    <div className="w-16 h-16 rounded-xl bg-[#1E293B] flex items-center justify-center text-3xl">
                      {product.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[#00EEFF] font-bold">{product.price}</span>
                        <span className="text-[#94A3B8] text-sm">销量: {product.sales}</span>
                        <span className="text-[#FF9800] text-sm">评分: {product.rating}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => addToDraft(product)}
                      className="bg-[rgba(0,238,255,0.1)] text-[#00EEFF] hover:bg-[rgba(0,238,255,0.2)] border border-[rgba(0,238,255,0.3)]"
                    >
                      加入草稿
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
