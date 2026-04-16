'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { canAccessRoute, User } from '@/lib/auth/permissions';
import { Loader2 } from 'lucide-react';

// 模拟用户数据 - 实际项目中应从 Context 或 API 获取
const MOCK_USERS: Record<string, User> = {
  admin: {
    id: '1',
    username: 'admin',
    role: 'admin',
    email: 'admin@longzhang.com'
  },
  user: {
    id: '2',
    username: 'user',
    role: 'user',
    email: 'user@example.com'
  }
};

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    // 检查路由权限
    if (!canAccessRoute(currentUser, pathname)) {
      // 无权访问，重定向到首页
      if (currentUser?.role === 'admin') {
        router.push('/dashboard');
      } else if (currentUser?.role === 'user') {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, currentUser, pathname, router]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F3F5]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#165DFF]" />
          <p className="text-[#86909C]">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// 导出当前用户信息（供其他组件使用）
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (role: 'admin' | 'user') => {
    const user = MOCK_USERS[role];
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    login,
    logout
  };
}
