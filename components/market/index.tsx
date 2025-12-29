"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMarketOverview } from "@/hooks/use-market-overview";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";
import MarketOverviewGrid from "./market-overview-grid";
import { TodayAiReadCard } from "./today-ai-read-card";
import { ActionsSidebar } from "./actions-sidebar";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Page } from "@/components/layout/Page";
import { cn } from "@/lib/utils";

// Optimized utility for time formatting
const formatAgo = (input?: Date | string | null) => {
  if (!input) return null;
  const ts =
    input instanceof Date ? input.getTime() : new Date(input).getTime();
  if (isNaN(ts)) return null;
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
};

export default function MarketOverviewPage() {
  const {
    data,
    overviewLoading,
    overviewError,
    fetchOverview,
    fetchMarketSummary,
    summary,
    summaryLoading,
    summaryError,
    summaryMeta,
  } = useMarketOverview();

  const { layers, loading: aiLoading, error: aiError } = usePortfolioAi();

  useEffect(() => {
    fetchOverview();
    fetchMarketSummary();
  }, [fetchOverview, fetchMarketSummary]);

  const aiUpdatedAgo = useMemo(
    () => formatAgo(summaryMeta?.updated_at),
    [summaryMeta?.updated_at]
  );
  const predictions = layers?.performance?.predictions?.assets ?? [];
  const actions = layers?.scenarios_rebalance?.actions ?? [];

  return (
    <Page className="max-w-[1400px] mx-auto space-y-8">
      {/* 1. TOP MARKET STRIP */}
      <section>
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Market Pulse
          </h2>
          {overviewLoading && <Skeleton className="h-4 w-20" />}
        </div>
        <MarketOverviewGrid
          variant="strip"
          items={data?.top_items || []}
          isLoading={overviewLoading}
          error={overviewError}
        />
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-12 gap-6 lg:gap-10">
        {/* LEFT COLUMN: AI READ */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <TodayAiReadCard
            summary={summary}
            loading={summaryLoading}
            error={summaryError}
            updatedAgo={aiUpdatedAgo}
            onRetry={fetchMarketSummary}
          />
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <AiStatusCard updatedAgo={aiUpdatedAgo} />

          <PredictionsSidebar
            predictions={predictions}
            loading={aiLoading}
            error={aiError}
            window={layers?.performance?.predictions?.forecast_window}
          />

          <ActionsSidebar actions={actions} loading={aiLoading} />
        </aside>
      </div>
    </Page>
  );
}

// --- Sub-components (AiStatusCard, etc.) ---

function AiStatusCard({ updatedAgo }: { updatedAgo?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-neutral-900 leading-none">
            AI Signals Active
          </p>
          <p className="text-[11px] text-neutral-500 font-medium">
            Updated {updatedAgo ?? "just now"}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Real-time Monitoring
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionsSidebar({ predictions, loading, error, window }: any) {
  if (loading) return <Skeleton className="h-[300px] w-full rounded-[28px]" />;

  return (
    <div className="rounded-[28px] border border-neutral-200/80 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">
            Top Predictions
          </h3>
          <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
            {window || "Short term"}
          </p>
        </div>
        <Link
          href="/analytics"
          className="text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {predictions.slice(0, 3).map((p: any) => (
          <div key={p.symbol} className="group cursor-default">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-800 group-hover:text-black transition-colors">
                {p.symbol}
              </span>
              <Badge
                className={cn(
                  "rounded-md text-[10px] px-1.5 py-0 border-none shadow-none",
                  p.expected_direction === "up"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {p.expected_direction === "up" ? "+" : "-"}
                {p.expected_change_pct}%
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={p.confidence * 100}
                className="h-1 flex-1 bg-neutral-100"
              />
              <span className="text-[10px] font-bold text-neutral-400 w-8 text-right">
                {Math.round(p.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
