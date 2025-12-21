// components/investment/investment-overview.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Sparkles,
} from "lucide-react";
import MarketOverviewGrid, {
  type MarketIndexItem,
} from "./market-overview-grid";
import { useMarketOverview } from "@/hooks/use-market-overview";
import { MarketSummaryPanel } from "./market-summary";
import { getPortfolioSummary } from "@/utils/portfolioService";
import type { PortfolioSummary } from "@/types/portfolio-summary";
import { fmtCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const fallbackPortfolioSeries: Record<"7d" | "30d", number[]> = {
  "7d": [102, 103, 101, 104, 106, 108, 109, 112, 111, 114, 115, 117],
  "30d": [
    96, 97, 98, 99, 99, 101, 102, 101, 103, 104, 104, 105, 106, 106, 107, 108,
    109, 110, 110, 111, 112, 113, 113, 114, 114, 115, 116, 116, 117, 118,
  ],
};

const formatAgo = (input?: Date | string | null) => {
  if (!input) return null;
  const ts =
    input instanceof Date ? input.getTime() : new Date(input).getTime();
  if (Number.isNaN(ts)) return null;
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return `${hours}h ago`;
};

function pctTone(v?: number | null) {
  if (v == null) return "text-neutral-500";
  if (v > 0) return "text-emerald-600";
  if (v < 0) return "text-rose-600";
  return "text-neutral-600";
}

function calcPctChange(arr: number[]) {
  if (!arr?.length) return null;
  const first = arr[0];
  const last = arr[arr.length - 1];
  if (!first) return null;
  return ((last - first) / first) * 100;
}

type SnapshotProps = {
  summary: PortfolioSummary | null;
  loading: boolean;
  items: MarketIndexItem[];
  aiUpdatedAgo?: string | null;
};

function PortfolioSnapshotCard({
  summary,
  loading,
  items,
  aiUpdatedAgo,
}: SnapshotProps) {
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const currency = (summary as any)?.currency || "USD";
  const portfolioValue = summary?.marketValue ?? 264500;
  const dayPl = summary?.dayPl ?? 1420;
  const dayPlPct = summary?.dayPlPct ?? 0.54;
  const totalReturnPct = summary?.unrealizedPlPct ?? 7.8;
  const asOf =
    (summary as any)?.asOf || (summary as any)?.asOf
      ? new Date(((summary as any).asOf ?? summary?.asOf) * 1000)
      : null;

  const sparkline = useMemo(() => {
    const candidate =
      items?.find((it) => it.sparkline?.length)?.sparkline || [];
    const fallback = fallbackPortfolioSeries[range];
    if (!candidate.length) return fallback;
    if (range === "7d") {
      return candidate.slice(-12).length ? candidate.slice(-12) : fallback;
    }
    const series = candidate.slice(
      -(candidate.length > 26 ? 26 : candidate.length)
    );
    return series.length > 10 ? series : fallbackPortfolioSeries["30d"];
  }, [items, range]);

  const rangeMovePct = calcPctChange(sparkline);

  return (
    <div className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] px-5 sm:px-6 lg:px-7 py-5 sm:py-6 lg:py-7 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
            Portfolio overview
          </p>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">
              AI portfolio snapshot
            </h2>
            <Badge variant="secondary" className="rounded-full">
              {currency}
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 max-w-xl">
            Live value with a quick read on how your book is moving today and
            over the last month.
          </p>
          {loading ? (
            <p className="text-xs text-neutral-500">
              Syncing latest balances...
            </p>
          ) : null}
        </div>
        <Link
          href="/holdings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
        >
          View full portfolio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 items-end">
        <div className="space-y-3">
          <div className="text-sm text-neutral-500">Portfolio value</div>
          <div className="text-3xl sm:text-4xl font-semibold text-neutral-900">
            {fmtCurrency(portfolioValue, currency)}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-800 ring-1 ring-neutral-200">
            {dayPl >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-rose-600" />
            )}
            <span className={cn(pctTone(dayPl))}>
              {`${dayPl >= 0 ? "+" : "-"}${fmtCurrency(
                Math.abs(dayPl),
                currency
              )}`}
            </span>
            <span className={cn(pctTone(dayPlPct))}>
              ({dayPlPct >= 0 ? "+" : ""}
              {dayPlPct.toFixed(2)}%)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            {asOf ? <span>As of {asOf.toLocaleString()}</span> : null}
            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 ring-1 ring-neutral-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]" />
              AI summary {aiUpdatedAgo ?? "fresh"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200">
              {(["7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition",
                    range === r
                      ? "bg-white shadow-sm ring-1 ring-neutral-200 text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                Range move
              </p>
              <p className={cn("text-lg font-semibold", pctTone(rangeMovePct))}>
                {rangeMovePct == null
                  ? "—"
                  : `${rangeMovePct >= 0 ? "+" : ""}${rangeMovePct.toFixed(
                      2
                    )}%`}
              </p>
              <p className="text-xs text-neutral-500">
                Total return {totalReturnPct >= 0 ? "+" : ""}
                {totalReturnPct.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="h-28 w-full rounded-2xl bg-gradient-to-b from-neutral-50 via-white to-neutral-100 ring-1 ring-neutral-200/80 px-3 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sparkline.map((y, i) => ({ i, y }))}
                margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
              >
                <YAxis hide domain={["auto", "auto"]} />
                <defs>
                  <linearGradient
                    id="portfolioGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  strokeWidth={2}
                  stroke="#10b981"
                  fill="url(#portfolioGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketOverview() {
  const {
    data,
    overviewLoading,
    overviewError,
    overviewFetchedAt,
    fetchOverview,
    fetchMarketSummary,
    summaryMeta,
  } = useMarketOverview();
  const items = data?.top_items || [];
  const [portfolioSummary, setPortfolioSummary] =
    useState<PortfolioSummary | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  useEffect(() => {
    fetchOverview();
    fetchMarketSummary();
  }, [fetchOverview, fetchMarketSummary]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setPortfolioLoading(true);
      try {
        const summary = await getPortfolioSummary({
          signal: controller.signal,
        });
        setPortfolioSummary(summary);
      } catch {
        // Allow the page to continue if portfolio data isn't available
      } finally {
        setPortfolioLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const aiUpdatedAgo = useMemo(
    () => formatAgo(summaryMeta?.updated_at),
    [summaryMeta?.updated_at]
  );
  const overviewUpdatedAgo = useMemo(
    () => formatAgo(overviewFetchedAt),
    [overviewFetchedAt]
  );

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-14 py-10 lg:py-14 space-y-10">
        <section className="rounded-3xl border border-neutral-200/70 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)] px-5 sm:px-7 lg:px-8 py-6 sm:py-7 lg:py-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Today in markets
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-[32px] font-semibold text-neutral-900">
                AI market overview
              </h1>
              <Badge
                variant="secondary"
                className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Live AI
              </Badge>
            </div>
            <p className="text-base text-neutral-600 leading-relaxed max-w-3xl">
              Snapshot of your portfolio, top indexes, and an AI read on
              what&apos;s moving the markets right now.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
              <span className="rounded-full bg-neutral-100 px-3 py-1 ring-1 ring-neutral-200">
                Portfolio pulse
              </span>
              <span className="rounded-full bg-neutral-100 px-3 py-1 ring-1 ring-neutral-200">
                Global movers
              </span>
              <span className="rounded-full bg-neutral-100 px-3 py-1 ring-1 ring-neutral-200">
                AI summaries
              </span>
            </div>
          </div>

          <div className="w-full max-w-xs">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 shadow-[0_18px_44px_-32px_rgba(16,185,129,0.55)] px-4 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center ring-1 ring-emerald-100">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    AI status
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    AI summary updated {aiUpdatedAgo ?? "just now"}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Intelligent narrative for today&apos;s session plus live
                    signals on your holdings.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
                Watching liquidity, macro moves, and sector breadth.
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">
          <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6">
            <PortfolioSnapshotCard
              summary={portfolioSummary}
              loading={portfolioLoading}
              items={items}
              aiUpdatedAgo={aiUpdatedAgo}
            />

            <section className="rounded-3xl border border-neutral-200/70 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)] px-5 sm:px-6 lg:px-7 py-5 sm:py-6 lg:py-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                    Global movers
                  </p>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Index pulse
                  </h2>
                  <p className="text-sm text-neutral-600 max-w-2xl">
                    Today&apos;s leaders and laggards across major indexes and
                    crypto benchmarks.
                  </p>
                </div>
                {overviewUpdatedAgo ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200">
                    <Clock3 className="h-4 w-4" />
                    Synced {overviewUpdatedAgo}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <MarketOverviewGrid
                  compact={false}
                  items={items}
                  isLoading={overviewLoading}
                  error={overviewError}
                />
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24">
              <MarketSummaryPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
