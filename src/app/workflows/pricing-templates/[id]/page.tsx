'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Calculator,
  Save,
  X,
  HelpCircle,
  RefreshCw,
  DollarSign,
  Percent,
  Truck,
  Building,
  Globe,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PricingTemplate {
  id: string;
  name: string;
  site: string;
  siteName: string;
  type: string;
  exchangeRate: number | null;
  profit: {
    method: 'cost_rate' | 'price_rate';
    rate: number;
    discount: number;
  };
  cost: {
    shipping: {
      method: 'official' | 'custom';
      amount: number;
      weightBased: boolean;
      merchantShare: boolean;
    };
    platform: {
      commission: number;
      transactionFee: number;
      vat: number;
      tariff: number;
      withdrawalFee: number;
      influencerFee: number;
      infrastructureFee: number;
      growthServiceFee: number;
    };
    otherFees: number;
  };
  rounding: {
    scope: 'before_tax' | 'display';
    method: 'none' | 'up' | 'down' | 'round';
    amount: number;
  };
}

// 站点配置
const siteConfigs: Record<string, { currency: string; currencyName: string; defaultRate: number }> = {
  'TH': { currency: 'THB', currencyName: '泰铢', defaultRate: 5.1 },
  'ID': { currency: 'IDR', currencyName: '印尼盾', defaultRate: 2100 },
  'VN': { currency: 'VND', currencyName: '越南盾', defaultRate: 3500 },
  'MY': { currency: 'MYR', currencyName: '林吉特', defaultRate: 1.5 },
  'PH': { currency: 'PHP', currencyName: '比索', defaultRate: 18 },
  'SG': { currency: 'SGD', currencyName: '新币', defaultRate: 1.35 },
};

