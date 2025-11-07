"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Brain,
  Loader2,
  ArrowRight,
  Newspaper,
  CalendarDays,
  Target,
  ShieldAlert,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";

import type { PredictionsBlock } from "@/types/portfolio-ai";

import { SummaryTab } from "./tabs/SummaryTab";
import { NewsTab } from "./tabs/NewsTab";
import { CatalystsTab } from "./tabs/CatalystsTab";
import { ScenariosTab } from "./tabs/ScenariosTab";
import { ActionsTab } from "./tabs/ActionsTab";
import { RisksTab } from "./tabs/RisksTab";
import { AlertsTab } from "./tabs/AlertsTab";
import { PredictionsTab } from "./tabs/PredictionsTab";
import { PortfolioAnalyticsLoading } from "../portfolio-analytics-loading";

export function AnalysisContainer() {
  // ⬇️ meta now available from hook
  const { data, meta, loading, error, refetching, refetch } = usePortfolioAi(7);

  const latest = data?.latest_developments ?? [];
  const catalysts = data?.catalysts ?? [];
  const actions = data?.actions ?? [];
  const risks = data?.risks_list ?? [];
  const alerts = data?.alerts ?? [];
  const scenarios = data?.scenarios;
  const hasScenarios =
    !!scenarios && (scenarios.bull || scenarios.base || scenarios.bear);

  const predictions = data?.predictions as PredictionsBlock | undefined;
  const predictionsCount = predictions?.assets?.length ?? 0;

  const totalItems =
    latest.length + catalysts.length + actions.length + risks.length;

  const defaultTab = React.useMemo(() => {
    if (data?.summary) return "summary";
    if (latest.length) return "news";
    if (catalysts.length) return "catalysts";
    if (predictionsCount) return "predictions";
    if (hasScenarios) return "scenarios";
    if (actions.length) return "actions";
    if (risks.length) return "risks";
    if (alerts.length) return "alerts";
    return "summary";
  }, [
    data?.summary,
    latest.length,
    catalysts.length,
    predictionsCount,
    hasScenarios,
    actions.length,
    risks.length,
    alerts.length,
  ]);

  const [active, setActive] = React.useState<string>(defaultTab);
  React.useEffect(() => setActive(defaultTab), [defaultTab]);

  // Keep mobile anchored-left; scroller is the WRAPPER, not the TabsList.
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      el.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [active]);

  // meta conveniences
  const cached = !!meta?.cached;
  const ttl = meta?.ttlSeconds ?? 0;
  const nextUpdateIn = meta?.nextUpdateIn ?? "now";
  const hasWarnings = (meta?.warnings?.length ?? 0) > 0;
  const canRefreshNow = meta?.canRefreshNow ?? true;
  const showForce = meta?.showForce ?? false;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {refetching ? (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating…
              </Badge>
            ) : (
              <>
                {cached && (
                  <Badge
                    variant="outline"
                    className="gap-1"
                    title={
                      meta?.cachedAt ? `Cached at ${meta.cachedAt}` : undefined
                    }
                  >
                    Cached • next in {nextUpdateIn}
                  </Badge>
                )}
                {hasWarnings && (
                  <Badge variant="destructive" className="gap-1">
                    Partial
                  </Badge>
                )}
                <Badge variant="secondary">{totalItems} items</Badge>
              </>
            )}

            {/* Normal refresh respects TTL; disabled until window expires */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch(false)}
              disabled={loading || refetching || !canRefreshNow}
              title={
                !canRefreshNow
                  ? `Next automatic refresh in ${nextUpdateIn}`
                  : "Refresh now"
              }
              className="gap-1"
            >
              {refetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Refreshing
                </>
              ) : (
                <>
                  Refresh <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>

            {/* Optional: force refresh (bypass TTL) for devs/admins */}
            {showForce && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch(true)}
                disabled={loading || refetching}
                className="gap-1"
                title="Force recompute (bypass daily limit)"
              >
                Force
              </Button>
            )}
          </div>
        </div>

        <CardDescription className="mt-2">
          Narrative, events, scenarios, and action ideas tailored to your
          holdings.{" "}
          {cached ? (
            <span className="text-muted-foreground">
              Next automatic update in {nextUpdateIn}.
            </span>
          ) : (
            <span className="text-muted-foreground">Freshly computed.</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Loading */}
        {/* {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border p-4 space-y-2"
              >
                <div className="h-4 w-1/5 bg-muted rounded" />
                <div className="h-3 w-4/5 bg-muted rounded" />
                <div className="h-3 w-2/5 bg-muted rounded" />
              </div>
            ))}
          </div>
        )} */}

        {loading && <PortfolioAnalyticsLoading estimatedMs={20000} />}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border p-4">
            <p className="text-sm text-destructive">
              {error || "Failed to load AI insights."}
            </p>
            <Button
              onClick={() => refetch(false)}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Optional partial warning banner */}
        {!loading && !error && hasWarnings && (
          <div className="rounded-md border p-3 text-sm">
            Some insight layers were unavailable. We’ll retry on the next
            refresh.
          </div>
        )}

        {refetching && !loading && (
          <PortfolioAnalyticsLoading subtle estimatedMs={20000} />
        )}

        {/* Tabs */}
        {!loading && !error && (
          <Tabs
            value={active}
            onValueChange={(v) => v && setActive(v)}
            className="w-full"
          >
            {/* Sticky header with OUTER SCROLLER to avoid clipping */}
            <div className="sticky -top-0.5 z-10 bg-card/95 backdrop-blur-sm border-b">
              <div
                ref={scrollRef}
                className={[
                  "w-full overflow-x-auto",
                  "[-webkit-overflow-scrolling:touch]",
                  "scroll-smooth scrollbar-hide",
                ].join(" ")}
              >
                <div className="inline-flex min-w-max items-center gap-1 px-3 py-2">
                  <span aria-hidden className="w-1 shrink-0" />
                  <TabsList
                    className={[
                      "inline-flex items-center gap-1",
                      "bg-transparent p-0 text-foreground",
                    ].join(" ")}
                  >
                    <TabsTrigger
                      value="summary"
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10"
                    >
                      <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                      Summary
                    </TabsTrigger>

                    <TabsTrigger
                      value="news"
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10"
                    >
                      <Newspaper className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                      News
                      {latest.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {latest.length}
                        </Badge>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="catalysts"
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10"
                    >
                      <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                      Catalysts
                      {catalysts.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {catalysts.length}
                        </Badge>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="scenarios"
                      disabled={!hasScenarios}
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10 disabled:opacity-50"
                    >
                      <Target className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                      Scenarios
                    </TabsTrigger>

                    <TabsTrigger
                      value="actions"
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10"
                    >
                      <Target className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                      Actions
                      {actions.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {actions.length}
                        </Badge>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="risks"
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                      Risks
                      {risks.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {risks.length}
                        </Badge>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="predictions"
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10"
                    >
                      Predictions
                      {predictionsCount > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {predictionsCount}
                        </Badge>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="alerts"
                      className="min-w-max rounded-full px-3 py-2 text-xs md:text-sm data-[state=active]:bg-primary/10"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                      Alerts
                      {alerts.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {alerts.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  <span aria-hidden className="w-1 shrink-0" />
                </div>
              </div>
            </div>

            {/* Content */}
            <TabsContent value="summary" className="mt-4">
              <SummaryTab summary={data?.summary} />
            </TabsContent>

            <TabsContent value="news" className="mt-4">
              <NewsTab items={latest} />
            </TabsContent>

            <TabsContent value="catalysts" className="mt-4">
              <CatalystsTab
                items={catalysts.map((c) => ({
                  ...c,
                  expected_direction:
                    c.expected_direction === "unclear"
                      ? "neutral"
                      : c.expected_direction,
                }))}
              />
            </TabsContent>

            <TabsContent value="scenarios" className="mt-4">
              <ScenariosTab scenarios={scenarios} />
            </TabsContent>

            <TabsContent value="actions" className="mt-4">
              <ActionsTab items={actions} />
            </TabsContent>

            <TabsContent value="risks" className="mt-4">
              <RisksTab items={risks} />
            </TabsContent>

            <TabsContent value="predictions" className="mt-4">
              <PredictionsTab data={predictions} />
            </TabsContent>

            <TabsContent value="alerts" className="mt-4">
              <AlertsTab items={alerts} />
            </TabsContent>
          </Tabs>
        )}

        {/* Disclaimer */}
        {!loading && !error && data?.disclaimer && (
          <p className="text-[11px] text-muted-foreground">{data.disclaimer}</p>
        )}
      </CardContent>
    </Card>
  );
}
