import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Shield,
  Sparkles,
  Link2,
  TrendingUp,
  Eye,
  Lock,
  Zap,
  Wallet,
  PieChart,
  Activity,
  ShieldAlert,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* ================================================================
   Landing Page
   ================================================================ */

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-10 -mt-6">
      <HeroSection />
      <ProductPreviewSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <PricingTeaser />
      <CTASection />
      <Footer />
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="pt-12 sm:pt-20 text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-full bg-white border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm mb-8">
        <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
        AI-powered portfolio intelligence
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
        Understand your
        <br />
        investments, clearly.
      </h1>

      <p className="mt-6 text-lg text-neutral-500 leading-relaxed max-w-xl mx-auto">
        Connect your brokerage accounts and get plain-English analysis of your
        portfolio health, risks, and opportunities — powered by AI.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          asChild
          className="h-12 rounded-xl bg-neutral-900 px-8 text-sm font-semibold text-white hover:bg-neutral-800 shadow-sm"
        >
          <Link href="/register">
            Get started free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-12 rounded-xl text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          <Link href="/login">
            Sign in to your account
          </Link>
        </Button>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────────────────── */

function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Portfolio analysis",
      description: "AI breaks down each position with risk scores, sector allocation, and diversification insights.",
    },
    {
      icon: Sparkles,
      title: "Personalized insights",
      description: "Tailored recommendations based on your goals, risk tolerance, and investment timeline.",
    },
    {
      icon: Bell,
      title: "Market signals",
      description: "Get notified about events that actually affect your specific holdings, not generic news.",
    },
    {
      icon: TrendingUp,
      title: "Performance tracking",
      description: "Track your portfolio value, daily changes, and long-term growth across all accounts.",
    },
    {
      icon: Eye,
      title: "Risk monitoring",
      description: "Automatic checks for concentration risk, sector imbalance, and volatility exposure.",
    },
    {
      icon: Zap,
      title: "Instant analysis",
      description: "Get a full AI analysis of any stock, ETF, or crypto in seconds — just search and go.",
    },
  ];

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Everything you need to invest with confidence
        </h2>
        <p className="mt-3 text-neutral-500 max-w-lg mx-auto">
          One dashboard for all your investment accounts, powered by AI that actually understands your portfolio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-2xl border border-neutral-200 p-6 transition-all hover:shadow-md hover:border-neutral-300"
          >
            <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-neutral-600" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">{f.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Connect your accounts",
      description: "Securely link your brokerage or bank via Plaid. We only get read-only access.",
      icon: Link2,
    },
    {
      number: "2",
      title: "AI analyzes everything",
      description: "Our AI scans your holdings for risk, diversification, sector allocation, and opportunities.",
      icon: Sparkles,
    },
    {
      number: "3",
      title: "Get clear insights",
      description: "Receive plain-English recommendations tailored to your goals and risk tolerance.",
      icon: BarChart3,
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-8 lg:p-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          How it works
        </h2>
        <p className="mt-3 text-neutral-500">
          Three steps to clarity.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 relative">
              <step.icon className="h-6 w-6 text-neutral-700" />
              <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                {step.number}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">{step.title}</h3>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Product preview ──────────────────────────────────────────── */

function ProductPreviewSection() {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          See your portfolio differently
        </h2>
        <p className="mt-3 text-neutral-500 max-w-lg mx-auto">
          A calm, focused dashboard that surfaces what matters — desktop or mobile.
        </p>
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* ── Desktop: macOS browser frame ── */}
        <div className="lg:pr-40">
          <div className="rounded-2xl overflow-hidden bg-[#e4e4e4] shadow-2xl shadow-neutral-400/25 ring-1 ring-black/5">
            {/* macOS title bar */}
            <div className="flex items-center px-4 py-2.5 bg-gradient-to-b from-[#ececec] to-[#dedede] border-b border-neutral-300/50">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/70 backdrop-blur rounded-lg px-4 py-1 text-[11px] text-neutral-500 border border-neutral-200/80 flex items-center gap-1.5">
                  <Lock className="h-2.5 w-2.5 text-neutral-400" />
                  wallstreetai.io/dashboard
                </div>
              </div>
              <div className="w-16" />
            </div>

            {/* Dashboard content with gradient fade */}
            <div className="relative max-h-[620px] overflow-hidden">
              <DesktopDashboardMock />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Mobile: iPhone frame ── */}
        <div className="hidden lg:block absolute right-0 top-8 z-10 w-[260px]">
          <div className="rounded-[2.5rem] bg-[#1a1a1a] p-[9px] shadow-2xl shadow-neutral-500/30 ring-1 ring-white/10">
            <div className="rounded-[2rem] overflow-hidden bg-white h-[520px] relative flex flex-col">
              {/* Status bar with dynamic island */}
              <div className="flex items-center justify-between bg-white pt-3 pb-1.5 px-5 shrink-0">
                <span className="text-[9px] font-semibold text-neutral-900 w-[60px]">9:41</span>
                <div className="w-[76px] h-[20px] bg-[#1a1a1a] rounded-full" />
                <div className="flex items-center justify-end gap-1 w-[60px]">
                  <div className="flex items-end gap-[2px]">
                    {[3, 5, 7, 9].map((h) => (
                      <div key={h} className="w-[2.5px] rounded-sm bg-neutral-900" style={{ height: h }} />
                    ))}
                  </div>
                  <span className="text-[8px] font-semibold text-neutral-900">5G</span>
                  <div className="flex items-center gap-[1px]">
                    <div className="w-[16px] h-[8px] rounded-[2px] border border-neutral-900 p-[1px]">
                      <div className="w-full h-full rounded-[1px] bg-neutral-900" />
                    </div>
                    <div className="w-[1px] h-[3px] rounded-r-full bg-neutral-900" />
                  </div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-hidden relative">
                <MobileDashboardMock />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>

              {/* Home indicator */}
              <div className="flex justify-center py-1.5 bg-white shrink-0">
                <div className="w-[90px] h-[4px] bg-neutral-300 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Desktop dashboard mock (inside browser frame) ── */

