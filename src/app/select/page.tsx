'use client';

import { useState } from 'react';
import { Search, Sparkles, TrendingUp, Filter, Plus, CheckCircle, AlertTriangle, Target, Zap, DollarSign, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

export default function SelectPage() {
  const [activeTab, setActiveTab] = useState('demand');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demandForm, setDemandForm] = useState({
    category: '',
    budget: '',
    market: '',
    requirement: '',
  });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    setActiveTab('products');
    toast.success('选品分析完成！');
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
              <TabsList className="w-full grid grid-cols-4 mb-8 bg-[#F2F3F5]">
                <TabsTrigger value="demand" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
                  1. 需求分析
                </TabsTrigger>
                <TabsTrigger value="mining" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]" disabled={!isAnalyzing && activeTab !== 'mining' && activeTab !== 'products' && activeTab !== 'report'}>
                  2. 爆款挖掘
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]" disabled={!isAnalyzing && activeTab !== 'products' && activeTab !== 'report'}>
                  3. 可行性分析
                </TabsTrigger>
                <TabsTrigger value="report" className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF]" disabled={!isAnalyzing && activeTab !== 'report'}>
                  4. 生成报告
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

              {/* 爆款挖掘 */}
              <TabsContent value="mining" className="mt-0">
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#E8F3FF] flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-[#165DFF]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1D2129] mb-2">选品方向推荐</h3>
                  <p className="text-[#86909C] mb-6">基于您的需求，AI推荐以下选品方向</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <Card className="card-minimal p-5 cursor-pointer hover:border-[#165DFF]">
                      <Badge className="bg-[#E8FFEA] text-[#00B42A] mb-3">推荐指数 ★★★★★</Badge>
                      <h4 className="font-semibold text-[#1D2129] mb-2">智能宠物用品</h4>
                      <p className="text-sm text-[#86909C]">持续增长类目，智能化趋势明显，利润空间大</p>
                    </Card>
                    <Card className="card-minimal p-5 cursor-pointer hover:border-[#165DFF]">
                      <Badge className="bg-[#FFF7E8] text-[#FF7D00] mb-3">推荐指数 ★★★★</Badge>
                      <h4 className="font-semibold text-[#1D2129] mb-2">节日装饰用品</h4>
                      <p className="text-sm text-[#86909C]">节日季临近，需求激增，轻量化易运输</p>
                    </Card>
                    <Card className="card-minimal p-5 cursor-pointer hover:border-[#165DFF]">
                      <Badge className="bg-[#E8F3FF] text-[#165DFF] mb-3">推荐指数 ★★★★</Badge>
                      <h4 className="font-semibold text-[#1D2129] mb-2">智能家居配件</h4>
                      <p className="text-sm text-[#86909C]">智能家居赛道火热，配件类需求稳定增长</p>
                    </Card>
                  </div>
                  <div className="mt-8">
                    <Button className="btn-primary" onClick={() => setActiveTab('products')}>
                      查看候选商品
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
                      <Button className="btn-primary" onClick={addToDraft}>
                        加入草稿箱
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
