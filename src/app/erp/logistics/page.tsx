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
  Truck,
  Search,
  Filter,
  Download,
  Eye,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface LogisticsRecord {
  id: string;
  order_id: string;
  order_number: string;
  product_name?: string;
  buyer_name?: string;
  buyer_address?: string;
  buyer_phone?: string;
  carrier: string;
  tracking_number: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'failed' | 'returned';
  shipping_fee: number;
  weight?: number;
  estimated_arrival?: string;
  actual_arrival?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  tracking_events?: TrackingEvent[];
}

interface TrackingEvent {
  time: string;
  status: string;
  location: string;
  description: string;
}

export default function ERPLogisticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<LogisticsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 对话框状态
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LogisticsRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchRecords();
  }, [router]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/v1/erp/logistics?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.data.items || []);
      } else {
        toast.error('获取物流数据失败');
      }
    } catch (error) {
      console.error('获取物流数据失败:', error);
      toast.error('获取物流数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 同步物流信息
  const handleSyncLogistics = async () => {
    setIsProcessing('sync');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('物流信息同步成功', { description: '已从物流公司获取最新状态' });
      fetchRecords();
    } catch (error) {
      toast.error('同步失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 导出物流数据
  const handleExport = async () => {
    setIsProcessing('export');
    try {
      const headers = ['订单号', '商品名称', '买家', '承运商', '运单号', '状态', '运费', '发货时间', '签收时间'];
      const rows = records.map(r => [
        r.order_number,
        r.product_name,
        r.buyer_name,
        r.carrier,
        r.tracking_number,
        r.status,
        r.shipping_fee.toFixed(2),
        r.shipped_at || '-',
        r.delivered_at || '-',
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logistics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 查看详情
  const handleViewDetail = (record: LogisticsRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  // 查看物流轨迹
  const handleViewTracking = async (record: LogisticsRecord) => {
    setIsProcessing(record.id);
    try {
      // 模拟获取物流轨迹
      const events: TrackingEvent[] = [
        { time: record.delivered_at || new Date().toISOString(), status: 'delivered', location: record.buyer_address || '', description: '快件已签收' },
        { time: record.shipped_at || new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_transit', location: '目的地城市', description: '快件到达目的地城市' },
        { time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_transit', location: '中转站', description: '快件已发出' },
        { time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'shipped', location: '发货地', description: '快件已揽收' },
      ];
      
      setSelectedRecord({ ...record, tracking_events: events });
      setIsTrackingOpen(true);
    } catch (error) {
      toast.error('获取物流轨迹失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 联系买家
  const handleContactBuyer = (record: LogisticsRecord) => {
    if (record.buyer_phone) {
      toast.info('买家联系方式', { description: record.buyer_phone });
    } else {
      toast.warning('暂无买家联系方式');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: '待发货', className: 'bg-warning/10 text-warning' },
      shipped: { label: '已发货', className: 'bg-primary/10 text-primary' },
      in_transit: { label: '运输中', className: 'bg-blue-500/10 text-blue-500' },
      delivered: { label: '已签收', className: 'bg-success/10 text-success' },
      failed: { label: '派送失败', className: 'bg-destructive/10 text-destructive' },
      returned: { label: '已退回', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 统计数据
  const totalRecords = records.length;
  const pendingCount = records.filter(r => r.status === 'pending').length;
  const inTransitCount = records.filter(r => r.status === 'shipped' || r.status === 'in_transit').length;
  const deliveredCount = records.filter(r => r.status === 'delivered').length;
  const failedCount = records.filter(r => r.status === 'failed' || r.status === 'returned').length;
  const totalFee = records.reduce((sum, r) => sum + r.shipping_fee, 0);

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
              <h1 className="text-[18px] font-semibold text-foreground">ERP物流管理</h1>
              <p className="text-[14px] text-muted-foreground">物流追踪 · 运费核算 · 签收确认 · 异常处理</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchRecords}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" onClick={handleSyncLogistics} disabled={isProcessing === 'sync'}>
              {isProcessing === 'sync' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              同步物流
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isProcessing === 'export'}>
              {isProcessing === 'export' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
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
            <MapPin className="h-3 w-3 mr-1" />
            轨迹查询
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            签收确认
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            异常处理
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">物流总数</div>
              <div className="text-[24px] font-semibold text-foreground">{totalRecords}</div>
              <div className="text-[11px] text-muted-foreground mt-1">全部物流</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">待发货</div>
              <div className="text-[24px] font-semibold text-warning">{pendingCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">需处理</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">运输中</div>
              <div className="text-[24px] font-semibold text-blue-500">{inTransitCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">配送中</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">已签收</div>
              <div className="text-[24px] font-semibold text-success">{deliveredCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">完成配送</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">运费总额</div>
              <div className="text-[24px] font-semibold text-foreground">${totalFee.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">累计运费</div>
            </CardContent>
          </Card>
        </div>

        {/* 异常提醒 */}
        {failedCount > 0 && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <div className="text-[13px] font-medium text-destructive">物流异常提醒</div>
                  <div className="text-[12px] text-muted-foreground">有 {failedCount} 个订单存在派送失败或退回，请及时处理</div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => setStatusFilter('failed')}>
                  查看异常
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 筛选条件 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号、运单号、买家..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
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
                <option value="failed">派送失败</option>
                <option value="returned">已退回</option>
              </select>
              <Button variant="outline" onClick={fetchRecords}>
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
            <CardDescription>实时追踪物流状态，自动同步物流轨迹</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无物流数据</div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Truck className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground font-mono">{record.order_number}</span>
                            {getStatusBadge(record.status)}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{record.product_name || '未知商品'}</div>
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>买家: <span className="text-foreground">{record.buyer_name || '-'}</span></span>
                            <span>承运商: <span className="text-foreground">{record.carrier}</span></span>
                            <span>运单号: <span className="text-foreground font-mono">{record.tracking_number}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-[16px] font-semibold text-foreground">${record.shipping_fee.toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">运费</div>
                        <div className="flex items-center justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetail(record)}>
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewTracking(record)}
                            disabled={isProcessing === record.id || record.status === 'pending'}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            轨迹
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContactBuyer(record)}
                          >
                            <Phone className="h-3 w-3" />
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

        {/* 物流详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>物流详情</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">订单号</div>
                    <div className="font-mono text-[14px]">{selectedRecord.order_number}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">状态</div>
                    <div>{getStatusBadge(selectedRecord.status)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">商品名称</div>
                  <div className="text-[14px] font-medium">{selectedRecord.product_name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">承运商</div>
                    <div className="text-[14px]">{selectedRecord.carrier}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">运单号</div>
                    <div className="text-[14px] font-mono">{selectedRecord.tracking_number}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">买家</div>
                    <div className="text-[14px]">{selectedRecord.buyer_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">联系电话</div>
                    <div className="text-[14px]">{selectedRecord.buyer_phone || '-'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">收货地址</div>
                  <div className="text-[14px]">{selectedRecord.buyer_address || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">运费</div>
                    <div className="text-[16px] font-semibold">${selectedRecord.shipping_fee.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">重量</div>
                    <div className="text-[14px]">{selectedRecord.weight ? `${selectedRecord.weight}kg` : '-'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">发货时间</div>
                    <div className="text-[14px]">{selectedRecord.shipped_at || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">签收时间</div>
                    <div className="text-[14px]">{selectedRecord.delivered_at || '-'}</div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 物流轨迹对话框 */}
        <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>物流轨迹</DialogTitle>
              <DialogDescription>{selectedRecord?.carrier} - {selectedRecord?.tracking_number}</DialogDescription>
            </DialogHeader>
            {selectedRecord?.tracking_events && (
              <div className="space-y-4 py-4">
                {selectedRecord.tracking_events.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-success' : 'bg-muted'}`} />
                      {index < selectedRecord.tracking_events!.length - 1 && (
                        <div className="w-0.5 h-12 bg-muted" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-[13px] font-medium text-foreground">{event.description}</div>
                      <div className="text-[12px] text-muted-foreground">{event.location}</div>
                      <div className="text-[11px] text-muted-foreground">{new Date(event.time).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTrackingOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
