'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/landing-page';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      setIsLoggedIn(true);
      router.push('/dashboard');
    } else {
      setIsLoggedIn(false);
    }
  }, [router]);

  // 已登录用户重定向中
  if (isLoggedIn === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">跳转中...</p>
        </div>
      </div>
    );
  }

  // 未登录用户显示落地页
  if (isLoggedIn === false) {
    return <LandingPage />;
  }

  // 首次加载，检测中
  return null;
}
