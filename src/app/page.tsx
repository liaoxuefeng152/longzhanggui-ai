'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/landing-page';

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (user && token) {
        setIsLoggedIn(true);
      }
    } catch {
      // localStorage不可用时视为未登录
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [checked, isLoggedIn, router]);

  // 已登录 → 显示跳转中提示
  if (checked && isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/50">正在跳转工作台...</p>
        </div>
      </div>
    );
  }

  // 未登录或检测中 → 直接渲染落地页（避免白屏闪烁）
  return <LandingPage />;
}
