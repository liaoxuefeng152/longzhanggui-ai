'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录（同时检查 user 和 token）
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-[#1677FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[14px] text-[#717C89]">加载中...</p>
      </div>
    </div>
  );
}
