'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Smartphone, Lock, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
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
    
    // 模拟登录
    await new Promise(resolve => setTimeout(resolve, 1500));

    localStorage.setItem('user', JSON.stringify({ name: '龙掌柜', phone: formData.phone }));
    localStorage.setItem('token', 'mock-jwt-token');
    
    toast.success('登录成功');
    
    // 光效扩散后跳转
    setTimeout(() => {
      router.push('/platforms');
    }, 500);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B101A] tech-grid-bg animate-grid-flow relative overflow-hidden">
      {/* 科技装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00EEFF]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7B61FF]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* 登录卡片 */}
      <Card className="w-full max-w-md p-8 glass-card relative z-10">
        {/* Logo区 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00EEFF] to-[#7B61FF] mb-4 animate-neon-pulse">
            <span className="text-[#0B101A] font-bold text-3xl">龙</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">龙掌柜</h1>
          <p className="text-[#00EEFF]">AI 跨境运营中枢</p>
        </div>

        {/* 登录方式切换 */}
        <Tabs 
          defaultValue="password" 
          value={loginType}
          onValueChange={(v) => setLoginType(v as 'password' | 'sms')}
          className="w-full mb-6"
        >
          <TabsList className="w-full bg-[#1E293B] p-1">
            <TabsTrigger 
              value="password" 
              className="flex-1 data-[state=active]:bg-[rgba(0,238,255,0.2)] data-[state=active]:text-[#00EEFF]"
            >
              <Lock className="w-4 h-4 mr-2" />
              密码登录
            </TabsTrigger>
            <TabsTrigger 
              value="sms" 
              className="flex-1 data-[state=active]:bg-[rgba(0,238,255,0.2)] data-[state=active]:text-[#00EEFF]"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              验证码登录
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 表单 */}
        <div className="space-y-4">
          {/* 手机号 */}
          <div className="space-y-2">
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <Input
                type="tel"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10 h-12 tech-input"
              />
            </div>
          </div>

          {/* 密码/验证码 */}
          {loginType === 'password' ? (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 tech-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <Input
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="pl-10 h-12 tech-input"
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={handleGetCode}
                  disabled={countdown > 0}
                  className="h-12 px-4 bg-gradient-to-r from-[#7B61FF] to-[#6349E3] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
            </div>
          )}

          {/* 登录按钮 */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 btn-neon-primary mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#0B101A] border-t-transparent rounded-full animate-spin" />
                <span>登录中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>登录</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </div>

        {/* 底部链接 */}
        <div className="flex justify-between mt-6 text-sm">
          <button className="text-[#64748B] hover:text-[#00EEFF] transition-colors">
            注册账号
          </button>
          <button className="text-[#64748B] hover:text-[#00EEFF] transition-colors">
            忘记密码
          </button>
        </div>
      </Card>
    </div>
  );
}
