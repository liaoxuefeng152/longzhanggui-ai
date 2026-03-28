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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Warehouse,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  MinusCircle,
  PlusCircle,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getInventoryList, Inventory as ERPInventory } from '@/lib/api/erp';

interface InventoryItem {
  id: string;
  product_id: string;
  sku: string;
  product_name?: string;
  warehouse: string;
  qty_available: number;
  qty_reserved: number;
  safety_stock: number;
  reorder_point: number;
  is_low_stock: boolean;
  need_reorder: boolean;
  updated_at: string;
}

interface StockInForm {
  product_id: string;
  sku: string;
  product_name: string;
  warehouse: string;
  quantity: string;
  batch_no: string;
  notes: string;
}

// Mock数据
const mockInventory: InventoryItem[] = [
  {
    id: 'INV001',
    product_id: 'PROD001',
    sku: 'SKU-PET-001',
    product_name: '宠物自动喂食器 5L大容量',
    warehouse: 'domestic',
    qty_available: 156,
    qty_reserved: 24,
    safety_stock: 50,
    reorder_point: 80,
    is_low_stock: false,
    need_reorder: false,
    updated_at: '2026-03-21 14:30:00',
  },
  {
    id: 'INV002',
    product_id: 'PROD002',
    sku: 'SKU-HOME-001',
    product_name: '便携式榨汁机 USB充电',
    warehouse: 'domestic',
    qty_available: 42,
    qty_reserved: 18,
    safety_stock: 30,
    reorder_point: 50,
    is_low_stock: false,
    need_reorder: true,
    updated_at: '2026-03-21 11:00:00',
  },
  {
    id: 'INV003',
    product_id: 'PROD003',
    sku: 'SKU-BEAUTY-001',
    product_name: 'LED化妆镜 台式带灯',
    warehouse: 'domestic',
    qty_available: 15,
    qty_reserved: 8,
    safety_stock: 30,
    reorder_point: 40,
    is_low_stock: true,
    need_reorder: true,
    updated_at: '2026-03-21 10:30:00',
  },
  {
    id: 'INV004',
    product_id: 'PROD004',
    sku: 'SKU-ELEC-001',
    product_name: '智能手环 运动监测',
    warehouse: 'domestic',
    qty_available: 88,
    qty_reserved: 12,
    safety_stock: 40,
    reorder_point: 60,
    is_low_stock: false,
    need_reorder: false,
    updated_at: '2026-03-20 16:45:00',
  },
  {
    id: 'INV005',
    product_id: 'PROD005',
    sku: 'SKU-KITCHEN-001',
    product_name: '不锈钢保温杯 500ml',
    warehouse: 'domestic',
    qty_available: 320,
    qty_reserved: 45,
    safety_stock: 100,
    reorder_point: 150,
    is_low_stock: false,
    need_reorder: false,
    updated_at: '2026-03-19 09:20:00',
  },
  {
    id: 'INV006',
    product_id: 'PROD006',
    sku: 'SKU-PET-002',
    product_name: '猫咪自动饮水机',
    warehouse: 'domestic',
    qty_available: 28,
    qty_reserved: 15,
    safety_stock: 25,
    reorder_point: 40,
    is_low_stock: false,
    need_reorder: true,
    updated_at: '2026-03-18 14:30:00',
  },
  {
    id: 'INV007',
    product_id: 'PROD001',
    sku: 'SKU-PET-001-FBJ',
    product_name: '宠物自动喂食器 5L大容量',
    warehouse: 'fjb',
    qty_available: 85,
    qty_reserved: 10,
    safety_stock: 30,
    reorder_point: 50,
    is_low_stock: false,
    need_reorder: false,
    updated_at: '2026-03-17 10:15:00',
  },
  {
    id: 'INV008',
    product_id: 'PROD002',
    sku: 'SKU-HOME-001-ID',
    product_name: '便携式榨汁机 USB充电',
    warehouse: 'indonesia',
    qty_available: 0,
    qty_reserved: 5,
    safety_stock: 20,
    reorder_point: 30,
    is_low_stock: true,
    need_reorder: true,
    updated_at: '2026-03-16 15:30:00',
  },
];

