'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [countdown, setCountdown] = useState(0);
  const [isRegister, setIsRegister] = useState(false);

  const handleSendCode = async () => {
    if (!phone) {
      toast.error('请输入手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }

    // 模拟发送验证码
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !code) {
      toast.error('请填写完整信息');
      return;
    }

    // 模拟登录逻辑
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      phone,
      nickname: role === 'admin' ? '阿峰' : '用户',
      role,
      trialDays: isRegister ? 3 : 0,
      isPaid: false,
    }));

    toast.success(isRegister ? '注册成功，获得3天免费试用' : '登录成功');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧表单区 */}
      <div className="w-[40%] flex items-center justify-center bg-white">
        <div className="w-[320px]">
          <div className="text-center mb-10">
            <h1 className="text-[18px] font-semibold text-[#1D2129] mb-4">
              阿峰｜跨境AI中台
            </h1>
            <p className="text-[14px] text-[#4E5969]">
              TK东南亚 · AI智能体 · 自动化营销
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C9CDD4]" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 h-9"
                />
                <Button
                  type="button"
                  variant="default"
                  size="default"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="w-[110px] h-9 bg-[#1677FF] hover:bg-[#0F62FE]"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>角色选择</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as 'user' | 'admin')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="font-normal">普通用户（卖家）</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="font-normal">管理员（阿峰）</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full h-9 bg-[#1677FF] hover:bg-[#0F62FE] mt-4"
            >
              {isRegister ? '注册' : '登录'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[14px] text-[#1677FF] hover:underline"
              >
                {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-[#E8E8E8] text-center">
            <a href="#" className="text-[13px] text-[#4E5969] hover:text-[#1677FF]">
              返回前台产品
            </a>
            <span className="text-[13px] text-[#4E5969] mx-2">|</span>
            <a href="#" className="text-[13px] text-[#4E5969] hover:text-[#1677FF]">
              联系阿峰
            </a>
          </div>
        </div>
      </div>

      {/* 右侧品牌区 */}
      <div className="w-[60%] bg-gradient-to-br from-[#E6F7FF] to-[#BAE7FF] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-[24px] font-semibold text-[#1677FF] mb-6">
            阿峰｜跨境AI智能体
          </h2>
          <p className="text-[16px] text-[#4E5969] mb-4">
            一次开发，无限复用，让跨境AI能力触手可及
          </p>
          <p className="text-[14px] text-[#717C89]">
            专注TK东南亚跨境，用AI帮卖家少雇人、多赚钱
          </p>
        </div>
      </div>
    </div>
  );
}
