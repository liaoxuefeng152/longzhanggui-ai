'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle, XCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react';

export default function FeishuTestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testToken, setTestToken] = useState('4johe0bj1fCG9V2bAhvTne8Fmz7RCo07');
  const [testChallenge, setTestChallenge] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // 生成随机的 challenge
    setTestChallenge(Math.random().toString(36).substring(7));
    setWebhookUrl(`${window.location.origin}/api/v1/feishu/webhook`);
  }, [router]);

  const handleLogout = () => {
    router.push('/login');
  };

  // 测试 Webhook
  const handleTestWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'url_verification',
          token: testToken,
          challenge: testChallenge,
        }),
      });

      const data = await response.json();
      const contentType = response.headers.get('content-type');
      const httpStatus = response.status;

      console.log('Webhook 测试结果:', {
        status: httpStatus,
        contentType,
        data,
      });

      setTestResult({
        success: true,
        httpStatus,
        contentType,
        data,
        validChallenge: data.challenge === testChallenge,
        validJson: contentType?.includes('application/json'),
      });

      if (httpStatus === 200 && data.challenge === testChallenge) {
        toast.success('Webhook 测试成功！');
      } else {
        toast.error('Webhook 测试失败');
      }
    } catch (error) {
      console.error('Webhook 测试失败:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      });
      toast.error('Webhook 测试失败');
    } finally {
      setIsTesting(false);
    }
  };

  // 复制配置信息
  const copyConfig = () => {
    const config = `Webhook URL: ${webhookUrl}
Verification Token: ${testToken}

配置步骤：
1. 打开飞书开放平台配置页面
2. 输入 Webhook URL
3. 输入 Verification Token
4. 点击"验证"按钮
5. 验证通过后保存配置`;

    navigator.clipboard.writeText(config);
    toast.success('配置信息已复制');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
              <RefreshCw className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Webhook 测试工具</h1>
              <p className="text-sm text-muted-foreground">
                测试飞书机器人 Webhook 配置是否正确
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={copyConfig}>
            <Copy className="h-4 w-4 mr-2" />
            复制配置
          </Button>
        </div>

        {/* 配置信息 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook URL</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-xs bg-muted"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Token</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>
        </div>

        {/* 测试区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">URL 验证测试</CardTitle>
              <Badge variant="outline">
                {testChallenge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                模拟飞书 URL 验证请求
              </div>
              <Button onClick={handleTestWebhook} disabled={isTesting}>
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    开始测试
                  </>
                )}
              </Button>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <Card className={cn(
                "bg-muted/50 border-2",
                testResult.success && testResult.validChallenge
                  ? "border-green-500/30"
                  : testResult.success
                    ? "border-yellow-500/30"
                    : "border-red-500/30"
              )}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {testResult.success && testResult.validChallenge ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : testResult.success ? (
                      <XCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {testResult.success && testResult.validChallenge
                        ? '测试通过'
                        : testResult.success
                          ? '测试失败'
                          : '测试错误'}
                    </span>
                  </div>

                  {testResult.success && (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">HTTP 状态:</span>
                          <Badge variant={testResult.httpStatus === 200 ? 'default' : 'destructive'}>
                            {testResult.httpStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Content-Type:</span>
                          <Badge variant={testResult.validJson ? 'default' : 'destructive'}>
                            {testResult.contentType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Challenge 匹配:</span>
                          <Badge variant={testResult.validChallenge ? 'default' : 'destructive'}>
                            {testResult.validChallenge ? '✓' : '✗'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">JSON 格式:</span>
                          <Badge variant={testResult.validJson ? 'default' : 'destructive'}>
                            {testResult.validJson ? '✓' : '✗'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">返回数据:</span>
                        <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}

                  {!testResult.success && (
                    <div className="text-sm text-destructive">
                      错误: {testResult.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* 配置步骤 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">飞书配置步骤</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <strong>打开飞书开放平台</strong>
                <br />
                <span className="text-muted-foreground">
                  访问应用配置页面，进入"事件订阅"
                </span>
              </li>
              <li>
                <strong>选择事件订阅方式</strong>
                <br />
                <span className="text-muted-foreground">
                  选择"将事件发送至开发者服务器"
                </span>
              </li>
              <li>
                <strong>配置请求地址</strong>
                <br />
                <span className="text-muted-foreground">
                  输入 Webhook URL: {webhookUrl}
                </span>
              </li>
              <li>
                <strong>配置 Verification Token</strong>
                <br />
                <span className="text-muted-foreground">
                  输入 Verification Token: {testToken}
                </span>
              </li>
              <li>
                <strong>点击"验证"按钮</strong>
                <br />
                <span className="text-muted-foreground">
                  飞书会发送验证请求到你的服务器
                </span>
              </li>
              <li>
                <strong>验证通过后保存</strong>
                <br />
                <span className="text-muted-foreground">
                  验证通过后，点击"保存"按钮完成配置
                </span>
              </li>
              <li>
                <strong>订阅事件</strong>
                <br />
                <span className="text-muted-foreground">
                  订阅"im.message.receive_v1"事件（接收消息）
                </span>
              </li>
            </ol>

            <Button onClick={() => window.open('https://open.feishu.cn/app/cli_a925102a8179dbd6/event', '_blank')} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              前往飞书开放平台配置
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
