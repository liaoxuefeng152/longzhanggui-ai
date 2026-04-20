'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Save,
  X,
  Copy,
  ExternalLink,
  Truck,
  Store,
  Package2,
  Ruler,
  Weight,
  ShoppingCart,
  PlusCircle,
  Trash,
  Star,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductImage {
  id: string;
  original_url: string;
  processed_url?: string;
  type: string;
}

interface ProductListing {
  id: string;
  platform: string;
  shop_id: string;
  shop_name?: string;
  status: string;
  listing_title?: string;
  listing_title_en?: string;
  listing_description?: string;
  bullet_points?: string[];
  keywords?: string[];
  sale_price?: number;
  currency?: string;
  listing_url?: string;
}

interface ProductPricing {
  suggested_price: number;
  target_price: number;
  profit_margin: number;
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
  platform_listings?: ProductListing[];
  images?: ProductImage[];
  listing?: {
    title?: string;
    title_en?: string;
    description?: string;
    bullet_points?: string[];
    keywords?: string[];
  };
  pricing?: ProductPricing;
  weight_kg?: number;
  dimensions?: ProductDimensions;
  packaging_list?: string[];
  brand?: string;
  color?: string;
  size?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 编辑表单数据
  const [editForm, setEditForm] = useState<any>({});
  
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

  const handleViewDetail = (productId: string) => {
    // 跳转到新的详情页面
    router.push(`/erp/products/${productId}`);
  };

  // 保存商品编辑
  const handleSaveEdit = async () => {
    if (!selectedProduct) return;
    
    setIsSaving(true);
    try {
      const { default: store } = await import('@/lib/store');
      
      // 计算总成本
      const costPrice = parseFloat(editForm.cost_price) || 0;
      const domesticShipping = parseFloat(editForm.domestic_shipping) || 0;
      const firstMileShipping = parseFloat(editForm.first_mile_shipping) || 0;
      const totalCost = costPrice + domesticShipping + firstMileShipping;
      
      // 解析包装清单
      const packagingList = editForm.packaging_list 
        ? editForm.packaging_list.split('\n').filter((p: string) => p.trim())
        : [];
      
      // 解析尺寸
      const dimensions = {
        length: parseFloat(editForm.dimensions_length) || 0,
        width: parseFloat(editForm.dimensions_width) || 0,
        height: parseFloat(editForm.dimensions_height) || 0,
      };
      
      store.updateProduct(selectedProduct.id, {
        name_zh: editForm.name_zh,
        name_en: editForm.name_en,
        internal_sku: editForm.internal_sku,
        category: editForm.category,
        supplier_name: editForm.supplier_name,
        source_url: editForm.source_url,
        cost_price: costPrice,
        domestic_shipping: domesticShipping,
        first_mile_shipping: firstMileShipping,
        total_cost: totalCost,
        weight_kg: parseFloat(editForm.weight_kg) || 0,
        dimensions: dimensions,
        packaging_list: packagingList,
        brand: editForm.brand,
        color: editForm.color,
        size: editForm.size,
        listing: {
          title: editForm.listing_title,
          title_en: editForm.listing_title_en,
          description: editForm.listing_description,
          bullet_points: editForm.bullet_points ? editForm.bullet_points.split('\n').filter((p: string) => p.trim()) : [],
          keywords: editForm.keywords ? editForm.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k) : [],
        },
      });
      
      // 刷新列表
      fetchProducts();
      
      // 重新加载详情
      const updated = store.getProduct(selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated as any);
      }
      
