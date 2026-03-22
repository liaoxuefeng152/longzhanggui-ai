'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Search,
  Download,
  Eye,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getOrders,
  getOrderStats,
  type Order,
  type OrderStats,
} from '@/lib/api/orders';

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: '待付款', className: 'bg-warning/10 text-warning', icon: Clock },
  paid: { label: '已付款', className: 'bg-primary/10 text-primary', icon: CheckCircle },
  shipped: { label: '已发货', className: 'bg-success/10 text-success', icon: Truck },
  delivered: { label: '已签收', className: 'bg-success text-white', icon: CheckCircle },
  cancelled: { label: '已取消', className: 'bg-muted text-muted-foreground', icon: XCircle },
  exception: { label: '异常', className: 'bg-destructive text-white', icon: AlertTriangle },
};

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    today_orders: 0,
    pending_shipment: 0,
    in_transit: 0,
    delivered: 0,
    exception: 0,
    today_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        getOrders({ page_size: 100 }),
        getOrderStats(),
      ]);
      setOrders(ordersRes.orders);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router, fetchData]);

  const filteredOrders = orders.filter((o) => {
    const matchSearch = o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchPlatform = filterPlatform === 'all' || o.platform === filterPlatform;
    return matchSearch && matchStatus && matchPlatform;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.className} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleExport = () => {
    toast.success('导出任务已开始');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">订单管理中心</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              多平台订单 · 异常处理 · 物流同步
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出订单
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-6 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">今日订单</div>
              <div className="text-[20px] font-semibold text-foreground">{stats.today_orders}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">待发货</div>
              <div className="text-[20px] font-semibold text-warning">{stats.pending_shipment}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">运输中</div>
              <div className="text-[20px] font-semibold text-primary">{stats.in_transit}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">已签收</div>
              <div className="text-[20px] font-semibold text-success">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">异常订单</div>
              <div className="text-[20px] font-semibold text-destructive">{stats.exception}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-[13px] text-muted-foreground mb-1">今日金额</div>
              <div className="text-[20px] font-semibold text-foreground">${stats.today_amount}</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选区 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号/客户名"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="订单状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待付款</SelectItem>
                  <SelectItem value="paid">已付款</SelectItem>
                  <SelectItem value="shipped">已发货</SelectItem>
                  <SelectItem value="delivered">已签收</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                  <SelectItem value="exception">异常</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部平台</SelectItem>
                  <SelectItem value="TK印尼">TK印尼</SelectItem>
                  <SelectItem value="TK泰国">TK泰国</SelectItem>
                  <SelectItem value="TK越南">TK越南</SelectItem>
                  <SelectItem value="亚马逊美国">亚马逊美国</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterPlatform('all'); }}>
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 订单列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>暂无订单数据</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-[12px] font-medium text-muted-foreground px-6">订单号</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">客户</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">商品</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">数量</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">金额</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">物流</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground">下单时间</TableHead>
                    <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-muted/30">
                      <TableCell className="px-6 text-[13px] font-medium text-primary">{order.order_id}</TableCell>
                      <TableCell className="text-[13px] text-foreground">{order.customer}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">{order.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground max-w-[150px] truncate">{order.product}</TableCell>
                      <TableCell className="text-[13px] text-foreground">{order.quantity}</TableCell>
                      <TableCell className="text-[13px] font-medium text-foreground">${order.amount}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{order.logistics_status}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{order.created_at}</TableCell>
                      <TableCell className="text-right px-6">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
