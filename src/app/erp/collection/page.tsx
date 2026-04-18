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
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
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
      // 模拟预览数据
      setPreviewData({
        name: '女士时尚连衣裙 2024新款 夏季轻薄透气',
        price: '45.00',
        id: '628574893012',
        supplier: '杭州时尚服饰有限公司',
        images: ['https://cbu01.alicdn.com/img/ibank/O1CN01xxx.jpg'],
        moq: '2件起批',
        sales: '8888件',
      });
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
      const { default: store } = await import('@/lib/store');
      
      // 模拟采集数据
      const mockData = urls.map((url: string, index: number) => ({
        id: `COL-${Date.now()}-${index}`,
        product_id: `PROD-${Date.now()}-${index}`,
        url,
        product_name: `商品${index + 1} - 模拟采集数据`,
        product_name_en: `Product ${index + 1}`,
        price: (Math.random() * 100 + 20).toFixed(2),
        supplier: '模拟供应商',
        images: [],
        claimed: false,
        claimed_platform: '',
        claimed_at: '',
        created_at: new Date().toISOString(),
      }));

      mockData.forEach((item: any) => {
        store.addToPublicCollection(item);
      });

      toast.success(`成功采集 ${mockData.length} 个商品，已添加到公用采集箱`);
      setCollectUrls('');
      setPreviewData(null);
      loadPublicCollections();
    } catch (error) {
      console.error('采集失败:', error);
      toast.error('采集失败');
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
      <div className="container py-6 space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Inbox className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">采集中心</h1>
              <p className="text-[14px] text-muted-foreground">采集1688商品 · 公用采集箱 · 认领到店铺</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            <Sparkles className="h-3 w-3 mr-1" />
            支持批量采集
          </Badge>
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
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Inbox className="h-5 w-5 text-orange-500" />
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
                  <p className="text-[24px] font-semibold text-green-500">{stats.claimed}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
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
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-[14px] font-medium text-foreground line-clamp-2">
                      {previewData.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-semibold text-orange-500">¥{previewData.price}</span>
                      <span className="text-[12px] text-muted-foreground">ID: {previewData.id}</span>
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      供应商: {previewData.supplier} · {previewData.moq} · 已售 {previewData.sales}
                    </div>
                  </div>
                </div>
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
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      )}
                      <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-foreground line-clamp-1">
                          {item.product_name || '未知商品'}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[14px] font-semibold text-orange-500">¥{item.price || '0.00'}</span>
                          <span className="text-[12px] text-muted-foreground">
                            {item.supplier || '未知供应商'}
                          </span>
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
                      </div>
                      {!item.claimed && (
                        <div className="flex gap-1">
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
