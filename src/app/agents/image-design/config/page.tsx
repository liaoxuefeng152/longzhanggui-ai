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
  Image, 
  Palette, 
  Languages, 
  FileOutput, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function ImageDesignAgentConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // 基本信息配置
  const [config, setConfig] = useState({
    name: '图片智能体',
    enabled: true,
    model: 'doubao-pro-4-250115',
  });

  // 图片处理配置
  const [processing, setProcessing] = useState({
    defaultMode: 'translate',
    autoEnhance: true,
    preserveAspectRatio: true,
    maxImageSize: 10,
    supportedFormats: 'PNG,JPG,JPEG,WebP',
  });

  // 语言配置
  const [languages, setLanguages] = useState({
    defaultTargetLang: 'en',
    autoDetect: true,
    translateQuality: 'high',
    preserveText: false,
  });

  // 输出配置
  const [output, setOutput] = useState({
    defaultFormat: 'PNG',
    defaultQuality: 95,
    outputResolution: 'original',
    addWatermark: false,
    watermarkText: '',
    backgroundColor: 'transparent',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('图片智能体配置已保存');
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
            <Image className="h-6 w-6" />
            图片智能体配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置图片翻译、主图优化、白底处理的默认参数和行为
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
        <TabsList className="grid grid-cols-4 w-fit">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="processing">处理配置</TabsTrigger>
          <TabsTrigger value="language">语言配置</TabsTrigger>
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
                      <SelectItem value="doubao-pro-4-250115">豆包Pro (推荐图片)</SelectItem>
                      <SelectItem value="doubao-vision-250115">豆包视觉模型</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">
                    控制智能体是否接受图片处理任务
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

        {/* 处理配置 */}
        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                图片处理配置
              </CardTitle>
              <CardDescription>配置图片处理的核心参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultMode">默认处理模式</Label>
                  <Select value={processing.defaultMode} onValueChange={(v) => setProcessing({...processing, defaultMode: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="translate">翻译模式</SelectItem>
                      <SelectItem value="whitened">白底模式</SelectItem>
                      <SelectItem value="enhanced">优化模式</SelectItem>
                      <SelectItem value="resized">尺寸调整</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxImageSize">最大图片大小（MB）</Label>
                  <Input 
                    id="maxImageSize" 
                    type="number"
                    value={processing.maxImageSize}
                    onChange={(e) => setProcessing({...processing, maxImageSize: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动增强</Label>
                  <p className="text-sm text-muted-foreground">自动优化图片亮度、对比度、锐度</p>
                </div>
                <Switch 
                  checked={processing.autoEnhance}
                  onCheckedChange={(checked) => setProcessing({...processing, autoEnhance: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>保持宽高比</Label>
                  <p className="text-sm text-muted-foreground">调整尺寸时保持原始宽高比例</p>
                </div>
                <Switch 
                  checked={processing.preserveAspectRatio}
                  onCheckedChange={(checked) => setProcessing({...processing, preserveAspectRatio: checked})}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>支持的图片格式</Label>
                <div className="flex flex-wrap gap-2">
                  {['PNG', 'JPG', 'JPEG', 'WebP', 'GIF', 'BMP'].map(format => (
                    <Badge key={format} variant="outline">{format}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">系统自动支持以上所有格式</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 语言配置 */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                语言配置
              </CardTitle>
              <CardDescription>配置翻译处理的语言参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultTargetLang">默认目标语言</Label>
                  <Select value={languages.defaultTargetLang} onValueChange={(v) => setLanguages({...languages, defaultTargetLang: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">英文 (EN)</SelectItem>
                      <SelectItem value="zh">中文 (ZH)</SelectItem>
                      <SelectItem value="id">印尼语 (ID)</SelectItem>
                      <SelectItem value="th">泰语 (TH)</SelectItem>
                      <SelectItem value="vi">越南语 (VI)</SelectItem>
                      <SelectItem value="ms">马来语 (MS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="translateQuality">翻译质量</Label>
                  <Select value={languages.translateQuality} onValueChange={(v) => setLanguages({...languages, translateQuality: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高质量（较慢）</SelectItem>
                      <SelectItem value="medium">标准质量</SelectItem>
                      <SelectItem value="fast">快速翻译</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动检测源语言</Label>
                  <p className="text-sm text-muted-foreground">自动识别图片中的文字语言</p>
                </div>
                <Switch 
                  checked={languages.autoDetect}
                  onCheckedChange={(checked) => setLanguages({...languages, autoDetect: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>保留原文</Label>
                  <p className="text-sm text-muted-foreground">在译文旁保留原始文字作为参考</p>
                </div>
                <Switch 
                  checked={languages.preserveText}
                  onCheckedChange={(checked) => setLanguages({...languages, preserveText: checked})}
                />
              </div>

              <Separator />

              <div>
                <Label className="mb-4 block">支持的语言列表</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="secondary">中文 zh</Badge>
                  <Badge variant="secondary">英文 en</Badge>
                  <Badge variant="secondary">印尼语 id</Badge>
                  <Badge variant="secondary">泰语 th</Badge>
                  <Badge variant="secondary">越南语 vi</Badge>
                  <Badge variant="secondary">马来语 ms</Badge>
                  <Badge variant="secondary">日语 ja</Badge>
                  <Badge variant="secondary">韩语 ko</Badge>
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
              <CardDescription>配置处理结果的输出格式和质量</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultFormat">默认输出格式</Label>
                  <Select value={output.defaultFormat} onValueChange={(v) => setOutput({...output, defaultFormat: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PNG">PNG（推荐）</SelectItem>
                      <SelectItem value="JPG">JPG</SelectItem>
                      <SelectItem value="WebP">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultQuality">图片质量（%）</Label>
                  <Input 
                    id="defaultQuality" 
                    type="number"
                    min={1}
                    max={100}
                    value={output.defaultQuality}
                    onChange={(e) => setOutput({...output, defaultQuality: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="outputResolution">输出分辨率</Label>
                  <Select value={output.outputResolution} onValueChange={(v) => setOutput({...output, outputResolution: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">保持原始分辨率</SelectItem>
                      <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                      <SelectItem value="720p">720p (1280x720)</SelectItem>
                      <SelectItem value="480p">480p (854x480)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">背景颜色</Label>
                  <Select value={output.backgroundColor} onValueChange={(v) => setOutput({...output, backgroundColor: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transparent">透明</SelectItem>
                      <SelectItem value="white">白色</SelectItem>
                      <SelectItem value="black">黑色</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>添加水印</Label>
                  <p className="text-sm text-muted-foreground">在图片右下角添加水印</p>
                </div>
                <Switch 
                  checked={output.addWatermark}
                  onCheckedChange={(checked) => setOutput({...output, addWatermark: checked})}
                />
              </div>

              {output.addWatermark && (
                <div className="space-y-2">
                  <Label htmlFor="watermarkText">水印文字</Label>
                  <Input 
                    id="watermarkText" 
                    placeholder="输入水印文字"
                    value={output.watermarkText}
                    onChange={(e) => setOutput({...output, watermarkText: e.target.value})}
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
