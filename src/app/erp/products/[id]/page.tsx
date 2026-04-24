'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Rocket,
  Loader2,
  Package2,
  ImageIcon,
  Sparkles,
  Plus,
  X,
  GripVertical,
  Trash2,
  Upload,
  Star,
  Copy,
  Check,
  Video,
  Globe,
  Languages,
  MapPin,
  DollarSign,
  Truck,
  Box,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// 语言选项
const LANGUAGES = [
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { value: 'ms', label: 'Melayu', flag: '🇲🇾' },
];

// 站点选项
const SITES = [
  { value: 'th', label: '泰国/TH', currency: 'THB', flag: '🇹🇭' },
  { value: 'vn', label: '越南/VI', currency: 'VND', flag: '🇻🇳' },
  { value: 'id', label: '印尼/ID', currency: 'IDR', flag: '🇮🇩' },
  { value: 'my', label: '马来/MY', currency: 'MYR', flag: '🇲🇾' },
  { value: 'ph', label: '菲律宾/PH', currency: 'PHP', flag: '🇵🇭' },
];

// 规格一选项（颜色）
const SPEC1_OPTIONS = [
  '横竖磁吸可拆分【羊脂白】',
  '横竖磁吸可拆分【绵柔粉】',
  '横竖磁吸可拆分【天际黑】',
  '横竖磁吸可拆分【灰苍苍】',
  '横竖磁吸可拆分【海水蓝】',
  '横竖磁吸可拆分【绝绝紫】',
];

// 规格二选项（适用型号）
const SPEC2_OPTIONS = [
  '2019/2020/2021款【10.2寸】',
  '2017/2018【9.7寸】',
  'Air1/Air2【9.7寸】',
  'Pro/Air3【10.5寸】',
  'Air4/Air5【10.9寸】',
  'iPad第10代/11代【10.9寸】',
  'Pro2018/2020【11寸】',
  'Pro2021/2022【11寸】',
  'iPadMini6/7【8.3寸】',
  'iPadPro2024年【11寸】',
  'iPadAir2024/2025【11寸】',
  'iPadPro2024年【13寸】',
];

// SKU数据类型
interface SKUItem {
  id: string;
  spec1: string;
  spec2: string;
  sourcePrice: number;
  localPrice: string;
  stock: number;
  platformSku: string;
  weight: number;
}

