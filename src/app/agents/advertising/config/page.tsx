'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  Save,
  RefreshCw,
  CheckCircle2,
  Power,
  Settings,
} from 'lucide-react';

export default function AdvertisingAgentConfigPage() {
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    name: '广告投放智能体',
    enabled: true,
    model: 'doubao-pro-4-250115',
  });

  const [budgetConfig, setBudgetConfig] = useState({
    defaultDailyBudget: 50,
    maxDailyBudget: 500,
    minDailyBudget: 10,
    budgetAlertThreshold: 80,
    autoBudgetAdjust: false,
  });

  const [biddingConfig, setBiddingConfig] = useState({
    defaultBid: 0.5,
    maxBid: 5,
    biddingStrategy: 'enhanced',
    autoBidAdjust: true,
    targetRoas: 3.0,
  });

  const [riskConfig, setRiskConfig] = useState({
    dailySpendLimit: 500,
    requireApproval: true,
    approvalThreshold: 200,
    alertOnAnomaly: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('配置已保存');
    } catch {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">广告投放智能体配置</h1>
              <p className="text-sm text-muted-foreground">配置广告创建、优化和预算管理</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={config.enabled ? 'default' : 'secondary'} className="px-3 py-1">
              {config.enabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  已启用
                </>
              ) : (
                '已禁用'
              )}
            </Badge>
            <Button
              variant={config.enabled ? 'outline' : 'default'}
              size="sm"
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            >
              <Power className="h-4 w-4 mr-1" />
              {config.enabled ? '禁用' : '启用'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>智能体名称</Label>
                    <Input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>绑定模型</Label>
                    <Select value={config.model} onValueChange={(v) => setConfig({ ...config, model: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doubao-pro-4-250115">豆包Pro (推荐)</SelectItem>
                        <SelectItem value="doubao-seed-1-8-251228">豆包Lite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 预算配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  预算配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>默认日预算 ($)</Label>
                    <Input
                      type="number"
                      value={budgetConfig.defaultDailyBudget}
                      onChange={(e) => setBudgetConfig({ ...budgetConfig, defaultDailyBudget: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最小日预算 ($)</Label>
                    <Input
                      type="number"
                      value={budgetConfig.minDailyBudget}
                      onChange={(e) => setBudgetConfig({ ...budgetConfig, minDailyBudget: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最大日预算 ($)</Label>
                    <Input
                      type="number"
                      value={budgetConfig.maxDailyBudget}
                      onChange={(e) => setBudgetConfig({ ...budgetConfig, maxDailyBudget: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>预算告警阈值</Label>
                    <span className="text-sm text-muted-foreground">{budgetConfig.budgetAlertThreshold}%</span>
                  </div>
                  <Slider
                    value={[budgetConfig.budgetAlertThreshold]}
                    onValueChange={(value: number[]) => setBudgetConfig({ ...budgetConfig, budgetAlertThreshold: value[0] })}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动调整预算</p>
                    <p className="text-xs text-muted-foreground">根据表现自动调整</p>
                  </div>
                  <Switch
                    checked={budgetConfig.autoBudgetAdjust}
                    onCheckedChange={(checked) => setBudgetConfig({ ...budgetConfig, autoBudgetAdjust: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 出价配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  出价配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>默认出价 ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={biddingConfig.defaultBid}
                      onChange={(e) => setBiddingConfig({ ...biddingConfig, defaultBid: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最高出价 ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={biddingConfig.maxBid}
                      onChange={(e) => setBiddingConfig({ ...biddingConfig, maxBid: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>出价策略</Label>
                    <Select
                      value={biddingConfig.biddingStrategy}
                      onValueChange={(v) => setBiddingConfig({ ...biddingConfig, biddingStrategy: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enhanced">增强型</SelectItem>
                        <SelectItem value="fixed">固定出价</SelectItem>
                        <SelectItem value="roas">目标ROAS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>目标ROAS</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={biddingConfig.targetRoas}
                      onChange={(e) => setBiddingConfig({ ...biddingConfig, targetRoas: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动调整出价</p>
                    <p className="text-xs text-muted-foreground">根据表现自动调整</p>
                  </div>
                  <Switch
                    checked={biddingConfig.autoBidAdjust}
                    onCheckedChange={(checked) => setBiddingConfig({ ...biddingConfig, autoBidAdjust: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 风控配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  风控配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-800">请根据实际业务合理设置风控阈值</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>日消费上限 ($)</Label>
                    <Input
                      type="number"
                      value={riskConfig.dailySpendLimit}
                      onChange={(e) => setRiskConfig({ ...riskConfig, dailySpendLimit: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>审批阈值 ($)</Label>
                    <Input
                      type="number"
                      value={riskConfig.approvalThreshold}
                      onChange={(e) => setRiskConfig({ ...riskConfig, approvalThreshold: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">超出阈值需审批</p>
                    <p className="text-xs text-muted-foreground">高消费需人工确认</p>
                  </div>
                  <Switch
                    checked={riskConfig.requireApproval}
                    onCheckedChange={(checked) => setRiskConfig({ ...riskConfig, requireApproval: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">异常告警</p>
                    <p className="text-xs text-muted-foreground">消费异常时发送告警</p>
                  </div>
                  <Switch
                    checked={riskConfig.alertOnAnomaly}
                    onCheckedChange={(checked) => setRiskConfig({ ...riskConfig, alertOnAnomaly: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">运行状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">智能体状态</span>
                  <Badge variant={config.enabled ? 'default' : 'secondary'}>
                    {config.enabled ? '运行中' : '已停止'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleSave} disabled={loading}>
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
      </div>
    </MainLayout>
  );
}
