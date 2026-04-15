'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ShoppingCart,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
  Send,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { selectProducts, analyzeCompetition } from '@/lib/api/ai-agents';

// ==================== 类型定义 ====================

// 选品需求
interface SelectionRequirement {
  market: string;
  category: string;
  budget: string;
  core诉求: string;
  avoidCategories: string;
}

// 爆款商品
interface HotProduct {
  id: string;
  name: string;
  core卖点: string;
  price: number;
  monthlySales: number;
  competition: '蓝海' | '红海' | '中等';
  recommendIndex: number; // 1-5星
  trend: number; // 增长趋势 %
}

// 可行性分析结果
interface FeasibilityResult {
  product: HotProduct;
  profitCalc: {
    cost: number;
    logistics: number;
    commission: number;
    adFee: number;
    vat: number;
    grossProfit: number;
    grossMargin: number;
    paybackDays: number;
  };
  compliance: {
    status: '合规' | '需补充认证' | '侵权风险高';
    issues: string[];
  };
  supplyChain: {
    supplier: string;
    price: number;
    moq: number;
    delivery: number;
    stability: '高' | '中' | '低';
  };
  risks: {
    type: string;
    level: '高' | '中' | '低';
    suggestion: string;
  }[];
  conclusion: '强烈推荐' | '谨慎推荐' | '不推荐';
}

// 竞品分析
interface Competitor {
  name: string;
  sales: number;
  rating: number;
  mainSellingPoint: string;
  userPainPoints: string[];
}

// 选品报告
interface SelectionReport {
  requirements: SelectionRequirement;
  direction: string[];
  hotProducts: HotProduct[];
  feasibility: FeasibilityResult[];
  competitors: Competitor[];
  recommendations: string[];
}

// ==================== 模拟数据 ====================

const mockDirections = [
  { name: '厨房收纳小工具', reason: '近30天搜索增长60%，在售卖家少', stars: 5 },
  { name: '宠物喂食器配件', reason: '宠物类目持续热销，竞争度适中', stars: 4 },
  { name: '浴室置物小物件', reason: '单价低、退货率低，适合新手', stars: 4 },
];

const mockHotProducts: HotProduct[] = [
  {
    id: 'H001',
    name: '厨房硅胶收纳夹',
    core卖点: '食品级硅胶、可重复使用、多功能',
    price: 9.99,
    monthlySales: 5000,
    competition: '蓝海',
    recommendIndex: 5,
    trend: 68,
  },
  {
    id: 'H002',
    name: '宠物自动饮水机配件',
    core卖点: '兼容多品牌、静音设计、易清洁',
    price: 12.99,
    monthlySales: 3500,
    competition: '中等',
    recommendIndex: 4,
    trend: 45,
  },
  {
    id: 'H003',
    name: '浴室防水收纳盒',
    core卖点: '免打孔安装、透明可视、防水防潮',
    price: 8.99,
    monthlySales: 4200,
    competition: '蓝海',
    recommendIndex: 5,
    trend: 72,
  },
];

const marketOptions = [
  { value: 'us', label: '美区', icon: '🇺🇸' },
  { value: 'uk', label: '欧区', icon: '🇬🇧' },
  { value: 'id', label: '印尼', icon: '🇮🇩' },
  { value: 'th', label: '泰国', icon: '🇹🇭' },
  { value: 'vn', label: '越南', icon: '🇻🇳' },
  { value: 'my', label: '马来', icon: '🇲🇾' },
];

const categoryOptions = [
  '家居用品', '厨房用品', '美妆工具', '宠物用品', 
  '母婴用品', '运动户外', '3C数码', '服装配饰'
];

const budgetOptions = [
  { value: 'low', label: '低预算 (≤5美元)', desc: '新手起步，低成本试水' },
  { value: 'medium', label: '中预算 (5-15美元)', desc: '平衡利润与销量' },
  { value: 'high', label: '高预算 (15-30美元)', desc: '追求品质，高客单价' },
];

const appealOptions = [
  { value: 'high_profit', label: '高利润', icon: '💰' },
  { value: 'low_competition', label: '低竞争', icon: '🌊' },
  { value: 'fast_turnover', label: '快周转', icon: '⚡' },
  { value: 'easy_operation', label: '易操作', icon: '🎯' },
];

// ==================== 组件 ====================

