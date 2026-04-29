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
  FileText,
  Type,
  Search,
  Globe,
  Save,
  RefreshCw,
  CheckCircle2,
  Power,
  Settings,
} from 'lucide-react';

export default function ListingOptimizationAgentConfigPage() {
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    name: 'Listing优化SKILL',
    enabled: true,
    model: 'doubao-seed-1-8-251228',
  });

  const [titleConfig, setTitleConfig] = useState({
    maxLength: 200,
    keywordCount: 5,
    includeBrand: true,
    capitalizeTitle: true,
  });

  const [keywordConfig, setKeywordConfig] = useState({
    autoSuggest: true,
    maxKeywords: 30,
    includeLongTail: true,
    competitorAnalysis: true,
  });

  const [platformConfig, setPlatformConfig] = useState({
    defaultPlatform: 'amazon',
    autoLocalize: true,
    complianceCheck: true,
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
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Listing优化SKILL配置</h1>
              <p className="text-sm text-muted-foreground">配置标题、描述、关键词的优化规则</p>
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
                        <SelectItem value="doubao-seed-1-8-251228">豆包Lite (推荐)</SelectItem>
                        <SelectItem value="doubao-pro-4-250115">豆包Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 标题配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  标题配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>最大字符长度</Label>
                    <Input
                      type="number"
                      value={titleConfig.maxLength}
                      onChange={(e) => setTitleConfig({ ...titleConfig, maxLength: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>关键词数量</Label>
                    <Input
                      type="number"
                      value={titleConfig.keywordCount}
                      onChange={(e) => setTitleConfig({ ...titleConfig, keywordCount: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">包含品牌名</p>
                    <p className="text-xs text-muted-foreground">标题中包含品牌名称</p>
                  </div>
                  <Switch
                    checked={titleConfig.includeBrand}
                    onCheckedChange={(checked) => setTitleConfig({ ...titleConfig, includeBrand: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">首字母大写</p>
                    <p className="text-xs text-muted-foreground">每个单词首字母大写</p>
                  </div>
                  <Switch
                    checked={titleConfig.capitalizeTitle}
                    onCheckedChange={(checked) => setTitleConfig({ ...titleConfig, capitalizeTitle: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 关键词配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  关键词配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>最大关键词数量</Label>
                    <Input
                      type="number"
                      value={keywordConfig.maxKeywords}
                      onChange={(e) => setKeywordConfig({ ...keywordConfig, maxKeywords: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动关键词建议</p>
                    <p className="text-xs text-muted-foreground">基于产品信息推荐关键词</p>
                  </div>
                  <Switch
                    checked={keywordConfig.autoSuggest}
                    onCheckedChange={(checked) => setKeywordConfig({ ...keywordConfig, autoSuggest: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">竞品分析</p>
                    <p className="text-xs text-muted-foreground">分析竞品获取关键词</p>
                  </div>
                  <Switch
                    checked={keywordConfig.competitorAnalysis}
                    onCheckedChange={(checked) => setKeywordConfig({ ...keywordConfig, competitorAnalysis: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 平台配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  平台配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>默认目标平台</Label>
                  <Select
                    value={platformConfig.defaultPlatform}
                    onValueChange={(v) => setPlatformConfig({ ...platformConfig, defaultPlatform: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">亚马逊 Amazon</SelectItem>
                      <SelectItem value="tiktok">TikTok Shop</SelectItem>
                      <SelectItem value="shopee">Shopee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动本地化</p>
                    <p className="text-xs text-muted-foreground">根据目标市场调整语言</p>
                  </div>
                  <Switch
                    checked={platformConfig.autoLocalize}
                    onCheckedChange={(checked) => setPlatformConfig({ ...platformConfig, autoLocalize: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">合规检查</p>
                    <p className="text-xs text-muted-foreground">检查是否符合平台规则</p>
                  </div>
                  <Switch
                    checked={platformConfig.complianceCheck}
                    onCheckedChange={(checked) => setPlatformConfig({ ...platformConfig, complianceCheck: checked })}
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
