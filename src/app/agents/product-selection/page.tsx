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

// 类目配置
interface CategoryConfig {
  name: string;
  icon: string;
  keywords: string[];
  avgPrice: number;
  competition: 'low' | 'medium' | 'high';
  profitMargin: number;
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
  keywords: string[];
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
  probability: number;
  impact: string;
  suggestion: string;
}

// 可行性结果
interface FeasibilityResult {
  product: HotProduct;
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

// 竞品
interface Competitor {
  id: string;
  name: string;
  seller: string;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  mainSellingPoint: string;
  userPainPoints: string[];
  advantages: string[];
}

// 选品报告
interface SelectionReport {
  id: string;
  createdAt: string;
  requirements: SelectionRequirement;
  directions: Direction[];
  products: HotProduct[];
  feasibility: FeasibilityResult[];
  competitors: Competitor[];
  suppliers: Supplier[];
  summary: {
    totalProducts: number;
    recommendedProducts: number;
    avgProfitRate: number;
    topCategory: string;
    riskLevel: string;
  };
  recommendations: string[];
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

const categoryConfigs: CategoryConfig[] = [
  { name: '家居用品', icon: '🏠', keywords: ['收纳', '置物', '清洁', '装饰'], avgPrice: 12, competition: 'medium', profitMargin: 35 },
  { name: '厨房用品', icon: '🍳', keywords: ['厨具', '餐具', '保鲜', '清洁'], avgPrice: 10, competition: 'high', profitMargin: 30 },
  { name: '美妆工具', icon: '💄', keywords: ['化妆', '护肤', '美甲', '美容'], avgPrice: 15, competition: 'high', profitMargin: 40 },
  { name: '宠物用品', icon: '🐾', keywords: ['宠物喂食', '宠物玩具', '宠物清洁', '宠物外出'], avgPrice: 18, competition: 'medium', profitMargin: 38 },
  { name: '母婴用品', icon: '👶', keywords: ['婴儿用品', '儿童玩具', '妈咪用品', '喂养用品'], avgPrice: 20, competition: 'high', profitMargin: 35 },
  { name: '运动户外', icon: '🏃', keywords: ['运动装备', '健身器材', '户外用品', '旅行配件'], avgPrice: 25, competition: 'medium', profitMargin: 32 },
  { name: '3C数码', icon: '📱', keywords: ['手机配件', '电脑配件', '智能设备', '充电设备'], avgPrice: 20, competition: 'high', profitMargin: 25 },
  { name: '服装配饰', icon: '👗', keywords: ['女装', '配饰', '箱包', '鞋子'], avgPrice: 15, competition: 'high', profitMargin: 40 },
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

// 禁售品类
const bannedKeywords = [
  '武器', '枪', '刀', '药品', '医疗器械', '赌博', '色情', '成人', '仿牌', 
  '假货', '电子烟', '烟草', '毒品', '宗教', '政治', '迷信',
];

// 认证要求
const certRequirements: Record<string, string[]> = {
  '美妆': ['FDA', 'CPNP'],
  '护肤': ['FDA', 'CPNP'],
  '食品': ['FDA', 'COA'],
  '玩具': ['CPC', 'CE', 'ASTM'],
  '电子': ['CE', 'FCC', 'ROHS'],
  '电器': ['CE', 'FCC'],
  '母婴': ['CPC', 'CE', 'EN71'],
  '宠物': ['检测报告'],
};

// ==================== 工具函数 ====================

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 随机数
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 2) => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// 打乱数组
const shuffle = <T>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ==================== 智能数据生成 ====================

// 生成选品方向
function generateDirections(requirement: SelectionRequirement, count = 5): Direction[] {
  const category = categoryConfigs.find(c => c.name === requirement.category) || categoryConfigs[0];
  const market = marketConfigs[requirement.market] || marketConfigs.id;
  const budget = budgetRanges[requirement.budget] || budgetRanges.medium;
  
  const baseNames = [
    { name: `${category.name} - 多功能款`, icon: '✨' },
    { name: `${category.name} - 升级款`, icon: '⬆️' },
    { name: `${category.name} - 便携款`, icon: '📦' },
    { name: `${category.name} - 礼品装`, icon: '🎁' },
    { name: `${category.name} - 简约款`, icon: '💎' },
    { name: `${category.name} - 创意款`, icon: '💡' },
    { name: `${category.name} - 迷你款`, icon: '🔮' },
    { name: `${category.name} - 家用款`, icon: '🏡' },
  ];

  const directions: Direction[] = [];
  const shuffled = shuffle(baseNames).slice(0, count);

  shuffled.forEach((base, i) => {
    const profitRate = requirement.coreAppeal === 'high_profit' 
      ? random(35, 50) 
      : requirement.coreAppeal === 'low_competition'
        ? random(40, 55)
        : random(25, 40);
    
    const competitionLevel = category.competition === 'low' ? '低竞争' 
      : category.competition === 'high' ? '高竞争' : '中等竞争';

    directions.push({
      id: `DIR-${i + 1}`,
      name: base.name,
      keywords: shuffle(category.keywords).slice(0, 3),
      reason: getDirectionReason(requirement, category, profitRate),
      marketPotential: random(70, 95),
      competition: competitionLevel,
      avgProfitRate: profitRate,
      trending: Math.random() > 0.3,
      icon: base.icon,
    });
  });

  return directions.sort((a, b) => b.marketPotential - a.marketPotential);
}

function getDirectionReason(requirement: SelectionRequirement, category: CategoryConfig, profitRate: number): string {
  const reasons = [
    `近30天搜索量增长${random(30, 80)}%，市场需求旺盛`,
    `该类目在${marketConfigs[requirement.market]?.name || '目标市场'}竞争度适中`,
    `平均利润率${profitRate}%，符合${coreAppeals.find(c => c.value === requirement.coreAppeal)?.label || '利润优先'}策略`,
    `同类商品少，适合差异化竞争`,
    `目标价格区间${budgetRanges[requirement.budget]?.label || '中预算'}，转化率高`,
  ];
  return reasons[random(0, reasons.length - 1)];
}

// 生成爆款商品
function generateHotProducts(directions: Direction[], requirement: SelectionRequirement): HotProduct[] {
  const products: HotProduct[] = [];
  const market = marketConfigs[requirement.market] || marketConfigs.id;
  const budget = budgetRanges[requirement.budget] || budgetRanges.medium;

  directions.forEach((direction, dIndex) => {
    const productCount = random(2, 4);
    for (let i = 0; i < productCount; i++) {
      const basePrice = randomFloat(budget.min, Math.min(budget.max, market.avgPrice));
      const costRatio = randomFloat(0.25, 0.45);
      const costPrice = basePrice * costRatio;
      
      const competitionLevel = direction.competition === '低竞争' ? '蓝海' 
        : direction.competition === '高竞争' ? '红海' : '中等';

      products.push({
        id: `P-${dIndex + 1}-${i + 1}`,
        name: `${direction.name.replace(categoryConfigs[0]?.name || '', '').trim()} ${['标准版', 'Pro版', '便携版', '升级版', '豪华版'][i]}`,
        coreSellingPoint: direction.keywords.join(' + '),
        price: basePrice,
        costPrice: costPrice,
        monthlySales: random(500, 8000),
        competition: competitionLevel,
        recommendIndex: random(3, 5),
        trend: random(20, 85),
        rating: randomFloat(4.0, 4.9),
        fulfillmentRate: random(85, 99),
        returnRate: randomFloat(1, 8),
      });
    }
  });

  return products.sort((a, b) => b.trend - a.trend);
}

// 利润测算
function calculateProfit(product: HotProduct, market: MarketConfig, adFeeRate = 10): ProfitCalc {
  const logistics = market.code === 'us' ? 2.5 : market.code === 'uk' ? 2.0 : 1.5;
  const platformFee = product.price * 0.02;
  
  const grossProfit = product.price - product.costPrice - logistics - 
    (product.price * market.commission / 100) - 
    (product.price * market.vat / 100) - 
    platformFee;
  
  const grossMargin = (grossProfit / product.price) * 100;
  
  const adFee = product.price * (adFeeRate / 100);
  const netProfit = grossProfit - adFee;
  const netMargin = (netProfit / product.price) * 100;

  return {
    cost: product.costPrice,
    logistics,
    commission: market.commission,
    vat: market.vat,
    adFee,
    platformFee,
    sellingPrice: product.price,
    grossProfit,
    grossMargin,
    netProfit,
    netMargin,
  };
}

// 合规检查
function checkCompliance(product: HotProduct, requirement: SelectionRequirement): ComplianceResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const requiredCerts: string[] = [];

