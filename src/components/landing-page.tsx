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
  MessageCircle,
  Sparkles,
  Command,
  Send,
} from "lucide-react";

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
  { icon: Search,     name: "选品智能体",   color: "from-blue-500 to-blue-600",    bg: "bg-blue-500/10",  text: "text-blue-400",   desc: "AI分析市场趋势、竞品数据，精准挖掘蓝海爆款" },
  { icon: Image,      name: "图片设计",     color: "from-purple-500 to-purple-600",bg: "bg-purple-500/10",text: "text-purple-400", desc: "智能主图生成、图片翻译、白底图、AI美化" },
  { icon: Video,      name: "视频生成",     color: "from-pink-500 to-pink-600",    bg: "bg-pink-500/10",  text: "text-pink-400",   desc: "一键生成产品视频、主图视频、社交媒体素材" },
  { icon: FileText,   name: "Listing优化",  color: "from-green-500 to-green-600",  bg: "bg-green-500/10", text: "text-green-400",  desc: "标题优化、五点描述、多语言关键词挖掘" },
  { icon: Target,     name: "广告投放",     color: "from-orange-500 to-orange-600",bg: "bg-orange-500/10",text: "text-orange-400", desc: "智能创建广告、预算优化、ROI监控" },
  { icon: Headphones, name: "客服智能体",   color: "from-cyan-500 to-cyan-600",    bg: "bg-cyan-500/10",  text: "text-cyan-400",   desc: "多语言客服回复、纠纷处理、差评预警" },
  { icon: BarChart3,  name: "数据复盘",     color: "from-indigo-500 to-indigo-600",bg: "bg-indigo-500/10",text: "text-indigo-400", desc: "运营日报/周报、问题诊断、行动项生成" },
];

/* ─── ERP功能数据 ─── */
const ERP_FEATURES = [
  { icon: Package,     name: "商品管理", desc: "1688商品采集、多店铺商品库" },
  { icon: Warehouse,   name: "库存管理", desc: "多仓库存、智能补货预警" },
  { icon: ShoppingCart,name: "采购管理", desc: "1688直采、供应商管理" },
  { icon: FileText,    name: "订单中心", desc: "多平台订单同步、异常处理" },
  { icon: Truck,       name: "物流跟踪", desc: "全链路物流追踪、异常告警" },
  { icon: DollarSign,  name: "财务管理", desc: "利润核算、成本拆分、财务报表" },
];

/* ─── 数据流转步骤 ─── */
const FLOW_STEPS = [
  "选品采集", "商品入库", "图片处理", "Listing优化", "智能定价",
  "上架发布", "广告推广", "订单管理", "物流配送", "数据复盘",
];

