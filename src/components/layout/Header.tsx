'use client';

import { Bell, User, Moon, Sun } from 'lucide-react';
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
    <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🦞</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-foreground">
              龙掌柜
            </span>
            <span className="text-[11px] text-muted-foreground">
              v1.0 · 龙掌柜智能运营系统
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-[12px] text-muted-foreground">
          {new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-destructive rounded-full flex items-center justify-center text-[10px]">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.nickname} />
                <AvatarFallback className="bg-primary text-white text-sm">
                  {user?.nickname?.charAt(0) || '阿'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-medium text-foreground">
                  {user?.nickname || '老板'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  超级管理员
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人中心</DropdownMenuItem>
            <DropdownMenuItem>系统设置</DropdownMenuItem>
            <DropdownMenuItem>操作日志</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
