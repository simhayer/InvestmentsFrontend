"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import MarketOverviewGrid, {
  type MarketIndexItem,
} from "./market-overview-grid";
import { useMarketOverview } from "@/hooks/use-market-overview";
import { MarketSummary } from "./market-summary";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MarketSummaryData } from "@/types/market-summary";

const summarySurface =
  "rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)]";
const summaryMinHeight = "lg:min-h-[640px]";

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

const pctTone = (v?: number | null) => {
  if (v == null) return "text-neutral-500";
  if (v > 0) return "text-emerald-600";
  if (v < 0) return "text-rose-600";
  return "text-neutral-600";
};

type SnapshotSignalTone = "positive" | "negative" | "neutral" | "warning";

type SnapshotSignal = {
  label: string;
  tone: SnapshotSignalTone;
};

type TopStockSnapshot = {
  symbol: string;
  name: string;
  signals: SnapshotSignal[];
  movePct: number;
  moveLabel: string;
};

const TOP_STOCKS_SNAPSHOT: TopStockSnapshot[] = [
  {
    symbol: "AAPL",
    name: "Apple",
    signals: [
      { label: "Bullish", tone: "positive" },
      { label: "Momentum", tone: "positive" },
    ],
    movePct: 1.4,
    moveLabel: "1D",
  },
  {
    symbol: "NVDA",
    name: "Nvidia",
    signals: [
      { label: "Overweight", tone: "neutral" },
      { label: "High risk", tone: "warning" },
    ],
    movePct: -0.8,
    moveLabel: "1D",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    signals: [
      { label: "Steady", tone: "neutral" },
      { label: "Quality", tone: "positive" },
    ],
    movePct: 12.2,
    moveLabel: "YTD",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    signals: [
      { label: "Volatile", tone: "warning" },
      { label: "Speculative", tone: "negative" },
    ],
    movePct: -9.6,
    moveLabel: "YTD",
  },
];

const signalToneClass = (tone: SnapshotSignalTone) => {
  switch (tone) {
    case "positive":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    case "negative":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
    case "warning":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    default:
      return "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200";
  }
};

type TodayAiReadCardProps = {
  summary: MarketSummaryData | null;
  loading: boolean;
  error: string | null;
  updatedAgo?: string | null;
  onRetry: () => void;
};

function TodayAiReadCard({
  summary,
  loading,
  error,
  updatedAgo,
  onRetry,
}: TodayAiReadCardProps) {
  if (loading) {
    return (
      <div
        className={`${summarySurface} p-5 sm:p-6 lg:p-7 space-y-4 ${summaryMinHeight} font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-7 w-48 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-neutral-200/70 bg-white/80 shadow-sm"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 rounded-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${summarySurface} p-5 sm:p-6 lg:p-7 ${summaryMinHeight} font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]`}
      >
        <Alert variant="destructive" className="rounded-2xl border-rose-200">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            {error}
            <Button
              onClick={onRetry}
              variant="secondary"
              size="sm"
              className="w-fit"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!summary) {
    return (
      <div
        className={`${summarySurface} p-5 sm:p-6 lg:p-7 space-y-2 ${summaryMinHeight} font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]`}
      >
        <h2 className="text-2xl sm:text-[22px] font-semibold text-neutral-900 leading-tight">
          Today&apos;s AI read
        </h2>
        <p className="text-sm text-neutral-600">No summary available.</p>
      </div>
    );
  }

  return (
    <MarketSummary data={summary} refreshing={loading} updatedAgo={updatedAgo} />
  );
}

type AiStatusCardProps = {
  updatedAgo?: string | null;
};

function AiStatusCard({ updatedAgo }: AiStatusCardProps) {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 shadow-[0_18px_44px_-32px_rgba(16,185,129,0.5)] px-5 py-5 space-y-4 font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center ring-1 ring-emerald-100">
          <Sparkles className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            AI status
          </p>
          <p className="text-sm font-semibold text-neutral-900">
            AI read updated {updatedAgo ?? "just now"}
          </p>
          <p className="text-xs text-neutral-600">
            Monitoring macro shifts, liquidity, and sector breadth for today&apos;s
            session.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
        Live signals running across top sectors and AI momentum.
      </div>
    </section>
  );
}

type AiTopStocksSnapshotProps = {
  items?: TopStockSnapshot[];
};

