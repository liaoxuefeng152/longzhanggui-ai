'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  DollarSign,
  Package,
  ExternalLink,
  Loader2,
  RefreshCw,
  Ban,
  TruckIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/hooks/useAuthFetch';

interface PurchaseOrder {
  id: string;
  po_number: string;
  product_id?: string;
  product_name?: string;
  sku?: string;
  supplier_name?: string;
  supplier_url?: string;
  supplier_contact?: string;
  qty: number;
  received_qty?: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  expected_arrival?: string;
  created_at: string;
  notes?: string;
}

interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  products_count: number;
  rating: number;
}

export default function ERPPurchasePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // 创建采购单表单
  const [createForm, setCreateForm] = useState({
    product_name: '',
    sku: '',
    qty: '',
    unit_price: '',
    supplier_name: '',
    supplier_url: '',
    supplier_contact: '',
    expected_arrival: '',
    notes: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/v1/erp/purchases?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      // 兼容多种返回格式
      let rawOrders: any[] = [];

      if (data.purchases !== undefined) {
        // 新格式：{ purchases: [...], total: N }
        rawOrders = data.purchases || [];
      } else if (data.items !== undefined) {
        // 旧格式：{ items: [...], suppliers: [...] }
        rawOrders = data.items || [];
        setSuppliers(data.suppliers || []);
      } else if (data.success && data.data) {
        // 另一种格式：{ success: true, data: { items: [...], suppliers: [...] } }
        rawOrders = data.data.items || [];
        setSuppliers(data.data.suppliers || []);
      } else if (Array.isArray(data)) {
        // 直接是数组格式
        rawOrders = data;
      }

      // 转换数据格式：将后端的嵌套结构转换为前端的扁平结构
      const formattedOrders: PurchaseOrder[] = rawOrders.map((order: any) => {
        // 如果已经有扁平结构（兼容旧数据），直接返回
        if (order.po_number || order.product_name) {
          return order as PurchaseOrder;
        }

        // 否则从 products 数组中提取第一个商品的信息
        const firstProduct = order.products && order.products.length > 0 ? order.products[0] : {};
        return {
          id: order.id,
          po_number: order.order_no || order.id,
          product_id: firstProduct.product_id,
          product_name: firstProduct.product_name || (order.products?.length > 0 ? `${order.products.length}个商品` : '未知商品'),
          sku: firstProduct.sku,
          supplier_name: order.supplier_name,
          supplier_url: order.supplier_url,
          supplier_contact: order.supplier_contact,
          qty: firstProduct.quantity || 0,
          received_qty: firstProduct.received_qty,
          unit_price: firstProduct.unit_price || 0,
          total_amount: order.total_amount || 0,
          status: order.status,
          expected_arrival: order.expected_delivery || order.expected_arrival,
          created_at: order.created_at,
          notes: order.notes,
        };
      });

      setOrders(formattedOrders);

    } catch (error) {
      console.error('获取采购单失败:', error);
      toast.error('获取采购单失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建采购单
  const handleCreateOrder = async () => {
    // 前端验证：检查必填字段
    if (!createForm.product_name || !createForm.qty || !createForm.unit_price || !createForm.supplier_name) {
      toast.error('请填写完整的采购信息（商品名称、数量、单价、供应商）');
      return;
    }

    setIsProcessing('create');
    try {
      // 构建符合后端API格式的数据
      const response = await fetch('/api/v1/erp/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: 'SUP-001', // 临时使用默认供应商ID，实际应该从供应商选择
          supplier_name: createForm.supplier_name,
          products: [{
            product_id: createForm.sku || `PROD-${Date.now()}`,
            product_name: createForm.product_name,
            sku: createForm.sku || '',
            quantity: parseInt(createForm.qty),
            unit_price: parseFloat(createForm.unit_price),
            total_price: parseInt(createForm.qty) * parseFloat(createForm.unit_price),
          }],
          currency: 'CNY',
          notes: createForm.notes,
          expected_delivery: createForm.expected_arrival || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('采购单创建成功', { description: `采购单号: ${data.data.id}` });
        setIsCreateOpen(false);
        setCreateForm({
          product_name: '',
          sku: '',
          qty: '',
          unit_price: '',
          supplier_name: '',
          supplier_url: '',
          supplier_contact: '',
          expected_arrival: '',
          notes: '',
        });
        fetchData();
      } else {
        toast.error(data.error || '创建失败');
      }
    } catch (error) {
      toast.error('创建失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 确认采购单
  const handleConfirmOrder = async (order: PurchaseOrder) => {
    setIsProcessing(order.id);
    try {
      const response = await fetch(`/api/v1/erp/purchases/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('采购单已确认');
        fetchData();
      } else {
        toast.error(data.error || '确认失败');
      }
    } catch (error) {
      toast.error('确认失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 标记发货
  const handleMarkShipped = async (order: PurchaseOrder) => {
    setIsProcessing(order.id);
    try {
      const response = await fetch(`/api/v1/erp/purchases/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('已标记为发货中');
        fetchData();
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 确认入库
  const handleReceiveOrder = async (order: PurchaseOrder) => {
    setIsProcessing(order.id);
    try {
      const response = await fetch(`/api/v1/erp/purchases/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'received',
          received_qty: order.qty,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('入库成功', { description: `已入库 ${order.qty} 件` });
        fetchData();
      } else {
        toast.error(data.error || '入库失败');
      }
    } catch (error) {
      toast.error('入库失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 取消采购单
  const handleCancelOrder = async (order: PurchaseOrder) => {
    if (!confirm(`确定要取消采购单 ${order.po_number} 吗？`)) return;

    setIsProcessing(order.id);
    try {
      const response = await fetch(`/api/v1/erp/purchases/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('采购单已取消');
        fetchData();
      } else {
        toast.error(data.error || '取消失败');
      }
    } catch (error) {
      toast.error('取消失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 查看详情
  const handleViewDetail = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // 导出
  const handleExport = async () => {
    setIsProcessing('export');
    try {
      const headers = ['采购单号', '商品名称', 'SKU', '供应商', '数量', '单价', '总额', '状态', '预计到货', '创建时间'];
      const rows = orders.map(o => [
        o.po_number,
        o.product_name,
        o.sku,
        o.supplier_name,
        o.qty,
        o.unit_price,
        o.total_amount,
        o.status,
        o.expected_arrival || '-',
        o.created_at,
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase_orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待确认', className: 'bg-warning/10 text-warning' },
      confirmed: { label: '已确认', className: 'bg-primary/10 text-primary' },
      shipped: { label: '发货中', className: 'bg-blue-500/10 text-blue-500' },
      received: { label: '已入库', className: 'bg-success/10 text-success' },
      cancelled: { label: '已取消', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 统计数据
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const inTransitOrders = orders.filter(o => o.status === 'shipped').length;
  const totalAmount = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0);

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">ERP采购管理</h1>
              <p className="text-[14px] text-muted-foreground">采购申请 · 供应商管理 · 入库确认 · 成本核算</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isProcessing === 'export'}>
              {isProcessing === 'export' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              导出
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新建采购
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <ShoppingCart className="h-3 w-3 mr-1" />
            采购申请
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Truck className="h-3 w-3 mr-1" />
            物流追踪
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Package className="h-3 w-3 mr-1" />
            入库管理
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <DollarSign className="h-3 w-3 mr-1" />
            成本核算
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">采购单数</div>
              <div className="text-[24px] font-semibold text-foreground">{totalOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">全部采购</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">待确认</div>
              <div className="text-[24px] font-semibold text-warning">{pendingOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">需处理</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">运输中</div>
              <div className="text-[24px] font-semibold text-blue-500">{inTransitOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">待入库</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">采购金额</div>
              <div className="text-[24px] font-semibold text-foreground">${totalAmount.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">总金额</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">供应商</div>
              <div className="text-[24px] font-semibold text-foreground">{suppliers.length}</div>
              <div className="text-[11px] text-muted-foreground mt-1">合作供应商</div>
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
                  placeholder="搜索采购单号、商品名称..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                />
              </div>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
                <option value="shipped">发货中</option>
                <option value="received">已入库</option>
                <option value="cancelled">已取消</option>
              </select>
              <Button variant="outline" onClick={fetchData}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 采购单列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">采购单列表</CardTitle>
            <CardDescription>管理采购流程，从申请到入库</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无采购单数据</div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground font-mono">{order.po_number}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{order.product_name || '未知商品'}</div>
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>SKU: <span className="text-foreground">{order.sku || '-'}</span></span>
                            <span>供应商: <span className="text-foreground">{order.supplier_name || '-'}</span></span>
                            <span>预计到货: <span className="text-foreground">{order.expected_arrival || '-'}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-[20px] font-semibold text-foreground">${order.total_amount.toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">{order.qty}件 × ${order.unit_price.toFixed(2)}</div>
                        <div className="flex items-center justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetail(order)}>
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleConfirmOrder(order)}
                                disabled={isProcessing === order.id}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                确认
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => handleCancelOrder(order)}
                                disabled={isProcessing === order.id}
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                取消
                              </Button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkShipped(order)}
                              disabled={isProcessing === order.id}
                            >
                              <TruckIcon className="h-3 w-3 mr-1" />
                              发货
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button 
                              size="sm"
                              onClick={() => handleReceiveOrder(order)}
                              disabled={isProcessing === order.id}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              入库
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 创建采购单对话框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>新建采购单</DialogTitle>
              <DialogDescription>创建新的采购申请</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">商品名称 *</label>
                  <Input
                    placeholder="请输入商品名称"
                    value={createForm.product_name}
                    onChange={(e) => setCreateForm({ ...createForm, product_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">SKU</label>
                  <Input
                    placeholder="请输入SKU"
                    value={createForm.sku}
                    onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">采购数量 *</label>
                  <Input
                    type="number"
                    placeholder="请输入数量"
                    value={createForm.qty}
                    onChange={(e) => setCreateForm({ ...createForm, qty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">单价 ($) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="请输入单价"
                    value={createForm.unit_price}
                    onChange={(e) => setCreateForm({ ...createForm, unit_price: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">供应商名称</label>
                  <Input
                    placeholder="请输入供应商"
                    value={createForm.supplier_name}
                    onChange={(e) => setCreateForm({ ...createForm, supplier_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">供应商联系方式</label>
                  <Input
                    placeholder="联系人/电话"
                    value={createForm.supplier_contact}
                    onChange={(e) => setCreateForm({ ...createForm, supplier_contact: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">供应商链接</label>
                  <Input
                    placeholder="https://..."
                    value={createForm.supplier_url}
                    onChange={(e) => setCreateForm({ ...createForm, supplier_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">预计到货日期</label>
                  <Input
                    type="date"
                    value={createForm.expected_arrival}
                    onChange={(e) => setCreateForm({ ...createForm, expected_arrival: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">备注</label>
                <Input
                  placeholder="备注信息"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                />
              </div>
              {createForm.qty && createForm.unit_price && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">采购总额</span>
                    <span className="text-[20px] font-semibold text-foreground">
                      ${(parseInt(createForm.qty) * parseFloat(createForm.unit_price || '0')).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreateOrder} disabled={isProcessing === 'create'}>
                {isProcessing === 'create' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                创建采购单
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 采购单详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>采购单详情</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">采购单号</div>
                    <div className="font-mono text-[14px]">{selectedOrder.po_number}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">状态</div>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">商品名称</div>
                  <div className="text-[14px] font-medium">{selectedOrder.product_name}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">数量</div>
                    <div className="text-[16px] font-semibold">{selectedOrder.qty}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">单价</div>
                    <div className="text-[16px] font-semibold">${selectedOrder.unit_price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">总额</div>
                    <div className="text-[16px] font-semibold text-success">${selectedOrder.total_amount.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">供应商</div>
                    <div className="text-[14px]">{selectedOrder.supplier_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">联系方式</div>
                    <div className="text-[14px]">{selectedOrder.supplier_contact || '-'}</div>
                  </div>
                </div>
                {selectedOrder.supplier_url && (
                  <div>
                    <div className="text-[12px] text-muted-foreground">供应商链接</div>
                    <a href={selectedOrder.supplier_url} target="_blank" rel="noopener noreferrer" className="text-[14px] text-primary hover:underline flex items-center gap-1">
                      {selectedOrder.supplier_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">预计到货</div>
                    <div className="text-[14px]">{selectedOrder.expected_arrival || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">创建时间</div>
                    <div className="text-[14px]">{selectedOrder.created_at}</div>
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <div className="text-[12px] text-muted-foreground">备注</div>
                    <div className="text-[14px]">{selectedOrder.notes}</div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
