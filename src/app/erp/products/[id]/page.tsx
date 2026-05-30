'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Package,
  Save,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Truck,
  DollarSign,
  Ruler,
  Weight,
  Box,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

// 商品数据结构
interface ProductDetail {
  id: string;
  offer_id?: string;
  source_url?: string;
  title: string;
  price: number;
  original_price?: number;
  images: string[];
  videos?: string[];
  supplier?: string;
  supplier_url?: string;
  location?: string;
  sales?: number;
  min_order?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  description?: string;
  category?: string;
  category_id?: string;
  attributes?: Record<string, string>;
  skus?: SKU[];
  status: 'draft' | 'selected' | 'processing' | 'ready' | 'published' | 'archived';
  platform?: string;
  claimed?: boolean;
  claimed_platform?: string;
  created_at: string;
  updated_at: string;
}

interface SKU {
  id: string;
  specs: Record<string, string>;
  price: number;
  stock: number;
  sku_code?: string;
}

const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  selected: { label: '已选品', color: 'bg-blue-100 text-blue-700' },
  processing: { label: '处理中', color: 'bg-yellow-100 text-yellow-700' },
  ready: { label: '待上架', color: 'bg-orange-100 text-orange-700' },
  published: { label: '已上架', color: 'bg-green-100 text-green-700' },
  archived: { label: '已归档', color: 'bg-gray-100 text-gray-500' },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 编辑状态
  const [editData, setEditData] = useState<Partial<ProductDetail>>({});

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      
      // 优先从商品详情API获取
      const res = await fetch(`/api/v1/erp/products/${productId}`);
      const data = await res.json();
      
      // 兼容两种API返回格式:
      // 1. {success: true, data: {...}} — 旧格式
      // 2. {id: ..., images: [...]} — 后端代理直返格式
      let apiData: any = null;
      if (data.success && data.data) {
        apiData = data.data;
      } else if (data.id) {
        apiData = data;
      }

      if (apiData) {
        // 解析images字段（可能是JSON字符串或数组）
        let images: string[] = [];
        if (typeof apiData.images === 'string') {
          try { images = JSON.parse(apiData.images); } catch { images = []; }
        } else if (Array.isArray(apiData.images)) {
          images = apiData.images;
        }

        // 解析videos字段
        let videos: string[] = [];
        if (typeof apiData.videos === 'string') {
          try { videos = JSON.parse(apiData.videos); } catch { videos = []; }
        } else if (Array.isArray(apiData.videos)) {
          videos = apiData.videos;
        }

        const convertedData: ProductDetail = {
          id: apiData.id,
          offer_id: apiData.source_id || apiData.offer_id,
          source_url: apiData.source_url,
          title: apiData.title || apiData.name_zh || apiData.product_name || '未命名商品',
          price: apiData.price || apiData.cost_price || 0,
          original_price: apiData.original_price || apiData.cost_price,
          images: images,
          videos: videos,
          supplier: apiData.supplier || apiData.supplier_name,
          location: apiData.location || '',
          sales: apiData.sales || 0,
          min_order: apiData.min_order || 1,
          weight: apiData.weight,
          description: apiData.description || apiData.details || '',
          status: apiData.status || 'draft',
          claimed: apiData.claimed || false,
          claimed_platform: apiData.claimed_platform || apiData.claimed_shop_id,
          created_at: apiData.created_at,
          updated_at: apiData.updated_at,
        };
        setProduct(convertedData);
        setEditData(convertedData);
      } else {
        // 如果商品不存在，尝试从采集箱获取
        const { default: store } = await import('@/lib/store');
        const collectionItem = store.getPublicCollection(productId);
        
        if (collectionItem) {
          // 转换为商品详情格式
          const productFromCollection: ProductDetail = {
            id: collectionItem.id,
            offer_id: collectionItem.source_id,
            source_url: collectionItem.source_url,
            title: collectionItem.product_name || '未命名商品',
            price: collectionItem.cost_price || 0,
            original_price: collectionItem.cost_price,
            images: collectionItem.images || [],
            videos: [],
            supplier: collectionItem.supplier_name,
            location: '',
            sales: 0,
            min_order: 1,
            description: '',
            status: collectionItem.claimed ? 'selected' : 'draft',
            claimed: collectionItem.claimed,
            claimed_platform: collectionItem.claimed_shop_id,
            created_at: collectionItem.created_at,
            updated_at: collectionItem.updated_at,
          };
          setProduct(productFromCollection);
          setEditData(productFromCollection);
        } else {
          toast.error('商品不存在');
          router.push('/erp/products');
        }
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      toast.error('获取商品详情失败');
      router.push('/erp/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/v1/erp/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
        toast.success('保存成功');
      } else {
        toast.error('保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">商品不存在</p>
            <Button asChild>
              <Link href="/erp/products">返回商品列表</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/erp/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-[24px] font-semibold">{product.title || '商品详情'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={STATUS_CONFIG[product.status]?.color || 'bg-gray-100'}>
                  {STATUS_CONFIG[product.status]?.label || product.status}
                </Badge>
                {product.offer_id && (
                  <span className="text-[12px] text-muted-foreground">
                    1688OfferID: {product.offer_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchProductDetail}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(product.source_url, '_blank')}
              disabled={!product.source_url}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              查看货源
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              保存修改
            </Button>
          </div>
        </div>

        {/* Tab导航 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="category">类目属性</TabsTrigger>
            <TabsTrigger value="sales">销售属性</TabsTrigger>
            <TabsTrigger value="images">产品图片</TabsTrigger>
            <TabsTrigger value="videos">产品视频</TabsTrigger>
            <TabsTrigger value="logistics">物流信息</TabsTrigger>
          </TabsList>

          {/* 基本信息 */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>商品的基础信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>商品标题</Label>
                    <Input
                      value={editData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="请输入商品标题"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>商品状态</Label>
                    <Select
                      value={editData.status || 'draft'}
                      onValueChange={(v) => handleInputChange('status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>售价 (元)</Label>
                    <Input
                      type="number"
                      value={editData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                      placeholder="请输入售价"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>原价 (元)</Label>
                    <Input
                      type="number"
                      value={editData.original_price || ''}
                      onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value))}
                      placeholder="请输入原价"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>最低起订量</Label>
                    <Input
                      type="number"
                      value={editData.min_order || ''}
                      onChange={(e) => handleInputChange('min_order', parseInt(e.target.value))}
                      placeholder="最低起订量"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>销量</Label>
                    <Input
                      type="number"
                      value={editData.sales || ''}
                      onChange={(e) => handleInputChange('sales', parseInt(e.target.value))}
                      placeholder="销量"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>商品链接</Label>
                  <Input
                    value={editData.source_url || ''}
                    onChange={(e) => handleInputChange('source_url', e.target.value)}
                    placeholder="商品链接"
                  />
                </div>

                <div className="space-y-2">
                  <Label>商品描述</Label>
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="请输入商品描述"
                    rows={6}
                  />
                </div>

                {/* 供应商信息 */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-[14px] font-medium mb-3">供应商信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>供应商名称</Label>
                      <Input
                        value={editData.supplier || ''}
                        onChange={(e) => handleInputChange('supplier', e.target.value)}
                        placeholder="供应商名称"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>所在地</Label>
                      <Input
                        value={editData.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="所在地"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label>供应商链接</Label>
                    <Input
                      value={editData.supplier_url || ''}
                      onChange={(e) => handleInputChange('supplier_url', e.target.value)}
                      placeholder="供应商链接"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 类目属性 */}
          <TabsContent value="category">
            <Card>
              <CardHeader>
                <CardTitle>类目属性</CardTitle>
                <CardDescription>商品所属类目及属性信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>商品类目</Label>
                    <Input
                      value={editData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="请选择或输入类目"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>类目ID</Label>
                    <Input
                      value={editData.category_id || ''}
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
                      placeholder="类目ID"
                    />
                  </div>
                </div>

                {/* 动态属性 */}
                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-[14px] font-medium mb-3">商品属性</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label>{key}</Label>
                          <Input
                            value={value as string}
                            onChange={(e) => {
                              const newAttrs = { ...editData.attributes, [key]: e.target.value };
                              handleInputChange('attributes', newAttrs);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 销售属性 */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>销售属性</CardTitle>
                <CardDescription>SKU规格和价格设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.skus && product.skus.length > 0 ? (
                  <div className="space-y-3">
                    {product.skus.map((sku, index) => (
                      <div
                        key={sku.id || index}
                        className="flex items-center gap-4 p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {Object.entries(sku.specs).map(([key, val]) => (
                              <Badge key={key} variant="outline">
                                {key}: {val}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-[14px] text-muted-foreground">
                            <span>价格: ¥{sku.price}</span>
                            <span>库存: {sku.stock}</span>
                            {sku.sku_code && <span>SKU: {sku.sku_code}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无销售属性</p>
                    <p className="text-[12px]">可在1688商品详情中获取SKU信息</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品图片 */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>产品图片</CardTitle>
                <CardDescription>商品主图和详情图片</CardDescription>
              </CardHeader>
              <CardContent>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative aspect-square border rounded-lg overflow-hidden group"
                      >
                        <img
                          src={img}
                          alt={`商品图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(img);
                              toast.success('图片链接已复制');
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            复制链接
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无商品图片</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品视频 */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>产品视频</CardTitle>
                <CardDescription>商品视频展示</CardDescription>
              </CardHeader>
              <CardContent>
                {product.videos && product.videos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {product.videos.map((video, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <video
                          src={video}
                          controls
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无产品视频</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 物流信息 */}
          <TabsContent value="logistics">
            <Card>
              <CardHeader>
                <CardTitle>物流信息</CardTitle>
                <CardDescription>商品重量和尺寸信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>商品重量 (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                      placeholder="商品重量"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-[14px] font-medium mb-3">包装尺寸</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>长度 (cm)</Label>
                      <Input
                        type="number"
                        value={editData.dimensions?.length || ''}
                        onChange={(e) => {
                          const dims = { ...editData.dimensions, length: parseFloat(e.target.value) };
                          handleInputChange('dimensions', dims);
                        }}
                        placeholder="长度"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>宽度 (cm)</Label>
                      <Input
                        type="number"
                        value={editData.dimensions?.width || ''}
                        onChange={(e) => {
                          const dims = { ...editData.dimensions, width: parseFloat(e.target.value) };
                          handleInputChange('dimensions', dims);
                        }}
                        placeholder="宽度"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>高度 (cm)</Label>
                      <Input
                        type="number"
                        value={editData.dimensions?.height || ''}
                        onChange={(e) => {
                          const dims = { ...editData.dimensions, height: parseFloat(e.target.value) };
                          handleInputChange('dimensions', dims);
                        }}
                        placeholder="高度"
                      />
                    </div>
                  </div>
                </div>

                {/* 体积重计算 */}
                {editData.weight && editData.dimensions?.length && editData.dimensions?.width && editData.dimensions?.height && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-[14px] font-medium text-blue-800 mb-2">体积重参考</h4>
                    <p className="text-[14px] text-blue-700">
                      体积重 = (长 × 宽 × 高) / 6000 = 
                      {(editData.dimensions.length * editData.dimensions.width * editData.dimensions.height / 6000).toFixed(2)} kg
                    </p>
                    <p className="text-[12px] text-blue-600 mt-1">
                      实际计费重取体积重和实际重量中较大者
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
