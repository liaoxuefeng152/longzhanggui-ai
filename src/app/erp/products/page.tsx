'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Box,
  Loader2,
  Play,
  Rocket,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  image_status: string;
  listing_status?: string;
  compliance_status: string;
  compliance_issues?: string[];
  category?: string;
  status: string;
  selection_score?: number;
  total_sales?: number;
  total_orders?: number;
  total_profit?: number;
  platform_listings?: any[];
  created_at: string;
  updated_at: string;
}

interface NewProductForm {
  name_zh: string;
  name_en: string;
  cost_price: string;
  domestic_shipping: string;
  first_mile_shipping: string;
  supplier_name: string;
  category: string;
  source_url: string;
}

export default function ERPProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<ERPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 对话框状态
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ERPProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  
  // 导入相关状态
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name_zh: '',
    name_en: '',
    cost_price: '',
    domestic_shipping: '5',
    first_mile_shipping: '15',
    supplier_name: '',
    category: '',
    source_url: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchProducts();

    // 监听页面可见性变化（从其他标签页切换回来时刷新）
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router, keyword, statusFilter]);

  // 当筛选条件改变时自动刷新
  useEffect(() => {
    fetchProducts();
  }, [keyword, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // 优先从全局存储读取
      const { default: store } = await import('@/lib/store');
      const allProducts = store.getProducts();

      console.log('[商品中心] 从全局存储读取商品:', allProducts.length);

      // 按创建时间倒序排序，新商品显示在顶部
      const sortedProducts = allProducts.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log('[商品中心] 排序后的商品数量:', sortedProducts.length);

      // 应用过滤
      let filteredProducts = sortedProducts;

      if (keyword) {
        filteredProducts = filteredProducts.filter(p =>
          p.name_zh.toLowerCase().includes(keyword.toLowerCase()) ||
          p.internal_sku.toLowerCase().includes(keyword.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(keyword.toLowerCase()))
        );
      }

      if (statusFilter) {
        filteredProducts = filteredProducts.filter(p => p.status === statusFilter);
      }

      console.log('[商品中心] 过滤后的商品数量:', filteredProducts.length);
      console.log('[商品中心] 商品状态分布:', filteredProducts.map(p => ({ id: p.id, name: p.name_zh, status: p.status, created_at: p.created_at })));

      // 如果没有筛选条件且存在"已选品"商品，显示提示
      if (!statusFilter && !keyword) {
        const selectedCount = filteredProducts.filter(p => p.status === 'selected').length;
        if (selectedCount > 0) {
          toast.info(`发现 ${selectedCount} 个已选品商品`, {
            description: '新选品的商品显示在列表顶部，状态为"已选品"',
          });
        }
      }

      setProducts(filteredProducts as any);
    } catch (error) {
      console.error('获取商品失败:', error);
      toast.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name_zh) {
      toast.error('请输入商品名称');
      return;
    }

    try {
      // 获取token
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/v1/erp/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name_zh: newProduct.name_zh,
          name_en: newProduct.name_en,
          cost_price: parseFloat(newProduct.cost_price) || 0,
          domestic_shipping: parseFloat(newProduct.domestic_shipping) || 0,
          first_mile_shipping: parseFloat(newProduct.first_mile_shipping) || 0,
          supplier_name: newProduct.supplier_name,
          category_name: newProduct.category,
          source_url: newProduct.source_url,
          status: 'selected',
        }),
      });

      const data = await response.json();
      // 兼容两种返回格式:
      // 1. 后端格式: {id: "...", name_zh: "...", ...}
      // 2. 前端格式: {success: true, data: {...}}
      if (data.id || data.success) {
        toast.success('商品创建成功');
        setIsNewProductOpen(false);
        setNewProduct({
          name_zh: '',
          name_en: '',
          cost_price: '',
          domestic_shipping: '5',
          first_mile_shipping: '15',
          supplier_name: '',
          category: '',
          source_url: '',
        });
        fetchProducts();
      } else {
        toast.error(data.detail || data.error || '创建失败');
      }
    } catch (error) {
      console.error('创建商品失败:', error);
      toast.error('创建商品失败');
    }
  };

  const handleProcessProduct = async (productId: string) => {
    setIsProcessing(productId);
    try {
      const response = await fetch(`/api/v1/erp/products/${productId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: ['image', 'listing', 'compliance', 'pricing'],
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('处理流程已启动', {
          description: '请稍后刷新查看处理结果',
        });
        // 跳转到工作流页面
        setTimeout(() => {
          router.push('/workflows');
        }, 1500);
      } else {
        toast.error(data.error || '启动失败');
      }
    } catch (error) {
      console.error('启动处理失败:', error);
      toast.error('启动处理失败');
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePublishProduct = async (productId: string) => {
    setIsPublishing(productId);
    try {
      const response = await fetch(`/api/v1/erp/products/${productId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'tiktok',
          region: 'id',
          auto_ad: true,
          ad_budget: 100,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('商品已上架', {
          description: '广告投放已自动启动',
        });
        fetchProducts();
      } else {
        toast.error(data.error || '上架失败');
      }
    } catch (error) {
      console.error('上架失败:', error);
      toast.error('上架失败');
    } finally {
      setIsPublishing(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('确定要删除此商品吗？')) return;

    try {
      const response = await fetch(`/api/v1/erp/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('商品已删除');
        fetchProducts();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除商品失败:', error);
      toast.error('删除商品失败');
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error('请上传 Excel 或 CSV 文件');
      return;
    }

    // 检查文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过 10MB');
      return;
    }

    setImportFile(file);

    // 模拟预览数据
    const mockPreview = [
      { sku: 'SKU001', name: '宠物喂食器 5L', cost: 68, category: '宠物用品' },
      { sku: 'SKU002', name: '便携榨汁机', cost: 45, category: '家居电器' },
      { sku: 'SKU003', name: '智能手环', cost: 89, category: '3C数码' },
    ];
    setImportPreview(mockPreview);
    toast.success('文件已选择，请确认预览数据');
  };

  // 执行导入
  const handleImport = async () => {
    if (!importFile) {
      toast.error('请先选择文件');
      return;
    }

    setIsImporting(true);
    try {
      // 模拟导入过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('导入成功', {
        description: `成功导入 ${importPreview.length} 个商品`,
      });
      
      setIsImportOpen(false);
      setImportFile(null);
      setImportPreview([]);
      fetchProducts();
    } catch (error) {
      toast.error('导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const template = '商品名称,SKU,成本价,类目,供应商,采购链接\n宠物喂食器,SKU001,68,宠物用品,xxx供应商,https://detail.1688.com...';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '商品导入模板.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('模板已下载');
  };

  const handleViewDetail = async (productId: string) => {
    try {
      const { default: store } = await import('@/lib/store');
      const product = store.getProduct(productId);
      if (product) {
        setSelectedProduct(product as any);
        setIsDetailOpen(true);
      } else {
        toast.error('商品不存在');
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      toast.error('获取商品详情失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      draft: { label: '草稿', className: 'bg-muted text-muted-foreground' },
      selected: { label: '已选品', className: 'bg-primary/10 text-primary' },
      processing: { label: '处理中', className: 'bg-warning/10 text-warning' },
      ready: { label: '待上架', className: 'bg-success/10 text-success' },
      published: { label: '已上架', className: 'bg-success text-white' },
      archived: { label: '已归档', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status] || config.draft;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getImageStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-muted text-muted-foreground' },
      processing: { label: '处理中', className: 'bg-warning/10 text-warning' },
      done: { label: '已完成', className: 'bg-success/10 text-success' },
      failed: { label: '失败', className: 'bg-destructive/10 text-destructive' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={`text-[11px] ${className}`}>{label}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待校验', className: 'bg-muted text-muted-foreground' },
      checking: { label: '校验中', className: 'bg-warning/10 text-warning' },
      passed: { label: '合规', className: 'bg-success/10 text-success' },
      failed: { label: '不合规', className: 'bg-destructive/10 text-destructive' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={`text-[11px] ${className}`}>{label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">商品中心</h1>
              <p className="text-[14px] text-muted-foreground">选品入库 · 图片处理 · Listing优化 · 上架发布</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchProducts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              导入
            </Button>
            <Button onClick={() => router.push('/agents/product-selection')}>
              <Search className="h-4 w-4 mr-2" />
              AI选品
            </Button>
            <Button onClick={() => setIsNewProductOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新增商品
            </Button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">商品总数</div>
              <div className="text-[24px] font-semibold text-foreground">{products.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已选品</div>
              <div className="text-[24px] font-semibold text-primary">{products.filter(p => p.status === 'selected').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">处理中</div>
              <div className="text-[24px] font-semibold text-warning">{products.filter(p => p.status === 'processing').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">待上架</div>
              <div className="text-[24px] font-semibold text-success">{products.filter(p => p.status === 'ready').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已上架</div>
              <div className="text-[24px] font-semibold text-success">{products.filter(p => p.status === 'published').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索商品名称、SKU、供应商..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="selected">已选品</option>
                <option value="processing">处理中</option>
                <option value="ready">待上架</option>
                <option value="published">已上架</option>
              </select>
              <Button variant="outline" onClick={fetchProducts}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
              <Button variant="outline" onClick={() => {
                fetchProducts();
                toast.success('已刷新商品列表');
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">商品列表</CardTitle>
            <CardDescription>商品全生命周期管理：选品 → 处理 → 上架 → 销售</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无商品数据，点击"AI选品"或"新增商品"开始
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground font-mono">{product.internal_sku}</span>
                            {getStatusBadge(product.status)}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{product.name_zh}</div>
                          {product.name_en && (
                            <div className="text-[12px] text-muted-foreground">{product.name_en}</div>
                          )}
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>分类: <span className="text-foreground">{product.category || '-'}</span></span>
                            <span>供应商: <span className="text-foreground">{product.supplier_name || '-'}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getImageStatusBadge(product.image_status)}
                            {getComplianceBadge(product.compliance_status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-[20px] font-semibold text-foreground">¥{product.total_cost.toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">总成本</div>
                        {product.selection_score && (
                          <div className="flex items-center justify-end gap-1 text-[12px]">
                            <span className="text-muted-foreground">选品得分:</span>
                            <span className="text-primary font-medium">{product.selection_score}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          {product.status === 'selected' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleProcessProduct(product.id)}
                              disabled={isProcessing === product.id}
                            >
                              {isProcessing === product.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3 mr-1" />
                              )}
                              开始处理
                            </Button>
                          )}
                          {product.status === 'ready' && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePublishProduct(product.id)}
                              disabled={isPublishing === product.id}
                            >
                              {isPublishing === product.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Rocket className="h-3 w-3 mr-1" />
                              )}
                              上架发布
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleViewDetail(product.id)}>
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/agents/product-selection`)}>
                                重新选品分析
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/agents/image-design`)}>
                                图片处理
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/agents/listing-optimization`)}>
                                Listing优化
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                删除商品
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 新增商品对话框 */}
        <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>新增商品</DialogTitle>
              <DialogDescription>手动添加商品到商品库</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>商品名称（中文）*</Label>
                <Input
                  value={newProduct.name_zh}
                  onChange={(e) => setNewProduct({ ...newProduct, name_zh: e.target.value })}
                  placeholder="请输入商品名称"
                />
              </div>
              <div className="space-y-2">
                <Label>商品名称（英文）</Label>
                <Input
                  value={newProduct.name_en}
                  onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                  placeholder="Product Name"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>成本价</Label>
                  <Input
                    type="number"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>国内运费</Label>
                  <Input
                    type="number"
                    value={newProduct.domestic_shipping}
                    onChange={(e) => setNewProduct({ ...newProduct, domestic_shipping: e.target.value })}
                    placeholder="5.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>头程运费</Label>
                  <Input
                    type="number"
                    value={newProduct.first_mile_shipping}
                    onChange={(e) => setNewProduct({ ...newProduct, first_mile_shipping: e.target.value })}
                    placeholder="15.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>供应商</Label>
                <Input
                  value={newProduct.supplier_name}
                  onChange={(e) => setNewProduct({ ...newProduct, supplier_name: e.target.value })}
                  placeholder="供应商名称"
                />
              </div>
              <div className="space-y-2">
                <Label>分类</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="商品分类"
                />
              </div>
              <div className="space-y-2">
                <Label>货源链接</Label>
                <Input
                  value={newProduct.source_url}
                  onChange={(e) => setNewProduct({ ...newProduct, source_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewProductOpen(false)}>取消</Button>
              <Button onClick={handleCreateProduct}>创建商品</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 商品详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>商品详情</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">商品ID</Label>
                    <div className="font-mono text-[14px]">{selectedProduct.id}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">SKU</Label>
                    <div className="font-mono text-[14px]">{selectedProduct.internal_sku}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">商品名称</Label>
                  <div className="text-[16px] font-medium">{selectedProduct.name_zh}</div>
                  {selectedProduct.name_en && (
                    <div className="text-[14px] text-muted-foreground">{selectedProduct.name_en}</div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">成本价</Label>
                    <div className="text-[18px] font-semibold">¥{selectedProduct.cost_price}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">总成本</Label>
                    <div className="text-[18px] font-semibold">¥{selectedProduct.total_cost}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">状态</Label>
                    <div>{getStatusBadge(selectedProduct.status)}</div>
                  </div>
                </div>
                
                {selectedProduct.total_orders !== undefined && selectedProduct.total_orders > 0 && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-muted-foreground">总销量</Label>
                      <div className="text-[20px] font-semibold text-success">{selectedProduct.total_sales}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">订单数</Label>
                      <div className="text-[20px] font-semibold">{selectedProduct.total_orders}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">总利润</Label>
                      <div className="text-[20px] font-semibold text-success">¥{selectedProduct.total_profit?.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {selectedProduct.platform_listings && selectedProduct.platform_listings.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">上架平台</Label>
                    <div className="space-y-2 mt-2">
                      {selectedProduct.platform_listings.map((listing: any) => (
                        <div key={listing.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <Badge>{listing.platform}</Badge>
                            <span className="text-[14px]">{listing.region?.toUpperCase()}</span>
                          </div>
                          <Badge variant="outline">{listing.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedProduct as any).inventory && (selectedProduct as any).inventory.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">库存信息</Label>
                    <div className="space-y-2 mt-2">
                      {(selectedProduct as any).inventory.map((inv: any) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{inv.warehouse}</Badge>
                            {inv.location && <span className="text-[12px] text-muted-foreground">{inv.location}</span>}
                          </div>
                          <span className="font-medium">{inv.qty_available} 可用</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 导入对话框 */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>导入商品</DialogTitle>
              <DialogDescription>
                上传 Excel 或 CSV 文件批量导入商品，支持 .xlsx、.xls、.csv 格式，单文件不超过 10MB
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 下载模板 */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">导入模板</p>
                    <p className="text-xs text-muted-foreground">请先下载模板，按格式填写</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  下载模板
                </Button>
              </div>

              {/* 文件上传 */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="import-file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">
                    {importFile ? importFile.name : '点击选择文件或拖拽文件到此处'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 .xlsx、.xls、.csv
                  </p>
                </label>
              </div>

              {/* 预览数据 */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>预览数据（共 {importPreview.length} 条）</Label>
                    <span className="text-xs text-muted-foreground">仅显示前3条</span>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">SKU</th>
                          <th className="px-3 py-2 text-left font-medium">商品名称</th>
                          <th className="px-3 py-2 text-left font-medium">成本价</th>
                          <th className="px-3 py-2 text-left font-medium">类目</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">{item.sku}</td>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2">¥{item.cost}</td>
                            <td className="px-3 py-2">{item.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 导入说明 */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• 请确保文件格式与模板一致</p>
                <p>• 必填字段：商品名称、成本价</p>
                <p>• 导入后将自动去重，已存在的商品会被跳过</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsImportOpen(false);
                setImportFile(null);
                setImportPreview([]);
              }}>
                取消
              </Button>
              <Button onClick={handleImport} disabled={!importFile || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    开始导入
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
