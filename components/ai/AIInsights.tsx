// components/AIInsights.tsx
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
  AlertTriangle,
  Target,
  ArrowRight,
  Loader2,
  Newspaper,
  CalendarDays,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";

export function AIInsights() {
  const { data, loading, error, refetching, refetch } = usePortfolioAi(7);

  const latest = data?.latest_developments ?? [];
  const catalysts = data?.catalysts ?? [];
  const actions = data?.actions ?? [];
  const risks = data?.risks_list ?? [];
  const alerts = data?.alerts ?? [];
  const scenarios = data?.scenarios;
  const hasScenarios = !!(
    scenarios &&
    (scenarios.bull || scenarios.base || scenarios.bear)
  );

  const totalItems =
    latest.length + catalysts.length + actions.length + risks.length;

  const defaultTab = React.useMemo(() => {
    if (data?.summary) return "summary";
    if (latest.length) return "news";
    if (catalysts.length) return "catalysts";
    if (hasScenarios) return "scenarios";
    if (actions.length) return "actions";
    if (risks.length) return "risks";
    if (alerts.length) return "alerts";
    return "summary";
  }, [
    data?.summary,
    latest.length,
    catalysts.length,
    hasScenarios,
    actions.length,
    risks.length,
    alerts.length,
  ]);

  // Controlled tab value to detect changes
  const [active, setActive] = React.useState<string>(defaultTab);
  React.useEffect(() => setActive(defaultTab), [defaultTab]);

  // Horizontal scroller + fades state
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = React.useState(false);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const scrollToStart = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  // Center current active trigger within scroller
  const centerActive = React.useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = listRef.current;
      if (!el) return;
      const activeTrigger = el.querySelector<HTMLElement>(
        '[role="tab"][data-state="active"]'
      );
      if (!activeTrigger) return;

      const elRect = el.getBoundingClientRect();
      const trigRect = activeTrigger.getBoundingClientRect();
      const delta =
        trigRect.left + trigRect.width / 2 - (elRect.left + elRect.width / 2);
      el.scrollTo({ left: el.scrollLeft + delta, behavior });
    },
    []
  );

  const updateScrollState = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 1;
    setHasOverflow(overflow);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  // Mount: ensure first tabs visible; only center if default isn't the first tab
  const firstMount = React.useRef(true);
  React.useEffect(() => {
    // Start at the very beginning so "Summary" & "News" are visible on mobile
    scrollToStart();
    // Compute fades/overflow after initial layout
    updateScrollState();

    // If default is not the first tab ("summary"), then center it once
    if (active !== "summary") {
      // Use rAF to wait for DOM paints, then instant center to avoid jump
      const id = requestAnimationFrame(() => centerActive("auto"));
      return () => cancelAnimationFrame(id);
    }

    firstMount.current = false;
  }, [active, centerActive, scrollToStart, updateScrollState]);

  // Keep fades reactive to scroll/resize
  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // Center when user changes tab (but skip the very first render we already handled)
  React.useEffect(() => {
    if (firstMount.current) return;
    centerActive();
  }, [active, centerActive]);

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
              <Badge variant="secondary">{totalItems} items</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading || refetching}
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
          </div>
        </div>

        <CardDescription className="mt-2">
          Narrative, events, scenarios, and action ideas tailored to your
          holdings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Loading */}
        {loading && (
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
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border p-4">
            <p className="text-sm text-destructive">
              {error || "Failed to load AI insights."}
            </p>
            <Button
              onClick={refetch}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && (
          <Tabs
            value={active}
            onValueChange={(v) => v && setActive(v)}
            className="w-full"
          >
            {/* Sticky, scrollable TabsList with mobile-only fades */}
            <div className="sticky -top-0.5 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
              <div className="relative">
                {hasOverflow && (
                  <>
                    {/* left fade (mobile only) */}
                    <div
                      className={[
                        "pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card to-transparent md:hidden transition-opacity",
                        atStart ? "opacity-0" : "opacity-100",
                      ].join(" ")}
                    />
                    {/* right fade (mobile only) */}
                    <div
                      className={[
                        "pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent md:hidden transition-opacity",
                        atEnd ? "opacity-0" : "opacity-100",
                      ].join(" ")}
                    />
                  </>
                )}

                <TabsList
                  ref={listRef}
                  className={[
                    "flex w-full overflow-x-auto whitespace-nowrap scroll-smooth",
                    "snap-x snap-mandatory [-webkit-overflow-scrolling:touch] scrollbar-hide",
                    "px-2 py-1 gap-1",
                  ].join(" ")}
                >
                  <TabsTrigger
                    value="summary"
                    className="gap-1 snap-start rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary/10"
                  >
                    <Activity className="h-4 w-4" />
                    <span className="sm:hidden">Sum</span>
                    <span className="hidden sm:inline">Summary</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="news"
                    className="gap-1 snap-start rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary/10"
                  >
                    <Newspaper className="h-4 w-4" /> News
                    {latest.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {latest.length}
                      </Badge>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="catalysts"
                    className="gap-1 snap-start rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary/10"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span className="sm:hidden">Cats</span>
                    <span className="hidden sm:inline">Catalysts</span>
                    {catalysts.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {catalysts.length}
                      </Badge>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="scenarios"
                    className="gap-1 snap-start rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary/10"
                  >
                    <Target className="h-4 w-4" /> Scenarios
                  </TabsTrigger>

                  <TabsTrigger
                    value="actions"
                    className="gap-1 snap-start rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary/10"
                  >
                    <Target className="h-4 w-4" /> Actions
                    {actions.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {actions.length}
                      </Badge>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="risks"
                    className="gap-1 snap-start rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary/10"
                  >
                    <ShieldAlert className="h-4 w-4" /> Risks
                    {risks.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {risks.length}
                      </Badge>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="alerts"
                    className="gap-1 snap-start rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary/10"
                  >
                    <AlertTriangle className="h-4 w-4" /> Alerts
                    {alerts.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {alerts.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* SUMMARY */}
            <TabsContent value="summary" className="mt-4">
              {data?.summary ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" /> Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {data.summary}
                  </p>
                  {data.section_confidence?.news != null && (
                    <div className="text-[11px] text-muted-foreground">
                      Confidence — News:{" "}
                      {(data.section_confidence.news * 100).toFixed(0)}%
                      {data.section_confidence.scenarios != null
                        ? ` · Scenarios: ${(
                            data.section_confidence.scenarios * 100
                          ).toFixed(0)}%`
                        : ""}
                      {data.section_confidence.actions != null
                        ? ` · Actions: ${(
                            data.section_confidence.actions * 100
                          ).toFixed(0)}%`
                        : ""}
                    </div>
                  )}
                </section>
              ) : (
                <EmptyState
                  icon={<Activity className="h-5 w-5" />}
                  title="No summary yet"
                  desc="Run a refresh to generate a portfolio narrative."
                  onClick={refetch}
                />
              )}
            </TabsContent>

            {/* NEWS */}
            <TabsContent value="news" className="mt-4">
              {latest.length ? (
                <ul className="space-y-3">
                  {latest.map((n, idx) => (
                    <li key={idx} className="rounded-lg border p-4 sm:p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium line-clamp-2">
                          {n.headline}
                        </div>
                        <div className="flex items-center gap-2">
                          {n.assets_affected?.length ? (
                            <Badge variant="outline">
                              {n.assets_affected.join(", ")}
                            </Badge>
                          ) : null}
                          {n.source ? (
                            <Badge variant="secondary">{n.source}</Badge>
                          ) : null}
                        </div>
                      </div>
                      {(n.cause || n.impact) && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {n.cause ? <span>Cause: {n.cause}. </span> : null}
                          {n.impact ? <span>Impact: {n.impact}</span> : null}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{n.date}</span>
                        {n.url ? (
                          <a
                            className="underline"
                            href={n.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            source
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<Newspaper className="h-5 w-5" />}
                  title="No news items"
                  desc="We didn’t find any recent developments for your holdings."
                />
              )}
            </TabsContent>

            {/* CATALYSTS */}
            <TabsContent value="catalysts" className="mt-4">
              {catalysts.length ? (
                <ul className="space-y-3">
                  {catalysts.map((c, idx) => (
                    <li key={idx} className="rounded-lg border p-4 sm:p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">
                          {c.type ? `${c.type}: ` : ""}
                          {c.description}
                        </div>
                        <div className="flex items-center gap-2">
                          {c.expected_direction ? (
                            <Badge
                              variant={
                                c.expected_direction === "up"
                                  ? "default"
                                  : c.expected_direction === "down"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {c.expected_direction}
                            </Badge>
                          ) : null}
                          {typeof c.confidence === "number" ? (
                            <Badge variant="outline">
                              {(c.confidence * 100).toFixed(0)}% conf
                            </Badge>
                          ) : null}
                          {c.assets_affected?.length ? (
                            <Badge variant="outline">
                              {c.assets_affected.join(", ")}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      {c.magnitude_basis && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Basis: {c.magnitude_basis}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {c.date}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="No upcoming catalysts"
                  desc="Earnings dates and economic releases will show here."
                />
              )}
            </TabsContent>

            {/* SCENARIOS */}
            <TabsContent value="scenarios" className="mt-4">
              {hasScenarios ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {scenarios?.bull && (
                    <div className="rounded-lg border p-4 sm:p-3">
                      <div className="font-semibold">Bull</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {scenarios.bull}
                      </p>
                      {typeof scenarios.probabilities?.bull === "number" && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          P(Bull):{" "}
                          {(scenarios.probabilities.bull * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  )}
                  {scenarios?.base && (
                    <div className="rounded-lg border p-4 sm:p-3">
                      <div className="font-semibold">Base</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {scenarios.base}
                      </p>
                      {typeof scenarios.probabilities?.base === "number" && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          P(Base):{" "}
                          {(scenarios.probabilities.base * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  )}
                  {scenarios?.bear && (
                    <div className="rounded-lg border p-4 sm:p-3">
                      <div className="font-semibold">Bear</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {scenarios.bear}
                      </p>
                      {typeof scenarios.probabilities?.bear === "number" && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          P(Bear):{" "}
                          {(scenarios.probabilities.bear * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<Target className="h-5 w-5" />}
                  title="No scenarios yet"
                  desc="Once we have enough signal, we’ll outline bull/base/bear paths."
                />
              )}
            </TabsContent>

            {/* ACTIONS */}
            <TabsContent value="actions" className="mt-4">
              {actions.length ? (
                <ul className="space-y-3">
                  {actions.map((a, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 p-4 sm:p-3 rounded-lg border"
                    >
                      <div className="text-primary mt-0.5">
                        <Target className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-semibold">{a.title}</h4>
                          <div className="flex items-center gap-2">
                            {a.impact ? (
                              <Badge variant="secondary">
                                impact: {a.impact}
                              </Badge>
                            ) : null}
                            {a.urgency ? (
                              <Badge variant="secondary">
                                urgency: {a.urgency}
                              </Badge>
                            ) : null}
                            {a.effort ? (
                              <Badge variant="secondary">
                                effort: {a.effort}
                              </Badge>
                            ) : null}
                            {a.category ? (
                              <Badge variant="outline">{a.category}</Badge>
                            ) : null}
                          </div>
                        </div>
                        {a.rationale && (
                          <p className="text-sm text-muted-foreground">
                            {a.rationale}
                          </p>
                        )}
                        {a.targets?.length ? (
                          <div className="text-xs text-muted-foreground">
                            Targets: {a.targets.join(", ")}
                          </div>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          Go <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<Target className="h-5 w-5" />}
                  title="No action ideas"
                  desc="We’ll surface concrete next steps as soon as we have them."
                />
              )}
            </TabsContent>

            {/* RISKS */}
            <TabsContent value="risks" className="mt-4">
              {risks.length ? (
                <ul className="space-y-3">
                  {risks.map((r, idx) => (
                    <li key={idx} className="rounded-lg border p-4 sm:p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{r.risk}</div>
                        {r.assets_affected?.length ? (
                          <Badge variant="outline">
                            {r.assets_affected.join(", ")}
                          </Badge>
                        ) : null}
                      </div>
                      {(r.why_it_matters || r.monitor) && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {r.why_it_matters ? (
                            <span>{r.why_it_matters} </span>
                          ) : null}
                          {r.monitor ? (
                            <span>· Monitor: {r.monitor}</span>
                          ) : null}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<ShieldAlert className="h-5 w-5" />}
                  title="No risks identified"
                  desc="Key portfolio risks will appear here."
                />
              )}
            </TabsContent>

            {/* ALERTS */}
            <TabsContent value="alerts" className="mt-4">
              {alerts.length ? (
                <ul className="space-y-3">
                  {alerts.map((al, idx) => (
                    <li key={idx} className="rounded-lg border p-4 sm:p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{al.condition}</div>
                        <Badge
                          variant={
                            al.status === "triggered"
                              ? "destructive"
                              : al.status === "ok"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {al.status || "ok"}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="All clear"
                  desc="No alerts right now. We’ll flag anything noteworthy."
                />
              )}
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

/** Reusable empty state */
function EmptyState({
  icon,
  title,
  desc,
  onClick,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  onClick?: () => void;
}) {
  return (
    <div className="rounded-lg border p-6 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
      {desc ? (
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      ) : null}
      {onClick ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onClick}>
          Refresh
        </Button>
      ) : null}
    </div>
  );
}
