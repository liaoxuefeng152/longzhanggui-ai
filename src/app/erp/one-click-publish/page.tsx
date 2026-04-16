'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronRight,
  ChevronLeft,
  Rocket,
  Sparkles,
  ImageIcon,
  FileText,
  DollarSign,
  Store,
  CheckCircle,
  Loader2,
  Play,
  SkipForward,
  Zap,
  Globe,
  Package,
  RefreshCw,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

// 步骤定义
const STEPS = [
  { id: 1, name: '采集商品', icon: Package },
  { id: 2, name: 'AI处理', icon: Sparkles },
  { id: 3, name: '确认发布', icon: Rocket },
];

// 平台选项
const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok Shop', regions: [
    { value: 'my', label: '马来西亚' },
    { value: 'id', label: '印尼' },
    { value: 'th', label: '泰国' },
    { value: 'vn', label: '越南' },
    { value: 'ph', label: '菲律宾' },
  ]},
  { value: 'amazon', label: 'Amazon', regions: [
    { value: 'us', label: '美国' },
    { value: 'uk', label: '英国' },
    { value: 'de', label: '德国' },
    { value: 'jp', label: '日本' },
  ]},
  { value: 'shopee', label: 'Shopee', regions: [
    { value: 'my', label: '马来西亚' },
    { value: 'sg', label: '新加坡' },
    { value: 'id', label: '印尼' },
    { value: 'th', label: '泰国' },
    { value: 'vn', label: '越南' },
    { value: 'ph', label: '菲律宾' },
  ]},
];

// 语言映射
const LANGUAGE_MAP: Record<string, string> = {
  my: 'ms',  // 马来语
  id: 'id',  // 印尼语
  th: 'th',  // 泰语
  vn: 'vi',  // 越南语
  ph: 'en',  // 英语
  us: 'en',  // 英语
  uk: 'en',  // 英语
  de: 'de',  // 德语
  jp: 'ja',  // 日语
  sg: 'en',  // 英语
};