function DesktopDashboardMock() {
  return (
    <div className="bg-[#f6f7f8]">
      {/* App header bar */}
      <div className="bg-white border-b border-neutral-200/60 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-serif font-bold text-xs">W</div>
            <span className="text-sm font-bold text-neutral-900 hidden sm:block">WallStreetAI</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs">
            {["Dashboard", "Holdings", "Analytics", "Market"].map((t, i) => (
              <span key={t} className={`px-3 py-1.5 rounded-lg font-medium ${i === 0 ? "text-neutral-900" : "text-neutral-400"}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-36 bg-neutral-100 rounded-lg hidden sm:block" />
          <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">S</div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Portfolio value hero card */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Wallet className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Portfolio Value</p>
                    <p className="text-[10px] text-neutral-500">14 positions</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">$127,843.50</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                    <TrendingUp className="h-3 w-3" />
                    +12.4%
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <MockMiniStat label="Total Return" value="+$14,150" delta="+12.4%" positive />
                  <div className="h-7 w-px bg-neutral-200" />
                  <MockMiniStat label="Today" value="+$342.80" delta="+0.27%" positive />
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-2">
                <div className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200">
                  <Sparkles className="h-4 w-4" />
                  AI Portfolio Analysis
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Good</span>
                  <span className="text-[10px] text-neutral-500">Moderate Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick insights strip */}
          <div className="border-t border-neutral-100 bg-neutral-50/30">
            <div className="flex items-center gap-2 px-5 pt-3 pb-1.5 sm:px-6">
              <div className="p-1 bg-neutral-100 rounded-md">
                <Activity className="h-3 w-3 text-neutral-600" />
              </div>
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Quick Insights</span>
              <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">Live</span>
            </div>
            <div className="px-5 pb-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                <MockInsightPill icon={<PieChart className="h-3.5 w-3.5 text-indigo-500" />} label="Health" value="Good — well diversified" />
                <MockInsightPill icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />} label="Performance" value="Beating S&P 500 by 2.1%" />
                <MockInsightPill icon={<BarChart3 className="h-3.5 w-3.5 text-violet-500" />} label="Top Performer" value="NVDA +47.2% YTD" />
                <MockInsightPill icon={<ShieldAlert className="h-3.5 w-3.5 text-rose-500" />} label="Risk Alert" value="Tech sector at 38%" variant="risk" />
                <MockInsightPill icon={<Zap className="h-3.5 w-3.5 text-amber-500" />} label="Action" value="Rebalance into bonds" variant="action" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Result */}
        <div className="space-y-4 mt-4">
          {/* Health Overview Hero */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="bg-indigo-600 px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Portfolio Health</p>
                    <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">Moderate Risk</span>
                  </div>
                  <p className="text-white text-xl font-bold">Good</p>
                </div>
              </div>
              <div className="text-white text-right">
                <p className="text-white/70 text-[10px] uppercase tracking-wider mb-0.5">Total Return</p>
                <span className="text-2xl font-bold">+12.4%</span>
                <span className="text-sm opacity-80 font-medium ml-1.5">(+$14,150)</span>
              </div>
            </div>
            <div className="p-5 border-b border-neutral-100">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Your portfolio is well-diversified across 14 positions with solid returns beating the S&P 500 by 2.1%. Technology remains your strongest sector but is approaching concentration limits at 38%. Consider trimming NVDA gains and rotating into defensive sectors.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 bg-neutral-50/50">
              {[
                { label: "Market Value", value: "$127,844" },
                { label: "Positions", value: "14" },
                { label: "Day Change", value: "+$343", positive: true },
                { label: "Beta", value: "1.08" },
              ].map((s) => (
                <div key={s.label} className="p-3 flex flex-col items-center text-center">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">{s.label}</span>
                  <span className={`text-sm font-bold tabular-nums ${"positive" in s ? "text-emerald-600" : "text-neutral-900"}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
            <div className="space-y-4">
              {/* Risk Dashboard */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-neutral-900">Risk & Benchmark Dashboard</span>
                  <span className="text-[9px] text-neutral-400 font-medium uppercase tracking-wider ml-auto">Trailing 1Y</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 border-b border-neutral-100">
                  {[
                    { label: "Portfolio Beta", value: "1.08", sub: "Near market", color: "text-neutral-400" },
                    { label: "Volatility", value: "16.2%", sub: "Weighted annual", color: "text-neutral-400" },
                    { label: "HHI Conc.", value: "1,240", sub: "Diversified", color: "text-emerald-600" },
                    { label: "Avg Corr.", value: "0.52", sub: "Moderate", color: "text-amber-600" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 flex flex-col items-center text-center">
                      <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">{m.label}</span>
                      <span className="text-sm font-bold text-neutral-900 tabular-nums">{m.value}</span>
                      <span className={`text-[9px] mt-0.5 ${m.color}`}>{m.sub}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-indigo-50/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity className="h-3 w-3 text-indigo-500" />
                    <span className="text-[9px] font-bold text-indigo-900 uppercase tracking-wider">vs S&P 500 (SPY)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "SPY Return", value: "10.3%" },
                      { label: "SPY Volatility", value: "14.8%" },
                      { label: "SPY Max DD", value: "-8.2%" },
                      { label: "SPY Sharpe", value: "0.92" },
                    ].map((b) => (
                      <div key={b.label} className="bg-white rounded-md px-2 py-1.5 border border-indigo-100/60">
                        <span className="text-[8px] text-indigo-400 font-medium block">{b.label}</span>
                        <span className="text-[11px] font-bold text-indigo-900 tabular-nums">{b.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority Actions + SWOT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-indigo-50 border-indigo-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 rounded-md bg-indigo-100"><Zap className="h-3.5 w-3.5 text-indigo-600" /></div>
                    <span className="text-xs font-bold text-indigo-900">Priority Actions</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { action: "REDUCE", symbol: "NVDA", text: "Take profits — up 47% YTD, trim 20% of position", color: "bg-amber-50 border-amber-100 text-amber-700" },
                      { action: "ADD", symbol: "BND", text: "Increase bond allocation to match moderate risk profile", color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                      { action: "HOLD", symbol: "VOO", text: "Core S&P 500 position well-sized at 18%", color: "bg-blue-50 border-blue-100 text-blue-700" },
                    ].map((a) => (
                      <div key={a.symbol} className="flex gap-2 text-xs items-start">
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          <span className={`px-1 py-0.5 rounded text-[8px] font-bold border ${a.color}`}>{a.action}</span>
                          <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-white border border-neutral-200 text-neutral-800">{a.symbol}</span>
                        </div>
                        <span className="text-indigo-800 leading-snug">{a.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                    <span className="text-xs font-semibold text-neutral-900">Deep Dive Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-y divide-neutral-100">
                    {[
                      { title: "Strengths", items: ["Strong tech gains", "Good diversification"], color: "text-emerald-600", dot: "bg-emerald-500" },
                      { title: "Weaknesses", items: ["High tech concentration", "Low bond allocation"], color: "text-rose-600", dot: "bg-rose-500" },
                      { title: "Opportunities", items: ["Energy sector rotation", "Dividend growth adds"], color: "text-blue-600", dot: "bg-blue-500" },
                      { title: "Risks", items: ["Fed rate uncertainty", "AI sector correction"], color: "text-amber-600", dot: "bg-amber-500" },
                    ].map((q) => (
                      <div key={q.title} className="p-3">
                        <p className={`text-[10px] font-bold mb-1.5 ${q.color}`}>{q.title}</p>
                        <ul className="space-y-1">
                          {q.items.map((item) => (
                            <li key={item} className="flex gap-1.5 text-[10px] text-neutral-600">
                              <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 opacity-60 ${q.dot}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fundamentals */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                  <span className="text-xs font-semibold text-neutral-900">Portfolio Fundamentals</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
                  {[
                    { title: "Diversification", icon: <PieChart className="h-3.5 w-3.5 text-neutral-400" />, assessment: "Well Balanced", meter: "85%", meterColor: "bg-emerald-500", trackColor: "bg-emerald-100", detail: "14 holdings across 8 sectors with no single position above 15%." },
                    { title: "Performance", icon: <TrendingUp className="h-3.5 w-3.5 text-neutral-400" />, assessment: "Strong", meter: "90%", meterColor: "bg-emerald-500", trackColor: "bg-emerald-100", detail: "Outperforming S&P 500 by 2.1% with a Sharpe ratio of 1.12." },
                    { title: "Risk Exposure", icon: <Shield className="h-3.5 w-3.5 text-neutral-400" />, assessment: "Moderate", meter: "60%", meterColor: "bg-amber-500", trackColor: "bg-amber-100", detail: "Technology at 38% is approaching your 40% concentration limit." },
                  ].map((f) => (
                    <div key={f.title} className="p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        {f.icon}
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{f.title}</span>
                      </div>
                      <p className="text-sm font-bold text-neutral-900 mb-2">{f.assessment}</p>
                      <div className={`h-1 w-full rounded-full ${f.trackColor} mb-2`}>
                        <div className={`h-full rounded-full ${f.meterColor}`} style={{ width: f.meter }} />
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-relaxed">{f.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Connections</span>
                  <span className="text-[10px] text-neutral-400 font-medium">Manage</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {[
                    { name: "Fidelity", color: "bg-green-500" },
                    { name: "Wealthsimple", color: "bg-emerald-500" },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between rounded-lg bg-neutral-50 p-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-600">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-neutral-700">{c.name}</span>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${c.color}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
                <p className="text-xs font-semibold text-neutral-800 mb-3">By Asset Type</p>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden flex">
                  <div className="bg-indigo-500 h-full" style={{ width: "52%" }} />
                  <div className="bg-purple-500 h-full" style={{ width: "24%" }} />
                  <div className="bg-amber-500 h-full" style={{ width: "14%" }} />
                  <div className="bg-emerald-500 h-full" style={{ width: "10%" }} />
                </div>
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: "Stocks", pct: "52.0", color: "bg-indigo-500" },
                    { label: "ETFs", pct: "24.0", color: "bg-purple-500" },
                    { label: "Crypto", pct: "14.0", color: "bg-amber-500" },
                    { label: "Bonds", pct: "10.0", color: "bg-emerald-500" },
                  ].map((a) => (
                    <div key={a.label} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${a.color}`} />
                        <span className="text-neutral-600">{a.label}</span>
                      </div>
                      <span className="font-semibold text-neutral-900 tabular-nums">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-neutral-100">
                  <Target className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-800">High Conviction</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { symbol: "VOO", note: "Low-cost S&P 500 core — excellent foundation" },
                    { symbol: "MSFT", note: "AI leadership + cloud growth runway" },
                    { symbol: "AAPL", note: "Strong cash flow, services revenue growing" },
                  ].map((h) => (
                    <div key={h.symbol} className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0 mt-0.5">{h.symbol}</span>
                      <p className="text-[10px] text-neutral-600 leading-snug">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile dashboard mock (inside iPhone frame) ── */

function MobileDashboardMock() {
  return (
    <div className="bg-white">
      {/* App header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-neutral-100">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-md bg-neutral-900 flex items-center justify-center text-white font-serif font-bold text-[7px]">W</div>
          <span className="text-[10px] font-bold text-neutral-900">WallStreetAI</span>
        </div>
        <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[7px] font-bold text-indigo-700">S</div>
      </div>

      <div className="px-3.5 pt-3 pb-2">
        {/* Portfolio value */}
        <div className="mb-3">
          <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Portfolio Value</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold tracking-tight text-neutral-900">$127,843</span>
            <span className="text-[9px] font-bold text-emerald-600">.50</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="h-2 w-2" />
              +12.4%
            </span>
            <span className="text-[9px] text-neutral-400">all time</span>
          </div>
        </div>

        {/* Mini sparkline chart */}
        <div className="flex items-end gap-[2px] h-[40px] mb-3">
          {[35, 38, 32, 40, 36, 42, 38, 45, 41, 48, 44, 50, 46, 52, 48, 55, 50, 53, 56, 52, 58, 55, 60, 57, 62, 59, 64, 60, 65, 68].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-[1px] ${i >= 25 ? "bg-indigo-500" : "bg-indigo-200"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
            <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Today</p>
            <p className="text-[11px] font-bold text-neutral-900">+$342.80</p>
            <p className="text-[9px] font-bold text-emerald-600">+0.27%</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
            <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Total Return</p>
            <p className="text-[11px] font-bold text-neutral-900">+$14,150</p>
            <p className="text-[9px] font-bold text-emerald-600">+12.4%</p>
          </div>
        </div>

        {/* Top holdings */}
        <div className="mb-3">
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Top Holdings</p>
          <div className="space-y-0">
            {[
              { symbol: "NVDA", name: "NVIDIA Corp", value: "$24,312", change: "+47.2%", positive: true },
              { symbol: "VOO", name: "Vanguard S&P", value: "$22,100", change: "+12.4%", positive: true },
              { symbol: "AAPL", name: "Apple Inc", value: "$18,450", change: "+22.1%", positive: true },
            ].map((h) => (
              <div key={h.symbol} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-neutral-100 flex items-center justify-center text-[8px] font-bold text-neutral-700">{h.symbol.slice(0, 2)}</div>
                  <div>
                    <p className="text-[10px] font-semibold text-neutral-900">{h.symbol}</p>
                    <p className="text-[8px] text-neutral-400">{h.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-neutral-900 tabular-nums">{h.value}</p>
                  <p className={`text-[8px] font-bold tabular-nums ${h.positive ? "text-emerald-600" : "text-rose-600"}`}>{h.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI insight card */}
        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
            <span className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="text-[9px] text-indigo-900 leading-relaxed">
            Tech sector at 38% — consider trimming NVDA gains into bonds.
          </p>
        </div>
      </div>
    </div>
  );
}

function MockMiniStat({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-neutral-900">{value}</span>
        <span className={`text-[10px] font-bold ${positive ? "text-emerald-600" : "text-rose-600"}`}>{delta}</span>
      </div>
    </div>
  );
}

function MockInsightPill({
  icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "default" | "risk" | "action";
}) {
  const bg = variant === "risk" ? "bg-rose-50 border-rose-100" : variant === "action" ? "bg-amber-50 border-amber-100" : "bg-neutral-50 border-neutral-200";
  const labelColor = variant === "risk" ? "text-rose-400" : variant === "action" ? "text-amber-500" : "text-neutral-400";
  const valueColor = variant === "risk" ? "text-rose-900" : variant === "action" ? "text-amber-900" : "text-neutral-900";

  return (
    <div className={`p-3 rounded-xl border flex flex-col justify-between min-h-[60px] ${bg}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className={`text-[9px] font-bold uppercase tracking-wider ${labelColor}`}>{label}</span>
      </div>
      <p className={`text-[11px] font-semibold leading-tight line-clamp-2 ${valueColor}`}>{value}</p>
    </div>
  );
}

/* ── Trust ─────────────────────────────────────────────────────── */

function TrustSection() {
  const points = [
    {
      icon: Lock,
      title: "Bank-grade encryption",
      description: "All data is encrypted with AES-256. Your credentials never touch our servers.",
    },
    {
      icon: Eye,
      title: "Read-only access",
      description: "We can only view your data. We cannot move funds or execute trades, ever.",
    },
    {
      icon: Shield,
      title: "Your data stays yours",
      description: "We never sell your financial data. No ads, no data brokers, no exceptions.",
    },
  ];

  return (
    <section>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Security is the foundation,
            <br />
            not a feature.
          </h2>
          <p className="mt-4 text-neutral-500 leading-relaxed max-w-md">
            We built this for our own portfolios first. That means we take
            security as seriously as you do. Read-only access, end-to-end
            encryption, and zero data selling.
          </p>
        </div>

        <div className="space-y-3">
          {points.map((p) => (
            <div
              key={p.title}
              className="flex items-start gap-4 bg-white rounded-xl border border-neutral-200 p-5"
            >
              <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                <p.icon className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{p.title}</h3>
                <p className="text-sm text-neutral-500 mt-0.5 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing teaser ──────────────────────────────────────────── */

function PricingTeaser() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "Get started with basics.",
      highlights: ["1 brokerage", "1 portfolio analysis/week", "3 stock analyses/day"],
    },
    {
      name: "Plus",
      price: "$20",
      desc: "Deeper analysis for active investors.",
      highlights: [
        "3 brokerages",
        "15 stock analyses/day",
        "Crypto analysis",
        "Unlimited insights",
      ],
      popular: true,
    },
    {
      name: "Pro",
      price: "$60",
      desc: "Unlimited everything.",
      highlights: [
        "Unlimited connections",
        "Unlimited analyses",
        "Priority support",
        "Early access",
      ],
    },
  ];

  return (
    <section className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
        Simple, transparent pricing
      </h2>
      <p className="text-neutral-500 mb-10 max-w-md mx-auto">
        Start free, upgrade when you need more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-6 text-left transition-all ${
              p.popular
                ? "border-neutral-900 bg-white shadow-lg ring-1 ring-neutral-900/5"
                : "border-neutral-200 bg-white"
            }`}
          >
            {p.popular && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-neutral-900 px-2 py-0.5 rounded-full mb-3">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-bold text-neutral-900">{p.name}</h3>
            <div className="flex items-baseline gap-0.5 mt-1 mb-2">
              <span className="text-2xl font-bold text-neutral-900">{p.price}</span>
              {p.price !== "$0" && (
                <span className="text-sm text-neutral-400">/mo</span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mb-4">{p.desc}</p>
            <ul className="space-y-1.5 text-sm text-neutral-600">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-neutral-400" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button
          asChild
          variant="outline"
          className="rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50"
        >
          <Link href="/pricing">
            View full pricing details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="bg-neutral-900 rounded-2xl p-6 sm:p-10 lg:p-16 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
        Ready to see your portfolio clearly?
      </h2>
      <p className="mt-4 text-neutral-400 max-w-md mx-auto">
        Free to start. No credit card required. Connect your accounts and see
        the difference AI clarity makes.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          asChild
          className="h-12 rounded-xl bg-white px-8 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
        >
          <Link href="/register">
            Create free account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-12 rounded-xl text-sm font-medium text-neutral-400 hover:text-white"
        >
          <Link href="/login">
            Sign in
          </Link>
        </Button>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────── */

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="pt-12 border-t border-neutral-200">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-serif font-bold text-sm">
              W
            </div>
            <span className="font-bold text-neutral-900 tracking-tight text-sm">
              WallStreetAI
            </span>
          </div>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            AI-powered portfolio intelligence for individual investors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-sm">
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-neutral-900">Product</h4>
            <ul className="space-y-1.5 text-neutral-500">
              <li><Link href="/register" className="hover:text-neutral-700 transition-colors">Get started</Link></li>
              <li><Link href="/login" className="hover:text-neutral-700 transition-colors">Sign in</Link></li>
              <li><Link href="/pricing" className="hover:text-neutral-700 transition-colors">Pricing</Link></li>
              <li><Link href="/market" className="hover:text-neutral-700 transition-colors">Market</Link></li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-neutral-900">Legal</h4>
            <ul className="space-y-1.5 text-neutral-500">
              <li><Link href="/privacy" className="hover:text-neutral-700 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-neutral-700 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-neutral-100">
        <p className="text-xs text-neutral-400">
          &copy; {year} WallStreetAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
