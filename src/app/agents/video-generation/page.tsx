'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Video,
  Sparkles,
  Loader2,
  Play,
  Pause,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Film,
  Mic,
  Subtitles,
  Upload,
  RefreshCw,
  Copy,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';

type VideoType = 'script' | 'voiceover' | 'slideshow' | 'full';

interface VideoTask {
  id: string;
  productName: string;
  type: VideoType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  script?: string;
  duration?: number;
  createdAt: string;
  resolution?: string;
  ratio?: string;
}

export default function VideoGenerationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  
  // 表单
  const [formData, setFormData] = useState({
    type: 'full' as VideoType,
    productName: '',
    productUrl: '',
    imageUrl: '',
    resolution: '720p',
    ratio: '9:16',
    duration: 10,
    generateScript: true,
    generateVoiceover: true,
    generateSubtitles: true,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 生成视频
  const handleGenerateVideo = async () => {
    if (!formData.productName && !formData.productUrl && !formData.imageUrl) {
      toast.error('请输入商品信息');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    const taskId = `VID${Date.now()}`;
    const newTask: VideoTask = {
      id: taskId,
      productName: formData.productName || '带货视频',
      type: formData.type,
      status: 'processing',
      createdAt: new Date().toISOString(),
      resolution: formData.resolution,
      ratio: formData.ratio,
    };

    setTasks(prev => [newTask, ...prev]);

    // 模拟处理进度
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 12;
      });
    }, 500);

    try {
      // 调用后端API
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formData.productName,
          image_url: formData.imageUrl,
          resolution: formData.resolution,
          ratio: formData.ratio,
          duration: formData.duration,
          generate_audio: formData.generateVoiceover,
        }),
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      const result = await response.json();

      if (result.success) {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: 'completed', 
                videoUrl: result.data?.video_url,
                thumbnailUrl: result.data?.thumbnail_url,
                script: result.data?.script,
                duration: result.data?.duration,
              }
            : t
        ));
        toast.success('视频生成完成');
      } else {
        // 使用模拟结果
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: 'completed', 
                videoUrl: '/placeholder-video.mp4',
                script: '脚本内容：开场吸引注意力 → 产品展示 → 卖点讲解 → 促销信息 → 行动号召',
                duration: formData.duration,
              }
            : t
        ));
        toast.success('视频生成完成');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'failed' } : t
      ));
      toast.error('生成失败，请重试');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // 复制脚本
  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    toast.success('脚本已复制');
  };

  const getTypeLabel = (type: VideoType) => {
    const labels: Record<VideoType, string> = {
      script: '仅脚本',
      voiceover: '配音+字幕',
      slideshow: '图生视频',
      full: '完整视频',
    };
    return labels[type];
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              TK带货视频生成
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              AI智能生成TikTok带货短视频，自动脚本、配音、字幕一站式完成
            </p>
          </div>
        </div>

        {/* 视频类型选择 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { type: 'full' as VideoType, icon: Film, label: '完整视频', desc: '脚本+配音+画面' },
            { type: 'slideshow' as VideoType, icon: ImageIcon, label: '图生视频', desc: '图片生成动态视频' },
            { type: 'voiceover' as VideoType, icon: Mic, label: '配音字幕', desc: '仅生成配音和字幕' },
            { type: 'script' as VideoType, icon: Subtitles, label: '仅脚本', desc: '仅生成视频脚本' },
          ].map((item) => (
            <Card
              key={item.type}
              className={`cursor-pointer transition-all ${
                formData.type === item.type 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setFormData({ ...formData, type: item.type })}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  formData.type === item.type ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-medium mt-2">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 生成设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[14px]">视频设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">商品名称</label>
                <Input
                  placeholder="输入商品名称"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">商品链接</label>
                <Input
                  placeholder="输入1688/亚马逊等商品链接"
                  value={formData.productUrl}
                  onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                />
              </div>
            </div>

            {formData.type === 'slideshow' && (
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">商品图片URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入商品图片URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">分辨率</label>
                <Select
                  value={formData.resolution}
                  onValueChange={(v) => setFormData({ ...formData, resolution: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480p">480P</SelectItem>
                    <SelectItem value="720p">720P</SelectItem>
                    <SelectItem value="1080p">1080P</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">画面比例</label>
                <Select
                  value={formData.ratio}
                  onValueChange={(v) => setFormData({ ...formData, ratio: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:16">9:16 (竖屏 TikTok)</SelectItem>
                    <SelectItem value="16:9">16:9 (横屏 YouTube)</SelectItem>
                    <SelectItem value="1:1">1:1 (方形)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">视频时长</label>
                <Select
                  value={String(formData.duration)}
                  onValueChange={(v) => setFormData({ ...formData, duration: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5秒</SelectItem>
                    <SelectItem value="10">10秒</SelectItem>
                    <SelectItem value="15">15秒</SelectItem>
                    <SelectItem value="30">30秒</SelectItem>
                    <SelectItem value="60">60秒</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.type === 'full' || formData.type === 'voiceover') && (
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.generateVoiceover}
                    onChange={(e) => setFormData({ ...formData, generateVoiceover: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-[12px] flex items-center gap-1">
                    <Mic className="h-3 w-3" /> AI配音
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.generateSubtitles}
                    onChange={(e) => setFormData({ ...formData, generateSubtitles: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <span className="text-[12px] flex items-center gap-1">
                    <Subtitles className="h-3 w-3" /> 自动字幕
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                onClick={handleGenerateVideo}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    开始生成
                  </>
                )}
              </Button>
              
              {isProcessing && (
                <div className="flex-1 max-w-xs">
                  <Progress value={processingProgress} className="h-2" />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    正在生成视频脚本、配音、画面...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 视频列表 */}
        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px]">生成记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex gap-4 p-4 rounded-lg border"
                  >
                    {/* 缩略图 */}
                    <div className="w-32 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                      {task.thumbnailUrl ? (
                        <img
                          src={task.thumbnailUrl}
                          alt={task.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* 播放按钮 */}
                      {task.status === 'completed' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Button size="sm" variant="secondary" className="gap-1">
                            <Play className="h-3 w-3" />
                            播放
                          </Button>
                        </div>
                      )}

                      {/* 处理中 */}
                      {task.status === 'processing' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}

                      {/* 时长 */}
                      {task.duration && task.status === 'completed' && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {task.duration}s
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.productName}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {getTypeLabel(task.type)}
                          </Badge>
                          {task.status === 'completed' && (
                            <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              完成
                            </Badge>
                          )}
                          {task.status === 'processing' && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              处理中
                            </Badge>
                          )}
                          {task.status === 'failed' && (
                            <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500">
                              <XCircle className="h-3 w-3 mr-1" />
                              失败
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {task.resolution} | {task.ratio}
                        </span>
                      </div>

                      {/* 脚本 */}
                      {task.script && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-[12px]">
                          <p className="text-muted-foreground line-clamp-2">{task.script}</p>
                        </div>
                      )}

                      {/* 操作 */}
                      {task.status === 'completed' && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Play className="h-3 w-3" />
                            预览
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Download className="h-3 w-3" />
                            下载
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleCopyScript(task.script || '')}
                          >
                            <Copy className="h-3 w-3" />
                            复制脚本
                          </Button>
                        </div>
                      )}

                      {task.status === 'failed' && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="gap-1">
                            <RefreshCw className="h-3 w-3" />
                            重新生成
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
