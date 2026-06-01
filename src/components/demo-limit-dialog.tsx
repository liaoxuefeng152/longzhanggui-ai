'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Sparkles, MessageSquare, Database, Headphones } from 'lucide-react';
import { DEMO_LIMIT_EVENT } from '@/lib/demo';

export function DemoLimitDialog() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setAction(detail?.action || '此操作');
      setOpen(true);
    };

    window.addEventListener(DEMO_LIMIT_EVENT, handler);
    return () => window.removeEventListener(DEMO_LIMIT_EVENT, handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg">
            演示模式下暂不支持{action}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            这是演示环境，数据为模拟展示。如需完整操作权限，请联系我们获取正式账号。
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground">正式账号可享受：</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">7大AI智能体无限次使用</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">跨境AI助手无限对话</span>
            </div>
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">完整ERP系统操作权限</span>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">专属客服1对1支持</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => {
              window.open('/contact', '_blank');
              setOpen(false);
            }}
          >
            联系我们获取完整权限
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            继续浏览
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
