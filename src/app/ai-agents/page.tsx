'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bot,
  Package,
  Image as ImageIcon,
  Video,
  FileText,
  Megaphone,
  Headphones,
  BarChart3,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

// 智能体配置
const AGENTS = [
  { id: 'product-selection', name: '选品智能体', icon: Package, color: 'blue', desc: '爆款挖掘、竞品分析', path: '/agents/product-selection' },
  { id: 'image-design', name: '图片智能体', icon: ImageIcon, color: 'purple', desc: '图片翻译、去水印、白底图', path: '/agents/image-design' },
  { id: 'listing-optimization', name: 'Listing优化', icon: FileText, color: 'green', desc: '标题、描述、关键词优化', path: '/agents/listing-optimization' },
  { id: 'advertising', name: '广告投放', icon: Megaphone, color: 'orange', desc: '预算分配、出价建议', path: '/agents/advertising' },
  { id: 'customer-service', name: 'AI客服', icon: Headphones, color: 'cyan', desc: '多语种回复、纠纷处理', path: '/agents/customer-service' },
  { id: 'data-review', name: '数据复盘', icon: BarChart3, color: 'indigo', desc: '销售分析、ROI计算', path: '/agents/data-review' },
  { id: 'video-generation', name: '视频生成', icon: Video, color: 'pink', desc: '脚本生成、AI配音', path: '/agents/video-generation' },
];

const colorMap: Record<string, { from: string; to: string; icon: string }> = {
  blue: { from: 'from-blue-500', to: 'to-blue-600', icon: 'text-white' },
  purple: { from: 'from-purple-500', to: 'to-purple-600', icon: 'text-white' },
  green: { from: 'from-green-500', to: 'to-green-600', icon: 'text-white' },
  orange: { from: 'from-orange-500', to: 'to-orange-600', icon: 'text-white' },
  cyan: { from: 'from-cyan-500', to: 'to-cyan-600', icon: 'text-white' },
  indigo: { from: 'from-indigo-500', to: 'to-indigo-600', icon: 'text-white' },
  pink: { from: 'from-pink-500', to: 'to-pink-600', icon: 'text-white' },
};

export default function AIAgentsCenterPage() {
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
        {/* 页面标题 */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">智能体中心</h1>
            <p className="text-sm text-muted-foreground">7大AI智能体，助您高效运营</p>
          </div>
          <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-500/20">
            <Zap className="h-3 w-3 mr-1" />
            7个在线
          </Badge>
        </div>

        {/* 智能体网格 - 一目了然 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const colors = colorMap[agent.color];
            return (
              <Link key={agent.id} href={agent.path}>
                <Card className={cn(
                  'bg-gradient-to-br from-card to-muted/50 border-border/50',
                  'hover:shadow-lg hover:border-primary/30 hover:-translate-y-1',
                  'transition-all duration-200 cursor-pointer group'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg bg-gradient-to-br',
                        colors.from,
                        colors.to,
                        'flex items-center justify-center shadow-sm'
                      )}>
                        <Icon className={cn('h-5 w-5', colors.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{agent.desc}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                      立即使用
                      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>所有智能体均内置合规校验，请放心使用</span>
        </div>
      </div>
    </MainLayout>
  );
}
