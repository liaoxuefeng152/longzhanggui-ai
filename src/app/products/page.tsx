'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Search,
  Plus,
  Download,
  Package,
  Loader2,
  Image,
  FileText,
  TrendingUp,
  Eye,
  DollarSign,
  Package2,
  Shield,
  BarChart3,
  Truck,
  ShoppingCart,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { store, type Product, type ProductImage, type ProductListing, type ProductPricing, type PlatformListing } from '@/lib/store';

// 商品列表项类型
interface ProductListItem {
  id: string;
  name: string;
  name_en?: string;
  image?: string;
  category: string;
  platform: string;
  status: string;
  compliance_status: string;
  stock: number;
  price: number;
  sales: number;
  created_at: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, compliance_passed: 0, stock_warning: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  // 商品详情弹窗
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    try {
      const allProducts = store.getProducts();
      
      // 转换格式
      const listItems: ProductListItem[] = allProducts.map(p => {
        const inventory = store.getInventoryByProduct(p.id);
        const mainImage = p.images?.find(img => img.type === 'main');
        
        return {
          id: p.id,
          name: p.name_zh,
          name_en: p.name_en,
          image: mainImage?.processed_url || mainImage?.original_url,
          category: p.category || '未分类',
          platform: p.platform_listings?.[0]?.platform || 'tiktok',
          status: p.status,
          compliance_status: p.compliance_status,
          stock: inventory.reduce((sum, inv) => sum + inv.qty_available, 0),
          price: p.pricing?.suggested_price || p.cost_price || 0,
          sales: p.total_orders || 0,
          created_at: p.created_at,
        };
      });

      setProducts(listItems);

      // 计算统计
      setStats({
        total: listItems.length,
        active: listItems.filter(p => p.status === 'published').length,
        pending: listItems.filter(p => ['selected', 'processing', 'ready'].includes(p.status)).length,
        compliance_passed: listItems.filter(p => p.compliance_status === 'passed').length,
        stock_warning: listItems.filter(p => p.stock < 50).length,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    refreshData();
  }, [router]);

  // 打开商品详情
  const openProductDetail = (productId: string) => {
    const p = store.getProduct(productId);
    if (p) {
      setDetailProduct(p);
      setIsDetailOpen(true);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
    return matchSearch && matchStatus && matchPlatform;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      draft: { label: '草稿', className: 'bg-muted text-muted-foreground' },
      selected: { label: '已选品', className: 'bg-blue-500/10 text-blue-500' },
      processing: { label: '处理中', className: 'bg-warning/10 text-warning' },
      ready: { label: '待上架', className: 'bg-orange-500/10 text-orange-500' },
      published: { label: '已上架', className: 'bg-success text-white' },
      archived: { label: '已归档', className: 'bg-muted text-muted-foreground' },
    };
    const c = config[status] || config.draft;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      passed: { label: '合规', className: 'bg-success/10 text-success' },
      pending: { label: '待校验', className: 'bg-muted text-muted-foreground' },
      checking: { label: '校验中', className: 'bg-warning/10 text-warning' },
      failed: { label: '不合规', className: 'bg-destructive/10 text-destructive' },
    };
    const c = config[status] || config.pending;
    return <Badge variant="outline" className={`${c.className} border-0 text-[11px]`}>{c.label}</Badge>;
  };

