'use client';

import { useState } from 'react';
import { MessageSquare, Bell, Calendar, Settings, CheckCircle, AlertCircle, Key, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

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

  const handleTestSend = () => {
    toast.success('测试消息已发送');
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
