'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Smartphone,
  Building2,
  Check,
  Loader2,
  ArrowLeft,
  Shield,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface PackageInfo {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // 从URL参数获取套餐信息
    const pkgId = searchParams.get('package');
    const pkgName = searchParams.get('name');
    const pkgPrice = searchParams.get('price');
    const pkgDuration = searchParams.get('duration');

    if (pkgId && pkgName && pkgPrice && pkgDuration) {
      setPackageInfo({
        id: pkgId,
        name: decodeURIComponent(pkgName),
        price: parseFloat(pkgPrice),
        duration: parseInt(pkgDuration),
        features: [],
      });
    } else {
      toast.error('套餐信息不完整');
      router.push('/packages');
    }
  }, [router, searchParams]);

  // 计算最终价格
  const finalPrice = packageInfo ? Math.max(0, packageInfo.price - discount) : 0;

  // 应用优惠码
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('请输入优惠码');
      return;
    }
    // 模拟优惠码验证
    if (couponCode.toUpperCase() === 'ZHANGGUI2024') {
      setDiscount(packageInfo?.price ? packageInfo.price * 0.1 : 0);
      toast.success('优惠码已应用，减免 10%');
    } else if (couponCode.toUpperCase() === 'FIRST50') {
      setDiscount(50);
      toast.success('优惠码已应用，立减 ¥50');
    } else {
      toast.error('优惠码无效');
    }
  };

  // 发起支付
  const handlePayment = async () => {
    if (!packageInfo) return;

    setIsProcessing(true);

    try {
      // 模拟支付流程
      toast.loading('正在跳转到支付页面...', { id: 'payment' });

      // 模拟支付跳转
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 模拟支付成功
      toast.success('支付成功！', { id: 'payment' });

      // 更新用户套餐状态
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.package = packageInfo.name;
      userData.packageExpire = new Date(Date.now() + packageInfo.duration * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('user', JSON.stringify(userData));

      // 跳转到套餐页面
      setTimeout(() => {
        router.push('/packages?success=true');
      }, 1500);
    } catch (error) {
      toast.error('支付失败，请重试', { id: 'payment' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 返回选择套餐
  const goBack = () => {
    router.push('/packages');
  };

  const handleLogout = () => {
    router.push('/login');
  };

  if (!user || !packageInfo) {
    return (
      <MainLayout user={user} onLogout={handleLogout}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/5 flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">确认订单</h1>
              <p className="text-[14px] text-muted-foreground">
                请确认您的订单信息并完成支付
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回套餐
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：订单信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 订单详情卡片 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  订单详情
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-[14px] text-muted-foreground">商品名称</span>
                  <span className="text-[14px] font-medium">{packageInfo.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-[14px] text-muted-foreground">服务时长</span>
                  <span className="text-[14px] font-medium">{packageInfo.duration} 天</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[14px] text-muted-foreground">原价</span>
                  <span className="text-[16px] font-semibold">¥{packageInfo.price}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                    <span className="text-[14px] text-green-600">优惠减免</span>
                    <span className="text-[14px] font-medium text-green-600">-¥{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-lg px-4 border border-green-500/20">
                  <span className="text-[15px] font-semibold">应付金额</span>
                  <span className="text-2xl font-bold text-green-600">¥{finalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* 支付方式 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium">选择支付方式</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* 支付宝 */}
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                         onClick={() => setPaymentMethod('alipay')}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="alipay" />
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">支</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-medium">支付宝</p>
                          <p className="text-[12px] text-muted-foreground">推荐</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">推荐</Badge>
                    </div>

                    {/* 微信支付 */}
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                         onClick={() => setPaymentMethod('wechat')}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="wechat" />
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">微</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-medium">微信支付</p>
                          <p className="text-[12px] text-muted-foreground">无需开通，即用即付</p>
                        </div>
                      </div>
                    </div>

                    {/* 银行卡 */}
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                         onClick={() => setPaymentMethod('bank')}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="bank" />
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium">银行卡</p>
                          <p className="text-[12px] text-muted-foreground">支持主流银行借记卡</p>
                        </div>
                      </div>
                    </div>

                    {/* 企业转账 */}
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                         onClick={() => setPaymentMethod('transfer')}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="transfer" />
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium">对公转账</p>
                          <p className="text-[12px] text-muted-foreground">适合企业客户，大额付款</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：支付辅助信息 */}
          <div className="space-y-6">
            {/* 优惠码 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  优惠码
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="请输入优惠码"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="text-[14px]"
                  />
                  <Button variant="outline" size="sm" onClick={applyCoupon}>
                    应用
                  </Button>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  试用优惠码：ZHANGGUI2024（9折）或 FIRST50（立减50）
                </p>
              </CardContent>
            </Card>

            {/* 安全提示 */}
            <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-[13px]">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>交易安全有保障</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>数据加密传输</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>7天内无理由退款</span>
                </div>
              </CardContent>
            </Card>

            {/* 购买须知 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium">购买须知</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-[13px] text-muted-foreground space-y-2">
                <p>1. 支付成功后，服务即刻生效</p>
                <p>2. 套餐有效期自购买之日起计算</p>
                <p>3. 支持升级/降级套餐</p>
                <p>4. 如需发票请联系客服</p>
                <p>5. 退款政策：7天内可申请退款</p>
              </CardContent>
            </Card>

            {/* 支付按钮 */}
            <Button
              className="w-full h-12 text-[15px] font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  确认支付 ¥{finalPrice.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
