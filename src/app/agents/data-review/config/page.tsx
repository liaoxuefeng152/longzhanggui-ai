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
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileOutput,
  Save,
  RefreshCw,
  CheckCircle2,
  Power,
  Settings,
} from 'lucide-react';

export default function DataReviewAgentConfigPage() {
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    name: '数据复盘SKILL',
    enabled: true,
    model: 'doubao-pro-4-250115',
  });

  const [analysisConfig, setAnalysisConfig] = useState({
    defaultPeriod: 'weekly',
    includeComparison: true,
    includeForecasting: true,
    includeRecommendations: true,
    maxTopProducts: 10,
  });

  const [metricsConfig, setMetricsConfig] = useState({
    includeSales: true,
    includeOrders: true,
    includeTraffic: true,
    includeConversion: true,
    includeAdvertising: true,
    includeProfit: true,
  });

  const [alertConfig, setAlertConfig] = useState({
    enableAlerts: true,
    salesDropThreshold: 20,
    inventoryLowThreshold: 10,
    profitMarginThreshold: 10,
  });

  const [outputConfig, setOutputConfig] = useState({
    defaultFormat: 'detailed',
    includeCharts: true,
    includeActionItems: true,
    autoExport: false,
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
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">数据复盘SKILL配置</h1>
              <p className="text-sm text-muted-foreground">配置数据分析、报告生成和异常告警</p>
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
                    <Label>SKILL名称</Label>
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

            {/* 分析配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  分析配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>默认分析周期</Label>
                    <Select
                      value={analysisConfig.defaultPeriod}
                      onValueChange={(v) => setAnalysisConfig({ ...analysisConfig, defaultPeriod: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">日报</SelectItem>
                        <SelectItem value="weekly">周报</SelectItem>
                        <SelectItem value="monthly">月报</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>TOP商品展示数量</Label>
                    <Input
                      type="number"
                      value={analysisConfig.maxTopProducts}
                      onChange={(e) => setAnalysisConfig({ ...analysisConfig, maxTopProducts: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">包含对比分析</p>
                    <p className="text-xs text-muted-foreground">与历史数据进行对比</p>
                  </div>
                  <Switch
                    checked={analysisConfig.includeComparison}
                    onCheckedChange={(checked) => setAnalysisConfig({ ...analysisConfig, includeComparison: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">包含趋势预测</p>
                    <p className="text-xs text-muted-foreground">基于历史数据预测趋势</p>
                  </div>
                  <Switch
                    checked={analysisConfig.includeForecasting}
                    onCheckedChange={(checked) => setAnalysisConfig({ ...analysisConfig, includeForecasting: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">包含优化建议</p>
                    <p className="text-xs text-muted-foreground">基于分析给出改进建议</p>
                  </div>
                  <Switch
                    checked={analysisConfig.includeRecommendations}
                    onCheckedChange={(checked) => setAnalysisConfig({ ...analysisConfig, includeRecommendations: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 指标配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  指标配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">销售额</span>
                    <Switch
                      checked={metricsConfig.includeSales}
                      onCheckedChange={(checked) => setMetricsConfig({ ...metricsConfig, includeSales: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">订单数据</span>
                    <Switch
                      checked={metricsConfig.includeOrders}
                      onCheckedChange={(checked) => setMetricsConfig({ ...metricsConfig, includeOrders: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">流量数据</span>
                    <Switch
                      checked={metricsConfig.includeTraffic}
                      onCheckedChange={(checked) => setMetricsConfig({ ...metricsConfig, includeTraffic: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">转化数据</span>
                    <Switch
                      checked={metricsConfig.includeConversion}
                      onCheckedChange={(checked) => setMetricsConfig({ ...metricsConfig, includeConversion: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">广告数据</span>
                    <Switch
                      checked={metricsConfig.includeAdvertising}
                      onCheckedChange={(checked) => setMetricsConfig({ ...metricsConfig, includeAdvertising: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">利润数据</span>
                    <Switch
                      checked={metricsConfig.includeProfit}
                      onCheckedChange={(checked) => setMetricsConfig({ ...metricsConfig, includeProfit: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 告警配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  告警配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">启用异常告警</p>
                    <p className="text-xs text-muted-foreground">检测到异常时发送告警</p>
                  </div>
                  <Switch
                    checked={alertConfig.enableAlerts}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, enableAlerts: checked })}
                  />
                </div>
                {alertConfig.enableAlerts && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>销量下降告警 (%)</Label>
                      <Input
                        type="number"
                        value={alertConfig.salesDropThreshold}
                        onChange={(e) => setAlertConfig({ ...alertConfig, salesDropThreshold: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>库存不足告警 (件)</Label>
                      <Input
                        type="number"
                        value={alertConfig.inventoryLowThreshold}
                        onChange={(e) => setAlertConfig({ ...alertConfig, inventoryLowThreshold: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>利润率告警 (%)</Label>
                      <Input
                        type="number"
                        value={alertConfig.profitMarginThreshold}
                        onChange={(e) => setAlertConfig({ ...alertConfig, profitMarginThreshold: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 输出配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileOutput className="h-4 w-4" />
                  输出配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>默认报告格式</Label>
                  <Select
                    value={outputConfig.defaultFormat}
                    onValueChange={(v) => setOutputConfig({ ...outputConfig, defaultFormat: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">详细报告</SelectItem>
                      <SelectItem value="summary">摘要报告</SelectItem>
                      <SelectItem value="brief">简报</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">包含图表</p>
                    <p className="text-xs text-muted-foreground">展示可视化图表</p>
                  </div>
                  <Switch
                    checked={outputConfig.includeCharts}
                    onCheckedChange={(checked) => setOutputConfig({ ...outputConfig, includeCharts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">包含行动项</p>
                    <p className="text-xs text-muted-foreground">生成可执行的下一步清单</p>
                  </div>
                  <Switch
                    checked={outputConfig.includeActionItems}
                    onCheckedChange={(checked) => setOutputConfig({ ...outputConfig, includeActionItems: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动导出</p>
                    <p className="text-xs text-muted-foreground">分析完成后自动导出</p>
                  </div>
                  <Switch
                    checked={outputConfig.autoExport}
                    onCheckedChange={(checked) => setOutputConfig({ ...outputConfig, autoExport: checked })}
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
                  <span className="text-sm">SKILL状态</span>
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