export default function SelectionAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('requirement');
  
  // 选品需求状态
  const [requirement, setRequirement] = useState<SelectionRequirement>({
    market: '',
    category: '',
    budget: '',
    core诉求: '',
    avoidCategories: '',
  });
  const [directionStep, setDirectionStep] = useState<'input' | 'output'>('input');
  
  // 爆款挖掘状态
  const [hotProducts, setHotProducts] = useState<HotProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 可行性分析状态
  const [feasibilityResults, setFeasibilityResults] = useState<FeasibilityResult[]>([]);
  const [profitParams, setProfitParams] = useState({
    cost: 3,
    logistics: 2,
    commission: 12,
    adFee: 10,
    vat: 7,
  });
  
  // 竞品分析状态
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analyzingCompetitor, setAnalyzingCompetitor] = useState<string | null>(null);
  
  // 报告状态
  const [report, setReport] = useState<SelectionReport | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 处理需求输入
  const handleRequirementChange = (key: keyof SelectionRequirement, value: string) => {
    setRequirement(prev => ({ ...prev, [key]: value }));
  };

  // 开始需求分析
  const handleStartRequirementAnalysis = () => {
    if (!requirement.market) {
      toast.error('请选择目标市场');
      return;
    }
    setDirectionStep('output');
  };

  // 开始爆款挖掘
  const handleStartHotMining = async () => {
    if (selectedProducts.length === 0) {
      toast.error('请至少选择一个选品方向');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await selectProducts({
        platform: 'tiktok',
        site: requirement.market || 'id',
        category: requirement.category || '热门商品',
        count: 5,
        min_profit_rate: 0.3,
      });
      
      if (result.success && result.products) {
        const products = Array.isArray(result.products) ? result.products : [];
        const mappedProducts: HotProduct[] = products.map((p: any, i: number) => ({
          id: p.id || `H${i + 1}`,
          name: p.name || p.product_name || `商品${i + 1}`,
          core卖点: p.reason || p.core卖点 || '市场分析推荐',
          price: p.price || 9.99,
          monthlySales: p.daily_sales ? p.daily_sales * 30 : 3000,
          competition: (p.competition === 'low' ? '蓝海' : p.competition === 'high' ? '红海' : '中等') as '蓝海' | '红海' | '中等',
          recommendIndex: Math.min(5, Math.floor((p.profit_margin || 35) / 10) + 2),
          trend: p.trend || 50,
        }));
        setHotProducts(mappedProducts);
        setActiveTab('hot-products');
        toast.success('爆款挖掘完成');
      } else {
        // 使用模拟数据
        setHotProducts(mockHotProducts);
        setActiveTab('hot-products');
        toast.success('爆款挖掘完成（演示数据）');
      }
    } catch (error) {
      console.error('爆款挖掘失败:', error);
      setHotProducts(mockHotProducts);
      setActiveTab('hot-products');
      toast.success('爆款挖掘完成（演示数据）');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 切换商品选中状态
  const toggleProductSelect = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // 开始可行性分析
  const handleStartFeasibilityAnalysis = () => {
    if (selectedProducts.length === 0) {
      toast.error('请至少选择一个商品进行分析');
      return;
    }
    
    const selected = hotProducts.filter(p => selectedProducts.includes(p.id));
    const results: FeasibilityResult[] = selected.map(product => {
      // 模拟可行性分析
      const grossProfit = product.price - profitParams.cost - profitParams.logistics - 
        (product.price * profitParams.commission / 100) - (product.price * profitParams.vat / 100);
      const grossMargin = (grossProfit / product.price) * 100;
      
      return {
        product,
        profitCalc: {
          cost: profitParams.cost,
          logistics: profitParams.logistics,
          commission: profitParams.commission,
          adFee: profitParams.adFee,
          vat: profitParams.vat,
          grossProfit,
          grossMargin,
          paybackDays: Math.ceil(profitParams.cost / (grossProfit * 0.1)),
        },
        compliance: {
          status: product.competition === '蓝海' ? '合规' : '需补充认证',
          issues: product.competition === '蓝海' ? [] : ['需要类目审核', '建议准备认证资料'],
        },
        supplyChain: {
          supplier: '义乌XXX供应商',
          price: profitParams.cost,
          moq: 100,
          delivery: 5,
          stability: '高',
        },
        risks: [
          { type: '退货风险', level: product.name.includes('电子') ? '高' : '低', suggestion: '做好包装，减少运输损坏' },
          { type: '季节风险', level: product.category === '家居' ? '低' : '中', suggestion: '关注季节性，提前备货' },
        ],
        conclusion: grossMargin >= 30 ? '强烈推荐' : grossMargin >= 15 ? '谨慎推荐' : '不推荐',
      };
    });
    
    setFeasibilityResults(results);
    setActiveTab('feasibility');
    toast.success(`已完成 ${results.length} 个商品的可行性分析`);
  };

  // 开始竞品分析
  const handleStartCompetitorAnalysis = async (productId: string) => {
    setAnalyzingCompetitor(productId);
    try {
      // 模拟竞品分析
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCompetitors([
        {
          name: '竞品A - 店铺X',
          sales: 15000,
          rating: 4.5,
          mainSellingPoint: '强调耐用性',
          userPainPoints: ['续航短', '体积大'],
        },
        {
          name: '竞品B - 店铺Y',
          sales: 12000,
          rating: 4.3,
          mainSellingPoint: '价格优势',
          userPainPoints: ['质量一般', '售后差'],
        },
      ]);
      toast.success('竞品分析完成');
    } catch (error) {
      toast.error('竞品分析失败');
    } finally {
      setAnalyzingCompetitor(null);
    }
  };

  // 生成选品报告
  const handleGenerateReport = () => {
    const newReport: SelectionReport = {
      requirements: requirement,
      direction: mockDirections.filter(d => selectedProducts.includes(d.name)).map(d => d.name),
      hotProducts: hotProducts.filter(p => selectedProducts.includes(p.id)),
      feasibility: feasibilityResults,
      competitors,
      recommendations: [
        '优先测试厨房硅胶收纳夹，蓝海类目，利润率高',
        '定价建议9.99美元，略低于竞品但保持利润空间',
        '视频创意建议：场景化使用演示，突出多功能卖点',
        '首批备货100件，控制库存成本和退货风险',
      ],
    };
    setReport(newReport);
    setActiveTab('report');
    toast.success('选品报告已生成');
  };

  // 导出报告
  const handleExportReport = () => {
    if (!report) return;
    const content = `# TK跨境电商选品报告

## 一、选品需求概述
- **目标市场**: ${requirement.market}
- **类目偏好**: ${requirement.category || '热门类目'}
- **预算范围**: ${requirement.budget}
- **核心诉求**: ${requirement.core诉求}

## 二、选品方向分析
${report.direction.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## 三、爆款候选池
| 商品名称 | 售价 | 月销量 | 竞争度 | 推荐指数 |
|---------|------|--------|--------|---------|
${report.hotProducts.map(p => `| ${p.name} | $${p.price} | ${p.monthlySales}+ | ${p.competition} | ${'⭐'.repeat(p.recommendIndex)} |`).join('\n')}

## 四、可行性分析结论
${report.feasibility.map((f, i) => `
### ${i + 1}. ${f.product.name}
- **毛利**: $${f.profitCalc.grossProfit.toFixed(2)} | **毛利率**: ${f.profitCalc.grossMargin.toFixed(1)}%
- **合规状态**: ${f.compliance.status}
- **结论**: ${f.conclusion}
`).join('\n')}

## 五、执行建议
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `选品报告_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('报告已导出');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">TK跨境选品智能体</h1>
              <p className="text-[14px] text-muted-foreground">基于PRD规范的智能选品决策辅助工具</p>
            </div>
          </div>
          <Badge className="bg-success text-white">
            在线运行
          </Badge>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <MessageSquare className="h-3 w-3 mr-1" />
            需求分析
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            爆款挖掘
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <BarChart3 className="h-3 w-3 mr-1" />
            可行性分析
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Users className="h-3 w-3 mr-1" />
            竞品拆解
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <FileText className="h-3 w-3 mr-1" />
            报告生成
          </Badge>
        </div>

        {/* 流程指引 */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'requirement' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                  {directionStep === 'output' ? <Check className="h-4 w-4" /> : <span className="text-[14px] font-medium">1</span>}
                </div>
                <span className={`text-[13px] ${activeTab === 'requirement' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>需求分析</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'hot-products' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                  {hotProducts.length > 0 ? <Check className="h-4 w-4" /> : <span className="text-[14px] font-medium">2</span>}
                </div>
                <span className={`text-[13px] ${activeTab === 'hot-products' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>爆款挖掘</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'feasibility' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                  {feasibilityResults.length > 0 ? <Check className="h-4 w-4" /> : <span className="text-[14px] font-medium">3</span>}
                </div>
                <span className={`text-[13px] ${activeTab === 'feasibility' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>可行性分析</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'report' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                  {report ? <Check className="h-4 w-4" /> : <span className="text-[14px] font-medium">4</span>}
                </div>
                <span className={`text-[13px] ${activeTab === 'report' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>报告生成</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="requirement">📝 需求分析</TabsTrigger>
            <TabsTrigger value="hot-products">🔥 爆款挖掘</TabsTrigger>
            <TabsTrigger value="feasibility">📊 可行性分析</TabsTrigger>
            <TabsTrigger value="competitor">👥 竞品分析</TabsTrigger>
            <TabsTrigger value="report">📄 选品报告</TabsTrigger>
          </TabsList>

          {/* ==================== 模块1: 需求分析 ==================== */}
          <TabsContent value="requirement" className="space-y-4">
            {directionStep === 'input' ? (
              // 引导式提问
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    选品需求分析
                  </CardTitle>
                  <CardDescription>请告诉我您的选品需求，我会为您推荐最适合的方向</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 目标市场 */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-foreground">
                      1️⃣ 目标市场 <span className="text-destructive">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {marketOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleRequirementChange('market', opt.value)}
                          className={`px-4 py-2 rounded-lg border text-[13px] transition-colors ${
                            requirement.market === opt.value 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-white border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 类目偏好 */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-foreground">
                      2️⃣ 类目偏好
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleRequirementChange('category', cat)}
                          className={`px-4 py-2 rounded-lg border text-[13px] transition-colors ${
                            requirement.category === cat 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-white border-border hover:border-primary/50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 成本预算 */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-foreground">
                      3️⃣ 成本预算（拿货价）
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {budgetOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleRequirementChange('budget', opt.value)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            requirement.budget === opt.value 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-white border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`text-[13px] font-medium ${requirement.budget === opt.value ? 'text-primary' : 'text-foreground'}`}>
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 核心诉求 */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-foreground">
                      4️⃣ 核心诉求
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {appealOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleRequirementChange('core诉求', opt.value)}
                          className={`px-4 py-2 rounded-lg border text-[13px] transition-colors ${
                            requirement.core诉求 === opt.value 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-white border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 规避类目 */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-foreground">
                      5️⃣ 规避类目（可选）
                    </label>
                    <Input 
                      placeholder="例如：电子烟、医疗用品..."
                      value={requirement.avoidCategories}
                      onChange={(e) => handleRequirementChange('avoidCategories', e.target.value)}
                      className="max-w-md"
                    />
                  </div>

                  <Button 
                    onClick={handleStartRequirementAnalysis}
                    disabled={!requirement.market}
                    className="mt-4"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始分析选品方向
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // 输出选品方向
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] flex items-center gap-2">
                    <Target className="h-5 w-5 text-success" />
                    选品方向推荐
                  </CardTitle>
                  <CardDescription>
                    根据您的需求（{marketOptions.find(m => m.value === requirement.market)?.label || ''}
                    {requirement.category && ` + ${requirement.category}`}
                    {requirement.budget && ` + ${budgetOptions.find(b => b.value === requirement.budget)?.label}`}）
                    为您推荐以下方向：
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockDirections.map((direction, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProducts.includes(direction.name) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleProductSelect(direction.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedProducts.includes(direction.name) 
                              ? 'bg-primary border-primary' 
                              : 'border-muted-foreground'
                          }`}>
                            {selectedProducts.includes(direction.name) && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-[14px] font-medium text-foreground">
                              {index + 1}. {direction.name}
                            </div>
                            <div className="text-[12px] text-muted-foreground mt-1">
                              原因：{direction.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < direction.stars ? 'text-warning' : 'text-muted'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-[13px] text-muted-foreground">
                      已选择 {selectedProducts.length} 个方向
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setDirectionStep('input')}>
                        重新选择
                      </Button>
                      <Button 
                        onClick={handleStartHotMining}
                        disabled={selectedProducts.length === 0 || isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            挖掘中...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            开始挖掘爆款
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== 模块2: 爆款挖掘 ==================== */}
          <TabsContent value="hot-products" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  爆款候选池
                </CardTitle>
                <CardDescription>
                  基于您的选品方向，挖掘出的潜力商品候选池
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hotProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无爆款数据，请先进行需求分析</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('requirement')}>
                      去需求分析
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hotProducts.map(product => (
                      <div 
                        key={product.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedProducts.includes(product.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleProductSelect(product.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-foreground">{product.name}</span>
                                <Badge variant="outline" className={
                                  product.competition === '蓝海' ? 'bg-success/10 text-success border-success/20' :
                                  product.competition === '红海' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                  'bg-warning/10 text-warning border-warning/20'
                                }>
                                  {product.competition}
                                </Badge>
                              </div>
                              <div className="text-[12px] text-muted-foreground">
                                核心卖点：{product.core卖点}
                              </div>
                              <div className="flex items-center gap-4 text-[12px]">
                                <span className="text-foreground">
                                  售价：<span className="font-medium text-success">${product.price}</span>
                                </span>
                                <span className="text-foreground">
                                  月销量：<span className="font-medium">{product.monthlySales}+</span>
                                </span>
                                <span className="text-foreground">
                                  趋势：<span className="font-medium text-success">↑{product.trend}%</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`text-[16px] ${i < product.recommendIndex ? 'text-warning' : 'text-muted'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedProducts.includes(product.id) 
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground'
                            }`}>
                              {selectedProducts.includes(product.id) && (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-[13px] text-muted-foreground">
                        已选择 {selectedProducts.length} 个商品
                      </div>
                      <Button 
                        onClick={handleStartFeasibilityAnalysis}
                        disabled={selectedProducts.length === 0}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        开始可行性分析
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== 模块3: 可行性分析 ==================== */}
          <TabsContent value="feasibility" className="space-y-4">
            {/* 利润测算参数 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">利润测算参数</CardTitle>
                <CardDescription>调整以下参数，系统将自动计算每个商品的利润情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">拿货价 ($)</label>
                    <Input 
                      type="number" 
                      value={profitParams.cost}
                      onChange={(e) => setProfitParams(p => ({...p, cost: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">物流费 ($)</label>
                    <Input 
                      type="number" 
                      value={profitParams.logistics}
                      onChange={(e) => setProfitParams(p => ({...p, logistics: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">平台佣金 (%)</label>
                    <Input 
                      type="number" 
                      value={profitParams.commission}
                      onChange={(e) => setProfitParams(p => ({...p, commission: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">广告费 (%)</label>
                    <Input 
                      type="number" 
                      value={profitParams.adFee}
                      onChange={(e) => setProfitParams(p => ({...p, adFee: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">VAT税率 (%)</label>
                    <Input 
                      type="number" 
                      value={profitParams.vat}
                      onChange={(e) => setProfitParams(p => ({...p, vat: Number(e.target.value)}))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 分析结果 */}
            {feasibilityResults.length === 0 ? (
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无分析结果，请先选择商品进行可行性分析</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {feasibilityResults.map((result, index) => (
                  <Card key={index} className="bg-white border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[15px]">{result.product.name}</CardTitle>
                        <Badge className={
                          result.conclusion === '强烈推荐' ? 'bg-success text-white' :
                          result.conclusion === '谨慎推荐' ? 'bg-warning text-white' :
                          'bg-destructive text-white'
                        }>
                          {result.conclusion}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 利润测算 */}
                      <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <div className="text-[12px] text-muted-foreground">毛利</div>
                          <div className="text-[18px] font-semibold text-success">
                            ${result.profitCalc.grossProfit.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[12px] text-muted-foreground">毛利率</div>
                          <div className="text-[18px] font-semibold text-success">
                            {result.profitCalc.grossMargin.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[12px] text-muted-foreground">回本周期</div>
                          <div className="text-[18px] font-semibold">
                            {result.profitCalc.paybackDays}天
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[12px] text-muted-foreground">售价</div>
                          <div className="text-[18px] font-semibold">
                            ${result.product.price}
                          </div>
                        </div>
                      </div>

                      {/* 合规 & 供应链 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-[13px] font-medium">合规校验</span>
                            <Badge variant="outline" className={
                              result.compliance.status === '合规' ? 'bg-success/10 text-success border-success/20' :
                              'bg-warning/10 text-warning border-warning/20'
                            }>
                              {result.compliance.status}
                            </Badge>
                          </div>
                          {result.compliance.issues.length > 0 && (
                            <ul className="text-[11px] text-muted-foreground space-y-1">
                              {result.compliance.issues.map((issue, i) => (
                                <li key={i}>⚠️ {issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="text-[13px] font-medium">供应链</span>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              稳定性{result.supplyChain.stability}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            供应商: {result.supplyChain.supplier} | MOQ: {result.supplyChain.moq}件 | 交期: {result.supplyChain.delivery}天
                          </div>
                        </div>
                      </div>

                      {/* 风险提示 */}
                      {result.risks.length > 0 && (
                        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <span className="text-[13px] font-medium">风险提示</span>
                          </div>
                          <div className="space-y-1">
                            {result.risks.map((risk, i) => (
                              <div key={i} className="text-[12px]">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] mr-2 ${
                                  risk.level === '高' ? 'bg-destructive/20 text-destructive' :
                                  risk.level === '中' ? 'bg-warning/20 text-warning' :
                                  'bg-success/20 text-success'
                                }`}>
                                  {risk.level}
                                </span>
                                <span className="text-muted-foreground">{risk.type}: {risk.suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab('competitor')}>
                    <Users className="h-4 w-4 mr-2" />
                    进行竞品分析
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ==================== 模块4: 竞品分析 ==================== */}
          <TabsContent value="competitor" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  竞品拆解
                </CardTitle>
                <CardDescription>
                  分析头部竞品的运营策略，为差异化选品提供参考
                </CardDescription>
              </CardHeader>
              <CardContent>
                {competitors.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">暂无竞品数据</p>
                    <Button 
                      onClick={() => handleStartCompetitorAnalysis(hotProducts[0]?.id || '')}
                      disabled={analyzingCompetitor !== null || hotProducts.length === 0}
                    >
                      {analyzingCompetitor ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          开始竞品分析
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {competitors.map((comp, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{comp.name}</div>
                          <div className="flex items-center gap-4 text-[12px]">
                            <span>销量: <span className="font-medium">{comp.sales.toLocaleString()}</span></span>
                            <span>评分: <span className="font-medium text-warning">{comp.rating}★</span></span>
                          </div>
                        </div>
                        <div className="text-[13px]">
                          <span className="text-muted-foreground">核心卖点：</span>
                          <span className="ml-2">{comp.mainSellingPoint}</span>
                        </div>
                        {comp.userPainPoints.length > 0 && (
                          <div className="text-[13px]">
                            <span className="text-muted-foreground">用户痛点：</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {comp.userPainPoints.map((point, i) => (
                                <Badge key={i} variant="outline" className="text-[11px] bg-destructive/10 text-destructive border-destructive/20">
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 差异化建议 */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <span className="font-medium">差异化建议</span>
                      </div>
                      <ul className="text-[13px] space-y-2 text-muted-foreground">
                        <li>1. <strong className="text-foreground">卖点优化：</strong>结合竞品痛点，建议突出"续航+便携"双重卖点</li>
                        <li>2. <strong className="text-foreground">定价策略：</strong>建议9.99美元，略低于竞品但保持利润空间</li>
                        <li>3. <strong className="text-foreground">视频创意：</strong>参考竞品爆款视频，建议做场景化使用演示</li>
                        <li>4. <strong className="text-foreground">评价优化：</strong>针对竞品用户痛点，在详情页提前规避</li>
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleGenerateReport}>
                        <FileText className="h-4 w-4 mr-2" />
                        生成选品报告
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== 模块5: 选品报告 ==================== */}
          <TabsContent value="report" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[15px] flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      选品报告
                    </CardTitle>
                    <CardDescription>
                      整合所有分析数据，生成结构化选品报告
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportReport} disabled={!report}>
                    <Download className="h-4 w-4 mr-2" />
                    导出报告
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!report ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无报告数据，请先完成前面的选品分析步骤</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 报告预览 */}
                    <div className="p-4 bg-muted/30 rounded-lg space-y-4 text-[13px]">
                      <div>
                        <h3 className="font-medium mb-2">一、选品需求概述</h3>
                        <p className="text-muted-foreground">
                          目标市场: {marketOptions.find(m => m.value === report.requirements.market)?.label} | 
                          类目偏好: {report.requirements.category || '热门类目'} | 
                          预算: {report.requirements.budget ? budgetOptions.find(b => b.value === report.requirements.budget)?.label : '未指定'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">二、选品方向</h3>
                        <ul className="text-muted-foreground space-y-1">
                          {report.direction.map((d, i) => <li key={i}>{i + 1}. {d}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">三、爆款候选池 ({report.hotProducts.length}个)</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {report.hotProducts.map(p => (
                            <div key={p.id} className="p-2 bg-white rounded border text-center">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-[11px] text-success">${p.price} | {p.competition}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">四、执行建议</h3>
                        <ul className="text-muted-foreground space-y-1">
                          {report.recommendations.map((r, i) => <li key={i}>{i + 1}. {r}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab('competitor')}>
                        返回竞品分析
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setActiveTab('requirement')}>
                          重新选品
                        </Button>
                        <Button onClick={handleGenerateReport}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          刷新报告
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
