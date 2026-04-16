'use client';

import { useState } from 'react';
import { MessageSquare, Key, Lock, Bell, Send, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';

export default function FeishuConfigPage() {
  const [bound, setBound] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alerts, setAlerts] = useState({
    roi: true,
    spend: true,
    inventory: true,
    review: false,
  });

  const handleBind = () => {
    setLoading(true);
    setTimeout(() => {
      setBound(true);
      setLoading(false);
      toast.success('飞书绑定成功！');
    }, 1500);
  };

  const handleUnbind = () => {
    setBound(false);
    toast.success('已解绑飞书');
  };

  const handleTestSend = () => {
    toast.success('测试消息已发送，请检查飞书');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-[#00EEFF]" />
        <div>
          <h1 className="text-2xl font-bold text-white">飞书配置</h1>
          <p className="text-[#64748B]">消息推送 · 告警设置</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 绑定卡片 */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#7B61FF]" />
            绑定飞书
          </h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`status-indicator ${bound ? 'status-online' : ''}`} style={{ backgroundColor: bound ? undefined : '#64748B', boxShadow: bound ? undefined : 'none' }} />
              <span className={bound ? 'text-[#00EEFF]' : 'text-[#64748B]'}>
                {bound ? '已绑定' : '未绑定'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#94A3B8]">App ID</Label>
                <Input 
                  placeholder="请输入 App ID" 
                  className="h-12 tech-input"
                  defaultValue={bound ? 'cli_a954ed9674789cd3' : ''}
                  disabled={bound}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#94A3B8]">App Secret</Label>
                <div className="relative">
                  <Input 
                    type={showSecret ? 'text' : 'password'}
                    placeholder="请输入 App Secret" 
                    className="h-12 tech-input pr-10"
                    defaultValue={bound ? '****************' : ''}
                    disabled={bound}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                  >
                    {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {bound ? (
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                onClick={handleTestSend}
                className="flex-1 h-12 bg-[rgba(0,238,255,0.1)] text-[#00EEFF] hover:bg-[rgba(0,238,255,0.2)] border border-[rgba(0,238,255,0.3)]"
              >
                <Send className="w-5 h-5 mr-2" />
                发送测试消息
              </Button>
              <Button 
                variant="ghost"
                onClick={handleUnbind}
                className="h-12 text-[#FF4081] hover:text-[#FF4081] hover:bg-[rgba(255,64,129,0.1)]"
              >
                解绑
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleBind}
              disabled={loading}
              className="w-full h-12 btn-neon-primary"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#0B101A] border-t-transparent rounded-full animate-spin" />
                  绑定中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  绑定飞书
                </div>
              )}
            </Button>
          )}
        </Card>

        {/* 告警开关 */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF9800]" />
            告警开关
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
              <div>
                <p className="text-white font-medium">广告 ROI 低</p>
                <p className="text-[#64748B] text-sm">当 ROI 低于 2.0 时推送</p>
              </div>
              <Switch 
                checked={alerts.roi}
                onCheckedChange={(c) => setAlerts({...alerts, roi: c})}
                className="data-[state=checked]:bg-[#00EEFF]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
              <div>
                <p className="text-white font-medium">花费暴增</p>
                <p className="text-[#64748B] text-sm">当日花费超过昨日 50% 时推送</p>
              </div>
              <Switch 
                checked={alerts.spend}
                onCheckedChange={(c) => setAlerts({...alerts, spend: c})}
                className="data-[state=checked]:bg-[#00EEFF]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
              <div>
                <p className="text-white font-medium">库存不足</p>
                <p className="text-[#64748B] text-sm">当库存低于 50 件时推送</p>
              </div>
              <Switch 
                checked={alerts.inventory}
                onCheckedChange={(c) => setAlerts({...alerts, inventory: c})}
                className="data-[state=checked]:bg-[#00EEFF]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
              <div>
                <p className="text-white font-medium">差评预警</p>
                <p className="text-[#64748B] text-sm">当收到 3 星以下评价时推送</p>
              </div>
              <Switch 
                checked={alerts.review}
                onCheckedChange={(c) => setAlerts({...alerts, review: c})}
                className="data-[state=checked]:bg-[#00EEFF]"
              />
            </div>
          </div>
        </Card>
      </div>
      </div>
    </MainLayout>
  );
}