export default function PricingTemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [template, setTemplate] = useState<PricingTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 试算表单
  const [calcForm, setCalcForm] = useState({
    costPrice: '',
    weight: '',
  });
  const [calcResult, setCalcResult] = useState<any>(null);

  // 确认保存弹窗
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 加载模板
  useEffect(() => {
    loadTemplate();
  }, [resolvedParams.id]);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/pricing/templates');
      const result = await response.json();
      if (result.success) {
        const found = result.data.find((t: any) => t.id === resolvedParams.id);
        if (found) {
          // 获取完整配置
          const fullResponse = await fetch(`/api/v1/pricing/templates`);
          const fullResult = await fullResponse.json();
          const fullTemplate = fullResult.data?.find((t: any) => t.id === resolvedParams.id);
          setTemplate(fullTemplate || {
            ...found,
            cost: {
              shipping: { method: 'official', amount: 16.76, weightBased: true, merchantShare: false },
              platform: { commission: 5.35, transactionFee: 3.21, vat: 7, tariff: 10, withdrawalFee: 1, influencerFee: 0, infrastructureFee: 0.23, growthServiceFee: 0 },
              otherFees: 2,
            },
            rounding: { scope: 'before_tax', method: 'none', amount: 0 },
          });
        } else {
          toast.error('模板不存在');
          router.push('/workflows/pricing-templates');
        }
      }
    } catch (error) {
      toast.error('加载失败');
    }
    setIsLoading(false);
  };

  // 更新字段
  const updateField = (path: string, value: any) => {
    if (!template) return;
    
    const newTemplate = { ...template };
    const keys = path.split('.');
    let obj: any = newTemplate;
    
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    setTemplate(newTemplate);
    setHasChanges(true);
  };

  // 计算售价
  const calculatePrice = () => {
    if (!template || !calcForm.costPrice || !calcForm.weight) {
      toast.error('请填写采购价和重量');
      return;
    }

    const costPrice = parseFloat(calcForm.costPrice);
    const weight = parseFloat(calcForm.weight);
    
    if (isNaN(costPrice) || isNaN(weight)) {
      toast.error('请输入有效数字');
      return;
    }

    const { shipping, platform } = template.cost;
    const { profit, exchangeRate } = template;
    
    // 获取汇率
    const rate = exchangeRate || siteConfigs[template.site]?.defaultRate || 5;
    const targetCurrency = siteConfigs[template.site]?.currency || 'THB';
    
    // 1. 头程运费
    const shippingCost = shipping.amount;
    
    // 2. 平台费用计算基数（成本 + 头程）
    const baseForFees = costPrice + shippingCost;
    
    // 3. 平台各项费用
    const commissionFee = baseForFees * (platform.commission / 100);
    const transactionFee = baseForFees * (platform.transactionFee / 100);
    const vatFee = baseForFees * (platform.vat / 100);
    const tariffFee = costPrice * (platform.tariff / 100);
    const withdrawalFee = 0; // 提现费按售价计算，后面更新
    const influencerFee = baseForFees * (platform.influencerFee / 100);
    const infrastructureFee = platform.infrastructureFee;
    const growthServiceFee = baseForFees * (platform.growthServiceFee / 100);
    const otherFees = template.cost.otherFees;
    
    // 平台总费用
    const totalPlatformFees = commissionFee + transactionFee + vatFee + withdrawalFee + 
                              influencerFee + infrastructureFee + growthServiceFee + otherFees;
    
    // 4. 关税单独加到成本
    const totalCost = costPrice + shippingCost + tariffFee;
    
    // 5. 计算税前售价（目标利润）
    let preTaxPrice: number;
    if (profit.method === 'cost_rate') {
      // 成本利润率：售价 = 成本 * (1 + 利润率)
      // 但需要考虑平台扣点，实际售价要更高
      const targetProfit = totalCost * (profit.rate / 100);
      // 反推：preTaxPrice - totalPlatformFees - preTaxPrice * withdrawalFee% = totalCost + targetProfit
      const withdrawalRate = platform.withdrawalFee / 100;
      preTaxPrice = (totalCost + targetProfit + totalPlatformFees - withdrawalFee) / (1 - withdrawalRate);
    } else {
      // 售价利润率
      preTaxPrice = totalCost / (1 - profit.rate / 100 - (totalPlatformFees / baseForFees));
    }
    
    // 6. 应用折扣
    let discountedPrice = preTaxPrice * (profit.discount / 100);
    
    // 7. 尾数处理
    if (template.rounding.method !== 'none' && template.rounding.amount > 0) {
      const target = template.rounding.amount;
      if (template.rounding.method === 'up') {
        discountedPrice = Math.ceil(discountedPrice / target) * target;
      } else if (template.rounding.method === 'down') {
        discountedPrice = Math.floor(discountedPrice / target) * target;
      } else if (template.rounding.method === 'round') {
        discountedPrice = Math.round(discountedPrice / target) * target;
      }
    }
    
    // 8. 换算为目标货币
    const displayPrice = discountedPrice * rate;
    
    // 9. 实际利润计算
    const actualWithdrawalFee = discountedPrice * (platform.withdrawalFee / 100);
    const actualProfit = discountedPrice - totalCost - totalPlatformFees - actualWithdrawalFee - (otherFees);
    const actualProfitRate = (actualProfit / discountedPrice) * 100;
    
    setCalcResult({
      preTaxPrice: discountedPrice.toFixed(2),
      displayPrice: displayPrice.toFixed(2),
      currency: targetCurrency,
      profit: actualProfit.toFixed(2),
      profitRate: actualProfitRate.toFixed(1),
      fees: {
        commission: commissionFee.toFixed(2),
        transaction: transactionFee.toFixed(2),
        vat: vatFee.toFixed(2),
        tariff: tariffFee.toFixed(2),
        withdrawal: actualWithdrawalFee.toFixed(2),
        influencer: influencerFee.toFixed(2),
        infrastructure: infrastructureFee.toFixed(2),
        growth: growthServiceFee.toFixed(2),
        other: otherFees.toFixed(2),
        shipping: shippingCost.toFixed(2),
      },
      totalFees: (totalPlatformFees + actualWithdrawalFee + tariffFee).toFixed(2),
    });
  };

  // 保存模板
  const saveTemplate = async () => {
    if (!template) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/pricing/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('保存成功');
        setHasChanges(false);
        setSaveDialogOpen(false);
        router.push('/workflows/pricing-templates');
      } else {
        toast.error(result.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    }
    setIsSaving(false);
  };

  // 返回确认
  const handleBack = () => {
    if (hasChanges) {
      if (confirm('有未保存的更改，确定要离开吗？')) {
        router.push('/workflows/pricing-templates');
      }
    } else {
      router.push('/workflows/pricing-templates');
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <MainLayout user={user} onLogout={() => router.push('/login')}>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </MainLayout>
    );
  }

  if (!template) return null;

  const siteConfig = siteConfigs[template.site] || siteConfigs['TH'];

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">编辑定价模板</h1>
              <p className="text-[14px] text-muted-foreground">{template.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                有未保存的更改
              </Badge>
            )}
            <Button variant="outline" onClick={() => router.push('/workflows/pricing-templates')}>
              关闭
            </Button>
            <Button onClick={() => setSaveDialogOpen(true)} className="gap-2">
              <Save className="h-4 w-4" />
              保存
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧配置区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基础配置 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600" />
                  基础配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>模板名称</Label>
                    <Input 
                      value={template.name} 
                      onChange={(e) => { updateField('name', e.target.value); }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>站点</Label>
                    <Select value={template.site} onValueChange={(v) => updateField('site', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TH">泰国</SelectItem>
                        <SelectItem value="ID">印尼</SelectItem>
                        <SelectItem value="VN">越南</SelectItem>
                        <SelectItem value="MY">马来西亚</SelectItem>
                        <SelectItem value="PH">菲律宾</SelectItem>
                        <SelectItem value="SG">新加坡</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>汇率配置 (1 CNY = ? {siteConfig.currencyName})</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      step="0.01"
                      value={template.exchangeRate || ''} 
                      onChange={(e) => { updateField('exchangeRate', e.target.value ? parseFloat(e.target.value) : null); }}
                      placeholder={`留空将自动获取（约${siteConfig.defaultRate}）`}
                      className="w-48"
                    />
                    <span className="text-sm text-muted-foreground">
                      {siteConfig.currency}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 利润设置 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Percent className="h-5 w-5 text-emerald-600" />
                  利润设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>利润方式</Label>
                    <Select value={template.profit.method} onValueChange={(v) => updateField('profit.method', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cost_rate">成本利润率</SelectItem>
                        <SelectItem value="price_rate">售价利润率</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>利润率 (%)</Label>
                    <Input 
                      type="number"
                      value={template.profit.rate} 
                      onChange={(e) => { updateField('profit.rate', parseFloat(e.target.value) || 0); }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>折扣 (%)</Label>
                  <Input 
                    type="number"
                    value={template.profit.discount} 
                    onChange={(e) => { updateField('profit.discount', parseFloat(e.target.value) || 0); }}
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground">100 = 不打折，90 = 9折</p>
                </div>
              </CardContent>
            </Card>

            {/* 成本配置 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  成本配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 头程运费 */}
                <div className="space-y-3">
                  <div className="font-medium text-sm">头程运费</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>计算方式</Label>
                      <Select 
                        value={template.cost.shipping.method} 
                        onValueChange={(v) => updateField('cost.shipping.method', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="official">官方跨境物流</SelectItem>
                          <SelectItem value="custom">自定义运费</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>运费 (CNY)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.shipping.amount} 
                        onChange={(e) => { updateField('cost.shipping.amount', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="weightBased"
                        checked={template.cost.shipping.weightBased}
                        onCheckedChange={(v) => updateField('cost.shipping.weightBased', v)}
                      />
                      <Label htmlFor="weightBased" className="text-sm">按重量计算</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="merchantShare"
                        checked={template.cost.shipping.merchantShare}
                        onCheckedChange={(v) => updateField('cost.shipping.merchantShare', v)}
                      />
                      <Label htmlFor="merchantShare" className="text-sm">商家承担部分运费</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 平台费用 */}
                <div className="space-y-3">
                  <div className="font-medium text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    平台费用
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">佣金费率 (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.commission} 
                        onChange={(e) => { updateField('cost.platform.commission', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">交易手续费 (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.transactionFee} 
                        onChange={(e) => { updateField('cost.platform.transactionFee', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">增值税率 (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.vat} 
                        onChange={(e) => { updateField('cost.platform.vat', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">关税税率 (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.tariff} 
                        onChange={(e) => { updateField('cost.platform.tariff', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">提现手续费 (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.withdrawalFee} 
                        onChange={(e) => { updateField('cost.platform.withdrawalFee', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">达人佣金 (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.influencerFee} 
                        onChange={(e) => { updateField('cost.platform.influencerFee', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">基础设施费 (CNY)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.infrastructureFee} 
                        onChange={(e) => { updateField('cost.platform.infrastructureFee', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">增长服务费 (%)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={template.cost.platform.growthServiceFee} 
                        onChange={(e) => { updateField('cost.platform.growthServiceFee', parseFloat(e.target.value) || 0); }}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 其他费用 */}
                <div className="space-y-3">
                  <div className="font-medium text-sm">其他费用 (CNY)</div>
                  <Input 
                    type="number"
                    step="0.01"
                    value={template.cost.otherFees} 
                    onChange={(e) => { updateField('cost.otherFees', parseFloat(e.target.value) || 0); }}
                    className="w-48"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 尾数处理 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">尾数处理</CardTitle>
                <CardDescription>对计算后的价格进行尾数美化</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>处理范围</Label>
                    <Select 
                      value={template.rounding.scope} 
                      onValueChange={(v) => updateField('rounding.scope', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before_tax">税前售价</SelectItem>
                        <SelectItem value="display">本地展示价</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>处理方式</Label>
                    <Select 
                      value={template.rounding.method} 
                      onValueChange={(v) => updateField('rounding.method', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不处理</SelectItem>
                        <SelectItem value="up">向上取整</SelectItem>
                        <SelectItem value="down">向下取整</SelectItem>
                        <SelectItem value="round">四舍五入</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>尾数</Label>
                    <Input 
                      type="number"
                      value={template.rounding.amount} 
                      onChange={(e) => { updateField('rounding.amount', parseInt(e.target.value) || 0); }}
                      placeholder="如：9"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  设置尾数为9，如：123.5 → 123.9，245.2 → 244.9
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 右侧试算区 */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border-emerald-500/20 sticky top-6">
              <CardHeader>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  售价试算
                </CardTitle>
                <CardDescription>输入采购价和重量，查看计算结果</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>产品采购价 (CNY)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={calcForm.costPrice} 
                    onChange={(e) => setCalcForm({ ...calcForm, costPrice: e.target.value })}
                    placeholder="请输入采购价"
                  />
                </div>
                <div className="space-y-2">
                  <Label>产品包裹重量 (KG)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={calcForm.weight} 
                    onChange={(e) => setCalcForm({ ...calcForm, weight: e.target.value })}
                    placeholder="请输入重量"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCalcForm({ costPrice: '', weight: '' })}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    重置
                  </Button>
                  <Button className="flex-1" onClick={calculatePrice}>
                    <Calculator className="h-4 w-4 mr-1" />
                    计算
                  </Button>
                </div>

                {calcResult && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-xs text-muted-foreground">税前售价</div>
                        <div className="text-lg font-bold text-emerald-600">¥{calcResult.preTaxPrice}</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-xs text-muted-foreground">本地售价</div>
                        <div className="text-lg font-bold text-emerald-600">
                          {calcResult.displayPrice} {calcResult.currency}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border col-span-2">
                        <div className="text-xs text-muted-foreground">预计利润</div>
                        <div className="text-lg font-bold text-emerald-600">
                          ¥{calcResult.profit} ({calcResult.profitRate}%)
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">费用明细</div>
                      <div className="bg-white rounded-lg border p-3 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">头程运费</span>
                          <span>¥{calcResult.fees.shipping}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">平台佣金</span>
                          <span>¥{calcResult.fees.commission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">交易手续费</span>
                          <span>¥{calcResult.fees.transaction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">增值税</span>
                          <span>¥{calcResult.fees.vat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">关税</span>
                          <span>¥{calcResult.fees.tariff}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">提现手续费</span>
                          <span>¥{calcResult.fees.withdrawal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">其他费用</span>
                          <span>¥{calcResult.fees.other}</span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between font-medium">
                          <span>费用合计</span>
                          <span className="text-red-600">-¥{calcResult.totalFees}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 提示 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">定价说明</p>
                    <p className="mt-1">计算结果仅供参考，若需引用建议结合商品情况进行调整。</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 保存确认弹窗 */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认保存</DialogTitle>
            <DialogDescription>
              确定要保存对「{template.name}」的修改吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={saveTemplate} disabled={isSaving}>
              {isSaving ? '保存中...' : '确认保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
