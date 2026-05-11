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
  Image,
  Palette,
  Languages,
  FileOutput,
  Save,
  RefreshCw,
  CheckCircle2,
  Power,
  Settings,
} from 'lucide-react';

export default function ImageDesignAgentConfigPage() {
  const [loading, setLoading] = useState(false);

  // 基本信息配置
  const [config, setConfig] = useState({
    name: '图片SKILL',
    enabled: true,
    model: 'doubao-pro-4-250115',
  });

  // 处理配置
  const [processing, setProcessing] = useState({
    defaultMode: 'translate',
    autoEnhance: true,
    maxImageSize: 10,
  });

  // 语言配置
  const [languages, setLanguages] = useState({
    defaultTargetLang: 'en',
    autoDetect: true,
    translateQuality: 'high',
  });

  // 输出配置
  const [output, setOutput] = useState({
    defaultFormat: 'PNG',
    defaultQuality: 95,
    addWatermark: false,
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
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">图片SKILL配置</h1>
              <p className="text-sm text-muted-foreground">配置图片翻译和处理的默认参数</p>
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
                    <Label>SKILL名称</Label>
                    <Input
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>绑定模型</Label>
                    <Select value={config.model} onValueChange={(v) => setConfig({ ...config, model: v })}>
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
              </CardContent>
            </Card>

            {/* 处理配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  处理配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>默认处理模式</Label>
                    <Select
                      value={processing.defaultMode}
                      onValueChange={(v) => setProcessing({ ...processing, defaultMode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="translate">翻译模式</SelectItem>
                        <SelectItem value="whitened">白底模式</SelectItem>
                        <SelectItem value="enhanced">优化模式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>最大图片大小 (MB)</Label>
                    <Input
                      type="number"
                      value={processing.maxImageSize}
                      onChange={(e) => setProcessing({ ...processing, maxImageSize: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动增强</p>
                    <p className="text-xs text-muted-foreground">自动优化图片亮度、对比度</p>
                  </div>
                  <Switch
                    checked={processing.autoEnhance}
                    onCheckedChange={(checked) => setProcessing({ ...processing, autoEnhance: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 语言配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  语言配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>默认目标语言</Label>
                    <Select
                      value={languages.defaultTargetLang}
                      onValueChange={(v) => setLanguages({ ...languages, defaultTargetLang: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">英文 (EN)</SelectItem>
                        <SelectItem value="zh">中文 (ZH)</SelectItem>
                        <SelectItem value="id">印尼语 (ID)</SelectItem>
                        <SelectItem value="th">泰语 (TH)</SelectItem>
                        <SelectItem value="vi">越南语 (VI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>翻译质量</Label>
                    <Select
                      value={languages.translateQuality}
                      onValueChange={(v) => setLanguages({ ...languages, translateQuality: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高质量</SelectItem>
                        <SelectItem value="medium">标准</SelectItem>
                        <SelectItem value="fast">快速</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动检测源语言</p>
                    <p className="text-xs text-muted-foreground">自动识别图片中的文字语言</p>
                  </div>
                  <Switch
                    checked={languages.autoDetect}
                    onCheckedChange={(checked) => setLanguages({ ...languages, autoDetect: checked })}
                  />
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
                    <Label>输出格式</Label>
                    <Select
                      value={output.defaultFormat}
                      onValueChange={(v) => setOutput({ ...output, defaultFormat: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PNG">PNG</SelectItem>
                        <SelectItem value="JPG">JPG</SelectItem>
                        <SelectItem value="WebP">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>图片质量 (%)</Label>
                    <Input
                      type="number"
                      value={output.defaultQuality}
                      onChange={(e) => setOutput({ ...output, defaultQuality: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">添加水印</p>
                    <p className="text-xs text-muted-foreground">在图片右下角添加水印</p>
                  </div>
                  <Switch
                    checked={output.addWatermark}
                    onCheckedChange={(checked) => setOutput({ ...output, addWatermark: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧状态面板 */}
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
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">绑定模型</span>
                  <span className="text-sm font-medium">豆包Pro</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重置为默认
                </Button>
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
