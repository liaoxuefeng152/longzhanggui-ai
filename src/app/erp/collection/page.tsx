'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface CollectionItem {
  id: string;
  source_url: string;
  source_id: string;
  product_id: string;
  status: string;
  created_at: string;
}

interface ProductPreview {
  offer_id: string;
  title: string;
  price: string;
  images: string[];
  supplier: {
    name: string;
    rating: number;
  };
  skus: Array<{ name: string; values: string[] }>;
}

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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchHistory();
  }, [router]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/1688/history?page=1&page_size=20', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data.items || []);
      }
    } catch (error) {
      console.error('获取采集历史失败:', error);
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/1688/collect/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: collectUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreviewData(data.data);
          toast.success('预览成功');
        } else {
          toast.error('预览失败');
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/1688/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: collectUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('采集成功，已添加到商品库');
          setCollectUrl('');
          setPreviewData(null);
          fetchHistory();
        } else {
          toast.error('采集失败');
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/1688/collect/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ urls }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(`批量采集完成，成功${data.total}个`);
          setBatchUrls('');
          fetchHistory();
        }
      } else {
        toast.error('批量采集失败');
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
              </div>

              {/* 预览数据 */}
              {previewData && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                      {previewData.images[0] && (
                        <img src={previewData.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-[14px] font-medium text-foreground line-clamp-2">
                        {previewData.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-semibold text-orange-500">¥{previewData.price}</span>
                        <span className="text-[12px] text-muted-foreground">ID: {previewData.offer_id}</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        供应商: {previewData.supplier.name}
                      </div>
                    </div>
                  </div>
                  
                  {/* SKU信息 */}
                  {previewData.skus && previewData.skus.length > 0 && (
                    <div className="space-y-2">
                      {previewData.skus.map((sku, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[12px]">
                          <span className="text-muted-foreground">{sku.name}:</span>
                          <div className="flex flex-wrap gap-1">
                            {sku.values.map((v, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{v}</Badge>
                            ))}
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
                <CardTitle className="text-[15px]">采集历史</CardTitle>
                <CardDescription>查看已采集的商品记录</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchHistory}>
                刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
