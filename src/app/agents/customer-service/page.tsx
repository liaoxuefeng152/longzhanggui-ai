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
import { MessageSquare, Send, Globe, Zap } from 'lucide-react';

export default function CustomerServicePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [language, setLanguage] = useState('zh');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai/model/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: 'customer_service',
          prompt: `你是一位专业的客服智能体，请用${language === 'zh' ? '中文' : language}回复以下客户咨询：\n\n${message}`,
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
                  setResponse((prev) => prev + parsed.content);
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
      setResponse('抱歉，生成回复时出现错误。');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#1677FF] p-2 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-[#1D2129]">客服智能体</h1>
            <p className="text-[14px] text-[#717C89]">多语种自动客服，24小时值守</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 左侧：对话测试 */}
          <div className="col-span-2 space-y-4">
            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader className="px-4 py-4">
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  对话测试
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">语言选择</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择语言" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="id">印尼语</SelectItem>
                      <SelectItem value="ms">马来语</SelectItem>
                      <SelectItem value="th">泰语</SelectItem>
                      <SelectItem value="vi">越南语</SelectItem>
                      <SelectItem value="en">英语</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">用户咨询</Label>
                  <Textarea
                    id="message"
                    placeholder="输入用户的咨询内容..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="bg-[#1677FF] hover:bg-[#0F62FE] h-9"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? '生成中...' : '生成回复'}
                </Button>

                {response && (
                  <div className="space-y-2">
                    <Label>AI回复</Label>
                    <div className="p-4 bg-[#F5F7FA] rounded-lg border border-[#E8E8E8]">
                      <p className="text-[13px] text-[#1D2129] whitespace-pre-wrap">
                        {response}
                      </p>
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
                  <Globe className="h-5 w-5 text-[#1677FF] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">多语种支持</p>
                    <p className="text-[12px] text-[#717C89]">
                      印尼语、马来语、泰语、越南语、英语
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-[#1677FF] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">意图识别</p>
                    <p className="text-[12px] text-[#717C89]">
                      自动识别用户提问意图，精准回复
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-[#1677FF] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">24小时值守</p>
                    <p className="text-[12px] text-[#717C89]">
                      全天候自动回复，及时响应用户
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader className="px-4 py-4">
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  调用统计
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#4E5969]">今日调用</span>
                  <span className="text-[14px] font-semibold text-[#1D2129]">8,560</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#4E5969]">成功率</span>
                  <span className="text-[14px] font-semibold text-[#52C41A]">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#4E5969]">平均响应</span>
                  <span className="text-[14px] font-semibold text-[#1D2129]">1.2s</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
