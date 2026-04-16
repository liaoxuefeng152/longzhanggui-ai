'use client';

import { useState } from 'react';
import { Settings, User, Lock, Bell, Palette, Globe, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('设置已保存！');
    }, 800);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-[#00EEFF]" />
        <div>
          <h1 className="text-2xl font-bold text-white">设置</h1>
          <p className="text-[#64748B]">账号与偏好设置</p>
        </div>
      </div>

      <Card className="glass-card">
        <Tabs defaultValue="account" className="w-full">
          <div className="border-b border-[#1E293B] px-6">
            <TabsList className="bg-transparent h-16 gap-6">
              <TabsTrigger value="account" className="data-[state=active]:text-[#00EEFF] data-[state=active]:border-b-2 data-[state=active]:border-[#00EEFF] rounded-none h-full px-0">
                <User className="w-4 h-4 mr-2" />
                账号设置
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:text-[#00EEFF] data-[state=active]:border-b-2 data-[state=active]:border-[#00EEFF] rounded-none h-full px-0">
                <Lock className="w-4 h-4 mr-2" />
                安全设置
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:text-[#00EEFF] data-[state=active]:border-b-2 data-[state=active]:border-[#00EEFF] rounded-none h-full px-0">
                <Bell className="w-4 h-4 mr-2" />
                通知设置
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:text-[#00EEFF] data-[state=active]:border-b-2 data-[state=active]:border-[#00EEFF] rounded-none h-full px-0">
                <Palette className="w-4 h-4 mr-2" />
                外观设置
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="account" className="mt-0 space-y-6">
              {/* 头像 */}
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="w-24 h-24 border-2 border-[#00EEFF]">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[#00EEFF] to-[#7B61FF] text-[#0B101A] text-2xl font-bold">
                    龙
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="ghost" className="bg-[#1E293B] text-white hover:bg-[#2D3748]">
                    更换头像
                  </Button>
                  <p className="text-[#64748B] text-sm mt-2">支持 JPG、PNG 格式，大小不超过 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">用户名</Label>
                  <Input defaultValue="龙掌柜" className="h-12 tech-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">昵称</Label>
                  <Input placeholder="请输入昵称" className="h-12 tech-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">手机号</Label>
                  <Input defaultValue="138****8888" className="h-12 tech-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">邮箱</Label>
                  <Input placeholder="请输入邮箱" className="h-12 tech-input" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">修改密码</p>
                      <p className="text-[#64748B] text-sm">上次修改时间：30天前</p>
                    </div>
                    <Button variant="ghost" className="text-[#00EEFF] hover:text-[#00EEFF] hover:bg-[rgba(0,238,255,0.1)]">
                      修改
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">两步验证</p>
                      <p className="text-[#64748B] text-sm">提高账号安全性</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-[#00EEFF]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">登录设备管理</p>
                      <p className="text-[#64748B] text-sm">查看当前在线设备</p>
                    </div>
                    <Button variant="ghost" className="text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]">
                      查看
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <div className="space-y-4">
                {[
                  { title: '系统通知', desc: '系统公告、功能更新等', default: true },
                  { title: '运营日报', desc: '每日运营数据推送', default: true },
                  { title: '异常告警', desc: '库存、广告、订单异常推送', default: true },
                  { title: '营销活动', desc: '平台活动、优惠信息推送', default: false },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-[#64748B] text-sm">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.default} className="data-[state=checked]:bg-[#00EEFF]" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">语言</Label>
                  <Select defaultValue="zh-CN">
                    <SelectTrigger className="h-12 tech-input">
                      <SelectValue placeholder="选择语言" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">时区</Label>
                  <Select defaultValue="Asia/Shanghai">
                    <SelectTrigger className="h-12 tech-input">
                      <SelectValue placeholder="选择时区" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1628] border-[#1E293B]">
                      <SelectItem value="Asia/Shanghai">中国标准时间 (GMT+8)</SelectItem>
                      <SelectItem value="Asia/Bangkok">泰国时间 (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Kuala_Lumpur">马来西亚时间 (GMT+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">深色模式</p>
                    <p className="text-[#64748B] text-sm">使用深色主题</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#00EEFF]" />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="h-12 px-8 btn-neon-primary"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-[#0B101A] border-t-transparent rounded-full animate-spin" />
              保存中...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              保存设置
            </div>
          )}
        </Button>
      </div>
      </div>
    </MainLayout>
  );
}
