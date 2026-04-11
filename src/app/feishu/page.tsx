'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  MessageSquare,
  Bot,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Copy,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import { FEISHU_CONFIG } from '@/lib/feishu/config';
import { recognizeIntent, generateHelpMessage } from '@/lib/feishu/intent';

export default function FeishuPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [testMessage, setTestMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [intentResult, setIntentResult] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    router.push('/login');
  };

  // 测试意图识别
  const handleTestIntent = async () => {
    if (!testMessage.trim()) {
      toast.error('请输入测试消息');
      return;
    }

    setIsTesting(true);
    try {
      const result = recognizeIntent(testMessage);
      setIntentResult(result);
      toast.success('意图识别成功');
    } catch (error) {
      toast.error('意图识别失败');
    } finally {
      setIsTesting(false);
    }
  };

  // 复制 Webhook URL
  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/v1/feishu/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL 已复制');
  };

  // 打开飞书开放平台
  const openFeishuPlatform = () => {
    window.open('https://open.feishu.cn/app/cli_a925102a8179dbd6/event', '_blank');
  };

  if (!user) return null;

  const webhookUrl = `${window.location.origin}/api/v1/feishu/webhook`;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">飞书机器人管理</h1>
              <p className="text-sm text-muted-foreground">
                配置和测试龙掌柜飞书机器人
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-600 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            已配置
          </Badge>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              配置信息
            </TabsTrigger>
            <TabsTrigger value="test">
              <Sparkles className="h-4 w-4 mr-2" />
              意图测试
            </TabsTrigger>
            <TabsTrigger value="help">
              <Info className="h-4 w-4 mr-2" />
              使用帮助
            </TabsTrigger>
          </TabsList>

          {/* 配置信息 */}
          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* App ID */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">App ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {FEISHU_CONFIG.appId}
                  </code>
                </CardContent>
              </Card>

              {/* App Secret */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">App Secret</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {FEISHU_CONFIG.appSecret.substring(0, 8)}***
                  </code>
                </CardContent>
              </Card>

              {/* Verification Token */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Verification Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {FEISHU_CONFIG.verificationToken}
                  </code>
                </CardContent>
              </Card>

              {/* Webhook URL */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook URL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all block">
                    {webhookUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                    <Copy className="h-3 w-3 mr-1" />
                    复制
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 操作按钮 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">配置步骤</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">复制 Webhook URL</p>
                      <p className="text-xs text-muted-foreground">
                        点击上方"复制"按钮，复制 Webhook 地址
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">配置飞书事件订阅</p>
                      <p className="text-xs text-muted-foreground">
                        在飞书开放平台配置事件回调地址和 Verification Token
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">订阅消息事件</p>
                      <p className="text-xs text-muted-foreground">
                        订阅"接收消息"事件（im.message.receive_v1）
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium">完成配置</p>
                      <p className="text-xs text-muted-foreground">
                        在飞书群中@机器人测试功能
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={openFeishuPlatform} className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  前往飞书开放平台配置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 意图测试 */}
          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">测试意图识别</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">输入测试消息</label>
                  <Textarea
                    placeholder="例如：帮我选3款3C手机配件的产品"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleTestIntent} disabled={isTesting} className="w-full">
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      测试意图识别
                    </>
                  )}
                </Button>

                {intentResult && (
                  <Card className="bg-muted/50 border-border/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">识别结果:</span>
                        <Badge variant="outline">{intentResult.intent}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">置信度:</span>
                        <span className="text-sm text-muted-foreground">
                          {(intentResult.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {intentResult.params && Object.keys(intentResult.params).length > 0 && (
                        <div>
                          <span className="text-sm font-medium block mb-1">提取参数:</span>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {Object.entries(intentResult.params).map(([key, value]) => (
                              <div key={key}>
                                {key}: {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* 示例消息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">示例消息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '帮我选3款3C手机配件的产品',
                    '今天的销量',
                    '库存预警',
                    '系统状态',
                    '帮我选品',
                    '上架产品',
                    '创建广告',
                    '查询订单',
                  ].map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      onClick={() => setTestMessage(example)}
                      className="justify-start"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 使用帮助 */}
          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">使用指南</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {generateHelpMessage()}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
