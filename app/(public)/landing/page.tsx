import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  ChevronRight,
  Link2,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-[3rem] bg-neutral-900 py-20 px-8 text-center shadow-2xl">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-[90px]" />
      <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Deploy your <span className="text-indigo-300">AI agent</span> in
          minutes.
        </h2>
        <p className="mt-6 text-lg text-neutral-300">
          Set your goals once. The agent watches every position, flags risk, and
          drafts actions so you stay ahead.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="h-14 rounded-2xl bg-white px-10 font-bold text-neutral-900 hover:bg-neutral-100"
          >
            <Link href="/register">Activate AI Agent</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 rounded-2xl border-neutral-700 bg-transparent px-10 font-bold text-white hover:bg-neutral-800"
          >
            <Link href="/contact">Talk to Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer({ year }: { year: number }) {
  return (
    <footer className="mt-32 border-t border-neutral-200/60 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 font-serif text-xl font-bold text-white">
                W
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900">
                WallStreetAI
              </span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              An AI investment agent that continuously monitors, explains, and
              guides your portfolio decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:justify-items-end">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li>
                  <Link
                    href="/holdings"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Holdings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/market"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Market Signals
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Security Overview
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400">
            © {year} WallStreetAI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <div className="h-5 w-5 bg-neutral-100 rounded" />
            <div className="h-5 w-5 bg-neutral-100 rounded" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FeatureSection() {
  const features = [
    {
      title: "Autonomous monitoring",
      description:
        "The agent tracks every holding, alerting you the moment risk drifts or opportunity spikes.",
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Goal-driven playbooks",
      description:
        "Set guardrails and targets once. The agent builds action plans that match your strategy.",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Explainable recommendations",
      description:
        "Every suggestion comes with clear reasoning, data, and next-step options.",
      icon: Brain,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section className="relative">
      <div className="mb-16 text-center lg:text-left">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600">
          Agent Capabilities
        </h2>
        <p className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Built for decision-ready insight.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative rounded-[2rem] border border-neutral-200/60 bg-white p-8 transition-all hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5"
          >
            <div
              className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg} ring-1 ring-inset ring-black/5`}
            >
              <f.icon className={`h-6 w-6 ${f.color}`} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">{f.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              {f.description}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-colors group-hover:text-indigo-600">
              Learn More <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Connect",
      desc: "Securely link your brokerages through encrypted, read-only sync.",
      icon: Link2,
    },
    {
      title: "Set priorities",
      desc: "Tell the agent your goals, risk limits, and preferred strategies.",
      icon: Target,
    },
    {
      title: "Stay ahead",
      desc: "The agent monitors daily and drafts actions before volatility hits.",
      icon: Bell,
    },
  ];

  return (
    <section className="rounded-[3rem] bg-neutral-50/50 py-20 px-8 border border-neutral-200/50">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          A dedicated agent in three steps.
        </h2>
        <p className="mt-4 text-neutral-500">
          Less dashboarding. More clarity, delivered continuously.
        </p>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="relative flex flex-col items-center text-center"
          >
            {idx !== steps.length - 1 && (
              <div className="absolute top-10 left-[60%] hidden w-full border-t border-dashed border-neutral-200 md:block" />
            )}
            <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-neutral-200/50 ring-8 ring-neutral-50">
              <step.icon className="h-8 w-8 text-neutral-900" />
              <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-lg">
                0{idx + 1}
              </span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900">{step.title}</h3>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed px-4">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  const points = [
    {
      title: "Secure by design",
      desc: "Bank-level AES-256 encryption. Your credentials never touch our servers.",
      icon: ShieldCheck,
    },
    {
      title: "Read-only control",
      desc: "The agent can analyze and advise. You execute trades on your terms.",
      icon: Link2,
    },
    {
      title: "Privacy first",
      desc: "We never sell your financial data. You stay in control of your agent.",
      icon: Sparkles,
    },
  ];

  return (
    <section>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
            Trust & Security
          </h2>
          <p className="mt-4 text-4xl font-bold tracking-tight text-neutral-900">
            Your data is safe. <br />
            Your agent is accountable.
          </p>
          <p className="mt-6 text-lg text-neutral-500 leading-relaxed">
            The agent stays transparent and read-only, with security built into
            every workflow.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-white bg-neutral-200"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-neutral-600">
              Trusted by <span className="text-neutral-900 font-bold">10,000+</span>
              investors <br /> tracking $2B+ in assets.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {points.map((point) => (
            <div
              key={point.title}
              className="flex gap-5 rounded-[2rem] border border-neutral-100 bg-white p-6 shadow-sm transition-hover hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-50">
                <point.icon className="h-6 w-6 text-neutral-900" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">{point.title}</h3>
                <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[900px] w-full -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(99,102,241,0.08)_0%,rgba(250,250,250,0)_100%)]" />
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-emerald-200/20 blur-[110px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-200/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:pt-16 lg:px-8">
        <HeroSection />

        <div className="mt-32 space-y-32">
          <FeatureSection />
          <HowItWorksSection />
          <TrustSection />
          <CTASection />
        </div>
      </div>

      <Footer year={year} />
    </div>
  );
}

function HeroSection() {
  const highlights = [
    {
      title: "24/7 Monitoring",
      description: "Always-on scans across holdings, news, and risk shifts.",
      icon: Activity,
    },
    {
      title: "Proactive Alerts",
      description: "The agent surfaces what matters before markets move.",
      icon: Bell,
    },
    {
      title: "Action Plans",
      description: "Turn insights into clear steps, not endless dashboards.",
      icon: Zap,
    },
  ];

  return (
    <section className="relative">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge
            variant="outline"
            className="mb-6 inline-flex rounded-full border-indigo-100 bg-indigo-50/50 px-4 py-1 text-xs font-medium text-indigo-700 backdrop-blur-sm"
          >
            <Sparkles className="mr-2 h-3 w-3" />
            Agent mode is live: continuous portfolio monitoring
          </Badge>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
            Your AI investment agent, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
              always on.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Assign the agent your goals once. It monitors your holdings, tracks
            risk, and drafts the next best actions in plain English.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-neutral-900 px-8 font-bold text-white hover:bg-neutral-800 shadow-xl shadow-neutral-200"
            >
              <Link href="/register">Activate AI Agent</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 font-bold text-neutral-600 hover:text-neutral-900"
            >
              <Link href="/login" className="flex items-center gap-2">
                View Agent Demo <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-neutral-200/70 bg-white/70 p-4 shadow-sm"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <item.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <AgentCommandCenter />
        </div>
      </div>
    </section>
  );
}

function AgentCommandCenter() {
  const priorities = [
    {
      label: "Concentration",
      value: "Tech exposure 12% above target",
      icon: Target,
      tone: "text-rose-600",
      bg: "bg-rose-50/70",
    },
    {
      label: "Risk guardrail",
      value: "Shift 3% into low-volatility assets",
      icon: BarChart3,
      tone: "text-emerald-700",
      bg: "bg-emerald-50/70",
    },
    {
      label: "Event watch",
      value: "CPI release in 3 days; watch duration",
      icon: Bell,
      tone: "text-amber-700",
      bg: "bg-amber-50/70",
    },
  ];

  const feed = [
    {
      label: "Action",
      title: "Trim NVDA exposure by 4%",
      detail: "Reduce single-name risk while keeping growth upside.",
      icon: Zap,
    },
    {
      label: "Insight",
      title: "Energy rotation building",
      detail: "Agent suggests a 2% tilt to XLE for balance.",
      icon: Brain,
    },
  ];

  return (
    <div className="relative mx-auto max-w-xl lg:max-w-none">
      <div className="absolute -inset-2 rounded-[2.75rem] bg-gradient-to-tr from-indigo-500/25 via-transparent to-emerald-500/20 blur-2xl opacity-60" />

      <div className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200/60 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/60 px-6 py-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
            Agent Control Center
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
              Live
            </span>
            <span>Next sweep in 14m</span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-neutral-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Today's Brief
                </p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">
                  Protect downside, keep momentum.
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  The agent is balancing growth exposure with volatility
                  defense.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {priorities.map((priority) => (
                <div
                  key={priority.label}
                  className={`flex items-start gap-3 rounded-2xl border border-neutral-100 p-4 ${priority.bg}`}
                >
                  <priority.icon className={`mt-0.5 h-4 w-4 ${priority.tone}`} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      {priority.label}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {priority.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Active Goals
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Grow 8-10%", "Max drawdown 12%", "Tax-aware moves"].map(
                  (goal) => (
                    <span
                      key={goal}
                      className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-700 shadow-sm"
                    >
                      {goal}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 p-6 text-white sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Agent Feed
              </span>
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </div>

            <div className="mt-6 space-y-4">
              {feed.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <item.icon className="h-3 w-3 text-emerald-300" />
                    {item.label}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <span>Command</span>
                <span className="text-emerald-300">Listening</span>
              </div>
              <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-neutral-900">
                Run a downside stress test on my tech exposure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
