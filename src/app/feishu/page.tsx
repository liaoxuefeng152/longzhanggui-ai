'use client';

import { useState } from 'react';
import { MessageSquare, Bell, Calendar, Settings, CheckCircle, AlertCircle, Key, Shield, Smartphone, TrendingDown, Package, ShoppingCart, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

interface AlertThreshold {
  // 库存告警
  inventoryLow: number;           // 库存低于此值触发告警
  inventoryCritical: number;      // 库存低于此值触发紧急告警
  
  // 订单告警
  orderCancelRate: number;        // 订单取消率超过此值触发告警(%)
  refundRate: number;            // 退款率超过此值触发告警(%)
  
  // 广告告警
  adRoiMin: number;              // 广告ROI低于此值触发告警
  adSpendMax: number;            // 单日广告花费超过此值触发告警
  adCpcMax: number;              // 单次点击成本超过此值触发告警
  
  // 财务告警
  dailyLoss: number;             // 单日亏损超过此值触发告警
  cashFlowNegative: boolean;      // 现金流为负时告警
  
  // 合规告警
  complianceEnabled: boolean;    // 是否启用合规检查告警
}

interface AlertFrequency {
  // 实时告警（仅紧急情况）
  realtime: boolean;
  
  // 告警合并频率
  frequency: 'realtime' | 'hourly' | 'daily';
  
  // 静默时段（不推送告警的时间段）
  silentStart: string;           // 格式 HH:mm
  silentEnd: string;             // 格式 HH:mm
  silentEnabled: boolean;        // 是否启用静默时段
}

interface AlertChannel {
  feishu: boolean;               // 飞书推送
  email: boolean;                // 邮件通知
  system: boolean;               // 系统通知
  
  // 飞书配置
  webhookUrl: string;
  chatId: string;
  
  // 邮件配置
  emailList: string;
}

export default function FeishuPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState({
    appId: '',
    appSecret: '',
    botName: '龙掌柜助手',
  });
  const [pushSettings, setPushSettings] = useState({
    dailyReport: true,
    weeklyReport: true,
    inventoryAlert: true,
    orderAlert: true,
    adsAlert: false,
  });

  // 告警阈值配置
  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold>({
    inventoryLow: 20,
    inventoryCritical: 5,
    orderCancelRate: 5,
    refundRate: 10,
    adRoiMin: 1.5,
    adSpendMax: 1000,
    adCpcMax: 2.0,
    dailyLoss: 500,
    cashFlowNegative: true,
    complianceEnabled: true,
  });

  // 告警频率配置
  const [alertFrequency, setAlertFrequency] = useState<AlertFrequency>({
    realtime: false,
    frequency: 'hourly',
    silentStart: '22:00',
    silentEnd: '08:00',
    silentEnabled: true,
  });

  // 告警渠道配置
  const [alertChannels, setAlertChannels] = useState<AlertChannel>({
    feishu: true,
    email: false,
    system: true,
    webhookUrl: '',
    chatId: '',
    emailList: '',
  });

  const handleConnect = () => {
    if (!config.appId || !config.appSecret) {
      toast.error('请填写完整的配置信息');
      return;
    }
    setIsConnected(true);
    toast.success('飞书连接成功！');
  };

  const handleSaveConfig = () => {
    toast.success('配置已保存');
  };

  const handleSaveAlertRules = () => {
    toast.success('告警规则已保存');
  };

  const handleTestSend = () => {
    toast.success('测试消息已发送');
  };

  const handleTestAlert = (type: string) => {
    toast.success(`已发送${type}测试告警`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div>
          <h1 className="text-2xl font-bold text-[#1D2129]">飞书配置</h1>
          <p className="text-[#86909C] mt-1">配置飞书机器人，接收运营日报和告警通知</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md bg-[#F2F3F5]">
            <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              基础配置
            </TabsTrigger>
            <TabsTrigger value="push" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              推送设置
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              告警规则
            </TabsTrigger>
          </TabsList>

          {/* 基础配置 */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* 连接状态卡片 */}
                <Card className={`card-minimal ${isConnected ? 'border-[#00B42A]' : ''}`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isConnected ? 'bg-[#E8FFEA]' : 'bg-[#F2F3F5]'
                        }`}>
                          {isConnected ? (
                            <CheckCircle className="w-6 h-6 text-[#00B42A]" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-[#86909C]" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#1D2129]">
                            飞书机器人
                          </h3>
                          <p className="text-[#86909C]">
                            {isConnected ? '已连接' : '未连接'}
                          </p>
                        </div>
                      </div>
                      {isConnected ? (
                        <Badge className="bg-[#E8FFEA] text-[#00B42A]">已连接</Badge>
                      ) : (
                        <Badge className="bg-[#F2F3F5] text-[#86909C]">未连接</Badge>
                      )}
                    </div>

                    {!isConnected && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">App ID</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                            <Input
                              placeholder="请输入飞书应用 App ID"
                              value={config.appId}
                              onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                              className="pl-10 input-minimal h-12"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">App Secret</label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                            <Input
                              type="password"
                              placeholder="请输入飞书应用 App Secret"
                              value={config.appSecret}
                              onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
                              className="pl-10 input-minimal h-12"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">机器人名称</label>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                            <Input
                              placeholder="龙掌柜助手"
                              value={config.botName}
                              onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                              className="pl-10 input-minimal h-12"
                            />
                          </div>
                        </div>

                        <Button className="w-full btn-primary h-12" onClick={handleConnect}>
                          连接飞书
                        </Button>
                      </div>
                    )}

                    {isConnected && (
                      <div className="flex gap-4">
                        <Button variant="ghost" className="flex-1 btn-secondary" onClick={handleTestSend}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          发送测试消息
                        </Button>
                        <Button className="flex-1 btn-primary" onClick={() => setIsConnected(false)}>
                          重新配置
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                {/* 配置说明 */}
                <Card className="card-minimal">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-4">配置说明</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E8F3FF] flex items-center justify-center flex-shrink-0">
                          <Smartphone className="w-5 h-5 text-[#165DFF]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1D2129] mb-1">如何获取飞书应用凭证？</h4>
                          <p className="text-sm text-[#86909C]">
                            1. 访问飞书开放平台 (open.feishu.cn)<br />
                            2. 创建企业自建应用<br />
                            3. 在凭证与基础信息中获取 App ID 和 App Secret<br />
                            4. 申请机器人权限并发布应用
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 右侧功能说明 */}
              <div className="space-y-6">
                <Card className="card-minimal bg-gradient-to-br from-[#E8F3FF] to-white">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1D2129] mb-4 flex items-center">
                      <MessageSquare className="w-5 h-5 text-[#165DFF] mr-2" />
                      飞书机器人功能
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-[#00B42A] flex-shrink-0" />
                        <div>
                          <p className="text-[#1D2129] font-medium">每日运营日报</p>
                          <p className="text-sm text-[#86909C]">每天早上9点推送前一天的运营数据</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-[#00B42A] flex-shrink-0" />
                        <div>
                          <p className="text-[#1D2129] font-medium">库存预警</p>
                          <p className="text-sm text-[#86909C]">库存不足时实时推送告警</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-[#00B42A] flex-shrink-0" />
                        <div>
                          <p className="text-[#1D2129] font-medium">新订单通知</p>
                          <p className="text-sm text-[#86909C]">实时推送新订单信息</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-[#00B42A] flex-shrink-0" />
                        <div>
                          <p className="text-[#1D2129] font-medium">智能问答</p>
                          <p className="text-sm text-[#86909C]">随时查询运营数据和AI建议</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 推送设置 */}
          <TabsContent value="push" className="mt-6">
            <Card className="card-minimal">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1D2129] mb-6">推送规则设置</h3>
                
                <div className="space-y-6">
                  {/* 定时推送 */}
                  <div className="border-b border-[#E5E6EB] pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-[#165DFF]" />
                      <h4 className="font-medium text-[#1D2129]">定时推送</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-[#1D2129]">每日运营日报</p>
                          <p className="text-sm text-[#86909C]">每天 09:00 推送前一天运营数据</p>
                        </div>
                        <Switch 
                          checked={pushSettings.dailyReport}
                          onCheckedChange={(checked) => setPushSettings({ ...pushSettings, dailyReport: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-[#1D2129]">每周运营周报</p>
                          <p className="text-sm text-[#86909C]">每周一 09:00 推送上周运营总结</p>
                        </div>
                        <Switch 
                          checked={pushSettings.weeklyReport}
                          onCheckedChange={(checked) => setPushSettings({ ...pushSettings, weeklyReport: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 告警推送 */}
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="w-5 h-5 text-[#FF7D00]" />
                      <h4 className="font-medium text-[#1D2129]">告警推送</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-[#1D2129]">库存预警</p>
                          <p className="text-sm text-[#86909C]">库存低于安全值时立即推送</p>
                        </div>
                        <Switch 
                          checked={pushSettings.inventoryAlert}
                          onCheckedChange={(checked) => setPushSettings({ ...pushSettings, inventoryAlert: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-[#1D2129]">订单异常</p>
                          <p className="text-sm text-[#86909C]">订单取消、退款等异常情况推送</p>
                        </div>
                        <Switch 
                          checked={pushSettings.orderAlert}
                          onCheckedChange={(checked) => setPushSettings({ ...pushSettings, orderAlert: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-[#1D2129]">广告ROI告警</p>
                          <p className="text-sm text-[#86909C]">广告ROI低于阈值时推送</p>
                        </div>
                        <Switch 
                          checked={pushSettings.adsAlert}
                          onCheckedChange={(checked) => setPushSettings({ ...pushSettings, adsAlert: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full btn-primary h-12" onClick={handleSaveConfig}>
                    保存配置
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 告警规则设置 */}
          <TabsContent value="alerts" className="mt-6">
            <div className="space-y-6">
              {/* 告警阈值配置 */}
              <Card className="card-minimal">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-[#F53F3F]" />
                      <h3 className="text-lg font-semibold text-[#1D2129]">告警阈值设置</h3>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTestAlert('阈值测试')}>
                      测试告警
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* 库存告警 */}
                    <div className="border-b border-[#E5E6EB] pb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-[#165DFF]" />
                        <h4 className="font-medium text-[#1D2129]">库存告警</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">库存预警阈值</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={alertThresholds.inventoryLow}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, inventoryLow: Number(e.target.value) })}
                              className="input-minimal h-10 w-28"
                            />
                            <span className="text-sm text-[#86909C]">件（低于此值触发预警）</span>
                          </div>
                          <p className="text-xs text-[#BBBDC0]">当库存低于此值时发送黄色预警通知</p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">库存紧急阈值</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={alertThresholds.inventoryCritical}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, inventoryCritical: Number(e.target.value) })}
                              className="input-minimal h-10 w-28"
                            />
                            <span className="text-sm text-[#86909C]">件（低于此值触发紧急告警）</span>
                          </div>
                          <p className="text-xs text-[#BBBDC0]">当库存低于此值时发送红色紧急告警</p>
                        </div>
                      </div>
                    </div>

                    {/* 订单告警 */}
                    <div className="border-b border-[#E5E6EB] pb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingCart className="w-5 h-5 text-[#165DFF]" />
                        <h4 className="font-medium text-[#1D2129]">订单告警</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">订单取消率告警</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={alertThresholds.orderCancelRate}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, orderCancelRate: Number(e.target.value) })}
                              className="input-minimal h-10 w-28"
                            />
                            <span className="text-sm text-[#86909C]">%（超过此值触发告警）</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">退款率告警</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={alertThresholds.refundRate}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, refundRate: Number(e.target.value) })}
                              className="input-minimal h-10 w-28"
                            />
                            <span className="text-sm text-[#86909C]">%（超过此值触发告警）</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 广告告警 */}
                    <div className="border-b border-[#E5E6EB] pb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-5 h-5 text-[#FF7D00]" />
                        <h4 className="font-medium text-[#1D2129]">广告告警</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">最低ROI阈值</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={alertThresholds.adRoiMin}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, adRoiMin: Number(e.target.value) })}
                              className="input-minimal h-10 w-24"
                            />
                            <span className="text-sm text-[#86909C]">（低于此值告警）</span>
                          </div>
                          <p className="text-xs text-[#BBBDC0]">广告投入产出比低于此值时告警</p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">单日最高花费</label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#86909C]">$</span>
                            <Input
                              type="number"
                              value={alertThresholds.adSpendMax}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, adSpendMax: Number(e.target.value) })}
                              className="input-minimal h-10 w-28"
                            />
                            <span className="text-sm text-[#86909C]">（单日上限）</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">最高点击成本</label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#86909C]">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={alertThresholds.adCpcMax}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, adCpcMax: Number(e.target.value) })}
                              className="input-minimal h-10 w-24"
                            />
                            <span className="text-sm text-[#86909C]">（单次点击上限）</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 财务告警 */}
                    <div className="pb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-[#165DFF]" />
                        <h4 className="font-medium text-[#1D2129]">财务告警</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">单日亏损告警阈值</label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#86909C]">$</span>
                            <Input
                              type="number"
                              value={alertThresholds.dailyLoss}
                              onChange={(e) => setAlertThresholds({ ...alertThresholds, dailyLoss: Number(e.target.value) })}
                              className="input-minimal h-10 w-28"
                            />
                            <span className="text-sm text-[#86909C]">（超过此值触发告警）</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-[#1D2129]">现金流为负告警</p>
                            <p className="text-sm text-[#86909C]">当现金流为负时立即告警</p>
                          </div>
                          <Switch 
                            checked={alertThresholds.cashFlowNegative}
                            onCheckedChange={(checked) => setAlertThresholds({ ...alertThresholds, cashFlowNegative: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 告警频率控制 */}
              <Card className="card-minimal">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-[#165DFF]" />
                    <h3 className="text-lg font-semibold text-[#1D2129]">告警频率控制</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* 告警合并频率 */}
                    <div className="space-y-3">
                      <label className="text-sm text-[#4E5969]">告警合并频率</label>
                      <Select 
                        value={alertFrequency.frequency}
                        onValueChange={(value: 'realtime' | 'hourly' | 'daily') => setAlertFrequency({ ...alertFrequency, frequency: value })}
                      >
                        <SelectTrigger className="w-full md:w-64 input-minimal h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">实时告警（每次触发立即推送）</SelectItem>
                          <SelectItem value="hourly">每小时合并（每小时最多推送1次）</SelectItem>
                          <SelectItem value="daily">每日合并（每天上午9点统一推送）</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-[#BBBDC0]">
                        {alertFrequency.frequency === 'realtime' && '紧急告警将立即推送，但可能导致告警过多'}
                        {alertFrequency.frequency === 'hourly' && '建议日常使用，减少告警打扰'}
                        {alertFrequency.frequency === 'daily' && '适合不紧急的场景，每天统一汇总'}
                      </p>
                    </div>

                    {/* 静默时段 */}
                    <div className="space-y-4 pt-4 border-t border-[#E5E6EB]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#1D2129] font-medium">静默时段</p>
                          <p className="text-sm text-[#86909C]">在设定时间段内不推送非紧急告警</p>
                        </div>
                        <Switch 
                          checked={alertFrequency.silentEnabled}
                          onCheckedChange={(checked) => setAlertFrequency({ ...alertFrequency, silentEnabled: checked })}
                        />
                      </div>
                      
                      {alertFrequency.silentEnabled && (
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={alertFrequency.silentStart}
                              onChange={(e) => setAlertFrequency({ ...alertFrequency, silentStart: e.target.value })}
                              className="input-minimal h-10 w-36"
                            />
                            <span className="text-[#86909C]">至</span>
                            <Input
                              type="time"
                              value={alertFrequency.silentEnd}
                              onChange={(e) => setAlertFrequency({ ...alertFrequency, silentEnd: e.target.value })}
                              className="input-minimal h-10 w-36"
                            />
                          </div>
                          <Badge className="bg-[#F2F3F5] text-[#4E5969]">非紧急告警静默</Badge>
                        </div>
                      )}
                    </div>

                    {/* 紧急告警不受静默影响 */}
                    <div className="flex items-center justify-between py-3 bg-[#FFF7E6] rounded-lg px-4">
                      <div>
                        <p className="text-[#1D2129] font-medium">紧急告警不受静默限制</p>
                        <p className="text-sm text-[#86909C]">库存紧急、现金流为负等紧急告警即使在静默时段也会立即推送</p>
                      </div>
                      <Badge className="bg-[#FF7D00] text-white">始终推送</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 告警渠道选择 */}
              <Card className="card-minimal">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Bell className="w-5 h-5 text-[#165DFF]" />
                    <h3 className="text-lg font-semibold text-[#1D2129]">通知渠道</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* 渠道选择 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          alertChannels.feishu ? 'border-[#165DFF] bg-[#F4F7FF]' : 'border-[#E5E6EB] hover:border-[#BBDC0]'
                        }`}
                        onClick={() => setAlertChannels({ ...alertChannels, feishu: !alertChannels.feishu })}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#165DFF]" />
                            <span className="font-medium text-[#1D2129]">飞书推送</span>
                          </div>
                          <Switch checked={alertChannels.feishu} />
                        </div>
                        <p className="text-xs text-[#86909C]">通过飞书机器人推送告警消息</p>
                      </div>
                      
                      <div 
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          alertChannels.email ? 'border-[#165DFF] bg-[#F4F7FF]' : 'border-[#E5E6EB] hover:border-[#BBDC0]'
                        }`}
                        onClick={() => setAlertChannels({ ...alertChannels, email: !alertChannels.email })}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-[#165DFF]" />
                            <span className="font-medium text-[#1D2129]">邮件通知</span>
                          </div>
                          <Switch checked={alertChannels.email} />
                        </div>
                        <p className="text-xs text-[#86909C]">通过邮件发送告警通知</p>
                      </div>
                      
                      <div 
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          alertChannels.system ? 'border-[#165DFF] bg-[#F4F7FF]' : 'border-[#E5E6EB] hover:border-[#BBDC0]'
                        }`}
                        onClick={() => setAlertChannels({ ...alertChannels, system: !alertChannels.system })}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-[#165DFF]" />
                            <span className="font-medium text-[#1D2129]">系统通知</span>
                          </div>
                          <Switch checked={alertChannels.system} />
                        </div>
                        <p className="text-xs text-[#86909C]">在系统内显示通知消息</p>
                      </div>
                    </div>

                    {/* 飞书配置 */}
                    {alertChannels.feishu && (
                      <div className="space-y-4 pt-4 border-t border-[#E5E6EB]">
                        <h4 className="font-medium text-[#1D2129]">飞书配置</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-[#4E5969]">Webhook 地址</label>
                            <Input
                              placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
                              value={alertChannels.webhookUrl}
                              onChange={(e) => setAlertChannels({ ...alertChannels, webhookUrl: e.target.value })}
                              className="input-minimal h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-[#4E5969]">群组 ID（可选）</label>
                            <Input
                              placeholder="oc_xxx"
                              value={alertChannels.chatId}
                              onChange={(e) => setAlertChannels({ ...alertChannels, chatId: e.target.value })}
                              className="input-minimal h-10"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 邮件配置 */}
                    {alertChannels.email && (
                      <div className="space-y-4 pt-4 border-t border-[#E5E6EB]">
                        <h4 className="font-medium text-[#1D2129]">邮件配置</h4>
                        <div className="space-y-2">
                          <label className="text-sm text-[#4E5969]">接收邮箱（多个用逗号分隔）</label>
                          <Input
                            placeholder="alert@example.com, oncall@example.com"
                            value={alertChannels.emailList}
                            onChange={(e) => setAlertChannels({ ...alertChannels, emailList: e.target.value })}
                            className="input-minimal h-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* 保存按钮 */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" className="btn-secondary" onClick={() => {
                  setAlertThresholds({
                    inventoryLow: 20,
                    inventoryCritical: 5,
                    orderCancelRate: 5,
                    refundRate: 10,
                    adRoiMin: 1.5,
                    adSpendMax: 1000,
                    adCpcMax: 2.0,
                    dailyLoss: 500,
                    cashFlowNegative: true,
                    complianceEnabled: true,
                  });
                  setAlertFrequency({
                    realtime: false,
                    frequency: 'hourly',
                    silentStart: '22:00',
                    silentEnd: '08:00',
                    silentEnabled: true,
                  });
                  toast.info('已重置为默认值');
                }}>
                  重置为默认
                </Button>
                <Button className="btn-primary px-8" onClick={handleSaveAlertRules}>
                  保存告警规则
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
