'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { login } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('请输入账号和密码');
      return;
    }

    setIsLoading(true);

    try {
      // 调用真实登录API
      const response = await login({
        username: username,
        password: password,
      });

      setAuth(response.access_token, response.user);
      toast.success('登录成功');
      router.push('/');
    } catch (error: any) {
      console.error('登录失败:', error);
      toast.error(error.message || '账号或密码错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 演示模式登录（跳过认证）
  const handleDemoLogin = () => {
    // 模拟登录数据 - 演示模式默认客户端角色
    const mockToken = 'demo-token-' + Date.now();
    const mockUser = {
      id: 'demo-user-001',
      username: 'demo',
      name: '演示用户',
      phone: '13800138000',
      role: 'client', // 演示模式默认客户端
      permissions: ['dashboard', 'workflows', 'erp', 'tickets', 'reports'],
    };

    setAuth(mockToken, mockUser);
    localStorage.setItem('userRole', 'client');
    toast.success('演示模式登录成功');
    router.push('/dashboard');
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
            龙掌柜智能运营系统
          </h1>
          <p className="text-[14px] text-muted-foreground">
            龙掌柜智能运营系统 · v1.0
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

              <Button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-[14px] font-medium"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>

              {/* 演示模式入口 */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-[14px] border-primary/30 text-primary hover:bg-primary/5"
                onClick={handleDemoLogin}
              >
                演示模式（免登录）
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-4 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
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
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            ← 返回首页
          </button>
          <p className="text-[12px] text-muted-foreground">
            © 2024 龙掌柜智能运营系统 · 版权所有
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
            <span className="text-primary font-medium">管理员账号：</span>
            admin / admin123
          </p>
          <p className="text-[12px] text-muted-foreground text-center mb-2">
            <span className="text-primary font-medium">测试账号：</span>
            13800138000 / 123456
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
