'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface ERPOrder {
  id: string;
  platform: string;
  platform_order_id: string;
  product_name?: string;
  quantity: number;
  sale_price: number;
  total_amount: number;
  currency: string;
  cost_price: number;
  profit: number;
  buyer_name?: string;
  status: string;
  abnormal_type?: string;
  order_time?: string;
  created_at: string;
}

export default function ERPOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (platformFilter) params.set('platform', platformFilter);
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/v1/erp/orders?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.items || []);
      } else {
        toast.error('获取订单列表失败');
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      toast.error('获取订单列表失败');
    } finally {
      setLoading(false);
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
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">ERP订单管理</h1>
              <p className="text-[14px] text-muted-foreground">订单同步 · 异常处理 · 利润核算 · 物流追踪</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              同步订单
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Truck className="h-3 w-3 mr-1" />
            物流追踪
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <DollarSign className="h-3 w-3 mr-1" />
            利润核算
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            异常处理
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            数据分析
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">订单总数</div>
              <div className="text-[24px] font-semibold text-foreground">{orders.length}</div>
              <div className="text-[11px] text-muted-foreground mt-1">全部订单</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">销售额</div>
              <div className="text-[24px] font-semibold text-success">${totalSales.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">累计销售</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">毛利润</div>
              <div className="text-[24px] font-semibold text-foreground">${totalProfit.toFixed(2)}</div>
              <div className="text-[11px] text-success mt-1">利润率 {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">待处理</div>
              <div className="text-[24px] font-semibold text-warning">{pendingOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">待发货订单</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">异常订单</div>
              <div className="text-[24px] font-semibold text-destructive">{abnormalOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">需人工处理</div>
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
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无订单数据</div>
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
                        <div className="text-[20px] font-semibold text-foreground">${order.total_amount.toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">售价 ${order.sale_price.toFixed(2)} × {order.quantity}</div>
                        <div className="flex items-center justify-end gap-2 text-[12px]">
                          <span className="text-muted-foreground">利润:</span>
                          <span className={order.profit > 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                            ${order.profit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          {order.status === 'paid' && (
                            <Button size="sm">
                              <Truck className="h-3 w-3 mr-1" />
                              发货
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
      </div>
    </MainLayout>
  );
}
