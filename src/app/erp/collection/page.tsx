'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Link2,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Loader2,
  Sparkles,
  Inbox,
  Check,
  X,
  Package,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShoppingCart,
  Scale,
  Tag,
  Store,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// 平台选项
const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'shopee', label: 'Shopee' },
];

export default function CollectionCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [collectUrls, setCollectUrls] = useState('');
  const [collectSource, setCollectSource] = useState('auto');
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // 公用采集箱
  const [publicCollections, setPublicCollections] = useState<any[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 认领弹窗
  
  // 商品详情弹窗
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimItem, setClaimItem] = useState<any>(null);
  const [claimPlatform, setClaimPlatform] = useState('tiktok');
  const [claimLoading, setClaimLoading] = useState(false);
  
  // 统计数据
  const [stats, setStats] = useState({ total: 0, pending: 0, claimed: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadPublicCollections();
  }, [router]);

  // 加载公用采集箱
  const loadPublicCollections = async () => {
    setCollectionLoading(true);
    try {
      const { default: store } = await import('@/lib/store');
      const items = store.getPublicCollections();
      setPublicCollections(items);
      setStats({
        total: items.length,
        pending: items.filter((item: any) => !item.claimed).length,
        claimed: items.filter((item: any) => item.claimed).length,
      });
    } catch (error) {
      console.error('加载采集箱失败:', error);
    } finally {
      setCollectionLoading(false);
    }
  };

  // 预览单个链接
  const handlePreview = async () => {
    const urls = collectUrls.split('\n').filter((u: string) => u.trim());
    const firstUrl = urls[0];
    
    if (!firstUrl || !firstUrl.includes('1688.com')) {
      toast.error('请输入有效的1688商品链接');
      return;
    }

    setPreviewLoading(true);
    try {
      // 获取token
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 调用后端采集API
      const response = await fetch('/api/v1/tools/scrape', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: firstUrl, source: collectSource === 'auto' ? undefined : collectSource }),
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setPreviewData({
          name: data.title || '商品信息',
          price: data.price || 0,
          id: result.productId || '',
          supplier: data.shop_name || '待补充供应商',
          images: data.images || [],
          moq: data.specifications?.起批量 || '待确认',
          sales: data.sales || '待确认',
          price_range: data.price_range || '',
          collect_method: data.collect_method || 'api',
        });
      } else {
        // 采集失败时提供手动输入选项
        setPreviewData({
          name: '',
          price: 0,
          id: '',
          supplier: '',
          images: [],
          moq: '',
          sales: '',
          manual_input: true, // 标记为手动输入模式
        });
        toast.warning('自动采集受限，请手动填写商品信息');
      }
    } catch (error) {
      console.error('预览失败:', error);
      toast.error('预览失败，请检查链接是否正确');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 采集（支持单条和批量）
  const handleCollect = async () => {
    const urls = collectUrls.split('\n').filter((u: string) => u.trim());
    
    if (urls.length === 0) {
      toast.error('请输入1688商品链接');
      return;
    }

    setLoading(true);
    try {
      // 获取token
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let results: any[] = [];
      
      if (urls.length === 1) {
        // 单个采集
        const response = await fetch('/api/v1/tools/scrape', {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: urls[0], source: collectSource === 'auto' ? undefined : collectSource }),
        });
        const result = await response.json();
        if (result.success) {
          results.push({
            url: urls[0],
            ...result.data,
            productId: result.productId,
            source: result.source || '1688',
          });
        } else {
          toast.error(result.error || '采集失败');
          return;
        }
      } else {
        // 批量采集
        const response = await fetch('/api/v1/tools/scrape', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ urls, source: collectSource === 'auto' ? undefined : collectSource }),
        });
        const result = await response.json();
        if (result.success && result.results) {
          results = result.results.map((r: any, i: number) => ({
            url: urls[i],
            ...r.data,
            productId: r.productId,
            source: r.source || '1688',
          }));
        } else {
          toast.error(result.error || '批量采集失败');
          return;
        }
      }

      if (results.length === 0) {
        toast.error('采集失败，请检查链接是否正确');
        return;
      }

      // 保存到公用采集箱
      const { default: store } = await import('@/lib/store');
      
      const collectData = results.map((item: any) => ({
        collection_id: `COL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product_id: item.productId || '',
        source_url: item.url,
        product_name: item.title || '待补充商品名称',
        product_name_en: '',
        source: '1688' as const,
        supplier_name: item.shop_name || '待补充供应商',
        supplier_url: item.shop_url || '',
        cost_price: item.price || 0,
        price_range: item.price_range || '',
        main_image: item.main_image || (item.images && item.images[0]) || '',
        images: item.images || [],
        category: item.specifications?.类目 || item.category || '',
        specifications: item.specifications || {},
        skus: item.skus || [],
        sales: item.sales || 0,
        min_order: item.min_order || 1,
        weight: item.weight,
        location: item.location || '',
        description: item.description || '',
        collect_method: item.collect_method || 'alibaba_api',
      }));

      collectData.forEach((item: any) => {
        store.addToPublicCollection(item);
      });

      toast.success(`成功采集 ${collectData.length} 个商品`);
      setCollectUrls('');
      setPreviewData(null);
      loadPublicCollections();
    } catch (error) {
      console.error('采集失败:', error);
      toast.error('采集失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    const unclaimed = publicCollections.filter((item: any) => !item.claimed);
    if (selectedItems.length === unclaimed.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(unclaimed.map((item: any) => item.id));
    }
  };

  // 打开商品详情弹窗
  const openDetailDialog = (item: any) => {
    setDetailItem(item);
    setDetailImageIndex(0);
    setDetailDialogOpen(true);
  };

  // 打开认领弹窗
  const openClaimDialog = (item?: any) => {
    setClaimItem(item);
    setClaimDialogOpen(true);
  };

  // 认领到店铺
  const handleViewDetail = (item: any) => {
    setDetailItem(item);
    setDetailDialogOpen(true);
  };

  const handleClaimToShop = async () => {
    setClaimLoading(true);
    try {
      const { default: store } = await import('@/lib/store');
      
      if (claimItem) {
        store.claimPublicCollection(claimItem.id, claimPlatform, PLATFORMS.find(p => p.value === claimPlatform)?.label || '');
        toast.success(`已认领到 ${PLATFORMS.find(p => p.value === claimPlatform)?.label}`);
      } else {
        for (const id of selectedItems) {
          store.claimPublicCollection(id, claimPlatform, PLATFORMS.find(p => p.value === claimPlatform)?.label || '');
        }
        toast.success(`已将 ${selectedItems.length} 个商品认领到 ${PLATFORMS.find(p => p.value === claimPlatform)?.label}`);
        setSelectedItems([]);
      }
      
      setClaimDialogOpen(false);
      loadPublicCollections();
    } catch (error) {
      console.error('认领失败:', error);
      toast.error('认领失败');
    } finally {
      setClaimLoading(false);
    }
  };

  // 删除商品
  const handleDelete = async (id: string) => {
    try {
      const { default: store } = await import('@/lib/store');
      store.removePublicCollection(id);
      toast.success('已删除');
      loadPublicCollections();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedItems.length} 个商品吗？`)) return;
    
    try {
      const { default: store } = await import('@/lib/store');
      for (const id of selectedItems) {
        store.removePublicCollection(id);
      }
      toast.success(`已删除 ${selectedItems.length} 个商品`);
      setSelectedItems([]);
      loadPublicCollections();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  if (!user) return null;

  const urlCount = collectUrls.split('\n').filter((u: string) => u.trim()).length;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 flex items-center justify-center">
              <Inbox className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">采集中心</h1>
              <p className="text-[14px] text-muted-foreground">采集1688商品 · 公用采集箱 · 认领到店铺</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/platform/miaoshou">
                <Settings className="h-4 w-4 mr-2" />
                配置妙手ERP
              </Link>
            </Button>
            <Button variant="outline" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              支持批量采集
            </Button>
          </div>
        </div>

        {/* 统计卡片 - 工作台风格 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Inbox className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">采集箱总量</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.total}</p>
                  <p className="text-[11px] text-muted-foreground">全部商品</p>
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
                  <p className="text-[12px] text-muted-foreground">待认领</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{stats.pending}</p>
                  <p className="text-[11px] text-amber-600">需认领</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">已认领</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.claimed}</p>
                  <p className="text-[11px] text-green-600">已完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 采集输入区 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Link2 className="h-4 w-4 text-orange-500" />
              采集1688商品
            </CardTitle>
            <CardDescription>支持单条或多条链接采集（每行一个链接）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 采集来源选择 */}
            <div className="flex items-center gap-4 pb-3 border-b border-border">
              <span className="text-[13px] text-muted-foreground">采集来源：</span>
              <Select value={collectSource} onValueChange={setCollectSource}>
                <SelectTrigger className="w-[200px] h-8 text-[13px]">
                  <SelectValue placeholder="选择采集来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      自动选择
                    </div>
                  </SelectItem>
                  <SelectItem value="miaoshou">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      妙手ERP
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {collectSource === 'miaoshou' && (
                <Link href="/platform/miaoshou" className="text-[12px] text-blue-500 hover:underline">
                  配置妙手ERP
                </Link>
              )}
            </div>
            
            <textarea
              className="w-full h-32 p-3 border border-border rounded-md text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="每行一个1688商品链接&#10;例如:&#10;https://detail.1688.com/offer/xxx1.html&#10;https://detail.1688.com/offer/xxx2.html"
              value={collectUrls}
              onChange={(e) => setCollectUrls(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">
                已输入 {urlCount} 个链接
                {urlCount > 1 && <span className="ml-2 text-orange-500">（批量采集模式）</span>}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview} disabled={previewLoading || urlCount === 0}>
                  {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  预览
                </Button>
                <Button onClick={handleCollect} disabled={loading || urlCount === 0}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  采集{urlCount > 1 ? `（${urlCount}个）` : ''}
                </Button>
              </div>
            </div>

            {/* 预览数据 */}
            {previewData && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-3 border border-border">
                {previewData.manual_input ? (
                  // 手动输入模式
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-orange-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-[13px] font-medium">自动采集受限，请手动填写商品信息</span>
                    </div>
                    <Input 
                      placeholder="商品名称"
                      value={previewData.name || ''}
                      onChange={(e) => setPreviewData({...previewData, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        type="number"
                        placeholder="价格"
                        value={previewData.price || ''}
                        onChange={(e) => setPreviewData({...previewData, price: e.target.value})}
                      />
                      <Input 
                        placeholder="供应商名称"
                        value={previewData.supplier || ''}
                        onChange={(e) => setPreviewData({...previewData, supplier: e.target.value})}
                      />
                    </div>
                    <Input 
                      placeholder="商品ID（可选）"
                      value={previewData.id || ''}
                      onChange={(e) => setPreviewData({...previewData, id: e.target.value})}
                    />
                  </div>
                ) : (
                  // 自动采集模式
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      {previewData.images?.[0] ? (
                        <img src={previewData.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-[14px] font-medium text-foreground line-clamp-2">
                        {previewData.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-semibold text-orange-500">¥{previewData.price}</span>
                        {previewData.price_range && previewData.price_range !== String(previewData.price) && (
                          <span className="text-[12px] text-muted-foreground">（{previewData.price_range}）</span>
                        )}
                        <span className="text-[12px] text-muted-foreground">ID: {previewData.id}</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        供应商: {previewData.supplier} · {previewData.moq} · 已售 {previewData.sales}
                      </div>
                    </div>
                  </div>
                )}
                <Button onClick={handleCollect} disabled={loading} className="w-full" variant="outline">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  采集到公用采集箱
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 公用采集箱 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-orange-500" />
                  公用采集箱
                </CardTitle>
                <CardDescription>采集完成的商品，可以认领到店铺</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadPublicCollections}>
                刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {collectionLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : publicCollections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>公用采集箱为空</p>
                <p className="text-[12px] mt-1">采集1688商品后，商品将显示在这里</p>
              </div>
            ) : (
              <>
                {/* 批量操作栏 */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === publicCollections.filter((item: any) => !item.claimed).length && publicCollections.filter((item: any) => !item.claimed).length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-[13px] text-muted-foreground">
                        全选 {selectedItems.length > 0 && `(${selectedItems.length})`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openClaimDialog()}
                      disabled={selectedItems.length === 0}
                    >
                      认领到店铺
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBatchDelete}
                      disabled={selectedItems.length === 0}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>

                {/* 商品列表 */}
                <div className="space-y-3">
                  {publicCollections.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {!item.claimed && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(selectedItems.filter((id: string) => id !== item.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 flex-shrink-0"
                        />
                      )}
                      {/* 商品缩略图 */}
                      <div className="w-14 h-14 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        {item.main_image || (item.images && item.images[0]) ? (
                          <img
                            src={item.main_image || item.images[0]}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-foreground line-clamp-1">
                          {item.product_name || '未知商品'}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[14px] font-semibold text-orange-500">¥{item.cost_price || item.price || '0.00'}</span>
                          {item.price_range && String(item.price_range) !== String(item.cost_price) && (
                            <span className="text-[12px] text-muted-foreground">（{item.price_range}）</span>
                          )}
                          <span className="text-[12px] text-muted-foreground">
                            {item.supplier_name || '未知供应商'}
                          </span>
                          {item.category && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {item.sales > 0 && (
                            <span className="text-[11px] text-muted-foreground">已售 {item.sales}</span>
                          )}
                          {item.min_order > 1 && (
                            <span className="text-[11px] text-muted-foreground">{item.min_order}件起批</span>
                          )}
                          {item.location && (
                            <span className="text-[11px] text-muted-foreground">{item.location}</span>
                          )}
                          {item.collect_method === 'alibaba_api' && (
                            <span className="text-[11px] text-green-600">API采集</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.claimed ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已认领 {item.claimed_platform}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            待认领
                          </Badge>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailDialog(item)}
                          >
                            详情
                          </Button>
                          {!item.claimed && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openClaimDialog(item)}
                              >
                                认领
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 商品详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[16px] line-clamp-2 pr-8">
              {detailItem?.product_name || '商品详情'}
            </DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-5">
              {/* 图片轮播 */}
              {detailItem.images && detailItem.images.length > 0 && (
                <div className="relative bg-muted/30 rounded-lg overflow-hidden">
                  <div className="aspect-[4/3] flex items-center justify-center">
                    <img
                      src={detailItem.images[detailImageIndex]}
                      alt={`${detailItem.product_name} - ${detailImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {detailItem.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setDetailImageIndex(prev => prev > 0 ? prev - 1 : detailItem.images.length - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDetailImageIndex(prev => prev < detailItem.images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[11px] px-2 py-0.5 rounded-full">
                        {detailImageIndex + 1} / {detailItem.images.length}
                      </div>
                    </>
                  )}
                  {/* 缩略图列表 */}
                  {detailItem.images.length > 1 && (
                    <div className="flex gap-1.5 p-2 overflow-x-auto bg-muted/20">
                      {detailItem.images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setDetailImageIndex(idx)}
                          className={`w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${idx === detailImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
                  <Tag className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">价格</div>
                    <div className="text-[14px] font-semibold text-orange-500">
                      ¥{detailItem.cost_price || '0.00'}
                      {detailItem.price_range && String(detailItem.price_range) !== String(detailItem.cost_price) && (
                        <span className="text-[12px] text-muted-foreground font-normal ml-1">（{detailItem.price_range}）</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
                  <Store className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">供应商</div>
                    <div className="text-[13px] truncate max-w-[200px]">
                      {detailItem.supplier_url ? (
                        <a href={detailItem.supplier_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {detailItem.supplier_name || '查看店铺'}
                        </a>
                      ) : (
                        detailItem.supplier_name || '未知'
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">起订量 / 销量</div>
                    <div className="text-[13px]">{detailItem.min_order || 1}件起批 · 已售{detailItem.sales || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
                  {detailItem.location ? <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" /> : <Scale className="h-4 w-4 text-purple-500 flex-shrink-0" />}
                  <div>
                    <div className="text-[11px] text-muted-foreground">{detailItem.location ? '发货地' : '重量'}</div>
                    <div className="text-[13px]">
                      {detailItem.location || (detailItem.weight ? `${detailItem.weight}kg` : '未知')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 类目标签 */}
              {detailItem.category && (
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground">类目:</span>
                  <Badge variant="secondary" className="text-[12px]">{detailItem.category}</Badge>
                  <span className="text-[12px] text-muted-foreground ml-2">来源:</span>
                  <Badge variant="outline" className="text-[12px]">{detailItem.source || '1688'}</Badge>
                  {detailItem.collect_method && (
                    <>
                      <span className="text-[12px] text-muted-foreground ml-2">方式:</span>
                      <Badge variant="outline" className="text-[12px] text-green-600">{detailItem.collect_method === 'alibaba_api' ? 'API' : detailItem.collect_method}</Badge>
                    </>
                  )}
                </div>
              )}

              {/* 商品属性 */}
              {detailItem.specifications && Object.keys(detailItem.specifications).length > 0 && (
                <div>
                  <h4 className="text-[13px] font-medium mb-2 flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    商品属性
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(detailItem.specifications).map(([key, value]) => (
                      <div key={key} className="flex text-[12px] py-1 px-2 bg-muted/20 rounded">
                        <span className="text-muted-foreground mr-2 flex-shrink-0">{key}:</span>
                        <span className="text-foreground truncate">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SKU列表 */}
              {detailItem.skus && detailItem.skus.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-medium mb-2 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    SKU规格 ({detailItem.skus.length}个)
                  </h4>
                  <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                    <table className="w-full text-[12px]">
                      <thead className="bg-muted/30 sticky top-0">
                        <tr>
                          <th className="text-left py-1.5 px-2 font-medium">规格名称</th>
                          <th className="text-right py-1.5 px-2 font-medium">价格</th>
                          <th className="text-right py-1.5 px-2 font-medium">库存</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailItem.skus.slice(0, 50).map((sku: any, idx: number) => (
                          <tr key={sku.sku_id || idx} className="border-t">
                            <td className="py-1.5 px-2 max-w-[300px] truncate">{sku.name || '-'}</td>
                            <td className="py-1.5 px-2 text-right text-orange-500 font-medium">¥{sku.price || '-'}</td>
                            <td className="py-1.5 px-2 text-right">{sku.stock ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {detailItem.skus.length > 50 && (
                      <div className="text-center py-1.5 text-[11px] text-muted-foreground border-t">
                        还有 {detailItem.skus.length - 50} 个规格未显示
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 源链接 */}
              {detailItem.source_url && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground">来源链接:</span>
                  <a
                    href={detailItem.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-blue-600 hover:underline truncate max-w-[400px]"
                  >
                    {detailItem.source_url}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 认领弹窗 */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {claimItem ? '认领商品' : `认领 ${selectedItems.length} 个商品`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[14px] font-medium">认领到平台</label>
              <Select value={claimPlatform} onValueChange={setClaimPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleClaimToShop} disabled={claimLoading} className="w-full">
              {claimLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              确认认领
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
