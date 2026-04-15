'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  ListOrdered,
} from 'lucide-react';
import { toast } from 'sonner';
import { collectProduct, previewProduct, batchCollectProducts, getCollectionHistory, CollectionHistory, ProductPreview } from '@/lib/api/collection';
import { store } from '@/lib/store';
import type { CollectionItem } from '@/lib/store';

// Mock数据
const mockHistory: CollectionItem[] = [
  {
    id: 'COL001',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/1234567890.html',
    source_id: '1234567890',
    product_id: 'PROD001',
    status: 'collected',
    created_at: '2026-03-21 14:30:00',
  },
  {
    id: 'COL002',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/2345678901.html',
    source_id: '2345678901',
    product_id: 'PROD002',
    status: 'collected',
    created_at: '2026-03-21 13:15:00',
  },
  {
    id: 'COL003',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/3456789012.html',
    source_id: '3456789012',
    product_id: 'PROD003',
    status: 'collected',
    created_at: '2026-03-20 16:45:00',
  },
  {
    id: 'COL004',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/4567890123.html',
    source_id: '4567890123',
    status: 'pending',
    added_from: 'manual',
    created_at: '2026-03-20 11:20:00',
  },
  {
    id: 'COL005',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/5678901234.html',
    source_id: '5678901234',
    product_id: 'PROD005',
    status: 'collected',
    created_at: '2026-03-19 15:30:00',
  },
  {
    id: 'COL006',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/6789012345.html',
    source_id: '6789012345',
    status: 'failed',
    added_from: 'manual',
    created_at: '2026-03-19 10:00:00',
  },
  {
    id: 'COL007',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/7890123456.html',
    source_id: '7890123456',
    product_id: 'PROD006',
    status: 'collected',
    created_at: '2026-03-18 14:20:00',
  },
  {
    id: 'COL008',
    source: '1688' as const,
    source_url: 'https://detail.1688.com/offer/8901234567.html',
    source_id: '8901234567',
    product_id: 'PROD007',
    status: 'collected',
    created_at: '2026-03-17 09:45:00',
  },
];

