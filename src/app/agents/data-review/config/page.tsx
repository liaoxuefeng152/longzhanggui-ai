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
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  FileOutput, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function DataReviewAgentConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // 基本信息配置
  const [config, setConfig] = useState({
    name: '数据复盘智能体',
    enabled: true,
    model: 'doubao-pro-4-250115',
  });

  // 分析配置
  const [analysisConfig, setAnalysisConfig] = useState({
    defaultPeriod: 'weekly',
    includeComparison: true,
    comparePeriod: 'previous',
    includeForecasting: true,
    includeRecommendations: true,
    maxTopProducts: 10,
    includeCompetitorAnalysis: false,
  });

  // 指标配置
  const [metricsConfig, setMetricsConfig] = useState({
    includeSales: true,
    includeOrders: true,
    includeTraffic: true,
    includeConversion: true,
    includeAdvertising: true,
    includeProfit: true,
    includeInventory: true,
    includeCustomerMetrics: true,
  });

  // 告警配置
  const [alertConfig, setAlertConfig] = useState({
    enableAlerts: true,
    salesDropThreshold: 20,
    inventoryLowThreshold: 10,
    profitMarginThreshold: 10,
    adRoiLowThreshold: 1.0,
    negativeReviewThreshold: 5,
    refundRateThreshold: 5,
  });

  // 输出配置
  const [outputConfig, setOutputConfig] = useState({
    defaultFormat: 'detailed',
    includeCharts: true,
    includeActionItems: true,
    autoExport: false,
    exportFormat: 'pdf',
    autoSendReport: false,
    reportRecipients: '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('数据复盘智能体配置已保存');
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
            <BarChart3 className="h-6 w-6" />
            数据复盘智能体配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置数据分析、报告生成和异常告警的默认参数
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
          <TabsTrigger value="analysis">分析配置</TabsTrigger>
          <TabsTrigger value="metrics">指标配置</TabsTrigger>
          <TabsTrigger value="alert">告警配置</TabsTrigger>
          <TabsTrigger value="output">输出配置</TabsTrigger>
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
                      <SelectItem value="doubao-pro-4-250115">豆包Pro (推荐数据分析)</SelectItem>
                      <SelectItem value="doubao-seed-1-8-251228">豆包Lite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">
                    控制智能体是否接受数据分析任务
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

        {/* 分析配置 */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                分析配置
              </CardTitle>
              <CardDescription>配置数据分析的范围和行为</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultPeriod">默认分析周期</Label>
                  <Select value={analysisConfig.defaultPeriod} onValueChange={(v) => setAnalysisConfig({...analysisConfig, defaultPeriod: v})}>
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
                  <Label htmlFor="comparePeriod">对比周期</Label>
                  <Select value={analysisConfig.comparePeriod} onValueChange={(v) => setAnalysisConfig({...analysisConfig, comparePeriod: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previous">上一周期</SelectItem>
                      <SelectItem value="lastyear">去年同期</SelectItem>
                      <SelectItem value="average">历史平均</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTopProducts">TOP商品展示数量</Label>
                <Input 
                  id="maxTopProducts" 
                  type="number"
                  className="w-32"
                  value={analysisConfig.maxTopProducts}
                  onChange={(e) => setAnalysisConfig({...analysisConfig, maxTopProducts: parseInt(e.target.value)})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含对比分析</Label>
                  <p className="text-sm text-muted-foreground">与历史数据或竞品进行对比</p>
                </div>
                <Switch 
                  checked={analysisConfig.includeComparison}
                  onCheckedChange={(checked) => setAnalysisConfig({...analysisConfig, includeComparison: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含趋势预测</Label>
                  <p className="text-sm text-muted-foreground">基于历史数据预测未来趋势</p>
                </div>
                <Switch 
                  checked={analysisConfig.includeForecasting}
                  onCheckedChange={(checked) => setAnalysisConfig({...analysisConfig, includeForecasting: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含优化建议</Label>
                  <p className="text-sm text-muted-foreground">基于分析结果给出改进建议</p>
                </div>
                <Switch 
                  checked={analysisConfig.includeRecommendations}
                  onCheckedChange={(checked) => setAnalysisConfig({...analysisConfig, includeRecommendations: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含竞品分析</Label>
                  <p className="text-sm text-muted-foreground">分析主要竞品的运营数据</p>
                </div>
                <Switch 
                  checked={analysisConfig.includeCompetitorAnalysis}
                  onCheckedChange={(checked) => setAnalysisConfig({...analysisConfig, includeCompetitorAnalysis: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 指标配置 */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                指标配置
              </CardTitle>
              <CardDescription>配置报告中包含的数据指标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>销售额</Label>
                    <p className="text-sm text-muted-foreground">总收入、平均客单价</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeSales}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeSales: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>订单数据</Label>
                    <p className="text-sm text-muted-foreground">订单数、客单数、退单率</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeOrders}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeOrders: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>流量数据</Label>
                    <p className="text-sm text-muted-foreground">访客数、浏览量</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeTraffic}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeTraffic: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>转化数据</Label>
                    <p className="text-sm text-muted-foreground">转化率、加购率</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeConversion}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeConversion: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>广告数据</Label>
                    <p className="text-sm text-muted-foreground">花费、ROI、CPC</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeAdvertising}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeAdvertising: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>利润数据</Label>
                    <p className="text-sm text-muted-foreground">毛利率、净利润</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeProfit}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeProfit: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>库存数据</Label>
                    <p className="text-sm text-muted-foreground">库存周转、呆滞库存</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeInventory}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeInventory: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>客户数据</Label>
                    <p className="text-sm text-muted-foreground">复购率、好评率</p>
                  </div>
                  <Switch 
                    checked={metricsConfig.includeCustomerMetrics}
                    onCheckedChange={(checked) => setMetricsConfig({...metricsConfig, includeCustomerMetrics: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 告警配置 */}
        <TabsContent value="alert">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                告警配置
              </CardTitle>
              <CardDescription>配置异常告警的触发条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>启用异常告警</Label>
                  <p className="text-sm text-muted-foreground">检测到异常时发送告警通知</p>
                </div>
                <Switch 
                  checked={alertConfig.enableAlerts}
                  onCheckedChange={(checked) => setAlertConfig({...alertConfig, enableAlerts: checked})}
                />
              </div>

              {alertConfig.enableAlerts && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="salesDropThreshold">销量下降告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="salesDropThreshold" 
                          type="number"
                          className="w-24"
                          value={alertConfig.salesDropThreshold}
                          onChange={(e) => setAlertConfig({...alertConfig, salesDropThreshold: parseFloat(e.target.value)})}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        销量较上期下降超过此值时触发告警
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inventoryLowThreshold">库存不足告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="inventoryLowThreshold" 
                          type="number"
                          className="w-24"
                          value={alertConfig.inventoryLowThreshold}
                          onChange={(e) => setAlertConfig({...alertConfig, inventoryLowThreshold: parseFloat(e.target.value)})}
                        />
                        <span className="text-muted-foreground">件</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profitMarginThreshold">利润率告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="profitMarginThreshold" 
                          type="number"
                          className="w-24"
                          value={alertConfig.profitMarginThreshold}
                          onChange={(e) => setAlertConfig({...alertConfig, profitMarginThreshold: parseFloat(e.target.value)})}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        毛利率低于此值时触发告警
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adRoiLowThreshold">广告ROI告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="adRoiLowThreshold" 
                          type="number"
                          step="0.1"
                          className="w-24"
                          value={alertConfig.adRoiLowThreshold}
                          onChange={(e) => setAlertConfig({...alertConfig, adRoiLowThreshold: parseFloat(e.target.value)})}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        广告ROI低于此值时触发告警
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="negativeReviewThreshold">差评率告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="negativeReviewThreshold" 
                          type="number"
                          className="w-24"
                          value={alertConfig.negativeReviewThreshold}
                          onChange={(e) => setAlertConfig({...alertConfig, negativeReviewThreshold: parseFloat(e.target.value)})}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refundRateThreshold">退款率告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="refundRateThreshold" 
                          type="number"
                          className="w-24"
                          value={alertConfig.refundRateThreshold}
                          onChange={(e) => setAlertConfig({...alertConfig, refundRateThreshold: parseFloat(e.target.value)})}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 输出配置 */}
        <TabsContent value="output">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileOutput className="h-5 w-5" />
                输出配置
              </CardTitle>
              <CardDescription>配置报告的输出格式和行为</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultFormat">默认报告格式</Label>
                <Select value={outputConfig.defaultFormat} onValueChange={(v) => setOutputConfig({...outputConfig, defaultFormat: v})}>
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

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含图表</Label>
                  <p className="text-sm text-muted-foreground">在报告中展示可视化图表</p>
                </div>
                <Switch 
                  checked={outputConfig.includeCharts}
                  onCheckedChange={(checked) => setOutputConfig({...outputConfig, includeCharts: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含行动项</Label>
                  <p className="text-sm text-muted-foreground">生成可执行的下一步行动清单</p>
                </div>
                <Switch 
                  checked={outputConfig.includeActionItems}
                  onCheckedChange={(checked) => setOutputConfig({...outputConfig, includeActionItems: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动导出</Label>
                  <p className="text-sm text-muted-foreground">分析完成后自动导出报告</p>
                </div>
                <Switch 
                  checked={outputConfig.autoExport}
                  onCheckedChange={(checked) => setOutputConfig({...outputConfig, autoExport: checked})}
                />
              </div>

              {outputConfig.autoExport && (
                <div className="space-y-2">
                  <Label htmlFor="exportFormat">导出格式</Label>
                  <Select value={outputConfig.exportFormat} onValueChange={(v) => setOutputConfig({...outputConfig, exportFormat: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="ppt">PPT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动发送报告</Label>
                  <p className="text-sm text-muted-foreground">分析完成后自动发送邮件</p>
                </div>
                <Switch 
                  checked={outputConfig.autoSendReport}
                  onCheckedChange={(checked) => setOutputConfig({...outputConfig, autoSendReport: checked})}
                />
              </div>

              {outputConfig.autoSendReport && (
                <div className="space-y-2">
                  <Label htmlFor="reportRecipients">收件人邮箱</Label>
                  <Input 
                    id="reportRecipients" 
                    placeholder="多个邮箱用逗号分隔"
                    value={outputConfig.reportRecipients}
                    onChange={(e) => setOutputConfig({...outputConfig, reportRecipients: e.target.value})}
                  />
                </div>
              )}
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
