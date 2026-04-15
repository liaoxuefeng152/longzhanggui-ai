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
  RefreshCw,
  Copy,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// 商品类型定义
interface ProductImage {
  id: string;
  original_url: string;
  processed_url?: string;
  type: string;
}

interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

interface ERPProduct {
  id: string;
  internal_sku: string;
  name_zh: string;
  name_en?: string;
  source_url?: string;
  supplier_name?: string;
  cost_price: number;
  domestic_shipping: number;
  first_mile_shipping: number;
  total_cost: number;
  category?: string;
  status: string;
  selection_score?: number;
  total_sales?: number;
  total_orders?: number;
  total_profit?: number;
  platform_listings?: any[];
  images?: ProductImage[];
  weight_kg?: number;
  dimensions?: ProductDimensions;
  packaging_list?: string[];
  brand?: string;
  color?: string;
  size?: string;
  pricing?: {
    suggested_price: number;
    target_price: number;
    profit_margin: number;
  };
  created_at: string;
  updated_at: string;
}

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
  { value: 'tiktok', label: 'TikTok Shop', icon: '📱' },
  { value: 'amazon', label: 'Amazon', icon: '📦' },
  { value: 'shopee', label: 'Shopee', icon: '🛒' },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ERPProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiOptimizing, setIsAiOptimizing] = useState<string | null>(null);

  // 编辑表单
  const [form, setForm] = useState({
    name_zh: '',
    name_en: '',
    internal_sku: '',
    category: '',
    supplier_name: '',
    source_url: '',
    cost_price: 0,
    domestic_shipping: 0,
    first_mile_shipping: 0,
    weight_kg: 0,
    dimensions_length: 0,
    dimensions_width: 0,
    dimensions_height: 0,
    packaging_list: '',
    brand: '',
    color: '',
    size: '',
  });

  // 当前选中的店铺 Listing
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    bullet_points: '',
    keywords: '',
    sale_price: 0,
    language: 'en',
  });

  // 加载商品数据
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { default: store } = await import('@/lib/store');
        const p = store.getProduct(productId) as unknown as ERPProduct;
        if (p) {
          setProduct(p);
          initForm(p);
          // 默认选中第一个店铺 Listing
          if (p.platform_listings && p.platform_listings.length > 0) {
            selectListing(p.platform_listings[0]);
          }
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
  const initForm = (p: ERPProduct) => {
    setForm({
      name_zh: p.name_zh,
      name_en: p.name_en || '',
      internal_sku: p.internal_sku,
      category: p.category || '',
      supplier_name: p.supplier_name || '',
      source_url: p.source_url || '',
      cost_price: p.cost_price,
      domestic_shipping: p.domestic_shipping,
      first_mile_shipping: p.first_mile_shipping,
      weight_kg: p.weight_kg || 0,
      dimensions_length: p.dimensions?.length || 0,
      dimensions_width: p.dimensions?.width || 0,
      dimensions_height: p.dimensions?.height || 0,
      packaging_list: p.packaging_list?.join('\n') || '',
      brand: p.brand || '',
      color: p.color || '',
      size: p.size || '',
    });
  };

  // 选择 Listing
  const selectListing = (listing: any) => {
    setSelectedListing(listing);
    setListingForm({
      title: listing.listing_title || listing.listing?.title || product?.name_en || product?.name_zh || '',
      description: listing.listing_description || listing.listing?.description || '',
      bullet_points: listing.bullet_points?.join('\n') || listing.listing?.bullet_points?.join('\n') || '',
      keywords: listing.keywords?.join(', ') || listing.listing?.keywords?.join(', ') || '',
      sale_price: listing.sale_price || 0,
      language: listing.language || 'en',
    });
  };

  // 保存商品基本信息
  const handleSaveBasic = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const { default: store } = await import('@/lib/store');

      const totalCost = form.cost_price + form.domestic_shipping + form.first_mile_shipping;

      store.updateProduct(product.id, {
        name_zh: form.name_zh,
        name_en: form.name_en,
        internal_sku: form.internal_sku,
        category: form.category,
        supplier_name: form.supplier_name,
        source_url: form.source_url,
        cost_price: form.cost_price,
        domestic_shipping: form.domestic_shipping,
        first_mile_shipping: form.first_mile_shipping,
        total_cost: totalCost,
        weight_kg: form.weight_kg,
        dimensions: {
          length: form.dimensions_length,
          width: form.dimensions_width,
          height: form.dimensions_height,
        },
        packaging_list: form.packaging_list.split('\n').filter(p => p.trim()),
        brand: form.brand,
        color: form.color,
        size: form.size,
      });

      // 刷新数据
      const updated = store.getProduct(product.id) as unknown as ERPProduct;
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

  // 保存 Listing
  const handleSaveListing = async () => {
    if (!product || !selectedListing) return;

    setIsSaving(true);
    try {
      const { default: store } = await import('@/lib/store');

      const listings = product.platform_listings?.map(l => {
        if (l.id === selectedListing.id) {
          return {
            ...l,
            listing_title: listingForm.title,
            listing_description: listingForm.description,
            bullet_points: listingForm.bullet_points.split('\n').filter(p => p.trim()),
            keywords: listingForm.keywords.split(',').map(k => k.trim()).filter(k => k),
            sale_price: listingForm.sale_price,
            language: listingForm.language,
          };
        }
        return l;
      }) || [];

      store.updateProduct(product.id, { platform_listings: listings });

      // 刷新数据
      const updated = store.getProduct(product.id) as unknown as ERPProduct;
      setProduct(updated);

      // 更新当前选中的 Listing
      const updatedListing = updated.platform_listings?.find(l => l.id === selectedListing.id);
      if (updatedListing) {
        setSelectedListing(updatedListing);
      }

      toast.success('Listing 保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // AI 优化标题
  const handleOptimizeTitle = async () => {
    if (!product) return;

    setIsAiOptimizing('title');
    try {
      const response = await fetch('/api/ai/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name_zh,
          product_name_en: product.name_en,
          category: product.category,
          type: 'title',
          target_language: listingForm.language,
          target_platform: selectedListing?.platform,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.optimized_title) {
        setListingForm(prev => ({ ...prev, title: data.data.optimized_title }));
        toast.success('标题优化完成');
      } else {
        throw new Error(data.error || '优化失败');
      }
    } catch (error: any) {
      console.error('AI优化失败:', error);
      toast.error(error.message || 'AI 优化失败');
    } finally {
      setIsAiOptimizing(null);
    }
  };

  // AI 生成描述
  const handleGenerateDescription = async () => {
    if (!product) return;

    setIsAiOptimizing('description');
    try {
      const response = await fetch('/api/ai/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name_zh,
          product_name_en: product.name_en,
          category: product.category,
          bullet_points: listingForm.bullet_points.split('\n').filter(p => p.trim()),
          type: 'description',
          target_language: listingForm.language,
          target_platform: selectedListing?.platform,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.description) {
        setListingForm(prev => ({
          ...prev,
          description: data.data.description,
          bullet_points: data.data.bullet_points?.join('\n') || prev.bullet_points,
        }));
        toast.success('描述生成完成');
      } else {
        throw new Error(data.error || '生成失败');
      }
    } catch (error: any) {
      console.error('AI生成失败:', error);
      toast.error(error.message || 'AI 生成失败');
    } finally {
      setIsAiOptimizing(null);
    }
  };

  // 认领到店铺
  const handleClaimToShop = async (platform: string) => {
    if (!product) return;

    try {
      const { default: store } = await import('@/lib/store');

      const newListing: any = {
        id: `PL-${Date.now()}`,
        platform,
        platform_name: PLATFORMS.find(p => p.value === platform)?.label || platform,
        shop_id: `${platform}-${Date.now()}`,
        shop_name: `${PLATFORMS.find(p => p.value === platform)?.label || platform} 店铺`,
        status: 'draft',
        listing_title: product.name_en || product.name_zh,
        language: platform === 'amazon' ? 'en' : platform === 'tiktok' ? 'id' : 'ms',
      };

      const updatedListings = [...(product.platform_listings || []), newListing];
      store.updateProduct(product.id, { platform_listings: updatedListings });

      // 刷新数据
      const updated = store.getProduct(product.id) as unknown as ERPProduct;
      setProduct(updated);

      // 选中新添加的 Listing
      selectListing(newListing);

      toast.success(`已认领到 ${newListing.platform_name}`);
    } catch (error) {
      console.error('认领失败:', error);
      toast.error('认领失败');
    }
  };

  // 移除店铺
  const handleRemoveShop = async (listingId: string) => {
    if (!product) return;

    try {
      const { default: store } = await import('@/lib/store');

      const updatedListings = product.platform_listings?.filter(l => l.id !== listingId) || [];
      store.updateProduct(product.id, { platform_listings: updatedListings });

      // 刷新数据
      const updated = store.getProduct(product.id) as unknown as ERPProduct;
      setProduct(updated);

      // 如果移除的是当前选中的，选中第一个
      if (selectedListing?.id === listingId) {
        if (updatedListings.length > 0) {
          selectListing(updatedListings[0]);
        } else {
          setSelectedListing(null);
        }
      }

      toast.success('已移除店铺');
    } catch (error) {
      console.error('移除失败:', error);
      toast.error('移除失败');
    }
  };

  // 获取状态徽章
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
    return (
      <Badge className={variants[status] || 'bg-muted'}>
        {labels[status] || status}
      </Badge>
    );
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
          <div className="flex items-center gap-2">
            {getStatusBadge(product.status)}
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                编辑信息
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  initForm(product);
                }}>
                取消
              </Button>
                <Button onClick={handleSaveBasic} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  保存
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 主内容区 */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧边栏 */}
          <div className="col-span-3 space-y-4">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[13px]">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">商品名称</Label>
                      <Input
                        value={form.name_zh}
                        onChange={(e) => setForm({ ...form, name_zh: e.target.value })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">英文名</Label>
                      <Input
                        value={form.name_en}
                        onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">SKU</Label>
                      <Input
                        value={form.internal_sku}
                        onChange={(e) => setForm({ ...form, internal_sku: e.target.value })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">类目</Label>
                      <Input
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">商品名称</span>
                      <span className="font-medium">{product.name_zh}</span>
                    </div>
                    {product.name_en && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">英文名</span>
                        <span>{product.name_en}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU</span>
                      <span className="font-mono">{product.internal_sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">类目</span>
                      <span>{product.category || '-'}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 供应商信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  供应商
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[13px]">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">供应商名称</Label>
                      <Input
                        value={form.supplier_name}
                        onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">货源链接</Label>
                      <Input
                        value={form.source_url}
                        onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">供应商</span>
                      <span>{product.supplier_name || '-'}</span>
                    </div>
                    {product.source_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-[11px]"
                        onClick={() => window.open(product.source_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        查看1688链接
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 成本定价 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  成本定价
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[13px]">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">采购成本 (¥)</Label>
                      <Input
                        type="number"
                        value={form.cost_price}
                        onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">国内运费 (¥)</Label>
                      <Input
                        type="number"
                        value={form.domestic_shipping}
                        onChange={(e) => setForm({ ...form, domestic_shipping: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">头程运费 (¥)</Label>
                      <Input
                        type="number"
                        value={form.first_mile_shipping}
                        onChange={(e) => setForm({ ...form, first_mile_shipping: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">采购成本</span>
                      <span className="font-medium">¥{product.cost_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">国内运费</span>
                      <span>¥{product.domestic_shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">头程运费</span>
                      <span>¥{product.first_mile_shipping.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between">
                      <span className="text-muted-foreground">总成本</span>
                      <span className="font-semibold text-primary">¥{product.total_cost.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {/* 定价建议 */}
                {product.pricing && !isEditing && (
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">建议售价</span>
                      <span className="font-medium">${product.pricing.suggested_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">利润率</span>
                      <span className="font-medium text-success">{product.pricing.profit_margin.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 规格包装 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  规格包装
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[13px]">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">重量 (kg)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.weight_kg}
                        onChange={(e) => setForm({ ...form, weight_kg: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">尺寸 (长×宽×高 cm)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          placeholder="长"
                          value={form.dimensions_length}
                          onChange={(e) => setForm({ ...form, dimensions_length: parseFloat(e.target.value) || 0 })}
                          className="h-8 text-[13px]"
                        />
                        <Input
                          type="number"
                          placeholder="宽"
                          value={form.dimensions_width}
                          onChange={(e) => setForm({ ...form, dimensions_width: parseFloat(e.target.value) || 0 })}
                          className="h-8 text-[13px]"
                        />
                        <Input
                          type="number"
                          placeholder="高"
                          value={form.dimensions_height}
                          onChange={(e) => setForm({ ...form, dimensions_height: parseFloat(e.target.value) || 0 })}
                          className="h-8 text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">品牌</Label>
                      <Input
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        className="h-8 text-[13px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">颜色</Label>
                        <Input
                          value={form.color}
                          onChange={(e) => setForm({ ...form, color: e.target.value })}
                          className="h-8 text-[13px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">尺寸</Label>
                        <Input
                          value={form.size}
                          onChange={(e) => setForm({ ...form, size: e.target.value })}
                          className="h-8 text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">包装清单</Label>
                      <Textarea
                        value={form.packaging_list}
                        onChange={(e) => setForm({ ...form, packaging_list: e.target.value })}
                        placeholder="每行一个物品"
                        rows={3}
                        className="text-[13px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">重量</span>
                      <span className="flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        {product.weight_kg || 0} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">尺寸</span>
                      <span>
                        {product.dimensions
                          ? `${product.dimensions.length}×${product.dimensions.width}×${product.dimensions.height} cm`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">品牌</span>
                      <span>{product.brand || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">颜色</span>
                      <span>{product.color || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">尺寸规格</span>
                      <span>{product.size || '-'}</span>
                    </div>
                    {product.packaging_list && product.packaging_list.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground text-[11px]">包装清单</span>
                        <ul className="list-disc list-inside mt-1 text-[12px]">
                          {product.packaging_list.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧主内容 */}
          <div className="col-span-9 space-y-6">
            {/* 图片 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    商品图片
                  </CardTitle>
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    AI处理图片
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-6 gap-3">
                    {product.images.map((img) => (
                      <div key={img.id} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                          <img
                            src={img.processed_url || img.original_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Badge
                          variant={img.type === 'main' ? 'default' : 'secondary'}
                          className="absolute top-2 left-2 text-[10px]"
                        >
                          {img.type === 'main' ? '主图' : img.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-[13px]">暂无图片</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listing 编辑 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Listing 编辑
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 店铺选择 */}
                <div className="mb-4">
                  <Label className="text-[11px] text-muted-foreground mb-2 block">选择店铺</Label>
                  <div className="flex gap-2">
                    {product.platform_listings && product.platform_listings.length > 0 ? (
                      product.platform_listings.map((listing) => (
                        <Button
                          key={listing.id}
                          variant={selectedListing?.id === listing.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => selectListing(listing)}
                          className="h-8"
                        >
                          <Store className="h-3 w-3 mr-1" />
                          {listing.platform_name || listing.platform}
                        </Button>
                      ))
                    ) : (
                      <span className="text-[13px] text-muted-foreground">暂未认领任何店铺</span>
                    )}
                  </div>
                </div>

                {selectedListing ? (
                  <div className="space-y-4">
                    {/* 店铺信息 */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {selectedListing.platform}
                        </Badge>
                        <span className="text-[13px]">{selectedListing.shop_name || '-'}</span>
                        <Badge className={
                          selectedListing.status === 'active' ? 'bg-success text-white' :
                          selectedListing.status === 'listed' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-muted'
                        }>
                          {selectedListing.status === 'active' ? '在售' :
                           selectedListing.status === 'listed' ? '已上架' :
                           selectedListing.status === 'draft' ? '草稿' : selectedListing.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={listingForm.language}
                          onValueChange={(value) => setListingForm({ ...listingForm, language: value })}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleRemoveShop(selectedListing.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* 标题 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[12px] text-muted-foreground">标题 (Title)</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={handleOptimizeTitle}
                          disabled={isAiOptimizing === 'title'}
                        >
                          {isAiOptimizing === 'title' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          AI优化标题
                        </Button>
                      </div>
                      <Input
                        value={listingForm.title}
                        onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                        placeholder="输入商品标题"
                        className="text-[13px]"
                      />
                    </div>

                    {/* 五点描述 */}
                    <div className="space-y-2">
                      <Label className="text-[12px] text-muted-foreground">五点描述 (Bullet Points)</Label>
                      <Textarea
                        value={listingForm.bullet_points}
                        onChange={(e) => setListingForm({ ...listingForm, bullet_points: e.target.value })}
                        placeholder="每行一个卖点"
                        rows={5}
                        className="text-[13px]"
                      />
                    </div>

                    {/* 描述 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[12px] text-muted-foreground">详细描述 (Description)</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={handleGenerateDescription}
                          disabled={isAiOptimizing === 'description'}
                        >
                          {isAiOptimizing === 'description' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          AI生成描述
                        </Button>
                      </div>
                      <Textarea
                        value={listingForm.description}
                        onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                        placeholder="输入详细描述"
                        rows={6}
                        className="text-[13px]"
                      />
                    </div>

                    {/* 关键词 */}
                    <div className="space-y-2">
                      <Label className="text-[12px] text-muted-foreground">关键词 (Search Terms)</Label>
                      <Input
                        value={listingForm.keywords}
                        onChange={(e) => setListingForm({ ...listingForm, keywords: e.target.value })}
                        placeholder="关键词，用逗号分隔"
                        className="text-[13px]"
                      />
                    </div>

                    {/* 定价 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[12px] text-muted-foreground">售价</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={listingForm.sale_price}
                          onChange={(e) => setListingForm({ ...listingForm, sale_price: parseFloat(e.target.value) || 0 })}
                          className="text-[13px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[12px] text-muted-foreground">货币</Label>
                        <Select
                          value={selectedListing.currency || 'USD'}
                          onValueChange={(value) => {
                            if (selectedListing) {
                              const updated = { ...selectedListing, currency: value };
                              const listings = product.platform_listings?.map(l =>
                                l.id === selectedListing.id ? updated : l
                              ) || [];
                              import('@/lib/store').then(({ default: store }) => {
                                store.updateProduct(product.id, { platform_listings: listings });
                                setProduct({ ...product, platform_listings: listings });
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="MYR">MYR (RM)</SelectItem>
                            <SelectItem value="IDR">IDR (Rp)</SelectItem>
                            <SelectItem value="THB">THB (฿)</SelectItem>
                            <SelectItem value="VND">VND (₫)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 保存按钮 */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button onClick={handleSaveListing} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        保存 Listing
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">请先认领到店铺</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 认领新店铺 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  认领到新店铺
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {PLATFORMS.map((platform) => {
                    const isClaimed = product.platform_listings?.some(
                      (l) => l.platform === platform.value
                    );
                    return (
                      <Button
                        key={platform.value}
                        variant={isClaimed ? 'outline' : 'default'}
                        className="h-12"
                        onClick={() => handleClaimToShop(platform.value)}
                        disabled={isClaimed}
                      >
                        <span className="mr-2 text-lg">{platform.icon}</span>
                        {platform.label}
                        {isClaimed && (
                          <CheckCircle className="h-4 w-4 ml-2 text-success" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
