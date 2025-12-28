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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const featureCards = [
  {
    title: "Holdings analysis",
    description: "Plain-English breakdown of each asset, risks, and upside.",
    href: "/holdings",
    icon: BarChart3,
  },
  {
    title: "Portfolio health",
    description:
      "Diversification, risk, and concentration checks across your holdings.",
    href: "/analytics",
    icon: Activity,
  },
  {
    title: "Signals & news",
    description:
      "Contextual updates and AI summaries for what actually matters.",
    href: "/market",
    icon: Bell,
  },
];

const howItWorks = [
  {
    title: "Connect your accounts",
    description: "Securely link brokerages to sync your holdings in minutes.",
    icon: Link2,
  },
  {
    title: "AI analyzes your portfolio",
    description:
      "We scan positions, risk, diversification, and scenarios using AI.",
    icon: Sparkles,
  },
  {
    title: "Get actionable insights",
    description: "See plain-English summaries, scenarios, and ongoing alerts.",
    icon: BarChart3,
  },
];

const trustPoints = [
  {
    title: "Secure by design",
    description:
      "Bank-level encryption, read-only access, and strict privacy controls.",
    icon: ShieldCheck,
  },
  {
    title: "AI you can understand",
    description:
      "Every insight comes with context, confidence, and next steps.",
    icon: Sparkles,
  },
  {
    title: "Keep your broker",
    description:
      "Stay with your existing brokerage while we handle the analysis.",
    icon: Link2,
  },
];

const previewSparkline = [28, 62, 48, 66, 54, 74, 60, 78, 68, 86, 70, 92];

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <>
      <div className="space-y-14 lg:space-y-20">
        <HeroSection />
        <FeatureSection />
        <HowItWorksSection />
        <TrustSection />
      </div>

      <Footer year={year} />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_82%_12%,rgba(59,130,246,0.08),transparent_36%)]" />
      <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_1fr] lg:px-12 lg:py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
            AI portfolio copilot
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
              AI for smarter investing.
            </h1>
            <p className="max-w-xl text-lg text-neutral-600">
              Personalized insights on your holdings, risk, diversification, and
              news—powered by AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/80">
              <Link href="/login">Log in</Link>
            </Button>
          </div>

          <p className="text-sm text-neutral-500">
            No credit card required • Connect your existing brokerages
          </p>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="space-y-5 rounded-3xl border border-neutral-200/80 bg-white/90 px-5 py-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.50)] backdrop-blur sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
            Market overview
          </p>
          <p className="text-xl font-semibold text-neutral-900">
            Portfolio snapshot
          </p>
          <p className="text-sm text-neutral-600">
            Built from your linked accounts in minutes.
          </p>
        </div>
        <Badge className="rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          Live sync
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">Total value</p>
          <div className="text-3xl font-semibold text-neutral-900">
            $264,500
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
            <ArrowUpRight className="h-4 w-4" />
            +$1,420 today <span className="text-emerald-600">(+0.54%)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 ring-1 ring-neutral-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]" />
              Updated 3m ago
            </span>
            <span>USD • Moderate risk</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-28 rounded-2xl bg-gradient-to-b from-neutral-50 via-white to-neutral-100 px-3 pt-2 ring-1 ring-neutral-200/80">
            <div className="flex h-full items-end gap-1">
              {previewSparkline.map((height, idx) => (
                <span
                  key={idx}
                  className="flex-1 rounded-full bg-emerald-500/70 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.8)]"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>7d move</span>
            <span className="font-semibold text-emerald-600">+3.1%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-neutral-900">
              Holdings analysis
            </div>
            <Badge variant="secondary" className="rounded-full">
              Clear
            </Badge>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            Plain-English readouts on every ticker with risk, upside, and
            conviction notes.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_12px_40px_-38px_rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
            <span>Portfolio health</span>
            <span className="text-emerald-600">78%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-neutral-100 ring-1 ring-neutral-200/70">
            <div className="h-full w-[78%] rounded-full bg-emerald-500" />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Diversified across sectors with minimal concentration risk.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
            <span>Signals & news</span>
            <Badge
              variant="outline"
              className="rounded-full border-neutral-300"
            >
              2 new
            </Badge>
          </div>

          <div className="mt-3 space-y-2 text-sm text-neutral-700">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <p>AI flags earnings drift on AAPL; suggests trim.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-neutral-400" />
              <p>ETF mix balances growth with inflation hedges.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
          Product
        </p>
        <h2 className="text-3xl font-semibold text-neutral-900">
          What you get with AI insights.
        </h2>
        <p className="mx-auto max-w-2xl text-neutral-600">
          See your book the way an analyst would: clear, contextual, and updated
          as markets move.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className="group block rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_16px_60px_-52px_rgba(15,23,42,0.70)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_80px_-52px_rgba(15,23,42,0.65)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200">
                    <Icon className="h-5 w-5 text-neutral-800" />
                  </span>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900" />
              </div>

              <p className="mt-3 text-sm text-neutral-600">
                {feature.description}
              </p>

              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-neutral-900">
                Explore
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
          Workflow
        </p>
        <h2 className="text-3xl font-semibold text-neutral-900">
          How it works.
        </h2>
        <p className="mx-auto max-w-2xl text-neutral-600">
          Connect, analyze, and get guidance in three clear steps.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {howItWorks.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_14px_50px_-48px_rgba(15,23,42,0.65)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                  {idx + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200">
                  <Icon className="h-5 w-5 text-neutral-800" />
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
          Trust
        </p>
        <h2 className="text-3xl font-semibold text-neutral-900">
          Built for long-term investors.
        </h2>
        <p className="mx-auto max-w-2xl text-neutral-600">
          Security, clarity, and a product that works alongside your existing
          brokerage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trustPoints.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.title}
              className="flex gap-3 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_14px_50px_-48px_rgba(15,23,42,0.65)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200">
                <Icon className="h-5 w-5 text-neutral-800" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {point.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Footer({ year }: { year: number }) {
  return (
    <footer className="mt-14 border-t border-neutral-200/80 bg-white/70">
      <div className="mx-auto flex max-w-[1260px] flex-col gap-3 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 xl:px-14">
        <div className="flex items-center gap-2 text-neutral-900 font-semibold">
          <span className='text-2xl font-bold font-["Libre_Caslon_Text",_serif] leading-none'>
            W
          </span>
          <span>AI for Investments</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="hover:text-neutral-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-neutral-900">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-neutral-900">
            Contact
          </Link>
          <Link href="/docs" className="hover:text-neutral-900">
            Docs
          </Link>
        </div>

        <div className="text-xs text-neutral-500">
          © {year} AI for Investments. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
