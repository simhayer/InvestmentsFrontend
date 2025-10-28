// components/AIInsights.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const totalItems =
    latest.length + catalysts.length + actions.length + risks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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

        <CardDescription>
          Narrative, events, scenarios, and action ideas tailored to your
          holdings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
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

        {/* Summary (AI) */}
        {!loading && !error && data?.summary && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Summary
            </h3>
            <p className="text-sm text-muted-foreground">{data.summary}</p>
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
        )}

        {/* Latest Developments */}
        {!loading && !error && latest.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" /> Latest developments
            </h3>
            <ul className="space-y-3">
              {latest.map((n, idx) => (
                <li key={idx} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{n.headline}</div>
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
          </section>
        )}

        {/* Catalysts */}
        {!loading && !error && catalysts.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Catalysts (next/
              recent)
            </h3>
            <ul className="space-y-3">
              {catalysts.map((c, idx) => (
                <li key={idx} className="rounded-lg border p-4">
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
          </section>
        )}

        {/* Scenarios */}
        {!loading &&
          !error &&
          scenarios &&
          (scenarios.bull || scenarios.base || scenarios.bear) && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Scenarios
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {scenarios.bull && (
                  <div className="rounded-lg border p-4">
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
                {scenarios.base && (
                  <div className="rounded-lg border p-4">
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
                {scenarios.bear && (
                  <div className="rounded-lg border p-4">
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
            </section>
          )}

        {/* Actions */}
        {!loading && !error && actions.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Actions
            </h3>
            <ul className="space-y-3">
              {actions.map((a, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <div className="text-primary mt-0.5">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold">{a.title}</h4>
                      <div className="flex items-center gap-2">
                        {a.impact ? (
                          <Badge variant="secondary">impact: {a.impact}</Badge>
                        ) : null}
                        {a.urgency ? (
                          <Badge variant="secondary">
                            urgency: {a.urgency}
                          </Badge>
                        ) : null}
                        {a.effort ? (
                          <Badge variant="secondary">effort: {a.effort}</Badge>
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
          </section>
        )}

        {/* Risks & Alerts */}
        {!loading && !error && (risks.length > 0 || alerts.length > 0) && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" /> Risks & Alerts
            </h3>

            {risks.length > 0 && (
              <ul className="space-y-3">
                {risks.map((r, idx) => (
                  <li key={idx} className="rounded-lg border p-4">
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
                        {r.monitor ? <span>· Monitor: {r.monitor}</span> : null}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {alerts.length > 0 && (
              <ul className="space-y-3">
                {alerts.map((al, idx) => (
                  <li key={idx} className="rounded-lg border p-4">
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
            )}
          </section>
        )}

        {/* Disclaimer */}
        {!loading && !error && data?.disclaimer && (
          <p className="text-[11px] text-muted-foreground">{data.disclaimer}</p>
        )}
      </CardContent>
    </Card>
  );
}
