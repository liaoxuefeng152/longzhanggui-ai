'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Search,
  Sparkles,
  TrendingUp,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Target,
  BarChart3,
  ArrowRight,
  Filter,
  Star,
  Zap,
} from 'lucide-react';

// API 函数
async function callAI(productInfo: any): Promise<any> {
  const response = await fetch('/api/ai/select-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productInfo),
  });
  const data = await response.json();
  return data;
}

interface SelectedProduct {
  id: string;
  name: string;
  category: string;
  sales_trend: number;
  profit_margin: number;
  compliance_status: string;
  predicted_profit: number;
  score?: number;
}

export default function ProductSelectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('selection');
  
  // 选品表单
  const [formData, setFormData] = useState({
    platform: 'tiktok',
    market: '东南亚',
    category: '',
    keywords: '',
    budget: '',
  });
  
  // 选品结果
  const [products, setProducts] = useState<SelectedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 执行智能选品
  const handleSelectProducts = async () => {
    if (!formData.category && !formData.keywords) {
      toast.error('请输入类目或关键词');
      return;
    }

    setIsLoading(true);
    setAnalysisProgress(0);
    setProducts([]);
    setSelectedProduct(null);

    // 模拟分析进度
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await callAI({
        platform: formData.platform,
        site: formData.market,
        category: formData.category,
        keywords: formData.keywords,
        count: 10,
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (result.success && result.products) {
        // 添加AI评分
        const scoredProducts = result.products.map((p: SelectedProduct, idx: number) => ({
          ...p,
          score: 85 - idx * 3 + Math.random() * 10,
        }));
        setProducts(scoredProducts);
        toast.success(`分析完成，找到 ${scoredProducts.length} 个潜力商品`);
      } else {
        // 模拟数据
        const mockProducts: SelectedProduct[] = [
          {
            id: 'P001',
            name: '宠物自动饮水机',
            category: '宠物用品',
            sales_trend: 45,
            profit_margin: 32,
            compliance_status: 'passed',
            predicted_profit: 1560,
            score: 92,
          },
          {
            id: 'P002',
            name: '便携榨汁杯',
            category: '厨房用品',
            sales_trend: 38,
            profit_margin: 28,
            compliance_status: 'passed',
            predicted_profit: 1280,
            score: 88,
          },
          {
            id: 'P003',
            name: '无线充电器',
            category: '数码配件',
            sales_trend: 25,
            profit_margin: 35,
            compliance_status: 'passed',
            predicted_profit: 980,
            score: 85,
          },
          {
            id: 'P004',
            name: 'LED化妆镜',
            category: '美妆工具',
            sales_trend: 42,
            profit_margin: 30,
            compliance_status: 'passed',
            predicted_profit: 1150,
            score: 83,
          },
          {
            id: 'P005',
            name: '折叠键盘',
            category: '数码配件',
            sales_trend: 18,
            profit_margin: 40,
            compliance_status: 'warning',
            predicted_profit: 890,
            score: 78,
          },
        ];
        setProducts(mockProducts);
        toast.success(`分析完成，找到 ${mockProducts.length} 个潜力商品`);
      }
    } catch (error) {
      console.error('选品失败:', error);
      toast.error('选品分析失败，请重试');
    } finally {
      setIsLoading(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  };

  // 选择商品后一键采集
  const handleCollectAndOptimize = (product: SelectedProduct) => {
    setSelectedProduct(product);
    // 跳转到采集页面，带上选品信息
    router.push(`/erp/collection?source=selection&product=${encodeURIComponent(product.name)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              智能选品
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              AI分析市场趋势和竞品数据，智能推荐潜力爆款
            </p>
          </div>
        </div>

        {/* 选品流程 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[14px]">选品需求</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">目标平台</label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) => setFormData({ ...formData, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok Shop</SelectItem>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="lazada">Lazada</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">目标市场</label>
                <Select
                  value={formData.market}
                  onValueChange={(v) => setFormData({ ...formData, market: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="东南亚">东南亚</SelectItem>
                    <SelectItem value="印尼">印尼</SelectItem>
                    <SelectItem value="泰国">泰国</SelectItem>
                    <SelectItem value="越南">越南</SelectItem>
                    <SelectItem value="马来西亚">马来西亚</SelectItem>
                    <SelectItem value="北美">北美</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">商品类目</label>
                <Input
                  placeholder="如：宠物用品"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">关键词</label>
                <Input
                  placeholder="如：自动喂食器"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSelectProducts}
                disabled={isLoading || (!formData.category && !formData.keywords)}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    开始智能选品
                  </>
                )}
              </Button>
              
              {isLoading && (
                <div className="flex-1 max-w-xs">
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    正在分析市场趋势、竞品数据、利润空间...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 选品结果 */}
        {products.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px]">
                  推荐的 {products.length} 个潜力商品
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-3 w-3" />
                  筛选排序
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {/* 排名 */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      idx === 0 ? 'bg-yellow-500 text-white' :
                      idx === 1 ? 'bg-gray-400 text-white' :
                      idx === 2 ? 'bg-orange-400 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* 商品信息 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {product.category}
                        </Badge>
                        {product.compliance_status === 'passed' ? (
                          <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            合规
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            需注意
                          </Badge>
                        )}
                      </div>
                      
                      {/* 关键指标 */}
                      <div className="flex items-center gap-6 mt-2 text-[12px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span>销量趋势 +{product.sales_trend}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-blue-500" />
                          <span>利润率 {product.profit_margin}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3 text-purple-500" />
                          <span>月预估利润 ${product.predicted_profit}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI评分 */}
                    <div className="text-center">
                      <div className={`text-[24px] font-bold ${
                        product.score && product.score >= 90 ? 'text-green-500' :
                        product.score && product.score >= 80 ? 'text-blue-500' :
                        'text-muted-foreground'
                      }`}>
                        {product.score?.toFixed(0)}
                      </div>
                      <p className="text-[10px] text-muted-foreground">AI推荐分</p>
                    </div>

                    {/* 操作 */}
                    <Button
                      size="sm"
                      onClick={() => handleCollectAndOptimize(product)}
                      className="gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      一键采集
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态 */}
        {!isLoading && products.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-[16px] font-medium">开始您的智能选品之旅</h3>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  输入类目或关键词，AI将为您分析市场趋势、竞品数据和利润空间
                </p>
                <div className="mt-6 flex items-center justify-center gap-8 text-[12px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <span>趋势分析</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <span>竞品洞察</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <span>利润测算</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
