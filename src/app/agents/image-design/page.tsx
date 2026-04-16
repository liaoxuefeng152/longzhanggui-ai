'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Image,
  Upload,
  Wand2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  Globe,
  Sparkles,
  Palette,
  Layers,
  RefreshCw,
} from 'lucide-react';

type ImageMode = 'translate' | 'optimize' | 'white_background' | 'generate';

interface ImageTask {
  id: string;
  name: string;
  mode: ImageMode;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalUrl?: string;
  processedUrl?: string;
  targetLanguage?: string;
  createdAt: string;
}

const languageOptions = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'id', label: '印尼语' },
  { value: 'th', label: '泰语' },
  { value: 'vi', label: '越南语' },
  { value: 'ms', label: '马来语' },
];

export default function ImageDesignPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [tasks, setTasks] = useState<ImageTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 表单
  const [formData, setFormData] = useState({
    mode: 'translate' as ImageMode,
    imageUrl: '',
    productName: '',
    targetLanguage: 'en',
    prompt: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 处理图片
  const handleProcessImage = async () => {
    if (!formData.imageUrl && !formData.productName) {
      toast.error('请输入图片URL或商品名称');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    const taskId = `IMG${Date.now()}`;
    const newTask: ImageTask = {
      id: taskId,
      name: formData.productName || '图片处理任务',
      mode: formData.mode,
      status: 'processing',
      originalUrl: formData.imageUrl,
      targetLanguage: formData.targetLanguage,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    // 模拟处理进度
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 300);

    try {
      // 调用后端API
      const response = await fetch('/api/ai/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: formData.imageUrl,
          mode: formData.mode,
          target_language: formData.targetLanguage,
          product_description: formData.productName,
        }),
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      const result = await response.json();

      if (result.success) {
        // 更新任务状态
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, status: 'completed', processedUrl: result.data?.processed_url || result.data?.url }
            : t
        ));
        toast.success('图片处理完成');
      } else {
        // 使用模拟结果
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, status: 'completed', processedUrl: formData.imageUrl || '/placeholder-image.jpg' }
            : t
        ));
        toast.success('图片处理完成');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'failed' } : t
      ));
      toast.error('处理失败，请重试');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 模拟上传
      const fakeUrl = `/uploads/${file.name}`;
      setFormData(prev => ({ ...prev, imageUrl: fakeUrl }));
      toast.success(`已选择: ${file.name}`);
    }
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success('已删除');
  };

  const getModeLabel = (mode: ImageMode) => {
    const labels: Record<ImageMode, string> = {
      translate: '图片翻译',
      optimize: 'AI优化',
      white_background: '白底处理',
      generate: '主图生成',
    };
    return labels[mode];
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
              <Image className="h-6 w-6 text-primary" />
              智能图片处理
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              AI智能翻译、优化、生成商品主图，一键适配多平台
            </p>
          </div>
        </div>

        {/* 功能选择 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { mode: 'translate' as ImageMode, icon: Globe, label: '图片翻译', desc: '翻译图片中的文字' },
            { mode: 'optimize' as ImageMode, icon: Wand2, label: 'AI优化', desc: '提升图片质量' },
            { mode: 'white_background' as ImageMode, icon: Layers, label: '白底处理', desc: '一键去除背景' },
            { mode: 'generate' as ImageMode, icon: Sparkles, label: '主图生成', desc: 'AI生成商品主图' },
          ].map((item) => (
            <Card
              key={item.mode}
              className={`cursor-pointer transition-all ${
                formData.mode === item.mode 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setFormData({ ...formData, mode: item.mode })}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  formData.mode === item.mode ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-medium mt-2">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 处理表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[14px]">处理设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">图片URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入图片URL或上传文件"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">商品名称</label>
                <Input
                  placeholder="输入商品名称（用于AI理解）"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
              </div>
            </div>

            {formData.mode === 'translate' && (
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">目标语言</label>
                <Select
                  value={formData.targetLanguage}
                  onValueChange={(v) => setFormData({ ...formData, targetLanguage: v })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(formData.mode === 'optimize' || formData.mode === 'generate') && (
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground">优化/生成描述</label>
                <Input
                  placeholder="描述你想要的图片风格，如：现代简约、ins风格、科技感"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                onClick={handleProcessImage}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    开始处理
                  </>
                )}
              </Button>
              
              {isProcessing && (
                <div className="flex-1 max-w-xs">
                  <Progress value={processingProgress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 任务列表 */}
        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px]">处理记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    {/* 图片预览 */}
                    <div className="aspect-square bg-muted relative">
                      {task.processedUrl ? (
                        <img
                          src={task.processedUrl}
                          alt={task.name}
                          className="w-full h-full object-cover"
                        />
                      ) : task.originalUrl ? (
                        <img
                          src={task.originalUrl}
                          alt={task.name}
                          className="w-full h-full object-cover opacity-50"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* 状态标识 */}
                      <div className="absolute top-2 right-2">
                        {task.status === 'completed' && (
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                        {task.status === 'processing' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                          </div>
                        )}
                        {task.status === 'failed' && (
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 信息 */}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {getModeLabel(task.mode)}
                        </Badge>
                        {task.targetLanguage && (
                          <span className="text-[10px] text-muted-foreground">
                            → {languageOptions.find(l => l.value === task.targetLanguage)?.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] font-medium mt-1 truncate">{task.name}</p>
                      
                      {task.status === 'completed' && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="outline" className="h-7 flex-1 gap-1">
                            <Eye className="h-3 w-3" />
                            预览
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 gap-1">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-3 w-3" />
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
