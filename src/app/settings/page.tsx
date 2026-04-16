'use client';

import { useState } from 'react';
import { Settings, User, Lock, Bell, Palette, Globe, Save, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">系统设置</h1>
            <p className="text-[#86909C] mt-1">管理您的账号信息和偏好设置</p>
          </div>
        </div>

        <Card className="card-minimal">
          <Tabs defaultValue="account" className="w-full">
            <div className="border-b border-[#E5E6EB] px-6">
              <TabsList className="bg-transparent h-14 gap-1 w-full justify-start">
                <TabsTrigger 
                  value="account" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF] data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-[#165DFF]"
                >
                  <User className="w-4 h-4 mr-2" />
                  账号设置
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF] data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-[#165DFF]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  安全设置
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF] data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-[#165DFF]"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  通知设置
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#165DFF] data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-[#165DFF]"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  偏好设置
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* 账号设置 */}
              <TabsContent value="account" className="mt-0 space-y-6">
                {/* 头像 */}
                <div className="flex items-center gap-6 mb-8 p-6 bg-[#F7F8FA] rounded-lg">
                  <Avatar className="w-24 h-24 border-2 border-[#165DFF]">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[#165DFF] to-[#4080FF] text-white text-2xl font-bold">
                      龙
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button className="btn-primary">
                      更换头像
                    </Button>
                    <p className="text-[#86909C] text-sm mt-2">支持 JPG、PNG 格式，大小不超过 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4E5969]">用户名</Label>
                    <Input defaultValue="龙掌柜" className="input-minimal h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4E5969]">昵称</Label>
                    <Input placeholder="请输入昵称" className="input-minimal h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4E5969]">手机号</Label>
                    <Input defaultValue="138****8888" className="input-minimal h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4E5969]">邮箱</Label>
                    <Input placeholder="请输入邮箱" className="input-minimal h-12" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E6EB]">
                  <Button onClick={handleSave} disabled={loading} className="btn-primary">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        保存中...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存修改
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* 安全设置 */}
              <TabsContent value="security" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <Card className="card-minimal p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#E8F3FF] flex items-center justify-center">
                          <Lock className="w-6 h-6 text-[#165DFF]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1D2129]">修改密码</p>
                            <Badge className="bg-[#E8FFEA] text-[#00B42A] text-xs">已设置</Badge>
                          </div>
                          <p className="text-sm text-[#86909C]">上次修改时间：30天前</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-[#165DFF] hover:bg-[#E8F3FF]">
                        修改
                      </Button>
                    </div>
                  </Card>

                  <Card className="card-minimal p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#FFF7E8] flex items-center justify-center">
                          <Shield className="w-6 h-6 text-[#FF7D00]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1D2129]">两步验证</p>
                            <Badge className="bg-[#FFF7E8] text-[#FF7D00] text-xs">建议开启</Badge>
                          </div>
                          <p className="text-sm text-[#86909C]">提高账号安全性，防止账号被盗</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </Card>

                  <Card className="card-minimal p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#F2F3F5] flex items-center justify-center">
                          <User className="w-6 h-6 text-[#86909C]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1D2129]">登录设备管理</p>
                            <Badge className="bg-[#E8F3FF] text-[#165DFF] text-xs">2台设备</Badge>
                          </div>
                          <p className="text-sm text-[#86909C]">查看并管理登录过的设备</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-[#165DFF] hover:bg-[#E8F3FF]">
                        查看
                      </Button>
                    </div>
                  </Card>

                  <Card className="card-minimal p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#F2F3F5] flex items-center justify-center">
                          <Bell className="w-6 h-6 text-[#86909C]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1D2129]">登录通知</p>
                            <Badge className="bg-[#E8FFEA] text-[#00B42A] text-xs">已开启</Badge>
                          </div>
                          <p className="text-sm text-[#86909C]">新设备登录时发送通知</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* 通知设置 */}
              <TabsContent value="notifications" className="mt-0 space-y-6">
                <div className="space-y-4">
                  {[
                    { 
                      title: '系统通知', 
                      desc: '系统公告、功能更新、版本升级等重要通知', 
                      default: true,
                      icon: Settings,
                      color: 'bg-[#E8F3FF]',
                      iconColor: 'text-[#165DFF]'
                    },
                    { 
                      title: '运营日报', 
                      desc: '每日运营数据汇总和分析报告推送', 
                      default: true,
                      icon: Bell,
                      color: 'bg-[#E8FFEA]',
                      iconColor: 'text-[#00B42A]'
                    },
                    { 
                      title: '异常告警', 
                      desc: '库存不足、广告ROI异常、订单异常等紧急通知', 
                      default: true,
                      icon: Shield,
                      color: 'bg-[#FFF7E8]',
                      iconColor: 'text-[#FF7D00]'
                    },
                    { 
                      title: '营销活动', 
                      desc: '平台促销活动、优惠信息、新功能推荐', 
                      default: false,
                      icon: Bell,
                      color: 'bg-[#F2F3F5]',
                      iconColor: 'text-[#86909C]'
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Card key={i} className="card-minimal p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                              <Icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                            <div>
                              <p className="font-medium text-[#1D2129]">{item.title}</p>
                              <p className="text-sm text-[#86909C]">{item.desc}</p>
                            </div>
                          </div>
                          <Switch defaultChecked={item.default} />
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#E5E6EB]">
                  <Button onClick={handleSave} disabled={loading} className="btn-primary">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        保存中...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存设置
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* 偏好设置 */}
              <TabsContent value="preferences" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4E5969]">界面语言</Label>
                    <Select defaultValue="zh-CN">
                      <SelectTrigger className="input-minimal h-12">
                        <SelectValue placeholder="选择语言" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="zh-TW">繁體中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#86909C]">设置系统界面显示的语言</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4E5969]">时区设置</Label>
                    <Select defaultValue="Asia/Shanghai">
                      <SelectTrigger className="input-minimal h-12">
                        <SelectValue placeholder="选择时区" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Shanghai">中国标准时间 (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Bangkok">泰国时间 (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Kuala_Lumpur">马来西亚时间 (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Jakarta">印尼时间 (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Ho_Chi_Minh">越南时间 (GMT+7)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#86909C]">设置后数据报表和定时任务将按此时区显示</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Card className="card-minimal p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#F2F3F5] flex items-center justify-center">
                          <Bell className="w-6 h-6 text-[#86909C]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1D2129]">推送频率</p>
                          <p className="text-sm text-[#86909C]">控制通知推送的频率，避免打扰</p>
                        </div>
                      </div>
                      <Select defaultValue="normal" className="w-40">
                        <SelectTrigger className="input-minimal h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">实时推送</SelectItem>
                          <SelectItem value="normal">普通（每日汇总）</SelectItem>
                          <SelectItem value="quiet">安静模式（仅紧急）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>

                  <Card className="card-minimal p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#E8F3FF] flex items-center justify-center">
                          <Globe className="w-6 h-6 text-[#165DFF]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1D2129]">默认目标市场</p>
                          <p className="text-sm text-[#86909C]">选品和上新时的默认目标市场</p>
                        </div>
                      </div>
                      <Select defaultValue="all" className="w-40">
                        <SelectTrigger className="input-minimal h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部市场</SelectItem>
                          <SelectItem value="us">美国</SelectItem>
                          <SelectItem value="eu">欧洲</SelectItem>
                          <SelectItem value="sea">东南亚</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                </div>

                <div className="pt-4 border-t border-[#E5E6EB]">
                  <Button onClick={handleSave} disabled={loading} className="btn-primary">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        保存中...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存设置
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
}
