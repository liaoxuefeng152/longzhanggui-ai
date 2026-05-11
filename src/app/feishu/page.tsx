'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  MessageSquare,
  Bot,
  Settings,
  Bell,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Copy,
  ExternalLink,
  Info,
  Sparkles,
  AlertTriangle,
  Zap,
  Database,
} from 'lucide-react';
import { FEISHU_CONFIG } from '@/lib/feishu/config';
import { recognizeIntent, generateHelpMessage } from '@/lib/feishu/intent';

export default function FeishuPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 测试意图相关
  const [testMessage, setTestMessage] = useState('');
  const [intentResult, setIntentResult] = useState<any>(null);

  // 飞书配置状态
  const [feishuConfig, setFeishuConfig] = useState<{
    appId: string;
    appSecret: string;
    botName: string;
    enabled: boolean;
  }>({
    appId: FEISHU_CONFIG.appId as string,
    appSecret: FEISHU_CONFIG.appSecret as string,
    botName: '龙掌柜跨境AI全能助手',
    enabled: true,
  });

  // 推送规则配置
  const [pushRules, setPushRules] = useState({
    dailyReport: true,
    dailyReportTime: '09:00',
    weeklyReport: true,
    monthlyReport: false,
    inventoryAlert: true,
    inventoryThreshold: 10,
    logisticsAlert: true,
    logisticsThreshold: 7,
    reviewAlert: false,
    reviewThreshold: 3,
    adRoiAlert: true,
    adRoiThreshold: 1.5,
    cancelRateAlert: false,
    cancelRateThreshold: 5,
    outOfStockAlert: true,
    outOfStockDays: 3,
    complianceAlert: true,
    apiErrorAlert: true,
  });

  // 意图配置
  const [intentConfigs, setIntentConfigs] = useState([
    { type: 'product-selection', label: '选品分析', cardType: '选品结果卡片', template: '帮我选3款3C产品', enabled: true },
    { type: 'image-design', label: '图片翻译', cardType: '图片处理卡片', template: '翻译这张图片', enabled: true },
    { type: 'listing', label: 'Listing优化', cardType: '文本卡片', template: '帮我优化标题', enabled: true },
    { type: 'data-query', label: '数据查询', cardType: '数据卡片', template: '今天销量多少', enabled: true },
    { type: 'inventory', label: '库存查询', cardType: '库存卡片', template: '库存预警', enabled: true },
    { type: 'orders', label: '订单查询', cardType: '订单卡片', template: '查询订单', enabled: true },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    // 加载飞书配置
    loadFeishuConfig();
  }, [router]);

  // 加载飞书配置
  const loadFeishuConfig = async () => {
    try {
      const response = await fetch('/api/feishu/config');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFeishuConfig({
            appId: data.data.app_id || '',
            appSecret: data.data.app_secret || '',
            botName: data.data.bot_name || '龙掌柜跨境AI全能助手',
            enabled: data.data.enabled === 1 || data.data.enabled === true,
          });
        }
      }
    } catch (error) {
      console.error('加载飞书配置失败:', error);
    }
  };

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/feishu/webhook`;

  // 保存配置
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/feishu/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: feishuConfig.appId,
          appSecret: feishuConfig.appSecret,
          botName: feishuConfig.botName,
          enabled: feishuConfig.enabled,
        }),
      });
      
      if (response.ok) {
        toast.success('配置已保存！');
      } else {
        toast.error('保存失败');
      }
    } catch (error) {
      console.error('保存飞书配置失败:', error);
      toast.error('保存失败');
    }
    setIsSaving(false);
  };

  // 测试连接
  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');
    try {
      // 先保存配置
      await fetch('/api/feishu/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: feishuConfig.appId,
          appSecret: feishuConfig.appSecret,
          botName: feishuConfig.botName,
          enabled: feishuConfig.enabled,
        }),
      });
      
      // 测试WebSocket连接
      const response = await fetch('/api/v1/feishu/webhook');
      if (response.ok) {
        setConnectionStatus('success');
        toast.success('连接成功！');
      } else {
        setConnectionStatus('error');
        toast.error('连接失败');
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      setConnectionStatus('error');
      toast.error('连接失败，请检查配置');
    }
    setIsTesting(false);
  };

  // 测试推送
  const handleTestPush = (type: string) => {
    toast.success(`已发送${type}测试推送`);
  };

  // 复制 Webhook URL
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL 已复制');
  };

  // 打开飞书开放平台
  const openFeishuPlatform = () => {
    window.open('https://open.feishu.cn/app/cli_a954ed9674789cd3/baseinfo', '_blank');
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
    }
    setIsTesting(false);
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">飞书机器人管理</h1>
              <p className="text-[14px] text-muted-foreground">
                配置飞书机器人、推送规则和指令模板
              </p>
            </div>
          </div>
          <Badge className={cn(
            "px-3 py-1.5 text-sm",
            feishuConfig.enabled
              ? "bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-600 border-green-500/30"
              : "bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-600 border-gray-500/30"
          )}>
            {feishuConfig.enabled ? '已启用' : '已禁用'}
          </Badge>
        </div>

        {/* 主配置区域 */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-2 p-1 bg-muted/50 rounded-lg h-auto">
            <TabsTrigger value="basic" className="flex items-center gap-2 py-2.5">
              <Settings className="h-4 w-4" />
              基础配置
            </TabsTrigger>
            <TabsTrigger value="push" className="flex items-center gap-2 py-2.5">
              <Bell className="h-4 w-4" />
              推送规则
            </TabsTrigger>
            <TabsTrigger value="intents" className="flex items-center gap-2 py-2.5">
              <FileText className="h-4 w-4" />
              指令模板
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2 py-2.5">
              <Sparkles className="h-4 w-4" />
              意图测试
            </TabsTrigger>
          </TabsList>

          {/* Tab1: 基础配置 */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  飞书应用配置
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* AppID */}
                <div className="space-y-2">
                  <Label htmlFor="appId">飞书应用 AppID</Label>
                  <Input
                    id="appId"
                    value={feishuConfig.appId}
                    onChange={(e) => setFeishuConfig({ ...feishuConfig, appId: e.target.value })}
                    placeholder="请输入飞书应用 AppID"
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    在飞书开放平台的"凭证与基础信息"页面获取
                  </p>
                </div>

                {/* AppSecret */}
                <div className="space-y-2">
                  <Label htmlFor="appSecret">飞书应用 AppSecret</Label>
                  <Input
                    id="appSecret"
                    type="password"
                    value={feishuConfig.appSecret}
                    onChange={(e) => setFeishuConfig({ ...feishuConfig, appSecret: e.target.value })}
                    placeholder="请输入飞书应用 AppSecret"
                    className="h-10"
                  />
                </div>

                {/* 机器人名称 */}
                <div className="space-y-2">
                  <Label htmlFor="botName">机器人名称</Label>
                  <Input
                    id="botName"
                    value={feishuConfig.botName}
                    onChange={(e) => setFeishuConfig({ ...feishuConfig, botName: e.target.value })}
                    placeholder="龙掌柜"
                    className="h-10"
                  />
                </div>

                {/* 启用开关 */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">启用智能助理</p>
                      <p className="text-xs text-muted-foreground">开启后支持老板日常问询和主动推送</p>
                    </div>
                  </div>
                  <Switch
                    checked={feishuConfig.enabled}
                    onCheckedChange={(checked) => setFeishuConfig({ ...feishuConfig, enabled: checked })}
                  />
                </div>

                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label>Webhook 地址</Label>
                  <div className="flex items-center gap-2">
                    <Input value={webhookUrl} readOnly className="h-10 flex-1 font-mono text-xs" />
                    <Button variant="outline" onClick={copyWebhookUrl}>
                      <Copy className="h-4 w-4 mr-2" />
                      复制
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    将此地址配置到飞书开放平台的"事件订阅"页面
                  </p>
                </div>

                <Separator />

                {/* 测试连接 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {connectionStatus === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-400" />}
                    {connectionStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {connectionStatus === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                    <span className="text-sm text-muted-foreground">
                      {connectionStatus === 'idle' && '未测试'}
                      {connectionStatus === 'success' && '连接成功'}
                      {connectionStatus === 'error' && '连接失败'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={openFeishuPlatform} variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      前往配置
                    </Button>
                    <Button onClick={handleTestConnection} disabled={isTesting}>
                      {isTesting ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />测试中...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" />测试连接</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 保存按钮 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => window.location.reload()}>重置</Button>
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    {isSaving ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />保存中...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" />保存配置</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab2: 推送规则配置 */}
          <TabsContent value="push" className="space-y-6">
            {/* 定时推送 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  定时推送配置
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* 早间日报 */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">早间日报</p>
                      <p className="text-xs text-muted-foreground">每天定时推送昨日运营数据</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={pushRules.dailyReportTime}
                      onChange={(e) => setPushRules({ ...pushRules, dailyReportTime: e.target.value })}
                      className="w-28 h-9"
                      disabled={!pushRules.dailyReport}
                    />
                    <Switch checked={pushRules.dailyReport} onCheckedChange={(checked) => setPushRules({ ...pushRules, dailyReport: checked })} />
                  </div>
                </div>

                {/* 周报 */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">周报</p>
                      <p className="text-xs text-muted-foreground">每周一 09:00 推送本周数据汇总</p>
                    </div>
                  </div>
                  <Switch checked={pushRules.weeklyReport} onCheckedChange={(checked) => setPushRules({ ...pushRules, weeklyReport: checked })} />
                </div>

                {/* 月报 */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">月报</p>
                      <p className="text-xs text-muted-foreground">每月1日 09:00 推送月度数据汇总</p>
                    </div>
                  </div>
                  <Switch checked={pushRules.monthlyReport} onCheckedChange={(checked) => setPushRules({ ...pushRules, monthlyReport: checked })} />
                </div>

                <Button variant="outline" onClick={() => handleTestPush('日报')}>
                  <Send className="h-4 w-4 mr-2" />
                  测试推送
                </Button>
              </CardContent>
            </Card>

            {/* 异常告警配置 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  异常告警配置
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* 库存不足 */}
                <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <Database className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700">库存不足告警</p>
                      <p className="text-xs text-red-600/70">库存低于阈值时触发</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={pushRules.inventoryThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, inventoryThreshold: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9" disabled={!pushRules.inventoryAlert} />
                    <span className="text-sm text-muted-foreground">件</span>
                    <Switch checked={pushRules.inventoryAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, inventoryAlert: checked })} />
                  </div>
                </div>

                {/* 物流异常 */}
                <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-700">物流异常告警</p>
                      <p className="text-xs text-orange-600/70">物流停滞超阈值天数时触发</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={pushRules.logisticsThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, logisticsThreshold: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9" disabled={!pushRules.logisticsAlert} />
                    <span className="text-sm text-muted-foreground">天</span>
                    <Switch checked={pushRules.logisticsAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, logisticsAlert: checked })} />
                  </div>
                </div>

                {/* 差评预警 */}
                <div className="flex items-center justify-between p-4 bg-yellow-50/50 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-700">差评预警</p>
                      <p className="text-xs text-yellow-600/70">24小时内新增差评超阈值时触发</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={pushRules.reviewThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, reviewThreshold: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9" disabled={!pushRules.reviewAlert} />
                    <span className="text-sm text-muted-foreground">个</span>
                    <Switch checked={pushRules.reviewAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, reviewAlert: checked })} />
                  </div>
                </div>

                {/* 广告ROI低 */}
                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700">广告ROI低告警</p>
                      <p className="text-xs text-purple-600/70">广告ROI低于阈值时触发</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="number" step="0.1" value={pushRules.adRoiThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, adRoiThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-20 h-9" disabled={!pushRules.adRoiAlert} />
                    <span className="text-sm text-muted-foreground">ROI</span>
                    <Switch checked={pushRules.adRoiAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, adRoiAlert: checked })} />
                  </div>
                </div>

                {/* 断货预警 */}
                <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700">断货预警</p>
                      <p className="text-xs text-red-600/70">预计断货天数低于阈值时触发</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={pushRules.outOfStockDays}
                      onChange={(e) => setPushRules({ ...pushRules, outOfStockDays: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9" disabled={!pushRules.outOfStockAlert} />
                    <span className="text-sm text-muted-foreground">天</span>
                    <Switch checked={pushRules.outOfStockAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, outOfStockAlert: checked })} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => window.location.reload()}>重置</Button>
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    {isSaving ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />保存中...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" />保存配置</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab3: 指令模板配置 */}
          <TabsContent value="intents" className="space-y-6">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  指令模板配置
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {intentConfigs.map((config) => (
                    <div
                      key={config.type}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-all",
                        config.enabled ? "bg-muted/30 border-border" : "bg-gray-50/50 border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => {
                            setIntentConfigs(intentConfigs.map((c) =>
                              c.type === config.type ? { ...c, enabled: checked } : c
                            ));
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-medium", config.enabled ? "text-foreground" : "text-muted-foreground")}>
                              {config.label}
                            </p>
                            <Badge variant="outline" className="text-xs">{config.cardType}</Badge>
                          </div>
                          <p className={cn("text-xs mt-1", config.enabled ? "text-muted-foreground" : "text-gray-400")}>
                            示例：{config.template}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">编辑模板</Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                  <Button variant="outline" onClick={() => window.location.reload()}>重置</Button>
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    {isSaving ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />保存中...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" />保存配置</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 快捷指令示例 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  快捷指令示例
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-700 mb-2">数据查询类</p>
                    <div className="space-y-1 text-xs text-blue-600/80">
                      <p>"今天运营情况怎么样？"</p>
                      <p>"这周卖得最好的产品是什么？"</p>
                      <p>"哪些商品库存低于10件了？"</p>
                    </div>
                  </div>
                  <div className="p-4 bg-violet-50/50 rounded-lg border border-violet-100">
                    <p className="text-sm font-medium text-violet-700 mb-2">分析建议类</p>
                    <div className="space-y-1 text-xs text-violet-600/80">
                      <p>"帮我分析一下这个新品要不要上？"</p>
                      <p>"这个产品应该定什么价格？"</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-700 mb-2">文案生成类</p>
                    <div className="space-y-1 text-xs text-green-600/80">
                      <p>"帮我写一个催好评的消息"</p>
                      <p>"帮我生成产品描述"</p>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                    <p className="text-sm font-medium text-orange-700 mb-2">报表生成类</p>
                    <div className="space-y-1 text-xs text-orange-600/80">
                      <p>"生成今日日报"</p>
                      <p>"生成运营月报"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab4: 意图测试 */}
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
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />分析中...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" />测试意图识别</>
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
                              <div key={key}>{key}: {String(value)}</div>
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

            {/* 使用帮助 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">使用指南</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                  {generateHelpMessage()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
