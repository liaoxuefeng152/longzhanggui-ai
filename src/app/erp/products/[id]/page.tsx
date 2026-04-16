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
  Ruler,
  Weight,
  ExternalLink,
  CheckCircle,
  ImageIcon,
  PlusCircle,
  Sparkles,
  Copy,
  Trash2,
  Video,
  Layers,
  Move,
  Package,
  Plus,
  Upload,
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

// 货币选项
const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'MYR', label: 'MYR (RM)', symbol: 'RM' },
  { value: 'IDR', label: 'IDR (Rp)', symbol: 'Rp' },
  { value: 'THB', label: 'THB (฿)', symbol: '฿' },
  { value: 'VND', label: 'VND (₫)', symbol: '₫' },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiOptimizing, setIsAiOptimizing] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

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

  // 加载商品数据
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { default: store } = await import('@/lib/store');
        const p = store.getProduct(productId);
        if (p) {
          setProduct(p);
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

      // 刷新
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

      // 刷新
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

      // 刷新
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
    const variants: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      selected: 'bg-blue-500/10 text-blue-500',
      processing: 'bg-yellow-500/10 text-yellow-500',
      ready: 'bg-green-500/10 text-green-500',
      published: 'bg-success text-white',
      archived: 'bg-muted text-muted-foreground',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      selected: '已选品',
      processing: '处理中',
      ready: '待上架',
      published: '已上架',
      archived: '已归档',
    };
    return <Badge className={variants[status] || 'bg-muted'}>{labels[status] || status}</Badge>;
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

  return (
    <MainLayout>
      <div className="container py-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/erp/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                {product.name_zh}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                ID: {product.id} | SKU: {product.internal_sku}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(product.status)}
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  initForms(product);
                }}>
                  取消
                </Button>
                <Button onClick={() => {
                  if (activeTab === 'basic') handleSaveBasic();
                  else if (activeTab === 'category') handleSaveCategory();
                  else if (activeTab === 'logistics') handleSaveLogistics();
                }} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  保存
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                编辑
              </Button>
            )}
          </div>
        </div>

        {/* Tab 切换 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full mb-6">
            <TabsTrigger value="basic" className="text-[13px]">
              <Package className="h-4 w-4 mr-2" />
              基本信息
            </TabsTrigger>
            <TabsTrigger value="category" className="text-[13px]">
              <Layers className="h-4 w-4 mr-2" />
              类目&属性
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-[13px]">
              <Store className="h-4 w-4 mr-2" />
              销售属性
            </TabsTrigger>
            <TabsTrigger value="images" className="text-[13px]">
              <ImageIcon className="h-4 w-4 mr-2" />
              产品图片
            </TabsTrigger>
            <TabsTrigger value="video" className="text-[13px]">
              <Video className="h-4 w-4 mr-2" />
              产品视频
            </TabsTrigger>
            <TabsTrigger value="logistics" className="text-[13px]">
              <Move className="h-4 w-4 mr-2" />
              物流信息
            </TabsTrigger>
          </TabsList>

          {/* 基本信息 Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px]">商品信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">商品名称（中文）</Label>
                    {isEditing ? (
                      <Input
                        value={basicForm.name_zh}
                        onChange={(e) => setBasicForm({ ...basicForm, name_zh: e.target.value })}
                        placeholder="输入商品名称"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded text-[14px]">{product.name_zh}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">商品名称（英文）</Label>
                    {isEditing ? (
                      <Input
                        value={basicForm.name_en}
                        onChange={(e) => setBasicForm({ ...basicForm, name_en: e.target.value })}
                        placeholder="输入英文名称"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded text-[14px]">{product.name_en || '-'}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">SKU编码</Label>
                    {isEditing ? (
                      <Input
                        value={basicForm.internal_sku}
                        onChange={(e) => setBasicForm({ ...basicForm, internal_sku: e.target.value })}
                        placeholder="SKU编码"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded font-mono">{product.internal_sku}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">商品类目</Label>
                    {isEditing ? (
                      <Input
                        value={categoryForm.category}
                        onChange={(e) => setCategoryForm({ ...categoryForm, category: e.target.value })}
                        placeholder="商品类目"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.category || '-'}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  供应商信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">供应商名称</Label>
                    {isEditing ? (
                      <Input
                        value={basicForm.supplier_name}
                        onChange={(e) => setBasicForm({ ...basicForm, supplier_name: e.target.value })}
                        placeholder="供应商名称"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.supplier_name || '-'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">货源链接</Label>
                    {isEditing ? (
                      <Input
                        value={basicForm.source_url}
                        onChange={(e) => setBasicForm({ ...basicForm, source_url: e.target.value })}
                        placeholder="1688链接"
                      />
                    ) : product.source_url ? (
                      <Button variant="outline" size="sm" onClick={() => window.open(product.source_url, '_blank')}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        查看链接
                      </Button>
                    ) : (
                      <div className="p-2 bg-muted/30 rounded text-muted-foreground">-</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  成本信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">采购成本 (¥)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={basicForm.cost_price}
                        onChange={(e) => setBasicForm({ ...basicForm, cost_price: parseFloat(e.target.value) || 0 })}
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded font-medium">¥{product.cost_price?.toFixed(2) || '0.00'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">国内运费 (¥)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={basicForm.domestic_shipping}
                        onChange={(e) => setBasicForm({ ...basicForm, domestic_shipping: parseFloat(e.target.value) || 0 })}
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">¥{product.domestic_shipping?.toFixed(2) || '0.00'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">头程运费 (¥)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={basicForm.first_mile_shipping}
                        onChange={(e) => setBasicForm({ ...basicForm, first_mile_shipping: parseFloat(e.target.value) || 0 })}
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">¥{product.first_mile_shipping?.toFixed(2) || '0.00'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-primary">总成本 (¥)</Label>
                    <div className="p-2 bg-primary/10 rounded font-semibold text-primary">
                      ¥{(product.total_cost || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 类目&属性 Tab */}
          <TabsContent value="category" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px]">基本属性</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">品牌</Label>
                    {isEditing ? (
                      <Input
                        value={categoryForm.brand}
                        onChange={(e) => setCategoryForm({ ...categoryForm, brand: e.target.value })}
                        placeholder="品牌"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.brand || '-'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">型号</Label>
                    {isEditing ? (
                      <Input
                        value={categoryForm.model}
                        onChange={(e) => setCategoryForm({ ...categoryForm, model: e.target.value })}
                        placeholder="型号"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.model || '-'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">材质</Label>
                    {isEditing ? (
                      <Input
                        value={categoryForm.material}
                        onChange={(e) => setCategoryForm({ ...categoryForm, material: e.target.value })}
                        placeholder="材质"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.material || '-'}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">颜色</Label>
                    {isEditing ? (
                      <Input
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        placeholder="颜色"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.color || '-'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">尺寸</Label>
                    {isEditing ? (
                      <Input
                        value={categoryForm.size}
                        onChange={(e) => setCategoryForm({ ...categoryForm, size: e.target.value })}
                        placeholder="尺寸"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.size || '-'}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 销售属性 Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px]">店铺 Listing</CardTitle>
                  <Button size="sm" disabled>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    认领新店铺
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {product.platform_listings && product.platform_listings.length > 0 ? (
                  <div className="space-y-4">
                    {product.platform_listings.map((listing: any) => (
                      <div key={listing.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">{listing.platform}</Badge>
                            <span className="text-[14px] font-medium">{listing.shop_name || listing.platform}</span>
                            <Badge className={
                              listing.status === 'active' ? 'bg-success text-white' :
                              listing.status === 'listed' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-muted'
                            }>
                              {listing.status === 'active' ? '在售' :
                               listing.status === 'listed' ? '已上架' :
                               listing.status === 'draft' ? '草稿' : listing.status}
                            </Badge>
                          </div>
                          {listing.listing_url && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(listing.listing_url, '_blank')}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              查看链接
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[12px] text-muted-foreground">标题</Label>
                            <div className="p-2 bg-muted/30 rounded text-[13px]">
                              {listing.listing_title || '-'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[12px] text-muted-foreground">售价</Label>
                            <div className="p-2 bg-muted/30 rounded font-medium">
                              {listing.sale_price ? `${listing.currency || '$'}${listing.sale_price.toFixed(2)}` : '-'}
                            </div>
                          </div>
                        </div>
                        {listing.bullet_points && listing.bullet_points.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-[12px] text-muted-foreground">五点描述</Label>
                            <ul className="mt-1 space-y-1">
                              {listing.bullet_points.map((point: string, idx: number) => (
                                <li key={idx} className="text-[13px] flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">尚未认领任何店铺</p>
                    <p className="text-[12px] text-muted-foreground mt-1">在采集中心认领商品到店铺</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品图片 Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px]">商品图片</CardTitle>
                  <Button size="sm" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    上传图片
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-6 gap-3">
                    {product.images.map((img: any, idx: number) => (
                      <div key={img.id || idx} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                          <img
                            src={img.processed_url || img.original_url || '/placeholder.png'}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                        </div>
                        {idx === 0 && (
                          <Badge className="absolute top-2 left-2 text-[10px]" variant="default">
                            主图
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">暂无图片</p>
                    <p className="text-[12px] text-muted-foreground mt-1">在图片设计中心处理商品图片</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品视频 Tab */}
          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px]">商品视频</CardTitle>
                  <Button size="sm" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    上传视频
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {product.video_url ? (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <p className="text-white">视频播放器占位</p>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Video className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">暂无视频</p>
                    <p className="text-[12px] text-muted-foreground mt-1">在视频生成中心制作商品视频</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 物流信息 Tab */}
          <TabsContent value="logistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  重量信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">产品重量 (kg)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={categoryForm.weight_kg}
                        onChange={(e) => setCategoryForm({ ...categoryForm, weight_kg: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.weight_kg || 0} kg</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-muted-foreground">包裹重量 (kg)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={logisticsForm.package_weight}
                        onChange={(e) => setLogisticsForm({ ...logisticsForm, package_weight: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="p-2 bg-muted/30 rounded">{product.package_weight || 0} kg</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  尺寸信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[12px] text-muted-foreground mb-2 block">产品尺寸 (长×宽×高 cm)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          placeholder="长"
                          value={logisticsForm.dimensions_length}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, dimensions_length: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="p-2 bg-muted/30 rounded">{product.dimensions?.length || 0}</div>
                      )}
                      <span className="text-[12px] text-muted-foreground">长 (cm)</span>
                    </div>
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          placeholder="宽"
                          value={logisticsForm.dimensions_width}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, dimensions_width: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="p-2 bg-muted/30 rounded">{product.dimensions?.width || 0}</div>
                      )}
                      <span className="text-[12px] text-muted-foreground">宽 (cm)</span>
                    </div>
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          placeholder="高"
                          value={logisticsForm.dimensions_height}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, dimensions_height: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="p-2 bg-muted/30 rounded">{product.dimensions?.height || 0}</div>
                      )}
                      <span className="text-[12px] text-muted-foreground">高 (cm)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[12px] text-muted-foreground mb-2 block">包裹尺寸 (长×宽×高 cm)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          placeholder="长"
                          value={logisticsForm.package_length}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, package_length: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="p-2 bg-muted/30 rounded">{product.package_dimensions?.length || 0}</div>
                      )}
                      <span className="text-[12px] text-muted-foreground">长 (cm)</span>
                    </div>
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          placeholder="宽"
                          value={logisticsForm.package_width}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, package_width: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="p-2 bg-muted/30 rounded">{product.package_dimensions?.width || 0}</div>
                      )}
                      <span className="text-[12px] text-muted-foreground">宽 (cm)</span>
                    </div>
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          placeholder="高"
                          value={logisticsForm.package_height}
                          onChange={(e) => setLogisticsForm({ ...logisticsForm, package_height: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="p-2 bg-muted/30 rounded">{product.package_dimensions?.height || 0}</div>
                      )}
                      <span className="text-[12px] text-muted-foreground">高 (cm)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[14px]">包装清单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-[12px] text-muted-foreground">每行填写一个物品</Label>
                  {isEditing ? (
                    <Textarea
                      value={logisticsForm.packaging_list}
                      onChange={(e) => setLogisticsForm({ ...logisticsForm, packaging_list: e.target.value })}
                      placeholder="产品 x1&#10;充电线 x1&#10;说明书 x1"
                      rows={6}
                      className="text-[13px]"
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded min-h-[100px]">
                      {product.packaging_list && product.packaging_list.length > 0 ? (
                        <ul className="list-disc list-inside text-[13px] space-y-1">
                          {product.packaging_list.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">暂无包装清单</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
