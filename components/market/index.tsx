"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import MarketOverviewGrid, {
  type MarketIndexItem,
} from "./market-overview-grid";
import { useMarketOverview } from "@/hooks/use-market-overview";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";
import { MarketSummary } from "./market-summary";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MarketSummaryData } from "@/types/market-summary";
import type { ActionItem, PredictionAsset } from "@/types/portfolio-ai";

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

const truncateText = (value: string | undefined, max = 110) => {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
};

const directionToneClass = (direction?: string | null) => {
  const normalized = direction?.toLowerCase();
  if (normalized === "up") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }
  if (normalized === "down") {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
  }
  return "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200";
};

const directionIcon = (direction?: string | null) => {
  const normalized = direction?.toLowerCase();
  if (normalized === "up") return ArrowUpRight;
  if (normalized === "down") return ArrowDownRight;
  return null;
};

const formatDirectionLabel = (direction?: string | null) => {
  if (!direction) return "Neutral";
  return `${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
};

const formatExpectedChange = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.abs(value).toFixed(1)}%`;
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

type AiPredictionsActionsCardProps = {
  predictions: PredictionAsset[];
  actions: ActionItem[];
  forecastWindow?: string | null;
  loading: boolean;
  error: string | null;
};

function AiPredictionsActionsCard({
  predictions,
  actions,
  forecastWindow,
  loading,
  error,
}: AiPredictionsActionsCardProps) {
  const topPredictions = predictions.slice(0, 3);
  const topActions = actions.slice(0, 2);
  const hasContent = topPredictions.length > 0 || topActions.length > 0;
  const authError =
    error?.toLowerCase().includes("not authenticated") || error?.includes("401");

  return (
    <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.45)] px-5 sm:px-6 lg:px-7 py-5 sm:py-6 lg:py-7 space-y-4 font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="space-y-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-neutral-900">
            Predictions
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3 rounded-full" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50 px-3 py-3 text-xs text-neutral-600">
          {authError
            ? "Sign in to view AI predictions and actions."
            : "Unable to load AI predictions and actions right now."}
        </div>
      ) : !hasContent ? (
        <p className="text-sm text-neutral-600">
          No AI predictions or actions available yet.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              {forecastWindow ? (
                <span className="text-[10px] text-neutral-400">
                  Forecast window: {forecastWindow}
                </span>
              ) : null}
            </div>
            <div className="space-y-3">
              {topPredictions.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  No predictions available yet.
                </p>
              ) : (
                topPredictions.map((prediction) => {
                  const Icon = directionIcon(prediction.expected_direction);
                  const directionLabel = formatDirectionLabel(
                    prediction.expected_direction
                  );
                  return (
                    <div
                      key={prediction.symbol}
                      className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-semibold text-neutral-900">
                            {prediction.symbol}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {truncateText(prediction.rationale, 96)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
                              directionToneClass(prediction.expected_direction)
                            )}
                          >
                            {Icon ? (
                              <Icon className="mr-1 h-3.5 w-3.5 shrink-0" />
                            ) : null}
                            {directionLabel}{" "}
                            {formatExpectedChange(
                              prediction.expected_change_pct
                            )}
                          </Badge>
                          <span className="text-[11px] text-neutral-500">
                            Confidence{" "}
                            {Math.round((prediction.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="h-px bg-neutral-200/70" />

          <div className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                Actions
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-3">
              {topActions.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  No actions suggested yet.
                </p>
              ) : (
                topActions.map((action, idx) => (
                  <div
                    key={`${action.title}-${idx}`}
                    className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-neutral-900">
                        {action.title}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-600 ring-1 ring-neutral-200">
                        {action.category.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                      {truncateText(action.rationale, 90)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-neutral-600">
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-neutral-200">
                        Effort {action.effort}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-neutral-200">
                        Impact {action.impact}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-neutral-200">
                        Urgency {action.urgency}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 transition hover:text-neutral-900"
        >
          View full analytics
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
      <MarketOverviewGrid
        variant="strip"
        items={items}
        isLoading={loading}
        error={error}
      />
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
  const {
    layers,
    loading: aiLoading,
    error: aiError,
  } = usePortfolioAi();

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
  const predictions = layers?.performance?.predictions?.assets ?? [];
  const forecastWindow = layers?.performance?.predictions?.forecast_window;
  const actions = layers?.scenarios_rebalance?.actions ?? [];

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-14 py-10 lg:py-14 space-y-10">
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
              <AiPredictionsActionsCard
                predictions={predictions}
                actions={actions}
                forecastWindow={forecastWindow}
                loading={aiLoading}
                error={aiError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