  // 检查禁售
  const nameLower = product.name.toLowerCase();
  for (const banned of bannedKeywords) {
    if (nameLower.includes(banned.toLowerCase())) {
      issues.push(`包含禁售关键词: ${banned}`);
    }
  }

  // 检查认证要求
  const category = requirement.category || '家居用品';
  for (const [key, certs] of Object.entries(certRequirements)) {
    if (category.includes(key)) {
      requiredCerts.push(...certs);
      warnings.push(`该类目建议准备: ${certs.join(', ')}`);
    }
  }

  // 检查价格限制
  const market = marketConfigs[requirement.market];
  if (market && product.price > market.maxPrice / 100) {
    issues.push(`价格超过${market.name}站点限额 $${market.maxPrice / 100}`);
  }

  let status: '合规' | '需认证' | '禁售' = '合规';
  if (issues.length > 0) {
    status = '禁售';
  } else if (requiredCerts.length > 0) {
    status = '需认证';
  }

  const riskLevel: '低' | '中' | '高' = 
    status === '禁售' ? '高' : 
    requiredCerts.length > 0 ? '中' : '低';

  return { status, issues, warnings, requiredCerts, riskLevel };
}

// 风险评估
function assessRisks(product: HotProduct, requirement: SelectionRequirement): RiskAssessment[] {
  const risks: RiskAssessment[] = [];

  // 退货风险
  if (product.returnRate > 5) {
    risks.push({
      type: '高退货率',
      level: '高',
      probability: product.returnRate,
      impact: '影响店铺评分，增加运营成本',
      suggestion: '优化产品包装，确保质量，提供详细产品说明',
    });
  } else if (product.returnRate > 3) {
    risks.push({
      type: '中等退货率',
      level: '中',
      probability: product.returnRate,
      impact: '需关注质量控制',
      suggestion: '加强发货前质检，提前与供应商沟通质量标准',
    });
  }

  // 季节风险
  risks.push({
    type: '季节性风险',
    level: '低',
    probability: random(10, 30),
    impact: '淡旺季销量差异大',
    suggestion: '提前备货，关注节日营销节点',
  });

  // 竞争风险
  if (product.competition === '红海') {
    risks.push({
      type: '高竞争风险',
      level: '高',
      probability: 70,
      impact: '价格战，利润压缩',
      suggestion: '寻找差异化卖点，打造产品特色',
    });
  }

  // 物流风险
  const market = marketConfigs[requirement.market];
  if (market && ['id', 'th', 'vn', 'my'].includes(market.code)) {
    risks.push({
      type: '物流风险',
      level: '中',
      probability: 40,
      impact: '清关延误，配送时间长',
      suggestion: '选择可靠物流商，关注海关政策变化',
    });
  }

  // 汇率风险
  if (market && market.currency !== 'CNY') {
    risks.push({
      type: '汇率风险',
      level: '低',
      probability: 30,
      impact: '汇率波动影响利润',
      suggestion: '预留利润缓冲，关注汇率走势',
    });
  }

  return risks;
}

// 生成供应商
function generateSuppliers(product: HotProduct, requirement: SelectionRequirement): Supplier[] {
  const locations = ['浙江义乌', '广东广州', '广东深圳', '广东佛山', '福建泉州', '江苏苏州'];
  const suppliers: Supplier[] = [];

  const count = random(4, 6);
  for (let i = 0; i < count; i++) {
    const priceVariation = randomFloat(0.9, 1.1);
    const supplierPrice = product.costPrice * priceVariation;
    
    suppliers.push({
      id: `S-${product.id}-${i + 1}`,
      name: `${locations[i % locations.length]} ${['优品', '宏达', '金源', '雅洁', '荣升', '瑞鑫'][i]} ${['商贸', '实业', '制品', '工贸', '商行'][random(0, 4)]}`,
      location: locations[i % locations.length],
      rating: randomFloat(4.3, 4.9),
      responseTime: ['<30s', '<1min', '<2min', '<5min'][random(0, 3)],
      moq: [30, 50, 100, 200][random(0, 3)],
      price: supplierPrice,
      priceRange: `¥${(supplierPrice * 0.9).toFixed(1)}-${(supplierPrice * 1.2).toFixed(1)}`,
      deliveryDays: random(2, 7),
      isDropshipping: Math.random() > 0.4,
      certifications: shuffle(['ISO9001', 'CE', 'FCC', 'ROHS', 'SGS', 'FDA']).slice(0, random(1, 3)),
      productUrl: `https://detail.1688.com/offer/${random(620000000000, 630000000000)}.html`,
      monthlyOrders: random(500, 5000),
      startYear: random(2015, 2022),
    });
  }

  return suppliers.sort((a, b) => b.rating - a.rating);
}

// 生成竞品
function generateCompetitors(product: HotProduct, requirement: SelectionRequirement): Competitor[] {
  const competitors: Competitor[] = [];
  const count = random(3, 5);

  for (let i = 0; i < count; i++) {
    const priceDiff = randomFloat(0.7, 1.3);
    competitors.push({
      id: `C-${product.id}-${i + 1}`,
      name: `${product.name} - ${['品牌款', '同款', '升级款', '平价款', '精装款'][i]}`,
      seller: `${['Global', 'Fashion', 'Home', 'Smart', 'Best'][i]} Store`,
      price: product.price * priceDiff,
      sales: random(1000, 15000),
      rating: randomFloat(4.0, 4.8),
      reviews: random(50, 500),
      mainSellingPoint: ['性价比高', '品质优良', '设计独特', '服务好', '发货快'][i],
      userPainPoints: shuffle(['价格偏高', '质量一般', '包装简陋', '发货慢', '客服响应慢']).slice(0, 2),
      advantages: shuffle(['价格优势', '评价高', '销量大', '功能全', '外观美']).slice(0, 2),
    });
  }

  return competitors.sort((a, b) => b.sales - a.sales);
}

// 综合可行性分析
function analyzeFeasibility(product: HotProduct, requirement: SelectionRequirement): FeasibilityResult {
  const market = marketConfigs[requirement.market] || marketConfigs.id;
  const profitCalc = calculateProfit(product, market);
  const compliance = checkCompliance(product, requirement);
  const risks = assessRisks(product, requirement);
  const supplyMatch = random(70, 95);

  // 计算综合评分
  let overallScore = 50;
  overallScore += profitCalc.grossMargin * 0.5;
  overallScore += (product.trend / 100) * 20;
  overallScore += (product.rating / 5) * 15;
  overallScore += supplyMatch * 0.1;
  if (compliance.riskLevel === '低') overallScore += 10;
  if (compliance.riskLevel === '中') overallScore += 5;
  if (risks.some(r => r.level === '高')) overallScore -= 15;
  overallScore = Math.min(100, Math.max(0, overallScore));

  let conclusion: '强烈推荐' | '谨慎推荐' | '不推荐' = '谨慎推荐';
  if (overallScore >= 75 && compliance.status !== '禁售') conclusion = '强烈推荐';
  if (overallScore < 50 || compliance.status === '禁售') conclusion = '不推荐';

  return {
    product,
    profitCalc,
    compliance,
    risks,
    supplyMatch,
    overallScore,
    conclusion,
  };
}

// ==================== 组件 ====================

export default function ProductSelectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('requirement');
  const [isLoading, setIsLoading] = useState(false);
  
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
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
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

