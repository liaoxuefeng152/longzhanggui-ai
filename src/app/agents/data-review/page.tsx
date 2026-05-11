'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BarChart3,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Eye,
  Filter,
  Calendar,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Settings,
  Play,
  FileText,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface DailyMetric {
  date: string;
  sales: number;
  orders: number;
  profit: number;
  adSpend: number;
  roas: number;
  conversionRate: number;
}

interface ProductMetric {
  id: string;
  product_id: string;
  product_name: string;
  platform: string;
  sales: number;
  orders: number;
  profit: number;
  adSpend: number;
  roas: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  insight?: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'suggestion';
  title: string;
  description: string;
  impact: string;
  action: string;
  createdAt: string;
}

// 新增接口
interface ReportData {
  metrics: {
    dailyMetrics: DailyMetric[];
    productMetrics: ProductMetric[];
    summary: {
      totalSales: number;
      totalOrders: number;
      totalProfit: number;
      totalAdSpend: number;
      avgRoas: number;
      avgConversionRate: number;
    };
  };
  aiReport: string;
  insights: AIInsight[];
}

export default function DataReviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // 数据状态
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [productMetrics, setProductMetrics] = useState<ProductMetric[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  
  // 对话框状态
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 调用真实的API
      const response = await fetch('/api/v1/tools/data-review');
      const result = await response.json();
      
      if (result.success && result.data) {
        setDailyMetrics(result.data.metrics.dailyMetrics || []);
        setProductMetrics(result.data.metrics.productMetrics || []);
        setInsights(result.data.insights || []);
        toast.success('数据加载成功');
      } else {
        // API失败时使用模拟数据
        console.warn('API调用失败，使用模拟数据:', result.error);
        throw new Error(result.error || '获取数据失败');
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      toast.error('获取数据失败，使用示例数据');
      // 使用模拟数据作为兜底
      const mockDailyMetrics: DailyMetric[] = [
        { date: new Date().toISOString().split('T')[0], sales: 15680.50, orders: 42, profit: 2838.12, adSpend: 1568.05, roas: 2.8, conversionRate: 3.2 },
        { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], sales: 18450.00, orders: 51, profit: 3192.50, adSpend: 1845.00, roas: 3.1, conversionRate: 3.5 },
        { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], sales: 12350.80, orders: 35, profit: 2117.68, adSpend: 1235.08, roas: 2.5, conversionRate: 2.8 },
      ];
      
      const mockProductMetrics: ProductMetric[] = [
        { id: 'PM001', product_id: 'PROD001', product_name: '蓝牙耳机无线降噪', platform: 'tiktok', sales: 15680.50, orders: 42, profit: 2838.12, adSpend: 1568.05, roas: 2.8, conversionRate: 3.2, trend: 'up', insight: '销量持续增长，建议增加广告预算20%' },
        { id: 'PM002', product_id: 'PROD002', product_name: '宠物自动喂食器5L', platform: 'tiktok', sales: 12350.80, orders: 35, profit: 2117.68, adSpend: 1235.08, roas: 2.5, conversionRate: 3.5, trend: 'up', insight: '宠物品类表现优异' },
        { id: 'PM003', product_id: 'PROD003', product_name: '便携式榨汁机USB', platform: 'amazon', sales: 8920.00, orders: 28, profit: 1650.40, adSpend: 892.00, roas: 3.2, conversionRate: 4.1, trend: 'stable', insight: '表现稳定，可考虑拓展其他站点' },
        { id: 'PM004', product_id: 'PROD004', product_name: 'LED化妆镜台式带灯', platform: 'tiktok', sales: 5680.00, orders: 22, profit: 980.20, adSpend: 852.00, roas: 1.8, conversionRate: 2.2, trend: 'down', insight: 'ROAS偏低，建议优化图片和Listing' },
      ];
      
      const mockInsights: AIInsight[] = [
        { id: 'IN001', type: 'opportunity', title: '蓝牙耳机品类增长机会', description: '该商品ROAS达到2.8，建议扩大该品类的广告投入', impact: '预计可提升20%的销售额', action: '增加广告预算', createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16) },
        { id: 'IN002', type: 'warning', title: 'LED化妆镜ROAS过低', description: '该商品ROAS仅1.8，低于2.0的盈亏线', impact: '每月亏损约$150', action: '优化或下架', createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16) },
        { id: 'IN003', type: 'suggestion', title: 'TikTok平台扩展建议', description: '建议拓展至泰国、越南等站点', impact: '预计可提升30%的流量', action: '拓展新站点', createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16) },
      ];
      
      setDailyMetrics(mockDailyMetrics);
      setProductMetrics(mockProductMetrics);
      setInsights(mockInsights);
    } finally {
      setLoading(false);
    }
  };

  // 生成AI报告
  const handleGenerateReport = async (reportType: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    setReportLoading(true);
    setIsProcessing(true);
    try {
      toast.info('正在生成AI分析报告...', { description: '请稍候，这可能需要10-30秒' });
      
      // 调用真实的AI复盘API
      const response = await fetch('/api/v1/tools/data-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
          reportType,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 更新洞察
        if (result.data.insights && result.data.insights.length > 0) {
          setInsights(result.data.insights);
        }
        
        // 设置AI报告
        setAiReport(result.data.aiReport);
        
        // 切换到报告Tab显示
        setActiveTab('reports');
        
        toast.success('AI报告生成完成', { description: '已生成详细的运营分析报告' });
      } else {
        throw new Error(result.error || '生成报告失败');
      }
    } catch (error: any) {
      console.error('生成报告失败:', error);
      toast.error('生成报告失败', { description: error.message || '请稍后重试' });
    } finally {
      setReportLoading(false);
      setIsProcessing(false);
    }
  };

  // 导出数据
  const handleExportData = async () => {
    setIsProcessing(true);
    try {
      const headers = ['日期', '销售额', '订单数', '利润', '广告花费', 'ROAS', '转化率'];
      const rows = dailyMetrics.map(m => [
        m.date, m.sales.toFixed(2), m.orders, m.profit.toFixed(2), m.adSpend.toFixed(2), m.roas.toFixed(2), `${m.conversionRate}%`
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_review_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // 查看洞察详情
  const handleViewInsight = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setIsInsightOpen(true);
  };

  // 执行建议
  const handleExecuteAction = async (insight: AIInsight) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('操作已执行', { description: insight.action });
      setIsInsightOpen(false);
    } catch (error) {
      toast.error('执行失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const getInsightTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      opportunity: { label: '机会', className: 'bg-success/10 text-success', icon: TrendingUp },
      warning: { label: '警告', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
      suggestion: { label: '建议', className: 'bg-indigo-100 text-indigo-600', icon: Zap },
    };
    return config[type] || config.suggestion;
  };

  const getTrendBadge = (trend: string) => {
    const config: Record<string, { icon: any; className: string }> = {
      up: { icon: TrendingUp, className: 'text-success' },
      down: { icon: TrendingDown, className: 'text-destructive' },
      stable: { icon: Activity, className: 'text-muted-foreground' },
    };
    return config[trend] || config.stable;
  };

  // 汇总数据
  const totalSales = dailyMetrics.reduce((sum, m) => sum + m.sales, 0);
  const totalOrders = dailyMetrics.reduce((sum, m) => sum + m.orders, 0);
  const totalProfit = dailyMetrics.reduce((sum, m) => sum + m.profit, 0);
  const totalAdSpend = dailyMetrics.reduce((sum, m) => sum + m.adSpend, 0);
  const avgRoas = totalAdSpend > 0 ? totalSales / totalAdSpend : 0;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">数据复盘SKILL</h1>
              <p className="text-[14px] text-muted-foreground">数据分析 · AI洞察 · 运营优化 · 自动报告</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" onClick={handleExportData} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              导出
            </Button>
            <Button onClick={() => handleGenerateReport('weekly')} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              生成报告
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20">
            <Activity className="h-3 w-3 mr-1" />
            数据分析
          </Badge>
          <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20">
            <Zap className="h-3 w-3 mr-1" />
            AI洞察
          </Badge>
          <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20">
            <Target className="h-3 w-3 mr-1" />
            运营优化
          </Badge>
          <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20">
            <FileText className="h-3 w-3 mr-1" />
            自动报告
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] text-muted-foreground">总销售额</div>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div className="text-[24px] font-semibold text-success">${totalSales.toFixed(2)}</div>
              <div className="text-[11px] text-success mt-1">↑ 12.5% vs 上周</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] text-muted-foreground">订单数</div>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-[24px] font-semibold text-foreground">{totalOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">本周累计</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] text-muted-foreground">毛利润</div>
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <div className="text-[24px] font-semibold text-success">${totalProfit.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">利润率 {(totalProfit / totalSales * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] text-muted-foreground">广告花费</div>
              </div>
              <div className="text-[24px] font-semibold text-foreground">${totalAdSpend.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">占比 {(totalAdSpend / totalSales * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] text-muted-foreground">ROAS</div>
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-[24px] font-semibold text-foreground">{avgRoas.toFixed(2)}x</div>
              <div className="text-[11px] text-success mt-1">表现良好</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">数据概览</TabsTrigger>
            <TabsTrigger value="products">商品分析</TabsTrigger>
            <TabsTrigger value="insights">AI洞察</TabsTrigger>
            <TabsTrigger value="reports">报告中心</TabsTrigger>
            <TabsTrigger value="config">配置设置</TabsTrigger>
          </TabsList>

          {/* 数据概览 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 每日趋势 */}
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">销售趋势</CardTitle>
                  <CardDescription>近7天销售额与利润趋势</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dailyMetrics.map((metric) => (
                      <div key={metric.date} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="text-[13px] font-medium">{metric.date}</div>
                          <div className="text-[12px] text-muted-foreground">{metric.orders} 单</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[16px] font-semibold text-success">${metric.sales.toFixed(2)}</div>
                          <div className="text-[12px] text-muted-foreground">利润 ${metric.profit.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 关键指标 */}
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px]">关键指标</CardTitle>
                  <CardDescription>本周核心运营指标</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-muted-foreground">平均ROAS</span>
                        <span className="text-[20px] font-semibold text-foreground">{avgRoas.toFixed(2)}x</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="h-2 bg-success rounded-full" style={{ width: `${Math.min(avgRoas * 25, 100)}%` }} />
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-muted-foreground">广告花费占比</span>
                        <span className="text-[20px] font-semibold text-foreground">{(totalAdSpend / totalSales * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="h-2 bg-warning rounded-full" style={{ width: `${(totalAdSpend / totalSales * 100) * 2}%` }} />
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] text-muted-foreground">利润率</span>
                        <span className="text-[20px] font-semibold text-success">{(totalProfit / totalSales * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="h-2 bg-success rounded-full" style={{ width: `${(totalProfit / totalSales * 100) * 2}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 商品分析 */}
          <TabsContent value="products" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">商品表现分析</CardTitle>
                <CardDescription>各商品销售数据与AI优化建议</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    加载中...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productMetrics.map((product) => {
                      const TrendIcon = getTrendBadge(product.trend).icon;
                      return (
                        <div key={product.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[14px] font-medium text-foreground">{product.product_name}</span>
                                  <Badge variant="outline">{product.platform}</Badge>
                                  <TrendIcon className={`h-4 w-4 ${getTrendBadge(product.trend).className}`} />
                                </div>
                                <div className="flex items-center gap-6 text-[12px]">
                                  <span>销售: <span className="font-medium text-success">${product.sales.toFixed(2)}</span></span>
                                  <span>订单: <span className="font-medium">{product.orders}</span></span>
                                  <span>ROAS: <span className={`font-medium ${product.roas >= 2 ? 'text-success' : 'text-destructive'}`}>{product.roas.toFixed(2)}x</span></span>
                                  <span>转化率: <span className="font-medium">{product.conversionRate}%</span></span>
                                </div>
                                {product.insight && (
                                  <div className="text-[12px] text-indigo-600 flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {product.insight}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[16px] font-semibold text-success">${product.profit.toFixed(2)}</div>
                              <div className="text-[11px] text-muted-foreground">利润</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI洞察 */}
          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px]">AI运营洞察</CardTitle>
                <CardDescription>基于数据分析生成的智能建议</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight) => {
                    const config = getInsightTypeBadge(insight.type);
                    const Icon = config.icon;
                    return (
                      <div 
                        key={insight.id} 
                        className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleViewInsight(insight)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${insight.type === 'opportunity' ? 'bg-success/10' : insight.type === 'warning' ? 'bg-destructive/10' : 'bg-indigo-100'}`}>
                              <Icon className={`h-5 w-5 ${config.className.split(' ')[1]}`} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-foreground">{insight.title}</span>
                                <Badge variant="outline" className={config.className}>{config.label}</Badge>
                              </div>
                              <div className="text-[12px] text-muted-foreground">{insight.description}</div>
                              <div className="text-[12px] text-indigo-600">影响: {insight.impact}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              查看
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 报告中心 */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleGenerateReport('daily')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium">日报</div>
                      <div className="text-[12px] text-muted-foreground">今日运营数据汇总</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" disabled={reportLoading} onClick={(e) => { e.stopPropagation(); handleGenerateReport('daily'); }}>
                    {reportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    生成报告
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleGenerateReport('weekly')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium">周报</div>
                      <div className="text-[12px] text-muted-foreground">本周运营数据汇总</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" disabled={reportLoading} onClick={(e) => { e.stopPropagation(); handleGenerateReport('weekly'); }}>
                    {reportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    生成报告
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleGenerateReport('monthly')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium">月报</div>
                      <div className="text-[12px] text-muted-foreground">本月详细分析报告</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" disabled={reportLoading} onClick={(e) => { e.stopPropagation(); handleGenerateReport('monthly'); }}>
                    {reportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    生成报告
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* AI报告展示 */}
            {aiReport && (
              <Card className="bg-white border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[15px] flex items-center gap-2">
                        <Zap className="h-4 w-4 text-indigo-600" />
                        AI运营分析报告
                      </CardTitle>
                      <CardDescription>基于数据分析生成的智能洞察</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(aiReport);
                      toast.success('报告已复制到剪贴板');
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      复制
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg">
                    <pre className="whitespace-pre-wrap text-[13px] font-sans text-foreground leading-relaxed">
                      {aiReport}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 配置设置 */}
          <TabsContent value="config" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">SKILL配置</CardTitle>
                <CardDescription>模型选择、分析维度、报告模板配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">调用模型</div>
                      <div className="text-[11px] text-muted-foreground">当前使用豆包-Pro进行数据分析</div>
                    </div>
                    <select className="px-4 py-2 border border-border rounded-md text-[14px]">
                      <option value="doubao-pro">豆包-Pro</option>
                      <option value="deepseek">DeepSeek-V3</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">自动报告</div>
                      <div className="text-[11px] text-muted-foreground">每周一自动生成上周运营报告</div>
                    </div>
                    <Badge className="bg-success text-white">已开启</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 洞察详情对话框 */}
        <Dialog open={isInsightOpen} onOpenChange={setIsInsightOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedInsight?.title}</DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className={getInsightTypeBadge(selectedInsight?.type || 'suggestion').className}>
                  {getInsightTypeBadge(selectedInsight?.type || 'suggestion').label}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            {selectedInsight && (
              <div className="space-y-4 py-4">
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">分析描述</div>
                  <div className="text-[14px]">{selectedInsight.description}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">预期影响</div>
                  <div className="text-[14px] text-indigo-600">{selectedInsight.impact}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground mb-1">建议操作</div>
                  <div className="p-3 bg-muted/30 rounded-lg text-[14px]">{selectedInsight.action}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">生成时间: {selectedInsight.createdAt}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInsightOpen(false)}>关闭</Button>
              <Button onClick={() => handleExecuteAction(selectedInsight!)} disabled={isProcessing}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                执行建议
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
