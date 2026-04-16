'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Search, ShoppingCart, FileText, TrendingUp, 
  Settings, MessageSquare, User, LogOut, ChevronLeft, ChevronRight,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/authorize', label: '平台授权', icon: Shield },
    { path: '/select', label: '选品中心', icon: Search },
    { path: '/publish', label: '上新中心', icon: ShoppingCart },
    { path: '/drafts', label: '草稿箱', icon: FileText },
    { path: '/ads', label: '广告优化', icon: TrendingUp },
    { path: '/feishu', label: '飞书配置', icon: MessageSquare },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* 顶部导航栏 */}
      <header className="h-14 bg-white border-b border-[#E5E6EB] flex items-center justify-between px-6 sticky top-0 z-50">
        {/* 左侧：Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#165DFF] to-[#4080FF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">龙</span>
            </div>
            <span className="text-[#1D2129] font-bold text-lg">龙掌柜</span>
          </div>
        </div>

        {/* 右侧：用户操作 */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/feishu')}
            className="text-[#4E5969] hover:text-[#1D2129] hover:bg-[#F2F3F5]"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            飞书绑定
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#4E5969] hover:text-[#1D2129] hover:bg-[#F2F3F5]"
              >
                <User className="w-4 h-4 mr-2" />
                个人中心
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-[#E5E6EB]">
              <div className="px-4 py-3 border-b border-[#E5E6EB]">
                <p className="text-[#1D2129] font-medium">龙掌柜</p>
                <p className="text-[#86909C] text-sm">admin@longzhanggui.com</p>
              </div>
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="text-[#4E5969] hover:text-[#1D2129] hover:bg-[#F2F3F5] cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                设置
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#E5E6EB]" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-[#F53F3F] hover:text-[#F53F3F] hover:bg-[#FFECE8] cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 主体内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <aside 
          className={`bg-white border-r border-[#E5E6EB] transition-all duration-300 flex flex-col ${
            sidebarCollapsed ? 'w-16' : 'w-56'
          }`}
        >
          <div className="p-3 border-b border-[#E5E6EB]">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-center text-[#86909C] hover:bg-[#F2F3F5]"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => router.push(item.path)}
                  className={`w-full justify-start gap-3 px-3 py-2.5 h-auto transition-all ${
                    isActive 
                      ? 'bg-[#E8F3FF] text-[#165DFF]' 
                      : 'text-[#4E5969] hover:text-[#1D2129] hover:bg-[#F2F3F5]'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* 右侧内容区 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
