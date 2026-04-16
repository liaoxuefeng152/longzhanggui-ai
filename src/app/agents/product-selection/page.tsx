'use client';

import { useState, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Brain, Target, TrendingUp, DollarSign, FileText, Package,
  Check, Sparkles, BarChart3, AlertTriangle, Shield, Search,
  ShoppingCart, Star, TrendArrow, Filter, Download, ArrowRight,
  Zap, PackageSearch, Calculator, ClipboardCheck, Users, Truck
} from 'lucide-react';

// ==================== 类型定义 ====================
type Competition = '蓝海' | '红海' | '中等';
type ComplianceStatus = '合规' | '需认证' | '禁售';
type RiskLevel = '低' | '中' | '高';

// 市场配置
interface MarketConfig {
  name: string;
  code: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  maxPrice: number;
  commission: number;
  vat: number;
  certifications: string[];
  language: string;
}

// 选品方向
interface Direction {
  id: string;
  name: string;
  category: string;
  marketPotential: number;
  profitMargin: number;
  competition: string;
  reason: string;
}

// 爆款商品
interface HotProduct {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  monthlySales: number;
  competition: Competition;
  priceRange: { min: number; max: number };
  growthTrend: number;
  differentiation: string;
}

// 利润测算
interface ProfitCalculation {
  cost: number;
  logistics: number;
  commission: number;
  vat: number;
  other: number;
  sellingPrice: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
}

// 合规结果
interface ComplianceResult {
  status: ComplianceStatus;
  requiredCerts: string[];
  isRestricted: boolean;
  suggestions: string[];
  warnings?: string[];
  issues?: string[];
}

// 风险评估
interface RiskAssessment {
  type: string;
  level: RiskLevel;
  score: number;
  suggestion: string;
  note?: string;
  competitionRisk?: RiskLevel;
  returnRisk?: RiskLevel;
  complianceRisk?: RiskLevel;
  competitionNote?: string;
  returnNote?: string;
  complianceNote?: string;
}

// 供应商
interface Supplier {
  id: string;
  name: string;
  moq: number;
  price: number;
  maxPrice: number;
  rating: number;
  responseSpeed: string;
  shippingTime: string;
  certifications: string[];
  url: string;
  isDropshipping: boolean;
}

// ==================== 常量配置 ====================
const marketConfigs: Record<string, MarketConfig> = {
  id: {
    name: '印度尼西亚',
    code: 'ID',
    flag: '🇮🇩',
    currency: 'IDR',
    currencySymbol: 'Rp',
    maxPrice: 500000,
    commission: 10,
    vat: 11,
    certifications: ['BPOM注册', 'HALAL认证'],
    language: 'id'
  },
  th: {
    name: '泰国',
    code: 'TH',
    flag: '🇹🇭',
    currency: 'THB',
    currencySymbol: '฿',
    maxPrice: 5000,
    commission: 8,
    vat: 7,
    certifications: ['Thai FDA注册', 'TIS标准'],
    language: 'th'
  },
  vn: {
    name: '越南',
    code: 'VN',
    flag: '🇻🇳',
    currency: 'VND',
    currencySymbol: '₫',
    maxPrice: 500000,
    commission: 8,
    vat: 8,
    certifications: ['越南FDA注册', 'COA认证'],
    language: 'vi'
  },
  my: {
    name: '马来西亚',
    code: 'MY',
    flag: '🇲🇾',
    currency: 'MYR',
    currencySymbol: 'RM',
    maxPrice: 200,
    commission: 8,
    vat: 0,
    certifications: ['MAL注册', 'HALAL认证'],
    language: 'ms'
  }
};

const categoryConfigs = [
  { name: '家居用品', icon: '🏠' },
  { name: '3C数码', icon: '📱' },
  { name: '服装配饰', icon: '👗' },
  { name: '美妆护肤', icon: '💄' },
  { name: '母婴用品', icon: '👶' },
  { name: '宠物用品', icon: '🐱' },
  { name: '户外运动', icon: '⛺' },
  { name: '汽摩配', icon: '🚗' }
];

