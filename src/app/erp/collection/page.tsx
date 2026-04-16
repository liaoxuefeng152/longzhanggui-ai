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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Search,
  Download,
  Plus,
  Link2,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Eye,
  ExternalLink,
  Loader2,
  Sparkles,
  ShoppingCart,
  Store,
  Inbox,
  ImageIcon,
  DollarSign,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// 平台选项
const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok Shop', icon: '📱' },
  { value: 'amazon', label: 'Amazon', icon: '📦' },
  { value: 'shopee', label: 'Shopee', icon: '🛒' },
];

export default function CollectionCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // 单链接采集
  const [collectUrl, setCollectUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  // 批量采集
  const [batchUrls, setBatchUrls] = useState('');
  
  // 公用采集箱
  const [publicCollections, setPublicCollections] = useState<any[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 认领弹窗
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimItem, setClaimItem] = useState<any>(null);
  const [claimPlatform, setClaimPlatform] = useState('tiktok');
  const [claimLoading, setClaimLoading] = useState(false);
  
  // 统计数据
  const [stats, setStats] = useState({ total: 0, pending: 0, claimed: 0 });

  // 加载数据
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
      const allItems = store.getPublicCollections();
      
      // 如果没有数据，添加一些示例数据
      if (allItems.length === 0) {
        // 添加示例数据
        const exampleItems = [
          {
            collection_id: 'COL001',
            product_id: 'PROD001',
            product_name: '宠物自动饮水机 3.5L',
            product_name_en: 'Pet Water Fountain 3.5L',
            source: '1688' as const,
            source_url: 'https://detail.1688.com/offer/1234567890.html',
            source_id: '1234567890',
            supplier_name: '义乌宠物用品厂',
            cost_price: 45,
            images: ['https://picsum.photos/200'],
            category: '宠物用品',
          },
          {
            collection_id: 'COL002',
            product_id: 'PROD002',
            product_name: '无线蓝牙耳机 降噪款',
            product_name_en: 'Wireless Bluetooth Earbuds',
            source: '1688' as const,
            source_url: 'https://detail.1688.com/offer/2345678901.html',
            source_id: '2345678901',
            supplier_name: '深圳电子科技',
            cost_price: 68,
            images: ['https://picsum.photos/201'],
            category: '数码配件',
          },
          {
            collection_id: 'COL003',
            product_id: 'PROD003',
            product_name: '便携式榨汁杯 USB充电',
            product_name_en: 'Portable Juice Cup USB',
            source: '1688' as const,
            source_url: 'https://detail.1688.com/offer/3456789012.html',
            source_id: '3456789012',
            supplier_name: '广州小家电',
            cost_price: 35,
            images: ['https://picsum.photos/202'],
            category: '厨房用品',
          },
        ];
        
        exampleItems.forEach(item => {
          store.addToPublicCollection(item);
        });
        
        setPublicCollections(store.getPublicCollections());
        setStats(store.getPublicCollectionStats());
      } else {
        setPublicCollections(allItems);
        setStats(store.getPublicCollectionStats());
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setCollectionLoading(false);
    }
  };

  // 预览采集
  const handlePreview = async () => {
    if (!collectUrl) {
      toast.error('请输入1688商品链接');
      return;
    }

    if (!collectUrl.includes('1688.com')) {
      toast.error('请输入有效的1688商品链接');
      return;
    }

    setPreviewLoading(true);
    try {
      // 模拟预览数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPreviewData({
        name: '示例商品名称',
        price: 59.9,
        id: '1234567890',
        supplier: '示例供应商',
        images: ['https://picsum.photos/300'],
      });
      toast.success('预览成功');
    } catch (error) {
      console.error('预览失败:', error);
      toast.error('预览失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 确认采集
  const handleCollect = async () => {
    if (!collectUrl) {
      toast.error('请输入1688商品链接');
      return;
    }

    setLoading(true);
    try {
      const { default: store } = await import('@/lib/store');
      
      // 添加到公用采集箱
      store.addToPublicCollection({
        collection_id: `COL-${Date.now()}`,
        product_id: `PROD-${Date.now()}`,
        product_name: previewData?.name || '采集商品',
        source: '1688',
        source_url: collectUrl,
        source_id: previewData?.id,
        supplier_name: previewData?.supplier,
        cost_price: previewData?.price,
        images: previewData?.images,
      });
      
      toast.success('采集成功，已添加到公用采集箱');
      setCollectUrl('');
      setPreviewData(null);
      loadPublicCollections();
    } catch (error) {
      console.error('采集失败:', error);
      toast.error('采集失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量采集
  const handleBatchCollect = async () => {
    if (!batchUrls.trim()) {
      toast.error('请输入商品链接');
      return;
    }

    const urls = batchUrls.split('\n').filter((url: string) => url.trim());
    if (urls.length === 0) {
      toast.error('请输入至少一个有效的商品链接');
      return;
    }

    setLoading(true);
    try {
      const { default: store } = await import('@/lib/store');
      
      // 模拟批量添加
      for (let i = 0; i < urls.length; i++) {
        store.addToPublicCollection({
          collection_id: `COL-${Date.now()}-${i}`,
          product_id: `PROD-${Date.now()}-${i}`,
          product_name: `批量采集商品 ${i + 1}`,
          source: '1688',
          source_url: urls[i],
        });
      }
      
      toast.success(`批量采集完成，成功添加 ${urls.length} 个商品`);
      setBatchUrls('');
      loadPublicCollections();
    } catch (error) {
      console.error('批量采集失败:', error);
      toast.error('批量采集失败');
    } finally {
      setLoading(false);
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedItems.length === publicCollections.filter(item => !item.claimed).length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(publicCollections.filter(item => !item.claimed).map(item => item.id));
    }
  };

  // 单选
  const handleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 打开认领弹窗
  const openClaimDialog = (item?: any) => {
    setClaimItem(item);
    setClaimDialogOpen(true);
  };

  // 认领到店铺
  const handleClaimToShop = async () => {
    setClaimLoading(true);
    try {
      const { default: store } = await import('@/lib/store');
      
      if (claimItem) {
        // 单个认领
        store.claimPublicCollection(claimItem.id, claimPlatform, PLATFORMS.find(p => p.value === claimPlatform)?.label || '');
        
        // 同时添加到商品的platform_listings
        const product = store.getProduct(claimItem.product_id);
        if (product) {
          const newListing = {
            id: `PL-${Date.now()}`,
            platform: claimPlatform,
            shop_id: `${claimPlatform}-${Date.now()}`,
            shop_name: PLATFORMS.find(p => p.value === claimPlatform)?.label || claimPlatform,
            status: 'draft' as const,
            listing_title: claimItem.product_name_en || claimItem.product_name,
          };
          store.updateProduct(claimItem.product_id, {
            platform_listings: [...(product.platform_listings || []), newListing as any],
          });
        }
        
        toast.success(`已认领到 ${PLATFORMS.find(p => p.value === claimPlatform)?.label}`);
      } else {
        // 批量认领
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
    if (selectedItems.length === 0) {
      toast.error('请选择要删除的商品');
      return;
    }
    
    try {
      const { default: store } = await import('@/lib/store');
      selectedItems.forEach(id => store.removePublicCollection(id));
      toast.success(`已删除 ${selectedItems.length} 个商品`);
      setSelectedItems([]);
      loadPublicCollections();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  // 查看商品详情
  const handleViewProduct = (productId: string) => {
    router.push(`/erp/products/${productId}`);
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="container py-6 space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#FF7D00]500/10 flex items-center justify-center">
              <Inbox className="h-7 w-7 text-[#FF7D00]500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">采集中心</h1>
              <p className="text-[14px] text-muted-foreground">采集1688商品 · 公用采集箱 · 认领到店铺</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-[#FF7D00]500/10 text-[#FF7D00]500 border-orange-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              支持批量采集
            </Badge>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground">采集箱总量</p>
                  <p className="text-[24px] font-semibold">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#FF7D00]500/10 flex items-center justify-center">
                  <Inbox className="h-5 w-5 text-[#FF7D00]500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground">待认领</p>
                  <p className="text-[24px] font-semibold text-yellow-500">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground">已认领</p>
                  <p className="text-[24px] font-semibold text-success">{stats.claimed}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#00B42A]500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-[#00B42A]500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[#FF7D00]500" />
                单链接采集
              </CardTitle>
              <CardDescription>输入1688商品链接，采集商品信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://detail.1688.com/offer/xxx.html"
                  value={collectUrl}
                  onChange={(e) => setCollectUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handlePreview} disabled={previewLoading}>
                  {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  预览
                </Button>
                <Button onClick={handleCollect} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  采集
                </Button>
              </div>
              <p className="text-[12px] text-muted-foreground">
                提示：点击「预览」可先查看商品信息再确认采集，点击「采集」直接采集到公用采集箱
              </p>

              {/* 预览数据 */}
              {previewData && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                      {previewData.images?.[0] && (
                        <img src={previewData.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-[14px] font-medium text-foreground line-clamp-2">
                        {previewData.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-semibold text-[#FF7D00]500">¥{previewData.price}</span>
                        <span className="text-[12px] text-muted-foreground">ID: {previewData.id}</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        供应商: {previewData.supplier}
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleCollect} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    采集到公用采集箱
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Package className="h-4 w-4 text-[#FF7D00]500" />
                批量采集
              </CardTitle>
              <CardDescription>批量输入链接，一键采集多个商品</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-32 p-3 border border-border rounded-md text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="每行一个1688商品链接&#10;例如:&#10;https://detail.1688.com/offer/xxx1.html&#10;https://detail.1688.com/offer/xxx2.html"
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">
                  已输入 {batchUrls.split('\n').filter((u: string) => u.trim()).length} 个链接
                </span>
                <Button onClick={handleBatchCollect} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  批量采集
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 公用采集箱 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-[#FF7D00]500" />
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
                        checked={selectedItems.length === publicCollections.filter(item => !item.claimed).length && publicCollections.filter(item => !item.claimed).length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-[13px] text-muted-foreground">
                        全选 ({selectedItems.length}/{publicCollections.filter(item => !item.claimed).length})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItems.length > 0 && (
                      <>
                        <Button size="sm" onClick={() => openClaimDialog()}>
                          <Store className="h-3 w-3 mr-1" />
                          批量认领 ({selectedItems.length})
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={handleBatchDelete}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          批量删除
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 商品列表 */}
                <div className="space-y-3">
                  {publicCollections.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        item.claimed 
                          ? 'bg-muted/30 border-muted' 
                          : 'hover:bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* 选择框 */}
                        {!item.claimed && (
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelect(item.id)}
                            className="mt-6 w-4 h-4 rounded border-gray-300"
                          />
                        )}
                        
                        {/* 图片 */}
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                            </div>
                          )}
                        </div>
                        
                        {/* 商品信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-[#FF7D00]500 font-medium">
                                  {item.source === '1688' ? '1688' : item.source === 'taobao' ? '淘宝' : '拼多多'}
                                </span>
                                {item.category && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {item.category}
                                  </Badge>
                                )}
                                {item.claimed ? (
                                  <Badge className="bg-success/10 text-success text-[10px]">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    已认领
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    待认领
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[14px] font-medium text-foreground">
                                {item.product_name}
                              </div>
                              {item.product_name_en && (
                                <div className="text-[12px] text-muted-foreground">
                                  {item.product_name_en}
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                                {item.supplier_name && (
                                  <span className="flex items-center gap-1">
                                    <Store className="h-3 w-3" />
                                    {item.supplier_name}
                                  </span>
                                )}
                                {item.cost_price && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    ¥{item.cost_price}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* 操作按钮 */}
                            <div className="flex items-center gap-2">
                              {item.claimed ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewProduct(item.product_id)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  查看商品
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-[#FF7D00]500 hover:bg-[#FF7D00]600"
                                    onClick={() => openClaimDialog(item)}
                                  >
                                    <Store className="h-3 w-3 mr-1" />
                                    认领到店铺
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(item.source_url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="bg-[#FF7D00]500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="text-[13px] text-foreground space-y-2">
              <div className="font-medium">📌 使用流程</div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                <li>在「采集中心」采集1688商品，商品进入公用采集箱</li>
                <li>在「公用采集箱」认领商品到目标店铺（如 TikTok Shop）</li>
                <li>认领后可在「商品管理」编辑 Listing、设置定价</li>
                <li>完成编辑后点击「上架发布」，商品将发布到对应平台</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 认领弹窗 */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {claimItem ? '认领到店铺' : `批量认领 (${selectedItems.length}个商品)`}
            </DialogTitle>
            <DialogDescription>
              选择要认领到的目标店铺，认领后可以在店铺下编辑商品信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>目标店铺</Label>
              <Select value={claimPlatform} onValueChange={setClaimPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <span className="flex items-center gap-2">
                        <span>{platform.icon}</span>
                        {platform.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleClaimToShop} disabled={claimLoading}>
              {claimLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Check className="h-4 w-4 mr-2" />
              确认认领
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
