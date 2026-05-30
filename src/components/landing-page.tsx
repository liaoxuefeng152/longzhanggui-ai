"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Image,
  Video,
  FileText,
  Target,
  Headphones,
  BarChart3,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Zap,
  Bot,
  Globe,
  Shield,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/* ─── 动画 Hook ─── */
function useInView(threshold = 0.15) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return { ref: setRef, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── 7大AI智能体数据 ─── */
const AGENTS = [
  { icon: Search,     name: "选品智能体",   bg: "bg-blue-100",  text: "text-blue-600",  gradient: "from-blue-600 to-blue-700",   desc: "AI分析市场趋势、竞品数据，精准挖掘蓝海爆款" },
  { icon: Image,      name: "图片设计",     bg: "bg-purple-100",text: "text-purple-600", gradient: "from-purple-600 to-purple-700", desc: "智能主图生成、图片翻译、白底图、AI美化" },
  { icon: Video,      name: "视频生成",     bg: "bg-pink-100",  text: "text-pink-600",  gradient: "from-pink-600 to-pink-700",   desc: "一键生成产品视频、主图视频、社交媒体素材" },
  { icon: FileText,   name: "Listing优化",  bg: "bg-green-100", text: "text-green-600", gradient: "from-green-600 to-green-700", desc: "标题优化、五点描述、多语言关键词挖掘" },
  { icon: Target,     name: "广告投放",     bg: "bg-orange-100",text: "text-orange-600", gradient: "from-orange-600 to-orange-700", desc: "智能创建广告、预算优化、ROI监控" },
  { icon: Headphones, name: "客服智能体",   bg: "bg-cyan-100",  text: "text-cyan-600",  gradient: "from-cyan-600 to-cyan-700",   desc: "多语言客服回复、纠纷处理、差评预警" },
  { icon: BarChart3,  name: "数据复盘",     bg: "bg-indigo-100",text: "text-indigo-600", gradient: "from-indigo-600 to-indigo-700", desc: "运营日报/周报、问题诊断、行动项生成" },
];

/* ─── ERP功能数据 ─── */
const ERP_FEATURES = [
  { icon: Package,     name: "商品管理", desc: "1688商品采集、多店铺商品库", bg: "bg-blue-100", text: "text-blue-600" },
  { icon: Warehouse,   name: "库存管理", desc: "多仓库存、智能补货预警", bg: "bg-amber-100", text: "text-amber-600" },
  { icon: ShoppingCart,name: "采购管理", desc: "1688直采、供应商管理", bg: "bg-green-100", text: "text-green-600" },
  { icon: FileText,    name: "订单中心", desc: "多平台订单同步、异常处理", bg: "bg-purple-100", text: "text-purple-600" },
  { icon: Truck,       name: "物流跟踪", desc: "全链路物流追踪、异常告警", bg: "bg-cyan-100", text: "text-cyan-600" },
  { icon: DollarSign,  name: "财务管理", desc: "利润核算、成本拆分、财务报表", bg: "bg-orange-100", text: "text-orange-600" },
];

/* ─── 数据流转步骤 ─── */
const FLOW_STEPS = [
  "选品采集", "商品入库", "图片处理", "Listing优化", "智能定价",
  "上架发布", "广告推广", "订单管理", "物流配送", "数据复盘",
];

const FLOW_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
  "bg-cyan-100 text-cyan-600",
  "bg-orange-100 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-cyan-100 text-cyan-600",
  "bg-indigo-100 text-indigo-600",
];