const requirementsList = [
  '追求高利润',
  '快速出单',
  '低竞争蓝海',
  '复购率高',
  '体积小易发货',
  '避免敏感品'
];

const steps = [
  { id: 'requirement', label: '需求分析', icon: Target },
  { id: 'directions', label: '选品方向', icon: Search },
  { id: 'hotproducts', label: '爆款挖掘', icon: TrendingUp },
  { id: 'feasibility', label: '可行性', icon: Calculator },
  { id: 'suppliers', label: '供应商', icon: Truck },
  { id: 'report', label: '选品报告', icon: FileText }
];

// ==================== 主组件 ====================
export default function ProductSelectionPage() {
  // 状态定义
  const [activeTab, setActiveTab] = useState('requirement');
  const [isLoading, setIsLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState('');

  // 需求分析状态
  const [requirement, setRequirement] = useState({
    market: 'id',
    category: '家居用品',
    budgetMin: 5,
    budgetMax: 50,
    requirements: ['追求高利润', '低竞争蓝海'] as string[]
  });

  // 数据状态
  const [directions, setDirections] = useState<Direction[]>([]);
  const [hotProducts, setHotProducts] = useState<HotProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [feasibilityResults, setFeasibilityResults] = useState<{
    productId: string;
    profitCalculation?: ProfitCalculation;
    compliance?: ComplianceResult;
    risks?: RiskAssessment[];
    overallScore?: number;
    conclusion?: string;
  }[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reportContent, setReportContent] = useState('');

  // 供应商筛选
  const [supplierFilter, setSupplierFilter] = useState({
    minMoq: 0,
    maxMoq: 500,
    dropshippingOnly: false,
    sortBy: 'rating' as 'rating' | 'price' | 'moq'
  });

  // 辅助函数
  const getCurrentMarket = () => marketConfigs[requirement.market];

  const currentStepIndex = steps.findIndex(s => s.id === activeTab);

  const filteredSuppliers = suppliers
    .filter(s => s.moq >= supplierFilter.minMoq && s.moq <= supplierFilter.maxMoq)
    .filter(s => !supplierFilter.dropshippingOnly || s.isDropshipping)
    .sort((a, b) => {
      if (supplierFilter.sortBy === 'rating') return b.rating - a.rating;
      if (supplierFilter.sortBy === 'price') return a.price - b.price;
      return a.moq - b.moq;
    });

  // AI选品分析
  const analyzeSelection = async (action: string, data?: any) => {
    setIsLoading(true);
    setAiThinking('');

    try {
      const response = await fetch('/api/ai/product-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          market: requirement.market,
          category: requirement.category,
          budgetMin: requirement.budgetMin,
          budgetMax: requirement.budgetMax,
          requirements: requirement.requirements,
          ...data
        })
      });

      if (!response.ok) throw new Error('API调用失败');

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI选品分析失败:', error);
      toast.error('AI分析失败，请重试');
      return null;
    } finally {
      setIsLoading(false);
      setAiThinking('');
    }
  };

  // 步骤1: 分析需求
  const handleAnalyzeRequirement = async () => {
    setAiThinking('正在分析您的选品需求...');
    await new Promise(r => setTimeout(r, 500));
    setActiveTab('directions');
  };

  // 步骤2: 获取选品方向
  const handleGetDirections = async () => {
    setAiThinking('AI正在为您挖掘选品方向...');
    const result = await analyzeSelection('directions');
    if (result?.success) {
      setDirections(result.data.directions || []);
      setAiThinking('选品方向分析完成，正在为您挖掘爆款...');
      await new Promise(r => setTimeout(r, 300));
      setActiveTab('hotproducts');
    }
  };

  // 步骤3: 获取爆款商品
  const handleGetHotProducts = async () => {
    setAiThinking('AI正在分析市场爆款商品...');
    const result = await analyzeSelection('products');
    if (result?.success) {
      setHotProducts(result.data.products || []);
      setAiThinking('爆款分析完成，正在进行可行性评估...');
      await new Promise(r => setTimeout(r, 300));
      setActiveTab('feasibility');
    }
  };

  // 步骤4: 获取可行性分析
  const handleGetFeasibility = async () => {
    setAiThinking('AI正在分析商品可行性（利润/合规/风险）...');
    const result = await analyzeSelection('feasibility', {
      products: hotProducts.slice(0, 5)
    });
    if (result?.success) {
      setFeasibilityResults(result.data.results || []);
      if (hotProducts.length > 0) {
        setSelectedProductId(hotProducts[0].id);
      }
      setAiThinking('可行性分析完成，正在为您匹配供应商...');
      await new Promise(r => setTimeout(r, 300));
      setActiveTab('suppliers');
    }
  };

  // 步骤5: 获取供应商
  const handleGetSuppliers = async () => {
    setAiThinking('AI正在为您匹配优质供应商...');
    const result = await analyzeSelection('suppliers', {
      productId: selectedProductId,
      category: requirement.category
    });
    if (result?.success) {
      setSuppliers(result.data.suppliers || []);
      setAiThinking('供应商匹配完成，正在生成选品报告...');
      await new Promise(r => setTimeout(r, 300));
      setActiveTab('report');
    }
  };

  // 步骤6: 生成报告
  const handleGenerateReport = async () => {
    setAiThinking('AI正在生成智能选品报告...');
    const result = await analyzeSelection('report', {
      directions,
      products: hotProducts,
      feasibility: feasibilityResults,
      suppliers: filteredSuppliers.slice(0, 5)
    });
    if (result?.success) {
      setReportContent(result.data.report || '');
      toast.success('选品报告已生成');
    }
  };

  // 导出报告
  const handleExport = () => {
    const market = getCurrentMarket();
    if (!reportContent) {
      toast.error('请先生成选品报告');
      return;
    }

    const content = reportContent;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AI-Selection-Report-' + market.name + '-' + new Date().toISOString().split('T')[0] + '.md';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('报告已导出');
  };

  // 获取当前选中的可行性结果
  const getCurrentFeasibility = () => {
    return feasibilityResults.find(f => f.productId === selectedProductId);
  };

  const selectedProduct = hotProducts.find(p => p.id === selectedProductId);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">AI智能选品</h1>
            <p className="text-[#86909C] mt-1">基于AI大模型的智能选品分析，发现爆款商品</p>
          </div>
          <Badge className="bg-[#E8F3FF] text-[#165DFF] gap-1">
            <Brain className="w-3 h-3" />
            AI驱动
          </Badge>
        </div>

        {/* AI思考状态 */}
        {isLoading && aiThinking && (
          <Card className="card-minimal border-[#165DFF] bg-gradient-to-r from-[#F4F7FF] to-white">
            <div className="p-4 flex items-center gap-4">
              <div className="relative">
                <Brain className="w-8 h-8 text-[#165DFF] animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-[#165DFF] font-medium">{aiThinking}</p>
                <div className="mt-2 h-1 bg-[#E5E6EB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#165DFF] rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 进度步骤 */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-[#E5E6EB]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === activeTab;
            const isCompleted = currentStepIndex > index;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className="flex items-center gap-2 cursor-pointer transition-colors"
                  style={{
                    color: isActive ? '#165DFF' : isCompleted ? '#00B42A' : '#86909C'
                  }}
                  onClick={() => {
                    if (isCompleted || step.id === 'requirement') {
                      setActiveTab(step.id);
                    }
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: isActive ? '#165DFF' : isCompleted ? '#00B42A' : '#F2F3F5',
                      color: isActive || isCompleted ? 'white' : '#86909C'
                    }}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="w-8 md:w-16 h-0.5 mx-2"
                    style={{ backgroundColor: isCompleted ? '#00B42A' : '#E5E6EB' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 步骤1: 需求分析 */}
        {activeTab === 'requirement' && (
          <Card className="card-minimal">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#165DFF]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1D2129]">选品需求分析</h2>
                  <p className="text-sm text-[#86909C]">告诉AI您的选品偏好，AI将为您智能推荐最佳商品</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 目标市场 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1D2129]">目标市场 *</label>
                  <Select value={requirement.market} onValueChange={(v) => setRequirement({ ...requirement, market: v })}>
                    <SelectTrigger className="input-minimal h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(marketConfigs).map(([code, config]) => (
                        <SelectItem key={code} value={code}>
                          {config.flag} {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 类目偏好 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1D2129]">类目偏好</label>
                  <Select value={requirement.category} onValueChange={(v) => setRequirement({ ...requirement, category: v })}>
                    <SelectTrigger className="input-minimal h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryConfigs.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 预算范围 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1D2129]">预算范围 (USD)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="input-minimal h-12"
                      value={requirement.budgetMin}
                      onChange={(e) => setRequirement({ ...requirement, budgetMin: Number(e.target.value) })}
                    />
                    <span className="text-[#86909C]">-</span>
                    <Input
                      type="number"
                      className="input-minimal h-12"
                      value={requirement.budgetMax}
                      onChange={(e) => setRequirement({ ...requirement, budgetMax: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* 核心诉求 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1D2129]">核心诉求 (可多选)</label>
                  <div className="flex flex-wrap gap-2">
                    {requirementsList.map((req) => (
                      <Badge
                        key={req}
                        variant={requirement.requirements.includes(req) ? 'default' : 'outline'}
                        className={`cursor-pointer ${
                          requirement.requirements.includes(req)
                            ? 'bg-[#165DFF] text-white'
                            : 'text-[#86909C]'
                        }`}
                        onClick={() => {
                          if (requirement.requirements.includes(req)) {
                            setRequirement({
                              ...requirement,
                              requirements: requirement.requirements.filter((r) => r !== req)
                            });
                          } else {
                            setRequirement({
                              ...requirement,
                              requirements: [...requirement.requirements, req]
                            });
                          }
                        }}
                      >
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 市场信息 */}
              <div className="mt-6 p-4 bg-[#F7F8FA] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF7D00]" />
                  <span className="text-sm font-medium text-[#1D2129]">目标市场信息</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#86909C]">平台佣金: </span>
                    <span className="text-[#1D2129]">{getCurrentMarket().commission}%</span>
                  </div>
                  <div>
                    <span className="text-[#86909C]">VAT税率: </span>
                    <span className="text-[#1D2129]">{getCurrentMarket().vat}%</span>
                  </div>
                  <div>
                    <span className="text-[#86909C]">单品限额: </span>
                    <span className="text-[#1D2129]">${getCurrentMarket().maxPrice}</span>
                  </div>
                  <div>
                    <span className="text-[#86909C]">认证要求: </span>
                    <span className="text-[#1D2129]">{getCurrentMarket().certifications.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  className="btn-primary"
                  onClick={handleAnalyzeRequirement}
                  disabled={!requirement.market || requirement.requirements.length === 0}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始AI选品分析
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 步骤2: 选品方向 */}
        {activeTab === 'directions' && (
          <Card className="card-minimal">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                    <Search className="w-6 h-6 text-[#165DFF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D2129]">选品方向推荐</h2>
                    <p className="text-sm text-[#86909C]">基于AI分析，为您推荐最优选品方向</p>
                  </div>
                </div>
                <Button className="btn-primary" onClick={handleGetDirections} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      AI推荐方向
                    </>
                  )}
                </Button>
              </div>

              {directions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {directions.map((direction, index) => (
                    <div
                      key={direction.id}
                      className="p-4 border border-[#E5E6EB] rounded-lg hover:border-[#165DFF] transition-colors cursor-pointer"
                      style={{ borderColor: index === 0 ? '#165DFF' : undefined }}
                      onClick={() => {
                        setActiveTab('hotproducts');
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: index === 0 ? '#165DFF' : '#E5E6EB' }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#1D2129]">{direction.name}</h3>
                          <p className="text-xs text-[#86909C]">{direction.category}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#86909C]">市场潜力</span>
                          <span className="font-medium text-[#00B42A]">{direction.marketPotential}%</span>
                        </div>
                        <Progress value={direction.marketPotential} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-[#86909C]">利润率</span>
                          <span className="font-medium text-[#165DFF]">{direction.profitMargin}%</span>
                        </div>
                        <Progress value={direction.profitMargin} className="h-2" />
                        <div className="flex justify-between text-sm mt-2">
                          <Badge variant="outline" className="text-xs">{direction.competition}</Badge>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-[#86909C]">{direction.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#86909C]">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>点击上方按钮获取AI选品方向推荐</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 步骤3: 爆款挖掘 */}
        {activeTab === 'hotproducts' && (
          <Card className="card-minimal">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#165DFF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D2129]">爆款商品挖掘</h2>
                    <p className="text-sm text-[#86909C]">AI分析市场数据，挖掘高潜力爆款商品</p>
                  </div>
                </div>
                <Button className="btn-primary" onClick={handleGetHotProducts} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      AI挖掘爆款
                    </>
                  )}
                </Button>
              </div>

              {hotProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border border-[#E5E6EB] rounded-lg hover:border-[#165DFF] transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setActiveTab('feasibility');
                      }}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-[#F7F8FA] rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-[#86909C]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#1D2129] mb-1">{product.name}</h3>
                          <p className="text-xs text-[#86909C] mb-2">{product.category}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#00B42A]">月销 {product.monthlySales.toLocaleString()}+</span>
                            <Badge
                              className={
                                product.competition === '蓝海'
                                  ? 'bg-[#E8FFF3] text-[#00B42A]'
                                  : product.competition === '红海'
                                  ? 'bg-[#FFF1F0] text-[#F53F3F]'
                                  : 'bg-[#FFF7E6] text-[#FF7D00]'
                              }
                            >
                              {product.competition}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <span className="text-[#86909C]">价格区间:</span>
                            <span className="font-medium text-[#165DFF]">
                              ${product.priceRange.min} - ${product.priceRange.max}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div
                            className="px-2 py-1 rounded text-white text-xs font-medium"
                            style={{
                              backgroundColor:
                                product.growthTrend > 20
                                  ? '#00B42A'
                                  : product.growthTrend > 0
                                  ? '#165DFF'
                                  : '#F53F3F'
                            }}
                          >
                            +{product.growthTrend}%
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-[#86909C]">{product.differentiation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#86909C]">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>点击上方按钮获取AI爆款推荐</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 步骤4: 可行性分析 */}
        {activeTab === 'feasibility' && (
          <Card className="card-minimal">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-[#165DFF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D2129]">可行性分析</h2>
                    <p className="text-sm text-[#86909C]">AI智能分析利润、合规和风险</p>
                  </div>
                </div>
                <Button className="btn-primary" onClick={handleGetFeasibility} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 商品选择 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-[#1D2129]">选择商品</h3>
                  <div className="space-y-2">
                    {hotProducts.slice(0, 5).map((product) => {
                      const feasibility = feasibilityResults.find((f) => f.productId === product.id);
                      return (
                        <div
                          key={product.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedProductId === product.id
                              ? 'border-[#165DFF] bg-[#F4F7FF]'
                              : 'border-[#E5E6EB] hover:border-[#165DFF]'
                          }`}
                          onClick={() => setSelectedProductId(product.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#1D2129]">{product.name}</span>
                            {feasibility && (
                              <Badge
                                className={
                                  (feasibility.overallScore || 70) >= 80
                                    ? 'bg-[#E8FFF3] text-[#00B42A]'
                                    : (feasibility.overallScore || 70) >= 60
                                    ? 'bg-[#FFF7E6] text-[#FF7D00]'
                                    : 'bg-[#FFF1F0] text-[#F53F3F]'
                                }
                              >
                                {(feasibility.overallScore || 70)}分
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#86909C] mt-1">
                            月销 {product.monthlySales.toLocaleString()}+ | {product.competition}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 分析结果 */}
                <div className="space-y-4">
                  {selectedProduct && getCurrentFeasibility() ? (
                    <>
                      <div className="p-4 bg-[#F4F7FF] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-[#1D2129]">{selectedProduct.name}</h3>
                          <span className="text-2xl font-bold text-[#165DFF]">
                            {getCurrentFeasibility()?.overallScore || 70}
                          </span>
                        </div>
                        <p className="text-sm text-[#86909C]">
                          结论: {getCurrentFeasibility()?.conclusion || '分析中'}
                        </p>
                      </div>

                      {/* 利润测算 */}
                      {getCurrentFeasibility()?.profitCalculation && (
                        <div className="border border-[#E5E6EB] rounded-lg p-4">
                          <h4 className="font-medium text-[#1D2129] mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#00B42A]" />
                            利润测算
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#86909C]">售价</span>
                              <span className="text-[#1D2129]">
                                ${getCurrentFeasibility()?.profitCalculation?.sellingPrice?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#86909C]">商品成本</span>
                              <span className="text-[#F53F3F]">
                                -${getCurrentFeasibility()?.profitCalculation?.cost?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#86909C]">物流费用</span>
                              <span className="text-[#F53F3F]">
                                -${getCurrentFeasibility()?.profitCalculation?.logistics?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#86909C]">平台佣金 ({getCurrentMarket().commission}%)</span>
                              <span className="text-[#F53F3F]">
                                -${getCurrentFeasibility()?.profitCalculation?.commission?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#86909C]">VAT ({getCurrentMarket().vat}%)</span>
                              <span className="text-[#F53F3F]">
                                -${getCurrentFeasibility()?.profitCalculation?.vat?.toFixed(2)}
                              </span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-[#1D2129]">净利润</span>
                                <span className="text-[#00B42A]">
                                  ${getCurrentFeasibility()?.profitCalculation?.netProfit?.toFixed(2)} (
                                  {getCurrentFeasibility()?.profitCalculation?.netMargin?.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 合规检查 */}
                      {getCurrentFeasibility()?.compliance && (
                        <div className="border border-[#E5E6EB] rounded-lg p-4">
                          <h4 className="font-medium text-[#1D2129] mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#165DFF]" />
                            合规检查
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  getCurrentFeasibility()?.compliance?.status === '合规'
                                    ? 'bg-[#E8FFF3] text-[#00B42A]'
                                    : getCurrentFeasibility()?.compliance?.status === '需认证'
                                    ? 'bg-[#FFF7E6] text-[#FF7D00]'
                                    : 'bg-[#FFF1F0] text-[#F53F3F]'
                                }
                              >
                                {getCurrentFeasibility()?.compliance?.status}
                              </Badge>
                            </div>
                            {getCurrentFeasibility()?.compliance?.requiredCerts && (
                              <div className="text-[#86909C]">
                                认证要求: {getCurrentFeasibility()?.compliance?.requiredCerts.join(', ')}
                              </div>
                            )}
                            {getCurrentFeasibility()?.compliance?.suggestions && (
                              <div className="text-[#86909C]">
                                建议: {getCurrentFeasibility()?.compliance?.suggestions.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 风险评估 */}
                      {getCurrentFeasibility()?.risks && getCurrentFeasibility()?.risks!.length > 0 && (
                        <div className="border border-[#E5E6EB] rounded-lg p-4">
                          <h4 className="font-medium text-[#1D2129] mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#FF7D00]" />
                            风险评估
                          </h4>
                          <div className="space-y-2">
                            {getCurrentFeasibility()?.risks?.map((risk, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Badge
                                  className={
                                    risk.level === '低'
                                      ? 'bg-[#E8FFF3] text-[#00B42A]'
                                      : risk.level === '中'
                                      ? 'bg-[#FFF7E6] text-[#FF7D00]'
                                      : 'bg-[#FFF1F0] text-[#F53F3F]'
                                  }
                                >
                                  {risk.level}
                                </Badge>
                                <span className="text-[#1D2129]">{risk.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-[#86909C]">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>选择商品查看可行性分析结果</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 步骤5: 供应商 */}
        {activeTab === 'suppliers' && (
          <Card className="card-minimal">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                    <Truck className="w-6 h-6 text-[#165DFF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D2129]">优质供应商推荐</h2>
                    <p className="text-sm text-[#86909C]">AI智能匹配1688优质供应商</p>
                  </div>
                </div>
                <Button className="btn-primary" onClick={handleGetSuppliers} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      AI匹配中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      AI匹配供应商
                    </>
                  )}
                </Button>
              </div>

              {/* 筛选器 */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[#F7F8FA] rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#86909C]" />
                  <span className="text-sm text-[#86909C]">筛选:</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[#1D2129]">MOQ:</label>
                  <Input
                    type="number"
                    className="input-minimal w-20 h-8"
                    value={supplierFilter.minMoq}
                    onChange={(e) => setSupplierFilter({ ...supplierFilter, minMoq: Number(e.target.value) })}
                  />
                  <span className="text-[#86909C]">-</span>
                  <Input
                    type="number"
                    className="input-minimal w-20 h-8"
                    value={supplierFilter.maxMoq}
                    onChange={(e) => setSupplierFilter({ ...supplierFilter, maxMoq: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[#1D2129]">排序:</label>
                  <Select
                    value={supplierFilter.sortBy}
                    onValueChange={(v) => setSupplierFilter({ ...supplierFilter, sortBy: v as any })}
                  >
                    <SelectTrigger className="input-minimal w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">评分最高</SelectItem>
                      <SelectItem value="price">价格最低</SelectItem>
                      <SelectItem value="moq">MOQ最少</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[#1D2129]">仅一件代发</label>
                  <input
                    type="checkbox"
                    checked={supplierFilter.dropshippingOnly}
                    onChange={(e) => setSupplierFilter({ ...supplierFilter, dropshippingOnly: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              {/* 供应商列表 */}
              {filteredSuppliers.length > 0 ? (
                <div className="space-y-4">
                  {filteredSuppliers.map((supplier) => (
                    <div key={supplier.id} className="p-4 border border-[#E5E6EB] rounded-lg hover:border-[#165DFF] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-[#1D2129]">{supplier.name}</h3>
                            {supplier.isDropshipping && (
                              <Badge className="bg-[#E8F3FF] text-[#165DFF]">一件代发</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#86909C]">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-[#FF7D00] fill-[#FF7D00]" />
                              {supplier.rating}
                            </span>
                            <span>{supplier.responseSpeed}</span>
                            <span>MOQ: {supplier.moq}件</span>
                            <span>发货: {supplier.shippingTime}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {supplier.certifications.map((cert) => (
                              <Badge key={cert} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#165DFF]">${supplier.price}</p>
                          <p className="text-xs text-[#86909C]">起</p>
                          <p className="text-sm text-[#86909C]">${supplier.price} - ${supplier.maxPrice}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={supplier.url} target="_blank" rel="noopener noreferrer">
                            查看商品
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          加入采购清单
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#86909C]">
                  <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>点击上方按钮获取AI供应商推荐</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 步骤6: 选品报告 */}
        {activeTab === 'report' && (
          <Card className="card-minimal">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#165DFF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D2129]">AI智能选品报告</h2>
                    <p className="text-sm text-[#86909C]">一键生成完整的选品分析报告</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={!reportContent}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出报告
                  </Button>
                  <Button className="btn-primary" onClick={handleGenerateReport} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-pulse" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        生成报告
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {reportContent ? (
                <div className="p-6 bg-[#F7F8FA] rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-[#1D2129] font-mono max-h-96 overflow-y-auto">
                    {reportContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-[#86909C]">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>点击上方按钮生成AI选品报告</p>
                  <p className="text-xs mt-2">报告将包含选品方向、爆款分析、可行性评估、供应商推荐等内容</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
