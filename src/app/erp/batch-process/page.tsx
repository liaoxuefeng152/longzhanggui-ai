'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Layers,
  Loader2,
  CheckCircle,
  ImageIcon,
  FileText,
  Tag,
  DollarSign,
  Sparkles,
  Package,
  RefreshCw,
  Trash2,
  Rocket,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

// 处理类型
const PROCESS_TYPES = [
  {
    id: 'images',
    name: '批量处理图片',
    description: 'AI自动处理：白底图、背景替换、图片翻译',
    icon: ImageIcon,
    color: 'text-[#165DFF]500',
    bgColor: 'bg-[#165DFF]500/10',
  },
  {
    id: 'listing',
    name: '批量生成Listing',
    description: 'AI自动生成：多语言标题、五点描述、关键词',
    icon: FileText,
    color: 'text-[#165DFF]500',
    bgColor: 'bg-[#165DFF]500/10',
  },
  {
    id: 'pricing',
    name: '批量智能定价',
    description: 'AI自动计算：最优售价、利润率分析',
    icon: DollarSign,
    color: 'text-[#00B42A]500',
    bgColor: 'bg-[#00B42A]500/10',
  },
];

export default function BatchProcessPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // 商品列表
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // 处理状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processType, setProcessType] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  
  // 结果弹窗
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadProducts();
  }, [router]);

  // 加载商品
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { default: store } = await import('@/lib/store');
      const allProducts = Array.from(store.getProducts());
      
      // 过滤出状态为 draft 或 selected 的商品（待处理）
      const pendingProducts = allProducts.filter(
        (p: any) => p.status === 'draft' || p.status === 'selected' || p.status === 'ready'
      );
      
      // 如果没有商品，添加示例数据
      if (pendingProducts.length === 0) {
        const examples = [
          { name_zh: '宠物自动饮水机 3.5L', cost_price: 45, status: 'draft' },
          { name_zh: '无线蓝牙耳机 降噪款', cost_price: 68, status: 'draft' },
          { name_zh: '便携式榨汁杯 USB充电', cost_price: 35, status: 'selected' },
          { name_zh: '智能手环 运动防水', cost_price: 55, status: 'ready' },
          { name_zh: '迷你加湿器 静音款', cost_price: 28, status: 'draft' },
        ];
        
        examples.forEach((ex, idx) => {
          store.createProduct({
            name_zh: ex.name_zh,
            internal_sku: `SKU-BATCH-${idx + 1}`,
            cost_price: ex.cost_price,
            domestic_shipping: 5,
            first_mile_shipping: 15,
            total_cost: ex.cost_price + 20,
            status: ex.status,
          });
        });
        
        setProducts(Array.from(store.getProducts()));
      } else {
        setProducts(pendingProducts);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p: any) => p.id));
    }
  };

  // 单选
  const handleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 开始批量处理
  const handleBatchProcess = async () => {
    if (selectedProducts.length === 0) {
      toast.error('请先选择要处理的商品');
      return;
    }
    if (!processType) {
      toast.error('请选择处理类型');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setResults([]);
    const tempResults: any[] = [];

    try {
      const selectedProductDetails = products.filter((p: any) => selectedProducts.includes(p.id));

      for (let i = 0; i < selectedProductDetails.length; i++) {
        const product = selectedProductDetails[i];
        const progress = Math.round(((i + 1) / selectedProductDetails.length) * 100);

        // 模拟AI处理
        if (processType === 'images') {
          setProcessingStatus(`处理图片: ${product.name_zh} (${i + 1}/${selectedProductDetails.length})`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          tempResults.push({
            product_id: product.id,
            name: product.name_zh,
            status: 'success',
            message: '已处理 5 张图片',
            details: {
              main_images: 1,
              white_background: 2,
              translated: 2,
            },
          });
        } else if (processType === 'listing') {
          setProcessingStatus(`生成Listing: ${product.name_zh} (${i + 1}/${selectedProductDetails.length})`);
          await new Promise((resolve) => setTimeout(resolve, 800));
          tempResults.push({
            product_id: product.id,
            name: product.name_zh,
            status: 'success',
            message: '已生成英文Listing',
            details: {
              title: `${product.name_zh} - Premium Quality for Pets`,
              bullet_points: 5,
              keywords: 8,
              languages: ['English', 'Bahasa', 'Thai'],
            },
          });
        } else if (processType === 'pricing') {
          setProcessingStatus(`计算定价: ${product.name_zh} (${i + 1}/${selectedProductDetails.length})`);
          await new Promise((resolve) => setTimeout(resolve, 400));
          const cost = product.cost_price || 50;
          const suggestedPrice = Math.round(cost * 3.5 * 100) / 100;
          const profit = Math.round((suggestedPrice - cost * 1.5) / suggestedPrice * 100);
          tempResults.push({
            product_id: product.id,
            name: product.name_zh,
            status: 'success',
            message: `建议售价 $${suggestedPrice}`,
            details: {
              cost: cost,
              suggested_price: suggestedPrice,
              profit_margin: profit,
              competitors_avg: suggestedPrice * 0.9,
            },
          });
        }

        setProcessingProgress(progress);
        setResults([...tempResults]);
      }

      toast.success(`批量处理完成！成功 ${tempResults.length} 个`);
      setShowResults(true);
    } catch (error) {
      console.error('处理失败:', error);
      toast.error('处理失败');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // 确认结果
  const handleConfirmResults = () => {
    setShowResults(false);
    setSelectedProducts([]);
    setProcessType('');
    toast.success('已应用处理结果');
  };

  // 获取处理类型信息
  const getProcessTypeInfo = (id: string) => {
    return PROCESS_TYPES.find((t) => t.id === id);
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="container py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#FF7D00]500" />
            批量自动处理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            选择多个商品，AI自动批量处理，提升运营效率
          </p>
        </div>

        {/* 处理类型选择 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">选择处理类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {PROCESS_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setProcessType(type.id)}
                    disabled={isProcessing}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      processType === type.id
                        ? 'border-orange-500 bg-[#FF7D00]50'
                        : 'hover:border-orange-200'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${type.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`h-5 w-5 ${type.color}`} />
                    </div>
                    <div className="font-medium text-[14px]">{type.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[14px]">选择商品</CardTitle>
                <CardDescription>
                  共 {products.length} 个待处理商品，已选择 {selectedProducts.length} 个
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadProducts}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  刷新
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">暂无待处理的商品</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => router.push('/erp/one-click-publish')}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  去一键发布
                </Button>
              </div>
            ) : (
              <>
                {/* 表头 */}
                <div className="flex items-center gap-4 pb-3 border-b">
                  <Checkbox
                    checked={selectedProducts.length === products.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-[13px] text-muted-foreground flex-1">商品信息</span>
                  <span className="text-[13px] text-muted-foreground w-24">成本</span>
                  <span className="text-[13px] text-muted-foreground w-20">状态</span>
                </div>

                {/* 商品列表 */}
                <div className="space-y-2 mt-3 max-h-[400px] overflow-y-auto">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        selectedProducts.includes(product.id)
                          ? 'bg-[#FF7D00]50 border border-orange-200'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelect(product.id)}
                      />
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        {product.images?.[0]?.processed_url || product.images?.[0]?.original_url ? (
                          <img 
                            src={product.images[0].processed_url || product.images[0].original_url} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium truncate">{product.name_zh}</div>
                        <div className="text-[12px] text-muted-foreground font-mono">{product.internal_sku}</div>
                      </div>
                      <div className="text-[14px] w-24">
                        <span className="text-[#FF7D00]500">¥{product.cost_price}</span>
                      </div>
                      <div className="w-20">
                        <Badge variant="outline" className="text-xs">
                          {product.status === 'draft' ? '草稿' :
                           product.status === 'selected' ? '已选品' :
                           product.status === 'ready' ? '待上架' : product.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 底部操作栏 */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <div className="text-[13px] text-muted-foreground">
                    已选择 <span className="font-medium text-foreground">{selectedProducts.length}</span> 个商品
                  </div>
                  <Button
                    onClick={handleBatchProcess}
                    disabled={isProcessing || selectedProducts.length === 0 || !processType}
                    className="bg-[#FF7D00]500 hover:bg-[#FF7D00]600"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        批量处理 ({selectedProducts.length})
                      </>
                    )}
                  </Button>
                </div>

                {/* 处理进度 */}
                {isProcessing && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {processingStatus}
                      </span>
                      <span className="text-[13px] font-medium">{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 处理结果弹窗 */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                批量处理完成
              </DialogTitle>
              <DialogDescription>
                共处理 {results.length} 个商品，全部成功
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] overflow-y-auto space-y-3 py-4">
              {results.map((result, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[14px]">{result.name}</span>
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      成功
                    </Badge>
                  </div>
                  <div className="text-[13px] text-muted-foreground">{result.message}</div>
                  
                  {/* 详细信息 */}
                  {processType === 'images' && result.details && (
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        主图 {result.details.main_images}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        白底图 {result.details.white_background}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        翻译图 {result.details.translated}
                      </Badge>
                    </div>
                  )}
                  {processType === 'listing' && result.details && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        五点描述 {result.details.bullet_points}条
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        关键词 {result.details.keywords}个
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.details.languages?.join(', ')}
                      </Badge>
                    </div>
                  )}
                  {processType === 'pricing' && result.details && (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-muted-foreground">成本</div>
                        <div className="font-medium">¥{result.details.cost}</div>
                      </div>
                      <div className="p-2 bg-[#00B42A]500/10 rounded">
                        <div className="text-muted-foreground">建议售价</div>
                        <div className="font-medium text-[#00B42A]600">${result.details.suggested_price}</div>
                      </div>
                      <div className="p-2 bg-[#165DFF]500/10 rounded">
                        <div className="text-muted-foreground">利润率</div>
                        <div className="font-medium text-[#165DFF]600">{result.details.profit_margin}%</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResults(false)}>
                稍后查看
              </Button>
              <Button onClick={handleConfirmResults}>
                <CheckCircle className="h-4 w-4 mr-2" />
                确认应用结果
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