export default function ERPInventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 入库对话框
  const [showStockInDialog, setShowStockInDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stockInForm, setStockInForm] = useState<StockInForm>({
    product_id: '',
    sku: '',
    product_name: '',
    warehouse: 'domestic',
    quantity: '',
    batch_no: '',
    notes: '',
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
      const data = await getInventoryList({
        low_stock: statusFilter === 'low_stock',
      });
      
      // 转换数据格式
      const items: InventoryItem[] = (data || []).map((item: ERPInventory) => ({
        id: item.id,
        product_id: item.product_id,
        sku: `SKU-${item.product_id.slice(0, 8)}`,
        product_name: `商品-${item.product_id.slice(0, 6)}`,
        warehouse: item.warehouse || 'domestic',
        qty_available: item.qty_available,
        qty_reserved: item.qty_reserved,
        safety_stock: item.safety_stock,
        reorder_point: item.reorder_point,
        is_low_stock: item.is_low_stock,
        need_reorder: item.need_reorder,
        updated_at: item.updated_at,
      }));
      
      setInventory(items.length > 0 ? items : mockInventory);
    } catch (error) {
      console.error('获取库存失败:', error);
      // 使用mock数据
      setInventory(mockInventory);
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = async () => {
    if (!stockInForm.product_name) {
      toast.error('请输入商品名称');
      return;
    }
    if (!stockInForm.quantity || parseInt(stockInForm.quantity) <= 0) {
      toast.error('请输入有效的入库数量');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/v1/erp/inventory/stock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stockInForm,
          product_id: stockInForm.product_id || `PROD-${Date.now()}`,
          quantity: parseInt(stockInForm.quantity),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || '入库成功');
        setShowStockInDialog(false);
        setStockInForm({
          product_id: '',
          sku: '',
          product_name: '',
          warehouse: 'domestic',
          quantity: '',
          batch_no: '',
          notes: '',
        });
        fetchInventory();
      } else {
        toast.error(data.message || '入库失败');
      }
    } catch (error) {
      console.error('入库失败:', error);
      toast.error('入库失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (item: InventoryItem) => {
    if (item.qty_available <= 0) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive">缺货</Badge>;
    }
    if (item.is_low_stock) {
      return <Badge variant="outline" className="bg-warning/10 text-warning">低库存</Badge>;
    }
    return <Badge variant="outline" className="bg-success/10 text-success">正常</Badge>;
  };

  const getWarehouseBadge = (warehouse: string) => {
    const config: Record<string, { label: string; className: string }> = {
      domestic: { label: '国内仓', className: 'bg-blue-500/10 text-blue-500' },
      overseas: { label: '海外仓', className: 'bg-purple-500/10 text-purple-500' },
      third_party: { label: '第三方仓', className: 'bg-teal-500/10 text-teal-500' },
    };
    const { label, className } = config[warehouse] || { label: warehouse, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 统计数据
  const totalItems = inventory.length;
  const totalQty = inventory.reduce((sum, i) => sum + i.qty_available, 0);
  const lowStockItems = inventory.filter(i => i.is_low_stock || i.qty_available <= 0).length;
  const totalReserved = inventory.reduce((sum, i) => sum + i.qty_reserved, 0);

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Warehouse className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">ERP库存管理</h1>
              <p className="text-[14px] text-muted-foreground">库存预警 · 调拨管理 · 库存盘点 · 周转分析</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => toast.info('库存调拨功能开发中...')}>
              <MinusCircle className="h-4 w-4 mr-2" />
              库存调拨
            </Button>
            <Button variant="outline" onClick={() => toast.success('正在导出库存数据...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowStockInDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              入库
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            库存预警
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Package className="h-3 w-3 mr-1" />
            多仓管理
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <BarChart3 className="h-3 w-3 mr-1" />
            周转分析
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <TrendingDown className="h-3 w-3 mr-1" />
            自动补货
          </Badge>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">SKU数量</div>
              <div className="text-[24px] font-semibold text-foreground">{totalItems}</div>
              <div className="text-[11px] text-muted-foreground mt-1">库存SKU</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">可售库存</div>
              <div className="text-[24px] font-semibold text-success">{totalQty}</div>
              <div className="text-[11px] text-muted-foreground mt-1">总可用数量</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">预警商品</div>
              <div className="text-[24px] font-semibold text-warning">{lowStockItems}</div>
              <div className="text-[11px] text-muted-foreground mt-1">需补货</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">预留库存</div>
              <div className="text-[24px] font-semibold text-foreground">{totalReserved}</div>
              <div className="text-[11px] text-muted-foreground mt-1">订单占用</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[12px] text-muted-foreground mb-1">需补货</div>
              <div className="text-[24px] font-semibold text-destructive">
                {inventory.filter(i => i.need_reorder).length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">待采购</div>
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
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
              >
                <option value="">全部仓库</option>
                <option value="domestic">国内仓</option>
                <option value="overseas">海外仓</option>
                <option value="third_party">第三方仓</option>
              </select>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="normal">正常</option>
                <option value="low_stock">低库存</option>
                <option value="out_of_stock">缺货</option>
                <option value="overstock">积压</option>
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
            <CardTitle className="text-[15px]">库存列表</CardTitle>
            <CardDescription>支持库存预警、自动补货建议、多仓调拨</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无库存数据</div>
            ) : (
              <div className="space-y-3">
                {inventory.map((item) => (
                  <div key={item.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-muted-foreground font-mono">{item.sku}</span>
                            {getWarehouseBadge(item.warehouse)}
                            {getStatusBadge(item)}
                          </div>
                          <div className="text-[14px] font-medium text-foreground">{item.product_name || '未知商品'}</div>
                          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                            <span>安全库存: <span className="text-foreground">{item.safety_stock}</span></span>
                            <span>补货点: <span className="text-foreground">{item.reorder_point}</span></span>
                            <span>更新: <span className="text-foreground">{new Date(item.updated_at).toLocaleString()}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-4">
                          <div className="text-center">
                            <div className="text-[20px] font-semibold text-foreground">{item.qty_available}</div>
                            <div className="text-[10px] text-muted-foreground">可售</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[20px] font-semibold text-warning">{item.qty_reserved}</div>
                            <div className="text-[10px] text-muted-foreground">预留</div>
                          </div>
                        </div>
                        {item.need_reorder && (
                          <div className="flex items-center justify-end gap-1 text-[12px] text-warning">
                            <TrendingDown className="h-3 w-3" />
                            建议补货 {item.safety_stock - item.qty_available + item.reorder_point} 件
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => toast.info(`查看库存 ${item.sku} 详情`)}>
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toast.info(`调整库存 ${item.sku}`)}>
                            <Edit className="h-3 w-3 mr-1" />
                            调整
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

      {/* 入库对话框 */}
      <Dialog open={showStockInDialog} onOpenChange={setShowStockInDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>商品入库</DialogTitle>
            <DialogDescription>填写入库信息，将商品添加到库存</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">商品名称 *</Label>
              <Input
                id="product_name"
                value={stockInForm.product_name}
                onChange={(e) => setStockInForm({ ...stockInForm, product_name: e.target.value })}
                placeholder="输入商品名称"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={stockInForm.sku}
                  onChange={(e) => setStockInForm({ ...stockInForm, sku: e.target.value })}
                  placeholder="可选"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">入库数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={stockInForm.quantity}
                  onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse">入库仓库</Label>
              <select
                id="warehouse"
                className="w-full px-3 py-2 border border-border rounded-md text-[14px]"
                value={stockInForm.warehouse}
                onChange={(e) => setStockInForm({ ...stockInForm, warehouse: e.target.value })}
              >
                <option value="domestic">国内仓</option>
                <option value="overseas">海外仓</option>
                <option value="third_party">第三方仓</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch_no">批次号</Label>
                <Input
                  id="batch_no"
                  value={stockInForm.batch_no}
                  onChange={(e) => setStockInForm({ ...stockInForm, batch_no: e.target.value })}
                  placeholder="可选"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">备注</Label>
                <Input
                  id="notes"
                  value={stockInForm.notes}
                  onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
                  placeholder="可选"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockInDialog(false)}>取消</Button>
            <Button onClick={handleStockIn} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认入库
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
