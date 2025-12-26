// components/portfolio/PortfolioOverview.tsx
"use client";

import * as React from "react";
import { getPortfolioSummary } from "@/utils/portfolioService";
import { keysToCamel } from "@/utils/format";
import { toast } from "@/components/ui/use-toast";
import { TopHoldings } from "@/components/holdings/top-holdings";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioSummary } from "@/types/portfolio-summary";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { StackedBar, KeyVal, TimeAgo } from "./_bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Link2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fmtCurrency, fmtPct } from "@/utils/format";

type Props = { currency?: "USD" | "CAD"; sidePanel?: React.ReactNode };

export function PortfolioOverview({ sidePanel }: Props) {
  const [data, setData] = React.useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const raw = await getPortfolioSummary({ signal });
      const summary = keysToCamel(raw) as unknown as PortfolioSummary;
      console.log("fetched portfolio summary", summary);
      setData(summary);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast({
        title: "Error",
        description: "Failed to load portfolio overview.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading && !data) return <LoadingShell />;

  if (!data) {
    return (
      <section className="min-h-screen w-full bg-[#f6f7f8]">
        <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-10 xl:px-14 py-10">
          <Card className="rounded-3xl border-neutral-200/80 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription className="text-sm text-neutral-600">
                We couldn&apos;t load your portfolio right now.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-neutral-600">
                — Please retry in a moment.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const asOf = (data as any).asOf ? new Date((data as any).asOf * 1000) : null;
  const positionsCount = (data as any).positionsCount ?? 0;
  const ccy = (data as any).currency || "USD";

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="mx-auto w-full max-w-[1260px] px-4 sm:px-6 lg:px-10 xl:px-14 py-9 sm:py-10 lg:py-12 space-y-6 sm:space-y-7">
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-[32px] font-semibold text-neutral-900">
              Dashboard
            </h1>
          </div>
          <PortfolioSummaryHero
            data={data}
            ccy={ccy}
            asOf={asOf}
            positionsCount={positionsCount}
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 xl:grid-cols-[2.1fr_0.7fr]">
          <div className="order-1 min-w-0 space-y-5 sm:space-y-6">
            {sidePanel}
          </div>
          <div className="order-2 xl:order-2 xl:max-w-[420px] xl:justify-self-end">
            <div className="space-y-5 sm:space-y-6">
              <TopHoldings
                holdings={(data as any).topPositions}
                loading={loading}
                currency={ccy}
              />
              <AllocationSection allocations={(data as any).allocations} />
              <ConnectionsCard connections={(data as any).connections} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioOverview;

function LoadingShell() {
  return (
    <div className="min-h-screen w-full bg-[#f6f7f8]">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-10 xl:px-14 py-10 space-y-6">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.1fr_0.7fr]">
          <div className="space-y-4">
            <Skeleton className="h-60 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="flex h-full min-h-[104px] flex-col justify-center gap-1.5 rounded-2xl border border-neutral-200/80 bg-white px-4 py-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 leading-tight">
        {label}
      </p>
      <div className="text-lg font-semibold text-neutral-900 leading-tight">
        {value}
      </div>
      {delta ? (
        <div
          className={cn(
            "text-xs font-semibold leading-none",
            tone === "positive"
              ? "text-emerald-600"
              : tone === "negative"
              ? "text-rose-600"
              : "text-neutral-600"
          )}
        >
          {delta}
        </div>
      ) : null}
    </div>
  );
}

function PortfolioSummaryHero({
  data,
  ccy,
  asOf,
  positionsCount,
}: {
  data: PortfolioSummary;
  ccy: string;
  asOf: Date | null;
  positionsCount: number;
}) {
  const totalReturn = (data as any).unrealizedPl ?? 0;
  const totalReturnPct = (data as any).unrealizedPlPct;
  const dayReturn = (data as any).dayPl ?? 0;
  const dayReturnPct = (data as any).dayPlPct;
  const status = (data as any).priceStatus as string | undefined;

  const totalReturnTone = toneFromNumber(totalReturn);
  const dayReturnTone = toneFromNumber(dayReturn);

  return (
    <Card
      className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)]"
      data-tour-id="tour-portfolio-hero"
    >
      <CardHeader className="pb-0 pt-6 px-5 sm:px-7 lg:px-8">
        <CardTitle className="text-lg font-semibold text-neutral-900">
          Portfolio value
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-6 pt-2 sm:px-7 sm:pb-7 lg:px-8">
        <div className="flex flex-col gap-5">
          <div className="grid items-center gap-5 lg:gap-6 lg:grid-cols-[1.05fr_auto_auto]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-4xl font-semibold leading-tight text-neutral-900 sm:text-[38px]">
                  {fmtCurrency((data as any).marketValue, ccy)}
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Total across all linked accounts.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <MetricCard
                label="Total return"
                value={fmtCurrency(totalReturn, ccy)}
                delta={fmtPct(totalReturnPct)}
                tone={totalReturnTone}
              />
              <MetricCard
                label="Today’s return"
                value={fmtCurrency(dayReturn, ccy)}
                delta={fmtPct(dayReturnPct)}
                tone={dayReturnTone}
              />
              <MetricCard
                label="Positions"
                value={String(positionsCount)}
                tone="neutral"
              />
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200/70">
      {children}
    </span>
  );
}

function AllocationSection({
  allocations,
}: {
  allocations?: {
    byType?: { key: string; weight: number }[];
    byAccount?: { key: string; weight: number }[];
  };
}) {
  const byType = allocations?.byType ?? [];
  const byAccount = allocations?.byAccount ?? [];

  return (
    <section className="space-y-2">
      <div className="grid gap-4 lg:grid-cols-2">
        <AllocCard title="By type" items={byType} />
        <AllocCard title="By account" items={byAccount} />
      </div>
    </section>
  );
}

function AllocCard({
  title,
  items,
}: {
  title: string;
  items: { key: string; value?: number; weight: number }[];
}) {
  const hasData = (items?.length ?? 0) > 0;
  const showCount = items.length > 1;

  return (
    <div className="rounded-3xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        {hasData && showCount ? (
          <span className="text-[11px] text-neutral-400">
            {items.length} items
          </span>
        ) : null}
      </div>

      {hasData ? (
        <>
          <StackedBar
            items={items.map((i) => ({ key: i.key, weight: i.weight }))}
            height={12}
          />
          <div className="mt-3 space-y-2">
            {items.map((i) => (
              <div
                key={i.key}
                className="space-y-1 rounded-xl bg-neutral-50/60 p-2.5"
              >
                <KeyVal k={i.key} v={`${i.weight.toFixed(2)}%`} />
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white ring-1 ring-neutral-200/80">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{
                      width: `${Math.max(0, Math.min(100, i.weight))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4 text-sm text-neutral-600">
          No allocation data yet.
        </div>
      )}
    </div>
  );
}

function ConnectionsCard({ connections }: { connections?: any[] }) {
  const hasConnections = connections?.length;
  return (
    <Card
      className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_20px_56px_-40px_rgba(15,23,42,0.38)]"
      data-tour-id="tour-connections-card"
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Connections
            </CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Link accounts to see live balances.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasConnections && (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-700 ring-1 ring-neutral-200">
                <Link2 className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-neutral-900">
                  No connections yet
                </p>
              </div>
            </div>
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href="/connections">Connect an account</Link>
            </Button>
          </div>
        )}

        {connections?.map((c) => {
          const stale =
            c.syncedAt &&
            Date.now() - new Date(c.syncedAt).getTime() >
              1000 * 60 * 60 * 24 * 30;
          return (
            <div
              key={c.id}
              className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_10px_30px_-26px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">
                    {c.institutionName}
                  </div>
                  <div className="text-xs text-neutral-600">
                    Added <TimeAgo iso={c.createdAt} /> • Last sync{" "}
                    <TimeAgo iso={c.syncedAt} />
                  </div>
                </div>
              </div>
              <Badge
                variant={stale ? "destructive" : "secondary"}
                className={cn(
                  "rounded-full",
                  stale
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                )}
              >
                {stale ? "Stale" : "Healthy"}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function toneFromNumber(
  v?: number | null
): "positive" | "negative" | "neutral" {
  if (v == null) return "neutral";
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
}

function formatAsOf(date: Date | null) {
  if (!date) return null;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
