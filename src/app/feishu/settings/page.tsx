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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
  Bell,
  FileText,
  Zap,
  Database,
  Upload,
  History,
  AlertTriangle,
} from 'lucide-react';

// 飞书配置状态
interface FeishuConfig {
  appId: string;
  appSecret: string;
  botName: string;
  enabled: boolean;
}

// 推送规则配置
interface PushRules {
  dailyReport: boolean;
  dailyReportTime: string;
  weeklyReport: boolean;
  monthlyReport: boolean;
  inventoryAlert: boolean;
  inventoryThreshold: number;
  logisticsAlert: boolean;
  logisticsThreshold: number;
  reviewAlert: boolean;
  reviewThreshold: number;
  adRoiAlert: boolean;
  adRoiThreshold: number;
  cancelRateAlert: boolean;
  cancelRateThreshold: number;
  outOfStockAlert: boolean;
  outOfStockDays: number;
  complianceAlert: boolean;
  apiErrorAlert: boolean;
}

// 指令模板配置
interface IntentConfig {
  type: string;
  label: string;
  enabled: boolean;
  template: string;
  cardType: string;
}

export default function FeishuSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // 飞书配置状态
  const [feishuConfig, setFeishuConfig] = useState<FeishuConfig>({
    appId: 'cli_a954ed9674789cd3',
    appSecret: '',
    botName: '龙掌柜',
    enabled: true,
  });
  
  // 推送规则状态
  const [pushRules, setPushRules] = useState<PushRules>({
    dailyReport: true,
    dailyReportTime: '09:00',
    weeklyReport: true,
    monthlyReport: true,
    inventoryAlert: true,
    inventoryThreshold: 10,
    logisticsAlert: true,
    logisticsThreshold: 3,
    reviewAlert: true,
    reviewThreshold: 2,
    adRoiAlert: true,
    adRoiThreshold: 1.5,
    cancelRateAlert: true,
    cancelRateThreshold: 5,
    outOfStockAlert: true,
    outOfStockDays: 3,
    complianceAlert: true,
    apiErrorAlert: true,
  });
  
  // 指令模板配置
  const [intentConfigs, setIntentConfigs] = useState<IntentConfig[]>([
    { type: 'daily_report', label: '运营日报', enabled: true, template: '今日运营情况怎么样？', cardType: 'daily_report' },
    { type: 'top_products', label: 'TOP商品', enabled: true, template: '这周卖得最好的产品是什么？', cardType: 'top_products' },
    { type: 'inventory_alert', label: '库存预警', enabled: true, template: '哪些商品库存低于10件了？', cardType: 'inventory_alert' },
    { type: 'ad_summary', label: '广告汇总', enabled: true, template: '今天广告花了多少钱？', cardType: 'ad_summary' },
    { type: 'order_status', label: '订单状态', enabled: true, template: '这批订单发货情况？', cardType: 'order_status' },
    { type: 'service_quality', label: '服务质量', enabled: true, template: '今天好评率是多少？', cardType: 'service_quality' },
    { type: 'comparison', label: '对比分析', enabled: true, template: '为什么今天订单比昨天少了？', cardType: 'comparison' },
    { type: 'trend', label: '环比分析', enabled: true, template: '和上周对比，增长了多少？', cardType: 'trend' },
    { type: 'product_selection', label: '选品建议', enabled: true, template: '帮我选3款宠物用品爆款', cardType: 'product_selection' },
    { type: 'pricing_advice', label: '定价建议', enabled: true, template: '这个产品应该定什么价格？', cardType: 'pricing_advice' },
    { type: 'copywriting', label: '文案生成', enabled: true, template: '帮我写一个催好评的消息', cardType: 'copywriting' },
    { type: 'report_generation', label: '报表生成', enabled: true, template: '生成今日日报', cardType: 'report_generation' },
  ]);
  
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'idle'>('idle');

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

  // 测试飞书连接
  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');
    
    try {
      // 模拟测试连接
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (feishuConfig.appId && feishuConfig.appSecret) {
        setConnectionStatus('success');
        toast.success('飞书连接测试成功！');
      } else {
        setConnectionStatus('error');
        toast.error('连接失败，请检查AppID和AppSecret');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('连接测试失败');
    } finally {
      setIsTesting(false);
    }
  };

  // 保存配置
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // 模拟保存配置
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('配置已保存！');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 测试推送
  const handleTestPush = async (type: string) => {
    toast.info(`正在模拟发送${type}推送...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`${type}推送测试成功！`);
  };

  // 复制Webhook URL
  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/v1/feishu/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL 已复制');
  };

  if (!user) return null;

  const webhookUrl = `${window.location.origin}/api/v1/feishu/webhook`;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-violet-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">飞书配置管理</h1>
              <p className="text-sm text-muted-foreground">
                智能运营助理 - 飞书机器人配置
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
          <TabsList className="grid w-full grid-cols-3 gap-2 p-1 bg-muted/50 rounded-lg h-auto">
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
                  <p className="text-xs text-muted-foreground">
                    请妥善保管，不要泄露给他人
                  </p>
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
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="h-10 flex-1"
                    />
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
                    {connectionStatus === 'idle' && (
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                    )}
                    {connectionStatus === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {connectionStatus === 'error' && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {connectionStatus === 'idle' && '未测试'}
                      {connectionStatus === 'success' && '连接成功'}
                      {connectionStatus === 'error' && '连接失败'}
                    </span>
                  </div>
                  <Button onClick={handleTestConnection} disabled={isTesting}>
                    {isTesting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        测试中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        测试连接
                      </>
                    )}
                  </Button>
                </div>

                {/* 保存按钮 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    重置
                  </Button>
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        保存配置
                      </>
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
              <CardContent className="p-6 space-y-6">
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
                    <Switch
                      checked={pushRules.dailyReport}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, dailyReport: checked })}
                    />
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
                  <Switch
                    checked={pushRules.weeklyReport}
                    onCheckedChange={(checked) => setPushRules({ ...pushRules, weeklyReport: checked })}
                  />
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
                  <Switch
                    checked={pushRules.monthlyReport}
                    onCheckedChange={(checked) => setPushRules({ ...pushRules, monthlyReport: checked })}
                  />
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
                    <Input
                      type="number"
                      value={pushRules.inventoryThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, inventoryThreshold: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9"
                      disabled={!pushRules.inventoryAlert}
                    />
                    <span className="text-sm text-muted-foreground">件</span>
                    <Switch
                      checked={pushRules.inventoryAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, inventoryAlert: checked })}
                    />
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
                    <Input
                      type="number"
                      value={pushRules.logisticsThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, logisticsThreshold: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9"
                      disabled={!pushRules.logisticsAlert}
                    />
                    <span className="text-sm text-muted-foreground">天</span>
                    <Switch
                      checked={pushRules.logisticsAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, logisticsAlert: checked })}
                    />
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
                    <Input
                      type="number"
                      value={pushRules.reviewThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, reviewThreshold: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9"
                      disabled={!pushRules.reviewAlert}
                    />
                    <span className="text-sm text-muted-foreground">个</span>
                    <Switch
                      checked={pushRules.reviewAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, reviewAlert: checked })}
                    />
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
                    <Input
                      type="number"
                      step="0.1"
                      value={pushRules.adRoiThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, adRoiThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-20 h-9"
                      disabled={!pushRules.adRoiAlert}
                    />
                    <span className="text-sm text-muted-foreground">ROI</span>
                    <Switch
                      checked={pushRules.adRoiAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, adRoiAlert: checked })}
                    />
                  </div>
                </div>

                {/* 订单取消率高 */}
                <div className="flex items-center justify-between p-4 bg-pink-50/50 rounded-lg border border-pink-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pink-700">订单取消率高告警</p>
                      <p className="text-xs text-pink-600/70">订单取消率高于阈值时触发</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={pushRules.cancelRateThreshold}
                      onChange={(e) => setPushRules({ ...pushRules, cancelRateThreshold: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9"
                      disabled={!pushRules.cancelRateAlert}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <Switch
                      checked={pushRules.cancelRateAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, cancelRateAlert: checked })}
                    />
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
                    <Input
                      type="number"
                      value={pushRules.outOfStockDays}
                      onChange={(e) => setPushRules({ ...pushRules, outOfStockDays: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9"
                      disabled={!pushRules.outOfStockAlert}
                    />
                    <span className="text-sm text-muted-foreground">天</span>
                    <Switch
                      checked={pushRules.outOfStockAlert}
                      onCheckedChange={(checked) => setPushRules({ ...pushRules, outOfStockAlert: checked })}
                    />
                  </div>
                </div>

                {/* 合规风险 */}
                <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700">合规风险告警</p>
                      <p className="text-xs text-red-600/70">检测到敏感词或违规内容时触发</p>
                    </div>
                  </div>
                  <Switch
                    checked={pushRules.complianceAlert}
                    onCheckedChange={(checked) => setPushRules({ ...pushRules, complianceAlert: checked })}
                  />
                </div>

                {/* API异常 */}
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">API异常告警</p>
                      <p className="text-xs text-blue-600/70">平台API调用失败时触发</p>
                    </div>
                  </div>
                  <Switch
                    checked={pushRules.apiErrorAlert}
                    onCheckedChange={(checked) => setPushRules({ ...pushRules, apiErrorAlert: checked })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    重置
                  </Button>
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        保存配置
                      </>
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
                        config.enabled
                          ? "bg-muted/30 border-border"
                          : "bg-gray-50/50 border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => {
                            setIntentConfigs(
                              intentConfigs.map((c) =>
                                c.type === config.type ? { ...c, enabled: checked } : c
                              )
                            );
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "text-sm font-medium",
                              config.enabled ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {config.label}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {config.cardType}
                            </Badge>
                          </div>
                          <p className={cn(
                            "text-xs mt-1",
                            config.enabled ? "text-muted-foreground" : "text-gray-400"
                          )}>
                            示例：{config.template}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        编辑模板
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    重置
                  </Button>
                  <Button onClick={handleSaveConfig} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        保存配置
                      </>
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
                    <p className="text-sm font-medium text-blue-700 mb-2">📊 数据查询类</p>
                    <div className="space-y-1 text-xs text-blue-600/80">
                      <p>• "今天运营情况怎么样？"</p>
                      <p>• "这周卖得最好的产品是什么？"</p>
                      <p>• "哪些商品库存低于10件了？"</p>
                    </div>
                  </div>
                  <div className="p-4 bg-violet-50/50 rounded-lg border border-violet-100">
                    <p className="text-sm font-medium text-violet-700 mb-2">💡 分析建议类</p>
                    <div className="space-y-1 text-xs text-violet-600/80">
                      <p>• "帮我分析一下这个新品要不要上？"</p>
                      <p>• "这个产品应该定什么价格？"</p>
                      <p>• "竞品在降价，我们要调整吗？"</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-700 mb-2">✍️ 文案生成类</p>
                    <div className="space-y-1 text-xs text-green-600/80">
                      <p>• "帮我写一个催好评的消息"</p>
                      <p>• "帮我写一个回复差评的话术"</p>
                      <p>• "帮我生成产品描述"</p>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                    <p className="text-sm font-medium text-orange-700 mb-2">📈 报表生成类</p>
                    <div className="space-y-1 text-xs text-orange-600/80">
                      <p>• "生成今日日报"</p>
                      <p>• "导出本周数据"</p>
                      <p>• "生成运营月报"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
