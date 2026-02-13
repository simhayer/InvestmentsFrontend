"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { createCheckoutSession } from "@/utils/billingService";

/* ─── Plan data ───────────────────────────────────────────────── */
const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic portfolio tracking and insights.",
    icon: Sparkles,
    features: [
      "1 brokerage connection",
      "1 full portfolio analysis / week",
      "3 stock analyses / day",
      "Basic inline insights",
      "Manual holdings",
    ],
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    id: "premium" as const,
    name: "Plus",
    price: "$20",
    period: "/month",
    description: "For active investors who want deeper analysis.",
    icon: Zap,
    features: [
      "3 brokerage connections",
      "5 full portfolio analyses / day",
      "15 stock analyses / day",
      "Unlimited inline insights",
      "Crypto analysis",
      "Priority support",
    ],
    cta: "Upgrade to Plus",
    href: null, // triggers checkout
    highlighted: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$60",
    period: "/month",
    description: "Unlimited everything. For serious portfolio managers.",
    icon: Crown,
    features: [
      "Unlimited connections",
      "Unlimited portfolio analyses",
      "Unlimited stock analyses",
      "Unlimited crypto analyses",
      "All inline insights",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Upgrade to Pro",
    href: null,
    highlighted: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  const handleUpgrade = async (plan: "premium" | "pro") => {
    if (!user) {
      router.push(`/register?next=/pricing`);
      return;
    }
    setBusy(plan);
    try {
      const { url } = await createCheckoutSession(plan);
      window.location.href = url;
    } catch {
      setBusy(null);
    }
  };

  const currentPlan = (user as any)?.plan ?? "free";

  return (
    <div className="py-16 sm:py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-neutral-500 text-base sm:text-lg leading-relaxed">
          Start free, upgrade when you need more. Cancel anytime.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isUpgrade =
            (plan.id === "premium" && currentPlan === "free") ||
            (plan.id === "pro" && currentPlan !== "pro");

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 sm:p-8 transition-all",
                plan.highlighted
                  ? "border-neutral-900 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)] ring-1 ring-neutral-900/10"
                  : "border-neutral-200 shadow-sm"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold text-white">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      plan.highlighted
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    )}
                  >
                    <plan.icon className="h-4.5 w-4.5" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900">{plan.name}</h2>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-neutral-900">{plan.price}</span>
                  <span className="text-sm text-neutral-500">{plan.period}</span>
                </div>

                <p className="text-sm text-neutral-500 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.href ? (
                <Link href={user ? "/dashboard" : plan.href}>
                  <Button
                    className={cn(
                      "h-11 w-full rounded-xl font-semibold",
                      plan.highlighted
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : "bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50"
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {user ? (isCurrent ? "Current plan" : "Go to Dashboard") : plan.cta}
                    {!user && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </Link>
              ) : (
                <Button
                  className={cn(
                    "h-11 w-full rounded-xl font-semibold",
                    plan.highlighted
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50"
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                  disabled={isCurrent || busy !== null}
                  onClick={() => isUpgrade && handleUpgrade(plan.id as "premium" | "pro")}
                >
                  {busy === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Redirecting...
                    </div>
                  ) : isCurrent ? (
                    "Current plan"
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ / Trust */}
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <p className="text-sm text-neutral-400">
          All plans include SSL encryption, Plaid read-only access, and secure data storage.
          <br />
          Cancel anytime from your{" "}
          <Link href="/settings" className="underline hover:text-neutral-600">
            settings
          </Link>.
        </p>
      </div>
    </div>
  );
}
