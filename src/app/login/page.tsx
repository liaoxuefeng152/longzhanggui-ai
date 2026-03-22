'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { login } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState('ABCD');
  const [isLoading, setIsLoading] = useState(false);

  // 生成随机验证码
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  // 初始化验证码
  useState(() => {
    generateCaptcha();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('请输入账号和密码');
      return;
    }

    if (captcha.toUpperCase() !== captchaCode) {
      toast.error('验证码错误，请重新输入');
      generateCaptcha();
      setCaptcha('');
      return;
    }

    setIsLoading(true);

    try {
      // 调用真实登录API
      const response = await login({
        phone: username, // 使用输入的用户名作为手机号
        password: password,
      });

      // 登录成功，保存用户信息（token已在login函数中保存）
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('登录成功');
      router.push('/');
    } catch (error: any) {
      console.error('登录失败:', error);
      toast.error(error.message || '账号或密码错误');
      generateCaptcha();
      setCaptcha('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F4FF] via-[#F0F7FF] to-[#E6F0FF]">
      <div className="w-full max-w-md">
        {/* 顶部品牌区 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🦞</span>
          </div>
          <h1 className="text-[20px] font-semibold text-foreground mb-2">
            龙虾AI跨境无人店系统
          </h1>
          <p className="text-[14px] text-muted-foreground">
            飞书AI中台驱动版 · v1.0
          </p>
        </div>

        {/* 登录表单卡片 */}
        <Card className="shadow-xl border-0 rounded-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-[16px] font-medium">管理员登录</CardTitle>
            <CardDescription className="text-[13px]">
              严格权限校验，保障系统数据安全
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[14px]">账号</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入管理员账号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[14px]">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha" className="text-[14px]">验证码</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="captcha"
                      type="text"
                      placeholder="请输入验证码"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      className="pl-10 h-10"
                      maxLength={4}
                    />
                  </div>
                  <div
                    className="w-[100px] h-10 bg-muted rounded-md flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={generateCaptcha}
                    title="点击刷新验证码"
                  >
                    <span className="text-[18px] font-bold tracking-[4px] text-primary select-none">
                      {captchaCode}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-[14px] font-medium"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-4 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  安全登录
                </span>
                <span>·</span>
                <span>管理员专属入口</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-[12px] text-muted-foreground">
            © 2024 龙虾AI跨境无人店系统 · 版权所有
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px]">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              帮助中心
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              联系阿峰
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              忘记密码
            </a>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-[12px] text-muted-foreground text-center mb-2">
            <span className="text-primary font-medium">默认管理员账号：</span>
            13800138000 / admin123
          </p>
          <p className="text-[12px] text-muted-foreground text-center">
            <span className="text-primary font-medium">提示：</span>
            终端用户（卖家）请通过飞书机器人交互，无需登录后台
          </p>
        </div>
      </div>
    </div>
  );
}
