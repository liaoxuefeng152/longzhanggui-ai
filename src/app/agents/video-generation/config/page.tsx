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
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Video, 
  Film, 
  Clock, 
  FileOutput, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function VideoGenerationAgentConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // 基本信息配置
  const [config, setConfig] = useState({
    name: '视频生成智能体',
    enabled: true,
    model: 'doubao-video-250115',
  });

  // 视频参数配置
  const [videoParams, setVideoParams] = useState({
    defaultDuration: 5,
    maxDuration: 10,
    defaultResolution: '720p',
    defaultAspectRatio: '16:9',
    fps: 30,
    enableAudio: true,
  });

  // 生成策略配置
  const [generation, setGeneration] = useState({
    defaultStyle: 'realistic',
    enableImage2Video: true,
    enableText2Video: true,
    maxConcurrentJobs: 3,
    autoEnhance: true,
    motionIntensity: 50,
  });

  // 输出配置
  const [output, setOutput] = useState({
    defaultFormat: 'MP4',
    defaultQuality: 'high',
    addWatermark: false,
    watermarkPosition: 'bottom-right',
    generateThumbnail: true,
    generatePreview: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('视频生成智能体配置已保存');
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
            <Video className="h-6 w-6" />
            视频生成智能体配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置图文转视频、AI生视频的默认参数和行为
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
          <TabsTrigger value="video">视频参数</TabsTrigger>
          <TabsTrigger value="generation">生成策略</TabsTrigger>
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
                      <SelectItem value="doubao-video-250115">豆包视频模型</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">
                    控制智能体是否接受视频生成任务
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

        {/* 视频参数 */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                视频参数配置
              </CardTitle>
              <CardDescription>配置视频生成的核心参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultDuration">默认视频时长（秒）</Label>
                  <Input 
                    id="defaultDuration" 
                    type="number"
                    value={videoParams.defaultDuration}
                    onChange={(e) => setVideoParams({...videoParams, defaultDuration: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDuration">最大视频时长（秒）</Label>
                  <Input 
                    id="maxDuration" 
                    type="number"
                    value={videoParams.maxDuration}
                    onChange={(e) => setVideoParams({...videoParams, maxDuration: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultResolution">默认分辨率</Label>
                  <Select value={videoParams.defaultResolution} onValueChange={(v) => setVideoParams({...videoParams, defaultResolution: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="480p">480p (854x480)</SelectItem>
                      <SelectItem value="720p">720p (1280x720)</SelectItem>
                      <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultAspectRatio">默认宽高比</Label>
                  <Select value={videoParams.defaultAspectRatio} onValueChange={(v) => setVideoParams({...videoParams, defaultAspectRatio: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (横版)</SelectItem>
                      <SelectItem value="9:16">9:16 (竖版)</SelectItem>
                      <SelectItem value="1:1">1:1 (方形)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fps">帧率 (FPS)</Label>
                  <Select value={String(videoParams.fps)} onValueChange={(v) => setVideoParams({...videoParams, fps: parseInt(v)})}>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label>启用音频</Label>
                    <p className="text-sm text-muted-foreground">为视频生成背景音乐</p>
                  </div>
                  <Switch 
                    checked={videoParams.enableAudio}
                    onCheckedChange={(checked) => setVideoParams({...videoParams, enableAudio: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生成策略 */}
        <TabsContent value="generation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                生成策略配置
              </CardTitle>
              <CardDescription>配置视频生成的行为策略</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultStyle">默认视频风格</Label>
                <Select value={generation.defaultStyle} onValueChange={(v) => setGeneration({...generation, defaultStyle: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">写实风格</SelectItem>
                    <SelectItem value="animation">动画风格</SelectItem>
                    <SelectItem value="cartoon">卡通风格</SelectItem>
                    <SelectItem value="3d">3D渲染</SelectItem>
                    <SelectItem value="cinematic">电影感</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>启用图文转视频</Label>
                  <p className="text-sm text-muted-foreground">支持上传图片生成视频内容</p>
                </div>
                <Switch 
                  checked={generation.enableImage2Video}
                  onCheckedChange={(checked) => setGeneration({...generation, enableImage2Video: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>启用文字转视频</Label>
                  <p className="text-sm text-muted-foreground">支持纯文字描述生成视频</p>
                </div>
                <Switch 
                  checked={generation.enableText2Video}
                  onCheckedChange={(checked) => setGeneration({...generation, enableText2Video: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动优化</Label>
                  <p className="text-sm text-muted-foreground">自动优化视频色彩和过渡效果</p>
                </div>
                <Switch 
                  checked={generation.autoEnhance}
                  onCheckedChange={(checked) => setGeneration({...generation, autoEnhance: checked})}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>运动强度</Label>
                  <span className="text-sm text-muted-foreground">{generation.motionIntensity}%</span>
                </div>
                <Slider 
                  value={[generation.motionIntensity]} 
                  onValueChange={(value: number[]) => setGeneration({...generation, motionIntensity: value[0]})}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  控制视频中物体运动的幅度，高强度适合动作场景，低强度适合产品展示
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="maxConcurrentJobs">最大并发任务数</Label>
                <Input 
                  id="maxConcurrentJobs" 
                  type="number"
                  className="w-32"
                  value={generation.maxConcurrentJobs}
                  onChange={(e) => setGeneration({...generation, maxConcurrentJobs: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  同时进行的视频生成任务数量上限，建议根据API配额设置
                </p>
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
              <CardDescription>配置视频输出格式和质量</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultFormat">输出格式</Label>
                  <Select value={output.defaultFormat} onValueChange={(v) => setOutput({...output, defaultFormat: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MP4">MP4 (H.264)</SelectItem>
                      <SelectItem value="WebM">WebM (VP9)</SelectItem>
                      <SelectItem value="MOV">MOV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultQuality">输出质量</Label>
                  <Select value={output.defaultQuality} onValueChange={(v) => setOutput({...output, defaultQuality: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高质量（文件较大）</SelectItem>
                      <SelectItem value="medium">标准质量</SelectItem>
                      <SelectItem value="low">低质量（文件较小）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>添加水印</Label>
                  <p className="text-sm text-muted-foreground">在视频右下角添加水印</p>
                </div>
                <Switch 
                  checked={output.addWatermark}
                  onCheckedChange={(checked) => setOutput({...output, addWatermark: checked})}
                />
              </div>

              {output.addWatermark && (
                <div className="space-y-2">
                  <Label htmlFor="watermarkPosition">水印位置</Label>
                  <Select value={output.watermarkPosition} onValueChange={(v) => setOutput({...output, watermarkPosition: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">左上角</SelectItem>
                      <SelectItem value="top-right">右上角</SelectItem>
                      <SelectItem value="bottom-left">左下角</SelectItem>
                      <SelectItem value="bottom-right">右下角</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>生成缩略图</Label>
                  <p className="text-sm text-muted-foreground">自动生成视频封面缩略图</p>
                </div>
                <Switch 
                  checked={output.generateThumbnail}
                  onCheckedChange={(checked) => setOutput({...output, generateThumbnail: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>生成预览</Label>
                  <p className="text-sm text-muted-foreground">生成低分辨率预览版本</p>
                </div>
                <Switch 
                  checked={output.generatePreview}
                  onCheckedChange={(checked) => setOutput({...output, generatePreview: checked})}
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
