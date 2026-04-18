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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  FileText, 
  Type, 
  Search, 
  Globe, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function ListingOptimizationAgentConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // 基本信息配置
  const [config, setConfig] = useState({
    name: 'Listing优化智能体',
    enabled: true,
    model: 'doubao-seed-1-8-251228',
  });

  // 标题配置
  const [titleConfig, setTitleConfig] = useState({
    maxLength: 200,
    includeBrand: true,
    includeKeywords: true,
    keywordCount: 5,
    titleStyle: 'descriptive',
    capitalizeTitle: true,
  });

  // 关键词配置
  const [keywordConfig, setKeywordConfig] = useState({
    autoSuggest: true,
    maxKeywords: 30,
    includeLongTail: true,
    keywordSource: 'all',
    competitorAnalysis: true,
  });

  // 描述配置
  const [descriptionConfig, setDescriptionConfig] = useState({
    minLength: 100,
    maxLength: 2000,
    includeFeatures: true,
    includeBenefits: true,
    includeBrand: true,
    bulletPointCount: 5,
    seoOptimized: true,
  });

  // 平台配置
  const [platformConfig, setPlatformConfig] = useState({
    defaultPlatform: 'amazon',
    autoLocalize: true,
    complianceCheck: true,
    platformGuidelines: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Listing优化智能体配置已保存');
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
            <FileText className="h-6 w-6" />
            Listing优化智能体配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置标题、描述、关键词优化的默认参数和行为
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
          <TabsTrigger value="title">标题配置</TabsTrigger>
          <TabsTrigger value="keyword">关键词配置</TabsTrigger>
          <TabsTrigger value="description">描述配置</TabsTrigger>
          <TabsTrigger value="platform">平台配置</TabsTrigger>
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
                      <SelectItem value="doubao-seed-1-8-251228">豆包Lite (推荐Listing)</SelectItem>
                      <SelectItem value="doubao-pro-4-250115">豆包Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">
                    控制智能体是否接受Listing优化任务
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

        {/* 标题配置 */}
        <TabsContent value="title">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                标题配置
              </CardTitle>
              <CardDescription>配置产品标题的生成规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxLength">最大字符长度</Label>
                  <Input 
                    id="maxLength" 
                    type="number"
                    value={titleConfig.maxLength}
                    onChange={(e) => setTitleConfig({...titleConfig, maxLength: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    亚马逊建议标题长度不超过200字符
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleStyle">标题风格</Label>
                  <Select value={titleConfig.titleStyle} onValueChange={(v) => setTitleConfig({...titleConfig, titleStyle: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descriptive">描述型</SelectItem>
                      <SelectItem value="keyword">关键词型</SelectItem>
                      <SelectItem value="balanced">平衡型</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="keywordCount">关键词数量</Label>
                  <Input 
                    id="keywordCount" 
                    type="number"
                    value={titleConfig.keywordCount}
                    onChange={(e) => setTitleConfig({...titleConfig, keywordCount: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>首字母大写</Label>
                    <p className="text-sm text-muted-foreground">每个单词首字母大写</p>
                  </div>
                  <Switch 
                    checked={titleConfig.capitalizeTitle}
                    onCheckedChange={(checked) => setTitleConfig({...titleConfig, capitalizeTitle: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含品牌名</Label>
                  <p className="text-sm text-muted-foreground">标题中包含品牌名称</p>
                </div>
                <Switch 
                  checked={titleConfig.includeBrand}
                  onCheckedChange={(checked) => setTitleConfig({...titleConfig, includeBrand: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含核心关键词</Label>
                  <p className="text-sm text-muted-foreground">标题中包含核心搜索关键词</p>
                </div>
                <Switch 
                  checked={titleConfig.includeKeywords}
                  onCheckedChange={(checked) => setTitleConfig({...titleConfig, includeKeywords: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 关键词配置 */}
        <TabsContent value="keyword">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                关键词配置
              </CardTitle>
              <CardDescription>配置关键词挖掘和分析规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxKeywords">最大关键词数量</Label>
                  <Input 
                    id="maxKeywords" 
                    type="number"
                    value={keywordConfig.maxKeywords}
                    onChange={(e) => setKeywordConfig({...keywordConfig, maxKeywords: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywordSource">关键词来源</Label>
                  <Select value={keywordConfig.keywordSource} onValueChange={(v) => setKeywordConfig({...keywordConfig, keywordSource: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部来源</SelectItem>
                      <SelectItem value="search">搜索建议</SelectItem>
                      <SelectItem value="competitor">竞品分析</SelectItem>
                      <SelectItem value="platform">平台推荐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动关键词建议</Label>
                  <p className="text-sm text-muted-foreground">基于产品信息自动推荐关键词</p>
                </div>
                <Switch 
                  checked={keywordConfig.autoSuggest}
                  onCheckedChange={(checked) => setKeywordConfig({...keywordConfig, autoSuggest: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含长尾关键词</Label>
                  <p className="text-sm text-muted-foreground">挖掘低竞争长尾关键词</p>
                </div>
                <Switch 
                  checked={keywordConfig.includeLongTail}
                  onCheckedChange={(checked) => setKeywordConfig({...keywordConfig, includeLongTail: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>竞品分析</Label>
                  <p className="text-sm text-muted-foreground">分析竞品Listing获取关键词</p>
                </div>
                <Switch 
                  checked={keywordConfig.competitorAnalysis}
                  onCheckedChange={(checked) => setKeywordConfig({...keywordConfig, competitorAnalysis: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 描述配置 */}
        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                描述配置
              </CardTitle>
              <CardDescription>配置产品描述和五点描述的生成规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minLength">最小字符长度</Label>
                  <Input 
                    id="minLength" 
                    type="number"
                    value={descriptionConfig.minLength}
                    onChange={(e) => setDescriptionConfig({...descriptionConfig, minLength: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLengthDesc">最大字符长度</Label>
                  <Input 
                    id="maxLengthDesc" 
                    type="number"
                    value={descriptionConfig.maxLength}
                    onChange={(e) => setDescriptionConfig({...descriptionConfig, maxLength: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulletCount">五点描述数量</Label>
                <Input 
                  id="bulletCount" 
                  type="number"
                  className="w-32"
                  value={descriptionConfig.bulletPointCount}
                  onChange={(e) => setDescriptionConfig({...descriptionConfig, bulletPointCount: parseInt(e.target.value)})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含产品特点</Label>
                  <p className="text-sm text-muted-foreground">在描述中突出产品核心特点</p>
                </div>
                <Switch 
                  checked={descriptionConfig.includeFeatures}
                  onCheckedChange={(checked) => setDescriptionConfig({...descriptionConfig, includeFeatures: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含产品优势</Label>
                  <p className="text-sm text-muted-foreground">强调产品相对于竞品的优势</p>
                </div>
                <Switch 
                  checked={descriptionConfig.includeBenefits}
                  onCheckedChange={(checked) => setDescriptionConfig({...descriptionConfig, includeBenefits: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>包含品牌信息</Label>
                  <p className="text-sm text-muted-foreground">在描述中添加品牌故事和价值</p>
                </div>
                <Switch 
                  checked={descriptionConfig.includeBrand}
                  onCheckedChange={(checked) => setDescriptionConfig({...descriptionConfig, includeBrand: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SEO优化</Label>
                  <p className="text-sm text-muted-foreground">自动嵌入关键词提升搜索排名</p>
                </div>
                <Switch 
                  checked={descriptionConfig.seoOptimized}
                  onCheckedChange={(checked) => setDescriptionConfig({...descriptionConfig, seoOptimized: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 平台配置 */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                平台配置
              </CardTitle>
              <CardDescription>配置目标平台的规则和合规检查</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultPlatform">默认目标平台</Label>
                <Select value={platformConfig.defaultPlatform} onValueChange={(v) => setPlatformConfig({...platformConfig, defaultPlatform: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">亚马逊 Amazon</SelectItem>
                    <SelectItem value="tiktok">TikTok Shop</SelectItem>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="lazada">Lazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动本地化</Label>
                  <p className="text-sm text-muted-foreground">根据目标市场自动调整语言和文化适配</p>
                </div>
                <Switch 
                  checked={platformConfig.autoLocalize}
                  onCheckedChange={(checked) => setPlatformConfig({...platformConfig, autoLocalize: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>合规检查</Label>
                  <p className="text-sm text-muted-foreground">检查Listing是否符合平台规则</p>
                </div>
                <Switch 
                  checked={platformConfig.complianceCheck}
                  onCheckedChange={(checked) => setPlatformConfig({...platformConfig, complianceCheck: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>遵循平台指南</Label>
                  <p className="text-sm text-muted-foreground">严格遵守各平台的Listing编写规范</p>
                </div>
                <Switch 
                  checked={platformConfig.platformGuidelines}
                  onCheckedChange={(checked) => setPlatformConfig({...platformConfig, platformGuidelines: checked})}
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
