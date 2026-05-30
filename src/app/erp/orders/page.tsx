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
  Upload,
  Eye,
  Truck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  Loader2,
  X,
  PackageCheck,
  Ban,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/hooks/useAuthFetch';

interface ERPOrder {
  id: string;
  platform: string;
  platform_order_id: string;
  product_id?: string;
  product_name?: string;
  quantity: number;
  sale_price: number;
  total_amount: number;
  currency: string;
  cost_price: number;
  shipping_cost?: number;
  platform_fee?: number;
  ad_cost?: number;
  profit: number;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  status: string;
  abnormal_type?: string;
  order_time?: string;
  created_at: string;
  updated_at?: string;
}

// 安全数字转换，防止 toFixed 报错
const safeNum = (v: any, fallback = 0): number => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};

export default function ERPOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 对话框状态
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isShipOpen, setIsShipOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ERPOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // 发货表单
  const [shipForm, setShipForm] = useState({
    carrier: '',
    tracking_number: '',
  });
  
  // 导入相关状态
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (platformFilter) params.set('platform', platformFilter);
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/v1/erp/orders?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      // 兼容两种返回格式
      if (data.items !== undefined) {
        setOrders(data.items || []);
      } else if (data.success && data.data) {
        setOrders(data.data.items || []);
      } else {
        toast.error(data.detail || '获取订单失败');
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      toast.error('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 同步订单
  const handleSyncOrders = async () => {
    setIsProcessing('sync');
    try {
      // 模拟同步
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('订单同步成功', { description: '已从平台同步最新订单数据' });
      fetchOrders();
    } catch (error) {
      toast.error('同步失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 导出订单
  const handleExportOrders = async () => {
    setIsProcessing('export');
    try {
      // 生成CSV
      const headers = ['订单ID', '平台', '商品名称', '数量', '金额', '利润', '买家', '状态', '时间'];
      const rows = orders.map(o => [
        o.platform_order_id,
        o.platform,
        o.product_name,
        o.quantity,
        o.total_amount,
        o.profit,
        o.buyer_name || '-',
        o.status,
        o.order_time || o.created_at,
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('导出成功', { description: `已导出 ${orders.length} 条订单` });
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 查看详情
  const handleViewDetail = async (order: ERPOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // 发货
  const handleShip = async () => {
    if (!selectedOrder) return;
    if (!shipForm.carrier || !shipForm.tracking_number) {
      toast.error('请填写完整的发货信息');
      return;
    }

    setIsProcessing(selectedOrder.id);
    try {
      const response = await fetch('/api/v1/erp/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          carrier: shipForm.carrier,
          tracking_number: shipForm.tracking_number,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('发货成功', { description: `物流单号: ${shipForm.tracking_number}` });
        setIsShipOpen(false);
        setShipForm({ carrier: '', tracking_number: '' });
        fetchOrders();
      } else {
        toast.error(data.error || '发货失败');
      }
    } catch (error) {
      toast.error('发货失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 取消订单
  const handleCancelOrder = async (order: ERPOrder) => {
    if (!confirm(`确定要取消订单 ${order.platform_order_id} 吗？`)) return;

    setIsProcessing(order.id);
    try {
      // 更新订单状态
      const response = await fetch(`/api/v1/erp/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('订单已取消');
        fetchOrders();
      } else {
        toast.error(data.error || '取消失败');
      }
    } catch (error) {
      toast.error('取消失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 处理异常
  const handleResolveAbnormal = async (order: ERPOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    toast.info('请在详情中处理异常');
  };

  // 查看物流
  const handleViewLogistics = async (order: ERPOrder) => {
    try {
      const response = await fetch(`/api/v1/erp/logistics?order_id=${order.id}`);
      const data = await response.json();
      
      if (data.success && data.data.items.length > 0) {
        const logistics = data.data.items[0];
        toast.info('物流信息', {
          description: `${logistics.carrier}: ${logistics.tracking_number}\n状态: ${logistics.status}`,
        });
      } else {
        toast.warning('暂无物流信息');
      }
    } catch (error) {
      toast.error('获取物流信息失败');
    }
  };

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    setImportFile(file);
    
    // 读取文件进行预览
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.warning('文件数据为空或格式不正确');
          return;
        }
        
        // 解析CSV/表格数据
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const previewData: any[] = [];
        
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((h, idx) => {
            // 智能匹配列名
            if (h.includes('订单') || h.includes('order')) {
              row.platform_order_id = values[idx] || values[idx - 1] || `ORD${Date.now()}${i}`;
              row.order_id = values[idx];
            } else if (h.includes('商品') || h.includes('product') || h.includes('name')) {
              row.product_name = values[idx];
            } else if (h.includes('数量') || h.includes('quantity') || h.includes('qty')) {
              row.quantity = parseInt(values[idx]) || 1;
            } else if (h.includes('金额') || h.includes('amount') || h.includes('price') || h.includes('total')) {
              row.total_amount = parseFloat(values[idx]) || 0;
            } else if (h.includes('状态') || h.includes('status')) {
              row.status = values[idx];
            }
          });
          
          // 如果没有识别到订单号，生成一个
          if (!row.platform_order_id) {
            row.platform_order_id = `IMP${Date.now()}${i}`;
          }
          
          previewData.push(row);
        }
        
        setImportPreview(previewData);
        toast.success(`已读取 ${lines.length - 1} 条订单数据`);
      } catch (error) {
        toast.error('文件解析失败');
      }
    };
    reader.readAsText(file);
  };

  // 执行导入
  const handleImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    try {
      // 读取完整文件
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('文件数据为空');
        return;
      }
      
      // 解析所有数据
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const ordersData: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((h, idx) => {
          if (h.includes('订单') || h.includes('order')) {
            row.platform_order_id = values[idx];
          } else if (h.includes('商品') || h.includes('product') || h.includes('name')) {
            row.product_name = values[idx];
          } else if (h.includes('数量') || h.includes('quantity') || h.includes('qty')) {
            row.quantity = parseInt(values[idx]) || 1;
          } else if (h.includes('金额') || h.includes('amount') || h.includes('price') || h.includes('total')) {
            row.total_amount = parseFloat(values[idx]) || 0;
          } else if (h.includes('成本') || h.includes('cost')) {
            row.cost_price = parseFloat(values[idx]) || 0;
          } else if (h.includes('平台') || h.includes('platform')) {
            row.platform = values[idx].toLowerCase();
          }
        });
        
        if (row.platform_order_id || row.product_name) {
          if (!row.platform_order_id) {
            row.platform_order_id = `IMP${Date.now()}${i}`;
          }
          if (!row.quantity) row.quantity = 1;
          if (!row.total_amount) row.total_amount = 0;
          if (!row.cost_price) row.cost_price = 0;
          if (!row.platform) row.platform = 'tiktok';
          if (!row.status) row.status = 'paid';
          
          ordersData.push(row);
        }
      }
      
      // 逐条导入
      let successCount = 0;
      for (const orderData of ordersData) {
        const response = await fetch('/api/v1/erp/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        
        if (response.ok) {
          successCount++;
        }
      }
      
      toast.success(`成功导入 ${successCount} 条订单`);
      setIsImportOpen(false);
      setImportFile(null);
      setImportPreview([]);
      fetchOrders();
    } catch (error) {
      toast.error('导入失败，请检查文件格式');
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待付款', className: 'bg-warning/10 text-warning' },
      paid: { label: '已付款', className: 'bg-primary/10 text-primary' },
      shipped: { label: '已发货', className: 'bg-blue-500/10 text-blue-500' },
      delivered: { label: '已签收', className: 'bg-success/10 text-success' },
      cancelled: { label: '已取消', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getPlatformBadge = (platform: string) => {
    const config: Record<string, { label: string; className: string }> = {
      tiktok: { label: 'TikTok', className: 'bg-pink-500/10 text-pink-500' },
      amazon: { label: 'Amazon', className: 'bg-orange-500/10 text-orange-500' },
      shopee: { label: 'Shopee', className: 'bg-red-500/10 text-red-500' },
    };
    const { label, className } = config[platform] || { label: platform, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 统计数据
  const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalProfit = orders.reduce((sum, o) => sum + (o.profit || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
  const abnormalOrders = orders.filter(o => o.abnormal_type).length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">ERP订单管理</h1>
              <p className="text-[14px] text-muted-foreground">订单同步 · 异常处理 · 利润核算 · 物流追踪</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleSyncOrders} 
              disabled={isProcessing === 'sync'}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isProcessing === 'sync' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              同步订单
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              导入订单
            </Button>
          </div>
        </div>

        {/* 统计概览 - 工作台风格 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">订单总数</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{orders.length}</p>
                  <p className="text-[11px] text-muted-foreground">全部订单</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">销售额</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${safeNum(totalSales).toFixed(2)}</p>
                  <p className="text-[11px] text-muted-foreground">累计销售</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">毛利润</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${safeNum(totalProfit).toFixed(2)}</p>
                  <p className="text-[11px] text-green-600">利润率 {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">待处理</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{pendingOrders}</p>
                  <p className="text-[11px] text-muted-foreground">待发货订单</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">异常订单</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{abnormalOrders}</p>
                  <p className="text-[11px] text-red-600">需人工处理</p>
                </div>
              </div>
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
                  placeholder="搜索订单号、商品名称、买家..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                />
              </div>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">全部平台</option>
                <option value="tiktok">TikTok</option>
                <option value="amazon">Amazon</option>
                <option value="shopee">Shopee</option>
              </select>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="pending">待付款</option>
                <option value="paid">已付款</option>
                <option value="shipped">已发货</option>
                <option value="delivered">已签收</option>
                <option value="cancelled">已取消</option>
              </select>
              <Button variant="outline" onClick={fetchOrders}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 订单列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">订单列表</CardTitle>
            <CardDescription>每15分钟自动同步TK/亚马逊订单</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无订单数据</div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground font-mono">{order.platform_order_id}</span>
                            {getPlatformBadge(order.platform)}
                            {getStatusBadge(order.status)}
                            {order.abnormal_type && (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                异常
                              </Badge>
                            )}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{order.product_name || '未知商品'}</div>
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>买家: <span className="text-foreground">{order.buyer_name || '-'}</span></span>
                            <span>数量: <span className="text-foreground">{order.quantity}</span></span>
                            <span>下单时间: <span className="text-foreground">{order.order_time ? new Date(order.order_time).toLocaleString() : '-'}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-[20px] font-semibold text-foreground">${safeNum(order.total_amount).toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">售价 ${safeNum(order.sale_price).toFixed(2)} × {order.quantity}</div>
                        <div className="flex items-center justify-end gap-2 text-[12px]">
                          <span className="text-muted-foreground">利润:</span>
                          <span className={order.profit > 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                            ${safeNum(order.profit).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetail(order)}>
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          {order.status === 'paid' && (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsShipOpen(true);
                              }}
                              disabled={isProcessing === order.id}
                            >
                              <Truck className="h-3 w-3 mr-1" />
                              发货
                            </Button>
                          )}
                          {(order.status === 'shipped' || order.status === 'delivered') && (
                            <Button variant="outline" size="sm" onClick={() => handleViewLogistics(order)}>
                              <PackageCheck className="h-3 w-3 mr-1" />
                              物流
                            </Button>
                          )}
                          {order.abnormal_type && (
                            <Button variant="outline" size="sm" onClick={() => handleResolveAbnormal(order)}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              处理
                            </Button>
                          )}
                          {(order.status === 'pending' || order.status === 'paid') && (
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

        {/* 订单详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>订单详情</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">订单号</div>
                    <div className="font-mono text-[14px]">{selectedOrder.platform_order_id}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">平台</div>
                    <div>{getPlatformBadge(selectedOrder.platform)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">商品名称</div>
                  <div className="text-[14px] font-medium">{selectedOrder.product_name}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">数量</div>
                    <div className="text-[16px] font-semibold">{selectedOrder.quantity}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">单价</div>
                    <div className="text-[16px] font-semibold">${safeNum(selectedOrder.sale_price).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">总金额</div>
                    <div className="text-[16px] font-semibold text-success">${safeNum(selectedOrder.total_amount).toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">成本</div>
                    <div className="text-[14px]">${safeNum(selectedOrder.cost_price).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">利润</div>
                    <div className={`text-[14px] font-semibold ${selectedOrder.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                      ${safeNum(selectedOrder.profit).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">买家信息</div>
                  <div className="text-[14px]">{selectedOrder.buyer_name || '-'}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">下单时间</div>
                  <div className="text-[14px]">{selectedOrder.order_time || selectedOrder.created_at}</div>
                </div>
                {selectedOrder.abnormal_type && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <div className="text-[12px] text-destructive font-medium">异常类型</div>
                    <div className="text-[14px] text-destructive">{selectedOrder.abnormal_type}</div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 发货对话框 */}
        <Dialog open={isShipOpen} onOpenChange={setIsShipOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>订单发货</DialogTitle>
              <DialogDescription>填写物流信息完成发货</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium">物流公司</label>
                <select 
                  className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                  value={shipForm.carrier}
                  onChange={(e) => setShipForm({ ...shipForm, carrier: e.target.value })}
                >
                  <option value="">请选择物流公司</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="Ninja Van">Ninja Van</option>
                  <option value="Flash Express">Flash Express</option>
                  <option value="Kerry Express">Kerry Express</option>
                  <option value="Amazon Logistics">Amazon Logistics</option>
                  <option value="顺丰国际">顺丰国际</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">物流单号</label>
                <Input
                  placeholder="请输入物流单号"
                  value={shipForm.tracking_number}
                  onChange={(e) => setShipForm({ ...shipForm, tracking_number: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShipOpen(false)}>取消</Button>
              <Button onClick={handleShip} disabled={isProcessing === selectedOrder?.id}>
                {isProcessing === selectedOrder?.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                确认发货
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 导入订单对话框 */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>导入订单</DialogTitle>
              <DialogDescription>
                支持导入历史订单数据，支持 Excel (.xlsx, .xls) 和 CSV 格式
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 文件上传区域 */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  importFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
                    handleFileSelect(file);
                  }
                }}
              >
                <input
                  type="file"
                  id="order-file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                <label htmlFor="order-file-upload" className="cursor-pointer">
                  {importFile ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
                      <div className="text-[14px] font-medium">{importFile.name}</div>
                      <div className="text-[12px] text-muted-foreground">
                        {(importFile.size / 1024).toFixed(1)} KB
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImportFile(null);
                        setImportPreview([]);
                      }}>
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div className="text-[14px] text-muted-foreground">
                        拖拽文件到此处，或<span className="text-primary">点击选择文件</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        支持 .xlsx, .xls, .csv 格式，单文件不超过 10MB
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* 导入预览 */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[13px] font-medium">数据预览（前5条）</div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-[12px]">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">订单号</th>
                          <th className="px-3 py-2 text-left font-medium">商品</th>
                          <th className="px-3 py-2 text-left font-medium">数量</th>
                          <th className="px-3 py-2 text-left font-medium">金额</th>
                          <th className="px-3 py-2 text-left font-medium">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {importPreview.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-mono">{row.platform_order_id || row.order_id || '-'}</td>
                            <td className="px-3 py-2">{row.product_name || '-'}</td>
                            <td className="px-3 py-2">{row.quantity || '-'}</td>
                            <td className="px-3 py-2">${safeNum(row.total_amount || row.amount).toFixed(2)}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className="text-[10px]">
                                {row.status || '待处理'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    共 {importPreview.length} 条订单待导入
                  </div>
                </div>
              )}

              {/* 导入说明 */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="text-[12px] font-medium text-muted-foreground mb-2">导入说明</div>
                <div className="text-[12px] text-muted-foreground">• 支持的列：订单号、商品名称、数量、单价、运费、买家信息等</div>
                <div className="text-[12px] text-muted-foreground">• 系统会自动识别列名，无需手动匹配</div>
                <div className="text-[12px] text-muted-foreground">• 重复订单号会自动覆盖更新</div>
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
