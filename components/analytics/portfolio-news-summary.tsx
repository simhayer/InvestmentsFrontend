"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCcw,
  ArrowUpRight,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortfolioSummary } from "@/hooks/use-portfolio-summary";

export function PortfolioNewsSummary({
  symbols,
  daysBack = 7,
}: {
  symbols: string[];
  daysBack?: number;
}) {
  const { loading, data, error, fetchSummary } = usePortfolioSummary();

  useEffect(() => {
    if (symbols?.length) fetchSummary(symbols, daysBack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(symbols), daysBack]);

  const sentiment = data?.sentiment ?? 0;
  const sentimentColor =
    sentiment > 0.15
      ? "bg-emerald-100 text-emerald-900 border-emerald-200"
      : sentiment < -0.15
      ? "bg-rose-100 text-rose-900 border-rose-200"
      : "bg-amber-50 text-amber-900 border-amber-200";

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              This week’s portfolio brief
            </CardTitle>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              This week’s portfolio brief
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchSummary(symbols, daysBack)}
            >
              <RefreshCcw className="h-4 w-4 mr-1" /> Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Couldn’t load the summary. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">This week’s portfolio brief</CardTitle>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
              sentimentColor
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Sentiment {sentiment.toFixed(2)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        {data.summary ? (
          <p className="text-sm leading-relaxed">{data.summary}</p>
        ) : null}

        {/* Highlights / Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold mb-1.5">Highlights</div>
            <ul className="space-y-1.5">
              {(data.highlights || []).map((h, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <ArrowUpRight className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                  <span className="text-muted-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold mb-1.5">Risks</div>
            <ul className="space-y-1.5">
              {(data.risks || []).map((r, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-symbol notes */}
        {data.per_symbol && Object.keys(data.per_symbol).length > 0 ? (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold">Per holding</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(data.per_symbol).map(([sym, note]) => (
                <div
                  key={sym}
                  className="text-sm border rounded-md p-2 bg-background"
                >
                  <div className="mb-1 font-medium">{sym}</div>
                  <div className="text-muted-foreground">{note}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Sources */}
        {data.sources && data.sources.length > 0 ? (
          <div className="pt-1">
            <div className="text-xs font-semibold mb-1.5">Sources</div>
            <div className="flex flex-wrap gap-2">
              {data.sources.slice(0, 6).map((u) => (
                <a
                  key={u}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-muted-foreground hover:text-foreground truncate max-w-[18rem]"
                  title={u}
                >
                  {u}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {/* Refresh */}
        <div className="pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchSummary(symbols, daysBack)}
          >
            <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
