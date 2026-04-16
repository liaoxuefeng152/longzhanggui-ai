'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Upload,
  CheckCircle,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Video,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
} from 'lucide-react';
import { toast } from 'sonner';

// 步骤
const STEPS = [
  { id: 1, name: '添加商品', description: '采集或手动添加商品' },
  { id: 2, name: '选择处理项', description: '勾选需要AI处理的内容' },
  { id: 3, name: 'AI处理中', description: '实时处理进度' },
  { id: 4, name: '预览确认', description: '查看结果并发布' },
];

export default function PublishPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // 步骤控制
  const [currentStep, setCurrentStep] = useState(1);

  // 商品信息
  const [productName, setProductName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [targetMarket, setTargetMarket] = useState('shopee_sg');

  // 处理项选择
  const [processImages, setProcessImages] = useState(true);
  const [imageWhiteBg, setImageWhiteBg] = useState(true);
  const [imageTranslate, setImageTranslate] = useState(true);
  const [imageOptimize, setImageOptimize] = useState(false);
  
  const [processListing, setProcessListing] = useState(true);
  const [listingLangs, setListingLangs] = useState<string[]>(['en', 'id']);
  
  const [processPricing, setProcessPricing] = useState(true);
  const [targetProfit, setTargetProfit] = useState('30');
  
  const [processVideo, setProcessVideo] = useState(false);
  const [videoVoice, setVideoVoice] = useState('female');
  const [videoMusic, setVideoMusic] = useState('pop');

  // 处理进度
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  // 下一步
  const handleNext = () => {
    if (currentStep === 1) {
      if (!productName) {
        toast.error('请输入商品名称');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      startProcessing();
    } else if (currentStep === 4) {
      toast.success('发布成功！');
      router.push('/drafts');
    }
  };

  // 上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 开始处理
  const startProcessing = () => {
    setCurrentStep(3);
    setProcessing(true);
    setProgress(0);

    const steps = [
      '图片处理 - 抠图白底化...',
      '图片处理 - 图片翻译...',
      'Listing生成 - 英文标题...',
      'Listing生成 - 印尼语标题...',
      '智能定价 - 计算最优售价...',
    ];

    let stepIndex = 0;
    const totalSteps = steps.length;

    const interval = setInterval(() => {
      stepIndex++;
      const newProgress = Math.round((stepIndex / totalSteps) * 100);
      setProgress(newProgress);
      
      if (stepIndex <= steps.length) {
        setProcessingStatus(steps[stepIndex - 1]);
      }

      if (stepIndex >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          setProcessing(false);
          setCurrentStep(4);
          toast.success('所有处理完成！');
        }, 500);
      }
    }, 800);
  };

  // 切换Listing语言
  const toggleListingLang = (lang: string) => {
    setListingLangs(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  // 保存草稿
  const handleSaveDraft = () => {
    toast.success('已保存到草稿箱');
    router.push('/drafts');
  };

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')} useNewNavigation={true}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-orange-500" />
            快速上新 - 第{currentStep}步：{STEPS[currentStep - 1].name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center gap-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
              <span className={`text-sm ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.name}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* 步骤1：添加商品 */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">方式A：1688链接采集</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="输入1688商品链接..." 
                  className="flex-1" 
                />
                <Button>采集</Button>
              </div>
            </CardContent>

            <CardHeader className="pb-3 pt-6">
              <CardTitle className="text-[14px]">或</CardTitle>
            </CardHeader>

            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">方式B：手动添加</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>商品名称</Label>
                  <Input 
                    placeholder="请输入商品名称" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>目标市场</Label>
                  <Select value={targetMarket} onValueChange={setTargetMarket}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopee_sg">Shopee 新加坡</SelectItem>
                      <SelectItem value="shopee_my">Shopee 马来西亚</SelectItem>
                      <SelectItem value="shopee_th">Shopee 泰国</SelectItem>
                      <SelectItem value="lazada_sg">Lazada 新加坡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>成本价格</Label>
                  <Input 
                    placeholder="请输入成本价格" 
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    prefix="¥"
                  />
                </div>
                <div className="space-y-2">
                  <Label>商品图片</Label>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    上传图片
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardHeader className="pb-3 pt-6">
              <CardTitle className="text-[14px]">或</CardTitle>
            </CardHeader>

            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">方式C：从选品队列添加</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-3">选品队列中的商品（3个）：</p>
                <div className="space-y-2">
                  {[
                    { name: '宠物自动饮水机', cost: 45 },
                    { name: '无线蓝牙耳机', cost: 68 },
                  ].map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">成本 ¥{product.cost}</div>
                      </div>
                      <Button size="sm">选择</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardContent className="pt-6 flex justify-end">
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleNext}>
                下一步 → 选择处理项
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 步骤2：选择处理项 */}
        {currentStep === 2 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">当前商品：{productName || '宠物自动饮水机 3.5L'}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* AI处理图片 */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="processImages" 
                    checked={processImages} 
                    onCheckedChange={(checked) => setProcessImages(checked as boolean)} 
                  />
                  <Label htmlFor="processImages" className="text-base font-medium">
                    AI处理图片
                  </Label>
                </div>
                {processImages && (
                  <div className="ml-7 space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="imageWhiteBg" 
                        checked={imageWhiteBg} 
                        onCheckedChange={(checked) => setImageWhiteBg(checked as boolean)} 
                      />
                      <Label htmlFor="imageWhiteBg">抠图白底化</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="imageTranslate" 
                        checked={imageTranslate} 
                        onCheckedChange={(checked) => setImageTranslate(checked as boolean)} 
                      />
                      <Label htmlFor="imageTranslate">图片翻译（英文）</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="imageOptimize" 
                        checked={imageOptimize} 
                        onCheckedChange={(checked) => setImageOptimize(checked as boolean)} 
                      />
                      <Label htmlFor="imageOptimize">图片优化</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* 生成Listing */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="processListing" 
                    checked={processListing} 
                    onCheckedChange={(checked) => setProcessListing(checked as boolean)} 
                  />
                  <Label htmlFor="processListing" className="text-base font-medium">
                    生成Listing
                  </Label>
                </div>
                {processListing && (
                  <div className="ml-7 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="lang-en" 
                          checked={listingLangs.includes('en')} 
                          onCheckedChange={() => toggleListingLang('en')} 
                        />
                        <Label htmlFor="lang-en">英文</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="lang-id" 
                          checked={listingLangs.includes('id')} 
                          onCheckedChange={() => toggleListingLang('id')} 
                        />
                        <Label htmlFor="lang-id">印尼语</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="lang-th" 
                          checked={listingLangs.includes('th')} 
                          onCheckedChange={() => toggleListingLang('th')} 
                        />
                        <Label htmlFor="lang-th">泰语</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="lang-vi" 
                          checked={listingLangs.includes('vi')} 
                          onCheckedChange={() => toggleListingLang('vi')} 
                        />
                        <Label htmlFor="lang-vi">越南语</Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 智能定价 */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="processPricing" 
                    checked={processPricing} 
                    onCheckedChange={(checked) => setProcessPricing(checked as boolean)} 
                  />
                  <Label htmlFor="processPricing" className="text-base font-medium">
                    智能定价
                  </Label>
                </div>
                {processPricing && (
                  <div className="ml-7 flex items-center gap-4">
                    <div className="space-y-1">
                      <Label>目标利润率</Label>
                      <Select value={targetProfit} onValueChange={setTargetProfit}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="30">30%</SelectItem>
                          <SelectItem value="40">40%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Checkbox id="competitorPrice" defaultChecked />
                      <Label htmlFor="competitorPrice">参考竞品价格</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* 生成带货视频 */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox 
                    id="processVideo" 
                    checked={processVideo} 
                    onCheckedChange={(checked) => setProcessVideo(checked as boolean)} 
                  />
                  <Label htmlFor="processVideo" className="text-base font-medium">
                    生成带货视频（15秒）
                  </Label>
                </div>
                {processVideo && (
                  <div className="ml-7 flex items-center gap-6">
                    <div className="space-y-1">
                      <Label>配音</Label>
                      <Select value={videoVoice} onValueChange={setVideoVoice}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">女声</SelectItem>
                          <SelectItem value="male">男声</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>背景音乐</Label>
                      <Select value={videoMusic} onValueChange={setVideoMusic}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pop">流行</SelectItem>
                          <SelectItem value="upbeat">欢快</SelectItem>
                          <SelectItem value="calm">舒缓</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardContent className="pt-6 flex justify-between">
              <Button variant="outline" onClick={handlePrev}>
                ← 返回
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => toast.info('已跳过直接发布')}>
                  跳过直接发布
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleNext}>
                  开始AI处理 🔄
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤3：处理中 */}
        {currentStep === 3 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">当前商品：{productName || '宠物自动饮水机 3.5L'}</CardTitle>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center mb-6">
                <div className="text-[16px] font-medium mb-4">
                  处理进度：{progress}%
                </div>
                <div className="max-w-md mx-auto">
                  <Progress value={progress} className="h-3" />
                </div>
              </div>

              <div className="space-y-3 max-w-lg mx-auto">
                <div className="flex items-center gap-3">
                  {progress >= 20 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={progress >= 20 ? 'text-gray-500 line-through' : 'text-foreground'}>
                    图片处理 - 抠图白底化
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {progress >= 40 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={progress >= 40 ? 'text-gray-500 line-through' : 'text-foreground'}>
                    图片处理 - 图片翻译
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {progress >= 60 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={progress >= 60 ? 'text-gray-500 line-through' : 'text-foreground'}>
                    Listing生成 - 英文标题
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {progress >= 80 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={progress >= 80 ? 'text-gray-500 line-through' : 'text-foreground'}>
                    Listing生成 - 印尼语标题
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {progress >= 100 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={progress >= 100 ? 'text-gray-500 line-through' : 'text-foreground'}>
                    智能定价 - 计算最优售价
                  </span>
                </div>
              </div>

              {processing && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                  {processingStatus}
                </p>
              )}

              <p className="text-center text-sm text-muted-foreground mt-2">
                （预计剩余时间：{Math.max(0, Math.ceil((100 - progress) / 20))}秒）
              </p>
            </CardContent>
          </Card>
        )}

        {/* 步骤4：预览确认 */}
        {currentStep === 4 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[14px]">当前商品：{productName || '宠物自动饮水机 3.5L'}</CardTitle>
                  <CardDescription>
                    ✅ 所有处理完成，可以发布了！
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 处理结果概览 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="space-y-1">
                  <p className="text-[14px]">✅ 图片：5张白底图 + 5张英文翻译图</p>
                  <p className="text-[14px]">✅ Listing：英文标题、5点描述、关键词</p>
                  <p className="text-[14px]">✅ 定价：建议售价 $19.99，利润率 38%</p>
                  {processVideo && (
                    <p className="text-[14px]">✅ 视频：15秒带货视频已生成</p>
                  )}
                </div>
              </div>

              {/* Tab预览 */}
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="images">图片</TabsTrigger>
                  <TabsTrigger value="listing">Listing</TabsTrigger>
                  <TabsTrigger value="pricing">定价</TabsTrigger>
                  {processVideo && <TabsTrigger value="video">视频</TabsTrigger>}
                </TabsList>

                <TabsContent value="basic" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label>商品标题（英文）</Label>
                      <Input defaultValue="Automatic Pet Water Fountain 3.5L Quiet Large Capacity" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>商品SKU</Label>
                        <Input defaultValue="PET-WATER-001" />
                      </div>
                      <div>
                        <Label>成本价格</Label>
                        <Input defaultValue="¥45" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="aspect-square bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">白底图 + 英文翻译图，共10张</p>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      编辑图片
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="listing" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label>标题</Label>
                      <Input defaultValue="Automatic Pet Water Fountain 3.5L Quiet Large Capacity for Cats and Dogs" />
                    </div>
                    <div>
                      <Label>5点描述</Label>
                      <div className="text-sm space-y-2 text-muted-foreground">
                        <p>1. Large 3.5L capacity...</p>
                        <p>2. Quiet operation...</p>
                        <p>3. Easy to clean...</p>
                        <p>4. Dual power supply...</p>
                        <p>5. Suitable for cats and dogs...</p>
                      </div>
                    </div>
                    <div>
                      <Label>关键词</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">pet water fountain</Badge>
                        <Badge variant="outline">automatic pet feeder</Badge>
                        <Badge variant="outline">cat water bowl</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      编辑文案
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>建议售价</Label>
                        <div className="text-lg font-medium text-green-600">$19.99</div>
                      </div>
                      <div>
                        <Label>利润率</Label>
                        <div className="text-lg font-medium text-green-600">38%</div>
                      </div>
                    </div>
                    <div>
                      <Label>竞品价格对比</Label>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p>• 竞品A：$22.99</p>
                        <p>• 竞品B：$18.99</p>
                        <p>• 竞品C：$21.99</p>
                      </div>
                    </div>
                    <div>
                      <Label>修改售价</Label>
                      <Input placeholder="$____" />
                    </div>
                  </div>
                </TabsContent>

                {processVideo && (
                  <TabsContent value="video" className="pt-4">
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground opacity-30" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">配音：</span>
                          女声
                        </div>
                        <div>
                          <span className="text-muted-foreground">背景音乐：</span>
                          流行
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        重新生成
                      </Button>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>

            <CardContent className="pt-6 flex justify-between">
              <Button variant="outline" onClick={handlePrev}>
                ← 返回修改
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  保存草稿
                </Button>
                <Select defaultValue="shopee_sg">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopee_sg">Shopee 新加坡</SelectItem>
                    <SelectItem value="shopee_my">Shopee 马来西亚</SelectItem>
                    <SelectItem value="lazada_sg">Lazada 新加坡</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleNext}>
                  发布到平台
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