// 产品图片类型
interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedLanguage, setSelectedLanguage] = useState('zh');

  // 基本信息表单
  const [basicForm, setBasicForm] = useState({
    title: '',
    description: '',
    group: '',
    category: '',
    weight: 0,
    sourcePrice: 0,
  });

  // 产品图片
  const [images, setImages] = useState<ProductImage[]>([]);

  // SKU数据
  const [skuList, setSkuList] = useState<SKUItem[]>([]);

  // 多站点数据
  const [siteData, setSiteData] = useState<Record<string, {
    preTaxPrice: string;
    localPrice: string;
    stock: number;
    shop: string;
  }>>({});

  // 物流信息
  const [logisticsForm, setLogisticsForm] = useState({
    weight: '',
    length: '',
    width: '',
    height: '',
    cod: false,
  });

  // 加载商品数据
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { default: store } = await import('@/lib/store');
        const p = store.getProduct(productId);
        if (p) {
          initForms(p);
        } else {
          toast.error('商品不存在');
          router.push('/erp/products');
        }
      } catch (error) {
        console.error('加载失败:', error);
        toast.error('加载失败');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  // 初始化表单
  const initForms = (p: any) => {
    setBasicForm({
      title: p.name_zh || '',
      description: '',
      group: '未分组',
      category: p.category || '',
      weight: p.weight_kg || 0,
      sourcePrice: p.cost_price || 0,
    });

    // 初始化图片
    setImages([
      { id: '1', url: 'https://picsum.photos/400/400?random=1', isMain: true },
      { id: '2', url: 'https://picsum.photos/400/400?random=2', isMain: false },
      { id: '3', url: 'https://picsum.photos/400/400?random=3', isMain: false },
      { id: '4', url: 'https://picsum.photos/400/400?random=4', isMain: false },
      { id: '5', url: 'https://picsum.photos/400/400?random=5', isMain: false },
    ]);

    // 初始化SKU列表
    const generatedSkus: SKUItem[] = [];
    SPEC1_OPTIONS.forEach((spec1, s1Idx) => {
      SPEC2_OPTIONS.forEach((spec2, s2Idx) => {
        generatedSkus.push({
          id: `${s1Idx}-${s2Idx}`,
          spec1,
          spec2,
          sourcePrice: s2Idx === 11 ? 18.00 : (s1Idx === 8 ? 5.00 : (s1Idx === 0 ? 27.80 : 26.00)),
          localPrice: 'THB: 140.46',
          stock: 0,
          platformSku: '',
          weight: 0.24,
        });
      });
    });
    setSkuList(generatedSkus);

    // 初始化站点数据
    setSiteData({
      th: {
        preTaxPrice: '',
        localPrice: '131.03~187.59',
        stock: 63931,
        shop: 'CoolShield TH',
      },
    });

    setLogisticsForm({
      weight: '0.400',
      length: '',
      width: '',
      height: '',
      cod: false,
    });
  };

  // 保存商品
  const handleSave = async () => {
    setIsSaving(true);
    try {
      toast.success('保存成功');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 设置主图
  const handleSetMainImage = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === id,
    })));
  };

  // 删除图片
  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // 更新SKU
  const handleUpdateSku = (id: string, field: keyof SKUItem, value: any) => {
    setSkuList(prev => prev.map(sku =>
      sku.id === id ? { ...sku, [field]: value } : sku
    ));
  };

  // AI生成描述
  const handleAIGenerate = (field: 'title' | 'description') => {
    toast.promise(new Promise((resolve) => {
      setTimeout(() => {
        if (field === 'title') {
          setBasicForm(prev => ({
            ...prev,
            title: '苹果 iPad Pro 11寸磁吸拆分保护壳 带笔槽 防摔 透明 2024款',
          }));
        } else {
          setBasicForm(prev => ({
            ...prev,
            description: '适用苹果iPad Pro 11寸磁吸拆分保护壳，带笔槽设计，防摔透明，兼容Air系列。优质亚克力材质，超薄设计，全面保护您的平板。',
          }));
        }
        resolve(true);
      }, 1500);
    }), {
      loading: 'AI生成中...',
      success: '生成成功',
      error: '生成失败',
    });
  };

  // 复制文本
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制');
  };

  // 拖拽排序图片
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('imageId');
    if (draggedId === targetId) return;

    const draggedIndex = images.findIndex(img => img.id === draggedId);
    const targetIndex = images.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);
    setImages(newImages);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('imageId', id);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-muted/30">
        {/* 顶部导航 */}
        <div className="bg-background border-b sticky top-0 z-10">
          <div className="container flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/erp/products">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  返回
                </Link>
              </Button>
              <div className="h-4 w-px bg-border" />
              <span className="text-[13px] text-muted-foreground font-mono">ID: {productId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                保存
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Rocket className="h-4 w-4 mr-1" />
                发布
              </Button>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="container py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-background border-b h-12 rounded-none w-full justify-start gap-0 px-4">
              <TabsTrigger
                value="basic"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Package2 className="h-4 w-4 mr-2" />
                基本信息
              </TabsTrigger>
              <TabsTrigger
                value="category"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Box className="h-4 w-4 mr-2" />
                类目&属性
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                销售属性
              </TabsTrigger>
              <TabsTrigger
                value="multisite"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Globe className="h-4 w-4 mr-2" />
                多国家售卖
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                产品图片
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Video className="h-4 w-4 mr-2" />
                产品视频
              </TabsTrigger>
              <TabsTrigger
                value="logistics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Truck className="h-4 w-4 mr-2" />
                物流信息
              </TabsTrigger>
            </TabsList>

            {/* 基本信息 Tab */}
            <TabsContent value="basic" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {/* 语言切换 */}
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <div className="flex gap-1">
                      {LANGUAGES.map(lang => (
                        <Button
                          key={lang.value}
                          variant={selectedLanguage === lang.value ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setSelectedLanguage(lang.value)}
                          className="text-[12px]"
                        >
                          {lang.flag} {lang.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 产品标题 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[13px] font-medium">产品标题</Label>
                      <span className="text-[11px] text-muted-foreground">
                        {basicForm.title.length} / 255
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={basicForm.title}
                        onChange={(e) => setBasicForm({ ...basicForm, title: e.target.value })}
                        placeholder="请输入产品标题"
                        className="text-[14px]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIGenerate('title')}
                        className="shrink-0"
                      >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        AI
                      </Button>
                    </div>
                  </div>

                  {/* 产品描述 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[13px] font-medium">产品描述</Label>
                      <span className="text-[11px] text-muted-foreground">
                        {basicForm.description.length} / 10000
                      </span>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={basicForm.description}
                        onChange={(e) => setBasicForm({ ...basicForm, description: e.target.value })}
                        placeholder="请输入产品描述"
                        className="min-h-[200px] text-[14px] resize-none"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIGenerate('description')}
                        className="absolute bottom-3 right-3"
                      >
                        <Sparkles className="h-4 w-4 text-purple-500 mr-1" />
                        AI生成
                      </Button>
                    </div>
                  </div>

                  {/* 基础信息网格 */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block">分组</Label>
                      <Select value={basicForm.group} onValueChange={(v) => setBasicForm({ ...basicForm, group: v })}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="未分组">未分组</SelectItem>
                          <SelectItem value="分组1">分组1</SelectItem>
                          <SelectItem value="分组2">分组2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block">预发布类目</Label>
                      <Input
                        value={basicForm.category}
                        onChange={(e) => setBasicForm({ ...basicForm, category: e.target.value })}
                        placeholder="选择类目"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block">重量 (KG)</Label>
                      <Input
                        type="number"
                        value={basicForm.weight}
                        onChange={(e) => setBasicForm({ ...basicForm, weight: parseFloat(e.target.value) || 0 })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block">货源价格</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                        <Input
                          type="number"
                          value={basicForm.sourcePrice}
                          onChange={(e) => setBasicForm({ ...basicForm, sourcePrice: parseFloat(e.target.value) || 0 })}
                          className="h-9 pl-7"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 类目&属性 Tab */}
            <TabsContent value="category" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block">类目</Label>
                      <Input value={basicForm.category || '平板电脑配件>平板电脑保护套/壳'} className="h-9" />
                    </div>
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block">品牌</Label>
                      <Input placeholder="请输入品牌" className="h-9" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-[13px] font-medium mb-3 block">产品属性</Label>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-[11px] text-muted-foreground mb-1 block">材质</Label>
                        <Input placeholder="TPU/硅胶/亚克力" className="h-9" />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground mb-1 block">型号</Label>
                        <Input placeholder="适用型号" className="h-9" />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground mb-1 block">颜色</Label>
                        <Input placeholder="颜色" className="h-9" />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground mb-1 block">尺寸</Label>
                        <Input placeholder="尺寸" className="h-9" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 销售属性/SKU Tab */}
            <TabsContent value="sales" className="mt-4">
              <Card>
                <CardHeader className="py-3 px-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[14px]">销售属性/SKU信息</CardTitle>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      添加规格
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* 规格一 */}
                  <div className="p-4 border-b bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-[12px] font-medium">规格一</Label>
                      <span className="text-[11px] text-muted-foreground">（颜色）</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SPEC1_OPTIONS.map((opt, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-background border rounded text-[12px] cursor-pointer hover:border-primary"
                        >
                          {opt.replace('横竖磁吸可拆分【', '').replace('】', '')}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      仅规格一可设置SKU图片
                    </p>
                  </div>

                  {/* 规格二 */}
                  <div className="p-4 border-b bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-[12px] font-medium">规格二</Label>
                      <span className="text-[11px] text-muted-foreground">（适用型号）</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SPEC2_OPTIONS.map((opt, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-background border rounded text-[12px] cursor-pointer hover:border-primary"
                        >
                          {opt.split('【')[0]}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SKU表格 */}
                  <div className="overflow-auto">
                    <table className="w-full text-[12px]">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">规格一</th>
                          <th className="text-left p-3 font-medium">规格二</th>
                          <th className="text-left p-3 font-medium">货源价格</th>
                          <th className="text-left p-3 font-medium">本地展示价</th>
                          <th className="text-left p-3 font-medium">库存</th>
                          <th className="text-left p-3 font-medium">平台SKU</th>
                          <th className="text-left p-3 font-medium">重量</th>
                          <th className="text-left p-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skuList.slice(0, 20).map((sku) => (
                          <tr key={sku.id} className="border-b hover:bg-muted/20">
                            <td className="p-3 max-w-[150px]">
                              <span className="truncate block">
                                {sku.spec1.replace('横竖磁吸可拆分【', '').replace('】', '')}
                              </span>
                            </td>
                            <td className="p-3 max-w-[150px]">
                              <span className="truncate block">{sku.spec2.split('【')[0]}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">¥</span>
                                <Input
                                  type="number"
                                  value={sku.sourcePrice}
                                  onChange={(e) => handleUpdateSku(sku.id, 'sourcePrice', parseFloat(e.target.value) || 0)}
                                  className="h-7 w-[80px] text-[12px]"
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <Input
                                value={sku.localPrice}
                                onChange={(e) => handleUpdateSku(sku.id, 'localPrice', e.target.value)}
                                className="h-7 w-[120px] text-[12px]"
                                placeholder="THB: 0.00"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={sku.stock}
                                onChange={(e) => handleUpdateSku(sku.id, 'stock', parseInt(e.target.value) || 0)}
                                className="h-7 w-[80px] text-[12px]"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={sku.platformSku}
                                onChange={(e) => handleUpdateSku(sku.id, 'platformSku', e.target.value)}
                                className="h-7 w-[100px] text-[12px]"
                                placeholder="平台SKU"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={sku.weight}
                                  onChange={(e) => handleUpdateSku(sku.id, 'weight', parseFloat(e.target.value) || 0)}
                                  className="h-7 w-[60px] text-[12px]"
                                />
                                <span className="text-muted-foreground text-[11px]">KG</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {skuList.length > 20 && (
                      <div className="p-3 text-center text-[12px] text-muted-foreground border-t">
                        共 {skuList.length} 个SKU，显示前20个...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 多国家售卖 Tab */}
            <TabsContent value="multisite" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {Object.keys(siteData).length > 0 ? (
                    <div className="space-y-4">
                      {SITES.map(site => {
                        const data = siteData[site.value];
                        return (
                          <div key={site.value} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                              <span className="text-lg">{site.flag}</span>
                              <span className="font-medium">{site.label}</span>
                              <Badge variant="outline" className="text-[11px] ml-auto">
                                {data?.shop || '未选择店铺'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label className="text-[11px] text-muted-foreground mb-1 block">税前售价</Label>
                                <Input
                                  value={data?.preTaxPrice || ''}
                                  onChange={(e) => setSiteData(prev => ({
                                    ...prev,
                                    [site.value]: { ...prev[site.value], preTaxPrice: e.target.value }
                                  }))}
                                  placeholder={site.currency}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] text-muted-foreground mb-1 block">本地展示价</Label>
                                <Input
                                  value={data?.localPrice || ''}
                                  onChange={(e) => setSiteData(prev => ({
                                    ...prev,
                                    [site.value]: { ...prev[site.value], localPrice: e.target.value }
                                  }))}
                                  placeholder={site.currency}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] text-muted-foreground mb-1 block">库存</Label>
                                <Input
                                  type="number"
                                  value={data?.stock || 0}
                                  onChange={(e) => setSiteData(prev => ({
                                    ...prev,
                                    [site.value]: { ...prev[site.value], stock: parseInt(e.target.value) || 0 }
                                  }))}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] text-muted-foreground mb-1 block">发布店铺</Label>
                                <Select value={data?.shop || ''} onValueChange={(v) => setSiteData(prev => ({
                                  ...prev,
                                  [site.value]: { ...prev[site.value], shop: v }
                                }))}>
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="选择店铺" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CoolShield TH">CoolShield TH</SelectItem>
                                    <SelectItem value="主账号">主账号</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-[14px] text-muted-foreground">当前暂无支持多国售卖的站点</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 产品图片 Tab */}
            <TabsContent value="images" className="mt-4">
              <Card>
                <CardHeader className="py-3 px-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[14px]">
                      产品图片
                      <span className="text-[12px] text-muted-foreground font-normal ml-2">
                        （已选 {images.length} 张）
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                        AI优化
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        添加图片
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-[11px] text-muted-foreground mb-4">
                    图片格式：JPG, JPEG, PNG; 图片大小不能超过10M；图片建议尺寸：1200x1200；平台建议宽高比为1:1。可拖拽移动图片，发布时最多上传前9张
                  </div>
                  <div className="grid grid-cols-6 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, img.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, img.id)}
                        className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                          img.isMain ? 'border-primary' : 'border-transparent'
                        } ${idx < 9 ? '' : 'opacity-50'}`}
                      >
                        <img
                          src={img.url}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* 覆盖层 */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8"
                            onClick={() => handleSetMainImage(img.id)}
                          >
                            {img.isMain ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : <Star className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8"
                            onClick={() => handleCopy(img.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            onClick={() => handleDeleteImage(img.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* 主图标识 */}
                        {img.isMain && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded">
                            主图
                          </div>
                        )}
                        {/* 序号 */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                          {idx + 1}
                        </div>
                        {/* 拖拽手柄 */}
                        <div className="absolute top-2 right-2 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-move">
                          <GripVertical className="h-3 w-3" />
                        </div>
                        {/* AI标记 */}
                        <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          AI
                        </div>
                      </div>
                    ))}
                    {/* 添加按钮 */}
                    {images.length < 30 && (
                      <button className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">添加新图片</span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 产品视频 Tab */}
            <TabsContent value="video" className="mt-4">
              <Card>
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-[14px]">产品视频</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-[11px] text-muted-foreground mb-4">
                    视频时长建议20s内，最长不超过60s，大小不超过10M; 长宽比建议1:1，允许范围：9:16~16:9; 像素建议在高清720p以上
                  </div>
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 flex flex-col items-center justify-center gap-3">
                    <Video className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-[14px] text-muted-foreground">点击或拖拽上传视频</p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      选择文件
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 物流信息 Tab */}
            <TabsContent value="logistics" className="mt-4">
              <Card>
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-[14px]">物流信息</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block">包裹重量 (KG)</Label>
                      <Input
                        type="number"
                        value={logisticsForm.weight}
                        onChange={(e) => setLogisticsForm({ ...logisticsForm, weight: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[12px] text-muted-foreground mb-1 block flex items-center gap-2">
                        COD (货到付款)
                      </Label>
                      <Select
                        value={logisticsForm.cod ? 'yes' : 'no'}
                        onValueChange={(v) => setLogisticsForm({ ...logisticsForm, cod: v === 'yes' })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">支持</SelectItem>
                          <SelectItem value="no">不支持</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-[12px] text-muted-foreground mb-2 block">包裹尺寸 (cm)</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Input
                          type="number"
                          placeholder="长"
                          value={logisticsForm.length}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, length: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="宽"
                          value={logisticsForm.width}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, width: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="高"
                          value={logisticsForm.height}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, height: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
