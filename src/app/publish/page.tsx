'use client';

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  Image, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  TrendingUp, 
  ShoppingCart, 
  ArrowRight,
  Link,
  Video,
  Zap,
  DollarSign,
  Save,
  Layers,
  PlayCircle,
  Edit3,
  XCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { checkProductCompliance, getRiskLevelBadgeClass, getRiskLevelText, ComplianceCheckResult } from '@/lib/compliance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

// 模拟草稿数据
const mockDrafts = [
  {
    id: 1,
    name: '宠物自动喂食器',
    image: '🐾',
    status: 'pending',
    progress: 30,
    lastEdit: '2分钟前',
    platform: 'Shopee'
  },
  {
    id: 2,
    name: 'LED氛围灯串',
    image: '💡',
    status: 'processing',
    progress: 70,
    lastEdit: '15分钟前',
    platform: 'TikTok'
  },
  {
    id: 3,
    name: '便携手机支架',
    image: '📱',
    status: 'completed',
    progress: 100,
    lastEdit: '1小时前',
    platform: 'Lazada'
  },
];

// 模拟平台列表
const platforms = [
  { id: 'shopee', name: 'Shopee', icon: '🛒' },
  { id: 'lazada', name: 'Lazada', icon: '🛍️' },
  { id: 'tiktok', name: 'TikTok Shop', icon: '🎵' },
];

// 智能定价计算结果
interface PricingResult {
  costPrice: number;
  shippingCost: number;
  platformFee: number;
  adBudget: number;
  profitMargin: number;
  suggestedPrice: number;
  competitorPrice: number;
}

