'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShoppingCart,
  TrendingUp,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Play,
  Loader2,
  Settings,
  Package,
  DollarSign,
  Clock,
  Filter,
  Download,
  Eye,
  Zap,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  FileText,
  Users,
  Lightbulb,
  Check,
  ArrowRight,
  ArrowLeft,
  Send,
  Plus,
  Star,
  Truck,
  Copy,
  ExternalLink,
  CheckCircle2,
  Building,
  TrendingDown,
  Percent,
  Calculator,
  Search,
  RefreshCcw,
  PieChart,
  Award,
  ZapOff,
  Brain,
} from 'lucide-react';
import { toast } from 'sonner';

// ==================== 类型定义 ====================

// 市场配置
interface MarketConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  avgPrice: number;
  maxPrice: number;
  commission: number;
  vat: number;
  language: string;
}

// 选品需求
interface SelectionRequirement {
  market: string;
  category: string;
  budget: string;
  coreAppeal: string;
  avoidCategories: string;
}

// 选品方向
interface Direction {
  id: string;
  name: string;
  reason: string;
  marketPotential: number;
  competition: string;
  avgProfitRate: number;
  trending: boolean;
  icon: string;
}

// 爆款商品
interface HotProduct {
  id: string;
  name: string;
  coreSellingPoint: string;
  price: number;
  costPrice: number;
  monthlySales: number;
  competition: '蓝海' | '红海' | '中等';
  recommendIndex: number;
  trend: number;
  rating: number;
  fulfillmentRate: number;
  returnRate: number;
}

// 利润测算
interface ProfitCalc {
  cost: number;
  logistics: number;
  commission: number;
  vat: number;
  adFee: number;
  platformFee: number;
  sellingPrice: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
}

// 合规结果
interface ComplianceResult {
  status: '合规' | '需认证' | '禁售';
  issues: string[];
  warnings: string[];
  requiredCerts: string[];
  riskLevel: '低' | '中' | '高';
}

// 风险评估
interface RiskAssessment {
  type: string;
  level: '低' | '中' | '高';
  suggestion: string;
}

// 可行性结果
interface FeasibilityResult {
  productId: string;
  productName: string;
  profitCalc: ProfitCalc;
  compliance: ComplianceResult;
  risks: RiskAssessment[];
  supplyMatch: number;
  overallScore: number;
  conclusion: '强烈推荐' | '谨慎推荐' | '不推荐';
}

// 供应商
interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number;
  responseTime: string;
  moq: number;
  price: number;
  priceRange: string;
  deliveryDays: number;
  isDropshipping: boolean;
  certifications: string[];
  productUrl: string;
  monthlyOrders: number;
  startYear: number;
}

// 选品报告
interface SelectionReport {
  id: string;
  createdAt: string;
  requirements: SelectionRequirement;
  directions: Direction[];
  products: HotProduct[];
  feasibility: FeasibilityResult[];
  suppliers: Supplier[];
  summary: {
    totalProducts: number;
    recommendedProducts: number;
    avgProfitRate: number;
    topCategory: string;
    riskLevel: string;
  };
  recommendations: string[];
  fullAnalysis?: string;
}

// ==================== 配置数据 ====================

const marketConfigs: Record<string, MarketConfig> = {
  us: { code: 'us', name: '美国', flag: '🇺🇸', currency: 'USD', avgPrice: 15, maxPrice: 800, commission: 12, vat: 0, language: 'en' },
  uk: { code: 'uk', name: '英国', flag: '🇬🇧', currency: 'GBP', avgPrice: 12, maxPrice: 135, commission: 12, vat: 20, language: 'en' },
  id: { code: 'id', name: '印尼', flag: '🇮🇩', currency: 'IDR', avgPrice: 45000, maxPrice: 5000000, commission: 10, vat: 11, language: 'id' },
  th: { code: 'th', name: '泰国', flag: '🇹🇭', currency: 'THB', avgPrice: 350, maxPrice: 1000000, commission: 10, vat: 7, language: 'th' },
  vn: { code: 'vn', name: '越南', flag: '🇻🇳', currency: 'VND', avgPrice: 250000, maxPrice: 10000000, commission: 10, vat: 10, language: 'vi' },
  my: { code: 'my', name: '马来西亚', flag: '🇲🇾', currency: 'MYR', avgPrice: 35, maxPrice: 500, commission: 10, vat: 6, language: 'ms' },
};

const categoryConfigs = [
  { name: '家居用品', icon: '🏠' },
  { name: '厨房用品', icon: '🍳' },
  { name: '美妆工具', icon: '💄' },
  { name: '宠物用品', icon: '🐾' },
  { name: '母婴用品', icon: '👶' },
  { name: '运动户外', icon: '🏃' },
  { name: '3C数码', icon: '📱' },
  { name: '服装配饰', icon: '👗' },
];

const budgetRanges: Record<string, { min: number; max: number; label: string }> = {
  low: { min: 1, max: 5, label: '低预算 (1-5美元)' },
  medium: { min: 5, max: 15, label: '中预算 (5-15美元)' },
  high: { min: 15, max: 30, label: '高预算 (15-30美元)' },
};