/* ─── 主组件 ─── */
export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── 导航栏 ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">龙</div>
            <span className="text-lg font-bold text-foreground">龙掌柜</span>
            <span className="text-xs text-muted-foreground hidden sm:inline ml-1">智能运营系统</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">核心能力</a>
            <a href="#agents" className="hover:text-foreground transition">AI智能体</a>
            <a href="#erp" className="hover:text-foreground transition">ERP系统</a>
            <a href="#flow" className="hover:text-foreground transition">全链路</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white transition-all shadow-lg shadow-orange-500/20"
            >
              登录系统
            </button>
            <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>核心能力</a>
            <a href="#agents" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>AI智能体</a>
            <a href="#erp" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>ERP系统</a>
            <a href="#flow" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>全链路</a>
            <button onClick={() => router.push("/login")} className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white">登录系统</button>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* 背景光晕 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-orange-500/5 via-amber-500/3 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-sm mb-8">
              <Zap size={14} /> AI驱动的跨境电商运营平台
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">龙掌柜</span>
              <br />
              <span className="text-foreground/90">跨境电商智能运营系统</span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              7大AI智能体 + 自研轻量ERP，从选品到售后的全链路AI驱动闭环。<br className="hidden sm:block" />
              让AI辅助人工，最终决策权始终在掌柜手中。
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/login")}
                className="group px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold text-lg transition-all shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
              >
                开始使用 <ArrowRight className="inline w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#agents"
                className="px-8 py-3.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 font-medium text-lg transition-all"
              >
                了解更多
              </a>
            </div>
          </FadeIn>
          {/* 数据亮点 */}
          <FadeIn delay={500}>
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                ["7", "AI智能体", "from-orange-600 to-amber-600"],
                ["10+", "业务模块", "from-blue-600 to-cyan-600"],
                ["24h", "AI值守", "from-green-600 to-emerald-600"],
              ].map(([num, label, grad], i) => (
                <div key={i} className="text-center">
                  <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{num}</div>
                  <div className="text-sm text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 核心价值 ─── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">为什么选择龙掌柜</h2>
              <p className="text-muted-foreground text-lg">不是无人值守，而是AI辅助人工的智能运营助手</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "7大AI智能体",
                desc: "选品、图片、视频、Listing、广告、客服、数据复盘——每个环节都有专属AI助手，7×24小时在线",
                gradient: "from-orange-500/20 to-amber-500/5",
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600",
              },
              {
                icon: Globe,
                title: "全链路闭环",
                desc: "从1688选品采集到海外平台上架销售，从广告投放到售后复盘，数据无缝流转，告别碎片化操作",
                gradient: "from-cyan-500/20 to-blue-500/5",
                iconBg: "bg-cyan-100",
                iconColor: "text-cyan-600",
              },
              {
                icon: Shield,
                title: "掌柜决策权",
                desc: "AI提供建议，掌柜拍板决策。高风险操作必须人工确认，让AI做苦力，让老板做决策",
                gradient: "from-green-500/20 to-emerald-500/5",
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <Card className="bg-white border-border shadow-sm hover:shadow-md transition-all h-full">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-5`}>
                      <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7大AI智能体 ─── */}
      <section id="agents" className="py-24 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-sm mb-6">
                <Bot size={14} /> AI 智能体矩阵
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">7大AI智能体，覆盖运营全场景</h2>
              <p className="text-muted-foreground text-lg">每个运营环节都有专属AI助手，7×24小时在线服务</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {AGENTS.map((agent, i) => (
              <FadeIn key={i} delay={i * 80}>
                <Card className="bg-white border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-lg ${agent.bg} flex items-center justify-center`}>
                        <agent.icon className={`w-5 h-5 ${agent.text}`} />
                      </div>
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{agent.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ERP系统 ─── */}
      <section id="erp" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">自研轻量ERP，打通业务数据</h2>
              <p className="text-muted-foreground text-lg">商品、库存、采购、订单、物流、财务，一站式管理</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ERP_FEATURES.map((feat, i) => (
              <FadeIn key={i} delay={i * 60}>
                <Card className="bg-white border-border shadow-sm hover:shadow-md transition-all text-center h-full">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-lg ${feat.bg} flex items-center justify-center mx-auto mb-3`}>
                      <feat.icon className={`w-5 h-5 ${feat.text}`} />
                    </div>
                    <h4 className="text-sm font-semibold mb-1">{feat.name}</h4>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
          {/* 1688采集亮点 */}
          <FadeIn delay={200}>
            <Card className="mt-12 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">1688开放平台深度对接</h3>
                    <p className="text-sm text-muted-foreground">API直连1688，一键采集商品详情、图片、SKU、供应商信息。支持批量采集、智能定价、一键上架，告别手动搬运。</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ─── 全链路数据流 ─── */}
      <section id="flow" className="py-24 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">全链路AI驱动闭环</h2>
              <p className="text-muted-foreground text-lg">从选品到售后，数据无缝流转，AI贯穿每个环节</p>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="relative">
              {/* 流转路径 */}
              <div className="hidden lg:block absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-orange-300 to-indigo-300" />
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4 relative">
                {FLOW_STEPS.map((step, i) => (
                  <FadeIn key={i} delay={i * 60}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full ${FLOW_COLORS[i]} flex items-center justify-center text-sm font-bold relative z-10 shadow-sm`}>
                        {i + 1}
                      </div>
                      <span className="text-xs text-muted-foreground text-center">{step}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
          {/* 飞书机器人亮点 */}
          <FadeIn delay={300}>
            <div className="mt-16 grid sm:grid-cols-2 gap-6">
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">飞书机器人</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    老板在飞书里说一句&quot;今天运营怎么样？&quot;，AI助手自动推送运营日报、TOP商品、库存预警。支持定时日报、异常告警、自然语言指令。
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold">安全可控</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    高风险操作（财务、库存调整等）必须人工确认。AI只提供建议，决策权始终在掌柜手中。多角色权限分离，运营/管理视图独立。
                  </p>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <Card className="bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-200 shadow-lg overflow-hidden">
              <CardContent className="p-12 sm:p-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">开启AI智能运营之旅</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  从选品到售后，让AI帮你做苦力，让掌柜做决策
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="group px-10 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold text-lg transition-all shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
                >
                  立即登录 <ArrowRight className="inline w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs">龙</div>
              <span className="font-semibold">龙掌柜智能运营系统</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI驱动的跨境电商全链路智能运营平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
