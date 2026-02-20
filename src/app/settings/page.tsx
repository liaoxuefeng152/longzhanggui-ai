'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        <h1 className="text-[18px] font-semibold text-[#1D2129]">系统设置</h1>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border-[#E8E8E8]">
            <TabsTrigger value="general">通用设置</TabsTrigger>
            <TabsTrigger value="notification">通知设置</TabsTrigger>
            <TabsTrigger value="security">安全设置</TabsTrigger>
            <TabsTrigger value="integration">集成设置</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  基础信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">系统名称</Label>
                  <Input id="siteName" defaultValue="阿峰｜跨境AI中台" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDesc">系统描述</Label>
                  <Input
                    id="siteDesc"
                    defaultValue="专为TK东南亚跨境场景设计的AI能力中台"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">联系邮箱</Label>
                  <Input id="contactEmail" defaultValue="contact@afeng.ai" className="h-9" />
                </div>
                <Button className="bg-[#1677FF] hover:bg-[#0F62FE] h-9">
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notification" className="space-y-6">
            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  <Bell className="h-4 w-4 inline mr-2" />
                  通知偏好
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">订单通知</p>
                    <p className="text-[12px] text-[#717C89]">当有新订单时发送通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">用户注册通知</p>
                    <p className="text-[12px] text-[#717C89]">当有新用户注册时发送通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">系统异常通知</p>
                    <p className="text-[12px] text-[#717C89]">当系统出现异常时发送通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">每日报告</p>
                    <p className="text-[12px] text-[#717C89]">每日发送系统运行报告</p>
                  </div>
                  <Switch />
                </div>
                <Button className="bg-[#1677FF] hover:bg-[#0F62FE] h-9">
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  <Shield className="h-4 w-4 inline mr-2" />
                  安全配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">两步验证</p>
                    <p className="text-[12px] text-[#717C89]">启用两步验证以提高账户安全性</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">登录日志</p>
                    <p className="text-[12px] text-[#717C89]">记录所有登录活动</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">API密钥加密</p>
                    <p className="text-[12px] text-[#717C89]">所有API密钥加密存储</p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <Button className="bg-[#1677FF] hover:bg-[#0F62FE] h-9">
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card className="bg-white border-[#E8E8E8] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[14px] font-medium text-[#4E5969]">
                  <Database className="h-4 w-4 inline mr-2" />
                  模型集成
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doubaoKey">豆包API密钥</Label>
                  <Input
                    id="doubaoKey"
                    type="password"
                    placeholder="请输入豆包API密钥"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openaiKey">OpenAI API密钥</Label>
                  <Input
                    id="openaiKey"
                    type="password"
                    placeholder="请输入OpenAI API密钥（可选）"
                    className="h-9"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1D2129]">启用自动路由</p>
                    <p className="text-[12px] text-[#717C89]">根据场景自动选择最优模型</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="bg-[#1677FF] hover:bg-[#0F62FE] h-9">
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
