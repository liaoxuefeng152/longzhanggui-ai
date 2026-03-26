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
} from 'lucide-react';
import { toast } from 'sonner';
import { getPurchaseOrders, PurchaseOrder as ERPurchaseOrder, createPurchaseOrder } from '@/lib/api/erp';

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name?: string;
  qty: number;
  total_amount: number;
  status: string;
  expected_arrival?: string;
  created_at: string;
  notes?: string;
}

export default function ERPPurchasePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
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
      const data = await getPurchaseOrders({
        status: statusFilter || undefined,
      });
      
      // 转换数据格式
      const orders: PurchaseOrder[] = (data || []).map((item: ERPurchaseOrder) => ({
        id: item.id,
        po_number: item.po_number,
        supplier_name: item.supplier_name,
        qty: item.qty,
        total_amount: item.total_amount,
        status: item.status,
        expected_date: item.expected_arrival,
        created_at: item.created_at,
        notes: item.notes,
      }));
      
      setOrders(orders);
    } catch (error) {
      console.error('获取采购订单失败:', error);
      toast.error('获取采购订单失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      draft: { label: '草稿', className: 'bg-muted text-muted-foreground', icon: Clock },
      pending: { label: '待审核', className: 'bg-warning/10 text-warning', icon: Clock },
      approved: { label: '已批准', className: 'bg-primary/10 text-primary', icon: CheckCircle },
      ordered: { label: '已下单', className: 'bg-blue-500/10 text-blue-500', icon: ShoppingCart },
      received: { label: '已到货', className: 'bg-success/10 text-success', icon: Package },
      cancelled: { label: '已取消', className: 'bg-destructive/10 text-destructive', icon: XCircle },
    };
    const { label, className, icon: Icon } = config[status] || config.draft;
    return (
      <Badge variant="outline" className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // 统计数据
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'approved').length;
  const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const overdueOrders = orders.filter(o => {
    if (!o.expected_arrival || o.status === 'received' || o.status === 'cancelled') return false;
    return new Date(o.expected_arrival) < new Date();
  }).length;

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
              <p className="text-[14px] text-muted-foreground">采购申请 · 供应商管理 · 入库验收 · 成本核算</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => toast.success('正在导出采购数据...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => toast.info('新建采购单功能开发中...')}>
              <Plus className="h-4 w-4 mr-2" />
              新建采购单
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
            物流跟踪
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Package className="h-3 w-3 mr-1" />
            入库验收
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <DollarSign className="h-3 w-3 mr-1" />
            成本控制
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">采购订单</div>
              <div className="text-[24px] font-semibold text-foreground">{totalOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">全部采购单</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">待处理</div>
              <div className="text-[24px] font-semibold text-warning">{pendingOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">待审核/待下单</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">采购金额</div>
              <div className="text-[24px] font-semibold text-foreground">¥{totalAmount.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">累计采购</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已到货</div>
              <div className="text-[24px] font-semibold text-success">
                {orders.filter(o => o.status === 'received').length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">完成入库</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">逾期订单</div>
              <div className="text-[24px] font-semibold text-destructive">{overdueOrders}</div>
              <div className="text-[11px] text-muted-foreground mt-1">超期未到货</div>
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
                  placeholder="搜索采购单号、供应商..."
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
                <option value="pending">待审核</option>
                <option value="approved">已批准</option>
                <option value="ordered">已下单</option>
                <option value="received">已到货</option>
                <option value="cancelled">已取消</option>
              </select>
              <Button variant="outline" onClick={fetchOrders}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 采购订单列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">采购订单列表</CardTitle>
            <CardDescription>支持1688一键下单、自动生成采购单</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无采购订单</div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-mono font-medium">{order.po_number}</span>
                            {getStatusBadge(order.status)}
                            {order.expected_arrival && new Date(order.expected_arrival) < new Date() && order.status !== 'received' && order.status !== 'cancelled' && (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                逾期
                              </Badge>
                            )}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{order.supplier_name}</div>
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>数量: <span className="text-foreground">{order.qty}</span></span>
                            <span>创建时间: <span className="text-foreground">{new Date(order.created_at).toLocaleString()}</span></span>
                            {order.expected_arrival && (
                              <span>预计到货: <span className="text-foreground">{order.expected_arrival}</span></span>
                            )}
                          </div>
                          {order.notes && (
                            <div className="text-[12px] text-muted-foreground">备注: {order.notes}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-[20px] font-semibold text-foreground">¥{order.total_amount.toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">采购金额</div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => toast.info(`查看采购单 ${order.po_number} 详情`)}>
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          {order.status === 'draft' && (
                            <Button variant="outline" size="sm" onClick={() => toast.info(`编辑采购单 ${order.po_number}`)}>
                              <Edit className="h-3 w-3 mr-1" />
                              编辑
                            </Button>
                          )}
                          {order.status === 'approved' && (
                            <Button size="sm" onClick={() => toast.success(`采购单 ${order.po_number} 已下单`)}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              下单
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
