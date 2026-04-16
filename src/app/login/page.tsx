'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Smartphone, MessageSquare, Shield, User, Store, ArrowRight } from 'lucide-react';
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
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | null>(null);

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

  const handleRoleSelect = (role: 'admin' | 'user') => {
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      toast.error('请先选择登录角色');
      return;
    }
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

    // 根据角色保存用户信息
    const userInfo = {
      id: selectedRole === 'admin' ? '1' : '2',
      username: formData.phone,
      role: selectedRole,
      email: `${formData.phone}@example.com`,
      name: selectedRole === 'admin' ? '管理员' : '普通用户',
    };
    
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('token', 'mock-jwt-token');
    
    toast.success(`${selectedRole === 'admin' ? '管理员' : '用户'}登录成功`);
    
    setTimeout(() => {
      router.push('/dashboard');
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

          {/* 角色选择 - 仅当未选择时显示 */}
          {!selectedRole ? (
            <div className="space-y-4">
              <p className="text-center text-[#86909C] mb-4">请选择登录角色</p>
              
              {/* 管理员入口 */}
              <button
                onClick={() => handleRoleSelect('admin')}
                className="w-full p-4 border-2 border-[#E5E6EB] rounded-lg hover:border-[#FF7D00] transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFF7E6] flex items-center justify-center group-hover:bg-[#FF7D00]/10 transition-colors">
                    <Shield className="w-6 h-6 text-[#FF7D00]" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-[#1D2129]">管理员入口</h3>
                    <p className="text-sm text-[#86909C]">平台配置、用户管理、系统设置</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#86909C] group-hover:text-[#FF7D00] transition-colors" />
                </div>
              </button>

              {/* 普通用户入口 */}
              <button
                onClick={() => handleRoleSelect('user')}
                className="w-full p-4 border-2 border-[#E5E6EB] rounded-lg hover:border-[#00B42A] transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8FFF3] flex items-center justify-center group-hover:bg-[#00B42A]/10 transition-colors">
                    <Store className="w-6 h-6 text-[#00B42A]" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-[#1D2129]">商家入口</h3>
                    <p className="text-sm text-[#86909C]">店铺管理、AI智能体、ERP系统</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#86909C] group-hover:text-[#00B42A] transition-colors" />
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* 已选角色提示 */}
              <div className="mb-4 p-3 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedRole === 'admin' ? (
                    <>
                      <Shield className="w-4 h-4 text-[#FF7D00]" />
                      <span className="text-sm text-[#1D2129]">管理员登录</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 text-[#00B42A]" />
                      <span className="text-sm text-[#1D2129]">商家登录</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-xs text-[#165DFF] hover:underline"
                >
                  切换角色
                </button>
              </div>

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
                  className={`w-full h-12 text-base ${
                    selectedRole === 'admin' 
                      ? 'bg-[#FF7D00] hover:bg-[#FF7D00]/90' 
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      登录中...
                    </div>
                  ) : (
                    `以${selectedRole === 'admin' ? '管理员' : '商家'}身份登录`
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
            </>
          )}
        </Card>

        {/* 版权信息 */}
        <div className="text-center mt-8 text-sm text-[#86909C]">
          版权信息 ©2025 龙掌柜 All Rights Reserved
        </div>
      </div>
    </div>
  );
}
