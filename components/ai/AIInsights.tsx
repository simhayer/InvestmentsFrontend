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
  TrendingUp,
  AlertTriangle,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";

import {
  usePortfolioAnalysis,
  type InsightType,
  type InsightPriority,
  type PortfolioInsight,
} from "@/hooks/use-portfolio-analysis"; // ← adjust path
import { RiskAnalysisCard } from "./RiskAnalysis";

export function AIInsights() {
  const { data, loading, error, refetching, refetch } = usePortfolioAnalysis();

  const insights: PortfolioInsight[] =
    data && !("error" in data) ? data.insights : [];

  const count = insights.length;

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case "opportunity":
        return <Target className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "positive":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: InsightType) => {
    switch (type) {
      case "opportunity":
        return "text-primary";
      case "warning":
        return "text-destructive";
      case "positive":
        return "text-emerald-600 dark:text-emerald-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getPriorityVariant = (priority: InsightPriority) => {
    switch (priority) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "secondary" as const;
      case "low":
      default:
        return "outline" as const;
    }
  };

  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

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
              <Badge variant="secondary">{count} insights</Badge>
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
          Personalized recommendations based on your latest portfolio analysis
        </CardDescription>
      </CardHeader>

      <CardContent>
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
              {error || "Failed to load insights."}
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

        {/* Empty */}
        {!loading && !error && count === 0 && (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            No insights yet. Once your portfolio is analyzed, they’ll show up
            here.
          </div>
        )}

        {/* Insights */}
        {!loading && !error && count > 0 && (
          <div className="space-y-4">
            {/* Optional: quick summary chips */}
            {"summary" in (data as any) && !(data as any).error && (
              <SummaryChips
                hhi={(data as any).summary.hhi}
                topSymbol={(data as any).summary.top_position.symbol}
                topWeight={(data as any).summary.top_position.weight}
              />
            )}

            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className={`${getInsightColor(insight.type)} mt-0.5`}>
                  {getInsightIcon(insight.type)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge
                      variant={getPriorityVariant(insight.priority)}
                      className="text-xs"
                    >
                      {insight.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                  >
                    {insight.action}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <RiskAnalysisCard
        data={data}
        loading={loading}
        error={error}
        refetch={refetch}
      />
    </Card>
  );
}

/* --- Tiny helper for a compact summary row (optional) --- */
function SummaryChips({
  hhi,
  topSymbol,
  topWeight,
}: {
  hhi: number;
  topSymbol: string;
  topWeight: number;
}) {
  const pill = (label: string, value: string) => (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

  return (
    <div className="flex flex-wrap gap-2">
      {pill("Top holding", `${topSymbol} · ${pct(topWeight)}`)}
      {pill("Diversification (HHI)", hhi.toFixed(3))}
    </div>
  );
}
