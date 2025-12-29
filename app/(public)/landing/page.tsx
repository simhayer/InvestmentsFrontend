import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Link2,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-[3rem] bg-neutral-900 py-20 px-8 text-center shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Start your journey to{" "}
          <span className="text-indigo-400 font-serif italic">calm</span>{" "}
          investing.
        </h2>
        <p className="mt-6 text-lg text-neutral-400">
          Get started today. No credit card required. Link your accounts and see
          the difference AI clarity makes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="h-14 rounded-2xl bg-white px-10 font-bold text-neutral-900 hover:bg-neutral-100"
          >
            <Link href="/register">Create Free Account</Link>
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
                AI for Investments
              </span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Empowering individual investors with institutional-grade AI
              analysis and portfolio monitoring.
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
            © {year} AI for Investments. All rights reserved.
          </p>
          <div className="flex gap-6">
            <div className="h-5 w-5 bg-neutral-100 rounded" />{" "}
            {/* Social Placeholder */}
            <div className="h-5 w-5 bg-neutral-100 rounded" />{" "}
            {/* Social Placeholder */}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FeatureSection() {
  const features = [
    {
      title: "Holdings analysis",
      description:
        "Plain-English breakdown of each asset, risks, and upside potentials.",
      icon: BarChart3,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Portfolio health",
      description:
        "Automated diversification, risk, and concentration checks across all accounts.",
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Signals & news",
      description:
        "Contextual AI summaries of market events that actually affect your specific book.",
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section className="relative">
      <div className="mb-16 text-center lg:text-left">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600">
          Product Capability
        </h2>
        <p className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Everything you need to <br className="hidden lg:block" /> invest with
          conviction.
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
      desc: "Securely link your brokerages via bank-grade encrypted sync.",
      icon: Link2,
    },
    {
      title: "Analyze",
      desc: "Our AI scans every position for risk and concentration.",
      icon: Sparkles,
    },
    {
      title: "Optimize",
      desc: "Receive plain-English insights to improve your health score.",
      icon: BarChart3,
    },
  ];

  return (
    <section className="rounded-[3rem] bg-neutral-50/50 py-20 px-8 border border-neutral-200/50">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          Three steps to clarity.
        </h2>
        <p className="mt-4 text-neutral-500">
          Wealth management complexity, simplified into a calm workflow.
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
      title: "Read-only access",
      desc: "We can only see data. We cannot move funds or execute trades.",
      icon: Link2,
    },
    {
      title: "Strict Privacy",
      desc: "We never sell your financial data. You are the customer, not the product.",
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
            Your broker stays.
          </p>
          <p className="mt-6 text-lg text-neutral-500 leading-relaxed">
            We built this to be the tool we wanted for our own families. That
            means security isn't a feature—it's the foundation.
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
              Trusted by{" "}
              <span className="text-neutral-900 font-bold">
                10,000+ investors
              </span>{" "}
              <br />
              tracking $2B+ in assets.
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
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-full -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(99,102,241,0.05)_0%,rgba(250,250,250,0)_100%)]" />

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
  return (
    <section className="relative">
      <div className="flex flex-col items-center text-center">
        <Badge
          variant="outline"
          className="mb-6 rounded-full border-indigo-100 bg-indigo-50/50 px-4 py-1 text-xs font-medium text-indigo-700 backdrop-blur-sm"
        >
          <Sparkles className="mr-2 h-3 w-3" />
          V2.0 is now live: Enhanced AI Insights
        </Badge>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-neutral-900 sm:text-7xl">
          The institutional-grade <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
            AI Copilot
          </span>{" "}
          for your wealth.
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
          Stop guessing. Link your existing brokerages to receive a
          plain-English breakdown of your portfolio risk, diversification, and
          opportunities—powered by world-class AI.
        </p>

        <div className="mt-10 flex items-center gap-x-6">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl bg-neutral-900 px-8 font-bold text-white hover:bg-neutral-800 shadow-xl shadow-neutral-200"
          >
            <Link href="/register">Connect Portfolio</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-12 font-bold text-neutral-600 hover:text-neutral-900"
          >
            <Link href="/login" className="flex items-center gap-2">
              View Sample Analysis <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-20">
        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Decorative Glow */}
      <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 blur-2xl opacity-50" />

      <div className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200/60 bg-white shadow-2xl">
        <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-neutral-200" />
            <div className="h-3 w-3 rounded-full bg-neutral-200" />
            <div className="h-3 w-3 rounded-full bg-neutral-200" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            Secure Read-Only Access
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                  Portfolio Snapshot
                </p>
                <h3 className="text-4xl font-bold text-neutral-900 mt-1">
                  $264,500.00
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex-1">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">
                    Daily Gain
                  </p>
                  <p className="text-xl font-bold text-emerald-700">
                    +$1,420.50
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 flex-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase">
                    Risk Level
                  </p>
                  <p className="text-xl font-bold text-neutral-900">Moderate</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-neutral-100 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  <span>AI Health Score</span>
                  <span className="text-indigo-600">88%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div className="h-full w-[88%] rounded-full bg-indigo-600" />
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed italic">
                  "Your portfolio is well-diversified, but AI flags a 12%
                  concentration in Tech Growth that exceeds your target."
                </p>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="h-full rounded-2xl bg-neutral-900 p-6 text-white shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Smart Signals
                  </span>
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="space-y-4">
                  <div className="border-l-2 border-indigo-500 pl-4 py-1">
                    <p className="text-sm font-bold">Earnings Drift: AAPL</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Valuation is 15% above 5-year mean. AI suggests protective
                      stops.
                    </p>
                  </div>
                  <div className="border-l-2 border-emerald-500 pl-4 py-1">
                    <p className="text-sm font-bold">Sector Rotation</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Capital moving to Energy. Your XLE position is well-timed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
