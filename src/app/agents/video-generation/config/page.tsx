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
  Video,
  Film,
  Clock,
  FileOutput,
  Save,
  RefreshCw,
  CheckCircle2,
  Power,
  Settings,
} from 'lucide-react';

export default function VideoGenerationAgentConfigPage() {
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    name: '视频生成智能体',
    enabled: true,
    model: 'doubao-video-250115',
  });

  const [videoParams, setVideoParams] = useState({
    defaultDuration: 5,
    maxDuration: 10,
    defaultResolution: '720p',
    fps: 30,
    enableAudio: true,
    motionIntensity: 50,
  });

  const [output, setOutput] = useState({
    defaultFormat: 'MP4',
    defaultQuality: 'high',
    addWatermark: false,
    generateThumbnail: true,
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
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">视频生成智能体配置</h1>
              <p className="text-sm text-muted-foreground">配置图文转视频和AI生视频的参数</p>
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
                        <SelectItem value="doubao-video-250115">豆包视频模型</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 视频参数 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  视频参数
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>默认时长 (秒)</Label>
                    <Input
                      type="number"
                      value={videoParams.defaultDuration}
                      onChange={(e) => setVideoParams({ ...videoParams, defaultDuration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>分辨率</Label>
                    <Select
                      value={videoParams.defaultResolution}
                      onValueChange={(v) => setVideoParams({ ...videoParams, defaultResolution: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="480p">480p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>帧率 (FPS)</Label>
                    <Select
                      value={String(videoParams.fps)}
                      onValueChange={(v) => setVideoParams({ ...videoParams, fps: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>运动强度</Label>
                    <span className="text-sm text-muted-foreground">{videoParams.motionIntensity}%</span>
                  </div>
                  <Slider
                    value={[videoParams.motionIntensity]}
                    onValueChange={(value: number[]) => setVideoParams({ ...videoParams, motionIntensity: value[0] })}
                    min={10}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">启用音频</p>
                    <p className="text-xs text-muted-foreground">为视频生成背景音乐</p>
                  </div>
                  <Switch
                    checked={videoParams.enableAudio}
                    onCheckedChange={(checked) => setVideoParams({ ...videoParams, enableAudio: checked })}
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
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="MP4">MP4 (H.264)</SelectItem>
                        <SelectItem value="WebM">WebM (VP9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>输出质量</Label>
                    <Select
                      value={output.defaultQuality}
                      onValueChange={(v) => setOutput({ ...output, defaultQuality: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高质量</SelectItem>
                        <SelectItem value="medium">标准</SelectItem>
                        <SelectItem value="low">低质量</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">添加水印</p>
                    <p className="text-xs text-muted-foreground">在视频右下角添加水印</p>
                  </div>
                  <Switch
                    checked={output.addWatermark}
                    onCheckedChange={(checked) => setOutput({ ...output, addWatermark: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">生成缩略图</p>
                    <p className="text-xs text-muted-foreground">自动生成视频封面</p>
                  </div>
                  <Switch
                    checked={output.generateThumbnail}
                    onCheckedChange={(checked) => setOutput({ ...output, generateThumbnail: checked })}
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
