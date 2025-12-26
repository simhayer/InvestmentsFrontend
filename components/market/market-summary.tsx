// components/markets/market-summary.tsx
"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useMarketOverview } from "@/hooks/use-market-overview";
import { fmtAsOf } from "@/utils/format";
import { MarketSummaryData } from "@/types/market-summary";

type MarketSummaryProps = {
  data: MarketSummaryData;
  /** Optional refresh handler to show a refresh button in header */
  refreshing?: boolean;
  updatedAgo?: string | null;
};

const summarySurface =
  "rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)]";
const labelCaps =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500";
const summaryMinHeight = "lg:min-h-[640px]";

export function MarketSummary({
  data,
  refreshing,
  updatedAgo,
}: MarketSummaryProps) {
  const asOfDisplay = fmtAsOf(data?.as_of);

  if (!data || !data.sections?.length) {
    return (
      <div
        className={`${summarySurface} p-5 sm:p-6 lg:p-7 space-y-3 ${summaryMinHeight} font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            AI market summary
          </h2>
          {data?.market ? (
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              {data.market}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-neutral-600">No summary available.</p>
      </div>
    );
  }

  return (
    <div
      className={[
        summarySurface,
        `p-5 sm:p-6 lg:p-7 space-y-5 ${summaryMinHeight} flex flex-col h-full font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]`,
      ].join(" ")}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-[22px] font-semibold text-neutral-900 leading-tight">
                Today&apos;s AI read
              </h2>
              {data.market ? (
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs shadow-sm"
                >
                  {data.market}
                </Badge>
              ) : null}
            </div>
            {asOfDisplay ? (
              <span className="text-xs text-neutral-500">
                As of {asOfDisplay}
              </span>
            ) : null}
          </div>
          <div className="space-y-2 text-right">
            {refreshing ? (
              <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-500">
                Refreshing...
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.sections.map((s, idx) => {
          const key = `${s.headline ?? "section"}-${idx}`;
          return (
            <Card
              key={key}
              className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 shadow-sm transition-colors hover:border-neutral-200"
            >
              <CardHeader className="px-4 sm:px-5 pt-4 pb-1 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base leading-6 text-neutral-900">
                      {s.headline}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 sm:px-5 pb-5 pt-1 space-y-3 text-sm leading-relaxed text-neutral-800">
                {s.cause ? (
                  <div className="space-y-1">
                    <div className={labelCaps}>What&apos;s happening</div>
                    <p className="whitespace-pre-wrap text-neutral-700">
                      {s.cause}
                    </p>
                  </div>
                ) : null}

                {s.impact ? (
                  <div className="space-y-1">
                    <div className={labelCaps}>Why it matters</div>
                    <p className="whitespace-pre-wrap text-neutral-800">
                      {s.impact}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function MarketSummaryPanel() {
  const { summary, loading, error, fetchMarketSummary, summaryMeta } =
    useMarketOverview();

  const { updated_at } = summaryMeta || {};
  const updatedAgo = React.useMemo(() => {
    if (!updated_at) return null;
    const t = new Date(updated_at).getTime();
    const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
    return `${mins}m ago`;
  }, [updated_at]);

  React.useEffect(() => {
    fetchMarketSummary();
  }, [fetchMarketSummary]);

  if (loading) {
    return (
      <div
        className={`${summarySurface} p-5 sm:p-6 lg:p-7 space-y-4 ${summaryMinHeight} font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-6 w-40 rounded-full" />
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
        <Alert variant="destructive" className="rounded-2xl border border-rose-200">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            {error}
            <Button
              onClick={fetchMarketSummary}
              variant="secondary"
              size="sm"
              className="w-fit"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
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
        <h2 className="text-xl font-semibold text-neutral-900">
          AI market summary
        </h2>
        <p className="text-sm text-neutral-600">No summary available.</p>
      </div>
    );
  }

  return (
    <MarketSummary
      data={summary}
      refreshing={loading}
      updatedAgo={updatedAgo}
    />
  );
}
