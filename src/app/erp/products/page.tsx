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
} from 'lucide-react';
import { toast } from 'sonner';

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
  compliance_status: string;
  category_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ERPProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<ERPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (statusFilter) params.set('status', statusFilter);
      if (complianceFilter) params.set('compliance_status', complianceFilter);
      
      const response = await fetch(`/api/v1/erp/products?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items || []);
      } else {
        toast.error('获取商品列表失败');
      }
    } catch (error) {
      console.error('获取商品失败:', error);
      toast.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      draft: { label: '草稿', className: 'bg-muted text-muted-foreground' },
      active: { label: '在售', className: 'bg-success/10 text-success' },
      inactive: { label: '下架', className: 'bg-warning/10 text-warning' },
      archived: { label: '归档', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status] || config.draft;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: '待校验', className: 'bg-warning/10 text-warning', icon: Clock },
      passed: { label: '合规通过', className: 'bg-success/10 text-success', icon: CheckCircle },
      failed: { label: '合规失败', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
    };
    const { label, className, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant="outline" className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getImageStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待处理', className: 'bg-muted text-muted-foreground' },
      processing: { label: '处理中', className: 'bg-primary/10 text-primary' },
      done: { label: '已完成', className: 'bg-success/10 text-success' },
      failed: { label: '处理失败', className: 'bg-destructive/10 text-destructive' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Box className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">ERP商品管理</h1>
              <p className="text-[14px] text-muted-foreground">商品库 · 库存管理 · 采购管理 · 成本核算</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              批量导入
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增商品
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Package className="h-3 w-3 mr-1" />
            商品库
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <DollarSign className="h-3 w-3 mr-1" />
            成本核算
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <ImageIcon className="h-3 w-3 mr-1" />
            图片处理
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            合规校验
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">商品总数</div>
              <div className="text-[24px] font-semibold text-foreground">{products.length}</div>
              <div className="text-[11px] text-muted-foreground mt-1">全部商品</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">在售商品</div>
              <div className="text-[24px] font-semibold text-success">
                {products.filter(p => p.status === 'active').length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">正常销售</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">合规通过</div>
              <div className="text-[24px] font-semibold text-success">
                {products.filter(p => p.compliance_status === 'passed').length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">已校验</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">图片已处理</div>
              <div className="text-[24px] font-semibold text-foreground">
                {products.filter(p => p.image_status === 'done').length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">翻译/优化完成</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">待处理</div>
              <div className="text-[24px] font-semibold text-warning">
                {products.filter(p => p.compliance_status === 'pending' || p.image_status === 'pending').length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">需处理商品</div>
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
                  placeholder="搜索SKU、商品名称..."
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
                <option value="draft">草稿</option>
                <option value="active">在售</option>
                <option value="inactive">下架</option>
              </select>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value)}
              >
                <option value="">全部合规状态</option>
                <option value="pending">待校验</option>
                <option value="passed">合规通过</option>
                <option value="failed">合规失败</option>
              </select>
              <Button variant="outline" onClick={fetchProducts}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">商品列表</CardTitle>
            <CardDescription>ERP商品库，支持1688采集、图片智能处理、合规校验</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无商品数据</div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground font-mono">{product.internal_sku}</span>
                            {getStatusBadge(product.status)}
                            {getComplianceBadge(product.compliance_status)}
                            {getImageStatusBadge(product.image_status)}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{product.name_zh}</div>
                          {product.name_en && (
                            <div className="text-[12px] text-muted-foreground">{product.name_en}</div>
                          )}
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>供应商: <span className="text-foreground">{product.supplier_name || '-'}</span></span>
                            <span>分类: <span className="text-foreground">{product.category_name || '-'}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-[20px] font-semibold text-foreground">¥{product.total_cost.toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">总成本</div>
                        <div className="text-[11px] text-muted-foreground">
                          采购 ¥{product.cost_price.toFixed(2)} + 运费 ¥{(product.domestic_shipping + product.first_mile_shipping).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            编辑
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
