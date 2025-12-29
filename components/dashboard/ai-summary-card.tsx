"use client";

import * as React from "react";
import Link from "next/link";
import {
  Brain,
  ArrowRight,
  Loader2,
  Clock3,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";

export function AnalysisSummaryCard() {
  const { layers, meta, loading, refetching, error, refetch } =
    usePortfolioAi();

  const cached = !!meta?.cached;
  const nextIn = meta?.nextUpdateIn ?? "now";
  const canRefreshNow = meta?.canRefreshNow ?? true;

  const summaryText = layers?.summary?.summary?.split(/\n\s*\n/)[0] ?? "";
  const risks = layers?.news_sentiment?.risks_list ?? [];
  const actions = layers?.scenarios_rebalance?.actions ?? [];

  const insightItems = [
    risks[0]
      ? {
          label: "Top Risk",
          value: risks[0].risk,
          icon: AlertTriangle,
          color: "text-rose-600",
          border: "border-rose-100",
          bg: "bg-rose-50/30",
        }
      : null,
    actions[0]
      ? {
          label: "Next Action",
          value: actions[0].title,
          icon: Zap,
          color: "text-blue-600",
          border: "border-blue-100",
          bg: "bg-blue-50/30",
        }
      : null,
  ].filter(Boolean);

  const hasData = Boolean(summaryText) || insightItems.length > 0;

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Decorative AI Background Element */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-emerald-50/50 blur-3xl" />

      <CardHeader className="relative z-10 border-b border-neutral-100 bg-white/50 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 shadow-lg shadow-neutral-200">
              <Brain
                className={cn(
                  "h-5 w-5 text-white",
                  refetching && "animate-pulse"
                )}
              />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900">
                Portfolio Intelligence
              </CardTitle>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-tighter">
                Powered by Gemini 1.5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors",
                refetching
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-neutral-50 text-neutral-500 border-neutral-100"
              )}
            >
              {refetching ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : (
                <Clock3 className="mr-1.5 h-3 w-3" />
              )}
              {refetching
                ? "Analyzing..."
                : cached
                ? `Update: ${nextIn}`
                : "Live Analysis"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-6">
        {loading && !hasData ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-neutral-50 p-4">
              <Sparkles className="h-8 w-8 text-neutral-300" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              No Analysis Available
            </h3>
            <p className="mt-1 text-xs text-neutral-500 max-w-[240px]">
              Connect your accounts to generate AI-driven portfolio insights.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl"
            >
              Generate Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Summary */}
            <div className="group relative rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 transition-colors hover:bg-emerald-50/40">
              <Sparkles className="absolute right-4 top-4 h-4 w-4 text-emerald-500/30 transition-transform group-hover:scale-110" />
              <p className="text-sm leading-relaxed font-medium text-neutral-800">
                {summaryText}
              </p>
            </div>

            {/* Quick Insights Grid */}
            {insightItems.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {insightItems.map((item: any) => (
                  <div
                    key={item.label}
                    className={cn(
                      "group flex flex-col justify-between rounded-2xl border p-4 transition-all hover:shadow-sm",
                      item.border,
                      item.bg
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
              <Button
                asChild
                className="rounded-xl px-5 shadow-sm transition-transform active:scale-95"
              >
                <Link href="/analytics" className="flex items-center gap-2">
                  View Full Report <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch(false)}
                disabled={refetching || !canRefreshNow}
                className="text-neutral-400 hover:text-neutral-900 hover:bg-transparent"
              >
                <RefreshCw
                  className={cn(
                    "mr-2 h-3.5 w-3.5 transition-transform",
                    refetching && "animate-spin"
                  )}
                />
                <span className="text-xs font-semibold">Refresh Insights</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
