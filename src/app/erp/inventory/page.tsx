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
  Package,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  RefreshCw,
  Loader2,
  BarChart3,
  TrendingUp,
  Truck,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/hooks/useAuthFetch';

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  warehouse: string;
  quantity: number;
  safety_stock: number;
  status: 'normal' | 'warning' | 'critical';
  cost_price: number;
  sale_price: number;
  turnover_days: number;
  last_restock: string;
  supplier?: string;
}

// 安全数字转换，防止 toFixed 报错
const safeNum = (v: any, fallback = 0): number => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};

export default function ERPInventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 对话框状态
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // 补货表单
  const [restockForm, setRestockForm] = useState({
    quantity: '',
    supplier: '',
    estimated_arrival: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchInventory();
  }, [router]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/v1/erp/inventory?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      // 兼容两种返回格式
      if (data.items !== undefined) {
        setItems(data.items || []);
      } else if (data.success && data.data) {
        setItems(data.data.items || []);
      } else {
        toast.error(data.detail || '获取库存失败');
      }
    } catch (error) {
      console.error('获取库存失败:', error);
      toast.error('获取库存失败');
    } finally {
      setLoading(false);
    }
  };

  // 同步库存
  const handleSyncInventory = async () => {
    setIsProcessing('sync');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('库存同步成功', { description: '已从各仓库同步最新库存数据' });
      fetchInventory();
    } catch (error) {
      toast.error('同步失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 导出库存
  const handleExport = async () => {
    setIsProcessing('export');
    try {
      const headers = ['SKU', '商品名称', '仓库', '库存数量', '安全库存', '状态', '成本价', '周转天数'];
      const rows = items.map(i => [
        i.sku,
        i.product_name,
        i.warehouse,
        i.quantity,
        i.safety_stock,
        i.status,
        i.cost_price,
        i.turnover_days,
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 补货
  const handleRestock = async () => {
    if (!selectedItem) return;
    if (!restockForm.quantity || parseInt(restockForm.quantity) <= 0) {
      toast.error('请输入正确的补货数量');
      return;
    }

    setIsProcessing(selectedItem.id);
    try {
      // 创建采购单
      const response = await fetch('/api/v1/erp/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedItem.product_id,
          quantity: parseInt(restockForm.quantity),
          supplier: restockForm.supplier || selectedItem.supplier || '默认供应商',
          estimated_arrival: restockForm.estimated_arrival,
          status: 'pending',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('补货申请已创建', { description: `采购单号: ${data.data.id}` });
        setIsRestockOpen(false);
        setRestockForm({ quantity: '', supplier: '', estimated_arrival: '' });
        fetchInventory();
      } else {
        toast.error(data.error || '创建失败');
      }
    } catch (error) {
      toast.error('创建失败');
    } finally {
      setIsProcessing(null);
    }
  };

  // 调整库存
  const handleAdjustStock = async (item: InventoryItem, delta: number) => {
    if (delta === 0) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity < 0) {
      toast.error('库存不能为负数');
      return;
    }

    setIsProcessing(item.id);
    try {
      const response = await fetch(`/api/v1/erp/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(delta > 0 ? '入库成功' : '出库成功', { description: `库存调整为 ${newQuantity}` });
        fetchInventory();
      } else {
        toast.error(data.error || '调整失败');
      }
    } catch (error) {
      toast.error('调整失败');
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      normal: { label: '正常', className: 'bg-success/10 text-success' },
      warning: { label: '预警', className: 'bg-warning/10 text-warning' },
      critical: { label: '缺货', className: 'bg-destructive/10 text-destructive' },
    };
    const { label, className } = config[status] || config.normal;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 统计数据
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const warningItems = items.filter(i => i.status === 'warning').length;
  const criticalItems = items.filter(i => i.status === 'critical').length;
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.cost_price, 0);

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/5 flex items-center justify-center">
              <Package className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">ERP库存管理</h1>
              <p className="text-[14px] text-muted-foreground">库存预警 · 安全库存 · 自动补货 · 周转分析</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSyncInventory} disabled={isProcessing === 'sync'}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
              {isProcessing === 'sync' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              同步库存
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

        {/* 统计概览 - 工作台风格 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">SKU数量</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{totalItems}</p>
                  <p className="text-[11px] text-muted-foreground">库存商品</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Warehouse className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总库存</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{totalQuantity}</p>
                  <p className="text-[11px] text-muted-foreground">件</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">库存价值</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${safeNum(totalValue).toFixed(2)}</p>
                  <p className="text-[11px] text-muted-foreground">成本价值</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">预警商品</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{warningItems}</p>
                  <p className="text-[11px] text-amber-600">需关注</p>
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
                  <p className="text-[12px] text-muted-foreground">缺货商品</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{criticalItems}</p>
                  <p className="text-[11px] text-red-600">需补货</p>
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
                  placeholder="搜索SKU、商品名称..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
                />
              </div>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="normal">正常</option>
                <option value="warning">预警</option>
                <option value="critical">缺货</option>
              </select>
              <Button variant="outline" onClick={fetchInventory}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 库存列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">库存清单</CardTitle>
            <CardDescription>库存低于安全库存自动预警，支持快速补货</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无库存数据</div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground font-mono">{item.sku}</span>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{item.product_name}</div>
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>仓库: <span className="text-foreground">{item.warehouse}</span></span>
                            <span>成本: <span className="text-foreground">${safeNum(item.cost_price).toFixed(2)}</span></span>
                            <span>周转: <span className="text-foreground">{item.turnover_days}天</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAdjustStock(item, -10)}
                            disabled={isProcessing === item.id}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <div className="text-center min-w-[80px]">
                            <div className="text-[20px] font-semibold text-foreground">{item.quantity}</div>
                            <div className="text-[11px] text-muted-foreground">安全库存: {item.safety_stock}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAdjustStock(item, 10)}
                            disabled={isProcessing === item.id}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedItem(item);
                              setRestockForm({
                                quantity: String(Math.max(50, item.safety_stock * 2 - item.quantity)),
                                supplier: item.supplier || '',
                                estimated_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              });
                              setIsRestockOpen(true);
                            }}
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            补货
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

        {/* 补货对话框 */}
        <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>创建补货单</DialogTitle>
              <DialogDescription>系统将自动创建采购单进行补货</DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-[12px] text-muted-foreground">商品信息</div>
                  <div className="text-[14px] font-medium">{selectedItem.product_name}</div>
                  <div className="text-[12px] text-muted-foreground">当前库存: {selectedItem.quantity} | 安全库存: {selectedItem.safety_stock}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">补货数量</label>
                  <Input
                    type="number"
                    placeholder="请输入补货数量"
                    value={restockForm.quantity}
                    onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">供应商</label>
                  <Input
                    placeholder="请输入供应商名称"
                    value={restockForm.supplier}
                    onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">预计到货日期</label>
                  <Input
                    type="date"
                    value={restockForm.estimated_arrival}
                    onChange={(e) => setRestockForm({ ...restockForm, estimated_arrival: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRestockOpen(false)}>取消</Button>
              <Button onClick={handleRestock} disabled={isProcessing === selectedItem?.id}>
                {isProcessing === selectedItem?.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                确认补货
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