export default function PublishPage() {
  const [activeTab, setActiveTab] = useState('new');
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  
  // 目标地区选项
  const targetRegions = [
    { id: '美区', name: '美国市场', note: '需要FDA、CPC、FCC认证' },
    { id: '欧区', name: '欧洲市场', note: '需要UKCA、CE认证' },
    { id: '印尼', name: '印尼市场', note: '需要BPOM、HALAL认证' },
    { id: '泰国', name: '泰国市场', note: '需要Thai FDA、TIS认证' },
    { id: '越南', name: '越南市场', note: '需要越南FDA、COA认证' },
    { id: '马来', name: '马来西亚', note: '需要MAL、HALAL认证' }
  ];

  // 合规检查显示组件
  function ComplianceBadge({ result }: { result: ComplianceCheckResult }) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={getRiskLevelBadgeClass(result.riskLevel)}>
          {result.passed ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {getRiskLevelText(result.riskLevel)}
        </Badge>
        {result.warnings.length > 0 && (
          <AlertTriangle className="w-4 h-4 text-[#FF7D00]" />
        )}
      </div>
    );
  }

  // 商品数据
  const [productData, setProductData] = useState({
    sourceType: 'link', // link 或 manual
    link1688: '',
    productName: '',
    category: '',
    description: '',
    costPrice: '',
    platform: '',
    targetRegion: '美区'
  });
  
  // 处理选项
  const [processOptions, setProcessOptions] = useState({
    imageProcessing: true,
    listingGeneration: true,
    videoGeneration: false,
    smartPricing: true
  });

  const handleLinkInput = async () => {
    if (!productData.link1688) {
      toast.error('请输入1688商品链接');
      return;
    }
    setIsProcessing(true);
    
    // 模拟1688链接采集
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 自动填充商品信息
    setProductData({
      ...productData,
      productName: '智能宠物喂食器 手机APP远程控制定时定量投食器',
      category: 'pet',
      description: '6L大容量，支持APP远程控制，定时定量喂食，带摄像头监控',
      costPrice: '128'
    });
    
    setIsProcessing(false);
    setCurrentStep(2);
    toast.success('商品信息采集成功！');
  };

  const handleProcessOptionsChange = (option: string, checked: boolean) => {
    setProcessOptions({
      ...processOptions,
      [option]: checked
    });
  };

  const calculatePricing = async () => {
    if (!productData.costPrice) {
      toast.error('请输入成本价');
      return;
    }

    setIsProcessing(true);
    
    // 模拟智能定价计算
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cost = parseFloat(productData.costPrice);
    const result: PricingResult = {
      costPrice: cost,
      shippingCost: 25,
      platformFee: cost * 0.06,
      adBudget: cost * 0.1,
      profitMargin: 0.45,
      suggestedPrice: (cost + 25 + cost * 0.06 + cost * 0.1) / (1 - 0.45),
      competitorPrice: (cost + 25 + cost * 0.06 + cost * 0.1) / (1 - 0.45) * 0.95
    };
    
    setPricingResult(result);
    setIsProcessing(false);
    toast.success('智能定价计算完成！');
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    
    // 如果选择了智能定价，先计算定价
    if (processOptions.smartPricing) {
      await calculatePricing();
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setCurrentStep(3);
    toast.success('AI开始处理商品！');
  };

  const handleSaveDraft = () => {
    toast.success('已保存到草稿箱！');
  };

  const handlePublish = () => {
    if (!productData.platform) {
      toast.error('请选择发布平台');
      return;
    }
    toast.success('商品已发布到 ' + platforms.find(p => p.id === productData.platform)?.name + '！');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-[#F2F3F5] text-[#86909C]">待处理</Badge>;
      case 'processing':
        return <Badge className="bg-[#FFF7E8] text-[#FF7D00]">处理中</Badge>;
      case 'completed':
        return <Badge className="bg-[#E8FFEA] text-[#00B42A]">已完成</Badge>;
      default:
        return null;
    }
  };

  const steps = [
    { id: 1, name: '商品采集', icon: Link },
    { id: 2, name: '处理配置', icon: Settings },
    { id: 3, name: 'AI处理', icon: Sparkles },
    { id: 4, name: '预览发布', icon: ShoppingCart }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">上新中心</h1>
            <p className="text-[#86909C] mt-1">1688商品采集 → AI智能处理 → 一键发布多平台</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md bg-[#F2F3F5]">
            <TabsTrigger value="new" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              <Plus className="w-4 h-4 mr-2" />
              快速上新
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              <Save className="w-4 h-4 mr-2" />
              草稿箱 ({mockDrafts.length})
            </TabsTrigger>
          </TabsList>

          {/* 快速上新 */}
          <TabsContent value="new" className="mt-6">
            <Card className="card-minimal">
              <div className="p-6">
                {/* 步骤指示器 */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    {steps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div 
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                                step.id < currentStep 
                                  ? 'bg-[#00B42A] text-white' 
                                  : step.id === currentStep 
                                    ? 'bg-[#165DFF] text-white' 
                                    : 'bg-[#F2F3F5] text-[#86909C]'
                              }`}
                            >
                              {step.id < currentStep ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs mt-2 ${step.id <= currentStep ? 'text-[#1D2129]' : 'text-[#86909C]'}`}>
                              {step.name}
                            </span>
                          </div>
                          {step.id < steps.length && (
                            <div 
                              className={`w-16 h-1 mx-4 mb-6 ${
                                step.id < currentStep ? 'bg-[#00B42A]' : 'bg-[#E5E6EB]'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 步骤1：商品采集 */}
                {currentStep === 1 && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] text-center mb-6">
                      采集商品信息
                    </h3>
                    
                    {/* 采集方式选择 */}
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Button
                          variant={productData.sourceType === 'link' ? 'default' : 'ghost'}
                          onClick={() => setProductData({ ...productData, sourceType: 'link' })}
                          className={productData.sourceType === 'link' ? 'btn-primary' : 'btn-secondary'}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          1688链接采集
                        </Button>
                        <Button
                          variant={productData.sourceType === 'manual' ? 'default' : 'ghost'}
                          onClick={() => setProductData({ ...productData, sourceType: 'manual' })}
                          className={productData.sourceType === 'manual' ? 'btn-primary' : 'btn-secondary'}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          手动添加
                        </Button>
                      </div>
                    </div>

                    {productData.sourceType === 'link' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">1688商品链接</label>
                          <div className="flex gap-3">
                            <Input
                              placeholder="请粘贴1688商品详情页链接"
                              value={productData.link1688}
                              onChange={(e) => setProductData({ ...productData, link1688: e.target.value })}
                              className="input-minimal h-12"
                            />
                            <Button 
                              className="btn-primary h-12 whitespace-nowrap"
                              onClick={handleLinkInput}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  采集中...
                                </div>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  开始采集
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-[#86909C]">
                            示例：https://detail.1688.com/offer/xxx.html
                          </p>
                        </div>

                        {/* 已采集信息预览 */}
                        {productData.productName && (
                          <Card className="card-minimal bg-[#F7F8FA]">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-[#00B42A]" />
                                <span className="text-sm font-medium text-[#00B42A]">采集成功</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-[#86909C]">商品名称：</span>
                                  <span className="text-[#1D2129]">{productData.productName}</span>
                                </div>
                                <div>
                                  <span className="text-[#86909C]">参考成本价：</span>
                                  <span className="text-[#1D2129]">¥{productData.costPrice}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">商品名称</label>
                          <Input
                            placeholder="请输入商品名称"
                            value={productData.productName}
                            onChange={(e) => setProductData({ ...productData, productName: e.target.value })}
                            className="input-minimal h-12"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-[#4E5969]">类目</label>
                            <Select 
                              value={productData.category} 
                              onValueChange={(v) => setProductData({ ...productData, category: v })}
                            >
                              <SelectTrigger className="input-minimal h-12">
                                <SelectValue placeholder="请选择类目" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pet">宠物用品</SelectItem>
                                <SelectItem value="home">家居装饰</SelectItem>
                                <SelectItem value="electronics">3C数码</SelectItem>
                                <SelectItem value="beauty">美妆个护</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-[#4E5969]">目标市场</label>
                            <Select 
                              value={productData.targetRegion} 
                              onValueChange={(v) => setProductData({ ...productData, targetRegion: v })}
                            >
                              <SelectTrigger className="input-minimal h-12">
                                <SelectValue placeholder="请选择目标市场" />
                              </SelectTrigger>
                              <SelectContent>
                                {targetRegions.map((region) => (
                                  <SelectItem key={region.id} value={region.id}>
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-[#86909C]">
                              {targetRegions.find(r => r.id === productData.targetRegion)?.note}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-[#4E5969]">成本价 (¥)</label>
                            <Input
                              type="number"
                              placeholder="请输入成本价"
                              value={productData.costPrice}
                              onChange={(e) => setProductData({ ...productData, costPrice: e.target.value })}
                              className="input-minimal h-12"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">商品描述</label>
                          <Textarea
                            placeholder="请简单描述一下这个商品的功能和特点..."
                            value={productData.description}
                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                            className="input-minimal min-h-[120px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">商品图片</label>
                          <div className="border-2 border-dashed border-[#E5E6EB] rounded-lg p-8 text-center">
                            <Upload className="w-12 h-12 text-[#86909C] mx-auto mb-3" />
                            <p className="text-[#4E5969] mb-2">点击或拖拽上传图片</p>
                            <p className="text-sm text-[#86909C]">支持 JPG、PNG 格式，最多10张</p>
                            <Button variant="ghost" className="mt-4 text-[#165DFF]">
                              选择图片
                            </Button>
                          </div>
                        </div>

                        <Button 
                          className="w-full btn-primary h-12 text-base"
                          onClick={() => setCurrentStep(2)}
                        >
                          <ArrowRight className="w-5 h-5 mr-2" />
                          下一步：配置处理选项
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 步骤2：处理配置 */}
                {currentStep === 2 && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] text-center mb-6">
                      选择处理项
                    </h3>

                    <div className="space-y-4">
                      <Card className="card-minimal">
                        <div className="p-5">
                          <div className="flex items-start space-x-4">
                            <Checkbox
                              id="imageProcessing"
                              checked={processOptions.imageProcessing}
                              onCheckedChange={(checked) => handleProcessOptionsChange('imageProcessing', checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Image className="w-5 h-5 text-[#165DFF]" />
                                <label htmlFor="imageProcessing" className="font-medium text-[#1D2129] cursor-pointer">
                                  AI图片处理
                                </label>
                                <Badge className="bg-[#E8F3FF] text-[#165DFF]">P0</Badge>
                              </div>
                              <p className="text-sm text-[#86909C] mt-1">
                                智能抠图、白底替换、去水印、多语言图文翻译
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="card-minimal">
                        <div className="p-5">
                          <div className="flex items-start space-x-4">
                            <Checkbox
                              id="listingGeneration"
                              checked={processOptions.listingGeneration}
                              onCheckedChange={(checked) => handleProcessOptionsChange('listingGeneration', checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-[#165DFF]" />
                                <label htmlFor="listingGeneration" className="font-medium text-[#1D2129] cursor-pointer">
                                  Listing生成
                                </label>
                                <Badge className="bg-[#E8F3FF] text-[#165DFF]">P0</Badge>
                              </div>
                              <p className="text-sm text-[#86909C] mt-1">
                                多语言标题、五点描述、详情页、关键词挖掘
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="card-minimal">
                        <div className="p-5">
                          <div className="flex items-start space-x-4">
                            <Checkbox
                              id="videoGeneration"
                              checked={processOptions.videoGeneration}
                              onCheckedChange={(checked) => handleProcessOptionsChange('videoGeneration', checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Video className="w-5 h-5 text-[#165DFF]" />
                                <label htmlFor="videoGeneration" className="font-medium text-[#1D2129] cursor-pointer">
                                  15秒带货视频生成
                                </label>
                                <Badge className="bg-[#FFF7E8] text-[#FF7D00]">P1</Badge>
                              </div>
                              <p className="text-sm text-[#86909C] mt-1">
                                图片生成短视频，自动配音+字幕+背景音乐
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="card-minimal">
                        <div className="p-5">
                          <div className="flex items-start space-x-4">
                            <Checkbox
                              id="smartPricing"
                              checked={processOptions.smartPricing}
                              onCheckedChange={(checked) => handleProcessOptionsChange('smartPricing', checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-[#165DFF]" />
                                <label htmlFor="smartPricing" className="font-medium text-[#1D2129] cursor-pointer">
                                  智能定价
                                </label>
                                <Badge className="bg-[#E8F3FF] text-[#165DFF]">P0</Badge>
                              </div>
                              <p className="text-sm text-[#86909C] mt-1">
                                按成本、竞品价格、平台规则计算最优售价
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* 智能定价预览 */}
                    {processOptions.smartPricing && pricingResult && (
                      <Card className="card-minimal bg-[#F7F8FA]">
                        <div className="p-5">
                          <h4 className="font-medium text-[#1D2129] mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#00B42A]" />
                            智能定价明细
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#86909C]">成本价</span>
                              <span className="text-[#1D2129]">¥{pricingResult.costPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#86909C]">物流成本</span>
                              <span className="text-[#1D2129]">¥{pricingResult.shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#86909C]">平台佣金</span>
                              <span className="text-[#1D2129]">¥{pricingResult.platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#86909C]">广告预算</span>
                              <span className="text-[#1D2129]">¥{pricingResult.adBudget.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between col-span-2 pt-2 border-t border-[#E5E6EB]">
                              <span className="text-[#00B42A] font-medium">建议售价</span>
                              <span className="text-[#00B42A] font-bold text-lg">${pricingResult.suggestedPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between col-span-2">
                              <span className="text-[#86909C]">竞品参考价</span>
                              <span className="text-[#FF7D00]">${pricingResult.competitorPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    <div className="flex gap-4">
                      <Button 
                        variant="ghost" 
                        className="flex-1 btn-secondary"
                        onClick={() => setCurrentStep(1)}
                      >
                        返回上一步
                      </Button>
                      <Button 
                        className="flex-1 btn-primary"
                        onClick={startProcessing}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            准备中...
                          </div>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            开始AI处理
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 步骤3：AI处理 */}
                {currentStep === 3 && (
                  <div className="max-w-3xl mx-auto text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-[#E8F3FF] flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-[#165DFF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1D2129] mb-4">AI正在处理中</h3>
                    
                    <div className="space-y-6 max-w-md mx-auto">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#4E5969]">总体进度</span>
                          <span className="text-[#165DFF]">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>

                      {/* 处理状态卡片 */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-[#E8FFEA] rounded-lg">
                          <CheckCircle className="w-5 h-5 text-[#00B42A]" />
                          <span className="text-sm text-[#00B42A]">图片处理完成</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-[#E8F3FF] rounded-lg">
                          <div className="w-5 h-5 border-2 border-[#165DFF] border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-[#165DFF]">正在生成Listing...</span>
                        </div>
                        {processOptions.videoGeneration && (
                          <div className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-lg">
                            <AlertCircle className="w-5 h-5 text-[#86909C]" />
                            <span className="text-sm text-[#86909C]">等待生成带货视频</span>
                          </div>
                        )}
                        {processOptions.smartPricing && (
                          <div className="flex items-center gap-3 p-3 bg-[#E8FFEA] rounded-lg">
                            <CheckCircle className="w-5 h-5 text-[#00B42A]" />
                            <span className="text-sm text-[#00B42A]">智能定价计算完成</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button className="btn-primary" onClick={() => setCurrentStep(4)}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        继续预览
                      </Button>
                    </div>
                  </div>
                )}

                {/* 步骤4：预览发布 */}
                {currentStep === 4 && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-[#E8FFEA] flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-[#00B42A]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1D2129] mb-2">处理完成，请确认发布</h3>
                      <p className="text-[#86909C]">预览商品信息，选择发布平台</p>
                    </div>

                    {/* 合规检查 */}
                    {(() => {
                      const complianceResult = checkProductCompliance({
                        name: productData.productName || 'Smart Pet Feeder',
                        category: productData.category,
                        description: productData.description,
                        price: pricingResult?.suggestedPrice,
                        targetRegion: productData.targetRegion,
                        targetPlatform: productData.platform
                      });

                      return (
                        <Card className={`card-minimal mb-6 ${!complianceResult.passed ? 'border-[#F53F3F] bg-[#FFECE8]/20' : ''}`}>
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Shield className={`w-6 h-6 ${complianceResult.passed ? 'text-[#00B42A]' : 'text-[#F53F3F]'}`} />
                              <div>
                                <h4 className="font-medium text-[#1D2129]">合规检查</h4>
                                <p className="text-sm text-[#86909C]">目标市场：{productData.targetRegion}</p>
                              </div>
                              <div className="ml-auto">
                                <ComplianceBadge result={complianceResult} />
                              </div>
                            </div>

                            {/* 合规检查不通过 */}
                            {!complianceResult.passed && (
                              <div className="p-4 bg-[#FFECE8] rounded-lg border border-[#F53F3F]/30 mb-4">
                                <div className="flex items-start gap-3">
                                  <XCircle className="w-5 h-5 text-[#F53F3F] flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="font-medium text-[#F53F3F] mb-1">合规检查不通过</h5>
                                    {complianceResult.forbiddenCategory && (
                                      <p className="text-sm text-[#F53F3F]">
                                        禁售品类：{complianceResult.forbiddenCategory}
                                      </p>
                                    )}
                                    {complianceResult.forbiddenKeyword && (
                                      <p className="text-sm text-[#F53F3F]">
                                        违禁关键词：{complianceResult.forbiddenKeyword}
                                      </p>
                                    )}
                                    <p className="text-sm text-[#86909C] mt-2">
                                      该商品存在合规风险，禁止上架销售，请更换商品
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 合规警告 */}
                            {complianceResult.passed && complianceResult.warnings.length > 0 && (
                              <div className="p-4 bg-[#FFF7E8] rounded-lg border border-[#FF7D00]/30 mb-4">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-[#FF7D00] flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="font-medium text-[#FF7D00] mb-1">合规注意事项</h5>
                                    {complianceResult.warnings.map((warning, idx) => (
                                      <p key={idx} className="text-sm text-[#FF7D00]">
                                        • {warning}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 认证要求提示 */}
                            {complianceResult.certRequirements && complianceResult.certRequirements.length > 0 && (
                              <div className="p-4 bg-[#E8F3FF] rounded-lg border border-[#165DFF]/30">
                                <h5 className="font-medium text-[#165DFF] mb-2">平台认证要求</h5>
                                {complianceResult.certRequirements.map((req, idx) => (
                                  <div key={idx} className="text-sm text-[#4E5969]">
                                    <p className="mb-1"><strong>{req.region}：</strong>{req.certifications.join('、')}</p>
                                    <p className="text-xs text-[#86909C]">{req.description}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })()}

                    {/* 商品信息预览 */}
                    <Card className="card-minimal mb-6">
                      <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-24 bg-[#F2F3F5] rounded-lg flex items-center justify-center text-4xl">
                            🐾
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-[#1D2129] mb-1">
                              {productData.productName || 'Smart Pet Feeder with APP Control - Automatic Dog Cat Food Dispenser 6L Capacity'}
                            </h4>
                            <div className="flex items-center gap-3 text-sm flex-wrap">
                              <Badge className="bg-[#E8F3FF] text-[#165DFF]">
                                {productData.category === 'pet' ? '宠物用品' : 
                                 productData.category === 'home' ? '家居装饰' : 
                                 productData.category === 'electronics' ? '3C数码' : 
                                 productData.category === 'beauty' ? '美妆个护' : '未分类'}
                              </Badge>
                              <Badge className="bg-[#F2F3F5] text-[#4E5969]">
                                {productData.targetRegion}
                              </Badge>
                              <span className="text-[#00B42A] font-bold text-lg">${pricingResult?.suggestedPrice.toFixed(2) || '39.99'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E6EB]">
                          <div className="flex items-center gap-2">
                            <Image className="w-4 h-4 text-[#00B42A]" />
                            <span className="text-sm text-[#4E5969]">图片：9张</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#00B42A]" />
                            <span className="text-sm text-[#4E5969]">Listing：已优化</span>
                          </div>
                          {processOptions.videoGeneration && (
                            <div className="flex items-center gap-2">
                              <PlayCircle className="w-4 h-4 text-[#00B42A]" />
                              <span className="text-sm text-[#4E5969]">视频：15秒</span>
                            </div>
                          )}
                          {processOptions.smartPricing && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#00B42A]" />
                              <span className="text-sm text-[#4E5969]">定价：已计算</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* 选择发布平台 */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-[#4E5969]">选择发布平台</label>
                      <div className="grid grid-cols-3 gap-4">
                        {platforms.map((platform) => (
                          <Card 
                            key={platform.id}
                            className={`card-minimal cursor-pointer transition-all ${
                              productData.platform === platform.id ? 'border-[#165DFF] bg-[#E8F3FF]/50' : ''
                            }`}
                            onClick={() => setProductData({ ...productData, platform: platform.id })}
                          >
                            <div className="p-4 text-center">
                              <div className="text-3xl mb-2">{platform.icon}</div>
                              <div className="font-medium text-[#1D2129]">{platform.name}</div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        variant="ghost" 
                        className="flex-1 btn-secondary"
                        onClick={() => setCurrentStep(2)}
                      >
                        返回修改
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="btn-secondary"
                        onClick={handleSaveDraft}
                        disabled={(() => {
                          const complianceResult = checkProductCompliance({
                            name: productData.productName || 'Smart Pet Feeder',
                            category: productData.category,
                            description: productData.description,
                            price: pricingResult?.suggestedPrice,
                            targetRegion: productData.targetRegion,
                            targetPlatform: productData.platform
                          });
                          return !complianceResult.passed;
                        })()}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        存入草稿
                      </Button>
                      <Button 
                        className="flex-1 btn-primary"
                        onClick={handlePublish}
                        disabled={(() => {
                          const complianceResult = checkProductCompliance({
                            name: productData.productName || 'Smart Pet Feeder',
                            category: productData.category,
                            description: productData.description,
                            price: pricingResult?.suggestedPrice,
                            targetRegion: productData.targetRegion,
                            targetPlatform: productData.platform
                          });
                          return !complianceResult.passed || !productData.platform;
                        })()}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        立即发布
                      </Button>
                    </div>
                    
                    {(() => {
                      const complianceResult = checkProductCompliance({
                        name: productData.productName || 'Smart Pet Feeder',
                        category: productData.category,
                        description: productData.description,
                        price: pricingResult?.suggestedPrice,
                        targetRegion: productData.targetRegion,
                        targetPlatform: productData.platform
                      });
                      
                      if (!complianceResult.passed) {
                        return (
                          <p className="text-center text-sm text-[#F53F3F]">
                            该商品存在合规风险，无法发布
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* 草稿箱 */}
          <TabsContent value="drafts" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDrafts.map((draft) => (
                <Card key={draft.id} className="card-minimal">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-[#F2F3F5] flex items-center justify-center text-2xl">
                        {draft.image}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(draft.status)}
                        <Badge className="bg-[#E8F3FF] text-[#165DFF]">{draft.platform}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-[#1D2129] mb-2">{draft.name}</h3>
                    <p className="text-sm text-[#86909C] mb-4">最后编辑：{draft.lastEdit}</p>
                    <Progress value={draft.progress} className="h-2 mb-4" />
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 text-[#165DFF]">
                        <Edit3 className="w-4 h-4 mr-1" />
                        继续编辑
                      </Button>
                      {draft.status === 'completed' && (
                        <Button size="sm" className="flex-1 btn-primary">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          上架
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
