'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

export default function ERPInventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      
      setInventory(items);
    } catch (error) {
      console.error('获取库存失败:', error);
      toast.error('获取库存列表失败');
    } finally {
      setLoading(false);
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
            <Button variant="outline">
              <MinusCircle className="h-4 w-4 mr-2" />
              库存调拨
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button>
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
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            详情
                          </Button>
                          <Button variant="outline" size="sm">
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
    </MainLayout>
  );
}
