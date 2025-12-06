"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Loader2, Clock3, Sparkles } from "lucide-react";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AnalysisSummaryCard() {
  const { data, meta, loading, refetching, error, refetch } = usePortfolioAi(7);

  const total =
    (data?.latest_developments?.length ?? 0) +
    (data?.catalysts?.length ?? 0) +
    (data?.actions?.length ?? 0) +
    (data?.risks_list?.length ?? 0);

  const cached = !!meta?.cached;
  const nextIn = meta?.nextUpdateIn ?? "now";
  const canRefreshNow = meta?.canRefreshNow ?? true;
  const showForce = meta?.showForce ?? false;

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.08),transparent_34%),radial-gradient(circle_at_88%_0%,rgba(59,130,246,0.08),transparent_28%)]" />
      <CardHeader className="relative space-y-3 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
              <Brain className="h-4 w-4" />
              AI
            </div>
            <CardTitle className="text-xl font-semibold text-neutral-900">
              AI portfolio analysis
            </CardTitle>
            <CardDescription className="text-sm text-neutral-700">
              Daily insights on risks, catalysts, and actions for your holdings.
            </CardDescription>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge
              loading={refetching}
              cached={cached}
              nextIn={nextIn}
            />
            {typeof total === "number" && total > 0 ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {total} insights
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 ring-1 ring-neutral-200">
            <Clock3 className="h-4 w-4 text-neutral-500" />
            {cached ? `Cached • next in ${nextIn}` : "Live"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
            <Sparkles className="h-4 w-4" />
            AI active
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {error ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-rose-600">{error}</div>
            <Button
              onClick={() => refetch(false)}
              disabled={loading || refetching}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Retry
            </Button>
          </div>
        ) : total === 0 && !loading ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-neutral-800 ring-1 ring-neutral-200">
                <Brain className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-neutral-900">
                  No insights yet
                </div>
                <p className="text-sm text-neutral-600">
                  Run your first analysis to unlock AI guidance on your portfolio.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => refetch(false)}
                disabled={loading || refetching || !canRefreshNow}
                className="gap-1"
              >
                Analyze my portfolio <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              {showForce && (
                <Button
                  onClick={() => refetch(true)}
                  disabled={loading || refetching}
                  variant="ghost"
                  className="text-neutral-800 hover:bg-neutral-100"
                >
                  Force run
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 text-sm text-neutral-800 shadow-inner">
              {data?.summary ||
                "Your portfolio has been analyzed. View the full report for details."}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/analytics" className="mr-auto">
                <Button className="gap-1">
                  View full analysis <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => refetch(false)}
                disabled={loading || refetching || !canRefreshNow}
                className="text-neutral-800 hover:bg-neutral-100"
              >
                Refresh
              </Button>
              {showForce && (
                <Button
                  onClick={() => refetch(true)}
                  disabled={loading || refetching}
                  variant="ghost"
                  className="text-neutral-800 hover:bg-neutral-100"
                >
                  Force run
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  loading,
  cached,
  nextIn,
}: {
  loading: boolean;
  cached: boolean;
  nextIn: string;
}) {
  if (loading) {
    return (
      <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Updating…
      </Badge>
    );
  }

  if (cached) {
    return (
      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
        Cached • next in {nextIn}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-3 py-1 text-xs",
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      )}
    >
      Fresh
    </Badge>
  );
}
