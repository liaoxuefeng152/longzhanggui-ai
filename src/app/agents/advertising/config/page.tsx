'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function AdvertisingAgentConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // 基本信息配置
  const [config, setConfig] = useState({
    name: '广告投放智能体',
    enabled: true,
    model: 'doubao-pro-4-250115',
  });

  // 预算配置
  const [budgetConfig, setBudgetConfig] = useState({
    defaultDailyBudget: 50,
    maxDailyBudget: 500,
    minDailyBudget: 10,
    budgetAlertThreshold: 80,
    autoBudgetAdjust: false,
    budgetIncrement: 10,
  });

  // 出价配置
  const [biddingConfig, setBiddingConfig] = useState({
    defaultBid: 0.5,
    maxBid: 5,
    minBid: 0.1,
    biddingStrategy: 'enhanced',
    autoBidAdjust: true,
    targetRoas: 3.0,
    minRoas: 1.5,
  });

  // 优化配置
  const [optimizationConfig, setOptimizationConfig] = useState({
    autoOptimize: true,
    optimizeFrequency: 24,
    performanceThreshold: 0.5,
    pausePoorAds: true,
    duplicateHighPerformers: true,
  });

  // 风控配置
  const [riskConfig, setRiskConfig] = useState({
    dailySpendLimit: 500,
    requireApproval: true,
    approvalThreshold: 200,
    alertOnAnomaly: true,
    anomalyThreshold: 50,
    weekendAdjust: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('广告投放智能体配置已保存');
    } catch {
      toast.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            广告投放智能体配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置广告创建、优化和预算管理的默认参数和行为
          </p>
        </div>
        <Badge variant={config.enabled ? 'default' : 'secondary'} className="px-3 py-1">
          {config.enabled ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              已启用
            </>
          ) : '已禁用'}
        </Badge>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-fit">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="budget">预算配置</TabsTrigger>
          <TabsTrigger value="bidding">出价配置</TabsTrigger>
          <TabsTrigger value="optimization">优化配置</TabsTrigger>
          <TabsTrigger value="risk">风控配置</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>设置智能体的基本信息和运行参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">智能体名称</Label>
                  <Input 
                    id="name" 
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">绑定模型</Label>
                  <Select value={config.model} onValueChange={(v) => setConfig({...config, model: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doubao-pro-4-250115">豆包Pro (推荐广告)</SelectItem>
                      <SelectItem value="doubao-seed-1-8-251228">豆包Lite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">
                    控制智能体是否接受广告投放任务
                  </p>
                </div>
                <Switch 
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 预算配置 */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                预算配置
              </CardTitle>
              <CardDescription>配置广告预算的默认参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultDailyBudget">默认日预算</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="defaultDailyBudget" 
                      type="number"
                      value={budgetConfig.defaultDailyBudget}
                      onChange={(e) => setBudgetConfig({...budgetConfig, defaultDailyBudget: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minDailyBudget">最小日预算</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="minDailyBudget" 
                      type="number"
                      value={budgetConfig.minDailyBudget}
                      onChange={(e) => setBudgetConfig({...budgetConfig, minDailyBudget: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDailyBudget">最大日预算</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="maxDailyBudget" 
                      type="number"
                      value={budgetConfig.maxDailyBudget}
                      onChange={(e) => setBudgetConfig({...budgetConfig, maxDailyBudget: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>预算告警阈值</Label>
                  <span className="text-sm text-muted-foreground">{budgetConfig.budgetAlertThreshold}%</span>
                </div>
                <Slider 
                  value={[budgetConfig.budgetAlertThreshold]} 
                  onValueChange={(value: number[]) => setBudgetConfig({...budgetConfig, budgetAlertThreshold: value[0]})}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  当日预算消耗达到此比例时发送告警通知
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动调整预算</Label>
                  <p className="text-sm text-muted-foreground">根据广告表现自动调整预算</p>
                </div>
                <Switch 
                  checked={budgetConfig.autoBudgetAdjust}
                  onCheckedChange={(checked) => setBudgetConfig({...budgetConfig, autoBudgetAdjust: checked})}
                />
              </div>

              {budgetConfig.autoBudgetAdjust && (
                <div className="space-y-2">
                  <Label htmlFor="budgetIncrement">预算调整幅度</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="budgetIncrement" 
                      type="number"
                      className="w-32"
                      value={budgetConfig.budgetIncrement}
                      onChange={(e) => setBudgetConfig({...budgetConfig, budgetIncrement: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 出价配置 */}
        <TabsContent value="bidding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                出价配置
              </CardTitle>
              <CardDescription>配置广告出价策略和参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultBid">默认出价</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="defaultBid" 
                      type="number"
                      step="0.01"
                      value={biddingConfig.defaultBid}
                      onChange={(e) => setBiddingConfig({...biddingConfig, defaultBid: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minBid">最低出价</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="minBid" 
                      type="number"
                      step="0.01"
                      value={biddingConfig.minBid}
                      onChange={(e) => setBiddingConfig({...biddingConfig, minBid: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxBid">最高出价</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="maxBid" 
                      type="number"
                      step="0.01"
                      value={biddingConfig.maxBid}
                      onChange={(e) => setBiddingConfig({...biddingConfig, maxBid: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="biddingStrategy">出价策略</Label>
                <Select value={biddingConfig.biddingStrategy} onValueChange={(v) => setBiddingConfig({...biddingConfig, biddingStrategy: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enhanced">增强型</SelectItem>
                    <SelectItem value="fixed">固定出价</SelectItem>
                    <SelectItem value="dynamic">动态出价</SelectItem>
                    <SelectItem value="roas">目标ROAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动调整出价</Label>
                  <p className="text-sm text-muted-foreground">根据广告表现自动调整出价</p>
                </div>
                <Switch 
                  checked={biddingConfig.autoBidAdjust}
                  onCheckedChange={(checked) => setBiddingConfig({...biddingConfig, autoBidAdjust: checked})}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="targetRoas">目标ROAS</Label>
                  <Input 
                    id="targetRoas" 
                    type="number"
                    step="0.1"
                    value={biddingConfig.targetRoas}
                    onChange={(e) => setBiddingConfig({...biddingConfig, targetRoas: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minRoas">最低ROAS阈值</Label>
                  <Input 
                    id="minRoas" 
                    type="number"
                    step="0.1"
                    value={biddingConfig.minRoas}
                    onChange={(e) => setBiddingConfig({...biddingConfig, minRoas: parseFloat(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">低于此值自动暂停广告</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 优化配置 */}
        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                优化配置
              </CardTitle>
              <CardDescription>配置广告优化的行为规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>自动优化</Label>
                  <p className="text-sm text-muted-foreground">根据预设规则自动优化广告</p>
                </div>
                <Switch 
                  checked={optimizationConfig.autoOptimize}
                  onCheckedChange={(checked) => setOptimizationConfig({...optimizationConfig, autoOptimize: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="optimizeFrequency">优化频率</Label>
                <Select value={String(optimizationConfig.optimizeFrequency)} onValueChange={(v) => setOptimizationConfig({...optimizationConfig, optimizeFrequency: parseInt(v)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">每6小时</SelectItem>
                    <SelectItem value="12">每12小时</SelectItem>
                    <SelectItem value="24">每天</SelectItem>
                    <SelectItem value="48">每2天</SelectItem>
                    <SelectItem value="168">每周</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>性能阈值</Label>
                  <span className="text-sm text-muted-foreground">{optimizationConfig.performanceThreshold * 100}%</span>
                </div>
                <Slider 
                  value={[optimizationConfig.performanceThreshold * 100]} 
                  onValueChange={(value: number[]) => setOptimizationConfig({...optimizationConfig, performanceThreshold: value[0] / 100})}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  广告表现低于此阈值时考虑暂停
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动暂停低效广告</Label>
                  <p className="text-sm text-muted-foreground">表现差的广告自动暂停</p>
                </div>
                <Switch 
                  checked={optimizationConfig.pausePoorAds}
                  onCheckedChange={(checked) => setOptimizationConfig({...optimizationConfig, pausePoorAds: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>复制高效广告</Label>
                  <p className="text-sm text-muted-foreground">高效广告自动复制扩展</p>
                </div>
                <Switch 
                  checked={optimizationConfig.duplicateHighPerformers}
                  onCheckedChange={(checked) => setOptimizationConfig({...optimizationConfig, duplicateHighPerformers: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 风控配置 */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                风控配置
              </CardTitle>
              <CardDescription>配置广告投放的风险控制规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">高风险操作提醒</p>
                    <p className="text-sm text-amber-700 mt-1">
                      请根据实际业务情况合理设置风控阈值，避免产生意外费用。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailySpendLimit">日消费上限</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">$</span>
                  <Input 
                    id="dailySpendLimit" 
                    type="number"
                    value={riskConfig.dailySpendLimit}
                    onChange={(e) => setRiskConfig({...riskConfig, dailySpendLimit: parseFloat(e.target.value)})}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  超过此金额自动暂停所有广告
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>超出阈值需审批</Label>
                  <p className="text-sm text-muted-foreground">高消费广告需人工确认</p>
                </div>
                <Switch 
                  checked={riskConfig.requireApproval}
                  onCheckedChange={(checked) => setRiskConfig({...riskConfig, requireApproval: checked})}
                />
              </div>

              {riskConfig.requireApproval && (
                <div className="space-y-2">
                  <Label htmlFor="approvalThreshold">审批阈值</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="approvalThreshold" 
                      type="number"
                      className="w-32"
                      value={riskConfig.approvalThreshold}
                      onChange={(e) => setRiskConfig({...riskConfig, approvalThreshold: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>异常告警</Label>
                  <p className="text-sm text-muted-foreground">消费异常时发送告警</p>
                </div>
                <Switch 
                  checked={riskConfig.alertOnAnomaly}
                  onCheckedChange={(checked) => setRiskConfig({...riskConfig, alertOnAnomaly: checked})}
                />
              </div>

              {riskConfig.alertOnAnomaly && (
                <div className="space-y-2">
                  <Label htmlFor="anomalyThreshold">异常波动阈值</Label>
                  <div className="flex items-center">
                    <Input 
                      id="anomalyThreshold" 
                      type="number"
                      className="w-24"
                      value={riskConfig.anomalyThreshold}
                      onChange={(e) => setRiskConfig({...riskConfig, anomalyThreshold: parseFloat(e.target.value)})}
                    />
                    <span className="text-muted-foreground ml-2">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    与昨日同期相比波动超过此值触发告警
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>周末调整</Label>
                  <p className="text-sm text-muted-foreground">根据周末流量特征自动调整</p>
                </div>
                <Switch 
                  checked={riskConfig.weekendAdjust}
                  onCheckedChange={(checked) => setRiskConfig({...riskConfig, weekendAdjust: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 保存按钮 */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          重置
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存配置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