function AiTopStocksSnapshot({ items = TOP_STOCKS_SNAPSHOT }: AiTopStocksSnapshotProps) {
  const pathname = usePathname();
  const symbolBase = pathname?.startsWith("/dashboard")
    ? "/dashboard/symbol"
    : "/investment";

  return (
    <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.45)] px-5 sm:px-6 lg:px-7 py-5 sm:py-6 lg:py-7 space-y-4 font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
          AI snapshot
        </p>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-neutral-900">
            Today&apos;s top stocks
          </h3>
          <p className="text-xs text-neutral-600">
            Quick highlights from our AI analytics to keep you in the loop.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-600">
            No AI stock snapshots available right now.
          </p>
        ) : (
          items.map((stock) => (
            <Link
              key={stock.symbol}
              href={`${symbolBase}/${encodeURIComponent(stock.symbol)}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200/70 bg-neutral-50/70 px-3 py-3 transition hover:border-neutral-200 hover:bg-white"
            >
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">
                    {stock.symbol}
                  </span>
                  <span className="text-xs text-neutral-500 truncate">
                    {stock.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {stock.signals.map((signal) => (
                    <Badge
                      key={`${stock.symbol}-${signal.label}`}
                      variant="secondary"
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        signalToneClass(signal.tone)
                      )}
                    >
                      {signal.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    {stock.movePct >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
                    )}
                    <span
                      className={cn("text-sm font-semibold", pctTone(stock.movePct))}
                    >
                      {stock.movePct >= 0 ? "+" : ""}
                      {stock.movePct.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                    {stock.moveLabel}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 transition group-hover:text-neutral-600" />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

type IndexPulseProps = {
  items: MarketIndexItem[];
  loading: boolean;
  error: string | null;
  updatedAgo?: string | null;
};

function IndexPulse({ items, loading, error, updatedAgo }: IndexPulseProps) {
  return (
    <section className="rounded-3xl border border-neutral-200/70 bg-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)] px-5 sm:px-6 lg:px-7 py-4 sm:py-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Global movers
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
            Index pulse
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl">
            Today&apos;s leaders and laggards across major indexes and crypto
            benchmarks.
          </p>
        </div>
        {updatedAgo ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200">
            <Clock3 className="h-4 w-4" />
            Synced {updatedAgo}
          </div>
        ) : null}
      </div>

      <MarketOverviewGrid
        variant="strip"
        items={items}
        isLoading={loading}
        error={error}
      />

      <div className="flex justify-end">
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 transition hover:text-neutral-900"
        >
          View full market details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

export default function MarketOverviewPage() {
  const {
    data,
    overviewLoading,
    overviewError,
    overviewFetchedAt,
    fetchOverview,
    fetchMarketSummary,
    summary,
    summaryLoading,
    summaryError,
    summaryMeta,
  } = useMarketOverview();

  useEffect(() => {
    fetchOverview();
    fetchMarketSummary();
  }, [fetchOverview, fetchMarketSummary]);

  const items = data?.top_items || [];
  const aiUpdatedAgo = useMemo(
    () => formatAgo(summaryMeta?.updated_at),
    [summaryMeta?.updated_at]
  );
  const overviewUpdatedAgo = useMemo(
    () => formatAgo(overviewFetchedAt),
    [overviewFetchedAt]
  );
  const headerUpdated = aiUpdatedAgo ?? overviewUpdatedAgo;

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-14 py-10 lg:py-14 space-y-10">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Today in markets
            </p>
            <h1 className="text-3xl sm:text-[32px] font-semibold text-neutral-900">
              AI market overview
            </h1>
            <p className="text-base text-neutral-600 leading-relaxed max-w-2xl">
              AI-generated read on what&apos;s moving the markets right now.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]" />
            {headerUpdated ? `Updated ${headerUpdated}` : "Live AI"}
          </div>
        </header>

        <IndexPulse
          items={items}
          loading={overviewLoading}
          error={overviewError}
          updatedAgo={overviewUpdatedAgo}
        />

        <div className="grid grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">
          <div className="col-span-12 lg:col-span-8 order-2 lg:order-1">
            <TodayAiReadCard
              summary={summary}
              loading={summaryLoading}
              error={summaryError}
              updatedAgo={aiUpdatedAgo}
              onRetry={fetchMarketSummary}
            />
          </div>

          <div className="contents lg:col-span-4 lg:order-2 lg:flex lg:flex-col lg:gap-6">
            <div className="col-span-12 order-1 lg:order-1">
              <AiStatusCard updatedAgo={aiUpdatedAgo} />
            </div>
            <div className="col-span-12 order-3 lg:order-2">
              <AiTopStocksSnapshot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