  // 处理需求提交
  const handleRequirementSubmit = () => {
    if (!requirement.market) {
      toast.error('请选择目标市场');
      return;
    }
    setIsLoading(true);
    
    // 模拟AI分析
    setTimeout(() => {
      const newDirections = generateDirections(requirement);
      setDirections(newDirections);
      setSelectedDirections(newDirections.slice(0, 2).map(d => d.id));
      setActiveTab('direction');
      setIsLoading(false);
      toast.success('AI推荐了 ' + newDirections.length + ' 个选品方向');
    }, 1500);
  };

  // 处理方向选择
  const handleDirectionSelect = (id: string) => {
    setSelectedDirections(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // 生成爆款
  const handleGenerateProducts = () => {
    if (selectedDirections.length === 0) {
      toast.error('请至少选择一个选品方向');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const selectedDir = directions.filter(d => selectedDirections.includes(d.id));
      const products = generateHotProducts(selectedDir, requirement);
      setHotProducts(products);
      setSelectedProducts(products.slice(0, 3).map(p => p.id));
      setActiveTab('products');
      setIsLoading(false);
      toast.success('发现 ' + products.length + ' 个潜在爆款商品');
    }, 2000);
  };

  // 切换商品选择
  const handleProductToggle = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
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

  // 开始可行性分析
  const handleStartAnalysis = () => {
    if (selectedProducts.length === 0) {
      toast.error('请至少选择一个商品进行分析');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const selected = hotProducts.filter(p => selectedProducts.includes(p.id));
      
      // 生成可行性分析结果
      const results = selected.map(p => analyzeFeasibility(p, requirement));
      
      // 过滤禁售商品
      const validResults = results.filter(r => r.compliance.status !== '禁售');
      const bannedCount = results.length - validResults.length;
      
      setFeasibilityResults(validResults);
      
      // 为第一个商品生成竞品和供应商
      if (validResults.length > 0) {
        setCompetitors(generateCompetitors(validResults[0].product, requirement));
        setSuppliers(generateSuppliers(validResults[0].product, requirement));
      }

      setActiveTab('feasibility');
      setIsLoading(false);
      
      if (bannedCount > 0) {
        toast.warning(`已自动过滤 ${bannedCount} 个禁售商品`);
      }
      toast.success('可行性分析完成');
    }, 2500);
  };

