'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  DollarSign,
  Target,
  History,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  Edit3,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CompetitorProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  source: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  salesVolume?: number;
}

interface PriceAdjustment {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  changePercent: number;
  reason: string;
  profitBefore: number;
  profitAfter: number;
  profitRateBefore: number;
  profitRateAfter: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: string;
  executedAt?: string;
  executor?: string;
}

interface PricingSuggestion {
  id: string;
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  change: number;
  changePercent: number;
  reason: string;
  profitRate: number;
  minProfitRate: number;
  urgency: 'high' | 'medium' | 'low';
  competitorPrice?: number;
  riskLevel: 'safe' | 'warning' | 'danger';
}

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  profit: number;
  profitRate: number;
  competitors: CompetitorProduct[];
  lastPricingDate: string;
  status: 'healthy' | 'warning' | 'danger';
}

// 模拟数据
const mockProducts: Product[] = [
  {
    id: 'P001',
    name: '便携充电宝 20000mAh',
    sku: 'SKU-P001',
    costPrice: 45,
    sellingPrice: 159,
    profit: 114,
    profitRate: 71.7,
    competitors: [
      { id: 'C1', name: '竞品A', price: 149, currency: 'CNY', source: 'shopee', lastUpdated: '2024-01-15 10:30', trend: 'down' },
      { id: 'C2', name: '竞品B', price: 165, currency: 'CNY', source: 'lazada', lastUpdated: '2024-01-15 09:15', trend: 'up' },
    ],
    lastPricingDate: '2024-01-10',
    status: 'healthy',
  },
  {
    id: 'P002',
    name: '无线蓝牙耳机',
    sku: 'SKU-P002',
    costPrice: 68,
    sellingPrice: 128,
    profit: 60,
    profitRate: 46.9,
    competitors: [
      { id: 'C3', name: '竞品C', price: 118, currency: 'CNY', source: 'tiktok', lastUpdated: '2024-01-15 11:00', trend: 'down' },
      { id: 'C4', name: '竞品D', price: 135, currency: 'CNY', source: 'shopee', lastUpdated: '2024-01-15 08:45', trend: 'stable' },
    ],
    lastPricingDate: '2024-01-12',
    status: 'warning',
  },
  {
    id: 'P003',
    name: '智能手环运动手表',
    sku: 'SKU-P003',
    costPrice: 120,
    sellingPrice: 199,
    profit: 79,
    profitRate: 39.7,
    competitors: [
      { id: 'C5', name: '竞品E', price: 189, currency: 'CNY', source: 'shopee', lastUpdated: '2024-01-15 12:00', trend: 'down' },
    ],
    lastPricingDate: '2024-01-08',
    status: 'danger',
  },
];

const mockAdjustments: PriceAdjustment[] = [
  {
    id: 'A001',
    productId: 'P001',
    productName: '便携充电宝 20000mAh',
    oldPrice: 169,
    newPrice: 159,
    change: -10,
    changePercent: -5.9,
    reason: '竞品降价，需跟进保持竞争力',
    profitBefore: 124,
    profitAfter: 114,
    profitRateBefore: 73.4,
    profitRateAfter: 71.7,
    status: 'executed',
    createdAt: '2024-01-14 09:30',
    executedAt: '2024-01-14 09:35',
    executor: '系统自动',
  },
  {
    id: 'A002',
    productId: 'P002',
    productName: '无线蓝牙耳机',
    oldPrice: 138,
    newPrice: 128,
    change: -10,
    changePercent: -7.2,
    reason: '竞品大幅降价，需抢占市场',
    profitBefore: 70,
    profitAfter: 60,
    profitRateBefore: 50.7,
    profitRateAfter: 46.9,
    status: 'pending',
    createdAt: '2024-01-15 10:00',
  },
  {
    id: 'A003',
    productId: 'P003',
    productName: '智能手环运动手表',
    oldPrice: 199,
    newPrice: 189,
    change: -10,
    changePercent: -5.0,
    reason: '利润空间充足，可适当降价提升销量',
    profitBefore: 79,
    profitAfter: 69,
    profitRateBefore: 39.7,
    profitRateAfter: 36.5,
    status: 'rejected',
    createdAt: '2024-01-13 14:20',
  },
];

