// components/markets/market-summary.tsx
"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useMarketOverview } from "@/hooks/use-market-overview";
import { fmtAsOf } from "@/utils/format";
import { MarketSummaryData } from "@/types/market-summary";

function hostFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type MarketSummaryProps = {
  data: MarketSummaryData;
  /** Optional refresh handler to show a refresh button in header */
  refreshing?: boolean;
  updatedAgo?: string | null;
};

export function MarketSummary({
  data,
  refreshing,
  updatedAgo,
}: MarketSummaryProps) {
  const asOfDisplay = fmtAsOf(data?.as_of);

  if (!data || !data.sections?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No summary available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium">Market Summary</h2>
          {data.market ? (
            <Badge variant="secondary">{data.market}</Badge>
          ) : null}
          {updatedAgo && (
            <span className="text-xs text-muted-foreground">
              Updated {updatedAgo}m ago
            </span>
          )}
        </div>
      </div>

      {/* Sections card */}
      <Card className="rounded-xl border">
        {data.sections.map((s, idx) => {
          const key = `${s.headline ?? "section"}-${idx}`;
          return (
            <div
              key={key}
              className="rounded-none border-b last:border-0 transition-colors hover:bg-muted/30"
            >
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-base leading-6">
                  {s.headline}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-sm text-muted-foreground space-y-3 px-3 pb-4">
                {/* Cause → Impact */}
                {(s.cause || s.impact) && (
                  <div className="space-y-1.5">
                    {s.cause ? (
                      <div className="leading-6">
                        <span className="font-medium text-foreground">
                          Cause
                        </span>
                        <span className="mx-1 text-foreground/60">→</span>
                        <span className="whitespace-pre-wrap">{s.cause}</span>
                      </div>
                    ) : null}

                    {s.impact ? (
                      <div className="leading-6">
                        <span className="font-medium text-foreground">
                          Impact
                        </span>
                        <span className="mx-1 text-foreground/60">→</span>
                        <span className="whitespace-pre-wrap">{s.impact}</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Affected assets */}
                {/* {s.affected_assets?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {s.affected_assets.map((a) => (
                      <Badge key={a} variant="outline" className="font-normal">
                        {a}
                      </Badge>
                    ))}
                  </div>
                ) : null} */}

                {/* Sources */}
                {/* {s.sources?.length ? (
                  <div className="pt-1">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground/70 mb-1">
                      Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.sources.map((url, i) => (
                        <a
                          key={`${url}-${i}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                          title={url}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {hostFromUrl(url)}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null} */}
              </CardContent>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

export function MarketSummaryPanel() {
  const {
    summary,
    loading,
    error,
    fetchMarketSummary,
    summaryFetchedAt,
    summaryMeta,
  } = useMarketOverview();

  const { updated_at, generated_at } = summaryMeta || {};
  const updatedAgo = React.useMemo(() => {
    if (!updated_at) return null;
    const t = new Date(updated_at).getTime();
    const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
    return `${mins}m ago`;
  }, [updated_at]);

  React.useEffect(() => {
    // initial load
    fetchMarketSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-xl">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
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
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No summary available.
        </CardContent>
      </Card>
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
