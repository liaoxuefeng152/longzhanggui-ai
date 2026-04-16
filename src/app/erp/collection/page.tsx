'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { toast } from 'sonner';
import {
  Upload,
  Link2,
  Package,
  CheckCircle,
  Clock,
  Loader2,
  Sparkles,
  Store,
  ArrowRight,
  Zap,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Globe,
  Trash2,
  Plus,
} from 'lucide-react';

// 一键上架工作流状态
type WorkflowStep = 'collect' | 'optimize' | 'price' | 'publish';

interface CollectionItem {
  id: string;
  name: string;
  sourceUrl: string;
  costPrice: number;
  images: string[];
  category?: string;
}

interface PublishConfig {
  platforms: string[];
  stores: string[];
  title: string;
  description: string;
  price: number;
  images: string[];
}

export default function CollectionCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // 工作流状态
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('collect');
  const [workflowProgress, setWorkflowProgress] = useState(0);
  
  // 采集表单
  const [collectUrl, setCollectUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [collectionItem, setCollectionItem] = useState<CollectionItem | null>(null);
  
  // 优化表单
  const [optimizeForm, setOptimizeForm] = useState({
    title: '',
    description: '',
    keywords: '',
  });
  
  // 定价表单
  const [priceForm, setPriceForm] = useState({
    costPrice: 0,
    logistics: 0,
    commission: 0,
    targetProfit: 30,
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  // 发布配置
  const [publishConfig, setPublishConfig] = useState<PublishConfig>({
    platforms: ['tiktok'],
    stores: [],
    title: '',
    description: '',
    price: 0,
    images: [],
  });

  // 从选品页面跳转
  const sourceProduct = searchParams.get('product');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    // 如果从选品页面跳转，自动填充商品名称
    if (sourceProduct) {
      setCollectionItem({
        id: `COL-${Date.now()}`,
        name: decodeURIComponent(sourceProduct),
        sourceUrl: '',
        costPrice: 0,
        images: [],
      });
      setCurrentStep('collect');
    }
  }, [router, sourceProduct]);

  // 计算售价
  useEffect(() => {
    const totalCost = priceForm.costPrice + priceForm.logistics;
    const platformFee = (totalCost * priceForm.commission) / 100;
    const sellingPrice = (totalCost + platformFee) / ((100 - priceForm.targetProfit) / 100);
    setCalculatedPrice(Math.round(sellingPrice * 100) / 100);
  }, [priceForm]);

  // 预览采集
  const handlePreview = async () => {
    if (!collectUrl) {
      toast.error('请输入商品链接');
      return;
    }

    if (!collectUrl.includes('1688.com') && !collectUrl.includes('amazon.com')) {
      toast.error('请输入有效的1688或Amazon商品链接');
      return;
    }

    setLoading(true);
    try {
      // 模拟预览
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('预览成功');
    } catch (error) {
      toast.error('预览失败');
    } finally {
      setLoading(false);
    }
  };

  // 采集商品
  const handleCollect = async () => {
    if (!collectUrl && !collectionItem?.name) {
      toast.error('请输入商品链接或商品名称');
      return;
    }

    setLoading(true);
    setWorkflowProgress(10);

    try {
      // 模拟采集
      await new Promise(resolve => setTimeout(resolve, 1500));
      setWorkflowProgress(30);

      const item: CollectionItem = {
        id: `COL-${Date.now()}`,
        name: collectionItem?.name || '采集商品',
        sourceUrl: collectUrl || 'https://detail.1688.com/offer/1234567890.html',
        costPrice: 45 + Math.random() * 50,
        images: [`https://picsum.photos/400?random=${Date.now()}`],
        category: '宠物用品',
      };

      setCollectionItem(item);
      setOptimizeForm({
        title: item.name,
        description: '',
        keywords: '',
      });
      setPriceForm(prev => ({ ...prev, costPrice: item.costPrice }));
      
      setWorkflowProgress(60);
      toast.success('采集成功');
      setCurrentStep('optimize');
    } catch (error) {
      toast.error('采集失败');
    } finally {
      setLoading(false);
      setWorkflowProgress(0);
    }
  };

  // AI优化标题描述
  const handleOptimize = async () => {
    if (!optimizeForm.title) {
      toast.error('请输入商品标题');
      return;
    }

    setLoading(true);
    setWorkflowProgress(70);

    try {
      // 模拟AI优化
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOptimizeForm(prev => ({
        ...prev,
        description: prev.description || `${prev.title} - 高品质、实用性强、性价比高。适合各种场景使用，是您理想的选择。`,
        keywords: prev.keywords || 'pet supplies, pet fountain, water dispenser, cat, dog',
      }));

      setWorkflowProgress(85);
      toast.success('AI优化完成');
      setCurrentStep('price');
    } catch (error) {
      toast.error('优化失败');
    } finally {
      setLoading(false);
      setWorkflowProgress(0);
    }
  };

  // 发布到平台
  const handlePublish = async () => {
    if (publishConfig.platforms.length === 0) {
      toast.error('请选择至少一个平台');
      return;
    }

    setLoading(true);
    setWorkflowProgress(90);

    try {
      // 模拟发布
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWorkflowProgress(100);
      toast.success(`发布成功！已上架到 ${publishConfig.platforms.join('、')} 平台`);
      
      // 重置流程
      setTimeout(() => {
        setCurrentStep('collect');
        setCollectionItem(null);
        setOptimizeForm({ title: '', description: '', keywords: '' });
        setPublishConfig({
          platforms: ['tiktok'],
          stores: [],
          title: '',
          description: '',
          price: 0,
          images: [],
        });
        setWorkflowProgress(0);
      }, 1500);
    } catch (error) {
      toast.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量采集
  const handleBatchCollect = async () => {
    if (!batchUrls.trim()) {
      toast.error('请输入商品链接');
      return;
    }

    const urls = batchUrls.split('\n').filter((url: string) => url.trim());
    if (urls.length === 0) {
      toast.error('请输入至少一个有效的商品链接');
      return;
    }

    setLoading(true);
    try {
      // 模拟批量采集
      await new Promise(resolve => setTimeout(resolve, urls.length * 500));
      toast.success(`批量采集完成，成功添加 ${urls.length} 个商品`);
      setBatchUrls('');
    } catch (error) {
      toast.error('批量采集失败');
    } finally {
      setLoading(false);
    }
  };

  const getStepLabel = (step: WorkflowStep) => {
    const labels: Record<WorkflowStep, string> = {
      collect: '采集',
      optimize: 'AI优化',
      price: '定价',
      publish: '发布',
    };
    return labels[step];
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
              <Upload className="h-6 w-6 text-primary" />
              一键采集上架
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              采集 → AI优化 → 智能定价 → 一键发布到多平台
            </p>
          </div>
        </div>

        {/* 工作流进度 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {(['collect', 'optimize', 'price', 'publish'] as WorkflowStep[]).map((step, idx) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step ? 'bg-primary text-white' :
                      ['collect', 'optimize', 'price', 'publish'].indexOf(currentStep) > idx ? 'bg-green-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {['collect', 'optimize', 'price', 'publish'].indexOf(currentStep) > idx ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-[12px] mt-2 ${currentStep === step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {getStepLabel(step)}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-[2px] mx-4 ${
                      ['collect', 'optimize', 'price', 'publish'].indexOf(currentStep) > idx ? 'bg-green-500' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {loading && (
              <Progress value={workflowProgress} className="mt-4 h-1" />
            )}
          </CardContent>
        </Card>

        {/* 步骤1: 采集 */}
        {currentStep === 'collect' && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  单链接采集
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground">商品名称（可选）</label>
                  <Input
                    placeholder="从选品页跳转时自动填充"
                    value={collectionItem?.name || ''}
                    onChange={(e) => setCollectionItem(prev => prev ? { ...prev, name: e.target.value } : { id: '', name: e.target.value, sourceUrl: '', costPrice: 0, images: [] })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground">1688商品链接</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="粘贴1688商品链接"
                      value={collectUrl}
                      onChange={(e) => setCollectUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                    >
                      预览
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleCollect}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      采集中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      开始采集
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  批量采集
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground">1688商品链接（每行一个）</label>
                  <Textarea
                    placeholder="https://detail.1688.com/offer/1234567890.html&#10;https://detail.1688.com/offer/0987654321.html"
                    value={batchUrls}
                    onChange={(e) => setBatchUrls(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleBatchCollect}
                  disabled={loading}
                  className="w-full gap-2"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      采集中...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      批量采集
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 步骤2: AI优化 */}
        {currentStep === 'optimize' && collectionItem && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px] flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI智能优化
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">商品标题</label>
                    <Input
                      value={optimizeForm.title}
                      onChange={(e) => setOptimizeForm({ ...optimizeForm, title: e.target.value })}
                      placeholder="输入商品标题"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">关键词（英文逗号分隔）</label>
                    <Input
                      value={optimizeForm.keywords}
                      onChange={(e) => setOptimizeForm({ ...optimizeForm, keywords: e.target.value })}
                      placeholder="pet, water, fountain, cat"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground">商品描述</label>
                    <Textarea
                      value={optimizeForm.description}
                      onChange={(e) => setOptimizeForm({ ...optimizeForm, description: e.target.value })}
                      placeholder="输入商品描述"
                      rows={5}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-[12px] text-muted-foreground mb-2">商品图片</div>
                  <div className="grid grid-cols-3 gap-2">
                    {collectionItem.images.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img src={img} alt={`商品图片 ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    采集来源: {collectionItem.sourceUrl || '手动输入'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('collect')}
                >
                  上一步
                </Button>
                <Button
                  onClick={handleOptimize}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI优化中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI一键优化
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤3: 定价 */}
        {currentStep === 'price' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px] flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                智能定价
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground">成本价 (¥)</label>
                  <Input
                    type="number"
                    value={priceForm.costPrice}
                    onChange={(e) => setPriceForm({ ...priceForm, costPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground">物流费 (¥)</label>
                  <Input
                    type="number"
                    value={priceForm.logistics}
                    onChange={(e) => setPriceForm({ ...priceForm, logistics: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground">平台佣金 (%)</label>
                  <Input
                    type="number"
                    value={priceForm.commission}
                    onChange={(e) => setPriceForm({ ...priceForm, commission: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground">目标利润率 (%)</label>
                  <Input
                    type="number"
                    value={priceForm.targetProfit}
                    onChange={(e) => setPriceForm({ ...priceForm, targetProfit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-muted-foreground">建议售价</p>
                    <p className="text-[32px] font-bold text-primary">${calculatedPrice}</p>
                    <p className="text-[12px] text-muted-foreground">
                      成本: ¥{(priceForm.costPrice + priceForm.logistics).toFixed(2)} | 利润率: {priceForm.targetProfit}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-muted-foreground">预计利润</p>
                    <p className="text-[24px] font-bold text-green-500">
                      ${(calculatedPrice * (priceForm.targetProfit / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('optimize')}
                >
                  上一步
                </Button>
                <Button
                  onClick={() => {
                    setPublishConfig(prev => ({
                      ...prev,
                      title: optimizeForm.title,
                      description: optimizeForm.description,
                      price: calculatedPrice,
                      images: collectionItem?.images || [],
                    }));
                    setCurrentStep('publish');
                  }}
                  className="gap-2"
                >
                  下一步
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤4: 发布 */}
        {currentStep === 'publish' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px] flex items-center gap-2">
                <Store className="h-4 w-4" />
                选择发布平台
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'tiktok', name: 'TikTok Shop', icon: '📱' },
                  { id: 'shopee', name: 'Shopee', icon: '🛒' },
                  { id: 'lazada', name: 'Lazada', icon: '📦' },
                ].map((platform) => (
                  <div
                    key={platform.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      publishConfig.platforms.includes(platform.id)
                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setPublishConfig(prev => ({
                        ...prev,
                        platforms: prev.platforms.includes(platform.id)
                          ? prev.platforms.filter(p => p !== platform.id)
                          : [...prev.platforms, platform.id],
                      }));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl">
                        {platform.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-[11px] text-muted-foreground">推荐指数: ★★★</p>
                      </div>
                      {publishConfig.platforms.includes(platform.id) && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-[14px] font-medium mb-3">发布预览</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {collectionItem?.images[0] && (
                        <img src={collectionItem.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[14px]">{optimizeForm.title}</p>
                      <p className="text-[12px] text-muted-foreground mt-1">售价: ${publishConfig.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-muted-foreground">发布到</p>
                    <p className="font-medium">{publishConfig.platforms.join('、')}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('price')}
                >
                  上一步
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={loading}
                  className="gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      发布中...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      一键发布到 {publishConfig.platforms.length} 个平台
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
