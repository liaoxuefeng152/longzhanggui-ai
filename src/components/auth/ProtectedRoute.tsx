'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// 不需要登录的页面
const PUBLIC_PATHS = ['/', '/landing', '/login', '/register', '/forgot-password', '/reset-password'];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // AuthContext 已处理路径保护，这里仅做兜底
    if (!isLoading && !isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 公开页面直接显示
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // 已登录显示内容
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 未登录返回空（等待跳转）
  return null;
}
