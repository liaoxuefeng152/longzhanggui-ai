'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Save, TestTube, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface MiaoshouConfig {
  phone: string;
  password: string;
  cookies: string;
  appKey: string;
  appSecret: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastSync?: string;
}

export default function MiaoshouConfigPage() {
  const [config, setConfig] = useState<MiaoshouConfig>({
    phone: '',
    password: '',
    cookies: '',
    appKey: '',
    appSecret: '',
    status: 'disconnected',
    lastSync: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/v1/miaoshou/config');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setConfig({
              phone: data.data.phone || '',
              password: data.data.password || '',
              cookies: data.data.cookies || '',
              appKey: data.data.appKey || '',
              appSecret: data.data.appSecret || '',
              status: data.data.status || 'disconnected',
              lastSync: data.data.lastSync,
            });
          }
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    };
    loadConfig();
  }, []);

  // 保存配置
  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/miaoshou/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        toast.success('配置保存成功');
      } else {
        toast.error('配置保存失败');
      }
    } catch (error) {
      toast.error('保存失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/v1/miaoshou/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('连接测试成功！');
        setConfig(prev => ({ ...prev, status: 'connected' }));
      } else {
        toast.error('连接测试失败: ' + result.message);
        setConfig(prev => ({ ...prev, status: 'error' }));
      }
    } catch (error) {
      toast.error('测试失败: ' + (error as Error).message);
      setConfig(prev => ({ ...prev, status: 'error' }));
    } finally {
      setTesting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">妙手ERP配置</h1>
            <p className="text-muted-foreground">配置妙手ERP账号以启用采集功能</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={config.status === 'connected' ? 'default' : 'secondary'}>
              {config.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
              {config.status === 'connected' ? '已连接' : config.status === 'error' ? '连接异常' : '未连接'}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              账号配置
            </CardTitle>
            <CardDescription>
              请输入妙手ERP的登录凭证。凭证将用于调用妙手ERP的采集API。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                开放平台API配置（用于商品采集）
              </h3>
              <p className="text-sm text-blue-600 mb-4">
                如需使用妙手ERP进行1688商品采集，请先在妙手开放平台申请API权限。
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">AppKey</label>
                  <Input
                    placeholder="请输入妙手开放平台AppKey"
                    value={config.appKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, appKey: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AppSecret</label>
                  <Input
                    type="password"
                    placeholder="请输入妙手开放平台AppSecret"
                    value={config.appSecret}
                    onChange={(e) => setConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">或使用账号密码登录</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">手机号</label>
                  <Input
                    type="tel"
                    placeholder="请输入妙手ERP注册手机号"
                    value={config.phone}
                    onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">密码</label>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    value={config.password}
                    onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">或直接粘贴Cookie</label>
              <textarea
                className="w-full h-24 px-3 py-2 text-sm border rounded-md bg-background resize-none"
                placeholder="粘贴从浏览器获取的Cookie（可选，用于快速测试）"
                value={config.cookies}
                onChange={(e) => setConfig(prev => ({ ...prev, cookies: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Cookie格式: mserp=xxx; accountId=xxx; autoLoginToken=xxx
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                保存配置
              </Button>
              <Button variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
                测试连接
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium">方式一：使用账号密码</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>输入妙手ERP的注册手机号和密码</li>
                <li>点击"保存配置"保存凭证</li>
                <li>系统将自动登录并获取采集权限</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">方式二：使用Cookie（快速测试）</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>在浏览器中登录妙手ERP</li>
                <li>打开开发者工具（F12）→ Application → Cookies</li>
                <li>复制 <code className="bg-muted px-1 rounded">mserp</code>、<code className="bg-muted px-1 rounded">accountId</code>、<code className="bg-muted px-1 rounded">autoLoginToken</code> 的值</li>
                <li>粘贴到Cookie输入框并保存</li>
              </ol>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                获取Cookie示例
              </h3>
              <pre className="text-xs overflow-x-auto">
{`mserp=futhnilnfq46v2rprl28b6jik3; accountId=13257815; autoLoginToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium w-20">采集端点:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                https://erp.91miaoshou.com/api/move/common_collect_box/fetchItem
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-20">请求方式:</span>
              <Badge variant="outline">POST</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium w-20">认证方式:</span>
              <Badge variant="outline">Cookie</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
