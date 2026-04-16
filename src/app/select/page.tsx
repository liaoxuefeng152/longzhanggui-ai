'use client';

import { useState } from 'react';
import { Search, TrendingUp, DollarSign, AlertTriangle, Target, BarChart3, Zap, CheckCircle2, FileText, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';

// 竞品数据类型
interface Competitor {
  id: number;
  name: string;
  image: string;
  price: string;
  sales: string;
  rating: string;
  keySellingPoints: string[];
}

// 市场分析结果
interface MarketAnalysis {
  marketSize: 'large' | 'medium' | 'small';
  competition: 'high' | 'medium' | 'low';
  suggestedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketDescription: string;
}

export default function SmartProductSelectionPage() {
  const [step, setStep] = useState(1); // 1: 输入关键词, 2: 分析结果, 3: 选品报告
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState('shopee');
  const [site, setSite] = useState('my');
  
  // 成本计算
  const [cost, setCost] = useState('');
  const [shippingFee, setShippingFee] = useState('15');
  const [commissionRate, setCommissionRate] = useState('6');
  
  // 分析结果
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  // 模拟竞品数据
  const mockCompetitors: Competitor[] = [
    { 
      id: 1, 
      name: '无线蓝牙耳机 TWS 入耳式 降噪超长续航', 
      image: '🎧', 
      price: 'RM 59.00', 
      sales: '2.3k', 
      rating: '4.8',
      keySellingPoints: ['ANC降噪', '40小时续航', 'IPX5防水', '快充功能']
    },
    { 
      id: 2, 
      name: '蓝牙耳机 半入耳式 游戏低延迟', 
      image: '🎧', 
      price: 'RM 45.00', 
      sales: '1.8k', 
      rating: '4.6',
      keySellingPoints: ['65ms低延迟', 'HiFi音质', 'LED电量显示', '轻量设计']
    },
    { 
      id: 3, 
      name: '真无线蓝牙耳机 商务款 超长待机', 
      image: '🎧', 
      price: 'RM 89.00', 
      sales: '980', 
      rating: '4.9',
      keySellingPoints: ['商务外观', '60小时续航', '双麦降噪', '舒适佩戴']
    },
  ];

  // 开始分析
  const handleStartAnalysis = () => {
    if (!keyword) {
      toast.error('请输入类目或关键词');
      return;
    }
    setLoading(true);
    setStep(2);
    
    // 模拟AI分析
    setTimeout(() => {
      setAnalysis({
        marketSize: 'large',
        competition: 'medium',
        suggestedProfit: 35,
        riskLevel: 'low',
        marketDescription: '无线耳机市场需求旺盛，月搜索量超过50万，竞争适中，建议定价区间 RM 49-89'
      });
      setCompetitors(mockCompetitors);
      setLoading(false);
      toast.success('AI 分析完成！');
    }, 2000);
  };

  // 查看选品报告
  const handleViewReport = () => {
    setStep(3);
  };

  // 加入上新队列
  const handleAddToPublishQueue = (product: Competitor) => {
    toast.success(`已加入上新队列：${product.name}`);
  };

  // 计算建议售价和利润
  const calculatePrice = () => {
    if (!cost) return { suggestedPrice: '-', profitRate: '-' };
    
    const costNum = parseFloat(cost);
    const shippingNum = parseFloat(shippingFee) || 0;
    const commissionNum = parseFloat(commissionRate) || 0;
    
    const totalCost = costNum + shippingNum;
    const suggestedPrice = Math.round(totalCost * (1 + 0.6) / (1 - commissionNum / 100));
    const profit = suggestedPrice - totalCost - (suggestedPrice * commissionNum / 100);
    const profitRate = Math.round((profit / suggestedPrice) * 100);
    
    return { 
      suggestedPrice: `RM ${suggestedPrice.toFixed(2)}`, 
      profitRate: `${profitRate}%` 
    };
  };

  const priceResult = calculatePrice();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8 text-[#00EEFF]" />
          <div>
            <h1 className="text-2xl font-bold text-white">智能选品</h1>
            <p className="text-[#64748B]">AI 市场分析 · 竞品挖掘 · 利润计算</p>
          </div>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { step: 1, label: '输入关键词', icon: Search },
            { step: 2, label: 'AI 分析', icon: BarChart3 },
            { step: 3, label: '选品报告', icon: FileText },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.step;
            const isCurrent = step === s.step;
            
            return (
              <div key={s.step} className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  isActive 
                    ? 'bg-[#00EEFF] text-[#0B101A]' 
                    : 'bg-[#1E293B] text-[#64748B]'
                } ${isCurrent ? 'animate-neon-pulse' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm ${isActive ? 'text-white' : 'text-[#64748B]'}`}>
                  {s.label}
                </span>
                {s.step < 3 && (
                  <div className={`w-16 h-0.5 ${isActive ? 'bg-[#00EEFF]' : 'bg-[#1E293B]'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* 步骤1: 输入关键词 */}
        {step === 1 && (
          <Card className="glass-card p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">输入类目或关键词</h3>
            <div className="space-y-6">
              {/* 关键词输入 */}
              <div className="space-y-3">
                <Label className="text-[#94A3B8]">类目/关键词</Label>
                <Input
                  placeholder="例如：无线蓝牙耳机、宠物用品、家居收纳"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="h-14 tech-input text-lg"
                />
              </div>

              {/* 平台和站点选择 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-[#94A3B8]">目标平台</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-12 tech-input">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="lazada">Lazada</SelectItem>
                      <SelectItem value="tiktok">TikTok Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[#94A3B8]">目标站点</Label>
                  <Select value={site} onValueChange={setSite}>
                    <SelectTrigger className="h-12 tech-input">
                      <SelectValue placeholder="选择站点" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                      <SelectItem value="my">马来站</SelectItem>
                      <SelectItem value="th">泰国站</SelectItem>
                      <SelectItem value="vn">越南站</SelectItem>
                      <SelectItem value="id">印尼站</SelectItem>
                      <SelectItem value="ph">菲律宾站</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleStartAnalysis}
                disabled={loading}
                className="w-full h-14 btn-neon-primary text-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#0B101A] border-t-transparent rounded-full animate-spin" />
                    AI 分析中...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    开始 AI 分析
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* 步骤2: 分析结果 */}
        {step === 2 && analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：市场分析 + 利润计算 */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI 市场分析结果 */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#00EEFF]" />
                  AI 市场分析
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(0,238,255,0.1)] border border-[rgba(0,238,255,0.2)]">
                    <div>
                      <span className="text-[#94A3B8] text-sm">市场规模</span>
                      <p className="text-[#00EEFF] font-bold text-xl capitalize">{analysis.marketSize}</p>
                    </div>
                    {analysis.marketSize === 'large' && <TrendingUp className="w-6 h-6 text-[#00EEFF]" />}
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(123,97,255,0.1)] border border-[rgba(123,97,255,0.2)]">
                    <div>
                      <span className="text-[#94A3B8] text-sm">竞争度</span>
                      <p className="text-[#7B61FF] font-bold text-xl capitalize">{analysis.competition}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.2)]">
                    <div>
                      <span className="text-[#94A3B8] text-sm">建议利润率</span>
                      <p className="text-[#00E676] font-bold text-xl">{analysis.suggestedProfit}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[rgba(255,152,0,0.1)] border border-[rgba(255,152,0,0.2)]">
                    <div>
                      <span className="text-[#94A3B8] text-sm">风险等级</span>
                      <p className={`font-bold text-xl capitalize ${
                        analysis.riskLevel === 'low' ? 'text-[#00E676]' :
                        analysis.riskLevel === 'medium' ? 'text-[#FF9800]' : 'text-[#FF4081]'
                      }`}>{analysis.riskLevel}</p>
                    </div>
                    {analysis.riskLevel === 'low' && <CheckCircle2 className="w-6 h-6 text-[#00E676]" />}
                    {analysis.riskLevel !== 'low' && <AlertTriangle className="w-6 h-6 text-[#FF9800]" />}
                  </div>
                  
                  <Separator className="bg-[#1E293B]" />
                  
                  <p className="text-[#94A3B8] text-sm leading-relaxed">
                    {analysis.marketDescription}
                  </p>
                </div>
              </Card>

              {/* 利润计算器 */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#7B61FF]" />
                  利润计算器
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">成本价 (CNY)</Label>
                    <Input 
                      type="number" 
                      placeholder="请输入成本价" 
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="h-12 tech-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">物流费 (CNY)</Label>
                    <Input 
                      type="number" 
                      placeholder="物流费" 
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      className="h-12 tech-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">平台佣金 (%)</Label>
                    <Input 
                      type="number" 
                      placeholder="佣金比例" 
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="h-12 tech-input"
                    />
                  </div>
                  
                  {cost && (
                    <div className="pt-4 border-t border-[#1E293B] space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">建议售价</span>
                        <span className="text-[#00EEFF] font-bold text-xl">{priceResult.suggestedPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">预估利润率</span>
                        <span className={`font-bold text-xl ${
                          parseFloat(priceResult.profitRate) >= 30 ? 'text-[#00E676]' :
                          parseFloat(priceResult.profitRate) >= 20 ? 'text-[#FF9800]' : 'text-[#FF4081]'
                        }`}>{priceResult.profitRate}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Button 
                onClick={handleViewReport}
                className="w-full h-12 bg-[rgba(123,97,255,0.2)] text-[#7B61FF] hover:bg-[rgba(123,97,255,0.3)] border border-[rgba(123,97,255,0.3)]"
              >
                <FileText className="w-5 h-5 mr-2" />
                查看完整选品报告
              </Button>
            </div>

            {/* 右侧：竞品挖掘 */}
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <div className="p-6 border-b border-[#1E293B]">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#00EEFF]" />
                    竞品挖掘
                    <Badge className="ml-2 bg-[rgba(0,238,255,0.2)] text-[#00EEFF] border-[rgba(0,238,255,0.3)]">
                      {competitors.length} 个热销竞品
                    </Badge>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {competitors.map((product) => (
                      <div 
                        key={product.id} 
                        className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B] hover:border-[rgba(0,238,255,0.3)] transition-all"
                      >
                        <div className="flex items-start gap-5">
                          <div className="w-20 h-20 rounded-xl bg-[#1E293B] flex items-center justify-center text-4xl flex-shrink-0">
                            {product.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-base mb-3 line-clamp-2">{product.name}</p>
                            <div className="flex items-center gap-6 mb-3">
                              <span className="text-[#00EEFF] font-bold text-lg">{product.price}</span>
                              <span className="text-[#94A3B8] text-sm">销量: {product.sales}</span>
                              <span className="text-[#FF9800] text-sm">评分: {product.rating}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.keySellingPoints.map((point, i) => (
                                <Badge 
                                  key={i}
                                  className="bg-[rgba(0,238,255,0.1)] text-[#00EEFF] border-[rgba(0,238,255,0.2)]"
                                >
                                  {point}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="ghost"
                                onClick={() => handleAddToPublishQueue(product)}
                                className="bg-[rgba(0,238,255,0.1)] text-[#00EEFF] hover:bg-[rgba(0,238,255,0.2)] border border-[rgba(0,238,255,0.3)]"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                加入上新队列
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 步骤3: 选品报告 */}
        {step === 3 && (
          <Card className="glass-card p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[rgba(0,238,255,0.2)] flex items-center justify-center mx-auto mb-4 animate-neon-pulse">
                <FileText className="w-10 h-10 text-[#00EEFF]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">智能选品报告</h2>
              <p className="text-[#64748B]">关键词：{keyword}</p>
            </div>

            <Separator className="bg-[#1E293B] my-8" />

            <div className="space-y-8">
              {/* 市场分析总结 */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#00EEFF]" />
                  市场分析总结
                </h3>
                <Card className="bg-[rgba(0,238,255,0.05)] border-[rgba(0,238,255,0.2)] p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-[#64748B] text-sm mb-1">市场规模</p>
                      <p className="text-[#00EEFF] font-bold text-xl capitalize">Large</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#64748B] text-sm mb-1">竞争度</p>
                      <p className="text-[#7B61FF] font-bold text-xl capitalize">Medium</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#64748B] text-sm mb-1">建议利润率</p>
                      <p className="text-[#00E676] font-bold text-xl">35%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#64748B] text-sm mb-1">风险等级</p>
                      <p className="text-[#00E676] font-bold text-xl capitalize">Low</p>
                    </div>
                  </div>
                  <p className="text-[#94A3B8] leading-relaxed">
                    {analysis?.marketDescription}
                  </p>
                </Card>
              </section>

              {/* 建议操作 */}
              <section>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-[#00E676]" />
                  建议操作
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.2)] flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00E676] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">建议进入此品类</p>
                      <p className="text-[#94A3B8] text-sm">市场需求旺盛，竞争适中，利润空间可观</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[rgba(0,238,255,0.1)] border border-[rgba(0,238,255,0.2)] flex items-start gap-3">
                    <Target className="w-5 h-5 text-[#00EEFF] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">建议定价区间</p>
                      <p className="text-[#94A3B8] text-sm">RM 49 - RM 89，避开价格战头部区间</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[rgba(123,97,255,0.1)] border border-[rgba(123,97,255,0.2)] flex items-start gap-3">
                    <ShoppingCart className="w-5 h-5 text-[#7B61FF] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">差异化卖点建议</p>
                      <p className="text-[#94A3B8] text-sm">突出续航、降噪、快充功能，避开单纯价格竞争</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-center gap-4 mt-10">
              <Button 
                variant="ghost"
                onClick={() => setStep(2)}
                className="h-12 px-6 bg-[#1E293B] text-white hover:bg-[#2D3748]"
              >
                返回分析
              </Button>
              <Button 
                className="h-12 px-8 btn-neon-primary"
                onClick={() => toast.success('已保存选品报告！')}
              >
                <FileText className="w-5 h-5 mr-2" />
                保存报告
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
