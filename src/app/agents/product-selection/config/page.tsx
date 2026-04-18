'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
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
  Package, 
  Database, 
  Shield, 
  TrendingUp, 
  FileOutput, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function ProductSelectionAgentConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // 基本信息配置
  const [config, setConfig] = useState({
    name: '选品智能体',
    enabled: true,
    model: 'doubao-seed-1-8-251228',
    apiKey: '',
    apiEndpoint: '',
  });

  // 数据源配置
  const [dataSource, setDataSource] = useState({
    JungleScoutEnabled: true,
    Helium10Enabled: false,
    SorftimeEnabled: false,
    customDataSource: '',
    refreshInterval: 30,
  });

  // 合规规则配置
  const [compliance, setCompliance] = useState({
    enableForbiddenFilter: true,
    enableKeywordBlacklist: true,
    forbiddenCategories: '武器弹药,药品食品,医疗器械,仿真枪,濒危物种,赌博用品,色情用品,仿牌侵权',
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
    ratingThreshold: 4.0,
    reviewCountMin: 50,
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
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('选品智能体配置已保存');
    } catch {
      toast.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            选品智能体配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置选品智能体的基本参数、数据源、合规规则和选品策略
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-fit">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="datasource">数据源配置</TabsTrigger>
          <TabsTrigger value="compliance">合规规则</TabsTrigger>
          <TabsTrigger value="strategy">选品策略</TabsTrigger>
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
                      <SelectItem value="doubao-seed-1-8-251228">豆包Lite (推荐选品)</SelectItem>
                      <SelectItem value="doubao-pro-4-250115">豆包Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">
                    控制智能体是否接受任务请求
                  </p>
                </div>
                <Switch 
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key（可选）</Label>
                  <Input 
                    id="apiKey" 
                    type="password"
                    placeholder="输入第三方选品工具API密钥"
                    value={config.apiKey}
                    onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint（可选）</Label>
                  <Input 
                    id="apiEndpoint" 
                    placeholder="自定义API端点地址"
                    value={config.apiEndpoint}
                    onChange={(e) => setConfig({...config, apiEndpoint: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据源配置 */}
        <TabsContent value="datasource">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                数据源配置
              </CardTitle>
              <CardDescription>配置选品分析的数据来源</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>JungleScout</Label>
                    <p className="text-sm text-muted-foreground">全球最大亚马逊选品数据库</p>
                  </div>
                  <Switch 
                    checked={dataSource.JungleScoutEnabled}
                    onCheckedChange={(checked) => setDataSource({...dataSource, JungleScoutEnabled: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Helium 10</Label>
                    <p className="text-sm text-muted-foreground">专业亚马逊卖家工具套件</p>
                  </div>
                  <Switch 
                    checked={dataSource.Helium10Enabled}
                    onCheckedChange={(checked) => setDataSource({...dataSource, Helium10Enabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sorftime</Label>
                    <p className="text-sm text-muted-foreground">欧洲市场选品分析工具</p>
                  </div>
                  <Switch 
                    checked={dataSource.SorftimeEnabled}
                    onCheckedChange={(checked) => setDataSource({...dataSource, SorftimeEnabled: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="customSource">自定义数据源</Label>
                <Input 
                  id="customSource" 
                  placeholder="输入自定义数据源API地址"
                  value={dataSource.customDataSource}
                  onChange={(e) => setDataSource({...dataSource, customDataSource: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refreshInterval">数据刷新间隔（分钟）</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="refreshInterval" 
                    type="number"
                    className="w-32"
                    value={dataSource.refreshInterval}
                    onChange={(e) => setDataSource({...dataSource, refreshInterval: parseInt(e.target.value)})}
                  />
                  <span className="text-sm text-muted-foreground">
                    建议设置为30-60分钟，过短会增加API调用成本
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 合规规则 */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                合规规则配置
              </CardTitle>
              <CardDescription>配置商品合规性过滤规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">合规风险提示</p>
                    <p className="text-sm text-amber-700 mt-1">
                      请确保配置的禁售品类和关键词黑名单符合各目标市场的法律法规要求。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>启用禁售品类过滤</Label>
                  <p className="text-sm text-muted-foreground">自动过滤禁止销售的商品类目</p>
                </div>
                <Switch 
                  checked={compliance.enableForbiddenFilter}
                  onCheckedChange={(checked) => setCompliance({...compliance, enableForbiddenFilter: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forbiddenCategories">禁售品类列表</Label>
                <Input 
                  id="forbiddenCategories" 
                  placeholder="多个品类用逗号分隔"
                  value={compliance.forbiddenCategories}
                  onChange={(e) => setCompliance({...compliance, forbiddenCategories: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  默认包含：武器弹药、药品食品、医疗器械、仿真枪、濒危物种、赌博用品、色情用品、仿牌侵权
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>启用关键词黑名单</Label>
                  <p className="text-sm text-muted-foreground">过滤包含敏感词的商品</p>
                </div>
                <Switch 
                  checked={compliance.enableKeywordBlacklist}
                  onCheckedChange={(checked) => setCompliance({...compliance, enableKeywordBlacklist: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywordBlacklist">关键词黑名单</Label>
                <Input 
                  id="keywordBlacklist" 
                  placeholder="多个关键词用逗号分隔"
                  value={compliance.keywordBlacklist}
                  onChange={(e) => setCompliance({...compliance, keywordBlacklist: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动拒绝不合规商品</Label>
                  <p className="text-sm text-muted-foreground">不合规商品自动从结果中移除，不进入人工确认环节</p>
                </div>
                <Switch 
                  checked={compliance.autoReject}
                  onCheckedChange={(checked) => setCompliance({...compliance, autoReject: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 选品策略 */}
        <TabsContent value="strategy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                选品策略配置
              </CardTitle>
              <CardDescription>配置选品分析的评估标准和权重</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minMonthlySales">最低月销量</Label>
                  <Input 
                    id="minMonthlySales" 
                    type="number"
                    value={strategy.minMonthlySales}
                    onChange={(e) => setStrategy({...strategy, minMonthlySales: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">低于此销量的商品将被过滤</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minProfitRate">最低利润率（%）</Label>
                  <Input 
                    id="minProfitRate" 
                    type="number"
                    value={strategy.minProfitRate}
                    onChange={(e) => setStrategy({...strategy, minProfitRate: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">低于此利润率的商品将被过滤</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="competitionWeight">竞争度权重</Label>
                  <Input 
                    id="competitionWeight" 
                    type="number"
                    step="0.1"
                    value={strategy.competitionWeight}
                    onChange={(e) => setStrategy({...strategy, competitionWeight: parseFloat(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">数值越高，越倾向于选择竞争较小的市场</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trendWeight">趋势权重</Label>
                  <Input 
                    id="trendWeight" 
                    type="number"
                    step="0.1"
                    value={strategy.trendWeight}
                    onChange={(e) => setStrategy({...strategy, trendWeight: parseFloat(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">数值越高，越倾向于选择增长趋势好的商品</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priceRangeMin">价格区间最小值</Label>
                  <Input 
                    id="priceRangeMin" 
                    type="number"
                    value={strategy.priceRangeMin}
                    onChange={(e) => setStrategy({...strategy, priceRangeMin: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceRangeMax">价格区间最大值</Label>
                  <Input 
                    id="priceRangeMax" 
                    type="number"
                    value={strategy.priceRangeMax}
                    onChange={(e) => setStrategy({...strategy, priceRangeMax: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ratingThreshold">最低评分要求</Label>
                  <Input 
                    id="ratingThreshold" 
                    type="number"
                    step="0.1"
                    value={strategy.ratingThreshold}
                    onChange={(e) => setStrategy({...strategy, ratingThreshold: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewCountMin">最少评价数</Label>
                  <Input 
                    id="reviewCountMin" 
                    type="number"
                    value={strategy.reviewCountMin}
                    onChange={(e) => setStrategy({...strategy, reviewCountMin: parseInt(e.target.value)})}
                  />
                </div>
              </div>
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
              <CardDescription>配置选品结果的输出格式和行为</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultResultCount">默认结果数量</Label>
                  <Input 
                    id="defaultResultCount" 
                    type="number"
                    value={output.defaultResultCount}
                    onChange={(e) => setOutput({...output, defaultResultCount: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxResultCount">最大结果数量</Label>
                  <Input 
                    id="maxResultCount" 
                    type="number"
                    value={output.maxResultCount}
                    onChange={(e) => setOutput({...output, maxResultCount: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sortBy">默认排序方式</Label>
                  <Select value={output.sortBy} onValueChange={(v) => setOutput({...output, sortBy: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">综合评分</SelectItem>
                      <SelectItem value="sales">销量优先</SelectItem>
                      <SelectItem value="profit">利润优先</SelectItem>
                      <SelectItem value="trend">趋势优先</SelectItem>
                      <SelectItem value="competition">竞争度优先</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardFormat">卡片格式</Label>
                  <Select value={output.cardFormat} onValueChange={(v) => setOutput({...output, cardFormat: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">详细格式</SelectItem>
                      <SelectItem value="compact">简洁格式</SelectItem>
                      <SelectItem value="comparison">对比格式</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含分析报告</Label>
                  <p className="text-sm text-muted-foreground">在结果中包含详细的AI分析报告</p>
                </div>
                <Switch 
                  checked={output.includeAnalysis}
                  onCheckedChange={(checked) => setOutput({...output, includeAnalysis: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含供应商信息</Label>
                  <p className="text-sm text-muted-foreground">自动匹配并展示1688供应商信息</p>
                </div>
                <Switch 
                  checked={output.includeSupplier}
                  onCheckedChange={(checked) => setOutput({...output, includeSupplier: checked})}
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
    </MainLayout>
  );
}
