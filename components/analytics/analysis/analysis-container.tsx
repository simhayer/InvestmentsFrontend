// components/ai-insights/AnalysisContainer.tsx
"use client";

import * as React from "react";
import { RefreshCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  const tabRefs = React.useRef<Record<TabKey, HTMLButtonElement | null>>(
    {} as Record<TabKey, HTMLButtonElement | null>
  );
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const sync = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, []);

  const scrollTabIntoView = (key: TabKey) => {
    const btn = tabRefs.current[key];
    const container = scrollerRef.current;
    if (btn && container) {
      btn.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  };

  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = TAB_LIST.findIndex((t) => t.key === active);
    if (idx === -1) return;
    const nextIdx =
      e.key === "ArrowLeft"
        ? Math.max(0, idx - 1)
        : Math.min(TAB_LIST.length - 1, idx + 1);
    const next = TAB_LIST[nextIdx];
    if (next) {
      setActive(next.key);
      scrollTabIntoView(next.key);
      tabRefs.current[next.key]?.focus({ preventScroll: false });
    }
  };

  React.useEffect(() => {
    scrollTabIntoView(active);
  }, [active]);

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
    <div className="w-full space-y-5 sm:space-y-6 lg:space-y-7">
      {/* Hero */}
      <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-7 lg:py-7">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Portfolio AI Insights
            </p>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-[26px] font-semibold leading-tight text-neutral-900">
                Multi-layer view across summary, metrics, risks, and actions.
              </h1>
              <p className="text-sm text-neutral-600 max-w-2xl">
                AI-generated narrative, confidence, and news mapped to every
                layer of your portfolio.
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
              {cached && !refetching ? (
                <Badge
                  variant="outline"
                  className="border-neutral-300 text-neutral-700"
                >
                  Cached • next in {nextUpdateIn}
                </Badge>
              ) : null}
              {refetching && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-neutral-900 text-white"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Refreshing
                </Badge>
              )}
              {meta?.updatedAt ? (
                <span className="text-xs text-neutral-500">
                  Updated {meta.updatedAt}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
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
                className="gap-2 border-neutral-300 text-neutral-900"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>

              {showForce && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={loading || refetching}
                  onClick={() => refetch(true)}
                  title="Force recompute (bypass daily limit)"
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Force
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs header */}
      <div className="md:relative">
        <div className="sticky top-0 z-30 -mx-4 px-4 md:static md:mx-0 md:px-0">
          <div className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)] px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-2 pb-2 sm:pb-3">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Navigate layers
                </p>
                <p className="text-sm text-neutral-600">
                  Switch between portfolio AI layers.
                </p>
              </div>
              <div className="hidden text-xs text-neutral-500 sm:inline">
                {meta?.updatedAt ? `Updated ${meta.updatedAt}` : ""}
              </div>
            </div>
            <div className="relative">
              <div
                ref={scrollerRef}
                className="relative flex-1 overflow-x-auto rounded-2xl scrollbar-hide overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]"
                role="tablist"
                aria-label="AI Insights tabs"
                onKeyDown={handleKeyNav}
              >
                <div className="flex min-w-max flex-nowrap items-center gap-1 sm:gap-1.5 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-1 sm:p-1.5">
                  {TAB_LIST.map((t) => (
                    <button
                      key={t.key}
                      ref={(el) => (tabRefs.current[t.key] = el)}
                      data-tab-key={t.key}
                      role="tab"
                      aria-selected={active === t.key}
                      tabIndex={active === t.key ? 0 : -1}
                      onClick={() => {
                        setActive(t.key);
                        scrollTabIntoView(t.key);
                      }}
                      onFocus={() => scrollTabIntoView(t.key)}
                      className={cn(
                        "h-10 whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 sm:px-3",
                        active === t.key
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "bg-transparent text-neutral-700 hover:bg-white hover:text-neutral-900"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-1 left-1 w-8 bg-gradient-to-r from-white to-transparent transition-opacity duration-150",
                  canScrollLeft ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-1 right-1 w-8 bg-gradient-to-l from-white to-transparent transition-opacity duration-150",
                  canScrollRight ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />
              {canScrollLeft || canScrollRight ? (
                <span className="sr-only">
                  {canScrollLeft && "More tabs to the left."}
                  {canScrollRight && "More tabs to the right."}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div
        className={cn(
          "rounded-3xl border border-neutral-200/80 bg-white p-4 sm:p-5 lg:p-6 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]",
          refetching && "relative"
        )}
        aria-busy={refetching}
      >
        {refetching ? (
          <RefetchingSkeleton />
        ) : (
          <>
            {active === "summary" && (
              <SummaryTab data={data.ai_layers.summary} />
            )}
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
              <ScenariosTab
                data={data.ai_layers.scenarios_rebalance.scenarios}
              />
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
          </>
        )}
      </div>
    </div>
  );
}

function RefetchingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
