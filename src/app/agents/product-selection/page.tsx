'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Search,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  Package,
  DollarSign,
  Clock,
  Filter,
  Download,
  Eye,
  ChevronRight,
  Zap,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { selectProducts, SelectedProduct, analyzeCompetition } from '@/lib/api/ai-agents';

interface Product {
  id: string;
  name: string;
  category: string;
  platform: 'TK' | 'Amazon';
  salesTrend: number;
  profitMargin: number;
  complianceStatus: 'passed' | 'failed' | 'pending';
  supplyChain: 'matched' | 'unmatched' | 'checking';
  purchaseCycle: number;
  stockCostRatio: number;
  predictedProfit: number;
  selectedAt: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'inactive';
  checkCount: number;
  passRate: number;
}

const mockProducts: Product[] = [
  {
    id: 'P001',
    name: '宠物自动喂食器 5L大容量',
    category: '宠物用品',
    platform: 'TK',
    salesTrend: 89.5,
    profitMargin: 42.3,
    complianceStatus: 'passed',
    supplyChain: 'matched',
    purchaseCycle: 5,
    stockCostRatio: 28,
    predictedProfit: 68.5,
    selectedAt: '2026-03-21 14:30',
  },
  {
    id: 'P002',
    name: '便携式榨汁机 USB充电',
    category: '家居电器',
    platform: 'Amazon',
    salesTrend: 76.2,
    profitMargin: 38.7,
    complianceStatus: 'passed',
    supplyChain: 'matched',
    purchaseCycle: 7,
    stockCostRatio: 32,
    predictedProfit: 52.3,
    selectedAt: '2026-03-21 13:15',
  },
  {
    id: 'P003',
    name: '智能手环 运动监测',
    category: '电子数码',
    platform: 'TK',
    salesTrend: 92.1,
    profitMargin: 35.8,
    complianceStatus: 'failed',
    supplyChain: 'unmatched',
    purchaseCycle: 12,
    stockCostRatio: 45,
    predictedProfit: 28.9,
    selectedAt: '2026-03-21 12:00',
  },
  {
    id: 'P004',
    name: 'LED化妆镜 台式带灯',
    category: '美妆工具',
    platform: 'Amazon',
    salesTrend: 68.4,
    profitMargin: 45.2,
    complianceStatus: 'passed',
    supplyChain: 'matched',
    purchaseCycle: 4,
    stockCostRatio: 25,
    predictedProfit: 78.6,
    selectedAt: '2026-03-21 11:45',
  },
];

const complianceRules: ComplianceRule[] = [
  { id: 'CR001', name: 'TK禁售品类过滤', platform: 'TK', status: 'active', checkCount: 1250, passRate: 99.2 },
  { id: 'CR002', name: 'Amazon类目审核检测', platform: 'Amazon', status: 'active', checkCount: 980, passRate: 97.8 },
  { id: 'CR003', name: '宗教/敏感品类过滤', platform: 'TK', status: 'active', checkCount: 1250, passRate: 100 },
  { id: 'CR004', name: '品牌授权检测', platform: '全平台', status: 'active', checkCount: 2230, passRate: 98.5 },
];