/* ─── 主组件 ─── */
export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ─── 导航栏 ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">龙</div>
            <span className="text-lg font-bold">龙掌柜</span>
            <span className="text-xs text-muted-foreground hidden sm:inline ml-1">智能运营系统</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-white transition">核心能力</a>
            <a href="#agents" className="hover:text-white transition">AI智能体</a>
            <a href="#assistant" className="hover:text-white transition">AI助手</a>
            <a href="#erp" className="hover:text-white transition">ERP系统</a>
            <a href="#flow" className="hover:text-white transition">全链路</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 transition-all shadow-lg shadow-orange-500/20"
            >
              登录系统
            </button>
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-muted-foreground hover:text-white" onClick={() => setMobileMenuOpen(false)}>核心能力</a>
            <a href="#agents" className="block text-sm text-muted-foreground hover:text-white" onClick={() => setMobileMenuOpen(false)}>AI智能体</a>
            <a href="#assistant" className="block text-sm text-muted-foreground hover:text-white" onClick={() => setMobileMenuOpen(false)}>AI助手</a>
            <a href="#erp" className="block text-sm text-muted-foreground hover:text-white" onClick={() => setMobileMenuOpen(false)}>ERP系统</a>
            <a href="#flow" className="block text-sm text-muted-foreground hover:text-white" onClick={() => setMobileMenuOpen(false)}>全链路</a>
            <button onClick={() => router.push("/login")} className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-amber-600">登录系统</button>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* 背景光晕 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-8">
              <Zap size={14} /> AI驱动的跨境电商运营平台
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">龙掌柜</span>
              <br />
              <span className="text-white/90">跨境电商智能运营系统</span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
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
                className="px-8 py-3.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-medium text-lg transition-all"
              >
                了解更多
              </a>
            </div>
          </FadeIn>
          {/* 数据亮点 */}
          <FadeIn delay={500}>
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                ["7", "AI智能体"],
                ["10+", "业务模块"],
                ["24h", "AI值守"],
              ].map(([num, label], i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{num}</div>
                  <div className="text-sm text-white/40 mt-1">{label}</div>
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
              <p className="text-white/40 text-lg">不是无人值守，而是AI辅助人工的智能运营助手</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "7大AI智能体",
                desc: "选品、图片、视频、Listing、广告、客服、数据复盘——每个环节都有专属AI助手，7×24小时在线",
                gradient: "from-orange-500/20 to-amber-500/5",
                iconColor: "text-orange-400",
              },
              {
                icon: Globe,
                title: "全链路闭环",
                desc: "从1688选品采集到海外平台上架销售，从广告投放到售后复盘，数据无缝流转，告别碎片化操作",
                gradient: "from-cyan-500/20 to-blue-500/5",
                iconColor: "text-cyan-400",
              },
              {
                icon: Shield,
                title: "掌柜决策权",
                desc: "AI提供建议，掌柜拍板决策。高风险操作必须人工确认，让AI做苦力，让老板做决策",
                gradient: "from-green-500/20 to-emerald-500/5",
                iconColor: "text-green-400",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7大AI智能体 ─── */}
      <section id="agents" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.02] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
                <Bot size={14} /> AI 智能体矩阵
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">7大AI智能体，覆盖运营全场景</h2>
              <p className="text-white/40 text-lg">每个运营环节都有专属AI助手，7×24小时在线服务</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {AGENTS.map((agent, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-lg ${agent.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <agent.icon className={`w-5 h-5 ${agent.text}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{agent.name}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{agent.desc}</p>
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 跨境AI助手 ─── */}
      <section id="assistant" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
                <Sparkles size={14} /> 跨境AI助手
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">你的AI运营搭子，随叫随到</h2>
              <p className="text-white/40 text-lg">一句话说清需求，AI自动识别意图、跳转功能、给出建议</p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* 左侧：对话模拟 */}
            <FadeIn delay={100}>
              <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 overflow-hidden">
                {/* 模拟对话窗口 */}
                <div className="space-y-4">
                  {/* 用户消息 */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-orange-500/20 text-orange-300 text-sm">
                      帮我选几款宠物用品爆款
                    </div>
                  </div>
                  {/* AI回复 */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Bot size={12} className="text-white" />
                        </div>
                        <span className="text-xs text-white/50">跨境AI助手</span>
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/[0.05] text-sm text-white/70 leading-relaxed">
                        好的，我来为您分析宠物用品市场趋势。当前热门方向有：
                        <br /><br />
                        <span className="text-blue-400">1. 宠物智能喂食器</span> — 增长率 128%，东南亚需求旺盛
                        <br />
                        <span className="text-blue-400">2. 猫爬架/猫树</span> — 稳定品类，利润率 45%+
                        <br />
                        <span className="text-blue-400">3. 宠物车载安全带</span> — 蓝海品类，竞争度低
                      </div>
                      {/* 快捷操作按钮 */}
                      <div className="flex flex-wrap gap-2 ml-0">
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-default">
                          查看选品详情
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20 cursor-default">
                          利润测算
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-default">
                          竞品分析
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 第二轮对话 */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-orange-500/20 text-orange-300 text-sm">
                      生成今日运营日报
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Bot size={12} className="text-white" />
                        </div>
                        <span className="text-xs text-white/50">跨境AI助手</span>
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/[0.05] text-sm text-white/70 leading-relaxed">
                        今日运营日报已生成：
                        <br /><br />
                        <span className="text-green-400">GMV ¥32,580</span> ↑12.5%&ensp;|&ensp;订单 <span className="text-green-400">186</span> ↑8.3%
                        <br />
                        <span className="text-orange-400">库存预警</span>：3款商品库存不足&ensp;|&ensp;<span className="text-red-400">1条差评</span>需处理
                      </div>
                    </div>
                  </div>
                </div>
                {/* 输入框模拟 */}
                <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <MessageCircle size={16} className="text-white/20" />
                  <span className="text-sm text-white/20 flex-1">输入你想了解的运营问题...</span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                    <Send size={14} className="text-white" />
                  </div>
                </div>
                {/* 装饰光晕 */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </FadeIn>

            {/* 右侧：能力介绍 */}
            <div className="space-y-5">
              {[
                {
                  icon: Command,
                  title: "自然语言指令",
                  desc: "不需要记菜单路径，用日常语言描述需求，AI自动识别意图并执行。支持选品、定价、Listing、客服、数据等9大意图类型。",
                  gradient: "from-violet-500/20 to-purple-500/5",
                  iconColor: "text-violet-400",
                },
                {
                  icon: Zap,
                  title: "快捷操作跳转",
                  desc: "AI回复自带快捷操作按钮，一键跳转到选品智能体、Listing优化、库存管理等对应功能页面，无缝衔接。",
                  gradient: "from-orange-500/20 to-amber-500/5",
                  iconColor: "text-orange-400",
                },
                {
                  icon: Sparkles,
                  title: "流式打字机输出",
                  desc: "AI回复实时流式输出，打字机效果逐字呈现，不用等待完整生成，第一时间看到分析结果。",
                  gradient: "from-cyan-500/20 to-blue-500/5",
                  iconColor: "text-cyan-400",
                },
                {
                  icon: TrendingUp,
                  title: "运营数据随时问",
                  desc: "\"今天卖了多少？\"\"库存够不够？\"\"哪个广告ROI最高？\"——运营数据随问随答，日报/周报/预警一目了然。",
                  gradient: "from-green-500/20 to-emerald-500/5",
                  iconColor: "text-green-400",
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={200 + i * 80}>
                  <div className="group flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* 快捷指令示例 */}
          <FadeIn delay={400}>
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/10">
              <h3 className="text-lg font-semibold mb-4 text-center">常用指令，开口即达</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { cmd: "帮我选品分析", tag: "选品", tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                  { cmd: "翻译图片", tag: "图片", tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                  { cmd: "优化这个Listing", tag: "Listing", tagColor: "bg-green-500/10 text-green-400 border-green-500/20" },
                  { cmd: "生成今日日报", tag: "数据", tagColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
                  { cmd: "查看库存预警", tag: "库存", tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
                  { cmd: "帮我回复这个客户", tag: "客服", tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                  { cmd: "广告ROI怎么样", tag: "广告", tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
                  { cmd: "这个品能卖多少钱", tag: "定价", tagColor: "bg-red-500/10 text-red-400 border-red-500/20" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${item.tagColor} shrink-0`}>{item.tag}</span>
                    <span className="text-xs text-white/50 truncate">{item.cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── ERP系统 ─── */}
      <section id="erp" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">自研轻量ERP，打通业务数据</h2>
              <p className="text-white/40 text-lg">商品、库存、采购、订单、物流、财务，一站式管理</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ERP_FEATURES.map((feat, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-center hover:bg-white/[0.04]">
                  <feat.icon className="w-6 h-6 mx-auto mb-3 text-orange-400 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-semibold mb-1">{feat.name}</h4>
                  <p className="text-xs text-white/30">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          {/* 1688采集亮点 */}
          <FadeIn delay={200}>
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">1688开放平台深度对接</h3>
                  <p className="text-sm text-white/40">API直连1688，一键采集商品详情、图片、SKU、供应商信息。支持批量采集、智能定价、一键上架，告别手动搬运。</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 shrink-0" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 全链路数据流 ─── */}
      <section id="flow" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">全链路AI驱动闭环</h2>
              <p className="text-white/40 text-lg">从选品到售后，数据无缝流转，AI贯穿每个环节</p>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="relative">
              {/* 流转路径 */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-orange-500/30 to-indigo-500/30 -translate-y-1/2" />
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4 relative">
                {FLOW_STEPS.map((step, i) => {
                  const colors = ["text-blue-400","text-purple-400","text-pink-400","text-green-400","text-orange-400","text-cyan-400","text-yellow-400","text-red-400","text-teal-400","text-indigo-400"];
                  return (
                    <FadeIn key={i} delay={i * 60}>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm font-bold relative z-10">
                          <span className={colors[i]}>{i + 1}</span>
                        </div>
                        <span className="text-xs text-white/50 text-center">{step}</span>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </FadeIn>
          {/* 飞书机器人亮点 */}
          <FadeIn delay={300}>
            <div className="mt-16 grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold">飞书机器人</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  老板在飞书里说一句"今天运营怎么样？"，AI助手自动推送运营日报、TOP商品、库存预警。支持定时日报、异常告警、自然语言指令。
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold">安全可控</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  高风险操作（财务、库存调整等）必须人工确认。AI只提供建议，决策权始终在掌柜手中。多角色权限分离，运营/管理视图独立。
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-orange-500/10 via-[#0a0a0f] to-amber-500/10 border border-orange-500/10 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-orange-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">开启AI智能运营之旅</h2>
                <p className="text-white/40 text-lg mb-8 max-w-xl mx-auto">
                  从选品到售后，让AI帮你做苦力，让掌柜做决策
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="group px-10 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold text-lg transition-all shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
                >
                  立即登录 <ArrowRight className="inline w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs">龙</div>
              <span className="font-semibold">龙掌柜智能运营系统</span>
            </div>
            <p className="text-sm text-white/25">
              AI驱动的跨境电商全链路智能运营平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
