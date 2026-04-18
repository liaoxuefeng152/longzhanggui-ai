'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Zap,
  Star,
  Gift,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getPackages, Package } from '@/lib/api/packages';

export default function PackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // 获取套餐列表
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await getPackages();
      setPackages(response.packages || []);
    } catch (error) {
      console.error('获取套餐列表失败:', error);
      // 如果API失败，使用默认套餐数据
      setPackages([
        {
          id: 'pkg-trial',
          name: '试用套餐',
          description: '适合个人体验，快速上手',
          price: 0,
          call_limit: 100,
          call_quota: 100,
          duration: 7,
          duration_days: 7,
          features: ['选品智能体', '每日100次调用', '基础客服支持'],
          agent_access: ['product-selection'],
          is_active: true,
          created_at: '',
          updated_at: '',
        } as Package,
        {
          id: 'pkg-basic',
          name: '基础版',
          description: '适合小规模运营',
          price: 99,
          call_limit: 1000,
          call_quota: 1000,
          duration: 30,
          duration_days: 30,
          features: ['选品智能体', '图片设计智能体', '每日1000次调用', '基础客服支持'],
          agent_access: ['product-selection', 'image-design'],
          is_active: true,
          created_at: '',
          updated_at: '',
        } as Package,
        {
          id: 'pkg-pro',
          name: '专业版',
          description: '适合规模化运营',
          price: 299,
          call_limit: 999999,
          call_quota: 999999,
          duration: 30,
          duration_days: 30,
          features: ['全部AI智能体', '无限调用次数', '优先技术支持', '专属客服'],
          agent_access: ['all'],
          is_active: true,
          created_at: '',
          updated_at: '',
        } as Package,
        {
          id: 'pkg-enterprise',
          name: '企业版',
          description: '适合大型团队',
          price: 999,
          call_limit: 999999,
          call_quota: 999999,
          duration: 30,
          duration_days: 30,
          features: ['全部AI智能体', '无限调用次数', '7x24技术支持', '私有化部署支持', 'SLA保障'],
          agent_access: ['all'],
          is_active: true,
          created_at: '',
          updated_at: '',
        } as Package,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchPackages();
  }, [router]);

  // 获取套餐图标
  const getTypeIcon = (name: string) => {
    if (name.includes('试用')) return Gift;
    if (name.includes('基础')) return Star;
    if (name.includes('专业') || name.includes('Pro')) return Zap;
    if (name.includes('企业')) return Crown;
    return Star;
  };

  // 获取套餐颜色
  const getTypeColor = (name: string) => {
    if (name.includes('试用')) return 'bg-muted text-muted-foreground';
    if (name.includes('基础')) return 'bg-blue-500/10 text-blue-600';
    if (name.includes('专业') || name.includes('Pro')) return 'bg-primary/10 text-primary';
    if (name.includes('企业')) return 'bg-amber-500/10 text-amber-600';
    return 'bg-muted';
  };

  // 购买套餐
  const handlePurchase = (pkg: Package) => {
    setSelectedPackage(pkg.id);
    toast.success(`已选择 ${pkg.name}，即将跳转到支付页面...`);
    
    // 模拟支付流程
    setTimeout(() => {
      toast.success(`${pkg.name} 购买成功！`);
      setSelectedPackage(null);
    }, 1500);
  };

  const handleLogout = async () => {
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 flex items-center justify-center">
              <Crown className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">选择适合您的套餐</h1>
              <p className="text-[14px] text-muted-foreground">
                灵活定价，畅享AI智能体带来的效率提升
              </p>
            </div>
          </div>
        </div>

        {/* 当前订阅状态 */}
        <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[14px] font-medium">当前订阅：试用套餐</p>
                  <p className="text-[12px] text-muted-foreground">剩余 7 天 · 今日已用 23/100 次调用</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                有效
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无可用套餐
          </div>
        ) : (
          /* 套餐卡片展示 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const Icon = getTypeIcon(pkg.name);
              const isRecommended = pkg.name.includes('专业') || pkg.name.includes('Pro');
              const isPurchasing = selectedPackage === pkg.id;
              
              return (
                <Card 
                  key={pkg.id} 
                  className={`bg-white border-border shadow-sm relative overflow-hidden transition-all ${
                    isRecommended ? 'ring-2 ring-primary shadow-lg' : ''
                  } ${selectedPackage === pkg.id ? 'scale-105' : ''}`}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[11px] px-3 py-1 rounded-bl-lg font-medium">
                      推荐
                    </div>
                  )}
                  <CardHeader className="text-center pb-4 pt-6">
                    <div className={`w-14 h-14 rounded-full ${getTypeColor(pkg.name)} mx-auto flex items-center justify-center mb-3`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-[18px]">{pkg.name}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="text-[28px] font-bold text-foreground">¥{pkg.price}</span>
                      {pkg.price > 0 && <span className="text-[13px] text-muted-foreground">/月</span>}
                    </CardDescription>
                    {pkg.description && (
                      <p className="text-[12px] text-muted-foreground mt-2">{pkg.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      {pkg.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[13px]">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      className={`w-full mt-4 ${isRecommended ? '' : 'variant-outline'}`}
                      variant={isRecommended ? 'default' : 'outline'}
                      disabled={isPurchasing || pkg.price === 0}
                      onClick={() => handlePurchase(pkg)}
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : pkg.price === 0 ? (
                        '当前使用'
                      ) : (
                        '立即购买'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 常见问题 */}
        <Card className="bg-white border-border shadow-sm mt-8">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-[15px] font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              常见问题
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[14px] font-medium mb-2">如何升级套餐？</h4>
                <p className="text-[13px] text-muted-foreground">
                  选择心仪的套餐后，点击"立即购买"即可完成支付升级。升级后立即生效剩余时间按比例抵扣。
                </p>
              </div>
              <div>
                <h4 className="text-[14px] font-medium mb-2">可以退款吗？</h4>
                <p className="text-[13px] text-muted-foreground">
                  购买后7天内如需退款，请联系客服处理。超过7天的订单不支持退款，但可申请延期服务。
                </p>
              </div>
              <div>
                <h4 className="text-[14px] font-medium mb-2">调用次数用完怎么办？</h4>
                <p className="text-[13px] text-muted-foreground">
                  每日调用次数于次日重置。如需更多调用额度，可升级到更高套餐或联系客服购买额外包。
                </p>
              </div>
              <div>
                <h4 className="text-[14px] font-medium mb-2">企业版有什么特权？</h4>
                <p className="text-[13px] text-muted-foreground">
                  企业版提供7x24技术支持、私有化部署选项、SLA服务保障，以及专属客户经理服务。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