  const getImageStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      done: { label: '已完成', className: 'bg-success/10 text-success' },
      processing: { label: '处理中', className: 'bg-warning/10 text-warning' },
      pending: { label: '待处理', className: 'bg-muted text-muted-foreground' },
      failed: { label: '失败', className: 'bg-destructive/10 text-destructive' },
    };
    const c = config[status] || config.pending;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getListingStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      done: { label: '已生成', className: 'bg-success/10 text-success' },
      processing: { label: '生成中', className: 'bg-warning/10 text-warning' },
      pending: { label: '待生成', className: 'bg-muted text-muted-foreground' },
      failed: { label: '失败', className: 'bg-destructive/10 text-destructive' },
    };
    const c = config[status] || config.pending;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">商品库管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              商品信息 · 合规状态 · 库存管理
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { refreshData(); toast.success('已刷新'); }}>
              <Package className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" onClick={() => toast.info('导出功能开发中')}>
              <Download className="h-4 w-4 mr-2" />
              导出商品
            </Button>
            <Button onClick={() => toast.info('添加商品功能开发中')}>
              <Plus className="h-4 w-4 mr-2" />
              添加商品
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">商品总数</div>
              <div className="text-[24px] font-semibold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">已上架</div>
              <div className="text-[24px] font-semibold text-success">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">待处理</div>
              <div className="text-[24px] font-semibold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">合规通过</div>
              <div className="text-[24px] font-semibold text-success">{stats.compliance_passed}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">库存预警</div>
              <div className="text-[24px] font-semibold text-destructive">{stats.stock_warning}</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索商品名称、SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="selected">已选品</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="ready">待上架</SelectItem>
                  <SelectItem value="published">已上架</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部平台</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="shopee">Shopee</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterPlatform('all'); }}>
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p>暂无商品数据</p>
                <p className="text-[12px] mt-1">从选品智能体或1688采集添加商品</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">商品信息</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">类目</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">合规</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">图片</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">Listing</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">库存</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">售价</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow 
                      key={product.id} 
                      className="border-border hover:bg-muted/30 cursor-pointer"
                      onClick={() => openProductDetail(product.id)}
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-foreground line-clamp-1">{product.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{product.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{product.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] capitalize">{product.platform}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>{getComplianceBadge(product.compliance_status)}</TableCell>
                      <TableCell>
                        {product.status === 'draft' ? (
                          <Badge variant="outline" className="text-[11px] bg-muted">待处理</Badge>
                        ) : (
                          getImageStatusBadge('done')
                        )}
                      </TableCell>
                      <TableCell>
                        {product.status === 'draft' || product.status === 'selected' ? (
                          <Badge variant="outline" className="text-[11px] bg-muted">待生成</Badge>
                        ) : (
                          getListingStatusBadge('done')
                        )}
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground">
                        <span className={product.stock < 50 ? 'text-destructive font-medium' : ''}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground">
                        ${product.price > 0 ? product.price.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="text-right px-6" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Package className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openProductDetail(product.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Image className="h-4 w-4 mr-2" />
                              处理图片
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              生成Listing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <DollarSign className="h-4 w-4 mr-2" />
                              智能定价
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              创建广告
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除商品
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 商品详情弹窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              商品详情
            </DialogTitle>
          </DialogHeader>
          {detailProduct && (
            <div className="space-y-6 mt-4">
              {/* 基本信息 */}
              <div className="flex gap-4">
                <div className="w-40 h-40 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {detailProduct.images?.find(img => img.type === 'main') ? (
                    <img 
                      src={detailProduct.images?.find(img => img.type === 'main')?.processed_url || 
                            detailProduct.images?.find(img => img.type === 'main')?.original_url} 
                      alt={detailProduct.name_zh} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-[18px] font-semibold">{detailProduct.name_zh}</h3>
                    {detailProduct.name_en && (
                      <p className="text-[14px] text-muted-foreground">{detailProduct.name_en}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-mono">{detailProduct.internal_sku}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">类目:</span>
                      <Badge variant="outline">{detailProduct.category || '未分类'}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">状态:</span>
                      {getStatusBadge(detailProduct.status)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">合规:</span>
                      {getComplianceBadge(detailProduct.compliance_status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">图片:</span>
                      {getImageStatusBadge(detailProduct.image_status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Listing:</span>
                      {getListingStatusBadge(detailProduct.listing_status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="info">基本信息</TabsTrigger>
                  <TabsTrigger value="cost">成本定价</TabsTrigger>
                  <TabsTrigger value="listing">Listing</TabsTrigger>
                  <TabsTrigger value="images">图片</TabsTrigger>
                  <TabsTrigger value="platform">平台</TabsTrigger>
                </TabsList>

                {/* 基本信息Tab */}
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[12px] text-muted-foreground mb-1">选品评分</div>
                      <div className="text-[20px] font-semibold">
                        {detailProduct.selection_score ? `${detailProduct.selection_score}/100` : '-'}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[12px] text-muted-foreground mb-1">销量趋势</div>
                      <div className="text-[20px] font-semibold flex items-center gap-2">
                        {detailProduct.sales_trend !== undefined ? (
                          <>
                            {detailProduct.sales_trend > 0 ? '+' : ''}{detailProduct.sales_trend}%
                            {detailProduct.sales_trend > 0 ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : detailProduct.sales_trend < 0 ? (
                              <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
                            ) : null}
                          </>
                        ) : '-'}
                      </div>
                    </div>
                  </div>

                  {detailProduct.supplier_name && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[14px] font-medium">供应商信息</span>
                      </div>
                      <div className="space-y-2 text-[13px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">供应商:</span>
                          <span>{detailProduct.supplier_name}</span>
                        </div>
                        {detailProduct.source_url && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">1688链接:</span>
                            <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => window.open(detailProduct.source_url, '_blank')}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              查看
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[14px] font-medium">销售统计</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总订单:</span>
                        <span className="font-medium">{detailProduct.total_orders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总销售额:</span>
                        <span className="font-medium">${(detailProduct.total_sales || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">总利润:</span>
                        <span className="font-medium text-success">${(detailProduct.total_profit || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[12px] text-muted-foreground">
                    创建时间: {detailProduct.created_at} | 更新时间: {detailProduct.updated_at}
                  </div>
                </TabsContent>

                {/* 成本定价Tab */}
                <TabsContent value="cost" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[12px] text-muted-foreground mb-1">采购成本</div>
                      <div className="text-[20px] font-semibold">¥{detailProduct.cost_price.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[12px] text-muted-foreground mb-1">国内运费</div>
                      <div className="text-[20px] font-semibold">¥{detailProduct.domestic_shipping.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-[12px] text-muted-foreground mb-1">头程运费</div>
                      <div className="text-[20px] font-semibold">¥{detailProduct.first_mile_shipping.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="text-[12px] text-primary mb-1">总成本</div>
                      <div className="text-[20px] font-semibold text-primary">¥{detailProduct.total_cost.toFixed(2)}</div>
                    </div>
                  </div>

                  {detailProduct.pricing && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-[14px] font-medium">智能定价建议</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">建议售价:</span>
                          <span className="font-medium">${detailProduct.pricing.suggested_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">目标价:</span>
                          <span className="font-medium">${detailProduct.pricing.target_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">利润率:</span>
                          <span className="font-medium text-success">{detailProduct.pricing.profit_margin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">计算时间:</span>
                          <span className="font-medium text-[11px]">{detailProduct.pricing.calculated_at || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Listing Tab */}
                <TabsContent value="listing" className="space-y-4">
                  {detailProduct.listing ? (
                    <>
                      <div className="p-4 border rounded-lg">
                        <div className="text-[14px] font-medium mb-3">英文标题</div>
                        <div className="p-3 bg-muted/30 rounded text-[13px]">
                          {detailProduct.listing.title_en || detailProduct.listing.title}
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(detailProduct.listing?.title_en || detailProduct.listing?.title || '');
                            toast.success('已复制');
                          }}>
                            <Copy className="h-3 w-3 mr-1" />
                            复制
                          </Button>
                        </div>
                      </div>

                      {detailProduct.listing.bullet_points && detailProduct.listing.bullet_points.length > 0 && (
                        <div className="p-4 border rounded-lg">
                          <div className="text-[14px] font-medium mb-3">五点描述</div>
                          <ul className="space-y-2">
                            {detailProduct.listing.bullet_points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-[13px]">
                                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {detailProduct.listing.keywords && detailProduct.listing.keywords.length > 0 && (
                        <div className="p-4 border rounded-lg">
                          <div className="text-[14px] font-medium mb-3">关键词</div>
                          <div className="flex flex-wrap gap-2">
                            {detailProduct.listing.keywords.map((kw, idx) => (
                              <Badge key={idx} variant="outline">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span className="text-[13px] text-muted-foreground">
                          SEO评分: <span className="font-medium">{detailProduct.listing.seo_score || 0}/100</span>
                        </span>
                        <span className="text-[12px] text-muted-foreground">
                          生成时间: {detailProduct.listing.generated_at || '-'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>暂无Listing信息</p>
                      <Button variant="outline" className="mt-4" onClick={() => toast.info('生成Listing功能开发中')}>
                        <FileText className="h-4 w-4 mr-2" />
                        生成Listing
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* 图片Tab */}
                <TabsContent value="images" className="space-y-4">
                  {detailProduct.images && detailProduct.images.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {detailProduct.images.map((img) => (
                        <div key={img.id} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <img 
                              src={img.processed_url || img.original_url} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-[10px] capitalize">{img.type}</Badge>
                              {getImageStatusBadge(img.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>暂无图片信息</p>
                      <Button variant="outline" className="mt-4" onClick={() => toast.info('处理图片功能开发中')}>
                        <Image className="h-4 w-4 mr-2" />
                        处理图片
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* 平台Tab */}
                <TabsContent value="platform" className="space-y-4">
                  {detailProduct.platform_listings && detailProduct.platform_listings.length > 0 ? (
                    <div className="space-y-3">
                      {detailProduct.platform_listings.map((listing) => (
                        <div key={listing.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="capitalize">{listing.platform}</Badge>
                              <span className="text-[13px]">{listing.shop_name || '未绑定店铺'}</span>
                            </div>
                            <Badge className={
                              listing.status === 'active' ? 'bg-success text-white' :
                              listing.status === 'listed' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-muted text-muted-foreground'
                            }>
                              {listing.status === 'active' ? '在售' :
                               listing.status === 'listed' ? '已上架' :
                               listing.status === 'pending' ? '待上架' : '已下架'}
                            </Badge>
                          </div>
                          {listing.listing_url && (
                            <div className="mt-2 flex justify-end">
                              <Button variant="ghost" size="sm" onClick={() => window.open(listing.listing_url, '_blank')}>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                查看链接
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>暂未发布到任何平台</p>
                      <Button variant="outline" className="mt-4" onClick={() => toast.info('上架发布功能开发中')}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        上架发布
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setIsDetailOpen(false)}>
                  关闭
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.info('处理图片功能开发中')}>
                  <Image className="h-4 w-4 mr-2" />
                  处理图片
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.info('生成Listing功能开发中')}>
                  <FileText className="h-4 w-4 mr-2" />
                  生成Listing
                </Button>
                <Button className="flex-1" onClick={() => toast.info('上架发布功能开发中')}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  上架发布
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