const coreAppeals = [
  { value: 'high_profit', label: '高利润', desc: '追求利润最大化' },
  { value: 'low_competition', label: '低竞争', desc: '蓝海市场，竞争小' },
  { value: 'fast_turnover', label: '快周转', desc: '快速出单，资金周转快' },
  { value: 'easy_operation', label: '易操作', desc: '运营简单，门槛低' },
];

// ==================== API调用函数 ====================

async function callAISelection(action: string, params: any): Promise<any> {
  const response = await fetch('/api/ai/product-selection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  
  if (!response.ok) {
    throw new Error(`API调用失败: ${response.status}`);
  }
  
  return response.json();
}

// ==================== 组件 ====================

export default function ProductSelectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('requirement');
  const [isLoading, setIsLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState('');
  
  // 选品需求
  const [requirement, setRequirement] = useState<SelectionRequirement>({
    market: 'id',
    category: '家居用品',
    budget: 'medium',
    coreAppeal: 'high_profit',
    avoidCategories: '',
  });

  // 数据状态
  const [directions, setDirections] = useState<Direction[]>([]);
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [hotProducts, setHotProducts] = useState<HotProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [feasibilityResults, setFeasibilityResults] = useState<FeasibilityResult[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [report, setReport] = useState<SelectionReport | null>(null);

  // 供应商筛选
  const [supplierFilter, setSupplierFilter] = useState({
    minMoq: 0,
    maxMoq: 500,
    dropshippingOnly: false,
    sortBy: 'rating' as 'rating' | 'price' | 'moq',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 步骤进度
  const steps = [
    { id: 'requirement', label: '需求分析', icon: Target },
    { id: 'direction', label: '选品方向', icon: Lightbulb },
    { id: 'products', label: '爆款挖掘', icon: TrendingUp },
    { id: 'feasibility', label: '可行性分析', icon: Calculator },
    { id: 'report', label: '选品报告', icon: FileText },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === activeTab);

  // 处理需求提交 - 调用AI分析
  const handleRequirementSubmit = async () => {
    if (!requirement.market) {
      toast.error('请选择目标市场');
      return;
    }
    setIsLoading(true);
    setAiThinking('AI正在分析市场趋势和选品方向...');
    
    try {
      const result = await callAISelection('directions', {
        market: requirement.market,
        category: requirement.category,
        budget: requirement.budget,
        coreAppeal: requirement.coreAppeal,
      });

      if (result.success && result.directions && result.directions.length > 0) {
        setDirections(result.directions);
        setSelectedDirections(result.directions.slice(0, 2).map((d: any) => d.id));
        setActiveTab('direction');
        toast.success(`AI推荐了 ${result.directions.length} 个选品方向`);
      } else {
        toast.error('AI分析失败，请重试');
      }
    } catch (error: any) {
      console.error('AI选品方向分析失败:', error);
      toast.error(error.message || 'AI分析失败，请重试');
    } finally {
      setIsLoading(false);
      setAiThinking('');
    }
  };

  // 处理方向选择
  const handleDirectionSelect = (id: string) => {
    setSelectedDirections(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // 生成爆款 - 调用AI分析
  const handleGenerateProducts = async () => {
    if (selectedDirections.length === 0) {
      toast.error('请至少选择一个选品方向');
      return;
    }
    setIsLoading(true);
    setAiThinking('AI正在挖掘爆款商品...');
    
    try {
      const selectedDir = directions.filter(d => selectedDirections.includes(d.id));
      const result = await callAISelection('products', {
        directions: selectedDir,
        market: requirement.market,
        category: requirement.category,
        budget: requirement.budget,
      });

      if (result.success && result.products && result.products.length > 0) {
        const products = result.products.map((p: any, i: number) => ({
          ...p,
          id: p.id || `P-${i + 1}`,
          competition: (p.competition || '中等') as '蓝海' | '红海' | '中等',
          recommendIndex: p.recommendIndex || 4,
          trend: p.trend || 50,
          monthlySales: p.monthlySales || 3000,
        }));
        setHotProducts(products);
        setSelectedProducts(products.slice(0, 3).map(p => p.id));
        setActiveTab('products');
        toast.success('发现 ' + products.length + ' 个潜在爆款商品');
      } else {
        toast.error('AI商品分析失败，请重试');
      }
    } catch (error: any) {
      console.error('AI爆款挖掘失败:', error);
      toast.error(error.message || 'AI分析失败，请重试');
    } finally {
      setIsLoading(false);
      setAiThinking('');
    }
  };

  // 切换商品选择
  const handleProductToggle = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, p => p]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedProducts.length === hotProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(hotProducts.map(p => p.id));
    }
  };

  // 开始可行性分析 - 调用AI分析
  const handleStartAnalysis = async () => {
    if (selectedProducts.length === 0) {
      toast.error('请至少选择一个商品进行分析');
      return;
    }
    setIsLoading(true);
    setAiThinking('AI正在进行可行性分析（利润测算、合规检查、风险评估）...');
    
    try {
      const selected = hotProducts.filter(p => selectedProducts.includes(p.id));
      const result = await callAISelection('feasibility', {
        products: selected,
        market: requirement.market,
      });

      if (result.success && result.feasibility && result.feasibility.length > 0) {
        // 将AI分析结果与商品信息关联
        const results = result.feasibility.map((f: any, i: number) => ({
          ...f,
          productId: selected[i]?.id || f.productId,
          productName: selected[i]?.name || f.productName,
        }));
        
        // 过滤禁售商品
        const validResults = results.filter((r: any) => r.compliance?.status !== '禁售');
        const bannedCount = results.length - validResults.length;
        
        setFeasibilityResults(validResults);
        
        // 为第一个商品获取供应商推荐
        if (validResults.length > 0) {
          const firstProduct = hotProducts.find(p => p.id === validResults[0].productId);
          try {
            const supplierResult = await callAISelection('suppliers', { product: firstProduct });
            if (supplierResult.success && supplierResult.suppliers) {
              setSuppliers(supplierResult.suppliers);
            }
          } catch (e) {
            console.error('供应商推荐失败:', e);
          }
        }

        setActiveTab('feasibility');
        
        if (bannedCount > 0) {
          toast.warning(`已自动过滤 ${bannedCount} 个禁售商品`);
        }
        toast.success('可行性分析完成');
      } else {
        toast.error('AI可行性分析失败，请重试');
      }
    } catch (error: any) {
      console.error('AI可行性分析失败:', error);
      toast.error(error.message || 'AI分析失败，请重试');
    } finally {
      setIsLoading(false);
      setAiThinking('');
    }
  };

  // 生成选品报告 - 调用AI生成
  const handleGenerateReport = async () => {
    if (feasibilityResults.length === 0) {
      toast.error('请先完成可行性分析');
      return;
    }
    setIsLoading(true);
    setAiThinking('AI正在生成选品报告...');
    
    try {
      const selected = hotProducts.filter(p => selectedProducts.includes(p.id));
      const result = await callAISelection('report', {
        requirements: requirement,
        directions: directions.filter(d => selectedDirections.includes(d.id)),
        products: selected,
        feasibility: feasibilityResults,
      });

      const newReport: SelectionReport = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        requirements: requirement,
        directions: directions.filter(d => selectedDirections.includes(d.id)),
        products: selected,
        feasibility: feasibilityResults,
        suppliers,
        summary: result.report?.summary || {
          totalProducts: hotProducts.length,
          recommendedProducts: feasibilityResults.filter(r => r.conclusion === '强烈推荐').length,
          avgProfitRate: Math.round(feasibilityResults.reduce((sum, r) => sum + (r.profitCalc?.grossMargin || 0), 0) / feasibilityResults.length),
          topCategory: requirement.category,
          riskLevel: feasibilityResults.some(r => r.risks?.some((risk: any) => risk.level === '高')) ? '高' : 
                     feasibilityResults.some(r => r.risks?.some((risk: any) => risk.level === '中')) ? '中' : '低',
        },
        recommendations: result.report?.recommendations || [
          '优先测试高利润、低竞争商品',
          '定价参考竞品价格，保持利润空间',
          '视频创意建议：场景化使用演示',
          '首批备货控制数量，降低风险',
        ],
        fullAnalysis: result.fullAnalysis,
      };

      setReport(newReport);
      setActiveTab('report');
      toast.success('AI选品报告已生成');
    } catch (error: any) {
      console.error('AI报告生成失败:', error);
      toast.error(error.message || 'AI报告生成失败，请重试');
    } finally {
      setIsLoading(false);
      setAiThinking('');
    }
  };

  // 导出报告
  const handleExportReport = () => {
    if (!report) return;

    const market = marketConfigs[requirement.market] || marketConfigs.id;
    const content = `# 电商选品报告
> 生成时间: ${new Date(report.createdAt).toLocaleString('zh-CN')}
> 目标市场: ${market.name} (${market.flag})
> AI分析: ✅ 已使用AI大模型进行智能分析

---

## 一、选品需求

| 项目 | 选择 |
|------|------|
| 目标市场 | ${market.name} ${market.flag} |
| 类目偏好 | ${requirement.category} |
| 预算范围 | ${budgetRanges[requirement.budget]?.label || requirement.budget} |
| 核心诉求 | ${coreAppeals.find(c => c.value === requirement.coreAppeal)?.label || requirement.coreAppeal} |

---

## 二、选品方向分析

${report.directions.map(d => `
### ${d.icon || '📦'} ${d.name}
- **推荐理由**: ${d.reason || '市场分析推荐'}
- **市场潜力**: ${d.marketPotential || 75}%
- **竞争度**: ${d.competition || '中等'}
- **预估利润率**: ${d.avgProfitRate || 35}%
${d.trending ? '- 🔥 热门趋势' : ''}
`).join('\n')}

---

## 三、候选商品

| 商品名称 | 售价 | 成本 | 月销量 | 竞争度 | 趋势 | 推荐指数 |
|---------|------|------|--------|--------|------|---------|
${report.products.map(p => `| ${p.name} | $${p.price?.toFixed(2) || '-'} | $${p.costPrice?.toFixed(2) || '-'} | ${p.monthlySales}+ | ${p.competition} | +${p.trend}% | ${'⭐'.repeat(p.recommendIndex || 3)} |`).join('\n')}

---

## 四、可行性分析

${report.feasibility.map((f, i) => `
### ${i + 1}. ${f.productName || hotProducts.find(p => p.id === f.productId)?.name || '商品'}

**综合评分**: ${f.overallScore || 70}/100 | **结论**: ${f.conclusion || '谨慎推荐'}

#### 利润测算
| 项目 | 金额 |
|------|------|
| 售价 | $${f.profitCalc?.sellingPrice?.toFixed(2) || '-'} |
| 成本 | -$${f.profitCalc?.cost?.toFixed(2) || '-'} |
| 物流 | -$${f.profitCalc?.logistics?.toFixed(2) || '-'} |
| 佣金(${f.profitCalc?.commission || 10}%) | -$${(f.profitCalc?.sellingPrice * (f.profitCalc?.commission || 10) / 100).toFixed(2)} |
| VAT(${f.profitCalc?.vat || 0}%) | -$${(f.profitCalc?.sellingPrice * (f.profitCalc?.vat || 0) / 100).toFixed(2)} |
| **毛利** | **$${f.profitCalc?.grossProfit?.toFixed(2) || '-'} (${f.profitCalc?.grossMargin?.toFixed(1) || '-'}%)** |
| 广告费 | -$${f.profitCalc?.adFee?.toFixed(2) || '-'} |
| **净利润** | **$${f.profitCalc?.netProfit?.toFixed(2) || '-'} (${f.profitCalc?.netMargin?.toFixed(1) || '-'}%)** |

#### 合规状态
- **状态**: ${f.compliance?.status || '合规'}
${f.compliance?.warnings?.map((w: string) => `- ⚠️ ${w}`).join('\n') || ''}
${f.compliance?.issues?.map((i: string) => `- ❌ ${i}`).join('\n') || ''}

#### 风险评估
${f.risks?.map((r: any) => `- ${r.level === '高' ? '🔴' : r.level === '中' ? '🟡' : '🟢'} ${r.type}: ${r.suggestion || ''}`).join('\n') || '暂无风险数据'}
`).join('\n')}

---

## 五、综合建议

${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

${report.fullAnalysis ? `## 六、AI深度分析

${report.fullAnalysis}

---` : ''}

*本报告由龙掌柜AI智能选品系统生成*` 
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI选品报告_${market.name}_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('报告已导出');
  };

  // 筛选供应商
  const filteredSuppliers = suppliers
    .filter(s => s.moq >= supplierFilter.minMoq && s.moq <= supplierFilter.maxMoq)
    .filter(s => !supplierFilter.dropshippingOnly || s.isDropshipping)
    .sort((a, b) => {
      if (supplierFilter.sortBy === 'rating') return b.rating - a.rating;
      if (supplierFilter.sortBy === 'price') return a.price - b.price;
      return a.moq - b.moq;
    });

  // 获取可行性对应的商品信息
  const getProductById = (id: string) => {
    return hotProducts.find(p => p.id === id) || feasibilityResults.find(f => f.productId === id);
  };

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
                  className={`flex items-center gap-2 cursor-pointer transition-colors ${
                    isActive ? 'text-[#165DFF]' : isCompleted ? 'text-[#00B42A]' : 'text-[#86909C]'
                  }`}
                  onClick={() => {
                    if (isCompleted || step.id === 'requirement') {
                      setActiveTab(step.id);
                    }
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-[#165DFF] text-white' : 
                    isCompleted ? 'bg-[#00B42A] text-white' : 'bg-[#F2F3F5]'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 ${isCompleted ? 'bg-[#00B42A]' : 'bg-[#E5E6EB]'}`} />
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
                  <label className="text-sm font-medium text-[#1D2129]">预算范围</label>
                  <Select value={requirement.budget} onValueChange={(v) => setRequirement({ ...requirement, budget: v })}>
                    <SelectTrigger className="input-minimal h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(budgetRanges).map(([key, range]) => (
                        <SelectItem key={key} value={key}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 核心诉求 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1D2129]">核心诉求</label>
                  <Select value={requirement.coreAppeal} onValueChange={(v) => setRequirement({ ...requirement, coreAppeal: v })}>
                    <SelectTrigger className="input-minimal h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coreAppeals.map((appeal) => (
                        <SelectItem key={appeal.value} value={appeal.value}>
                          {appeal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 规避类目 */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-[#1D2129]">规避类目（选填）</label>
                  <Input
                    placeholder="输入不想涉及的类目，多个用逗号分隔"
                    value={requirement.avoidCategories}
                    onChange={(e) => setRequirement({ ...requirement, avoidCategories: e.target.value })}
                    className="input-minimal h-12"
                  />
                </div>
              </div>

              {/* 需求确认 */}
              <div className="mt-6 p-4 bg-[#F4F7FF] rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#165DFF]" />
                  <span className="text-sm font-medium text-[#165DFF]">当前选品需求</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-[#86909C]">目标市场</p>
                    <p className="text-sm font-medium">{marketConfigs[requirement.market]?.flag} {marketConfigs[requirement.market]?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86909C]">类目偏好</p>
                    <p className="text-sm font-medium">{requirement.category || '不限'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86909C]">预算范围</p>
                    <p className="text-sm font-medium">{budgetRanges[requirement.budget]?.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86909C]">核心诉求</p>
                    <p className="text-sm font-medium">{coreAppeals.find(c => c.value === requirement.coreAppeal)?.label}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  className="btn-primary px-8 h-12" 
                  onClick={handleRequirementSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      开始AI分析
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 步骤2: 选品方向 */}
        {activeTab === 'direction' && (
          <div className="space-y-6">
            <Card className="card-minimal">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#FFF7E6] flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-[#FF7D00]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#1D2129]">AI推荐选品方向</h2>
                      <p className="text-sm text-[#86909C]">基于您的需求，AI智能推荐了以下选品方向</p>
                    </div>
                  </div>
                  <div className="text-sm text-[#86909C]">
                    已选择 <span className="text-[#165DFF] font-medium">{selectedDirections.length}</span> / {directions.length} 个方向
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {directions.map((direction) => {
                    const isSelected = selectedDirections.includes(direction.id);
                    return (
                      <div
                        key={direction.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-[#165DFF] bg-[#F4F7FF]' 
                            : 'border-[#E5E6EB] hover:border-[#BBDCFF]'
                        }`}
                        onClick={() => handleDirectionSelect(direction.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{direction.icon || '📦'}</span>
                            <div>
                              <h3 className="font-medium text-[#1D2129]">{direction.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {direction.trending && (
                                  <Badge className="bg-[#FFF7E6] text-[#FF7D00] text-xs">热门</Badge>
                                )}
                                <Badge className={direction.competition === '低竞争' ? 'bg-[#E8FFEA] text-[#00B42A]' : 'bg-[#F2F3F5] text-[#86909C]'}>
                                  {direction.competition}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-[#165DFF] border-[#165DFF]' : 'border-[#E5E6EB]'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-[#86909C] mb-3">{direction.reason}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#86909C]">市场潜力</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-[#F2F3F5] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#165DFF] rounded-full"
                                style={{ width: `${direction.marketPotential || 75}%` }}
                              />
                            </div>
                            <span className="text-[#165DFF] font-medium">{direction.marketPotential || 75}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-2">
                          <span className="text-[#86909C]">预估利润率</span>
                          <span className="text-[#00B42A] font-medium">{direction.avgProfitRate || 35}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" className="btn-secondary" onClick={() => setActiveTab('requirement')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>
              <Button 
                className="btn-primary px-8" 
                onClick={handleGenerateProducts}
                disabled={isLoading || selectedDirections.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI挖掘中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    AI挖掘爆款商品
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 步骤3: 爆款挖掘 */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <Card className="card-minimal">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8FFEA] flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#00B42A]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#1D2129]">爆款候选池</h2>
                      <p className="text-sm text-[#86909C]">AI发现 {hotProducts.length} 个潜在爆款商品，请选择要分析的商品</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedProducts.length === hotProducts.length ? '取消全选' : '全选'}
                    </Button>
                    <div className="text-sm text-[#86909C]">
                      已选 <span className="text-[#165DFF] font-medium">{selectedProducts.length}</span> 个
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E6EB]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#86909C]">选择</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#86909C]">商品信息</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#86909C]">售价</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#86909C]">月销量</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#86909C]">竞争度</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#86909C]">趋势</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#86909C]">推荐指数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.id);
                        return (
                          <tr 
                            key={product.id} 
                            className={`border-b border-[#F2F3F5] cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#F4F7FF]' : 'hover:bg-[#FAFAFA]'
                            }`}
                            onClick={() => handleProductToggle(product.id)}
                          >
                            <td className="py-3 px-4">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'bg-[#165DFF] border-[#165DFF]' : 'border-[#E5E6EB]'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-[#1D2129]">{product.name}</p>
                                <p className="text-xs text-[#86909C] mt-1">{product.coreSellingPoint}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[#1D2129] font-medium">${product.price?.toFixed(2) || '-'}</span>
                              <p className="text-xs text-[#86909C]">成本: ${product.costPrice?.toFixed(2) || '-'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[#1D2129]">{product.monthlySales}+</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                product.competition === '蓝海' ? 'bg-[#E8FFEA] text-[#00B42A]' :
                                product.competition === '红海' ? 'bg-[#FFF2F0] text-[#F53F3F]' :
                                'bg-[#F2F3F5] text-[#86909C]'
                              }>
                                {product.competition}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1 text-[#00B42A]">
                                <TrendingUp className="w-3 h-3" />
                                <span>+{product.trend}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < (product.recommendIndex || 3) ? 'text-[#FF7D00] fill-[#FF7D00]' : 'text-[#E5E6EB]'}`} 
                                  />
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" className="btn-secondary" onClick={() => setActiveTab('direction')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>
              <Button 
                className="btn-primary px-8" 
                onClick={handleStartAnalysis}
                disabled={isLoading || selectedProducts.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    开始AI可行性分析 ({selectedProducts.length}个)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 步骤4: 可行性分析 */}
        {activeTab === 'feasibility' && (
          <div className="space-y-6">
            <Tabs defaultValue="profit" className="w-full">
              <TabsList className="bg-[#F2F3F5]">
                <TabsTrigger value="profit" className="data-[state=active]:bg-white">利润测算</TabsTrigger>
                <TabsTrigger value="compliance" className="data-[state=active]:bg-white">合规检查</TabsTrigger>
                <TabsTrigger value="risk" className="data-[state=active]:bg-white">风险评估</TabsTrigger>
                <TabsTrigger value="supplier" className="data-[state=active]:bg-white">供应商匹配</TabsTrigger>
              </TabsList>

              {/* 利润测算 */}
              <TabsContent value="profit" className="mt-6">
                <Card className="card-minimal">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-6">AI利润测算结果</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {feasibilityResults.map((result) => {
                        const product = hotProducts.find(p => p.id === result.productId);
                        return (
                          <div key={result.productId} className="p-4 border border-[#E5E6EB] rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  result.conclusion === '强烈推荐' ? 'bg-[#E8FFEA]' :
                                  result.conclusion === '谨慎推荐' ? 'bg-[#FFF7E6]' : 'bg-[#FFF2F0]'
                                }`}>
                                  {result.conclusion === '强烈推荐' ? <CheckCircle className="w-5 h-5 text-[#00B42A]" /> :
                                   result.conclusion === '谨慎推荐' ? <AlertCircle className="w-5 h-5 text-[#FF7D00]" /> :
                                   <XCircle className="w-5 h-5 text-[#F53F3F]" />}
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#1D2129]">{result.productName || product?.name || '商品'}</h4>
                                  <Badge className={
                                    result.conclusion === '强烈推荐' ? 'bg-[#E8FFEA] text-[#00B42A]' :
                                    result.conclusion === '谨慎推荐' ? 'bg-[#FFF7E6] text-[#FF7D00]' :
                                    'bg-[#FFF2F0] text-[#F53F3F]'
                                  }>
                                    {result.conclusion}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-[#00B42A]">{result.overallScore || 70}</p>
                                <p className="text-xs text-[#86909C]">综合评分</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                                <span className="text-[#86909C]">售价</span>
                                <span className="text-[#1D2129] font-medium">${result.profitCalc?.sellingPrice?.toFixed(2) || '-'}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                                <span className="text-[#86909C]">成本</span>
                                <span className="text-[#F53F3F]">-${result.profitCalc?.cost?.toFixed(2) || '-'}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                                <span className="text-[#86909C]">物流费</span>
                                <span className="text-[#F53F3F]">-${result.profitCalc?.logistics?.toFixed(2) || '-'}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                                <span className="text-[#86909C]">平台佣金({result.profitCalc?.commission || 10}%)</span>
                                <span className="text-[#F53F3F]">-${((result.profitCalc?.sellingPrice || 0) * (result.profitCalc?.commission || 10) / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                                <span className="text-[#86909C]">VAT({result.profitCalc?.vat || 0}%)</span>
                                <span className="text-[#F53F3F]">-${((result.profitCalc?.sellingPrice || 0) * (result.profitCalc?.vat || 0) / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                                <span className="text-[#86909C]">广告费(10%)</span>
                                <span className="text-[#FF7D00]">-${result.profitCalc?.adFee?.toFixed(2) || '-'}</span>
                              </div>
                              <div className="flex items-center justify-between py-3 bg-[#E8FFEA] rounded-lg px-3 mt-2">
                                <span className="text-[#1D2129] font-medium">净利润</span>
                                <span className="text-[#00B42A] font-bold text-lg">
                                  ${result.profitCalc?.netProfit?.toFixed(2) || '-'} ({result.profitCalc?.netMargin?.toFixed(1) || '-'}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* 合规检查 */}
              <TabsContent value="compliance" className="mt-6">
                <Card className="card-minimal">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-6">AI合规检查结果</h3>
                    <div className="space-y-4">
                      {feasibilityResults.map((result) => {
                        const product = hotProducts.find(p => p.id === result.productId);
                        return (
                          <div key={result.productId} className="p-4 border border-[#E5E6EB] rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-[#1D2129]">{result.productName || product?.name || '商品'}</h4>
                              <Badge className={
                                result.compliance?.status === '合规' ? 'bg-[#E8FFEA] text-[#00B42A]' :
                                result.compliance?.status === '需认证' ? 'bg-[#FFF7E6] text-[#FF7D00]' :
                                'bg-[#FFF2F0] text-[#F53F3F]'
                              }>
                                {result.compliance?.status === '合规' ? <ShieldCheck className="w-3 h-3 mr-1" /> :
                                 result.compliance?.status === '需认证' ? <Shield className="w-3 h-3 mr-1" /> :
                                 <ShieldAlert className="w-3 h-3 mr-1" />}
                                {result.compliance?.status || '合规'}
                              </Badge>
                            </div>
                            
                            {result.compliance?.issues && result.compliance.issues.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-[#F53F3F] mb-2">存在问题:</p>
                                {result.compliance.issues.map((issue, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-[#F53F3F] mb-1">
                                    <XCircle className="w-4 h-4" />
                                    {issue}
                                  </div>
                                ))}
                              </div>
                            )}

                            {result.compliance?.warnings && result.compliance.warnings.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-[#FF7D00] mb-2">注意事项:</p>
                                {result.compliance.warnings.map((warning, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-[#FF7D00] mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    {warning}
                                  </div>
                                ))}
                              </div>
                            )}

                            {result.compliance?.requiredCerts && result.compliance.requiredCerts.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[#E5E6EB]">
                                <p className="text-sm font-medium text-[#86909C] mb-2">建议认证:</p>
                                <div className="flex flex-wrap gap-2">
                                  {result.compliance.requiredCerts.map((cert, i) => (
                                    <Badge key={i} variant="outline" className="border-[#165DFF] text-[#165DFF]">
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {!result.compliance?.issues?.length && !result.compliance?.warnings?.length && (
                              <div className="flex items-center gap-2 text-[#00B42A]">
                                <CheckCircle className="w-4 h-4" />
                                <span>该商品符合平台规范，可以上架销售</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* 风险评估 */}
              <TabsContent value="risk" className="mt-6">
                <Card className="card-minimal">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-6">AI风险评估结果</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {feasibilityResults.map((result) => {
                        const product = hotProducts.find(p => p.id === result.productId);
                        return (
                          <div key={result.productId} className="p-4 border border-[#E5E6EB] rounded-lg">
                            <h4 className="font-medium text-[#1D2129] mb-4">{result.productName || product?.name || '商品'}</h4>
                            {result.risks && result.risks.length > 0 ? (
                              <div className="space-y-3">
                                {result.risks.map((risk, i) => (
                                  <div key={i} className={`p-3 rounded-lg ${
                                    risk.level === '高' ? 'bg-[#FFF2F0]' :
                                    risk.level === '中' ? 'bg-[#FFF7E6]' :
                                    'bg-[#E8FFEA]'
                                  }`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                          risk.level === '高' ? 'bg-[#F53F3F]' :
                                          risk.level === '中' ? 'bg-[#FF7D00]' :
                                          'bg-[#00B42A]'
                                        }`} />
                                        <span className="font-medium text-[#1D2129]">{risk.type}</span>
                                      </div>
                                      <Badge className={
                                        risk.level === '高' ? 'bg-[#F53F3F] text-white' :
                                        risk.level === '中' ? 'bg-[#FF7D00] text-white' :
                                        'bg-[#00B42A] text-white'
                                      }>
                                        {risk.level}风险
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-[#86909C]">{risk.suggestion}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[#00B42A]">
                                <CheckCircle className="w-4 h-4" />
                                <span>暂未识别到明显风险</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* 供应商匹配 */}
              <TabsContent value="supplier" className="mt-6">
                <Card className="card-minimal">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1D2129]">AI供应商推荐</h3>
                        <p className="text-sm text-[#86909C]">基于选品结果智能匹配优质供应商</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Select value={supplierFilter.sortBy} onValueChange={(v: any) => setSupplierFilter({ ...supplierFilter, sortBy: v })}>
                          <SelectTrigger className="w-40 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">按评分</SelectItem>
                            <SelectItem value="price">按价格</SelectItem>
                            <SelectItem value="moq">按起订量</SelectItem>
                          </SelectContent>
                        </Select>
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={supplierFilter.dropshippingOnly}
                            onChange={(e) => setSupplierFilter({ ...supplierFilter, dropshippingOnly: e.target.checked })}
                            className="w-4 h-4"
                          />
                          仅一件代发
                        </label>
                      </div>
                    </div>

                    {filteredSuppliers.length > 0 ? (
                      <div className="space-y-4">
                        {filteredSuppliers.map((supplier) => (
                          <div key={supplier.id} className="p-4 border border-[#E5E6EB] rounded-lg hover:border-[#BBDCFF] transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building className="w-4 h-4 text-[#86909C]" />
                                  <h4 className="font-medium text-[#1D2129]">{supplier.name}</h4>
                                  <Badge variant="outline" className="text-xs">{supplier.location}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#86909C]">
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-[#FF7D00] fill-[#FF7D00]" />
                                    {supplier.rating?.toFixed(1) || '4.5'}
                                  </span>
                                  <span>起订量: {supplier.moq || 50}件</span>
                                  <span>发货: {supplier.deliveryDays || 5}天</span>
                                  <span>月销: {supplier.monthlyOrders || 1000}+</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-[#165DFF]">¥{supplier.price?.toFixed(2) || '-'}</p>
                                <p className="text-xs text-[#86909C]">{supplier.priceRange || ''}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {supplier.isDropshipping && (
                                    <Badge className="bg-[#E8FFEA] text-[#00B42A] text-xs">一件代发</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F2F3F5]">
                              <div className="flex items-center gap-2">
                                {supplier.certifications?.map((cert, i) => (
                                  <Badge key={i} variant="outline" className="text-xs border-[#E5E6EB]">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={supplier.productUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    查看商品
                                  </a>
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  navigator.clipboard.writeText(supplier.productUrl || '');
                                  toast.success('链接已复制');
                                }}>
                                  <Copy className="w-3 h-3 mr-1" />
                                  复制链接
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-[#86909CC]">
                        <Building className="w-12 h-12 mx-auto mb-3 text-[#E5E6EB]" />
                        <p>暂无供应商数据</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button variant="outline" className="btn-secondary" onClick={() => setActiveTab('products')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>
              <Button 
                className="btn-primary px-8" 
                onClick={handleGenerateReport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI生成中...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    生成AI选品报告
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 步骤5: 选品报告 */}
        {activeTab === 'report' && report && (
          <div className="space-y-6">
            <Card className="card-minimal">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#165DFF] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#1D2129]">AI选品报告已生成</h2>
                      <p className="text-sm text-[#86909C]">分析时间: {new Date(report.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                  <Button className="btn-primary" onClick={handleExportReport}>
                    <Download className="w-4 h-4 mr-2" />
                    导出报告
                  </Button>
                </div>

                {/* 统计概览 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-[#F4F7FF] rounded-lg">
                    <p className="text-sm text-[#86909C]">候选商品</p>
                    <p className="text-2xl font-bold text-[#165DFF]">{report.summary.totalProducts}</p>
                  </div>
                  <div className="p-4 bg-[#E8FFEA] rounded-lg">
                    <p className="text-sm text-[#86909C]">推荐商品</p>
                    <p className="text-2xl font-bold text-[#00B42A]">{report.summary.recommendedProducts}</p>
                  </div>
                  <div className="p-4 bg-[#FFF7E6] rounded-lg">
                    <p className="text-sm text-[#86909C]">平均利润率</p>
                    <p className="text-2xl font-bold text-[#FF7D00]">{report.summary.avgProfitRate}%</p>
                  </div>
                  <div className="p-4 bg-[#FFF2F0] rounded-lg">
                    <p className="text-sm text-[#86909C]">风险等级</p>
                    <p className={`text-2xl font-bold ${report.summary.riskLevel === '高' ? 'text-[#F53F3F]' : report.summary.riskLevel === '中' ? 'text-[#FF7D00]' : 'text-[#00B42A]'}`}>
                      {report.summary.riskLevel}
                    </p>
                  </div>
                </div>

                {/* 推荐建议 */}
                <div className="p-4 bg-[#F4F7FF] rounded-lg">
                  <h3 className="font-medium text-[#1D2129] mb-3">AI综合建议</h3>
                  <div className="space-y-2">
                    {report.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#165DFF] mt-0.5" />
                        <span className="text-sm text-[#4E5969]">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 推荐商品 */}
            <Card className="card-minimal">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1D2129] mb-4">AI推荐商品详情</h3>
                <div className="space-y-4">
                  {report.feasibility
                    .filter(r => r.conclusion === '强烈推荐')
                    .map((result, index) => {
                      const product = hotProducts.find(p => p.id === result.productId);
                      return (
                        <div key={result.productId} className="p-4 border border-[#E5E6EB] rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-[#1D2129]">{result.productName || product?.name || '商品'}</h4>
                                <Badge className="bg-[#E8FFEA] text-[#00B42A]">
                                  <Award className="w-3 h-3 mr-1" />
                                  TOP {index + 1}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#86909C] mb-3">{product?.coreSellingPoint || ''}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#00B42A]">{result.overallScore || 70}</p>
                              <p className="text-xs text-[#86909C]">综合评分</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#F2F3F5]">
                            <div>
                              <p className="text-xs text-[#86909C]">售价</p>
                              <p className="font-medium">${result.profitCalc?.sellingPrice?.toFixed(2) || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#86909C]">净利润率</p>
                              <p className="font-medium text-[#00B42A]">{result.profitCalc?.netMargin?.toFixed(1) || '-'}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#86909C]">月销量</p>
                              <p className="font-medium">{product?.monthlySales || '-'}+</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#86909C]">结论</p>
                              <p className="font-medium text-[#00B42A]">{result.conclusion}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  {report.feasibility.filter(r => r.conclusion === '强烈推荐').length === 0 && (
                    <div className="text-center py-8 text-[#86909C]">
                      <Lightbulb className="w-12 h-12 mx-auto mb-3 text-[#E5E6EB]" />
                      <p>暂无强烈推荐商品，请查看谨慎推荐的商品</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" className="btn-secondary" onClick={() => setActiveTab('feasibility')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回分析
              </Button>
              <Button 
                variant="outline" 
                className="btn-secondary"
                onClick={() => {
                  setActiveTab('requirement');
                  setRequirement({ market: '', category: '', budget: '', coreAppeal: '', avoidCategories: '' });
                  setDirections([]);
                  setHotProducts([]);
                  setFeasibilityResults([]);
                  setReport(null);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新选品
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