export default function OneClickPublishPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // 当前步骤
  const [currentStep, setCurrentStep] = useState(1);
  
  // 采集状态
  const [collectUrl, setCollectUrl] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedProduct, setCollectedProduct] = useState<any>(null);
  
  // AI处理状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  
  // 发布配置
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);

  // 编辑状态
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 获取当前平台信息
  const getCurrentPlatform = () => {
    return PLATFORMS.find(p => p.value === selectedPlatform);
  };

  const getCurrentRegion = () => {
    const platform = getCurrentPlatform();
    return platform?.regions.find(r => r.value === selectedRegion);
  };

  // 步骤1：采集商品
  const handleCollect = async () => {
    if (!collectUrl) {
      toast.error('请输入1688商品链接');
      return;
    }

    setIsCollecting(true);
    try {
      // 模拟采集过程
      setProcessingStatus('正在获取商品信息...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟采集到的数据
      const product = {
        name_zh: '宠物自动饮水机 3.5L 超静音循环过滤',
        name_en: '',
        supplier: '义乌市宠物用品有限公司',
        source_url: collectUrl,
        source_id: '1234567890',
        cost_price: 45,
        domestic_shipping: 5,
        first_mile_shipping: 15,
        total_cost: 65,
        weight_kg: 1.2,
        dimensions: { length: 20, width: 20, height: 25 },
        images: [
          'https://picsum.photos/400/400?random=1',
          'https://picsum.photos/400/400?random=2',
          'https://picsum.photos/400/400?random=3',
        ],
        category: '宠物用品 > 宠物饮水器',
        attributes: [
          { name: '容量', value: '3.5L' },
          { name: '材质', value: 'ABS塑料' },
          { name: '颜色', value: '白色/粉色/蓝色' },
        ],
      };
      
      setCollectedProduct(product);
      setEditForm({
        name: product.name_zh,
        price: product.cost_price,
        images: product.images,
      });
      
      toast.success('采集成功！');
      setCurrentStep(2);
    } catch (error) {
      console.error('采集失败:', error);
      toast.error('采集失败，请检查链接是否正确');
    } finally {
      setIsCollecting(false);
      setProcessingStatus('');
    }
  };

  // 步骤2：AI自动处理
  const handleAIProcess = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // 1. 生成英文标题
      setProcessingStatus('AI正在生成英文标题...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(20);
      
      // 2. 生成五点描述
      setProcessingStatus('AI正在生成五点描述...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(40);
      
      // 3. 生成详细描述
      setProcessingStatus('AI正在生成详细描述...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(60);
      
      // 4. 生成关键词
      setProcessingStatus('AI正在生成关键词...');
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingProgress(80);
      
      // 5. 计算定价
      setProcessingStatus('AI正在计算最优定价...');
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingProgress(100);

      // 模拟AI生成结果
      const result = {
        title_en: 'Pet Water Fountain, 3.5L Automatic Cat Water Dispenser, Ultra Quiet Pump, Triple Filtration System for Cats Dogs',
        title_id: 'Fountain Air Hewan Peliharaan, 3.5L Dispenser Air Otomatis, Pompa Ultra Tenang, Sistem Filtrasi Triple',
        title_th: 'บ่อน้ำสัตว์เลี้ยง อัตโนมัติ 3.5L ปั๊มเงียบพิเศษ ระบบกรองสามชั้น สำหรับแมวและสุนัข',
        title_my: 'Fountain Air Haiwan, 3.5L Dispenser Air Automatik, Pam Ultra Senyap, Sistem Penapisan Triple untuk Kucing Anjing',
        title_vi: 'Máyphao nước thú cưng, 3.5L Máy phát nước tự động, Bơm siêu yên tĩnh, Hệ thống lọc ba lớp cho mèo chó',
        bullet_points: [
          '【Triple Filtration】3-layer filtration system keeps water fresh and clean, ensures your pets stay healthy',
          '【Ultra Quiet Pump】Whisper-quiet operation (<30dB), perfect for noise-sensitive pets and light sleepers',
          '【Large Capacity】3.5L water tank holds enough water for 7+ days, reduces refilling frequency',
          '【Smart Sensor】Built-in infrared sensor detects water level, auto shut-off when water is low',
          '【Premium Quality】BPA-free materials, FDA approved, safe for both cats and dogs',
        ],
        description: `Keep your beloved pets hydrated with our Premium Pet Water Fountain!

This automatic water dispenser features:
• Food-grade ABS material, BPA-free and safe
• Triple filtration system removes impurities and odors
• Ultra-quiet pump (<30dB) won't scare timid pets
• 3.5L large capacity, lasts 7+ days
• LED indicator shows water level
• USB powered, convenient to use

Perfect for cats and dogs of all sizes.`,
        keywords: ['pet water fountain', 'cat water dispenser', 'automatic pet bowl', 'dog water fountain', 'pet drinking fountain'],
        suggested_price: {
          USD: 29.99,
          MYR: 89.90,
          IDR: 299000,
          THB: 699,
          VND: 549000,
        },
        profit_margin: 35.5,
      };

      setAiResult(result);
      setEditForm({
        ...editForm,
        ...result,
      });

      toast.success('AI处理完成！');
      setCurrentStep(3);
    } catch (error) {
      console.error('AI处理失败:', error);
      toast.error('AI处理失败');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      setProcessingProgress(0);
    }
  };

  // 跳过AI处理，直接进入确认发布
  const handleSkipAI = () => {
    setAiResult({
      title_en: collectedProduct.name_zh,
      bullet_points: [],
      description: '',
      keywords: [],
      suggested_price: {},
    });
    setCurrentStep(3);
  };

  // 步骤3：确认发布
  const handlePublish = async () => {
    if (!selectedPlatform) {
      toast.error('请选择目标平台');
      return;
    }
    if (!selectedRegion) {
      toast.error('请选择目标站点');
      return;
    }

    setIsPublishing(true);
    try {
      const { default: store } = await import('@/lib/store');
      
      // 生成语言代码
      const language = LANGUAGE_MAP[selectedRegion] || 'en';
      const titleField = `title_${language}` as keyof typeof aiResult;
      const title = aiResult[titleField] || aiResult.title_en || editForm.name;
      const price = aiResult.suggested_price?.[selectedRegion === 'us' ? 'USD' : selectedRegion.toUpperCase()] || editForm.price;
      const currency = selectedRegion === 'us' ? 'USD' : selectedRegion.toUpperCase();

      // 1. 创建商品
      const productId = `PROD-${Date.now()}`;
      
      // 2. 添加到公用采集箱并标记为已认领
      store.addToPublicCollection({
        collection_id: `COL-${Date.now()}`,
        product_id: productId,
        product_name: collectedProduct.name_zh,
        product_name_en: aiResult.title_en,
        source: '1688',
        source_url: collectedProduct.source_url,
        source_id: collectedProduct.source_id,
        supplier_name: collectedProduct.supplier,
        cost_price: collectedProduct.cost_price,
        images: collectedProduct.images,
        category: collectedProduct.category,
      });

      // 3. 创建正式商品
      store.createProduct({
        name_zh: collectedProduct.name_zh,
        name_en: aiResult.title_en,
        internal_sku: `SKU-${Date.now()}`,
        cost_price: collectedProduct.cost_price,
        domestic_shipping: collectedProduct.domestic_shipping,
        first_mile_shipping: collectedProduct.first_mile_shipping,
        total_cost: collectedProduct.total_cost,
        category: collectedProduct.category,
        supplier_name: collectedProduct.supplier,
        source_url: collectedProduct.source_url,
        weight_kg: collectedProduct.weight_kg,
        dimensions: collectedProduct.dimensions,
        images: collectedProduct.images?.map((url: string, idx: number) => ({
          id: `IMG-${Date.now()}-${idx}`,
          original_url: url,
          type: idx === 0 ? 'main' : 'gallery',
          status: 'done',
          created_at: new Date().toISOString(),
        })),
        platform_listings: [{
          id: `PL-${Date.now()}`,
          platform: selectedPlatform as 'tiktok' | 'amazon' | 'shopee',
          shop_id: `${selectedPlatform}-shop-1`,
          shop_name: `${getCurrentPlatform()?.label} - ${getCurrentRegion()?.label}`,
          region: selectedRegion,
          status: 'listed',
          listed_at: new Date().toISOString(),
          listing_title: title,
          listing_description: aiResult.description,
          bullet_points: aiResult.bullet_points,
          keywords: aiResult.keywords,
          sale_price: price,
          currency: currency,
        }],
        status: 'published',
      } as any);

      toast.success('发布成功！');
      
      // 延迟跳转到商品详情
      setTimeout(() => {
        router.push('/erp/products');
      }, 1500);
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('发布失败');
    } finally {
      setIsPublishing(false);
    }
  };

  // 获取货币符号
  const getCurrencySymbol = (region: string) => {
    const symbols: Record<string, string> = {
      us: '$', my: 'RM', id: 'Rp', th: '฿', vn: '₫', 
      uk: '£', de: '€', jp: '¥', sg: 'S$', ph: '₱',
    };
    return symbols[region] || '$';
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="container py-8 max-w-5xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-3">
            <Zap className="h-7 w-7 text-[#FF7D00]500" />
            一键上链接流
          </h1>
          <p className="text-muted-foreground mt-2">
            输入链接 → AI自动处理 → 一键发布到多平台
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-success text-white' :
                    isActive ? 'bg-[#FF7D00]500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`text-sm mt-2 ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-24 h-0.5 mx-2 ${
                    isCompleted ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* 步骤内容 */}
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            {/* 步骤1：采集商品 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Package className="h-12 w-12 mx-auto mb-3 text-[#FF7D00]500" />
                  <h2 className="text-lg font-semibold">步骤1：采集商品</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    输入1688商品链接，系统将自动获取商品信息
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>1688商品链接</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="https://detail.1688.com/offer/xxx.html"
                        value={collectUrl}
                        onChange={(e) => setCollectUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleCollect} 
                        disabled={isCollecting || !collectUrl}
                        className="bg-[#FF7D00]500 hover:bg-[#FF7D00]600"
                      >
                        {isCollecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            采集中...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            采集
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 预览区域 */}
                  {collectedProduct && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                          {collectedProduct.images?.[0] && (
                            <img 
                              src={collectedProduct.images[0]} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="font-medium">{collectedProduct.name_zh}</div>
                          <div className="text-sm text-muted-foreground">
                            供应商: {collectedProduct.supplier}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#FF7D00]500 font-semibold">
                              ¥{collectedProduct.cost_price}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {collectedProduct.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {collectedProduct.images?.slice(1, 4).map((img: string, idx: number) => (
                          <div key={idx} className="w-16 h-16 bg-muted rounded overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 步骤2：AI处理 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-[#165DFF]500" />
                  <h2 className="text-lg font-semibold">步骤2：AI自动处理</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI将自动生成多语言标题、描述、关键词，并计算最优定价
                  </p>
                </div>

                {/* 处理进度 */}
                {isProcessing && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-[#165DFF]500" />
                      <span className="text-sm">{processingStatus}</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                )}

                {/* 处理完成预览 */}
                {!isProcessing && aiResult && (
                  <div className="space-y-4">
                    {/* 标题预览 */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">AI生成标题（英文）</Label>
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        {aiResult.title_en}
                      </div>
                    </div>

                    {/* 五点描述 */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">五点描述</Label>
                      <div className="space-y-1">
                        {aiResult.bullet_points.map((point: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 定价建议 */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">AI建议售价</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(aiResult.suggested_price).map(([currency, price]) => (
                          <div key={currency} className="p-2 bg-muted/50 rounded text-center">
                            <div className="text-xs text-muted-foreground">{currency}</div>
                            <div className="font-medium">{(price as number).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-success flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        预估利润率: {aiResult.profit_margin}%
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    上一步
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSkipAI}>
                      跳过AI处理
                    </Button>
                    <Button 
                      onClick={handleAIProcess} 
                      disabled={isProcessing}
                      className="bg-[#165DFF]500 hover:bg-[#165DFF]600"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI自动处理
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤3：确认发布 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Rocket className="h-12 w-12 mx-auto mb-3 text-success" />
                  <h2 className="text-lg font-semibold">步骤3：确认并发布</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    选择目标平台和站点，确认信息后一键发布
                  </p>
                </div>

                {/* 平台选择 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.value}
                        onClick={() => {
                          setSelectedPlatform(platform.value);
                          setSelectedRegion('');
                        }}
                        className={`p-4 border rounded-lg text-center transition-all ${
                          selectedPlatform === platform.value
                            ? 'border-orange-500 bg-[#FF7D00]50'
                            : 'hover:border-orange-200'
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {platform.value === 'tiktok' ? '📱' : 
                           platform.value === 'amazon' ? '📦' : '🛒'}
                        </div>
                        <div className="text-sm font-medium">{platform.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* 站点选择 */}
                  {selectedPlatform && (
                    <div className="space-y-2">
                      <Label>选择目标站点</Label>
                      <div className="flex flex-wrap gap-2">
                        {getCurrentPlatform()?.regions.map((region) => (
                          <button
                            key={region.value}
                            onClick={() => setSelectedRegion(region.value)}
                            className={`px-4 py-2 border rounded-full text-sm transition-all ${
                              selectedRegion === region.value
                                ? 'border-orange-500 bg-[#FF7D00]500 text-white'
                                : 'hover:border-orange-200'
                            }`}
                          >
                            {region.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 预览信息 */}
                  {selectedPlatform && selectedRegion && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span>{getCurrentPlatform()?.label} - {getCurrentRegion()?.label}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">商品标题</Label>
                          <div className="p-2 bg-muted/50 rounded text-sm">
                            {aiResult?.[`title_${LANGUAGE_MAP[selectedRegion]}` as keyof typeof aiResult] || 
                             aiResult?.title_en || 
                             collectedProduct?.name_zh}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">成本</Label>
                            <div className="text-lg font-semibold text-[#FF7D00]500">
                              ¥{collectedProduct?.cost_price}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">建议售价</Label>
                            <div className="text-lg font-semibold text-success">
                              {getCurrencySymbol(selectedRegion)}
                              {aiResult?.suggested_price?.[selectedRegion === 'us' ? 'USD' : selectedRegion.toUpperCase()] || 
                               collectedProduct?.cost_price * 2}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    上一步
                  </Button>
                  <Button 
                    onClick={handlePublish} 
                    disabled={isPublishing || !selectedPlatform || !selectedRegion}
                    className="bg-success hover:bg-success/90"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        发布中...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        一键发布
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>系统将自动处理图片、生成Listing、计算定价</p>
          <p className="mt-1">发布后可前往「商品管理」进一步编辑</p>
        </div>
      </div>
    </MainLayout>
  );
}
