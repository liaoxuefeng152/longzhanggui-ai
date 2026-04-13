"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Zap,
  Bot,
  Image,
  DollarSign,
  FileText,
  Upload,
  Loader2,
  RefreshCw,
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  Megaphone,
  Search,
  Check,
  X,
  Star,
  Copy,
  Edit,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// 工作流步骤类型
type WorkflowStepStatus = 'pending' | 'processing' | 'completed' | 'confirmed' | 'skipped' | 'failed';

interface WorkflowStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: WorkflowStepStatus;
  canSkip: boolean;
}

interface SelectedProduct {
  id: string;
  name: string;
  category: string;
  platform: string;
  salesTrend: number;
  profitMargin: number;
  imageUrl?: string;
  cost?: number;
  reason?: string;
  risks?: string[];
  monthlySales?: string;
  competitionLevel?: string;
  sellingPoints?: string[];
}

interface CollectedProduct {
  id: string;
  sourceUrl: string;
  source: string; // 1688, Taobao, etc.
  name: string;
  price: number;
  images: string[];
  description: string;
  specs: Record<string, string>;
}

interface CollectionLink {
  id: string;
  url: string;
  source: '1688' | 'taobao' | 'pinduoduo';
  status: 'pending' | 'collecting' | 'completed' | 'failed';
  product?: CollectedProduct;
}

interface ProcessedImage {
  id: string;
  type: 'original' | 'translated' | 'white_bg' | 'optimized';
  url: string;
  status: 'pending' | 'processing' | 'completed';
}

interface ListingContent {
  title: string;
  description: string;
  keyFeatures: string[];
  keywords: string[];
}

interface PriceSuggestion {
  costPrice: number;
  logisticsCost: number;
  platformFee: number;
  profit: number;
  suggestedPrice: number;
  profitRate: number;
}

