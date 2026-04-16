'use client';

import { useState } from 'react';
import { Plus, Upload, Image, Sparkles, CheckCircle, AlertCircle, Settings, TrendingUp, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  },
  {
    id: 2,
    name: 'LED氛围灯串',
    image: '💡',
    status: 'processing',
    progress: 70,
    lastEdit: '15分钟前',
  },
  {
    id: 3,
    name: '便携手机支架',
    image: '📱',
    status: 'completed',
    progress: 100,
    lastEdit: '1小时前',
  },
];

export default function PublishPage() {
  const [activeTab, setActiveTab] = useState('new');
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    price: '',
    description: '',
  });

  const handleStartAI = async () => {
    if (!formData.productName) {
      toast.error('请输入商品名称');
      return;
    }
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setCurrentStep(2);
    toast.success('AI开始处理商品信息');
  };

  const handlePublish = () => {
    toast.success('商品已上架！');
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">上新中心</h1>
            <p className="text-[#86909C] mt-1">AI一站式帮您完成商品上架</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md bg-[#F2F3F5]">
            <TabsTrigger value="new" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              新建商品
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              草稿箱 ({mockDrafts.length})
            </TabsTrigger>
          </TabsList>

          {/* 新建商品 */}
          <TabsContent value="new" className="mt-6">
            <Card className="card-minimal">
              <div className="p-6">
                {/* 步骤指示器 */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            step < currentStep 
                              ? 'bg-[#00B42A] text-white' 
                              : step === currentStep 
                                ? 'bg-[#165DFF] text-white' 
                                : 'bg-[#F2F3F5] text-[#86909C]'
                          }`}
                        >
                          {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                        </div>
                        {step < 4 && (
                          <div 
                            className={`w-20 h-1 mx-2 ${
                              step < currentStep ? 'bg-[#00B42A]' : 'bg-[#E5E6EB]'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-16 mb-8 text-sm">
                  <span className={currentStep >= 1 ? 'text-[#1D2129]' : 'text-[#86909C]'}>商品信息</span>
                  <span className={currentStep >= 2 ? 'text-[#1D2129]' : 'text-[#86909C]'}>图片处理</span>
                  <span className={currentStep >= 3 ? 'text-[#1D2129]' : 'text-[#86909C]'}>Listing优化</span>
                  <span className={currentStep >= 4 ? 'text-[#1D2129]' : 'text-[#86909C]'}>确认上架</span>
                </div>

                {/* 步骤内容 */}
                {currentStep === 1 && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] text-center mb-6">
                      输入商品基本信息
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-[#4E5969]">商品名称</label>
                        <Input
                          placeholder="请输入商品名称"
                          value={formData.productName}
                          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                          className="input-minimal h-12"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">类目</label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(v) => setFormData({ ...formData, category: v })}
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
                          <label className="text-sm text-[#4E5969]">目标售价 ($)</label>
                          <Input
                            type="number"
                            placeholder="请输入售价"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="input-minimal h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-[#4E5969]">商品描述</label>
                        <Textarea
                          placeholder="请简单描述一下这个商品的功能和特点..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                        onClick={handleStartAI}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            AI处理中...
                          </div>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            交给AI一站式处理
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="max-w-3xl mx-auto text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-[#E8F3FF] flex items-center justify-center mx-auto mb-6">
                      <Image className="w-10 h-10 text-[#165DFF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1D2129] mb-4">AI正在处理图片</h3>
                    <div className="space-y-4 max-w-md mx-auto">
                      <Progress value={60} className="h-2" />
                      <p className="text-[#86909C]">正在进行：图片背景替换、文字翻译、尺寸优化...</p>
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <Card className="card-minimal p-4">
                        <CheckCircle className="w-8 h-8 text-[#00B42A] mx-auto mb-2" />
                        <p className="text-sm text-[#4E5969]">主图生成</p>
                      </Card>
                      <Card className="card-minimal p-4">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-[#165DFF] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[#4E5969]">图片翻译</p>
                      </Card>
                      <Card className="card-minimal p-4">
                        <AlertCircle className="w-8 h-8 text-[#86909C] mx-auto mb-2" />
                        <p className="text-sm text-[#4E5969]">变体图</p>
                      </Card>
                    </div>
                    <div className="mt-8">
                      <Button className="btn-primary" onClick={() => setCurrentStep(3)}>
                        继续下一步
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 rounded-full bg-[#E8FFEA] flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10 text-[#00B42A]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1D2129] mb-2">Listing优化完成</h3>
                      <p className="text-[#86909C]">AI已为您生成优化后的商品信息</p>
                    </div>

                    <Card className="card-minimal mb-6">
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-[#86909C] mb-3">优化前</h4>
                            <Card className="bg-[#F7F8FA] p-4">
                              <p className="text-[#4E5969] text-sm">{formData.productName || '宠物自动喂食器'}</p>
                              <p className="text-xs text-[#86909C] mt-2">简单的商品描述...</p>
                            </Card>
                          </div>
                          <div>
                            <h4 className="font-medium text-[#00B42A] mb-3">优化后</h4>
                            <Card className="bg-[#E8FFEA]/50 p-4 border-[#00B42A]">
                              <p className="text-[#1D2129] text-sm font-medium">
                                Smart Pet Feeder with APP Control - Automatic Dog Cat Food Dispenser 6L Capacity
                              </p>
                              <p className="text-xs text-[#4E5969] mt-2">
                                • 1080P HD Camera with Night Vision • 6L Large Capacity • 2.4G WiFi 
                                • Schedule Feeding • Voice Recorder • Portion Control
                              </p>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="text-center">
                      <Button className="btn-primary" onClick={() => setCurrentStep(4)}>
                        下一步：确认上架
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 rounded-full bg-[#E8F3FF] flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-[#165DFF]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1D2129] mb-2">确认商品信息</h3>
                      <p className="text-[#86909C]">请确认以下信息无误后上架</p>
                    </div>

                    <Card className="card-minimal mb-6">
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between py-3 border-b border-[#E5E6EB]">
                          <span className="text-[#86909C]">商品名称</span>
                          <span className="text-[#1D2129] font-medium">Smart Pet Feeder with APP Control</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#E5E6EB]">
                          <span className="text-[#86909C]">类目</span>
                          <span className="text-[#1D2129]">宠物用品</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#E5E6EB]">
                          <span className="text-[#86909C]">售价</span>
                          <span className="text-[#1D2129] font-medium">${formData.price || '39.99'}</span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="text-[#86909C]">图片数量</span>
                          <span className="text-[#1D2129]">9张 + 1视频</span>
                        </div>
                      </div>
                    </Card>

                    <div className="flex gap-4">
                      <Button variant="ghost" className="flex-1 btn-secondary" onClick={() => setCurrentStep(1)}>
                        返回修改
                      </Button>
                      <Button className="flex-1 btn-primary" onClick={handlePublish}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        立即上架
                      </Button>
                    </div>
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
                      {getStatusBadge(draft.status)}
                    </div>
                    <h3 className="font-semibold text-[#1D2129] mb-2">{draft.name}</h3>
                    <p className="text-sm text-[#86909C] mb-4">最后编辑：{draft.lastEdit}</p>
                    <Progress value={draft.progress} className="h-2 mb-4" />
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 text-[#165DFF]">
                        继续编辑
                      </Button>
                      {draft.status === 'completed' && (
                        <Button size="sm" className="flex-1 btn-primary">
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
