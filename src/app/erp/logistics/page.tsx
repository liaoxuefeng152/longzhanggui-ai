'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Truck,
  Search,
  Filter,
  Download,
  Eye,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Logistics {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: string;
  shipped_at?: string;
  delivered_at?: string;
  tracking_events?: any[];
}

export default function LogisticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logistics, setLogistics] = useState<Logistics[]>([]);
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
    fetchLogistics();
  }, [router]);

  const fetchLogistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (statusFilter) params.set('status', statusFilter);
      
      // 模拟数据
      setLogistics([
        {
          id: '1',
          order_id: 'TK001',
          carrier: 'J&T Express',
          tracking_number: 'JT1234567890',
          status: 'in_transit',
          shipped_at: new Date().toISOString(),
        },
        {
          id: '2',
          order_id: 'TK002',
          carrier: 'Ninja Van',
          tracking_number: 'NV0987654321',
          status: 'delivered',
          shipped_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          delivered_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('获取物流列表失败:', error);
      toast.error('获取物流列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: '待发货', className: 'bg-muted text-muted-foreground', icon: Clock },
      shipped: { label: '已发货', className: 'bg-blue-500/10 text-blue-500', icon: Truck },
      in_transit: { label: '运输中', className: 'bg-primary/10 text-primary', icon: Package },
      out_for_delivery: { label: '派送中', className: 'bg-orange-500/10 text-orange-500', icon: Truck },
      delivered: { label: '已签收', className: 'bg-success/10 text-success', icon: CheckCircle },
      exception: { label: '异常', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
    };
    const { label, className, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant="outline" className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // 统计数据
  const totalShipments = logistics.length;
  const inTransit = logistics.filter(l => l.status === 'in_transit' || l.status === 'shipped').length;
  const delivered = logistics.filter(l => l.status === 'delivered').length;
  const exceptions = logistics.filter(l => l.status === 'exception').length;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">物流管理</h1>
              <p className="text-[14px] text-muted-foreground">物流轨迹 · 异常预警 · 发货管理</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchLogistics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              同步轨迹
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">物流总数</div>
              <div className="text-[24px] font-semibold text-foreground">{totalShipments}</div>
              <div className="text-[11px] text-muted-foreground mt-1">全部物流</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">运输中</div>
              <div className="text-[24px] font-semibold text-primary">{inTransit}</div>
              <div className="text-[11px] text-muted-foreground mt-1">在途物流</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已签收</div>
              <div className="text-[24px] font-semibold text-success">{delivered}</div>
              <div className="text-[11px] text-muted-foreground mt-1">完成配送</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">物流异常</div>
              <div className="text-[24px] font-semibold text-destructive">{exceptions}</div>
              <div className="text-[11px] text-muted-foreground mt-1">需处理</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">准时率</div>
              <div className="text-[24px] font-semibold text-foreground">98.5%</div>
              <div className="text-[11px] text-success mt-1">↑ 较上周+0.5%</div>
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
                  placeholder="搜索运单号、订单号..."
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
                <option value="pending">待发货</option>
                <option value="shipped">已发货</option>
                <option value="in_transit">运输中</option>
                <option value="delivered">已签收</option>
                <option value="exception">异常</option>
              </select>
              <Button variant="outline" onClick={fetchLogistics}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 物流列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">物流列表</CardTitle>
            <CardDescription>支持J&T、云途、Ninja Van等多家物流商</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : logistics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无物流数据</div>
            ) : (
              <div className="space-y-3">
                {logistics.map((item) => (
                  <div key={item.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Truck className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-mono font-medium">{item.tracking_number}</span>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>订单: <span className="text-foreground">{item.order_id}</span></span>
                            <span>承运商: <span className="text-foreground">{item.carrier}</span></span>
                            <span>发货时间: <span className="text-foreground">{item.shipped_at ? new Date(item.shipped_at).toLocaleString() : '-'}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          轨迹
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          详情
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 物流轨迹时间线示例 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">物流轨迹示例</CardTitle>
            <CardDescription>运单号: JT1234567890</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border"></div>
              
              <div className="relative pb-6">
                <div className="absolute left-[-18px] w-4 h-4 rounded-full bg-primary"></div>
                <div className="ml-4">
                  <div className="text-[13px] font-medium text-foreground">Jakarta Sorting Center</div>
                  <div className="text-[12px] text-muted-foreground">Package arrived at sorting center</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date().toLocaleString()}</div>
                </div>
              </div>
              
              <div className="relative pb-6">
                <div className="absolute left-[-18px] w-4 h-4 rounded-full bg-muted-foreground"></div>
                <div className="ml-4">
                  <div className="text-[13px] font-medium text-foreground">Singapore Hub</div>
                  <div className="text-[12px] text-muted-foreground">Package in transit to destination</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(Date.now() - 21600000).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="relative pb-6">
                <div className="absolute left-[-18px] w-4 h-4 rounded-full bg-muted-foreground"></div>
                <div className="ml-4">
                  <div className="text-[13px] font-medium text-foreground">Guangzhou Warehouse</div>
                  <div className="text-[12px] text-muted-foreground">Package picked up by carrier</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(Date.now() - 43200000).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-[-18px] w-4 h-4 rounded-full bg-muted-foreground"></div>
                <div className="ml-4">
                  <div className="text-[13px] font-medium text-foreground">Seller Warehouse</div>
                  <div className="text-[12px] text-muted-foreground">Order shipped</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(Date.now() - 86400000).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
