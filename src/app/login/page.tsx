'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Smartphone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'password' | 'sms'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    code: '',
  });

  const handleGetCode = () => {
    if (!formData.phone) {
      toast.error('请输入手机号');
      return;
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    toast.success('验证码已发送');
  };

  const handleLogin = async () => {
    if (!formData.phone) {
      toast.error('请输入手机号');
      return;
    }
    if (loginType === 'password' && !formData.password) {
      toast.error('请输入密码');
      return;
    }
    if (loginType === 'sms' && !formData.code) {
      toast.error('请输入验证码');
      return;
    }

    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.setItem('user', JSON.stringify({ name: '龙掌柜', phone: formData.phone }));
    localStorage.setItem('token', 'mock-jwt-token');
    
    toast.success('登录成功');
    
    setTimeout(() => {
      router.push('/');
    }, 500);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F8FA]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#165DFF] to-[#4080FF] flex items-center justify-center">
              <span className="text-white font-bold text-lg">龙</span>
            </div>
            <span className="text-[#1D2129] font-bold text-xl">龙掌柜 AI 运营助手</span>
          </div>
        </div>

        {/* 登录卡片 */}
        <Card className="p-8 bg-white border border-[#E5E6EB] shadow-lg">
          <h2 className="text-xl font-bold text-[#1D2129] mb-6 text-center">账号登录</h2>

          {/* 登录方式切换 */}
          <Tabs 
            defaultValue="password" 
            value={loginType}
            onValueChange={(v) => setLoginType(v as 'password' | 'sms')}
            className="w-full mb-6"
          >
            <TabsList className="w-full bg-[#F2F3F5]">
              <TabsTrigger value="password" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
                密码登录
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
                验证码登录
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {/* 手机号 */}
            <div className="space-y-2">
              <label className="text-sm text-[#4E5969]">手机号/邮箱</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                <Input
                  type="tel"
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 h-12 input-minimal"
                />
              </div>
            </div>

            {/* 密码/验证码 */}
            {loginType === 'password' ? (
              <div className="space-y-2">
                <label className="text-sm text-[#4E5969]">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-12 input-minimal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86909C] hover:text-[#4E5969]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm text-[#4E5969]">验证码</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86909C]" />
                    <Input
                      type="text"
                      placeholder="请输入验证码"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="pl-10 h-12 input-minimal"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleGetCode}
                    disabled={countdown > 0}
                    className="h-12 px-4 bg-[#F2F3F5] text-[#4E5969] hover:bg-[#E5E6EB] disabled:opacity-50 whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </Button>
                </div>
              </div>
            )}

            {/* 忘记密码/验证码登录切换 */}
            <div className="flex items-center justify-between text-sm">
              {loginType === 'password' ? (
                <button 
                  className="text-[#165DFF] hover:underline"
                  onClick={() => setLoginType('sms')}
                >
                  验证码登录
                </button>
              ) : (
                <button 
                  className="text-[#165DFF] hover:underline"
                  onClick={() => setLoginType('password')}
                >
                  密码登录
                </button>
              )}
              <button className="text-[#86909C] hover:text-[#4E5969]">
                忘记密码
              </button>
            </div>

            {/* 登录按钮 */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 btn-primary text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </Button>

            {/* 注册链接 */}
            <div className="text-center text-sm text-[#86909C]">
              还没有账号？
              <button className="text-[#165DFF] hover:underline ml-1">
                立即注册
              </button>
            </div>

            {/* 飞书快捷登录 */}
            <div className="mt-4 pt-4 border-t border-[#E5E6EB]">
              <Button
                variant="ghost"
                className="w-full h-12 bg-[#F2F3F5] text-[#4E5969] hover:bg-[#E5E6EB]"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                飞书快捷登录
              </Button>
            </div>
          </div>
        </Card>

        {/* 版权信息 */}
        <div className="text-center mt-8 text-sm text-[#86909C]">
          版权信息 ©2025 龙掌柜 All Rights Reserved
        </div>
      </div>
    </div>
  );
}
