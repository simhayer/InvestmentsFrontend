"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // ensure you have this; else build a simple div-based bar
import { ShieldAlert, Activity, Waves } from "lucide-react";
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-analysis";

//define the props type
interface RiskAnalysisCardProps {
  data: ReturnType<typeof usePortfolioAnalysis>["data"];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function RiskAnalysisCard({
  data,
  loading,
  error,
  refetch,
}: RiskAnalysisCardProps) {
  const risk = data && !("error" in data) ? data.risk : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <CardTitle>Risk Analysis</CardTitle>
        </div>
        {risk?.overall && (
          <Badge variant="secondary">
            Overall: {risk.overall.level} · {risk.overall.score.toFixed(1)}/100
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && <SkeletonRows />}
        {!loading && error && (
          <p className="text-sm text-destructive">
            Failed to load risk: {error}
          </p>
        )}

        {!loading && !error && !risk && (
          <p className="text-sm text-muted-foreground">
            Risk metrics will appear once your portfolio analysis completes.
          </p>
        )}

        {!loading && !error && risk && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              icon={<Activity className="h-4 w-4" />}
              title="Overall Risk Score"
              value={`${risk.overall.level}`}
              sub={`${risk.overall.score.toFixed(1)}/100`}
              progress={risk.overall.score}
            />
            <Metric
              icon={<Waves className="h-4 w-4" />}
              title="Diversification"
              value={`${risk.diversification.score.toFixed(1)}/100`}
              sub={`HHI ${risk.diversification.hhi.toFixed(3)} · N_eff ${
                risk.diversification.n_eff ?? "—"
              }`}
              progress={risk.diversification.score}
            />
            <Metric
              icon={<Waves className="h-4 w-4" />}
              title="Volatility"
              value={`${risk.volatility.score.toFixed(1)}/100`}
              sub={`Est. σ ${risk.volatility.est_vol_annual_pct.toFixed(
                1
              )}% (annual)`}
              progress={risk.volatility.score}
            />
          </div>
        )}

        {!loading && risk && (
          <>
            <p className="text-xs text-muted-foreground">{risk.disclaimer}</p>
            {/* Optional: show class breakdown */}
            <div className="mt-2 grid gap-2">
              {risk.details.classes.slice(0, 6).map((c) => (
                <div key={c.symbol} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {c.symbol} · {c.class.replaceAll("_", " ")}
                  </span>
                  <span className="font-medium">
                    {(c.weight * 100).toFixed(1)}% · σ {c.sigma_pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {risk?.ai && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              {risk.ai.overall_blurb}
            </div>
            <ul className="list-disc pl-5 text-sm">
              {risk.ai.suggestions.slice(0, 5).map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  title,
  value,
  sub,
  progress,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
  progress: number; // 0..100 (higher = safer)
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <div className="font-medium">{title}</div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <Progress
        className="mt-3 h-2"
        value={Math.max(0, Math.min(100, progress))}
      />
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border p-4 animate-pulse space-y-3">
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-6 w-1/4 bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
