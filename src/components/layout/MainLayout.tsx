'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingCart, FileText, TrendingUp, Settings, Shield, LogOut, User, Store, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/platforms', label: '平台授权', icon: Shield },
    { path: '/select', label: '智能选品', icon: Search },
    { path: '/publish', label: '快速上新', icon: ShoppingCart },
    { path: '/drafts', label: '草稿箱', icon: FileText },
    { path: '/ads', label: '广告优化', icon: TrendingUp },
    { path: '/feishu', label: '飞书配置', icon: MessageSquare },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-full bg-[#0B101A] tech-grid-bg">
      {/* 左侧固定导航栏 */}
      <aside className="w-64 h-full flex flex-col border-r border-[#1E293B] bg-gradient-to-b from-[#0B101A] to-[#0F1628]">
        {/* Logo区 */}
        <div className="p-6 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00EEFF] to-[#7B61FF] flex items-center justify-center animate-neon-pulse">
              <span className="text-[#0B101A] font-bold text-xl">龙</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">龙掌柜</h1>
              <p className="text-[#00EEFF] text-xs">AI 跨境运营中枢</p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => router.push(item.path)}
                className={`w-full justify-start gap-3 px-4 py-6 h-auto text-left transition-all ${
                  isActive 
                    ? 'bg-[rgba(0,238,255,0.15)] text-[#00EEFF] border border-[rgba(0,238,255,0.3)]' 
                    : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00EEFF] animate-neon-pulse" />
                )}
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部信息栏 */}
        <header className="h-16 border-b border-[#1E293B] bg-[#0B101A]/80 backdrop-blur flex items-center justify-between px-6">
          {/* 左侧：当前绑定店铺 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-[#00EEFF]" />
              <span className="text-[#94A3B8] text-sm">当前绑定：</span>
              <span className="text-white font-medium">Shopee 深圳店</span>
              <span className="status-indicator status-online" />
            </div>
          </div>

          {/* 右侧：用户信息 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="status-indicator status-online" />
              <span className="text-[#94A3B8] text-sm">在线</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-[rgba(255,255,255,0.05)]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00EEFF] to-[#7B61FF] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0B101A]" />
                  </div>
                  <span className="text-white text-sm">龙掌柜</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[rgba(15,22,36,0.95)] border-[#1E293B]">
                <div className="px-3 py-2">
                  <p className="text-white font-medium">龙掌柜</p>
                  <p className="text-[#64748B] text-xs">admin@longzhanggui.com</p>
                </div>
                <DropdownMenuSeparator className="bg-[#1E293B]" />
                <DropdownMenuItem 
                  onClick={() => router.push('/settings')}
                  className="text-[#94A3B8] hover:text-white hover:bg-[rgba(0,238,255,0.1)] cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1E293B]" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-[#FF4081] hover:text-[#FF4081] hover:bg-[rgba(255,64,129,0.1)] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
