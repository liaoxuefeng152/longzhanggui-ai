'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  // 广告数据
  const adStats = {
    spend: 350,
    ctr: 2.5,
    cvr: 3.2,
    roi: 1.8,
  };

  // 广告列表
  const adList = [
    { 
      id: 1, 
      name: '宠物饮水机', 
      spend: 120, 
      orders: 8, 
      acos: 45, 
      status: 'needs_optimization' 
    },
    { 
      id: 2, 
      name: '蓝牙耳机', 
      spend: 80, 
      orders: 12, 
      acos: 22, 
      status: 'normal' 
    },
    { 
      id: 3, 
      name: '智能手环', 
      spend: 95, 
      orders: 6, 
      acos: 52, 
      status: 'needs_optimization' 
    },
    { 
      id: 4, 
      name: '便携榨汁杯', 
      spend: 55, 
      orders: 10, 
      acos: 18, 
      status: 'normal' 
    },
  ];

  // 查看诊断
  const handleViewDiagnosis = (ad: any) => {
    setSelectedAd(ad);
    setShowDiagnosis(true);
  };

  // 去平台优化
  const handleGoOptimize = () => {
    setShowDiagnosis(false);
    toast.success('已跳转到平台优化页面（模拟）');
  };

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#165DFF]" />
              广告优化
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              同步最新数据
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              生成周报
            </Button>
          </div>
        </div>

        {/* 数据概览 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">今日花费</p>
              <p className="text-3xl font-bold text-foreground">
                ${adStats.spend.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingDown className="h-3 w-3" />
                -5%
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">点击率CTR</p>
              <p className="text-3xl font-bold text-foreground">
                {adStats.ctr}%
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" />
                +0.3%
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">转化率CVR</p>
              <p className="text-3xl font-bold text-foreground">
                {adStats.cvr}%
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" />
                +0.5%
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">ROI</p>
              <p className="text-3xl font-bold text-foreground">
                {adStats.roi}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" />
                +0.2
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 广告列表 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">广告列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground">广告名称</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-28">花费</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-24">订单数</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-24">ACOS</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-24">状态</th>
                    <th className="text-left px-6 py-3 text-[12px] font-medium text-muted-foreground w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {adList.map((ad) => (
                    <tr key={ad.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 text-[14px]">{ad.name}</td>
                      <td className="px-6 py-4 text-[14px]">${ad.spend}</td>
                      <td className="px-6 py-4 text-[14px]">{ad.orders}</td>
                      <td className={`px-6 py-4 text-[14px] font-medium ${ad.acos > 40 ? 'text-red-600' : 'text-green-600'}`}>
                        {ad.acos}%
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            ad.status === 'normal'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }
                        >
                          {ad.status === 'normal' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              正常
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              需优化
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          size="sm" 
                          variant={ad.status === 'normal' ? 'ghost' : 'default'}
                          onClick={() => handleViewDiagnosis(ad)}
                        >
                          {ad.status === 'normal' ? '查看' : '诊断'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 诊断弹窗 */}
        <Dialog open={showDiagnosis} onOpenChange={setShowDiagnosis}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                AI诊断报告 - {selectedAd?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* 问题诊断 */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-[14px] text-orange-800">
                  问题诊断：ACOS过高（{selectedAd?.acos}%，目标 &lt; 30%）
                </p>
              </div>

              {/* 原因分析 */}
              <div>
                <h4 className="text-[14px] font-medium mb-3">原因分析</h4>
                <div className="space-y-2 text-[14px]">
                  <p>1. 点击率偏低：2.0%（行业均值 3.0%）→ 建议优化主图</p>
                  <p>2. 出价过高：$0.80 → 建议降到 $0.60</p>
                  <p>3. 关键词不精准：部分词转化率低 → 建议暂停低转化词</p>
                </div>
              </div>

              {/* 优化建议 */}
              <div>
                <h4 className="text-[14px] font-medium mb-3">优化建议</h4>
                <div className="space-y-2 text-[14px]">
                  <p>• 主图：更换高点击的图片</p>
                  <p>• 出价：从 $0.80 降到 $0.60</p>
                  <p>• 关键词：暂停 CTR &lt; 1% 的5个词</p>
                  <p>• 预算：保持不变，观察效果</p>
                </div>
              </div>

              {/* 预期效果 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-[14px] text-green-800">
                  预期效果：ACOS 从 {selectedAd?.acos}% 降到 30% 左右
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDiagnosis(false)}>
                关闭
              </Button>
              <Button onClick={handleGoOptimize}>
                <ExternalLink className="h-4 w-4 mr-2" />
                去平台优化
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

// 缺少的组件导入
function CheckCircle({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>;
}
