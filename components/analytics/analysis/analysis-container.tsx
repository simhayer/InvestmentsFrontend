// components/ai-insights/AnalysisContainer.tsx
"use client";

import * as React from "react";
import { RefreshCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";

import { SummaryTab } from "./tabs/SummaryTab";
import { PortfolioMetricsTab } from "./tabs/PortfolioMetricsTab";
import { PositionsTab } from "./tabs/PositionsTab";
import { PredictionsTab } from "./tabs/PredictionsTab";
import { NewsSentimentTab } from "./tabs/NewsSentimentTab";
import { CatalystsTab } from "./tabs/CatalystsTab";
import { RisksTab } from "./tabs/RisksTab";
import { ActionsTab } from "./tabs/ActionsTab";
import { ScenariosTab } from "./tabs/ScenariosTab";
import { MarketOutlookTab } from "./tabs/MarketOutlookTab";
import { RebalancePathsTab } from "./tabs/RebalancePathsTab";
import { LatestDevelopmentsTab } from "./tabs/LatestDevelopmentsTab";

const TAB_LIST = [
  { key: "summary", label: "Summary" },
  { key: "metrics", label: "Metrics" },
  { key: "positions", label: "Positions" },
  { key: "predictions", label: "Predictions" },
  { key: "news", label: "News" },
  { key: "catalysts", label: "Catalysts" },
  { key: "risks", label: "Risks" },
  { key: "actions", label: "Actions" },
  { key: "scenarios", label: "Scenarios" },
  { key: "outlook", label: "Outlook" },
  { key: "rebalance", label: "Rebalance" },
  { key: "developments", label: "Latest" },
] as const;

type TabKey = (typeof TAB_LIST)[number]["key"];

export function AnalysisContainer() {
  const { analysis, meta, loading, error, refetching, refetch } =
    usePortfolioAi();
  const data = analysis;
  const [active, setActive] = React.useState<TabKey>("summary");

  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setLeft] = React.useState(false);
  const [canScrollRight, setRight] = React.useState(false);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const check = () => {
      setLeft(el.scrollLeft > 0);
      setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dx: number) =>
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  if (!data && loading) {
    return (
      <div className="rounded-2xl border p-3 sm:p-4 text-sm text-muted-foreground">
        Loading AI insights…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border p-3 sm:p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }
  if (!data) return null;

  const cached = !!meta?.cached;
  const nextUpdateIn = meta?.nextUpdateIn ?? "now";
  const canRefreshNow = meta?.canRefreshNow ?? true;
  const showForce = meta?.showForce ?? false;

  return (
    <div className="w-full space-y-4 md:space-y-5">
      {/* Header & controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
            Portfolio AI Insights
          </p>
          <p className="text-sm text-slate-600">
            Multi-layer view across summary, metrics, risks, and actions
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {cached && (
              <Badge variant="outline">Cached • next in {nextUpdateIn}</Badge>
            )}
            {refetching && (
              <Badge variant="secondary" className="gap-1">
                Refreshing…
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading || refetching || !canRefreshNow}
            onClick={() => refetch(false)}
            title={
              !canRefreshNow
                ? `Next automatic refresh in ${nextUpdateIn}`
                : "Refresh now"
            }
              className="gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>

          {showForce && (
            <Button
              size="sm"
              variant="ghost"
              disabled={loading || refetching}
              onClick={() => refetch(true)}
              title="Force recompute (bypass daily limit)"
              className="gap-1"
            >
              <Zap className="h-4 w-4 text-yellow-500" />
              Force
            </Button>
          )}
        </div>
      </div>

      {/* Tabs header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
              Navigate layers
            </p>
            <p className="text-sm text-slate-600">
              Scrollable tabs for all insights
            </p>
          </div>
          <div className="hidden text-xs text-slate-500 sm:inline">
            {meta?.updatedAt ? `Updated ${meta.updatedAt}` : ""}
          </div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              aria-label="Scroll tabs left"
              onClick={() => scrollBy(-200)}
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-40"
              disabled={!canScrollLeft}
            >
              ←
            </button>
            <div
              ref={scrollerRef}
              className="flex-1 overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch] scroll-smooth"
              role="tablist"
              aria-label="AI Insights tabs"
            >
              <div className="flex min-w-max gap-1 rounded-xl bg-slate-50/80 p-1">
                {TAB_LIST.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={active === t.key}
                    onClick={() => setActive(t.key)}
                    className={
                      "px-3 py-2 rounded-lg text-sm whitespace-nowrap transition border" +
                      (active === t.key
                        ? " bg-white text-slate-900 shadow-sm border-slate-200"
                        : " bg-transparent text-slate-600 hover:bg-white/70 border-transparent")
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              aria-label="Scroll tabs right"
              onClick={() => scrollBy(200)}
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-40"
              disabled={!canScrollRight}
            >
              →
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
        {active === "summary" && <SummaryTab data={data.ai_layers.summary} />}
        {active === "metrics" && (
          <PortfolioMetricsTab data={data.ai_layers.metrics} />
        )}
        {active === "positions" && <PositionsTab data={data.ai_layers} />}
        {active === "predictions" && (
          <PredictionsTab data={data.ai_layers.performance} />
        )}
        {active === "news" && (
          <NewsSentimentTab data={data.ai_layers.news_sentiment} />
        )}
        {active === "catalysts" && (
          <CatalystsTab data={data.ai_layers.news_sentiment.catalysts} />
        )}
        {active === "risks" && (
          <RisksTab data={data.ai_layers.news_sentiment.risks_list} />
        )}
        {active === "actions" && (
          <ActionsTab data={data.ai_layers.scenarios_rebalance.actions} />
        )}
        {active === "scenarios" && (
          <ScenariosTab data={data.ai_layers.scenarios_rebalance.scenarios} />
        )}
        {active === "outlook" && (
          <MarketOutlookTab
            data={data.ai_layers.scenarios_rebalance.market_outlook}
          />
        )}
        {active === "rebalance" && (
          <RebalancePathsTab
            data={data.ai_layers.scenarios_rebalance.rebalance_paths}
          />
        )}
        {active === "developments" && (
          <LatestDevelopmentsTab
            data={data.ai_layers.news_sentiment.latest_developments}
          />
        )}
      </div>
    </div>
  );
}