export default function Collection1688Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // 单链接采集
  const [collectUrl, setCollectUrl] = useState('');
  const [previewData, setPreviewData] = useState<ProductPreview | null>(null);
  
  // 批量采集
  const [batchUrls, setBatchUrls] = useState('');
  
  // 采集历史
  const [history, setHistory] = useState<CollectionItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // 待采集清单
  const [pendingCollections, setPendingCollections] = useState<CollectionItem[]>([]);

  // 刷新待采集清单
  const refreshPendingCollections = () => {
    setPendingCollections(store.getPendingCollections());
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchHistory();
    refreshPendingCollections();
    
    // 监听storage变化，刷新待采集清单
    const handleStorageChange = () => {
      refreshPendingCollections();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // 定时刷新待采集清单
    const interval = setInterval(refreshPendingCollections, 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getCollectionHistory(1, 20);
      if (data.items && data.items.length > 0) {
        // 转换 CollectionHistory 为 CollectionItem
        const converted: CollectionItem[] = data.items.map((item: any) => ({
          id: item.id,
          source: (item.source as '1688' | 'taobao' | 'pinduoduo') || '1688',
          source_url: item.source_url,
          source_id: item.source_id,
          product_id: item.product_id,
          status: item.status as 'pending' | 'collected' | 'failed',
          added_from: item.added_from as 'selection_agent' | 'manual' || 'manual',
          created_at: item.created_at,
        }));
        setHistory(converted);
      } else {
        setHistory(mockHistory);
      }
    } catch (error) {
      console.error('获取采集历史失败:', error);
      // 使用mock数据
      setHistory(mockHistory);
    } finally {
      setHistoryLoading(false);
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
      const data = await previewProduct(collectUrl);
      if (data.success && data.data) {
        setPreviewData(data.data as any);
        toast.success('预览成功');
      } else {
        toast.error('预览失败');
      }
    } catch (error) {
      console.error('预览失败:', error);
      toast.error('预览失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 确认采集并保存
  const handleCollect = async () => {
    if (!collectUrl) {
      toast.error('请输入1688商品链接');
      return;
    }

    setLoading(true);
    try {
      const data = await collectProduct(collectUrl);
      if (data.success) {
        toast.success('采集成功，已添加到商品库');
        setCollectUrl('');
        setPreviewData(null);
        fetchHistory();
      } else {
        toast.error('采集失败');
      }
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

    const urls = batchUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      toast.error('请输入至少一个有效的商品链接');
      return;
    }

    setLoading(true);
    try {
      const data = await batchCollectProducts(urls);
      if (data.success) {
        toast.success(`批量采集完成，成功${data.total}个`);
        setBatchUrls('');
        fetchHistory();
      }
    } catch (error) {
      console.error('批量采集失败:', error);
      toast.error('批量采集失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      collected: { label: '已采集', className: 'bg-success/10 text-success', icon: CheckCircle },
      pending: { label: '处理中', className: 'bg-warning/10 text-warning', icon: Clock },
      failed: { label: '失败', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
    };
    const { label, className, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant="outline" className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Link2 className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">1688采集中心</h1>
              <p className="text-[14px] text-muted-foreground">采集1688商品 · 自动入库 · 批量处理</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              支持自动采集
            </Badge>
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Link2 className="h-4 w-4 text-orange-500" />
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
                提示：点击「预览」可先查看商品信息再确认采集，点击「采集」直接采集并入库
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
                        <span className="text-[16px] font-semibold text-orange-500">¥{previewData.price}</span>
                        <span className="text-[12px] text-muted-foreground">ID: {previewData.id}</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        供应商: {previewData.supplier}
                      </div>
                    </div>
                  </div>
                  
                  {/* SKU信息 */}
                  {previewData.sku_info && previewData.sku_info.length > 0 && (
                    <div className="space-y-2">
                      {previewData.sku_info.map((sku, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[12px]">
                          <span className="text-muted-foreground">{sku.name}:</span>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[10px]">¥{sku.price} · 库存: {sku.stock}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={handleCollect} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    确认采集并入库
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
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
                  已输入 {batchUrls.split('\n').filter(u => u.trim()).length} 个链接
                </span>
                <Button onClick={handleBatchCollect} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  批量采集
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 采集历史 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px]">采集管理</CardTitle>
                <CardDescription>管理待采集链接和采集历史</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => { fetchHistory(); refreshPendingCollections(); }}>
                刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  待采集清单
                  {pendingCollections.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-[10px]">{pendingCollections.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <ListOrdered className="h-3 w-3" />
                  采集历史
                </TabsTrigger>
              </TabsList>
              
              {/* 待采集清单 */}
              <TabsContent value="pending">
                {pendingCollections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>待采集清单为空</p>
                    <p className="text-[12px] mt-1">从选品智能体添加供应商链接后，将显示在这里</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingCollections.map((item) => (
                      <div key={item.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-orange-500 font-medium">
                                  {item.source === '1688' ? '1688' : item.source === 'taobao' ? '淘宝' : '拼多多'}
                                </span>
                                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">
                                  {item.added_from === 'selection_agent' ? '选品智能体' : '手动添加'}
                                </Badge>
                              </div>
                              <div className="text-[13px] font-medium text-foreground line-clamp-2 max-w-[400px]">
                                {item.product_name || '未命名商品'}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[400px] font-mono">
                                {item.source_url}
                              </div>
                              {item.keyword && (
                                <div className="text-[11px] text-muted-foreground">
                                  选品关键词: {item.keyword}
                                </div>
                              )}
                              <div className="text-[11px] text-muted-foreground">
                                添加时间: {new Date(item.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600"
                              onClick={() => {
                                // 模拟采集
                                store.updatePendingCollection(item.id, { status: 'collected' });
                                toast.success('采集成功');
                                refreshPendingCollections();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              采集
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(item.source_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              查看
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                store.removePendingCollection(item.id);
                                toast.success('已移除');
                                refreshPendingCollections();
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* 批量操作 */}
                    {pendingCollections.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="text-[13px] text-muted-foreground">
                            共 {pendingCollections.length} 个待采集链接
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                pendingCollections.forEach(item => {
                                  store.updatePendingCollection(item.id, { status: 'collected' });
                                });
                                toast.success('全部采集成功');
                                refreshPendingCollections();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              批量采集
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                pendingCollections.forEach(item => {
                                  store.removePendingCollection(item.id);
                                });
                                toast.success('已清空全部');
                                refreshPendingCollections();
                              }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              清空
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {/* 采集历史 */}
              <TabsContent value="history">
                {historyLoading ? (
                  <div className="text-center py-8 text-muted-foreground">加载中...</div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>暂无采集记录</p>
                    <p className="text-[12px] mt-1">输入1688链接开始采集商品</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-muted-foreground font-mono">ID: {item.source_id}</span>
                                {getStatusBadge(item.status)}
                              </div>
                              <div className="text-[13px] text-foreground truncate max-w-[400px]">
                                {item.source_url}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                采集时间: {new Date(item.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(item.source_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              查看1688
                            </Button>
                            {item.product_id && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/erp/products?id=${item.product_id}`)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                商品详情
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="text-[13px] text-foreground space-y-2">
              <div className="font-medium">📌 使用说明</div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>支持采集 1688 商品详情、价格、图片、SKU等信息</li>
                <li>采集的商品会自动保存到 ERP 商品库，状态为"草稿"</li>
                <li>采集后可在「商品管理」中编辑、处理图片、上架</li>
                <li>也可以通过飞书发送"采集 [链接]"指令来触发采集</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