  // 生成选品报告
  const handleGenerateReport = () => {
    if (feasibilityResults.length === 0) {
      toast.error('请先完成可行性分析');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const selected = hotProducts.filter(p => selectedProducts.includes(p.id));
      const validResults = feasibilityResults.filter(r => r.compliance.status !== '禁售');
      
      const newReport: SelectionReport = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        requirements: requirement,
        directions: directions.filter(d => selectedDirections.includes(d.id)),
        products: selected,
        feasibility: validResults,
        competitors,
        suppliers,
        summary: {
          totalProducts: hotProducts.length,
          recommendedProducts: validResults.filter(r => r.conclusion === '强烈推荐').length,
          avgProfitRate: Math.round(validResults.reduce((sum, r) => sum + r.profitCalc.grossMargin, 0) / validResults.length),
          topCategory: requirement.category,
          riskLevel: validResults.some(r => r.risks.some(risk => risk.level === '高')) ? '高' : 
                     validResults.some(r => r.risks.some(risk => risk.level === '中')) ? '中' : '低',
        },
        recommendations: generateRecommendations(validResults, requirement),
      };

      setReport(newReport);
      setActiveTab('report');
      setIsLoading(false);
      toast.success('选品报告已生成');
    }, 2000);
  };

  // 生成建议
  function generateRecommendations(results: FeasibilityResult[], req: SelectionRequirement): string[] {
    const recs: string[] = [];
    
    const market = marketConfigs[req.market] || marketConfigs.id;
    const avgProfit = results.reduce((sum, r) => sum + r.profitCalc.grossMargin, 0) / results.length;

    if (avgProfit > 40) {
      recs.push('利润空间优秀，建议优先测试');
    }
    if (results.some(r => r.compliance.requiredCerts.length > 0)) {
      recs.push('部分商品需要认证，建议提前准备');
    }
    recs.push(`定价参考${market.name}市场同类商品，建议在 $${market.avgPrice} 区间`);
    recs.push('视频创意建议：场景化使用演示 + 痛点解决方案');
    recs.push('首批备货建议：每个SKU 50-100件，控制试错成本');
    recs.push('关注物流时效，建议选择7天内发货的供应商');

    return recs;
  }

  // 导出报告
  const handleExportReport = () => {
    if (!report) return;

    const market = marketConfigs[requirement.market] || marketConfigs.id;
    const content = `# 电商选品报告
> 生成时间: ${new Date(report.createdAt).toLocaleString('zh-CN')}
> 目标市场: ${market.name} (${market.flag})

## 一、选品需求

| 项目 | 选择 |
|------|------|
| 目标市场 | ${market.name} ${market.flag} |
| 类目偏好 | ${requirement.category} |
| 预算范围 | ${budgetRanges[requirement.budget]?.label || requirement.budget} |
| 核心诉求 | ${coreAppeals.find(c => c.value === requirement.coreAppeal)?.label || requirement.coreAppeal} |

## 二、选品方向

${report.directions.map(d => `
### ${d.icon} ${d.name}
- **推荐理由**: ${d.reason}
- **市场潜力**: ${d.marketPotential}%
- **竞争度**: ${d.competition}
- **预估利润率**: ${d.avgProfitRate}%
`).join('\n')}

## 三、候选商品

| 商品名称 | 售价 | 成本 | 月销量 | 竞争度 | 趋势 | 推荐指数 |
|---------|------|------|--------|--------|------|---------|
${report.products.map(p => `| ${p.name} | $${p.price} | $${p.costPrice} | ${p.monthlySales}+ | ${p.competition} | +${p.trend}% | ${'⭐'.repeat(p.recommendIndex)} |`).join('\n')}

## 四、可行性分析

${report.feasibility.map((f, i) => `
### ${i + 1}. ${f.product.name}

**综合评分**: ${f.overallScore.toFixed(0)}/100 | **结论**: ${f.conclusion}

#### 利润测算
| 项目 | 金额 |
|------|------|
| 售价 | $${f.profitCalc.sellingPrice.toFixed(2)} |
| 成本 | -$${f.profitCalc.cost.toFixed(2)} |
| 物流 | -$${f.profitCalc.logistics.toFixed(2)} |
| 佣金(${f.profitCalc.commission}%) | -$${(f.profitCalc.sellingPrice * f.profitCalc.commission / 100).toFixed(2)} |
| VAT(${f.profitCalc.vat}%) | -$${(f.profitCalc.sellingPrice * f.profitCalc.vat / 100).toFixed(2)} |
| **毛利** | **$${f.profitCalc.grossProfit.toFixed(2)} (${f.profitCalc.grossMargin.toFixed(1)}%)** |
| 广告费 | -$${f.profitCalc.adFee.toFixed(2)} |
| **净利润** | **$${f.profitCalc.netProfit.toFixed(2)} (${f.profitCalc.netMargin.toFixed(1)}%)** |

#### 合规状态
- **状态**: ${f.compliance.status}
${f.compliance.warnings.map(w => `- ⚠️ ${w}`).join('\n')}
${f.compliance.issues.map(i => `- ❌ ${i}`).join('\n')}

#### 风险评估
${f.risks.map(r => `- ${r.level === '高' ? '🔴' : r.level === '中' ? '🟡' : '🟢'} ${r.type}: ${r.suggestion}`).join('\n')}
`).join('\n')}

## 五、主要竞品

${competitors.map(c => `
### ${c.name}
- 卖家: ${c.seller}
- 价格: $${c.price.toFixed(2)} | 销量: ${c.sales}+ | 评分: ${c.rating}
- 卖点: ${c.mainSellingPoint}
- 用户痛点: ${c.userPainPoints.join(', ')}
`).join('\n')}

## 六、推荐供应商

${suppliers.slice(0, 3).map(s => `
### ${s.name}
- 评分: ${s.rating} ⭐ | 起订量: ${s.moq}件 | 价格: ${s.priceRange}
- 发货: ${s.deliveryDays}天 | ${s.isDropshipping ? '✅支持一件代发' : '❌不支持一件代发'}
- 认证: ${s.certifications.join(', ') || '无'}
`).join('\n')}

## 七、综合建议

${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
*本报告由龙掌柜智能运营系统生成*
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `选品报告_${market.name}_${new Date().toISOString().split('T')[0]}.md`;
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">选品智能体</h1>
            <p className="text-[#86909C] mt-1">AI驱动的智能选品分析，发现爆款商品</p>
          </div>
        </div>

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
                  <p className="text-sm text-[#86909C]">告诉我们您的选品偏好，AI将为您推荐最佳商品</p>
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
                      <p className="text-sm text-[#86909C]">基于您的需求，AI推荐了以下选品方向</p>
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
                            <span className="text-2xl">{direction.icon}</span>
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
                                style={{ width: `${direction.marketPotential}%` }}
                              />
                            </div>
                            <span className="text-[#165DFF] font-medium">{direction.marketPotential}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-2">
                          <span className="text-[#86909C]">预估利润率</span>
                          <span className="text-[#00B42A] font-medium">{direction.avgProfitRate}%</span>
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
                    挖掘中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    挖掘爆款商品
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
                      <p className="text-sm text-[#86909C]">发现 {hotProducts.length} 个潜在爆款商品，请选择要分析的 商品</p>
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
                              <span className="text-[#1D2129] font-medium">${product.price.toFixed(2)}</span>
                              <p className="text-xs text-[#86909C]">成本: ${product.costPrice.toFixed(2)}</p>
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
                                <span>{product.trend}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < product.recommendIndex ? 'text-[#FF7D00] fill-[#FF7D00]' : 'text-[#E5E6EB]'}`} 
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
                    分析中...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    开始可行性分析 ({selectedProducts.length}个)
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
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-6">利润测算结果</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {feasibilityResults.map((result, index) => (
                        <div key={result.product.id} className="p-4 border border-[#E5E6EB] rounded-lg">
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
                                <h4 className="font-medium text-[#1D2129]">{result.product.name}</h4>
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
                              <p className="text-2xl font-bold text-[#00B42A]">{result.overallScore.toFixed(0)}</p>
                              <p className="text-xs text-[#86909C]">综合评分</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                              <span className="text-[#86909C]">售价</span>
                              <span className="text-[#1D2129] font-medium">${result.profitCalc.sellingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                              <span className="text-[#86909C]">成本</span>
                              <span className="text-[#F53F3F]">-${result.profitCalc.cost.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                              <span className="text-[#86909C]">物流费</span>
                              <span className="text-[#F53F3F]">-${result.profitCalc.logistics.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                              <span className="text-[#86909C]">平台佣金({result.profitCalc.commission}%)</span>
                              <span className="text-[#F53F3F]">-${(result.profitCalc.sellingPrice * result.profitCalc.commission / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                              <span className="text-[#86909C]">VAT({result.profitCalc.vat}%)</span>
                              <span className="text-[#F53F3F]">-${(result.profitCalc.sellingPrice * result.profitCalc.vat / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-[#F2F3F5]">
                              <span className="text-[#86909C]">广告费(10%)</span>
                              <span className="text-[#FF7D00]">-${result.profitCalc.adFee.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 bg-[#E8FFEA] rounded-lg px-3 mt-2">
                              <span className="text-[#1D2129] font-medium">净利润</span>
                              <span className="text-[#00B42A] font-bold text-lg">
                                ${result.profitCalc.netProfit.toFixed(2)} ({result.profitCalc.netMargin.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* 合规检查 */}
              <TabsContent value="compliance" className="mt-6">
                <Card className="card-minimal">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-6">合规检查结果</h3>
                    <div className="space-y-4">
                      {feasibilityResults.map((result) => (
                        <div key={result.product.id} className="p-4 border border-[#E5E6EB] rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-[#1D2129]">{result.product.name}</h4>
                            <Badge className={
                              result.compliance.status === '合规' ? 'bg-[#E8FFEA] text-[#00B42A]' :
                              result.compliance.status === '需认证' ? 'bg-[#FFF7E6] text-[#FF7D00]' :
                              'bg-[#FFF2F0] text-[#F53F3F]'
                            }>
                              {result.compliance.status === '合规' ? <ShieldCheck className="w-3 h-3 mr-1" /> :
                               result.compliance.status === '需认证' ? <Shield className="w-3 h-3 mr-1" /> :
                               <ShieldAlert className="w-3 h-3 mr-1" />}
                              {result.compliance.status}
                            </Badge>
                          </div>
                          
                          {result.compliance.issues.length > 0 && (
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

                          {result.compliance.warnings.length > 0 && (
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

                          {result.compliance.requiredCerts.length > 0 && (
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
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* 风险评估 */}
              <TabsContent value="risk" className="mt-6">
                <Card className="card-minimal">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-6">风险评估结果</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {feasibilityResults.map((result) => (
                        <div key={result.product.id} className="p-4 border border-[#E5E6EB] rounded-lg">
                          <h4 className="font-medium text-[#1D2129] mb-4">{result.product.name}</h4>
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
                        </div>
                      ))}
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
                        <h3 className="text-lg font-semibold text-[#1D2129]">1688供应商推荐</h3>
                        <p className="text-sm text-[#86909C]">基于选品结果匹配优质供应商</p>
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
                                  {supplier.rating}
                                </span>
                                <span>起订量: {supplier.moq}件</span>
                                <span>发货: {supplier.deliveryDays}天</span>
                                <span>月销: {supplier.monthlyOrders}+</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#165DFF]">¥{supplier.price.toFixed(2)}</p>
                              <p className="text-xs text-[#86909C]">{supplier.priceRange}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {supplier.isDropshipping && (
                                  <Badge className="bg-[#E8FFEA] text-[#00B42A] text-xs">一件代发</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F2F3F5]">
                            <div className="flex items-center gap-2">
                              {supplier.certifications.map((cert, i) => (
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
                                navigator.clipboard.writeText(supplier.productUrl);
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
                    生成报告中...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    生成选品报告
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
                      <h2 className="text-lg font-semibold text-[#1D2129]">选品报告已生成</h2>
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
                  <h3 className="font-medium text-[#1D2129] mb-3">综合建议</h3>
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
                <h3 className="text-lg font-semibold text-[#1D2129] mb-4">推荐商品详情</h3>
                <div className="space-y-4">
                  {report.feasibility
                    .filter(r => r.conclusion === '强烈推荐')
                    .map((result, index) => (
                      <div key={result.product.id} className="p-4 border border-[#E5E6EB] rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-[#1D2129]">{result.product.name}</h4>
                              <Badge className="bg-[#E8FFEA] text-[#00B42A]">
                                <Award className="w-3 h-3 mr-1" />
                                TOP {index + 1}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#86909C] mb-3">{result.product.coreSellingPoint}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#00B42A]">{result.overallScore.toFixed(0)}</p>
                            <p className="text-xs text-[#86909C]">综合评分</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#F2F3F5]">
                          <div>
                            <p className="text-xs text-[#86909C]">售价</p>
                            <p className="font-medium">${result.profitCalc.sellingPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#86909C]">毛利</p>
                            <p className="font-medium text-[#00B42A]">{result.profitCalc.grossMargin.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#86909C]">月销量</p>
                            <p className="font-medium">{result.product.monthlySales}+</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#86909C]">供应商匹配</p>
                            <p className="font-medium">{result.supplyMatch}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
