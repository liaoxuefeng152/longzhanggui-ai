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
  
  // 步骤3：图片处理结果
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  
  // 步骤4：Listing内容
  const [listing, setListing] = useState<ListingContent>({
    title: '',
    description: '',
    keyFeatures: [],
    keywords: [],
  });
  
  // 步骤5：定价建议
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  
  // 步骤6：最终确认
  const [publishReady, setPublishReady] = useState(false);

  const steps: WorkflowStep[] = [
    { id: 'select', name: '选品', icon: <Search className="h-4 w-4" />, status: 'pending', canSkip: false },
    { id: 'image', name: '图片处理', icon: <Image className="h-4 w-4" />, status: 'pending', canSkip: true },
    { id: 'listing', name: 'Listing', icon: <FileText className="h-4 w-4" />, status: 'pending', canSkip: true },
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

  const handleNext = async () => {
    setIsExecuting(true);
    
    // 模拟各步骤执行
    if (currentStep === 0) {
      // 模拟选品
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSelectedProducts(mockProducts);
    } else if (currentStep === 1) {
      // 模拟图片处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProcessedImages([
        { id: '1', type: 'original', url: 'https://picsum.photos/400/400?random=1', status: 'completed' },
        { id: '2', type: 'translated', url: 'https://picsum.photos/400/400?random=2', status: 'completed' },
        { id: '3', type: 'white_bg', url: 'https://picsum.photos/400/400?random=3', status: 'completed' },
      ]);
    } else if (currentStep === 2) {
      // 模拟Listing生成
      await new Promise(resolve => setTimeout(resolve, 1800));
      setListing({
        title: 'Auto Pet Feeder 5L - Smart Food Dispenser for Cats & Dogs',
        description: 'Premium automatic pet feeder with 5L large capacity, programmable timer, and voice recording function. Perfect for busy pet owners. Supports both dry and wet food.',
        keyFeatures: [
          '5L large capacity - holds up to 20 cups of dry food',
          'Programmable timer with 6 meals per day',
          'Voice recording to call your pet',
          'Dual power supply (USB + batteries)',
          'Easy to clean and disassemble',
        ],
        keywords: ['pet feeder', 'automatic feeder', 'cat feeder', 'dog feeder', 'smart pet feeder'],
      });
    } else if (currentStep === 3) {
      // 模拟定价计算
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPriceSuggestion({
        costPrice: 68,
        logisticsCost: 15,
        platformFee: 0.12,
        profit: 35.5,
        suggestedPrice: 138,
        profitRate: 34.2,
      });
    } else if (currentStep === 4) {
      // 完成
      setPublishReady(true);
    }
    
    setIsExecuting(false);
    setCurrentStep(prev => prev + 1);
  };

  const handleConfirmProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, id: p.id + '_confirmed' } : p)
    );
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
      {/* 步骤指示器 */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2
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
              ml-2 text-sm font-medium
              ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}
            `}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentStep === 0 && '步骤1：设置选品参数'}
            {currentStep === 1 && '步骤2：选择候选商品'}
            {currentStep === 2 && '步骤3：图片处理'}
            {currentStep === 3 && '步骤4：生成Listing'}
            {currentStep === 4 && '步骤5：确认定价'}
            {currentStep === 5 && '步骤6：确认上架'}
          </CardTitle>
          <CardDescription>
            {currentStep === 0 && '设置要分析的品类和平台'}
            {currentStep === 1 && '从AI推荐的商品中选择要上架的商品'}
            {currentStep === 2 && '查看处理后的商品图片'}
            {currentStep === 3 && '编辑生成的Listing内容'}
            {currentStep === 4 && '确认最终售价'}
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
                  <p className="mt-2 text-muted-foreground">AI正在分析市场数据...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              销量趋势 +{product.salesTrend}%
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-blue-500" />
                              利润率 {product.profitMargin}%
                            </span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleConfirmProduct(product.id)}>
                          选择
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 步骤3：图片处理 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {processedImages.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">正在处理图片：翻译、去水印、白底...</p>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {/* 步骤4：Listing生成 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {listing.title ? (
                <>
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

          {/* 步骤5：定价 */}
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
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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

        {/* 流程说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">工作流程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {[
                { icon: Search, name: '选品', desc: 'AI分析市场' },
                { icon: Image, name: '图片', desc: '翻译优化' },
                { icon: FileText, name: 'Listing', desc: '生成标题' },
                { icon: DollarSign, name: '定价', desc: '计算利润' },
                { icon: CheckCircle, name: '上架', desc: '发布到平台' },
              ].map((step, index) => (
                <div key={step.name} className="flex items-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mt-2">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                  {index < 4 && (
                    <ArrowRight className="h-5 w-5 mx-4 text-muted-foreground" />
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
    </MainLayout>
  );
}

// 缺少的导入
import { Plus } from "lucide-react";