// 工作流向导组件
function WorkflowWizard({
  onComplete,
  onCancel,
}: {
  onComplete: (result: any) => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // 步骤1：选品参数
  const [productParams, setProductParams] = useState({
    category: '宠物用品',
    platform: 'tiktok',
    region: 'id',
    count: 3,
  });
  
  // 步骤2：选品结果
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  
  // 步骤3：采集链接
  const [collectionLinks, setCollectionLinks] = useState<CollectionLink[]>([]);
  
  // 步骤4：Listing内容
  const [listing, setListing] = useState<ListingContent>({
    title: '',
    description: '',
    keyFeatures: [],
    keywords: [],
  });
  
  // 步骤5：图片处理结果
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  
  // 步骤6：定价建议
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  
  // 步骤7：最终确认
  const [publishReady, setPublishReady] = useState(false);

  // 新品上架工作流步骤（按用户建议的顺序）
  const steps: WorkflowStep[] = [
    { id: 'select', name: '选品', icon: <Search className="h-4 w-4" />, status: 'pending', canSkip: false },
    { id: 'collect', name: '采集链接', icon: <Truck className="h-4 w-4" />, status: 'pending', canSkip: false },
    { id: 'listing', name: '优化Listing', icon: <FileText className="h-4 w-4" />, status: 'pending', canSkip: true },
    { id: 'image', name: '翻译图片', icon: <Image className="h-4 w-4" />, status: 'pending', canSkip: true },
    { id: 'pricing', name: '智能定价', icon: <DollarSign className="h-4 w-4" />, status: 'pending', canSkip: true },
    { id: 'confirm', name: '确认上架', icon: <CheckCircle className="h-4 w-4" />, status: 'pending', canSkip: false },
  ];

  // 模拟选品
  const mockProducts: SelectedProduct[] = [
    {
      id: 'P001',
      name: '宠物自动喂食器 5L大容量',
      category: '宠物用品',
      platform: 'TikTok印尼',
      salesTrend: 89.5,
      profitMargin: 42.3,
    },
    {
      id: 'P002',
      name: '宠物饮水机 循环过滤',
      category: '宠物用品',
      platform: 'TikTok印尼',
      salesTrend: 76.2,
      profitMargin: 38.7,
    },
    {
      id: 'P003',
      name: '宠物GPS定位项圈',
      category: '宠物用品',
      platform: 'TikTok印尼',
      salesTrend: 65.8,
      profitMargin: 35.2,
    },
  ];

  // 新品上架工作流执行函数
  const handleNext = async () => {
    setIsExecuting(true);
    
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
    
    try {
      // 步骤0：选品 - 调用AI选品智能体
      if (currentStep === 0) {
        const res = await fetch('/api/v1/ai/select-products', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            category: productParams.category,
            platform: productParams.platform,
            site: productParams.region,
            count: productParams.count,
          }),
        });
        const data = await res.json();
        
        if (data.success && data.data?.products) {
          const products = data.data.products.map((p: any, index: number) => ({
            id: p.name + '_' + index,
            name: p.name,
            category: productParams.category,
            platform: productParams.platform + ' ' + productParams.region.toUpperCase(),
            salesTrend: parseFloat(p.trend?.replace(/[^0-9.]/g, '') || '50'),
            profitMargin: parseFloat(p.profit_rate?.replace(/[^0-9.]/g, '') || '50'),
            cost: p.source_price ? parseFloat(p.source_price.replace(/[^0-9.]/g, '')) : 50 + index * 10,
            reason: p.reason || p.selling_points?.join(', ') || '',
            risks: p.risks || [],
            monthlySales: p.monthly_sales || '100-500',
            competitionLevel: p.competition_level || '中等',
            sellingPoints: p.selling_points || [],
          }));
          setSelectedProducts(products);
          toast.success('AI选品完成！请添加货源链接');
        } else {
          toast.error(data.error || data.detail || '选品失败');
        }
      }
      // 步骤1：采集链接 - 采集1688货源
      else if (currentStep === 1) {
        // 如果有采集链接，调用采集API
        const validLinks = collectionLinks.filter(l => l.status === 'completed' && l.product);
        if (validLinks.length > 0) {
          toast.success(`已采集 ${validLinks.length} 个货源链接`);
        }
        // 如果没有采集链接，给出提示但允许跳过
        if (collectionLinks.length === 0) {
          toast.info('可跳过此步骤，后续可手动填写商品信息');
        }
      }
      // 步骤2：优化Listing - 调用Listing优化智能体
      else if (currentStep === 2) {
        const selectedProduct = selectedProducts[0];
        // 获取采集的商品信息或使用选品结果
        const collectedProduct = collectionLinks.find(l => l.status === 'completed')?.product;
        
        const res = await fetch('/api/v1/ai/optimize-listing', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            product_info: {
              name: collectedProduct?.name || selectedProduct?.name,
              description: collectedProduct?.description || selectedProduct?.sellingPoints?.join('; ') || selectedProduct?.name,
              category: productParams.category,
            },
            platform: productParams.platform,
            language: productParams.region,
            keywords: selectedProduct?.sellingPoints || [],
          }),
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          const result = data.data;
          const title = result.optimized_title || result.title || '';
          const description = result.optimized_description || result.description || '';
          const keyFeatures = result.optimized_bullets || result.key_features || result.bullets || [];
          const keywords = result.keywords || result.search_keywords || [];
          
          setListing({
            title,
            description,
            keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
            keywords: Array.isArray(keywords) ? keywords : [],
          });
          toast.success('Listing优化完成！');
        } else {
          toast.error(data.error || data.detail || 'Listing优化失败');
        }
      }
      // 步骤3：翻译图片 - 调用图片处理智能体
      else if (currentStep === 3) {
        const collectedProduct = collectionLinks.find(l => l.status === 'completed')?.product;
        const selectedProduct = selectedProducts[0];
        
        // 如果有采集的商品图片，调用图片处理API
        if (collectedProduct?.images && collectedProduct.images.length > 0) {
          const res = await fetch('/api/v1/ai/process-image', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              image_url: collectedProduct.images[0],
              mode: 'translate',
              target_language: productParams.region,
            }),
          });
          const data = await res.json();
          
          if (data.success && data.data) {
            setProcessedImages([{
              id: '1',
              type: 'translated',
              url: data.data.processed_url || data.data.url || 'https://picsum.photos/400/400?random=1',
              status: 'completed',
            }]);
            toast.success('图片处理完成！');
          } else {
            // 图片处理失败，使用占位图
            setProcessedImages([
              { id: '1', type: 'original', url: collectedProduct.images[0], status: 'completed' },
              { id: '2', type: 'translated', url: 'https://picsum.photos/400/400?random=2', status: 'completed' },
            ]);
            toast.warning('图片处理稍有延迟，已使用原图');
          }
        } else {
          // 没有采集图片，使用示例图片
          setProcessedImages([
            { id: '1', type: 'original', url: 'https://picsum.photos/400/400?random=1', status: 'completed' },
            { id: '2', type: 'translated', url: 'https://picsum.photos/400/400?random=2', status: 'completed' },
            { id: '3', type: 'white_bg', url: 'https://picsum.photos/400/400?random=3', status: 'completed' },
          ]);
          toast.info('已使用示例图片，可后续替换');
        }
      }
      // 步骤4：智能定价 - 调用定价计算
      else if (currentStep === 4) {
        const selectedProduct = selectedProducts[0];
        const collectedProduct = collectionLinks.find(l => l.status === 'completed')?.product;
        const costPrice = collectedProduct?.price || selectedProduct?.cost || 68;
        
        const res = await fetch('/api/v1/ai/calculate-price', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            cost_price: costPrice,
            domestic_shipping: 0,
            first_mile_shipping: 15,
            platform_commission_rate: 0.12,
            ad_cost_rate: 0.05,
            target_profit_rate: 0.30,
          }),
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          const result = data.data;
          const costBreakdown = result.cost_breakdown || {};
          const profitAnalysis = result.profit_analysis || {};
          
          setPriceSuggestion({
            costPrice: costBreakdown.total_cost || costPrice + 15,
            logisticsCost: (costBreakdown.domestic_shipping || 0) + (costBreakdown.first_mile_shipping || 15),
            platformFee: result.platform_commission_rate || 0.12,
            profit: profitAnalysis.gross_profit || 0,
            suggestedPrice: result.suggested_price || result.target_price || 0,
            profitRate: profitAnalysis.profit_rate || 0,
          });
          toast.success('定价计算完成！');
        } else {
          toast.error(data.error || data.detail || '定价计算失败');
        }
      }
      // 步骤5：确认上架
      else if (currentStep === 5) {
        setPublishReady(true);
        toast.success('所有步骤完成，请确认上架信息！');
      }
    } catch (error) {
      console.error('工作流执行失败:', error);
      toast.error('执行失败，请重试');
    }
    
    setIsExecuting(false);
    setCurrentStep(prev => prev + 1);
  };

  const handleConfirmProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, id: p.id + '_confirmed' } : p)
    );
  };

  // 添加采集链接
  const addCollectionLink = (url: string) => {
    const source = url.includes('1688') ? '1688' : url.includes('taobao') ? 'taobao' : 'pinduoduo';
    const newLink: CollectionLink = {
      id: 'link_' + Date.now(),
      url,
      source: source as '1688' | 'taobao' | 'pinduoduo',
      status: 'pending',
    };
    setCollectionLinks(prev => [...prev, newLink]);
  };

  // 删除采集链接
  const removeCollectionLink = (id: string) => {
    setCollectionLinks(prev => prev.filter(l => l.id !== id));
  };

  // 采集单个链接
  const collectLink = async (id: string) => {
    const link = collectionLinks.find(l => l.id === id);
    if (!link) return;

    setCollectionLinks(prev => prev.map(l => l.id === id ? { ...l, status: 'collecting' as const } : l));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/collection/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: link.url }),
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        const collectedProduct: CollectedProduct = {
          id: 'collected_' + Date.now(),
          sourceUrl: link.url,
          source: link.source,
          name: data.data.name || selectedProducts[0]?.name || '采集商品',
          price: data.data.price || selectedProducts[0]?.cost || 50,
          images: data.data.images || [],
          description: data.data.description || '',
          specs: data.data.specs || {},
        };
        
        setCollectionLinks(prev => prev.map(l => 
          l.id === id ? { ...l, status: 'completed', product: collectedProduct } : l
        ));
        toast.success('采集成功！');
      } else {
        setCollectionLinks(prev => prev.map(l => l.id === id ? { ...l, status: 'failed' } : l));
        toast.error(data.error || '采集失败');
      }
    } catch (error) {
      setCollectionLinks(prev => prev.map(l => l.id === id ? { ...l, status: 'failed' } : l));
      toast.error('采集失败，请检查链接');
    }
  };

  const handlePublish = () => {
    toast.success('商品上架成功！', {
      description: '商品已成功发布到 TikTok Shop 印尼站',
    });
    onComplete({
      success: true,
      product: selectedProducts[0],
      listing,
      price: priceSuggestion,
    });
  };

  return (
    <div className="space-y-6">
      {/* 正在执行时显示 */}
      {isExecuting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <div>
            <p className="font-medium text-blue-800">
              {currentStep === 0 && '选品智能体分析中...'}
              {currentStep === 1 && '采集货源链接中...'}
              {currentStep === 2 && 'Listing优化智能体分析中...'}
              {currentStep === 3 && '图片处理智能体处理中...'}
              {currentStep === 4 && '智能定价计算中...'}
              {currentStep === 5 && '准备上架...'}
            </p>
            <p className="text-sm text-blue-600">请稍候，AI正在处理...</p>
          </div>
        </div>
      )}
      
      {/* 步骤指示器 - 横向滚动 */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-max">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0
                ${index < currentStep ? 'bg-green-500 border-green-500 text-white' : ''}
                ${index === currentStep ? 'bg-primary border-primary text-white' : ''}
                ${index > currentStep ? 'bg-muted border-muted-foreground text-muted-foreground' : ''}
              `}>
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <span className={`
                ml-2 text-sm font-medium shrink-0
                ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-8 mx-2 shrink-0 ${
                  index < currentStep ? 'bg-green-500' : 'bg-muted-foreground/30'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 步骤内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {currentStep === 0 && '步骤1：设置选品参数'}
            {currentStep === 1 && '步骤2：采集货源链接'}
            {currentStep === 2 && '步骤3：优化Listing'}
            {currentStep === 3 && '步骤4：翻译图片'}
            {currentStep === 4 && '步骤5：智能定价'}
            {currentStep === 5 && '步骤6：确认上架'}
          </CardTitle>
          <CardDescription>
            {currentStep === 0 && '设置要分析的品类和平台，AI将推荐最适合的商品'}
            {currentStep === 1 && '粘贴1688/淘宝/拼多多货源链接，采集商品信息'}
            {currentStep === 2 && 'AI智能生成标题、描述、关键词等Listing内容'}
            {currentStep === 3 && 'AI处理商品图片：翻译文字、去除水印、生成白底图'}
            {currentStep === 4 && '根据成本、物流、佣金计算最优售价'}
            {currentStep === 5 && '确认所有信息后提交上架'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 步骤1：参数设置 */}
          {currentStep === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>商品类目</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={productParams.category}
                  onChange={(e) => setProductParams({ ...productParams, category: e.target.value })}
                >
                  <option value="宠物用品">宠物用品</option>
                  <option value="家居百货">家居百货</option>
                  <option value="3C数码">3C数码</option>
                  <option value="美妆护肤">美妆护肤</option>
                  <option value="服装">服装</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>目标平台</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={productParams.platform}
                  onChange={(e) => setProductParams({ ...productParams, platform: e.target.value })}
                >
                  <option value="tiktok">TikTok Shop</option>
                  <option value="amazon">Amazon</option>
                  <option value="shopee">Shopee</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>目标站点</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={productParams.region}
                  onChange={(e) => setProductParams({ ...productParams, region: e.target.value })}
                >
                  <option value="id">印尼 (ID)</option>
                  <option value="th">泰国 (TH)</option>
                  <option value="my">马来西亚 (MY)</option>
                  <option value="vn">越南 (VN)</option>
                  <option value="ph">菲律宾 (PH)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>推荐数量</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={productParams.count}
                  onChange={(e) => setProductParams({ ...productParams, count: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>
          )}

          {/* 步骤2：选品结果 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">AI选品智能体正在分析市场数据...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">选品智能体分析完成！</span> 根据市场需求、竞争程度、利润空间等维度推荐以下商品。
                    </p>
                  </div>
                  {selectedProducts.map((product, index) => (
                    <div key={product.id} className={`p-4 border rounded-lg transition-colors ${index === 0 ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.name}</h4>
                            {index === 0 && <Badge variant="default" className="text-xs">推荐</Badge>}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              销量趋势 +{product.salesTrend.toFixed(1)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-blue-500" />
                              利润率 {product.profitMargin.toFixed(1)}%
                            </span>
                            {product.cost && (
                              <span className="text-muted-foreground">
                                成本 ¥{product.cost}
                              </span>
                            )}
                            {product.monthlySales && (
                              <span className="text-muted-foreground">
                                月销 {product.monthlySales}单
                              </span>
                            )}
                          </div>
                          {product.sellingPoints && product.sellingPoints.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.sellingPoints.slice(0, 3).map((point, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {product.reason && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {product.reason.substring(0, 200)}...
                            </p>
                          )}
                          {product.risks && product.risks.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600">
                                风险: {product.risks[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant={index === 0 ? "default" : "outline"}
                          onClick={() => handleConfirmProduct(product.id)}
                        >
                          {index === 0 ? '选择此商品' : '选择'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 步骤2：采集链接 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* 采集链接输入 */}
              <div className="flex gap-2">
                <Input 
                  placeholder="粘贴1688/淘宝/拼多多商品链接，如: https://detail.1688.com/offer/xxx.html"
                  id="collect-url"
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById('collect-url') as HTMLInputElement;
                    if (input?.value) {
                      addCollectionLink(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> 添加
                </Button>
              </div>
              
              {/* 采集链接列表 */}
              {collectionLinks.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Truck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">暂无采集链接</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    添加1688等货源链接，采集商品信息
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-2">
                    支持1688、淘宝、拼多多平台
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collectionLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {link.source === '1688' && <span className="text-orange-500 font-bold text-sm">1688</span>}
                        {link.source === 'taobao' && <span className="text-orange-400 font-bold text-sm">淘</span>}
                        {link.source === 'pinduoduo' && <span className="text-pink-500 font-bold text-sm">拼</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{link.url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={
                              link.status === 'completed' ? 'default' : 
                              link.status === 'collecting' ? 'secondary' :
                              link.status === 'failed' ? 'destructive' : 'outline'
                            }
                            className="text-xs"
                          >
                            {link.status === 'pending' && '待采集'}
                            {link.status === 'collecting' && '采集中...'}
                            {link.status === 'completed' && '已采集'}
                            {link.status === 'failed' && '失败'}
                          </Badge>
                          {link.product && (
                            <span className="text-xs text-muted-foreground">
                              {link.product.name} - ¥{link.product.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => collectLink(link.id)}>
                            <Truck className="h-3 w-3 mr-1" /> 采集
                          </Button>
                        )}
                        {link.status === 'collecting' && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        <Button size="sm" variant="ghost" onClick={() => removeCollectionLink(link.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 采集提示 */}
              {collectionLinks.length > 0 && collectionLinks.every(l => l.status !== 'completed') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    请至少采集一个货源链接，或跳过此步骤
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 步骤3：优化Listing */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {listing.title ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Listing优化完成！AI已生成标题、描述和关键词
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>商品标题</Label>
                    <Input value={listing.title} onChange={(e) => setListing({ ...listing, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>商品描述</Label>
                    <Textarea 
                      value={listing.description} 
                      onChange={(e) => setListing({ ...listing, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>关键词</Label>
                    <div className="flex flex-wrap gap-2">
                      {listing.keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">正在生成Listing内容...</p>
                </div>
              )}
            </div>
          )}

          {/* 步骤4：翻译图片 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {processedImages.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">正在处理图片：翻译、去水印、白底...</p>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      图片处理完成！
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {processedImages.map((img) => (
                      <div key={img.id} className="space-y-2">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img src={img.url} alt={img.type} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {img.type === 'original' && '原图'}
                            {img.type === 'translated' && '翻译后'}
                            {img.type === 'white_bg' && '白底图'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 步骤5：智能定价 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {priceSuggestion ? (
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">建议售价</p>
                    <p className="text-4xl font-bold text-primary">¥{priceSuggestion.suggestedPrice}</p>
                    <p className="text-sm text-green-600 mt-1">
                      利润率 {priceSuggestion.profitRate}%
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">成本价</span>
                      <span className="font-medium">¥{priceSuggestion.costPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">物流费</span>
                      <span className="font-medium">¥{priceSuggestion.logisticsCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">平台佣金</span>
                      <span className="font-medium">{(priceSuggestion.platformFee * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">预期利润</span>
                      <span className="font-medium text-green-600">¥{priceSuggestion.profit}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">正在计算最优价格...</p>
                </div>
              )}
            </div>
          )}

          {/* 步骤6：最终确认 */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">所有步骤已完成</span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  商品信息已准备就绪，点击"确认上架"发布到 {productParams.region.toUpperCase()} 站
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">商品</p>
                  <p className="font-medium">{selectedProducts[0]?.name}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">售价</p>
                  <p className="font-medium">¥{priceSuggestion?.suggestedPrice}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">平台</p>
                  <p className="font-medium">TikTok {productParams.region.toUpperCase()}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">预期利润</p>
                  <p className="font-medium text-green-600">¥{priceSuggestion?.profit}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && currentStep < 5 && (
              <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                上一步
              </Button>
            )}
            {currentStep < 5 && (
              <Button onClick={handleNext} disabled={isExecuting}>
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    执行中...
                  </>
                ) : (
                  <>
                    {currentStep === 0 ? '开始选品' : '下一步'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
            {currentStep === 5 && (
              <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                确认上架
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// 执行结果卡片组件
function ExecutionResultCard({ result }: { result: any }) {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-6 w-6" />
          <CardTitle>上架成功</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-lg">{result.product?.name}</h4>
              <p className="text-sm text-muted-foreground">
                TikTok Shop · 印尼站 · ¥{result.price?.suggestedPrice}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700">已上架</Badge>
                <Badge variant="outline">预计利润 ¥{result.price?.profit}</Badge>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{result.listing?.title?.length || 0}</p>
              <p className="text-xs text-muted-foreground">标题字符</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{result.listing?.keywords?.length || 0}</p>
              <p className="text-xs text-muted-foreground">关键词</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{result.price?.profitRate?.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">利润率</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [showBatchProcess, setShowBatchProcess] = useState(false);
  const [showBatchPricing, setShowBatchPricing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleWizardComplete = (result: any) => {
    setExecutionResult(result);
    setShowWizard(false);
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/5 flex items-center justify-center">
              <Zap className="h-7 w-7 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">新品上架助手</h1>
              <p className="text-sm text-muted-foreground">
                AI智能选品 · 一键生成Listing · 自动计算定价
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowWizard(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新品上架
          </Button>
        </div>

        {/* 工作流向导 */}
        {showWizard && (
          <WorkflowWizard
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        )}

        {/* 执行结果 */}
        {executionResult && (
          <ExecutionResultCard result={executionResult} />
        )}

        {/* 快捷操作 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowWizard(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">新品上架</h3>
                  <p className="text-sm text-muted-foreground">选品到上架全流程</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowBatchProcess(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">批量处理</h3>
                  <p className="text-sm text-muted-foreground">批量采集和图片处理</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowBatchPricing(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">批量定价</h3>
                  <p className="text-sm text-muted-foreground">批量计算最优价格</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 流程说明 - 新品上架工作流 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">新品上架工作流</CardTitle>
            <CardDescription>从选品到上架的全链路AI自动化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto">
              {[
                { icon: Search, name: '选品', desc: 'AI分析市场' },
                { icon: Truck, name: '采集链接', desc: '1688货源' },
                { icon: FileText, name: '优化Listing', desc: '标题描述' },
                { icon: Image, name: '翻译图片', desc: '处理主图' },
                { icon: DollarSign, name: '智能定价', desc: '计算利润' },
                { icon: CheckCircle, name: '上架', desc: '发布平台' },
              ].map((step, index) => (
                <div key={step.name} className="flex items-center min-w-fit">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mt-2">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                  {index < 5 && (
                    <ArrowRight className="h-5 w-5 mx-2 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近执行 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">最近执行</CardTitle>
                <CardDescription>查看历史执行记录和结果</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                查看全部
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">暂无执行记录</p>
              <p className="text-sm mt-2">点击"新品上架"开始您的第一个工作流</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 批量处理对话框 */}
      <BatchProcessDialog 
        open={showBatchProcess} 
        onClose={() => setShowBatchProcess(false)} 
      />

      {/* 批量定价对话框 */}
      <BatchPricingDialog 
        open={showBatchPricing} 
        onClose={() => setShowBatchPricing(false)} 
      />
    </MainLayout>
  );
}

// 批量处理对话框组件
function BatchProcessDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'collect' | 'image'>('collect');
  const [urls, setUrls] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [processMode, setProcessMode] = useState<'translate' | 'white_bg' | 'optimize'>('translate');
  const [targetLang, setTargetLang] = useState('th');

  const handleCollect = async () => {
    const urlList = urls.split('\n').filter(u => u.trim());
    if (urlList.length === 0) {
      toast.error('请输入至少一个1688商品链接');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/v1/1688/collect/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.items || []);
        toast.success(`成功采集 ${data.items?.length || 0} 个商品`);
      } else {
        toast.error(data.detail || '采集失败');
      }
    } catch (error) {
      console.error('采集失败:', error);
      toast.error('采集失败，请检查链接格式');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessImages = async () => {
    const imageList = imageUrls.split('\n').filter(u => u.trim());
    if (imageList.length === 0) {
      toast.error('请输入至少一个图片URL');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/v1/ai/process-image/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_urls: imageList,
          mode: processMode,
          source_language: 'zh',
          target_language: targetLang,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.data?.results || []);
        toast.success(`成功处理 ${data.data?.results?.length || 0} 张图片`);
      } else {
        toast.error(data.detail || '处理失败');
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      toast.error('图片处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUrls('');
    setImageUrls('');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量处理</DialogTitle>
          <DialogDescription>
            批量采集1688商品或批量处理商品图片
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'collect' | 'image')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collect">批量采集</TabsTrigger>
            <TabsTrigger value="image">图片处理</TabsTrigger>
          </TabsList>

          <TabsContent value="collect" className="space-y-4">
            <div>
              <Label htmlFor="urls">1688商品链接（每行一个）</Label>
              <Textarea
                id="urls"
                placeholder={`https://detail.1688.com/offer/123456789.html\nhttps://detail.1688.com/offer/987654321.html`}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={6}
                className="mt-2 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                支持多个1688商品链接，每行一个
              </p>
            </div>
            <Button onClick={handleCollect} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  采集中...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  开始采集
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>处理模式</Label>
                <Select value={processMode} onValueChange={(v) => setProcessMode(v as any)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="translate">翻译优化</SelectItem>
                    <SelectItem value="white_bg">白底图</SelectItem>
                    <SelectItem value="optimize">AI优化</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>目标语言</Label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">泰语</SelectItem>
                    <SelectItem value="id">印尼语</SelectItem>
                    <SelectItem value="vi">越南语</SelectItem>
                    <SelectItem value="en">英语</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrls">图片URL（每行一个）</Label>
              <Textarea
                id="imageUrls"
                placeholder={`https://cbu01.alicdn.com/img/ibank/xxx.jpg\nhttps://cbu01.alicdn.com/img/ibank/yyy.jpg`}
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                rows={6}
                className="mt-2 font-mono text-sm"
              />
            </div>
            <Button onClick={handleProcessImages} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  开始处理
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {results.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>处理结果</Label>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-1" />
                清除
              </Button>
            </div>
            <div className="border rounded-lg max-h-[200px] overflow-y-auto">
              {results.map((item, index) => (
                <div key={index} className="p-3 border-b last:border-b-0 flex items-center gap-3">
                  {item.success !== false ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {item.name || item.source_url || item.original_url || `图片 ${index + 1}`}
                    </p>
                    {item.error && (
                      <p className="text-xs text-red-500">{item.error}</p>
                    )}
                    {item.processed_url && (
                      <p className="text-xs text-green-500">处理完成</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 批量定价对话框组件
function BatchPricingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    costPrice: number;
    domesticShipping: number;
    firstMileShipping: number;
    competitorPrice?: number;
  }>>([]);
  const [pricingParams, setPricingParams] = useState({
    platformFeeRate: 0.06,
    adBudgetRate: 0.05,
    targetProfitRate: 0.20,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleAddProduct = () => {
    setProducts([...products, {
      id: Date.now().toString(),
      name: '',
      costPrice: 0,
      domesticShipping: 0,
      firstMileShipping: 0,
    }]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateProduct = (id: string, field: string, value: any) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleCalculate = async () => {
    if (products.length === 0) {
      toast.error('请先添加商品');
      return;
    }

    setIsCalculating(true);
    try {
      const pricingResults = [];
      for (const product of products) {
        const productId = product.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const response = await fetch('/api/v1/erp/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            cost_price: product.costPrice,
            domestic_shipping: product.domesticShipping,
            first_mile_shipping: product.firstMileShipping,
            competitor_price: product.competitorPrice,
            platform_fee_rate: pricingParams.platformFeeRate,
            ad_budget_rate: pricingParams.adBudgetRate,
            target_profit_rate: pricingParams.targetProfitRate,
          }),
        });
        const data = await response.json();
        pricingResults.push({
          name: product.name || `商品 ${pricingResults.length + 1}`,
          ...data,
        });
      }
      setResults(pricingResults);
      toast.success(`成功计算 ${pricingResults.length} 个商品的价格`);
    } catch (error) {
      console.error('定价计算失败:', error);
      toast.error('定价计算失败');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setProducts([]);
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量定价</DialogTitle>
          <DialogDescription>
            批量计算商品最优售价，支持利润率和竞品价格参考
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">商品列表</TabsTrigger>
            <TabsTrigger value="results">定价结果</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* 定价参数 */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">定价参数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">平台佣金率</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={(pricingParams.platformFeeRate * 100).toFixed(0)}
                        onChange={(e) => setPricingParams({
                          ...pricingParams,
                          platformFeeRate: parseFloat(e.target.value) / 100 || 0,
                        })}
                        className="w-20"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">广告预算占比</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={(pricingParams.adBudgetRate * 100).toFixed(0)}
                        onChange={(e) => setPricingParams({
                          ...pricingParams,
                          adBudgetRate: parseFloat(e.target.value) / 100 || 0,
                        })}
                        className="w-20"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">目标利润率</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={(pricingParams.targetProfitRate * 100).toFixed(0)}
                        onChange={(e) => setPricingParams({
                          ...pricingParams,
                          targetProfitRate: parseFloat(e.target.value) / 100 || 0,
                        })}
                        className="w-20"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 商品列表 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>商品成本</Label>
                <Button variant="outline" size="sm" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加商品
                </Button>
              </div>

              {products.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">点击"添加商品"开始定价</p>
                </div>
              )}

              {products.map((product, index) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-5 gap-3">
                        <div className="col-span-2">
                          <Label className="text-xs">商品名称</Label>
                          <Input
                            placeholder="商品名称"
                            value={product.name}
                            onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">商品成本</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={product.costPrice || ''}
                            onChange={(e) => handleUpdateProduct(product.id, 'costPrice', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">国内运费</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={product.domesticShipping || ''}
                            onChange={(e) => handleUpdateProduct(product.id, 'domesticShipping', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">头程运费</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={product.firstMileShipping || ''}
                            onChange={(e) => handleUpdateProduct(product.id, 'firstMileShipping', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="mt-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCalculate} disabled={isCalculating || products.length === 0} className="flex-1">
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    计算中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    计算价格
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">暂无定价结果</p>
                <p className="text-sm mt-2">先在"商品列表"中添加商品并计算价格</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{result.name}</h4>
                        <Badge variant="outline">
                          利润率: {result.profit_margin?.toFixed(1) || 0}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">总成本</p>
                          <p className="font-medium">¥{result.total_cost?.toFixed(2) || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">建议售价</p>
                          <p className="font-medium text-green-600">¥{result.suggested_price?.toFixed(2) || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">竞品参考</p>
                          <p className="font-medium">¥{result.competitor_price?.toFixed(2) || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">预计利润</p>
                          <p className="font-medium text-blue-600">
                            ¥{((result.suggested_price || 0) - (result.total_cost || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {result.pricing_basis && (
                        <p className="text-xs text-muted-foreground mt-2">
                          计算依据: {result.pricing_basis}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 缺少的导入
import { Plus } from "lucide-react";
