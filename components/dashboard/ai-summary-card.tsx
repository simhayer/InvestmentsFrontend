"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Loader2, Clock3, Sparkles } from "lucide-react";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";
import Link from "next/link";
import { catalystsSorted, latestSorted } from "@/utils/aiService";

export function AnalysisSummaryCard() {
  const { layers, meta, loading, refetching, error, refetch } =
    usePortfolioAi();

  const cached = !!meta?.cached;
  const nextIn = meta?.nextUpdateIn ?? "now";
  const canRefreshNow = meta?.canRefreshNow ?? true;
  const showForce = meta?.showForce ?? false;
  const summaryText = layers?.summary?.summary
    ? layers.summary.summary.split(/\n\s*\n/)[0]
    : "";
  const risks = layers?.news_sentiment?.risks_list ?? [];
  const actions = layers?.scenarios_rebalance?.actions ?? [];
  const catalysts = layers?.news_sentiment?.catalysts ?? [];
  const developments = layers?.news_sentiment?.latest_developments ?? [];
  const topCatalyst = catalystsSorted(catalysts)[0];
  const topDevelopment = latestSorted(developments)[0];

  const insightItems = [
    risks[0]
      ? {
          label: "Top risk",
          value: risks[0].risk,
          meta: risks[0].assets_affected?.slice(0, 2).join(", "),
        }
      : null,
    actions[0]
      ? {
          label: "Suggested action",
          value: actions[0].title,
          meta: `Impact: ${actions[0].impact}, Urgency: ${actions[0].urgency}`,
        }
      : null,
    topCatalyst
      ? {
          label: "Catalyst",
          value: `${topCatalyst.type.toUpperCase()} - ${topCatalyst.date}`,
          meta: topCatalyst.description,
        }
      : null,
    topDevelopment
      ? {
          label: "Latest",
          value: topDevelopment.headline,
          meta: `${topDevelopment.source} - ${topDevelopment.date}`,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; meta?: string }>;
  const hasInsights = Boolean(summaryText) || insightItems.length > 0;

  return (
    <Card
      className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.45)] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]"
      data-tour-id="tour-ai-card"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.08),transparent_34%),radial-gradient(circle_at_88%_0%,rgba(59,130,246,0.08),transparent_28%)]" />
      <CardHeader className="relative space-y-2 pb-3 sm:pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-neutral-900">
            AI portfolio analysis
          </CardTitle>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100/80 px-3 py-1 ring-1 ring-neutral-200/70">
            {refetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-500" />
            ) : (
              <Clock3 className="h-4 w-4 text-neutral-500" />
            )}
            {refetching
              ? "Updating…"
              : cached
              ? `Cached • next in ${nextIn}`
              : "Live"}
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
        ) : !hasInsights && !loading ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-neutral-800 ring-1 ring-neutral-200">
                <Brain className="h-5 w-5" />
              </div>
              <p className="text-sm text-neutral-700">
                No insights yet. Run an analysis to generate AI guidance.
              </p>
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
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3 text-sm text-neutral-800 shadow-inner">
              {summaryText ||
                "Your portfolio has been analyzed. View the full report for details."}
            </div>
            {insightItems.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {insightItems.map((item) => (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-2xl border border-neutral-200/80 bg-white/80 p-3"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {item.label}
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-neutral-900">
                      {item.value}
                    </div>
                    {item.meta ? (
                      <div className="mt-1 truncate text-xs text-neutral-600">
                        {item.meta}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/analytics" className="mr-auto">
                <Button className="gap-1">
                  Analyze my portfolio <ArrowRight className="h-3.5 w-3.5" />
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
