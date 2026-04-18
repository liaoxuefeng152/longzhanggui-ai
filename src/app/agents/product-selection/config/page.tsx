'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Package,
  Database,
  Shield,
  TrendingUp,
  FileOutput,
  Save,
  RefreshCw,
  CheckCircle2,
  Power,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export default function ProductSelectionAgentConfigPage() {
  const [loading, setLoading] = useState(false);

  // 基本信息配置
  const [config, setConfig] = useState({
    name: '选品智能体',
    enabled: true,
    model: 'doubao-seed-1-8-251228',
  });

  // 数据源配置
  const [dataSource, setDataSource] = useState({
    JungleScoutEnabled: true,
    Helium10Enabled: false,
    SorftimeEnabled: false,
    refreshInterval: 30,
  });

  // 合规规则配置
  const [compliance, setCompliance] = useState({
    enableForbiddenFilter: true,
    enableKeywordBlacklist: true,
    forbiddenCategories: '武器弹药,药品食品,医疗器械,仿真枪,濒危物种',
    keywordBlacklist: 'fake,replica,counterfeit,clone,knockoff',
    autoReject: true,
  });

  // 选品策略配置
  const [strategy, setStrategy] = useState({
    minMonthlySales: 1000,
    minProfitRate: 20,
    competitionWeight: 0.3,
    trendWeight: 0.4,
    priceRangeMin: 5,
    priceRangeMax: 100,
  });

  // 输出配置
  const [output, setOutput] = useState({
    defaultResultCount: 10,
    maxResultCount: 50,
    sortBy: 'comprehensive',
    cardFormat: 'detailed',
    includeAnalysis: true,
    includeSupplier: true,
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
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">选品智能体配置</h1>
              <p className="text-sm text-muted-foreground">配置选品智能体的运行参数</p>
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
          {/* 左侧配置面板 */}
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
                    <Input
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>绑定模型</Label>
                    <Select
                      value={config.model}
                      onValueChange={(v) => setConfig({ ...config, model: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doubao-seed-1-8-251228">豆包Lite (推荐选品)</SelectItem>
                        <SelectItem value="doubao-pro-4-250115">豆包Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据源配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  数据源配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">JungleScout</p>
                      <p className="text-xs text-muted-foreground">亚马逊选品数据</p>
                    </div>
                    <Switch
                      checked={dataSource.JungleScoutEnabled}
                      onCheckedChange={(checked) =>
                        setDataSource({ ...dataSource, JungleScoutEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Helium 10</p>
                      <p className="text-xs text-muted-foreground">卖家工具套件</p>
                    </div>
                    <Switch
                      checked={dataSource.Helium10Enabled}
                      onCheckedChange={(checked) =>
                        setDataSource({ ...dataSource, Helium10Enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Sorftime</p>
                      <p className="text-xs text-muted-foreground">欧洲市场分析</p>
                    </div>
                    <Switch
                      checked={dataSource.SorftimeEnabled}
                      onCheckedChange={(checked) =>
                        setDataSource({ ...dataSource, SorftimeEnabled: checked })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 space-y-2">
                    <Label>数据刷新间隔</Label>
                    <Select
                      value={String(dataSource.refreshInterval)}
                      onValueChange={(v) => setDataSource({ ...dataSource, refreshInterval: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15分钟</SelectItem>
                        <SelectItem value="30">30分钟</SelectItem>
                        <SelectItem value="60">1小时</SelectItem>
                        <SelectItem value="120">2小时</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">建议30-60分钟</p>
                </div>
              </CardContent>
            </Card>

            {/* 合规规则 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  合规规则
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-800">请确保配置的规则符合各目标市场的法律法规要求</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">禁售品类过滤</p>
                      <p className="text-xs text-muted-foreground">自动过滤禁止销售的类目</p>
                    </div>
                    <Switch
                      checked={compliance.enableForbiddenFilter}
                      onCheckedChange={(checked) =>
                        setCompliance({ ...compliance, enableForbiddenFilter: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">关键词黑名单</p>
                      <p className="text-xs text-muted-foreground">过滤敏感词商品</p>
                    </div>
                    <Switch
                      checked={compliance.enableKeywordBlacklist}
                      onCheckedChange={(checked) =>
                        setCompliance({ ...compliance, enableKeywordBlacklist: checked })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>禁售品类列表</Label>
                  <Input
                    value={compliance.forbiddenCategories}
                    onChange={(e) => setCompliance({ ...compliance, forbiddenCategories: e.target.value })}
                    placeholder="多个品类用逗号分隔"
                  />
                </div>
                <div className="space-y-2">
                  <Label>关键词黑名单</Label>
                  <Input
                    value={compliance.keywordBlacklist}
                    onChange={(e) => setCompliance({ ...compliance, keywordBlacklist: e.target.value })}
                    placeholder="多个关键词用逗号分隔"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动拒绝不合规商品</p>
                    <p className="text-xs text-muted-foreground">不合规商品自动从结果中移除</p>
                  </div>
                  <Switch
                    checked={compliance.autoReject}
                    onCheckedChange={(checked) =>
                      setCompliance({ ...compliance, autoReject: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 选品策略 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  选品策略
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>最低月销量</Label>
                    <Input
                      type="number"
                      value={strategy.minMonthlySales}
                      onChange={(e) => setStrategy({ ...strategy, minMonthlySales: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最低利润率(%)</Label>
                    <Input
                      type="number"
                      value={strategy.minProfitRate}
                      onChange={(e) => setStrategy({ ...strategy, minProfitRate: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>竞争度权重</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={strategy.competitionWeight}
                      onChange={(e) => setStrategy({ ...strategy, competitionWeight: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>趋势权重</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={strategy.trendWeight}
                      onChange={(e) => setStrategy({ ...strategy, trendWeight: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>价格区间最小值</Label>
                    <Input
                      type="number"
                      value={strategy.priceRangeMin}
                      onChange={(e) => setStrategy({ ...strategy, priceRangeMin: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>价格区间最大值</Label>
                    <Input
                      type="number"
                      value={strategy.priceRangeMax}
                      onChange={(e) => setStrategy({ ...strategy, priceRangeMax: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>默认结果数量</Label>
                    <Input
                      type="number"
                      value={output.defaultResultCount}
                      onChange={(e) => setOutput({ ...output, defaultResultCount: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最大结果数量</Label>
                    <Input
                      type="number"
                      value={output.maxResultCount}
                      onChange={(e) => setOutput({ ...output, maxResultCount: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>排序方式</Label>
                    <Select
                      value={output.sortBy}
                      onValueChange={(v) => setOutput({ ...output, sortBy: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">综合评分</SelectItem>
                        <SelectItem value="sales">销量优先</SelectItem>
                        <SelectItem value="profit">利润优先</SelectItem>
                        <SelectItem value="trend">趋势优先</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">包含分析报告</p>
                      <p className="text-xs text-muted-foreground">展示详细的AI分析</p>
                    </div>
                    <Switch
                      checked={output.includeAnalysis}
                      onCheckedChange={(checked) => setOutput({ ...output, includeAnalysis: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">包含供应商信息</p>
                      <p className="text-xs text-muted-foreground">自动匹配1688供应商</p>
                    </div>
                    <Switch
                      checked={output.includeSupplier}
                      onCheckedChange={(checked) => setOutput({ ...output, includeSupplier: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧状态面板 */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* 快速状态 */}
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
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">绑定模型</span>
                  <span className="text-sm font-medium">豆包Lite</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">数据源</span>
                  <span className="text-sm font-medium">
                    {[dataSource.JungleScoutEnabled && 'JS', dataSource.Helium10Enabled && 'H10', dataSource.SorftimeEnabled && 'SF'].filter(Boolean).join(', ') || '未启用'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重置为默认
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileOutput className="h-4 w-4 mr-2" />
                  导出配置
                </Button>
              </CardContent>
            </Card>

            {/* 保存按钮 */}
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
