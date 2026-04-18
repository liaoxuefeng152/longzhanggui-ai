'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Database,
  Key,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';

export default function PlatformPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold">平台配置</h1>
              <p className="text-[14px] text-muted-foreground">
                统一管理数据源、店铺授权和平台API凭证
              </p>
            </div>
          </div>
        </div>

        {/* 配置模块卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 数据源配置 */}
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/platform/datasources')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  已配置
                </Badge>
              </div>
              <CardTitle className="text-[16px] mt-4">数据源配置</CardTitle>
              <CardDescription>
                配置选品数据来源，支持蝉妈妈、Jungle Scout等第三方API对接
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">已启用数据源</span>
                  <span className="font-medium">1个</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">选品策略</span>
                  <span className="font-medium">已配置</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                管理数据源
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* 平台凭证 */}
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push('/shops/platforms')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Key className="h-6 w-6 text-orange-600" />
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  待配置
                </Badge>
              </div>
              <CardTitle className="text-[16px] mt-4">平台凭证</CardTitle>
              <CardDescription>
                统一配置各平台API密钥，支持TK、亚马逊等平台对接
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">已配置平台</span>
                  <span className="font-medium">0个</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">凭证状态</span>
                  <span className="font-medium text-muted-foreground">未配置</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                管理凭证
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 快速链接 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-[15px]">快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/platform/datasources')}>
                <Database className="h-4 w-4 mr-2" />
                配置数据源
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/shops/platforms')}>
                <Key className="h-4 w-4 mr-2" />
                配置API凭证
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
