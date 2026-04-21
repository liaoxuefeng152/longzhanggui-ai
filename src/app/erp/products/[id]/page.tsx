'use client';

import { useEffect, useState } from 'react';
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
  Truck,
  Store,
  DollarSign,
  ExternalLink,
  CheckCircle,
  ImageIcon,
  Sparkles,
  Copy,
  Trash2,
  Video,
  Layers,
  Package,
  Play,
  Eye,
  RefreshCw,
  Link2,
  TrendingUp,
  Image as ImageIconLucide,
  FileText,
  Settings,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// 语言选项
const LANGUAGES = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'th', label: 'ภาษาไทย' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'ms', label: 'Bahasa Melayu' },
];

// 平台选项
const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'shopee', label: 'Shopee' },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // 基本信息表单
  const [basicForm, setBasicForm] = useState({
    name_zh: '',
    name_en: '',
    internal_sku: '',
    supplier_name: '',
    source_url: '',
    cost_price: 0,
    domestic_shipping: 0,
    first_mile_shipping: 0,
  });

  // 类目属性表单
  const [categoryForm, setCategoryForm] = useState({
    category: '',
    brand: '',
    model: '',
    material: '',
    color: '',
    size: '',
    weight_kg: 0,
  });

  // 物流表单
  const [logisticsForm, setLogisticsForm] = useState({
    dimensions_length: 0,
    dimensions_width: 0,
    dimensions_height: 0,
    package_length: 0,
    package_width: 0,
    package_height: 0,
    package_weight: 0,
    packaging_list: '',
  });

  // 模拟图片数据
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  // 加载商品数据
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { default: store } = await import('@/lib/store');
        const p = store.getProduct(productId);
        if (p) {
          setProduct(p);
          initForms(p);
          // 模拟图片数据
          setImages([
            'https://via.placeholder.com/400x400?text=Main+Image',
            'https://via.placeholder.com/400x400?text=Image+2',
            'https://via.placeholder.com/400x400?text=Image+3',
            'https://via.placeholder.com/400x400?text=Image+4',
          ]);
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
      name_zh: p.name_zh,
      name_en: p.name_en || '',
      internal_sku: p.internal_sku,
      supplier_name: p.supplier_name || '',
      source_url: p.source_url || '',
      cost_price: p.cost_price || 0,
      domestic_shipping: p.domestic_shipping || 0,
      first_mile_shipping: p.first_mile_shipping || 0,
    });

    setCategoryForm({
      category: p.category || '',
      brand: p.brand || '',
      model: p.model || '',
      material: p.material || '',
      color: p.color || '',
      size: p.size || '',
      weight_kg: p.weight_kg || 0,
    });

    setLogisticsForm({
      dimensions_length: p.dimensions?.length || 0,
      dimensions_width: p.dimensions?.width || 0,
      dimensions_height: p.dimensions?.height || 0,
      package_length: p.package_dimensions?.length || 0,
      package_width: p.package_dimensions?.width || 0,
      package_height: p.package_dimensions?.height || 0,
      package_weight: p.package_weight || 0,
      packaging_list: Array.isArray(p.packaging_list) ? p.packaging_list.join('\n') : '',
    });
  };

  // 保存基本信息
  const handleSaveBasic = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const { default: store } = await import('@/lib/store');
      const totalCost = basicForm.cost_price + basicForm.domestic_shipping + basicForm.first_mile_shipping;

      store.updateProduct(product.id, {
        name_zh: basicForm.name_zh,
        name_en: basicForm.name_en,
        internal_sku: basicForm.internal_sku,
        supplier_name: basicForm.supplier_name,
        source_url: basicForm.source_url,
        cost_price: basicForm.cost_price,
        domestic_shipping: basicForm.domestic_shipping,
        first_mile_shipping: basicForm.first_mile_shipping,
        total_cost: totalCost,
      });

      const updated = store.getProduct(product.id);
      setProduct(updated);
      setIsEditing(false);
      toast.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 保存类目属性
  const handleSaveCategory = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const { default: store } = await import('@/lib/store');

      store.updateProduct(product.id, {
        category: categoryForm.category,
        brand: categoryForm.brand,
        model: categoryForm.model,
        material: categoryForm.material,
        color: categoryForm.color,
        size: categoryForm.size,
        weight_kg: categoryForm.weight_kg,
      });

      const updated = store.getProduct(product.id);
      setProduct(updated);
      setIsEditing(false);
      toast.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 保存物流信息
  const handleSaveLogistics = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const { default: store } = await import('@/lib/store');

      store.updateProduct(product.id, {
        dimensions: {
          length: logisticsForm.dimensions_length,
          width: logisticsForm.dimensions_width,
          height: logisticsForm.dimensions_height,
        },
        weight_kg: logisticsForm.package_weight,
        packaging_list: logisticsForm.packaging_list.split('\n').filter((p: string) => p.trim()),
      });

      const updated = store.getProduct(product.id);
      setProduct(updated);
      setIsEditing(false);
      toast.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
      selected: { bg: 'bg-blue-100', text: 'text-blue-600' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      ready: { bg: 'bg-green-100', text: 'text-green-600' },
      published: { bg: 'bg-purple-100', text: 'text-purple-600' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-500' },
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      selected: '已选品',
      processing: '处理中',
      ready: '待上架',
      published: '已上架',
      archived: '已归档',
    };
    const style = variants[status] || variants.draft;
    return (
      <Badge className={`${style.bg} ${style.text} border-0 px-3 py-1`}>
        {labels[status] || status}
      </Badge>
    );
  };

  // 处理进度步骤
  const getProcessingSteps = () => {
    return [
      { key: 'selected', label: '选品入库', icon: Package, done: ['selected', 'processing', 'ready', 'published'].includes(product?.status) },
      { key: 'image', label: '图片处理', icon: ImageIconLucide, done: product?.image_status === 'done' },
      { key: 'listing', label: 'Listing优化', icon: FileText, done: product?.listing_status === 'done' },
      { key: 'pricing', label: '智能定价', icon: TrendingUp, done: product?.pricing_status === 'done' },
      { key: 'publish', label: '上架发布', icon: Rocket, done: product?.status === 'published' },
    ];
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

  if (!product) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Package2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">商品不存在</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/erp/products')}>
              返回列表
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const processingSteps = getProcessingSteps();
  const currentStepIndex = processingSteps.findIndex(s => !s.done);

  return (
    <MainLayout>
      <div className="container py-4">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/erp/products">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="text-[13px] text-muted-foreground font-mono">ID: {product.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(product.status)}
            <Button size="sm" onClick={() => router.push(`/erp/products/${product.id}/edit`)}>
              编辑
            </Button>
          </div>
        </div>

        {/* 主内容区域 - 左右分栏 */}
        <div className="grid grid-cols-12 gap-4">
          {/* 左侧 - 图片区域 */}
          <div className="col-span-3">
            <Card className="sticky top-4">
              <CardContent className="p-3">
                {/* 主图 */}
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                  {images.length > 0 ? (
                    <img 
                      src={images[mainImageIndex]} 
                      alt={product.name_zh}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                
                {/* 缩略图列表 */}
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImageIndex(idx)}
                      className={`aspect-square rounded border-2 overflow-hidden transition-colors ${
                        mainImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {images.length < 8 && (
                    <button className="aspect-square rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* 图片操作 */}
                <div className="mt-3 pt-3 border-t space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ImageIconLucide className="h-4 w-4 mr-2" />
                    AI处理图片
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新采集图片
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧 - 信息区域 */}
          <div className="col-span-9 space-y-4">
            {/* 核心信息卡片 */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* 左侧：标题和来源 */}
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-[18px] font-semibold leading-tight">{product.name_zh}</h1>
                      {product.name_en && (
                        <p className="text-[13px] text-muted-foreground mt-1">{product.name_en}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-[13px]">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="font-mono">SKU:</span>
                        <span className="font-medium text-foreground">{product.internal_sku}</span>
                      </div>
                      {product.category && (
                        <Badge variant="outline" className="text-[11px]">{product.category}</Badge>
                      )}
                    </div>

                    {/* 来源链接 */}
                    {product.source_url && (
                      <div className="flex items-center gap-2">
                        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <a 
                          href={product.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[12px] text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {product.supplier_name || '查看货源'}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 右侧：价格信息 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-[11px] text-muted-foreground">采购成本</p>
                      <p className="text-[18px] font-semibold mt-1">¥{product.cost_price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-[11px] text-muted-foreground">总成本</p>
                      <p className="text-[18px] font-semibold mt-1">¥{(product.total_cost || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <p className="text-[11px] text-muted-foreground">建议售价</p>
                      <p className="text-[18px] font-semibold text-green-600 mt-1">
                        {product.suggested_price ? `$${product.suggested_price.toFixed(2)}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 处理进度 */}
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px]">处理进度</CardTitle>
                  <span className="text-[12px] text-muted-foreground">
                    {processingSteps.filter(s => s.done).length}/{processingSteps.length} 完成
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  {processingSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div key={step.key} className="flex items-center">
                        <div className={`flex flex-col items-center ${step.done ? 'text-green-600' : isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.done ? 'bg-green-100' : isCurrent ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            {step.done ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <span className="text-[11px] mt-1">{step.label}</span>
                        </div>
                        {idx < processingSteps.length - 1 && (
                          <div className={`w-16 h-0.5 mx-2 ${
                            step.done ? 'bg-green-500' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 快捷操作按钮 */}
                <div className="mt-4 pt-4 border-t flex items-center gap-2">
                  {product.status === 'selected' && (
                    <>
                      <Button size="sm" onClick={() => router.push('/agents/image-design')}>
                        <ImageIconLucide className="h-4 w-4 mr-1" />
                        图片处理
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push('/agents/listing-optimization')}>
                        <FileText className="h-4 w-4 mr-1" />
                        Listing优化
                      </Button>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        智能定价
                      </Button>
                    </>
                  )}
                  {product.status === 'ready' && (
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Rocket className="h-4 w-4 mr-1" />
                      立即上架
                    </Button>
                  )}
                  {product.status === 'published' && (
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      查看店铺
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 详细信息 Tab */}
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="py-0 px-4 border-b">
                  <TabsList className="h-11 bg-transparent gap-1">
                    <TabsTrigger value="basic" className="text-[13px] data-[state=active]:bg-muted">基本信息</TabsTrigger>
                    <TabsTrigger value="category" className="text-[13px] data-[state=active]:bg-muted">类目属性</TabsTrigger>
                    <TabsTrigger value="listing" className="text-[13px] data-[state=active]:bg-muted">Listing</TabsTrigger>
                    <TabsTrigger value="logistics" className="text-[13px] data-[state=active]:bg-muted">物流信息</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="p-4">
                  {/* 基本信息 Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">商品名称（中文）</Label>
                        {isEditing ? (
                          <Input value={basicForm.name_zh} onChange={(e) => setBasicForm({ ...basicForm, name_zh: e.target.value })} />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[13px]">{product.name_zh}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">商品名称（英文）</Label>
                        {isEditing ? (
                          <Input value={basicForm.name_en} onChange={(e) => setBasicForm({ ...basicForm, name_en: e.target.value })} />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[13px]">{product.name_en || '-'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">SKU编码</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px] font-mono">{product.internal_sku}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">采购成本 (¥)</Label>
                        {isEditing ? (
                          <Input type="number" value={basicForm.cost_price} onChange={(e) => setBasicForm({ ...basicForm, cost_price: parseFloat(e.target.value) || 0 })} />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[13px] font-medium">¥{product.cost_price?.toFixed(2) || '0.00'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">国内运费 (¥)</Label>
                        {isEditing ? (
                          <Input type="number" value={basicForm.domestic_shipping} onChange={(e) => setBasicForm({ ...basicForm, domestic_shipping: parseFloat(e.target.value) || 0 })} />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[13px]">¥{product.domestic_shipping?.toFixed(2) || '0.00'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">头程运费 (¥)</Label>
                        {isEditing ? (
                          <Input type="number" value={basicForm.first_mile_shipping} onChange={(e) => setBasicForm({ ...basicForm, first_mile_shipping: parseFloat(e.target.value) || 0 })} />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[13px]">¥{product.first_mile_shipping?.toFixed(2) || '0.00'}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">总成本 (¥)</Label>
                        <div className="p-2 bg-primary/10 rounded text-[13px] font-semibold text-primary">
                          ¥{(product.total_cost || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">供应商</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.supplier_name || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">货源链接</Label>
                        {product.source_url ? (
                          <Button variant="outline" size="sm" className="h-8" onClick={() => window.open(product.source_url, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            查看链接
                          </Button>
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[13px] text-muted-foreground">-</div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); initForms(product); }}>取消</Button>
                        <Button size="sm" onClick={handleSaveBasic} disabled={isSaving}>
                          {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          保存
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* 类目属性 Tab */}
                  <TabsContent value="category" className="space-y-4 mt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">类目</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.category || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">品牌</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.brand || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">型号</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.model || '-'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">材质</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.material || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">颜色</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.color || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">尺寸</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.size || '-'}</div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Listing Tab */}
                  <TabsContent value="listing" className="mt-0">
                    {product.platform_listings && product.platform_listings.length > 0 ? (
                      <div className="space-y-4">
                        {product.platform_listings.map((listing: any) => (
                          <div key={listing.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline">{listing.platform}</Badge>
                              <span className="text-[14px] font-medium">{listing.shop_name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[11px] text-muted-foreground">标题</Label>
                                <div className="p-2 bg-muted/30 rounded text-[13px] mt-1">{listing.listing_title || '-'}</div>
                              </div>
                              <div>
                                <Label className="text-[11px] text-muted-foreground">售价</Label>
                                <div className="p-2 bg-muted/30 rounded text-[13px] mt-1 font-medium">
                                  {listing.sale_price ? `$${listing.sale_price.toFixed(2)}` : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Store className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-[13px] text-muted-foreground">尚未认领到店铺</p>
                        <Button size="sm" className="mt-3">
                          认领到店铺
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* 物流信息 Tab */}
                  <TabsContent value="logistics" className="space-y-4 mt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">产品长度 (cm)</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.dimensions?.length || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">产品宽度 (cm)</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.dimensions?.width || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">产品高度 (cm)</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.dimensions?.height || '-'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">包装重量 (kg)</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.package_weight || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">产品重量 (kg)</Label>
                        <div className="p-2 bg-muted/30 rounded text-[13px]">{product.weight_kg || '-'}</div>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