export default function PricingAgentPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [adjustments, setAdjustments] = useState<PriceAdjustment[]>(mockAdjustments);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
  
  // 调价弹窗
  const [adjustmentDialog, setAdjustmentDialog] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    newPrice: '',
    reason: '',
  });

  // 计算调价建议
  const generateSuggestions = () => {
    const newSuggestions: PricingSuggestion[] = [];
    
    products.forEach(product => {
      if (product.competitors.length === 0) return;
      
      const lowestCompetitorPrice = Math.min(...product.competitors.map(c => c.price));
      const highestCompetitorPrice = Math.max(...product.competitors.map(c => c.price));
      
      // 成本底线：保本 + 10% 利润
      const costFloor = product.costPrice * 1.1;
      // 安全线：保本 + 20% 利润
      const costSafe = product.costPrice * 1.2;
      // 建议线：保本 + 目标利润
      const targetProfitRate = 0.30;
      const targetPrice = product.costPrice * (1 + targetProfitRate);
      
      // 计算最低可执行价格（利润 >= 15%）
      const minProfitRate = 0.15;
      const minAllowedPrice = product.costPrice * (1 + minProfitRate);
      
      // 如果竞品价格低于安全线
      if (lowestCompetitorPrice < costSafe) {
        // 检查是否能降价
        if (lowestCompetitorPrice >= minAllowedPrice) {
          const newProfitRate = (lowestCompetitorPrice - product.costPrice) / lowestCompetitorPrice;
          newSuggestions.push({
            id: `SUG-${product.id}-1`,
            productId: product.id,
            productName: product.name,
            currentPrice: product.sellingPrice,
            suggestedPrice: lowestCompetitorPrice,
            change: lowestCompetitorPrice - product.sellingPrice,
            changePercent: ((lowestCompetitorPrice - product.sellingPrice) / product.sellingPrice) * 100,
            reason: '竞品降价，跟进保持竞争力',
            profitRate: newProfitRate * 100,
            minProfitRate: minProfitRate * 100,
            urgency: product.status === 'danger' ? 'high' : 'medium',
            competitorPrice: lowestCompetitorPrice,
            riskLevel: newProfitRate >= 0.20 ? 'safe' : newProfitRate >= 0.15 ? 'warning' : 'danger',
          });
        } else {
          // 降价会导致亏损，建议提价或其他策略
          newSuggestions.push({
            id: `SUG-${product.id}-2`,
            productId: product.id,
            productName: product.name,
            currentPrice: product.sellingPrice,
            suggestedPrice: targetPrice,
            change: targetPrice - product.sellingPrice,
            changePercent: ((targetPrice - product.sellingPrice) / product.sellingPrice) * 100,
            reason: '竞品价格过低，建议差异化定价',
            profitRate: targetProfitRate * 100,
            minProfitRate: minProfitRate * 100,
            urgency: 'low',
            competitorPrice: lowestCompetitorPrice,
            riskLevel: 'safe',
          });
        }
      }
      
      // 如果当前价格远高于竞品，考虑降价
      if (product.sellingPrice > highestCompetitorPrice * 1.1) {
        const suggestedPrice = highestCompetitorPrice * 0.98;
        if (suggestedPrice >= minAllowedPrice) {
          newSuggestions.push({
            id: `SUG-${product.id}-3`,
            productId: product.id,
            productName: product.name,
            currentPrice: product.sellingPrice,
            suggestedPrice: Math.round(suggestedPrice),
            change: Math.round(suggestedPrice - product.sellingPrice),
            changePercent: ((suggestedPrice - product.sellingPrice) / product.sellingPrice) * 100,
            reason: '价格高于竞品，可适当降价提升竞争力',
            profitRate: ((suggestedPrice - product.costPrice) / suggestedPrice) * 100,
            minProfitRate: minProfitRate * 100,
            urgency: 'low',
            competitorPrice: highestCompetitorPrice,
            riskLevel: 'safe',
          });
        }
      }
    });
    
    setSuggestions(newSuggestions);
  };

  useEffect(() => {
    generateSuggestions();
  }, [products]);

  // 执行调价
  const handleExecuteAdjustment = async (suggestion: PricingSuggestion) => {
    setSelectedProduct(products.find(p => p.id === suggestion.productId) || null);
    setAdjustmentForm({
      newPrice: suggestion.suggestedPrice.toString(),
      reason: suggestion.reason,
    });
    setAdjustmentDialog(true);
  };

  const confirmAdjustment = () => {
    if (!selectedProduct || !adjustmentForm.newPrice) return;
    
    const newPrice = parseFloat(adjustmentForm.newPrice);
    const minAllowedPrice = selectedProduct.costPrice * 1.15;
    
    if (newPrice < minAllowedPrice) {
      toast.error('调价后利润低于15%，禁止执行！');
      return;
    }

    const newProfit = newPrice - selectedProduct.costPrice;
    const newProfitRate = (newProfit / newPrice) * 100;

    const adjustment: PriceAdjustment = {
      id: `A${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      oldPrice: selectedProduct.sellingPrice,
      newPrice: newPrice,
      change: newPrice - selectedProduct.sellingPrice,
      changePercent: ((newPrice - selectedProduct.sellingPrice) / selectedProduct.sellingPrice) * 100,
      reason: adjustmentForm.reason,
      profitBefore: selectedProduct.profit,
      profitAfter: newProfit,
      profitRateBefore: selectedProduct.profitRate,
      profitRateAfter: newProfitRate,
      status: newProfitRate >= 0.20 ? 'executed' : 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      executor: newProfitRate >= 0.20 ? '系统自动' : undefined,
    };

    setAdjustments([adjustment, ...adjustments]);
    
    // 更新产品
    setProducts(products.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, sellingPrice: newPrice, profit: newProfit, profitRate: newProfitRate }
        : p
    ));

    toast.success(newProfitRate >= 0.20 ? '调价已执行' : '调价已提交，等待审批');
    setAdjustmentDialog(false);
  };

  // 审批调价
  const approveAdjustment = (id: string) => {
    setAdjustments(adjustments.map(a => 
      a.id === id 
        ? { ...a, status: 'executed', executedAt: new Date().toISOString().replace('T', ' ').substring(0, 16), executor: '管理员审批' }
        : a
    ));
    toast.success('调价已审批执行');
  };

  const rejectAdjustment = (id: string) => {
    setAdjustments(adjustments.map(a => 
      a.id === id ? { ...a, status: 'rejected' } : a
    ));
    toast.success('调价已拒绝');
  };

  // 统计数据
  const stats = {
    totalProducts: products.length,
    healthy: products.filter(p => p.status === 'healthy').length,
    warning: products.filter(p => p.status === 'warning').length,
    danger: products.filter(p => p.status === 'danger').length,
    pendingAdjustments: adjustments.filter(a => a.status === 'pending').length,
    urgentSuggestions: suggestions.filter(s => s.urgency === 'high').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-green-600" />
            智能定价
          </h1>
          <p className="text-muted-foreground mt-1">
            盈亏保护 · 竞品监控 · 智能调价
          </p>
        </div>
        <Button onClick={generateSuggestions} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          刷新分析
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">商品监控</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">个商品</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">健康</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
            <p className="text-xs text-muted-foreground">利润 &gt; 30%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">预警</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            <p className="text-xs text-muted-foreground">利润 15-30%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">危险</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.danger}</div>
            <p className="text-xs text-muted-foreground">利润 &lt; 15%</p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monitor" className="gap-2">
            <Eye className="h-4 w-4" />
            竞品监控
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            调价建议
            {stats.urgentSuggestions > 0 && (
              <Badge variant="destructive" className="ml-1">{stats.urgentSuggestions}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="adjustments" className="gap-2">
            <History className="h-4 w-4" />
            调价记录
            {stats.pendingAdjustments > 0 && (
              <Badge variant="default" className="ml-1 bg-yellow-500">{stats.pendingAdjustments}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            规则设置
          </TabsTrigger>
        </TabsList>

        {/* 竞品监控 */}
        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>商品盈亏监控</CardTitle>
              <CardDescription>实时监控商品利润空间，识别需要调价的商品</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品</TableHead>
                    <TableHead>成本</TableHead>
                    <TableHead>售价</TableHead>
                    <TableHead>利润</TableHead>
                    <TableHead>利润率</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>竞品数</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>¥{product.costPrice}</TableCell>
                      <TableCell className="font-medium">¥{product.sellingPrice}</TableCell>
                      <TableCell className={product.profit > 50 ? 'text-green-600' : 'text-orange-600'}>
                        ¥{product.profit}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full ${
                            product.profitRate >= 30 ? 'bg-green-500' :
                            product.profitRate >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            <div 
                              className={`h-full rounded-full ${
                                product.profitRate >= 30 ? 'bg-green-500' :
                                product.profitRate >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(product.profitRate, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm ${
                            product.profitRate >= 30 ? 'text-green-600' :
                            product.profitRate >= 15 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {product.profitRate.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          product.status === 'healthy' ? 'default' :
                          product.status === 'warning' ? 'secondary' : 'destructive'
                        } className={
                          product.status === 'healthy' ? 'bg-green-100 text-green-800' :
                          product.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }>
                          {product.status === 'healthy' ? '健康' :
                           product.status === 'warning' ? '预警' : '危险'}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.competitors.length}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedProduct(product);
                          setActiveTab('suggestions');
                        }}>
                          查看竞品
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 竞品详情 */}
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle>竞品分析 - {selectedProduct.name}</CardTitle>
                <CardDescription>当前售价 ¥{selectedProduct.sellingPrice} | 利润 ¥{selectedProduct.profit}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>竞品</TableHead>
                      <TableHead>价格</TableHead>
                      <TableHead>趋势</TableHead>
                      <TableHead>差价</TableHead>
                      <TableHead>来源</TableHead>
                      <TableHead>更新时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProduct.competitors.map(comp => (
                      <TableRow key={comp.id}>
                        <TableCell className="font-medium">{comp.name}</TableCell>
                        <TableCell className="font-medium">¥{comp.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {comp.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-600" />}
                            {comp.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-600" />}
                            {comp.trend === 'stable' && <span className="text-muted-foreground">-</span>}
                            <span className={
                              comp.trend === 'up' ? 'text-red-600' :
                              comp.trend === 'down' ? 'text-green-600' : ''
                            }>
                              {comp.trend === 'up' ? '涨' : comp.trend === 'down' ? '跌' : '稳'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className={
                          comp.price < selectedProduct.sellingPrice ? 'text-red-600' :
                          comp.price > selectedProduct.sellingPrice ? 'text-green-600' : ''
                        }>
                          {comp.price - selectedProduct.sellingPrice > 0 ? '+' : ''}{comp.price - selectedProduct.sellingPrice}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{comp.source}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{comp.lastUpdated}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 调价建议 */}
        <TabsContent value="suggestions" className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">暂无调价建议</h3>
                <p className="text-muted-foreground mt-1">所有商品利润空间良好，无需调价</p>
              </CardContent>
            </Card>
          ) : (
            suggestions.map(suggestion => (
              <Card key={suggestion.id} className={
                suggestion.urgency === 'high' ? 'border-red-200 bg-red-50' :
                suggestion.urgency === 'medium' ? 'border-yellow-200 bg-yellow-50' : ''
              }>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{suggestion.productName}</h3>
                        <Badge variant={
                          suggestion.urgency === 'high' ? 'destructive' :
                          suggestion.urgency === 'medium' ? 'default' : 'secondary'
                        }>
                          {suggestion.urgency === 'high' ? '紧急' :
                           suggestion.urgency === 'medium' ? '建议' : '可选'}
                        </Badge>
                        <Badge variant={
                          suggestion.riskLevel === 'safe' ? 'default' :
                          suggestion.riskLevel === 'warning' ? 'secondary' : 'destructive'
                        } className={
                          suggestion.riskLevel === 'safe' ? 'bg-green-100 text-green-800' :
                          suggestion.riskLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }>
                          {suggestion.riskLevel === 'safe' ? '安全' :
                           suggestion.riskLevel === 'warning' ? '注意' : '禁止'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">当前价格</div>
                      <div className="text-lg font-bold">¥{suggestion.currentPrice}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">建议价格</div>
                      <div className="text-lg font-bold text-blue-600">¥{suggestion.suggestedPrice}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">调整幅度</div>
                      <div className={`text-lg font-bold ${suggestion.change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {suggestion.change > 0 ? '+' : ''}{suggestion.change} ({suggestion.changePercent.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">调后利润率</div>
                      <div className={`text-lg font-bold ${
                        suggestion.profitRate >= 20 ? 'text-green-600' :
                        suggestion.profitRate >= 15 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {suggestion.profitRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">最低 {suggestion.minProfitRate}%</div>
                    </div>
                  </div>

                  {suggestion.competitorPrice && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        <span className="text-muted-foreground">竞品最低价：</span>
                        <span className="font-medium">¥{suggestion.competitorPrice}</span>
                        <span className="text-muted-foreground ml-2">
                          (当前价格比竞品高 ¥{(suggestion.currentPrice - suggestion.competitorPrice).toFixed(0)})
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(products.find(p => p.id === suggestion.productId) || null);
                        setAdjustmentForm({ newPrice: suggestion.suggestedPrice.toString(), reason: suggestion.reason });
                        setAdjustmentDialog(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      手动调整
                    </Button>
                    {suggestion.riskLevel !== 'danger' ? (
                      <Button onClick={() => handleExecuteAdjustment(suggestion)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        执行调价
                      </Button>
                    ) : (
                      <Button disabled>
                        <XCircle className="h-4 w-4 mr-1" />
                        禁止调价
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* 调价记录 */}
        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>调价历史</CardTitle>
              <CardDescription>查看所有调价操作记录和审批状态</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead>原价</TableHead>
                    <TableHead>新价</TableHead>
                    <TableHead>调整</TableHead>
                    <TableHead>调前利润</TableHead>
                    <TableHead>调后利润</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map(adj => (
                    <TableRow key={adj.id}>
                      <TableCell className="text-sm">{adj.createdAt}</TableCell>
                      <TableCell className="font-medium">{adj.productName}</TableCell>
                      <TableCell>¥{adj.oldPrice}</TableCell>
                      <TableCell className="font-medium">¥{adj.newPrice}</TableCell>
                      <TableCell className={adj.change < 0 ? 'text-red-600' : 'text-green-600'}>
                        {adj.change > 0 ? '+' : ''}{adj.change} ({adj.changePercent.toFixed(1)}%)
                      </TableCell>
                      <TableCell>
                        <span className={adj.profitRateBefore >= 20 ? 'text-green-600' : adj.profitRateBefore >= 15 ? 'text-yellow-600' : 'text-red-600'}>
                          ¥{adj.profitBefore.toFixed(0)} ({adj.profitRateBefore.toFixed(1)}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={adj.profitRateAfter >= 20 ? 'text-green-600' : adj.profitRateAfter >= 15 ? 'text-yellow-600' : 'text-red-600'}>
                          ¥{adj.profitAfter.toFixed(0)} ({adj.profitRateAfter.toFixed(1)}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          adj.status === 'executed' ? 'default' :
                          adj.status === 'pending' ? 'secondary' : 'destructive'
                        } className={
                          adj.status === 'executed' ? 'bg-green-100 text-green-800' :
                          adj.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }>
                          {adj.status === 'executed' ? '已执行' :
                           adj.status === 'pending' ? '待审批' : '已拒绝'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {adj.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => approveAdjustment(adj.id)}>
                              批准
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => rejectAdjustment(adj.id)}>
                              拒绝
                            </Button>
                          </div>
                        )}
                        {adj.status === 'executed' && (
                          <span className="text-sm text-muted-foreground">{adj.executor}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 规则设置 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>盈亏保护规则</CardTitle>
              <CardDescription>设置调价的盈亏保护机制</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>最低利润率</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="15" className="w-24" />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">低于此利润率的调价将被禁止</p>
                </div>
                <div className="space-y-2">
                  <Label>安全利润率</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="20" className="w-24" />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">高于此利润率的调价可自动执行</p>
                </div>
                <div className="space-y-2">
                  <Label>健康利润率</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="30" className="w-24" />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">高于此利润率为健康状态</p>
                </div>
                <div className="space-y-2">
                  <Label>竞品价格权重</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="10" className="w-24" />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">调价时参考竞品价格的权重</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>调价审批规则</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">利润 ≥ 安全利润率：自动执行</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">利润 15%-20%：需要管理员审批</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">利润 &lt; 15%：禁止调价</span>
                  </div>
                </div>
              </div>
              <Button>保存设置</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 调价确认弹窗 */}
      <Dialog open={adjustmentDialog} onOpenChange={setAdjustmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认调价</DialogTitle>
            <DialogDescription>
              {selectedProduct && `为 "${selectedProduct.name}" 调整价格`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedProduct && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-muted-foreground">当前价格</div>
                  <div className="text-xl font-bold">¥{selectedProduct.sellingPrice}</div>
                  <div className="text-xs text-muted-foreground">利润率 {selectedProduct.profitRate.toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-muted-foreground">新价格</div>
                  <div className="text-xl font-bold text-blue-600">¥{adjustmentForm.newPrice || '-'}</div>
                  {adjustmentForm.newPrice && (
                    <div className="text-xs text-muted-foreground">
                      利润率 {(((parseFloat(adjustmentForm.newPrice) - selectedProduct.costPrice) / parseFloat(adjustmentForm.newPrice)) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="newPrice">新价格</Label>
              <Input
                id="newPrice"
                type="number"
                value={adjustmentForm.newPrice}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, newPrice: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">调价原因</Label>
              <Textarea
                id="reason"
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                placeholder="请输入调价原因..."
              />
            </div>

            {selectedProduct && adjustmentForm.newPrice && (
              <div className={`p-3 rounded-lg ${((parseFloat(adjustmentForm.newPrice) - selectedProduct.costPrice) / parseFloat(adjustmentForm.newPrice)) >= 0.15 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'}`}>
                <div className={`text-sm font-medium ${
                  ((parseFloat(adjustmentForm.newPrice) - selectedProduct.costPrice) / parseFloat(adjustmentForm.newPrice)) >= 0.15
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {((parseFloat(adjustmentForm.newPrice) - selectedProduct.costPrice) / parseFloat(adjustmentForm.newPrice)) >= 0.15
                    ? '✓ 调价后利润 ≥ 15%，可以执行'
                    : '✗ 调价后利润 < 15%，禁止执行'}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustmentDialog(false)}>取消</Button>
            <Button onClick={confirmAdjustment}>确认调价</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
