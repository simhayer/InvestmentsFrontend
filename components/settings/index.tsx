"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Mail,
  ShieldCheck,
  Crown,
  Zap,
  ExternalLink,
  BadgeDollarSign,
  MessageCircle,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-provider";
import { updateCurrency } from "@/utils/userService";
import { logout } from "@/utils/authService";
import { Page } from "@/components/layout/Page";

import {
  getMySubscription,
  createCheckoutSession,
  createPortalSession,
  type SubscriptionMe,
} from "@/utils/billingService";

type Currency = "USD" | "CAD";

const SUPPORT_EMAIL = "support@wallstreetai.io";

function fmtDate(d?: string | null) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function Settings() {
  const { user, refresh } = useAuth() as any;
  const searchParams = useSearchParams();
  const router = React.useMemo(
    () => ({ replace: (p: string) => window.history.replaceState({}, "", p) }),
    []
  );

  // Handle checkout redirect query params
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      toast({
        title: "Subscription activated!",
        description: "Your plan has been upgraded. Welcome aboard!",
      });
      router.replace("/settings");
    } else if (checkoutStatus === "cancel") {
      toast({
        title: "Checkout cancelled",
        description: "No changes were made to your plan.",
      });
      router.replace("/settings");
    }
  }, [searchParams, router]);

  // ── Currency ──────────────────────────────────────────────────
  const [savingCurrency, setSavingCurrency] = useState(false);

  const baseCurrency: Currency = (
    user?.base_currency === "CAD" ? "CAD" : "USD"
  ) as Currency;
  const isCAD = useMemo(() => baseCurrency === "CAD", [baseCurrency]);

  const onToggleCAD = useCallback(
    async (checked: boolean) => {
      if (!user) return;
      const next: Currency = checked ? "CAD" : "USD";
      if (next === baseCurrency) return;

      try {
        setSavingCurrency(true);
        await updateCurrency(next);
        await refresh();
        toast({
          title: "Preference updated",
          description: `Display currency is now ${next}.`,
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Couldn't update currency",
          description: "Please try again in a moment.",
        });
      } finally {
        setSavingCurrency(false);
      }
    },
    [user, baseCurrency, refresh]
  );

  // ── Billing ───────────────────────────────────────────────────
  const {
    data: sub,
    isLoading: subLoading,
    mutate: refreshSub,
  } = useSWR<SubscriptionMe>(
    user ? "billing:me" : null,
    () => getMySubscription(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 10_000,
    }
  );

  const [billingBusy, setBillingBusy] = useState(false);

  const startCheckout = useCallback(async (plan: "premium" | "pro") => {
    try {
      setBillingBusy(true);
      const { url } = await createCheckoutSession(plan);
      window.location.href = url;
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't start checkout",
        description: "Please try again.",
      });
      setBillingBusy(false);
    }
  }, []);

  const openPortal = useCallback(async () => {
    try {
      setBillingBusy(true);
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't open billing portal",
        description: "Please try again.",
      });
      setBillingBusy(false);
    }
  }, []);

  const planLabel = (sub?.plan ?? "free") as "free" | "premium" | "pro";
  const canManage = !!sub && planLabel !== "free";

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      refresh();
      window.location.href = "/login";
    } catch {
      toast({ variant: "destructive", title: "Logout failed" });
    }
  }, [refresh]);

  return (
    <Page className="max-w-2xl mx-auto space-y-6">
      {/* ── Page header ─────────────────────────────────────────── */}
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage your account, billing, and preferences.
        </p>
      </header>

      {/* ════════════════════════════════════════════════════════════
          ACCOUNT
         ════════════════════════════════════════════════════════════ */}
      <Section title="Account">
        {!user ? (
          <Skeleton className="h-14 w-full rounded-xl" />
        ) : (
          <>
            <Row
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user.email || "—"}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-xs text-neutral-500 hover:text-neutral-900"
                  onClick={() => {
                    if (!user?.email) return;
                    navigator.clipboard.writeText(user.email).then(() =>
                      toast({ title: "Copied" })
                    );
                  }}
                >
                  Copy
                </Button>
              }
            />
            <Row
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Security"
              value="Signed in via Supabase"
              subtle
            />
          </>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════
          PLAN & BILLING
         ════════════════════════════════════════════════════════════ */}
      <Section
        title="Plan & Billing"
        headerRight={
          <div className="flex items-center gap-1.5">
            {canManage && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs text-neutral-500 hover:text-neutral-900"
                disabled={billingBusy}
                onClick={openPortal}
              >
                Manage
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs text-neutral-500 hover:text-neutral-900"
              disabled={!user || subLoading || billingBusy}
              onClick={async () => {
                await refreshSub();
                toast({ title: "Refreshed" });
              }}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {!user || subLoading ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : (
          <>
            {/* Current plan row */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 capitalize">
                    {planLabel === "premium" ? "Plus" : planLabel} plan
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {sub?.status === "trialing" && fmtDate(sub.trial_end)
                      ? `Trial ends ${fmtDate(sub.trial_end)}`
                      : sub?.status === "active" &&
                        fmtDate(sub.current_period_end)
                      ? `Renews ${fmtDate(sub.current_period_end)}`
                      : planLabel === "free"
                      ? "No active subscription"
                      : `Status: ${sub?.status ?? "unknown"}`}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                {planLabel === "premium"
                  ? "$20/mo"
                  : planLabel === "pro"
                  ? "$60/mo"
                  : "Free"}
              </span>
            </div>

            {/* Upgrade cards */}
            {planLabel !== "pro" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {planLabel === "free" && (
                  <UpgradeCard
                    name="Plus"
                    price="$20/mo"
                    desc="15 stock analyses/day, crypto, unlimited insights"
                    cta="Upgrade to Plus"
                    busy={billingBusy}
                    onClick={() => startCheckout("premium")}
                    highlighted
                  />
                )}
                <UpgradeCard
                  name="Pro"
                  price="$60/mo"
                  desc="Unlimited everything, priority support"
                  cta={planLabel === "premium" ? "Upgrade to Pro" : "Go Pro"}
                  busy={billingBusy}
                  onClick={() => startCheckout("pro")}
                  highlighted={planLabel === "premium"}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-xs text-neutral-500">
              <span>Cancel anytime from the billing portal.</span>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 font-semibold text-neutral-700 hover:text-neutral-900 underline underline-offset-2 shrink-0"
              >
                Compare plans <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════
          PREFERENCES
         ════════════════════════════════════════════════════════════ */}
      <Section title="Preferences">
        {!user ? (
          <Skeleton className="h-14 w-full rounded-xl" />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <BadgeDollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Display Currency
                </p>
                <p className="text-xs text-neutral-500">
                  Currently <span className="font-semibold">{baseCurrency}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <Label className="text-xs font-medium text-neutral-500">
                USD
              </Label>
              <Switch
                checked={isCAD}
                onCheckedChange={onToggleCAD}
                disabled={savingCurrency}
              />
              <Label className="text-xs font-medium text-neutral-500">
                CAD
              </Label>
            </div>
          </div>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════
          SUPPORT
         ════════════════════════════════════════════════════════════ */}
      <Section title="Support">
        <LinkRow
          icon={<MessageCircle className="h-4 w-4" />}
          label="Contact Support"
          desc="Get help with your account or report a bug"
          href={`mailto:${SUPPORT_EMAIL}?subject=WallStreetAI%20Support%20Request`}
          external
        />
        <LinkRow
          icon={<HelpCircle className="h-4 w-4" />}
          label="FAQ & Help"
          desc="Common questions and troubleshooting"
          href={`mailto:${SUPPORT_EMAIL}?subject=WallStreetAI%20Question`}
          external
        />
        <LinkRow
          icon={<FileText className="h-4 w-4" />}
          label="Terms of Service"
          href="/terms"
        />
        <LinkRow
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Privacy Policy"
          href="/privacy"
        />
      </Section>

      {/* ════════════════════════════════════════════════════════════
          DANGER ZONE
         ════════════════════════════════════════════════════════════ */}
      <div className="pt-2 pb-8">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </Page>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function Section({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          {title}
        </h2>
        {headerRight}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({
  icon,
  label,
  value,
  action,
  subtle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${
        subtle
          ? "bg-neutral-50 text-neutral-500"
          : "border border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          <p className="text-xs text-neutral-500 truncate">{value}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function LinkRow({
  icon,
  label,
  desc,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  href: string;
  external?: boolean;
}) {
  const Wrapper = external ? "a" : Link;
  const extraProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      href={href}
      {...extraProps}
      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition-colors hover:bg-neutral-50 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 transition-colors">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          {desc && (
            <p className="text-xs text-neutral-500 truncate">{desc}</p>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 shrink-0 transition-colors" />
    </Wrapper>
  );
}

function UpgradeCard({
  name,
  price,
  desc,
  cta,
  busy,
  onClick,
  highlighted,
}: {
  name: string;
  price: string;
  desc: string;
  cta: string;
  busy: boolean;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlighted
          ? "border-neutral-900 bg-white shadow-md"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-neutral-900">{name}</p>
        <span className="text-xs font-semibold text-neutral-600">{price}</span>
      </div>
      <p className="text-xs text-neutral-500 mb-3 leading-relaxed">{desc}</p>
      <Button
        className={`h-9 w-full rounded-lg text-xs font-semibold ${
          highlighted
            ? "bg-neutral-900 text-white hover:bg-neutral-800"
            : "bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50"
        }`}
        variant={highlighted ? "default" : "outline"}
        disabled={busy}
        onClick={onClick}
      >
        {cta}
        <Zap className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
