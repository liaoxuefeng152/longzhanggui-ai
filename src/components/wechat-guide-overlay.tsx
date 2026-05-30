'use client';

import { X, QrCode, MessageCircle, TrendingUp, Shield, Sparkles } from 'lucide-react';

interface WechatGuideOverlayProps {
  onClose: () => void;
}

export function WechatGuideOverlay({ onClose }: WechatGuideOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="w-full rounded-t-2xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">解锁更多AI能力</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-5">
          免费体验次数已用完，添加专属客服获取完整权限
        </p>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative flex h-44 w-44 items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
            {/* Placeholder QR code - replace with real QR image */}
            <div className="flex flex-col items-center gap-2">
              <QrCode className="h-16 w-16 text-primary/60" />
              <span className="text-xs text-muted-foreground">客服微信二维码</span>
            </div>
            {/* Uncomment below when real QR image is available:
            <Image
              src="/wechat-qr.png"
              alt="客服微信二维码"
              fill
              className="object-contain p-2"
            /> */}
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">扫码添加客服微信</p>
          <p className="text-xs text-muted-foreground">工作时间 9:00-22:00 即时响应</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">无限次对话</p>
              <p className="text-[11px] text-muted-foreground">不限次数随时提问</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <div>
              <p className="text-xs font-medium text-foreground">行业数据</p>
              <p className="text-[11px] text-muted-foreground">独家选品数据源</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <div>
              <p className="text-xs font-medium text-foreground">定制方案</p>
              <p className="text-[11px] text-muted-foreground">1对1运营指导</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
            <div>
              <p className="text-xs font-medium text-foreground">优先支持</p>
              <p className="text-[11px] text-muted-foreground">专属客户经理</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          我已扫码，稍后联系
        </button>
      </div>
    </div>
  );
}
