'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  Shield,
  AlertTriangle,
  Bell,
  Globe,
  Zap,
  Loader2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getSystemInfo,
  getRiskSettings,
  getNotificationSettings,
  getComplianceSettings,
  updateSettings,
  type SystemInfo,
  type RiskSettings,
  type NotificationSettings,
} from '@/lib/api/settings';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 系统信息
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    name: '龙掌柜智能运营系统',
    version: 'v1.0',
    description: '飞书AI中台驱动版，实现跨境无人店全链路自动化',
    contact_email: 'contact@lobster.ai',
  });

  // 风控设置
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    ad_daily_limit: 500,
    ad_click_cost_tk: 0.5,
    ad_click_cost_amazon: 1.0,
    ad_min_roi: 1.0,
    refund_limit: 100,
    ad_spend_alert: 500,
    refund_alert: 100,
  });

  // 通知设置
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    task_complete: true,
    error_alert: true,
    compliance_failed: true,
    risk_triggered: true,
    sensitive_operation: true,
    daily_report: true,
    weekly_report: true,
  });

  // 安全设置
  const [securitySettings, setSecuritySettings] = useState({
    operation_log_enabled: true,
    encryption_enabled: true,
    ip_whitelist_enabled: false,
    login_lockout_enabled: true,
  });

  // 合规规则
  const [complianceSettings, setComplianceSettings] = useState({
    tk_banned_products_enabled: true,
    tk_banned_keywords_enabled: true,
    amazon_banned_products_enabled: true,
    amazon_banned_keywords_enabled: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [systemInfoRes, riskSettingsRes, notificationSettingsRes, complianceSettingsRes] = await Promise.all([
        getSystemInfo(),
        getRiskSettings(),
        getNotificationSettings(),
        getComplianceSettings(),
      ]);
      setSystemInfo(systemInfoRes);
      setRiskSettings(riskSettingsRes);
      setNotificationSettings(notificationSettingsRes);
      setComplianceSettings(complianceSettingsRes);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('获取设置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router, fetchData]);

  const handleSave = async (category: string) => {
    try {
      setSaving(true);
      let settingsToSave: Record<string, any> = {};

      if (category === 'general') {
        settingsToSave = {
          name: systemInfo.name,
          description: systemInfo.description,
          contact_email: systemInfo.contact_email,
        };
      } else if (category === 'compliance') {
        settingsToSave = complianceSettings;
      } else if (category === 'risk') {
        settingsToSave = riskSettings;
      } else if (category === 'notification') {
        settingsToSave = notificationSettings;
      } else if (category === 'security') {
        settingsToSave = securitySettings;
      }

      await updateSettings(settingsToSave);
      toast.success('设置已保存');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">系统设置</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            全局配置 · 合规规则 · 风控阈值 · 操作日志
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-white border-border">
              <TabsTrigger value="general">通用设置</TabsTrigger>
              <TabsTrigger value="compliance">合规规则</TabsTrigger>
              <TabsTrigger value="risk">风控配置</TabsTrigger>
              <TabsTrigger value="notification">通知设置</TabsTrigger>
              <TabsTrigger value="security">安全设置</TabsTrigger>
            </TabsList>

            {/* 通用设置 */}
            <TabsContent value="general" className="space-y-6">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">基础信息</CardTitle>
                  <CardDescription>系统基本信息配置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">系统名称</Label>
                      <Input
                        id="siteName"
                        value={systemInfo.name}
                        onChange={(e) => setSystemInfo({ ...systemInfo, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">系统版本</Label>
                      <Input id="version" value={systemInfo.version} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDesc">系统描述</Label>
                    <Input
                      id="siteDesc"
                      value={systemInfo.description}
                      onChange={(e) => setSystemInfo({ ...systemInfo, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">联系邮箱</Label>
                      <Input
                        id="contactEmail"
                        value={systemInfo.contact_email}
                        onChange={(e) => setSystemInfo({ ...systemInfo, contact_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feishuBot">飞书机器人ID</Label>
                      <Input id="feishuBot" defaultValue="cli_xxxxxxxxxxxx" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">
                    <Globe className="h-4 w-4 inline mr-2" />
                    时区配置
                  </CardTitle>
                  <CardDescription>适配跨境平台当地时区，避开API调用峰值</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>TK东南亚API调用时段</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-success/10 text-success">推荐</Badge>
                        <span className="text-[13px] text-muted-foreground">北京时间 22:00 - 09:00</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">避开当地 09:00-21:00 API调用峰值</p>
                    </div>
                    <div className="space-y-2">
                      <Label>亚马逊美国站API调用时段</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-success/10 text-success">推荐</Badge>
                        <span className="text-[13px] text-muted-foreground">北京时间 02:00 - 12:00</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">避开当地 10:00-22:00 API调用峰值</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium">自动避开峰值时段</p>
                      <p className="text-[12px] text-muted-foreground">系统自动在推荐时段执行API调用</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => handleSave('general')} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>
            </TabsContent>

            {/* 合规规则配置 */}
            <TabsContent value="compliance" className="space-y-6">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">
                    <Shield className="h-4 w-4 inline mr-2" />
                    合规规则配置
                  </CardTitle>
                  <CardDescription>配置平台禁售词、禁售品类、合规规则</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="flex items-center gap-2 text-warning mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-[13px] font-medium">重要提示</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      禁用合规规则可能导致商品违规下架，请谨慎操作。建议保持所有规则启用状态。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-medium">TK东南亚禁售品类</span>
                        <Switch
                          checked={complianceSettings.tk_banned_products_enabled}
                          onCheckedChange={(checked) =>
                            setComplianceSettings({ ...complianceSettings, tk_banned_products_enabled: checked })
                          }
                        />
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        宗教敏感商品、政治敏感商品、仿品、处方药、武器类等
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-medium">TK禁用词库</span>
                        <Switch
                          checked={complianceSettings.tk_banned_keywords_enabled}
                          onCheckedChange={(checked) =>
                            setComplianceSettings({ ...complianceSettings, tk_banned_keywords_enabled: checked })
                          }
                        />
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        "最好"、"100%有效"、"第一"等夸大宣传词
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-medium">亚马逊禁售品类</span>
                        <Switch
                          checked={complianceSettings.amazon_banned_products_enabled}
                          onCheckedChange={(checked) =>
                            setComplianceSettings({ ...complianceSettings, amazon_banned_products_enabled: checked })
                          }
                        />
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        需类目审核未开放商品、仿品、处方药、武器类等
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-medium">亚马逊禁用词库</span>
                        <Switch
                          checked={complianceSettings.amazon_banned_keywords_enabled}
                          onCheckedChange={(checked) =>
                            setComplianceSettings({ ...complianceSettings, amazon_banned_keywords_enabled: checked })
                          }
                        />
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        "留评返现"、"好评有礼"、医疗功效词等诱导词
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => handleSave('compliance')} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>
            </TabsContent>

            {/* 风控配置 */}
            <TabsContent value="risk" className="space-y-6">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">
                    <Zap className="h-4 w-4 inline mr-2" />
                    广告风控阈值
                  </CardTitle>
                  <CardDescription>触发阈值后自动止损，杜绝无人值守下的重大损失（v1.0为固化值）</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-warning mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-[13px] font-medium">刚性阈值说明</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      风控阈值为刚性值，触发后自动止损，管理员确认后才能继续执行。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>单店铺单日广告消耗上限</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={riskSettings.ad_daily_limit}
                          onChange={(e) => setRiskSettings({ ...riskSettings, ad_daily_limit: Number(e.target.value) })}
                        />
                        <span className="text-[13px] text-muted-foreground">元/天</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">超阈值则暂停所有广告</p>
                    </div>
                    <div className="space-y-2">
                      <Label>商品广告最低ROI</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={riskSettings.ad_min_roi}
                          onChange={(e) => setRiskSettings({ ...riskSettings, ad_min_roi: Number(e.target.value) })}
                        />
                        <span className="text-[13px] text-muted-foreground">:1</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">ROI&lt;1:1时自动暂停该商品广告</p>
                    </div>
                    <div className="space-y-2">
                      <Label>TK Ads单次点击成本上限</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={riskSettings.ad_click_cost_tk}
                          onChange={(e) => setRiskSettings({ ...riskSettings, ad_click_cost_tk: Number(e.target.value) })}
                        />
                        <span className="text-[13px] text-muted-foreground">美元</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">超阈值自动降低出价20%</p>
                    </div>
                    <div className="space-y-2">
                      <Label>亚马逊PPC单次点击成本上限</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={riskSettings.ad_click_cost_amazon}
                          onChange={(e) => setRiskSettings({ ...riskSettings, ad_click_cost_amazon: Number(e.target.value) })}
                        />
                        <span className="text-[13px] text-muted-foreground">美元</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">超阈值自动降低出价20%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    敏感操作阈值
                  </CardTitle>
                  <CardDescription>触发阈值后暂停执行，需管理员确认</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>广告单日消耗告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={riskSettings.ad_spend_alert}
                          onChange={(e) => setRiskSettings({ ...riskSettings, ad_spend_alert: Number(e.target.value) })}
                        />
                        <span className="text-[13px] text-muted-foreground">元</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>单次退款告警阈值</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={riskSettings.refund_alert}
                          onChange={(e) => setRiskSettings({ ...riskSettings, refund_alert: Number(e.target.value) })}
                        />
                        <span className="text-[13px] text-muted-foreground">美元</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 通知设置 */}
            <TabsContent value="notification" className="space-y-6">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">
                    <Bell className="h-4 w-4 inline mr-2" />
                    飞书通知配置
                  </CardTitle>
                  <CardDescription>配置飞书机器人推送的通知类型</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">任务完成通知</p>
                      <p className="text-[12px] text-muted-foreground">任务执行完成后推送飞书</p>
                    </div>
                    <Switch
                      checked={notificationSettings.task_complete}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, task_complete: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">异常告警通知</p>
                      <p className="text-[12px] text-muted-foreground">任务异常、API异常时推送告警</p>
                    </div>
                    <Switch
                      checked={notificationSettings.error_alert}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, error_alert: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">合规校验失败通知</p>
                      <p className="text-[12px] text-muted-foreground">内容合规校验失败时推送告警</p>
                    </div>
                    <Switch
                      checked={notificationSettings.compliance_failed}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, compliance_failed: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">风控触发通知</p>
                      <p className="text-[12px] text-muted-foreground">风控阈值触发时推送告警</p>
                    </div>
                    <Switch
                      checked={notificationSettings.risk_triggered}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, risk_triggered: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">敏感操作确认通知</p>
                      <p className="text-[12px] text-muted-foreground">敏感操作需管理员确认时推送</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sensitive_operation}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, sensitive_operation: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">日报/周报推送</p>
                      <p className="text-[12px] text-muted-foreground">每日/每周自动推送数据复盘报告</p>
                    </div>
                    <Switch
                      checked={notificationSettings.daily_report}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, daily_report: checked })
                      }
                    />
                  </div>
                  <Button onClick={() => handleSave('notification')} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    保存设置
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 安全设置 */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">
                    <Shield className="h-4 w-4 inline mr-2" />
                    安全配置
                  </CardTitle>
                  <CardDescription>系统安全与操作审计配置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">操作日志记录</p>
                      <p className="text-[12px] text-muted-foreground">记录所有操作，保留30天</p>
                    </div>
                    <Switch
                      checked={securitySettings.operation_log_enabled}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, operation_log_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">敏感数据加密存储</p>
                      <p className="text-[12px] text-muted-foreground">API密钥、用户信息加密存储</p>
                    </div>
                    <Switch
                      checked={securitySettings.encryption_enabled}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, encryption_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <p className="text-[13px] font-medium">IP白名单</p>
                      <p className="text-[12px] text-muted-foreground">仅允许白名单IP访问管理后台</p>
                    </div>
                    <Switch
                      checked={securitySettings.ip_whitelist_enabled}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, ip_whitelist_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[13px] font-medium">登录失败锁定</p>
                      <p className="text-[12px] text-muted-foreground">连续5次失败锁定10分钟</p>
                    </div>
                    <Switch
                      checked={securitySettings.login_lockout_enabled}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, login_lockout_enabled: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => handleSave('security')} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>

              <Card className="bg-white border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[15px] font-medium">
                    <FileText className="h-4 w-4 inline mr-2" />
                    操作日志查询
                  </CardTitle>
                  <CardDescription>查询系统操作记录（管理员专属权限）</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => router.push('/task-logs')}>
                    查看操作日志
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
