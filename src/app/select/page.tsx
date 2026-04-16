'use client';

import { useState } from 'react';
import { Search, Sparkles, TrendingUp, Filter, Plus, CheckCircle, AlertTriangle, Target, Zap, DollarSign, BarChart3, Clock, Store, Truck, Package, Star, ExternalLink, Copy, Shield, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

// 模拟选品数据
const mockProductIdeas = [
  {
    id: 1,
    name: '宠物自动喂食器',
    category: '宠物用品',
    score: 95,
    profitMargin: 45,
    competition: '中等',
    trend: '上升',
    priceRange: '$29.99 - $49.99',
    features: ['定时喂食', 'APP控制', '大容量'],
    reasons: ['宠物类目持续增长', '智能化趋势明显', '利润空间大'],
  },
  {
    id: 2,
    name: 'LED氛围灯串',
    category: '家居装饰',
    score: 88,
    profitMargin: 55,
    competition: '较低',
    trend: '稳定',
    priceRange: '$9.99 - $24.99',
    features: ['USB供电', '多模式', 'APP控制'],
    reasons: ['节日季需求大', '轻量化易运输', '复购率高'],
  },
  {
    id: 3,
    name: '便携手机支架',
    category: '手机配件',
    score: 82,
    profitMargin: 60,
    competition: '激烈',
    trend: '下降',
    priceRange: '$4.99 - $14.99',
    features: ['折叠便携', '多角度', '防滑设计'],
    reasons: ['需求稳定', '供应链成熟', '进入门槛低'],
  },
];

// 模拟供应商数据
const mockSuppliers = [
  {
    id: 1,
    productId: 1,
    name: '深圳智能宠物用品有限公司',
    rating: 4.9,
    responseTime: '1小时内',
    moq: 50,
    priceRange: '¥80 - ¥120',
    deliveryTime: '3-5天',
    certifications: ['BSCI', 'ISO9001'],
    isOnePieceDelivery: true,
    tradeAssurance: true,
    years: 8,
    link: 'https://detail.1688.com/xxx',
  },
  {
    id: 2,
    productId: 1,
    name: '东莞宠物科技厂',
    rating: 4.7,
    responseTime: '2小时内',
    moq: 100,
    priceRange: '¥70 - ¥100',
    deliveryTime: '5-7天',
    certifications: ['ISO9001'],
    isOnePieceDelivery: false,
    tradeAssurance: true,
    years: 5,
    link: 'https://detail.1688.com/yyy',
  },
  {
    id: 3,
    productId: 1,
    name: '广州宠物用品批发',
    rating: 4.5,
    responseTime: '4小时内',
    moq: 20,
    priceRange: '¥90 - ¥130',
    deliveryTime: '2-3天',
    certifications: [],
    isOnePieceDelivery: true,
    tradeAssurance: true,
    years: 3,
    link: 'https://detail.1688.com/zzz',
  },
  {
    id: 4,
    productId: 2,
    name: '中山灯饰厂',
    rating: 4.8,
    responseTime: '1小时内',
    moq: 100,
    priceRange: '¥15 - ¥25',
    deliveryTime: '3-5天',
    certifications: ['CE', 'ROHS'],
    isOnePieceDelivery: true,
    tradeAssurance: true,
    years: 10,
    link: 'https://detail.1688.com/aaa',
  },
  {
    id: 5,
    productId: 2,
    name: '义乌装饰品批发',
    rating: 4.6,
    responseTime: '3小时内',
    moq: 200,
    priceRange: '¥12 - ¥20',
    deliveryTime: '5-7天',
    certifications: [],
    isOnePieceDelivery: false,
    tradeAssurance: true,
    years: 6,
    link: 'https://detail.1688.com/bbb',
  },
];

// 模拟竞品数据
const mockCompetitors = [
  {
    id: 1,
    productId: 1,
    name: '智能宠物喂食器 Pro',
    platform: 'TikTok Shop',
    price: '$39.99',
    rating: 4.8,
    reviews: 2847,
    sales: '月销 1.2K',
    mainImage: '🐾',
    coreSellingPoints: ['1080P摄像头', '语音对讲', '5L大容量'],
    priceTrend: 'stable',
  },
  {
    id: 2,
    productId: 1,
    name: '自动喂食器 WiFi版',
    platform: 'Shopee',
    price: '$34.99',
    rating: 4.6,
    reviews: 1523,
    sales: '月销 856',
    mainImage: '🐕',
    coreSellingPoints: ['APP远程控制', '定时喂食', '防卡死设计'],
    priceTrend: 'down',
  },
  {
    id: 3,
    productId: 1,
    name: '宠物智能投喂器',
    platform: 'Lazada',
    price: '$45.99',
    rating: 4.9,
    reviews: 956,
    sales: '月销 432',
    mainImage: '🐱',
    coreSellingPoints: ['双食碗设计', '冻干零食盒', '不锈钢碗'],
    priceTrend: 'up',
  },
  {
    id: 4,
    productId: 2,
    name: 'LED灯串 遥控版',
    platform: 'TikTok Shop',
    price: '$19.99',
    rating: 4.7,
    reviews: 5632,
    sales: '月销 3.5K',
    mainImage: '💡',
    coreSellingPoints: ['16种颜色', '音乐同步', 'IP65防水'],
    priceTrend: 'stable',
  },
  {
    id: 5,
    productId: 2,
    name: '氛围灯串 USB款',
    platform: 'Shopee',
    price: '$14.99',
    rating: 4.5,
    reviews: 3241,
    sales: '月销 2.1K',
    mainImage: '✨',
    coreSellingPoints: ['8种模式', 'USB供电', '可裁剪'],
    priceTrend: 'down',
  },
];

// 辅助函数：从价格区间提取最低价格
const getMinPrice = (priceStr: string) => {
  try {
    const match = priceStr.match(/¥(\d+)/);
    return match ? parseInt(match[1]) : 99999;
  } catch {
    return 99999;
  }
};

export default function SelectPage() {
  const [activeTab, setActiveTab] = useState('demand');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatchingSupplier, setIsMatchingSupplier] = useState(false);
  const [demandForm, setDemandForm] = useState({
    category: '',
    budget: '',
    market: '',
    requirement: '',
  });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentProductForSupplier, setCurrentProductForSupplier] = useState<number | null>(null);
  const [supplierFilters, setSupplierFilters] = useState({
    onePieceDelivery: false,
    maxMoq: 'all',
    sortBy: 'rating',
  });

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    setActiveTab('mining');
    toast.success('竞品挖掘完成！');
  };

  const startSupplierMatch = async (productId: number) => {
    setCurrentProductForSupplier(productId);
    setIsMatchingSupplier(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsMatchingSupplier(false);
    setActiveTab('suppliers');
    toast.success('供应商匹配完成！');
  };

  const copySupplierLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('链接已复制');
  };

  const openSupplierLink = (link: string) => {
    window.open(link, '_blank');
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const addToDraft = () => {
    if (selectedProducts.length === 0) {
      toast.error('请先选择商品');
      return;
    }
    toast.success(`已将 ${selectedProducts.length} 个商品加入草稿箱`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#00B42A]';
    if (score >= 80) return 'text-[#FF7D00]';
    return 'text-[#F53F3F]';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">选品中心</h1>
            <p className="text-[#86909C] mt-1">AI智能分析，帮您找到爆品</p>
          </div>
          {selectedProducts.length > 0 && (
            <Button className="btn-primary" onClick={addToDraft}>
              加入草稿箱 ({selectedProducts.length})
            </Button>
          )}
        </div>

        {/* 选品流程卡片 */}
        <Card className="card-minimal">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-8 bg-[#F2F3F5]">
                <TabsTrigger value="demand" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
                  1. 需求分析
                </TabsTrigger>
                <TabsTrigger value="mining" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]" disabled={!isAnalyzing && activeTab !== 'mining' && activeTab !== 'products' && activeTab !== 'report' && activeTab !== 'suppliers'}>
                  2. 竞品挖掘
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]" disabled={!isAnalyzing && activeTab !== 'products' && activeTab !== 'report' && activeTab !== 'suppliers'}>
                  3. 可行性分析
                </TabsTrigger>
                <TabsTrigger value="report" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]" disabled={!isAnalyzing && activeTab !== 'report' && activeTab !== 'suppliers'}>
                  4. 生成报告
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]" disabled={!isAnalyzing && activeTab !== 'suppliers'}>
                  5. 供应链匹配
                </TabsTrigger>
              </TabsList>

              {/* 需求分析 */}
              <TabsContent value="demand" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#1D2129]">告诉我们您的需求</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">目标类目</label>
                          <Select 
                            value={demandForm.category} 
                            onValueChange={(v) => setDemandForm({ ...demandForm, category: v })}
                          >
                            <SelectTrigger className="input-minimal">
                              <SelectValue placeholder="请选择类目" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pet">宠物用品</SelectItem>
                              <SelectItem value="home">家居装饰</SelectItem>
                              <SelectItem value="electronics">3C数码</SelectItem>
                              <SelectItem value="beauty">美妆个护</SelectItem>
                              <SelectItem value="fashion">时尚服饰</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">目标市场</label>
                          <Select 
                            value={demandForm.market} 
                            onValueChange={(v) => setDemandForm({ ...demandForm, market: v })}
                          >
                            <SelectTrigger className="input-minimal">
                              <SelectValue placeholder="请选择市场" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">美国</SelectItem>
                              <SelectItem value="uk">英国</SelectItem>
                              <SelectItem value="id">印尼</SelectItem>
                              <SelectItem value="th">泰国</SelectItem>
                              <SelectItem value="global">全球市场</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">预算范围</label>
                          <Select 
                            value={demandForm.budget} 
                            onValueChange={(v) => setDemandForm({ ...demandForm, budget: v })}
                          >
                            <SelectTrigger className="input-minimal">
                              <SelectValue placeholder="请选择预算" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">$1000 以下</SelectItem>
                              <SelectItem value="medium">$1000 - $5000</SelectItem>
                              <SelectItem value="high">$5000 - $20000</SelectItem>
                              <SelectItem value="ultra">$20000 以上</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">其他需求描述</label>
                          <Textarea
                            placeholder="请描述您的特殊需求，比如：避开季节性商品、需要轻小件、利润率要求等..."
                            value={demandForm.requirement}
                            onChange={(e) => setDemandForm({ ...demandForm, requirement: e.target.value })}
                            className="input-minimal min-h-[120px]"
                          />
                        </div>
                      </div>

                      <Button 
                        className="w-full btn-primary h-12 text-base"
                        onClick={startAnalysis}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            AI分析中，请稍候...
                          </div>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            开始AI选品分析
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#E8F3FF] to-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 text-[#165DFF] mr-2" />
                      AI选品优势
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-[#165DFF]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1D2129]">趋势分析</h4>
                          <p className="text-sm text-[#86909C]">基于大数据分析市场趋势，识别潜力商品</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-5 h-5 text-[#165DFF]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1D2129]">利润测算</h4>
                          <p className="text-sm text-[#86909C]">精准计算成本、物流、佣金，预估利润空间</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-5 h-5 text-[#165DFF]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1D2129]">竞品分析</h4>
                          <p className="text-sm text-[#86909C]">深入分析头部竞品，找出差异化机会</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-[#165DFF]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1D2129]">智能推荐</h4>
                          <p className="text-sm text-[#86909C]">结合您的需求，AI智能推荐最适合的商品</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 竞品挖掘 */}
              <TabsContent value="mining" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-[#1D2129]">热销竞品分析</h3>
                      <p className="text-[#86909C] mt-1">AI抓取平台热销竞品，分析价格、评分、销量数据</p>
                    </div>
                    <Select defaultValue="1">
                      <SelectTrigger className="w-48 input-minimal h-9">
                        <SelectValue placeholder="选择商品" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">宠物自动喂食器</SelectItem>
                        <SelectItem value="2">LED氛围灯串</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 竞品统计卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="card-minimal p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E8F3FF] flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-[#165DFF]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">价格区间</p>
                          <p className="text-lg font-bold text-[#1D2129]">$34.99 - $45.99</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="card-minimal p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E8FFEA] flex items-center justify-center">
                          <Star className="w-5 h-5 text-[#00B42A] fill-[#00B42A]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">平均评分</p>
                          <p className="text-lg font-bold text-[#1D2129]">4.7 / 5.0</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="card-minimal p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FFF7E8] flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-[#FF7D00]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">总销量</p>
                          <p className="text-lg font-bold text-[#1D2129]">5.9K+</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="card-minimal p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F2F3F5] flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-[#4E5969]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">竞品数量</p>
                          <p className="text-lg font-bold text-[#1D2129]">3 个</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* 竞品列表 */}
                  <div className="space-y-4">
                    {mockCompetitors
                      .filter(c => !currentProductForSupplier || c.productId === currentProductForSupplier || c.productId === 1)
                      .map((competitor) => (
                        <Card key={competitor.id} className="card-minimal">
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 rounded-lg bg-[#F2F3F5] flex items-center justify-center text-4xl flex-shrink-0">
                                {competitor.mainImage}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="text-lg font-semibold text-[#1D2129]">{competitor.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className="bg-[#F2F3F5] text-[#4E5969]">{competitor.platform}</Badge>
                                      {competitor.priceTrend === 'up' && (
                                        <Badge className="bg-[#FFECE8] text-[#F53F3F]">
                                          <ArrowUp className="w-3 h-3 mr-1" />
                                          价格上涨
                                        </Badge>
                                      )}
                                      {competitor.priceTrend === 'down' && (
                                        <Badge className="bg-[#E8FFEA] text-[#00B42A]">
                                          <ArrowDown className="w-3 h-3 mr-1" />
                                          价格下降
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-[#165DFF]">{competitor.price}</p>
                                    <p className="text-sm text-[#86909C]">{competitor.sales}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-sm text-[#86909C]">评分</p>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-[#FF7D00] fill-[#FF7D00]" />
                                      <span className="text-[#1D2129] font-medium">{competitor.rating}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-[#86909C]">评论数</p>
                                    <p className="text-[#1D2129] font-medium">{competitor.reviews.toLocaleString()}</p>
                                  </div>
                                  <div className="md:col-span-2">
                                    <p className="text-sm text-[#86909C] mb-2">核心卖点</p>
                                    <div className="flex flex-wrap gap-2">
                                      {competitor.coreSellingPoints.map((point, idx) => (
                                        <Badge key={idx} className="bg-[#E8F3FF] text-[#165DFF]">
                                          {point}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button className="btn-primary" onClick={() => setActiveTab('products')}>
                      继续下一步：可行性分析
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 可行性分析 */}
              <TabsContent value="products" className="mt-0">
                <div className="space-y-4">
                  {mockProductIdeas.map((product) => (
                    <Card 
                      key={product.id} 
                      className={`card-minimal cursor-pointer transition-all ${
                        selectedProducts.includes(product.id) ? 'border-[#165DFF] bg-[#E8F3FF]/30' : ''
                      }`}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-[#F2F3F5] flex items-center justify-center flex-shrink-0">
                              <CheckCircle 
                                className={`w-8 h-8 ${
                                  selectedProducts.includes(product.id) ? 'text-[#165DFF]' : 'text-[#C9CDD4]'
                                }`} 
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-[#1D2129]">{product.name}</h3>
                                <Badge className="bg-[#F2F3F5] text-[#4E5969]">{product.category}</Badge>
                                <div className={`text-2xl font-bold ${getScoreColor(product.score)}`}>
                                  {product.score}分
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-[#86909C]">利润率</p>
                                  <p className="text-[#1D2129] font-medium">{product.profitMargin}%</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#86909C]">竞争度</p>
                                  <p className="text-[#1D2129] font-medium">{product.competition}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#86909C]">价格区间</p>
                                  <p className="text-[#1D2129] font-medium">{product.priceRange}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#86909C]">趋势</p>
                                  <p className={`font-medium ${product.trend === '上升' ? 'text-[#00B42A]' : product.trend === '下降' ? 'text-[#F53F3F]' : 'text-[#4E5969]'}`}>
                                    {product.trend}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-6">
                                <div>
                                  <p className="text-sm text-[#86909C] mb-2">核心卖点</p>
                                  <div className="flex flex-wrap gap-2">
                                    {product.features.map((feature, idx) => (
                                      <Badge key={idx} className="bg-[#E8F3FF] text-[#165DFF]">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-[#86909C] mb-2">推荐理由</p>
                                  <ul className="text-sm text-[#4E5969] space-y-1">
                                    {product.reasons.map((reason, idx) => (
                                      <li key={idx}>• {reason}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-[#E5E6EB]">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-[#165DFF]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startSupplierMatch(product.id);
                                  }}
                                >
                                  <Store className="w-4 h-4 mr-1" />
                                  匹配供应商
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button className="btn-primary" onClick={() => setActiveTab('report')}>
                    生成选品报告
                  </Button>
                </div>
              </TabsContent>

              {/* 生成报告 */}
              <TabsContent value="report" className="mt-0">
                <Card className="card-minimal">
                  <div className="p-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-[#E8FFEA] flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-[#00B42A]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1D2129] mb-2">选品分析完成</h3>
                      <p className="text-[#86909C]">AI已为您生成详细的选品分析报告</p>
                    </div>
                    
                    <div className="max-w-2xl mx-auto bg-[#F7F8FA] rounded-lg p-6 mb-6">
                      <h4 className="font-semibold text-[#1D2129] mb-4">📊 选品分析报告摘要</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-[#86909C]">推荐商品</p>
                          <p className="text-[#1D2129] font-medium">宠物自动喂食器、LED氛围灯串</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">预期利润率</p>
                          <p className="text-[#00B42A] font-medium">45% - 55%</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">风险评估</p>
                          <p className="text-[#FF7D00] font-medium">中等风险，建议小批量测试</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button variant="ghost" className="btn-secondary">
                        下载完整报告
                      </Button>
                      <Button 
                        className="btn-primary" 
                        onClick={() => selectedProducts.length > 0 && startSupplierMatch(selectedProducts[0])}
                        disabled={selectedProducts.length === 0}
                      >
                        <Store className="w-4 h-4 mr-2" />
                        匹配1688供应商
                      </Button>
                    </div>
                    {selectedProducts.length === 0 && (
                      <p className="text-center text-sm text-[#86909C] mt-4">
                        请先在可行性分析中选择商品，再匹配供应商
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* 供应链匹配 */}
              <TabsContent value="suppliers" className="mt-0">
                {isMatchingSupplier ? (
                  <Card className="card-minimal">
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 rounded-full bg-[#E8F3FF] flex items-center justify-center mx-auto mb-6">
                        <div className="w-10 h-10 border-4 border-[#165DFF] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1D2129] mb-2">正在匹配1688供应商</h3>
                      <p className="text-[#86909C] mb-6">AI正在为您筛选最优供应商...</p>
                      <Progress value={60} className="h-2 max-w-md mx-auto" />
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* 筛选器 */}
                    <Card className="card-minimal">
                      <div className="p-5 border-b border-[#E5E6EB]">
                        <h3 className="text-lg font-semibold text-[#1D2129]">供应商筛选</h3>
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-[#4E5969]">一件代发</label>
                            <Switch 
                              checked={supplierFilters.onePieceDelivery}
                              onCheckedChange={(checked) => setSupplierFilters({ ...supplierFilters, onePieceDelivery: checked })}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-[#4E5969]">最大MOQ</label>
                            <Select 
                              value={supplierFilters.maxMoq} 
                              onValueChange={(v) => setSupplierFilters({ ...supplierFilters, maxMoq: v })}
                            >
                              <SelectTrigger className="w-32 input-minimal h-9">
                                <SelectValue placeholder="不限" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">不限</SelectItem>
                                <SelectItem value="20">≤ 20</SelectItem>
                                <SelectItem value="50">≤ 50</SelectItem>
                                <SelectItem value="100">≤ 100</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-[#4E5969]">排序方式</label>
                            <Select 
                              value={supplierFilters.sortBy} 
                              onValueChange={(v) => setSupplierFilters({ ...supplierFilters, sortBy: v })}
                            >
                              <SelectTrigger className="w-40 input-minimal h-9">
                                <SelectValue placeholder="按评分" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rating">按评分</SelectItem>
                                <SelectItem value="price">按价格</SelectItem>
                                <SelectItem value="moq">按MOQ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* 供应商列表 */}
                    <div className="space-y-4">
                      {mockSuppliers
                        .filter(s => !currentProductForSupplier || s.productId === currentProductForSupplier)
                        .filter(s => !supplierFilters.onePieceDelivery || s.isOnePieceDelivery)
                        .filter(s => supplierFilters.maxMoq === 'all' || s.moq <= parseInt(supplierFilters.maxMoq, 10))
                        .sort((a, b) => {
                          if (supplierFilters.sortBy === 'rating') return b.rating - a.rating;
                          if (supplierFilters.sortBy === 'price') return getMinPrice(a.priceRange) - getMinPrice(b.priceRange);
                          if (supplierFilters.sortBy === 'moq') return a.moq - b.moq;
                          return 0;
                        })
                        .map((supplier) => (
                          <Card key={supplier.id} className="card-minimal">
                            <div className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-lg font-semibold text-[#1D2129]">{supplier.name}</h3>
                                    {supplier.tradeAssurance && (
                                      <Badge className="bg-[#E8F3FF] text-[#165DFF]">
                                        <Shield className="w-3 h-3 mr-1" />
                                        诚信通
                                      </Badge>
                                    )}
                                    {supplier.isOnePieceDelivery && (
                                      <Badge className="bg-[#E8FFEA] text-[#00B42A]">
                                        <Truck className="w-3 h-3 mr-1" />
                                        一件代发
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                    <div>
                                      <p className="text-sm text-[#86909C]">店铺评分</p>
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-[#FF7D00] fill-[#FF7D00]" />
                                        <span className="text-[#1D2129] font-medium">{supplier.rating}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#86909C]">响应速度</p>
                                      <p className="text-[#1D2129] font-medium">{supplier.responseTime}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#86909C]">MOQ</p>
                                      <p className="text-[#1D2129] font-medium">{supplier.moq} 件</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#86909C]">价格区间</p>
                                      <p className="text-[#1D2129] font-medium">{supplier.priceRange}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#86909C]">发货时间</p>
                                      <p className="text-[#1D2129] font-medium">{supplier.deliveryTime}</p>
                                    </div>
                                  </div>

                                  {supplier.certifications.length > 0 && (
                                    <div className="mb-4">
                                      <p className="text-sm text-[#86909C] mb-2">资质认证</p>
                                      <div className="flex flex-wrap gap-2">
                                        {supplier.certifications.map((cert, idx) => (
                                          <Badge key={idx} className="bg-[#F2F3F5] text-[#4E5969]">
                                            {cert}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 text-sm text-[#86909C]">
                                    <Store className="w-4 h-4" />
                                    <span>经营 {supplier.years} 年</span>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-6">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-[#165DFF] border border-[#E5E6EB]"
                                    onClick={() => copySupplierLink(supplier.link)}
                                  >
                                    <Copy className="w-4 h-4 mr-1" />
                                    复制链接
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="btn-primary"
                                    onClick={() => openSupplierLink(supplier.link)}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    打开1688
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                      <Button variant="ghost" className="btn-secondary" onClick={() => setActiveTab('report')}>
                        返回报告
                      </Button>
                      <Button className="btn-primary" onClick={addToDraft}>
                        <Package className="w-4 h-4 mr-2" />
                        加入草稿箱
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