      setIsEditing(false);
      toast.success('商品信息已保存');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 认领到店铺
  const handleClaimToShop = async (shopId: string, platform: string) => {
    if (!selectedProduct) return;
    
    try {
      const { default: store } = await import('@/lib/store');
      const product = store.getProduct(selectedProduct.id);
      
      if (!product) return;
      
      const newListing = {
        id: `PL-${Date.now()}`,
        platform: platform as 'tiktok' | 'amazon' | 'shopee',
        shop_id: shopId,
        shop_name: '店铺-' + shopId,
        status: 'pending' as const,
        listing_title: product.listing?.title || product.name_zh,
        listing_description: product.listing?.description || '',
        bullet_points: product.listing?.bullet_points || [],
        keywords: product.listing?.keywords || [],
      };
      
      const updatedListings = [...(product.platform_listings || []), newListing];
      
      store.updateProduct(selectedProduct.id, {
        platform_listings: updatedListings,
      });
      
      // 刷新详情
      const updated = store.getProduct(selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated as any);
      }
      
      fetchProducts();
      toast.success('已认领到店铺');
    } catch (error) {
      console.error('认领失败:', error);
      toast.error('认领失败');
    }
  };

  // 删除店铺关联
  const handleRemoveShopListing = async (listingId: string) => {
    if (!selectedProduct) return;
    
    try {
      const { default: store } = await import('@/lib/store');
      const product = store.getProduct(selectedProduct.id);
      
      if (!product) return;
      
      const updatedListings = (product.platform_listings || []).filter(l => l.id !== listingId);
      
      store.updateProduct(selectedProduct.id, {
        platform_listings: updatedListings,
      });
      
      // 刷新详情
      const updated = store.getProduct(selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated as any);
      }
      
      fetchProducts();
      toast.success('已移除店铺关联');
    } catch (error) {
      console.error('移除失败:', error);
      toast.error('移除失败');
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
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/5 flex items-center justify-center">
              <Package className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">商品中心</h1>
              <p className="text-[14px] text-muted-foreground">选品入库 · 图片处理 · Listing优化 · 上架发布</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              导入
            </Button>
            <Button 
              onClick={() => router.push('/agents/product-selection')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Search className="h-4 w-4 mr-2" />
              AI选品
            </Button>
            <Button 
              onClick={() => setIsNewProductOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              新增商品
            </Button>
          </div>
        </div>

        {/* 统计概览 - 工作台风格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">商品总数</p>
                  <p className="text-[20px] font-semibold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">已选品</p>
                  <p className="text-[20px] font-semibold text-purple-600">{products.filter(p => p.status === 'selected').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">处理中</p>
                  <p className="text-[20px] font-semibold text-amber-600">{products.filter(p => p.status === 'processing').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">待上架</p>
                  <p className="text-[20px] font-semibold text-orange-600">{products.filter(p => p.status === 'ready').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">已上架</p>
                  <p className="text-[20px] font-semibold text-green-600">{products.filter(p => p.status === 'published').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总成本</p>
                  <p className="text-[20px] font-semibold">¥{products.reduce((sum, p) => sum + (p.total_cost || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 - 工作台风格 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
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
                className="px-4 py-2 border border-border rounded-lg text-[14px] bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="selected">已选品</option>
                <option value="processing">处理中</option>
                <option value="ready">待上架</option>
                <option value="published">已上架</option>
              </select>
              <Button variant="outline" onClick={fetchProducts} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">快速筛选：</span>
              <Button variant="secondary" size="sm" onClick={() => setStatusFilter('selected')}>已选品</Button>
              <Button variant="secondary" size="sm" onClick={() => setStatusFilter('processing')}>处理中</Button>
              <Button variant="secondary" size="sm" onClick={() => setStatusFilter('ready')}>待上架</Button>
              <Button variant="secondary" size="sm" onClick={() => setStatusFilter('published')}>已上架</Button>
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter('')}>全部</Button>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[16px] flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  商品列表
                </CardTitle>
                <CardDescription className="text-[13px]">商品全生命周期管理：选品 → 处理 → 上架 → 销售</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                共 {products.length} 个商品
              </Badge>
            </div>
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
                            <>
                              {product.source_url && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={async () => {
                                    // 采集详情
                                    setIsProcessing(product.id);
                                    try {
                                      const response = await fetch('/api/v1/tools/scrape', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ url: product.source_url }),
                                      });
                                      const data = await response.json();
                                      if (data.success && data.data) {
                                        // 更新商品信息
                                        const { default: store } = await import('@/lib/store');
                                        store.updateProduct(product.id, {
                                          name_zh: data.data.title || product.name_zh,
                                          cost_price: data.data.price || product.cost_price,
                                          total_cost: data.data.price || product.total_cost,
                                          supplier_name: data.data.shop_name || product.supplier_name,
                                        });
                                        toast.success('采集成功！');
                                        fetchProducts();
                                      } else {
                                        toast.error(data.error || '采集失败');
                                      }
                                    } catch (error) {
                                      toast.error('采集失败');
                                    } finally {
                                      setIsProcessing(null);
                                    }
                                  }}
                                  disabled={isProcessing === product.id}
                                >
                                  {isProcessing === product.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                  )}
                                  采集详情
                                </Button>
                              )}
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
                            </>
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
        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setIsEditing(false);
        }}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Package2 className="h-5 w-5" />
                  商品详情
                  {selectedProduct && (
                    <Badge variant="outline" className="ml-2">{getStatusBadge(selectedProduct.status)}</Badge>
                  )}
                </DialogTitle>
                {selectedProduct && (
                  <DialogDescription className="font-mono text-[12px] mt-1">
                    ID: {selectedProduct.id} | SKU: {selectedProduct.internal_sku}
                  </DialogDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      取消
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      保存
                    </Button>
                  </>
                )}
              </div>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="mt-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="basic">基本信息</TabsTrigger>
                    <TabsTrigger value="images">图片</TabsTrigger>
                    <TabsTrigger value="listing">Listing</TabsTrigger>
                    <TabsTrigger value="pricing">成本定价</TabsTrigger>
                    <TabsTrigger value="specs">规格包装</TabsTrigger>
                    <TabsTrigger value="shops">店铺</TabsTrigger>
                  </TabsList>

                  {/* 基本信息Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">商品名称（中文）</Label>
                        {isEditing ? (
                          <Input 
                            value={editForm.name_zh} 
                            onChange={(e) => setEditForm({ ...editForm, name_zh: e.target.value })}
                          />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[14px] font-medium">{selectedProduct.name_zh}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">商品名称（英文）</Label>
                        {isEditing ? (
                          <Input 
                            value={editForm.name_en} 
                            onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                          />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded text-[14px]">{selectedProduct.name_en || '-'}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">SKU编码</Label>
                        {isEditing ? (
                          <Input 
                            value={editForm.internal_sku} 
                            onChange={(e) => setEditForm({ ...editForm, internal_sku: e.target.value })}
                          />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded font-mono">{selectedProduct.internal_sku}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">商品类目</Label>
                        {isEditing ? (
                          <Input 
                            value={editForm.category} 
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            placeholder="请输入类目"
                          />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded">{selectedProduct.category || '-'}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-[12px]">供应商信息</Label>
                      <div className="p-3 bg-muted/30 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-[13px]">{selectedProduct.supplier_name || '-'}</span>
                        </div>
                        {isEditing ? (
                          <Input 
                            value={editForm.source_url} 
                            onChange={(e) => setEditForm({ ...editForm, source_url: e.target.value })}
                            placeholder="货源链接"
                            className="mt-2"
                          />
                        ) : selectedProduct.source_url ? (
                          <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => window.open(selectedProduct.source_url, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            查看1688链接
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* 销售统计 */}
                    {(selectedProduct.total_orders ?? 0) > 0 && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-[14px] font-medium">销售统计</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-[12px] text-muted-foreground">总销量</div>
                            <div className="text-[20px] font-semibold text-success">{selectedProduct.total_sales || 0}</div>
                          </div>
                          <div>
                            <div className="text-[12px] text-muted-foreground">订单数</div>
                            <div className="text-[20px] font-semibold">{selectedProduct.total_orders || 0}</div>
                          </div>
                          <div>
                            <div className="text-[12px] text-muted-foreground">总利润</div>
                            <div className="text-[20px] font-semibold text-success">¥{(selectedProduct.total_profit || 0).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* 图片Tab */}
                  <TabsContent value="images" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[14px] font-medium">商品图片</h3>
                        <p className="text-[12px] text-muted-foreground">建议尺寸: 800x800px，支持JPG/PNG格式</p>
                      </div>
                      <Button size="sm" variant="outline" disabled>
                        <Plus className="h-4 w-4 mr-1" />
                        上传图片
                      </Button>
                    </div>
                    
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <div className="grid grid-cols-4 gap-3">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={img.id} className="relative group">
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                              <img src={img.processed_url || img.original_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-2 left-2">
                              <Badge variant={img.type === 'main' ? 'default' : 'secondary'} className="text-[10px]">
                                {img.type === 'main' ? '主图' : img.type}
                              </Badge>
                            </div>
                            {isEditing && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="destructive" size="sm" className="h-6 w-6 p-0">
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-[14px]">暂无图片</p>
                        <p className="text-[12px]">点击"处理图片"自动生成商品图片</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" disabled>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        AI生成主图
                      </Button>
                      <Button variant="outline" className="flex-1" disabled>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        批量白底图
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Listing编辑Tab */}
                  <TabsContent value="listing" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">英文标题 (Title)</Label>
                        {isEditing ? (
                          <Input 
                            value={editForm.listing_title} 
                            onChange={(e) => setEditForm({ ...editForm, listing_title: e.target.value })}
                            placeholder="输入英文标题，建议60-100字符"
                          />
                        ) : (
                          <div className="p-3 bg-muted/30 rounded text-[13px]">
                            {selectedProduct.listing?.title || selectedProduct.name_en || '-'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">五点描述 (Bullet Points)</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editForm.bullet_points} 
                            onChange={(e) => setEditForm({ ...editForm, bullet_points: e.target.value })}
                            placeholder="每行一个卖点"
                            rows={5}
                            className="text-[13px]"
                          />
                        ) : (
                          <div className="p-3 bg-muted/30 rounded space-y-2">
                            {selectedProduct.listing?.bullet_points && selectedProduct.listing.bullet_points.length > 0 ? (
                              selectedProduct.listing.bullet_points.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-[13px]">
                                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                  <span>{point}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground">暂无五点描述</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">商品描述 (Description)</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editForm.listing_description} 
                            onChange={(e) => setEditForm({ ...editForm, listing_description: e.target.value })}
                            placeholder="输入详细描述"
                            rows={6}
                            className="text-[13px]"
                          />
                        ) : (
                          <div className="p-3 bg-muted/30 rounded text-[13px] max-h-40 overflow-y-auto">
                            {selectedProduct.listing?.description || '-'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">关键词 (Search Terms)</Label>
                        {isEditing ? (
                          <Input 
                            value={editForm.keywords} 
                            onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                            placeholder="关键词，用逗号分隔"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.listing?.keywords && selectedProduct.listing.keywords.length > 0 ? (
                              selectedProduct.listing.keywords.map((kw, idx) => (
                                <Badge key={idx} variant="outline">{kw}</Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">暂无关键词</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" disabled>
                          <Star className="h-4 w-4 mr-2" />
                          AI优化标题
                        </Button>
                        <Button variant="outline" className="flex-1" disabled>
                          <FileText className="h-4 w-4 mr-2" />
                          AI生成描述
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* 成本定价Tab */}
                  <TabsContent value="pricing" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">采购成本</Label>
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={editForm.cost_price} 
                            onChange={(e) => setEditForm({ ...editForm, cost_price: e.target.value })}
                          />
                        ) : (
                          <div className="p-3 bg-muted/30 rounded">
                            <span className="text-[18px] font-semibold">¥{selectedProduct.cost_price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">国内运费</Label>
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={editForm.domestic_shipping} 
                            onChange={(e) => setEditForm({ ...editForm, domestic_shipping: e.target.value })}
                          />
                        ) : (
                          <div className="p-3 bg-muted/30 rounded">
                            <span className="text-[18px] font-semibold">¥{selectedProduct.domestic_shipping.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">头程运费</Label>
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={editForm.first_mile_shipping} 
                            onChange={(e) => setEditForm({ ...editForm, first_mile_shipping: e.target.value })}
                          />
                        ) : (
                          <div className="p-3 bg-muted/30 rounded">
                            <span className="text-[18px] font-semibold">¥{selectedProduct.first_mile_shipping.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary text-[12px]">总成本</Label>
                        <div className="p-3 bg-primary/10 rounded">
                          <span className="text-[20px] font-semibold text-primary">¥{selectedProduct.total_cost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 智能定价建议 */}
                    {selectedProduct.pricing && (
                      <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-[14px] font-medium">智能定价建议</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-[13px]">
                          <div>
                            <span className="text-muted-foreground">建议售价:</span>
                            <span className="ml-2 font-semibold">${selectedProduct.pricing.suggested_price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">目标价:</span>
                            <span className="ml-2 font-semibold">${selectedProduct.pricing.target_price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">利润率:</span>
                            <span className="ml-2 font-semibold text-success">{selectedProduct.pricing.profit_margin.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 店铺定价 */}
                    {selectedProduct.platform_listings && selectedProduct.platform_listings.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-muted-foreground text-[12px]">店铺定价</Label>
                        {selectedProduct.platform_listings.map(listing => (
                          <div key={listing.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">{listing.platform}</Badge>
                              <span className="text-[13px]">{listing.shop_name || '-'}</span>
                            </div>
                            <div className="text-[14px] font-semibold">
                              {listing.sale_price ? `$${listing.sale_price.toFixed(2)}` : '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* 规格包装Tab */}
                  <TabsContent value="specs" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">产品重量 (kg)</Label>
                        {isEditing ? (
                          <Input 
                            type="number"
                            step="0.01"
                            value={editForm.weight_kg} 
                            onChange={(e) => setEditForm({ ...editForm, weight_kg: e.target.value })}
                          />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded flex items-center gap-2">
                            <Weight className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProduct.weight_kg || 0} kg</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">品牌</Label>
                        {isEditing ? (
                          <Input 
                            value={editForm.brand} 
                            onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                            placeholder="品牌名"
                          />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded">
                            <span>{selectedProduct.brand || '-'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-[12px]">产品尺寸 (cm)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {isEditing ? (
                          <>
                            <Input type="number" placeholder="长" value={editForm.dimensions_length} onChange={(e) => setEditForm({ ...editForm, dimensions_length: e.target.value })} />
                            <Input type="number" placeholder="宽" value={editForm.dimensions_width} onChange={(e) => setEditForm({ ...editForm, dimensions_width: e.target.value })} />
                            <Input type="number" placeholder="高" value={editForm.dimensions_height} onChange={(e) => setEditForm({ ...editForm, dimensions_height: e.target.value })} />
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-muted/30 rounded flex items-center gap-2">
                              <Ruler className="h-4 w-4 text-muted-foreground" />
                              <span>{(selectedProduct as any).dimensions?.length || 0} cm</span>
                            </div>
                            <div className="p-2 bg-muted/30 rounded flex items-center gap-2">
                              <span>{(selectedProduct as any).dimensions?.width || 0} cm</span>
                            </div>
                            <div className="p-2 bg-muted/30 rounded flex items-center gap-2">
                              <span>{(selectedProduct as any).dimensions?.height || 0} cm</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-[12px]">包装清单</Label>
                      {isEditing ? (
                        <Textarea 
                          value={editForm.packaging_list} 
                          onChange={(e) => setEditForm({ ...editForm, packaging_list: e.target.value })}
                          placeholder="每行一个物品"
                          rows={4}
                          className="text-[13px]"
                        />
                      ) : (
                        <div className="p-3 bg-muted/30 rounded">
                          {selectedProduct.packaging_list && selectedProduct.packaging_list.length > 0 ? (
                            <ul className="list-disc list-inside text-[13px] space-y-1">
                              {selectedProduct.packaging_list.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground">暂无包装信息</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">颜色</Label>
                        {isEditing ? (
                          <Input value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded">{selectedProduct.color || '-'}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-[12px]">尺寸</Label>
                        {isEditing ? (
                          <Input value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} />
                        ) : (
                          <div className="p-2 bg-muted/30 rounded">{selectedProduct.size || '-'}</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* 店铺关联Tab */}
                  <TabsContent value="shops" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[14px] font-medium">认领到店铺</h3>
                        <p className="text-[12px] text-muted-foreground">将商品关联到店铺后，可以设置平台专属的标题、描述和定价</p>
                      </div>
                    </div>

                    {/* 已关联的店铺 */}
                    {selectedProduct.platform_listings && selectedProduct.platform_listings.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProduct.platform_listings.map(listing => (
                          <div key={listing.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-primary" />
                                <Badge variant="outline" className="capitalize">{listing.platform}</Badge>
                                <span className="text-[14px] font-medium">{listing.shop_name || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  listing.status === 'active' ? 'bg-success text-white' :
                                  listing.status === 'listed' ? 'bg-blue-500/10 text-blue-500' :
                                  'bg-muted text-muted-foreground'
                                }>
                                  {listing.status === 'active' ? '在售' :
                                   listing.status === 'listed' ? '已上架' :
                                   listing.status === 'pending' ? '待上架' : listing.status}
                                </Badge>
                                {isEditing && (
                                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveShopListing(listing.id)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {listing.listing_url && (
                              <Button variant="ghost" size="sm" onClick={() => window.open(listing.listing_url, '_blank')}>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                查看链接
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <Store className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                        <p className="text-muted-foreground">尚未认领到任何店铺</p>
                        <p className="text-[12px] text-muted-foreground mt-1">点击下方按钮认领到店铺</p>
                      </div>
                    )}

                    {/* 认领按钮 */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" onClick={() => handleClaimToShop('tiktok-id', 'tiktok')}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        TikTok Shop
                      </Button>
                      <Button variant="outline" onClick={() => handleClaimToShop('amazon-id', 'amazon')}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Amazon
                      </Button>
                      <Button variant="outline" onClick={() => handleClaimToShop('shopee-id', 'shopee')}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Shopee
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
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
