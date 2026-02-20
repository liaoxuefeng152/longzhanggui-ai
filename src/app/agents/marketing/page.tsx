'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Image, TrendingUp, Share2, CheckCircle } from 'lucide-react';

export default function MarketingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [materialType, setMaterialType] = useState('copy');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai/model/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: 'marketing',
          prompt: `你是阿峰跨境AI智能体的推广助手，请根据以下信息生成${materialType === 'copy' ? '推广文案' : '短视频脚本'}，要求突出阿峰IP标识和产品优势：\n\n${prompt}`,
        }),
      });

      if (!res.ok) throw new Error('请求失败');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setResult((prev) => prev + parsed.content);
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('抱歉，生成素材时出现错误。');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#FAAD14] p-2 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-[#1D2129]">自推广智能体</h1>
            <p className="text-[14px] text-[#717C89]">自动生成推广素材，追踪裂变</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 左侧：素材生成 */}
          <div className="col-span-2 space-y-4">
            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader className="px-4 py-4">
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  素材生成
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="materialType">素材类型</Label>
                  <Select value={materialType} onValueChange={setMaterialType}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择素材类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="copy">推广文案</SelectItem>
                      <SelectItem value="screenshot">效果截图配文</SelectItem>
                      <SelectItem value="group">卖家群转发文案</SelectItem>
                      <SelectItem value="video">短视频脚本</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">场景描述</Label>
                  <Textarea
                    id="prompt"
                    placeholder="描述你的使用场景，例如：用客服智能体一天回复了1000+条询盘，节省了2个人力成本..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="bg-[#FAAD14] hover:bg-[#E8A500] text-white h-9"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {loading ? '生成中...' : '生成素材'}
                </Button>

                {result && (
                  <div className="space-y-2">
                    <Label>生成结果</Label>
                    <div className="p-4 bg-[#F5F7FA] rounded-lg border border-[#E8E8E8]">
                      <p className="text-[13px] text-[#1D2129] whitespace-pre-wrap">
                        {result}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        <Share2 className="h-4 w-4 mr-2" />
                        一键分享
                      </Button>
                      <Button variant="outline" size="sm" className="h-8">
                        复制文案
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：功能介绍 */}
          <div className="space-y-4">
            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader className="px-4 py-4">
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  核心功能
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Image className="h-5 w-5 text-[#FAAD14] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">素材生成</p>
                    <p className="text-[12px] text-[#717C89]">
                      自动生成文案、脚本、配图
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-[#FAAD14] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">裂变追踪</p>
                    <p className="text-[12px] text-[#717C89]">
                      追踪推广链接点击和转化
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#FAAD14] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">奖励发放</p>
                    <p className="text-[12px] text-[#717C89]">
                      自动发放裂变奖励
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader className="px-4 py-4">
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  推广数据
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#4E5969]">累计素材</span>
                  <span className="text-[14px] font-semibold text-[#1D2129]">1,256</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#4E5969]">裂变用户</span>
                  <span className="text-[14px] font-semibold text-[#FAAD14]">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#4E5969]">转化率</span>
                  <span className="text-[14px] font-semibold text-[#52C41A]">12.5%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
