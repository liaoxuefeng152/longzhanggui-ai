'use client';

import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  user?: {
    nickname: string;
    avatar?: string;
    role: 'user' | 'admin';
  };
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="h-[60px] bg-white border-b border-[#E8E8E8] flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-[16px] font-semibold text-[#1D2129]">
          阿峰｜跨境AI中台
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-[#4E5969]" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-[#F5222D] rounded-full flex items-center justify-center text-[10px]">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10 px-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.nickname} />
                <AvatarFallback className="bg-[#1677FF] text-white">
                  {user?.nickname?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-[14px] font-medium text-[#1D2129]">
                {user?.nickname || '用户'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人中心</DropdownMenuItem>
            <DropdownMenuItem>系统设置</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-[#F5222D]">
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