export default function SelectionAgentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'processing'>('online');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 启动AI选品
  const handleStartSelection = async () => {
    setIsStarting(true);
    setAgentStatus('processing');

    try {
      const result = await selectProducts({
        platform: 'tiktok',
        site: 'id',
        count: 10,
        min_profit_rate: 0.3,
      });
      
      if (result.success && result.data) {
        // 将API返回的数据转换为页面展示格式
        const newProducts: Product[] = result.data.map((item, index) => ({
          id: item.id || `P${Date.now()}-${index}`,
          name: item.name,
          category: item.category || '其他',
          platform: item.platform?.toUpperCase() === 'AMAZON' ? 'Amazon' : 'TK',
          salesTrend: item.sales_trend || 0,
          profitMargin: item.profit_margin || 0,
          complianceStatus: item.compliance_status as 'passed' | 'failed' | 'pending' || 'passed',
          supplyChain: item.supply_chain as 'matched' | 'unmatched' | 'checking' || 'matched',
          purchaseCycle: item.purchase_cycle || 7,
          stockCostRatio: item.stock_cost_ratio || 30,
          predictedProfit: item.predicted_profit || 0,
          selectedAt: new Date().toLocaleString('zh-CN'),
        }));
        
        setProducts(newProducts);
        toast.success(`选品完成！共发现 ${newProducts.length} 个潜力商品`);
      }
    } catch (error: any) {
      console.error('启动选品失败:', error);
      toast.error(error.message || '启动选品失败');
    } finally {
      setIsStarting(false);
      setAgentStatus('online');
    }
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      passed: { label: '合规通过', className: 'bg-success/10 text-success border-success/20' },
      failed: { label: '合规失败', className: 'bg-destructive/10 text-destructive border-destructive/20' },
      pending: { label: '待校验', className: 'bg-warning/10 text-warning border-warning/20' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getSupplyChainBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      matched: { label: '供应链匹配', className: 'bg-success/10 text-success border-success/20' },
      unmatched: { label: '供应链不匹配', className: 'bg-destructive/10 text-destructive border-destructive/20' },
      checking: { label: '校验中', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status] || config.checking;
    return <Badge variant="outline" className={className}>{label}</Badge>;
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
              <h1 className="text-[18px] font-semibold text-foreground">选品智能体</h1>
              <p className="text-[14px] text-muted-foreground">爆款挖掘 · 竞品分析 · 利润核算 · 合规+供应链校验</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={agentStatus === 'online' ? 'bg-success text-white' : 'bg-warning text-white'}>
              {agentStatus === 'online' ? '在线运行' : agentStatus === 'processing' ? '处理中' : '离线'}
            </Badge>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button 
              onClick={handleStartSelection}
              disabled={isStarting || agentStatus === 'processing'}
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  启动中...
                </>
              ) : agentStatus === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  选品中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  启动选品
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            合规校验
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Package className="h-3 w-3 mr-1" />
            供应链匹配
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <DollarSign className="h-3 w-3 mr-1" />
            利润核算
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            爆款挖掘
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">今日选品</div>
              <div className="text-[24px] font-semibold text-foreground">156</div>
              <div className="text-[11px] text-success mt-1">↑ 23% vs 昨日</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">合规通过率</div>
              <div className="text-[24px] font-semibold text-success">99.2%</div>
              <div className="text-[11px] text-muted-foreground mt-1">TK/Amazon双平台</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">供应链匹配率</div>
              <div className="text-[24px] font-semibold text-foreground">87.3%</div>
              <div className="text-[11px] text-muted-foreground mt-1">采购周期≤7天</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">平均利润率</div>
              <div className="text-[24px] font-semibold text-foreground">42.5%</div>
              <div className="text-[11px] text-muted-foreground mt-1">库存成本≤30%</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">模型调用</div>
              <div className="text-[24px] font-semibold text-foreground">1,850</div>
              <div className="text-[11px] text-muted-foreground mt-1">豆包-Seed-1.8</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">选品概览</TabsTrigger>
            <TabsTrigger value="compliance">合规规则库</TabsTrigger>
            <TabsTrigger value="supply">供应链校验</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 选品概览 */}
          <TabsContent value="overview" className="space-y-4">
            {/* 筛选条件 */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索商品名称、品类..."
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">全部平台</option>
                    <option value="TK">TK东南亚</option>
                    <option value="Amazon">亚马逊</option>
                  </select>
                  <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">合规状态</option>
                    <option value="passed">已通过</option>
                    <option value="failed">未通过</option>
                    <option value="pending">待校验</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    高级筛选
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 商品列表 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">选品清单</CardTitle>
                <CardDescription>仅展示合规+供应链匹配的商品，剔除不合格商品</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-medium text-foreground">{product.name}</span>
                              <Badge variant="outline" className="text-[11px]">{product.category}</Badge>
                              <Badge variant="outline" className="text-[11px]">{product.platform}</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              {getComplianceBadge(product.complianceStatus)}
                              {getSupplyChainBadge(product.supplyChain)}
                            </div>
                            <div className="flex items-center gap-6 text-[12px] text-muted-foreground">
                              <span>销售趋势: <span className="text-success font-medium">{product.salesTrend}%</span></span>
                              <span>利润率: <span className="text-foreground font-medium">{product.profitMargin}%</span></span>
                              <span>采购周期: <span className="text-foreground font-medium">{product.purchaseCycle}天</span></span>
                              <span>库存成本占比: <span className="text-foreground font-medium">{product.stockCostRatio}%</span></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-[20px] font-semibold text-success">¥{product.predictedProfit}</div>
                          <div className="text-[11px] text-muted-foreground">预估利润/件</div>
                          <div className="flex items-center gap-2 mt-3">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              详情
                            </Button>
                            <Button size="sm">
                              <Zap className="h-3 w-3 mr-1" />
                              触发生成
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 合规规则库 */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">平台合规规则</CardTitle>
                  <CardDescription>TK/亚马逊禁售词、禁售品类、合规规则库</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complianceRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-foreground">{rule.name}</div>
                            <div className="text-[11px] text-muted-foreground">{rule.platform} · {rule.checkCount}次校验</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[14px] font-semibold text-success">{rule.passRate}%</div>
                          <div className="text-[11px] text-muted-foreground">通过率</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">合规校验流程</CardTitle>
                  <CardDescription>执行前必须完成合规校验，不通过则禁止后续操作</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">1</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">禁售品类过滤</div>
                        <div className="text-[11px] text-muted-foreground">自动过滤TK/亚马逊禁售品类、需类目审核未开放的商品</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">2</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">品牌授权检测</div>
                        <div className="text-[11px] text-muted-foreground">识别知名品牌，未授权自动剔除</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">3</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">价格异常告警</div>
                        <div className="text-[11px] text-muted-foreground">低于成本价×0.8或高于均价×3则告警</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-medium">4</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-foreground">宗教/敏感过滤</div>
                        <div className="text-[11px] text-muted-foreground">TK东南亚站点专属：过滤宗教/敏感品类</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 供应链校验 */}
          <TabsContent value="supply" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">供应链匹配校验</CardTitle>
                <CardDescription>筛选采购周期≤7天、库存成本≤预估售价30%的商品</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">采购周期</div>
                    <div className="text-[20px] font-semibold text-success">≤7天</div>
                    <div className="text-[11px] text-muted-foreground">快速周转</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">库存成本占比</div>
                    <div className="text-[20px] font-semibold text-success">≤30%</div>
                    <div className="text-[11px] text-muted-foreground">利润保障</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-[13px] font-medium text-foreground">匹配成功率</div>
                    <div className="text-[20px] font-semibold text-success">87.3%</div>
                    <div className="text-[11px] text-muted-foreground">本周数据</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 配置设置 */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">智能体配置</CardTitle>
                <CardDescription>模型选择、Prompt模板、调用参数配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">当前使用豆包-Seed-1.8进行选品分析</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="doubao">豆包-Seed-1.8</option>
                      <option value="deepseek">DeepSeek-V3</option>
                      <option value="kimi">Kimi</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">Prompt模板</div>
                      <div className="text-[11px] text-muted-foreground">选品智能体专属Prompt模板</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      编辑模板
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">数据源配置</div>
                      <div className="text-[11px] text-muted-foreground">选品工具API + ERP库存/采购数据 + 平台合规规则库</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      配置数据源
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
