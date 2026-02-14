"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Activity, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
} from "lucide-react";

import {
  getPortfolioHealthScore,
  getPortfolioHealthExplain,
  type PortfolioHealthScore,
  type PortfolioHealthExplainResponse,
} from "@/utils/portfolioService";
import { keysToCamel, fmtCurrency, fmtPct } from "@/utils/format";
import { toast } from "@/components/ui/use-toast";

import { TopHoldings } from "@/components/holdings/top-holdings";
import { Skeleton } from "@/components/ui/skeleton";
import type { PortfolioSummary } from "@/types/portfolio-summary";
import { getPortfolioSummary } from "@/utils/portfolioService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Page } from "@/components/layout/Page";
import { StackedBar } from "./_bits";
import { AnalysisSummaryCard } from "./ai-summary-card";
import ProviderAvatar from "../layout/ProviderAvatar";
import { PortfolioExplainCard} from './portfolio-health-card'
import { usePageContext } from "@/hooks/usePageContext";
import { usePathname } from "next/navigation";
 
export function PortfolioOverview() {
  const pathname = usePathname();
  const [data, setData] = React.useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Risk / Health State
  const [healthScore, setHealthScore] = React.useState<PortfolioHealthScore | null>(null);
  const [healthExplain, setHealthExplain] = React.useState<PortfolioHealthExplainResponse | null>(null);
  const [healthLoading, setHealthLoading] = React.useState(false);
  const [explainLoading, setExplainLoading] = React.useState(false);

  const load = React.useCallback(async (signal?: AbortSignal, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const raw = await getPortfolioSummary({ signal });
      const summary = keysToCamel(raw) as unknown as PortfolioSummary;
      setData(summary);

      // Load score in parallel (silent fail ok)
      getPortfolioHealthScore({ signal })
        .then(setHealthScore)
        .catch(() => console.warn("Failed to load initial health score"));
        
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast({
        title: "Error",
        description: "Failed to load portfolio overview.",
        variant: "destructive",
      });
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  const explainHealth = React.useCallback(
    async (signal?: AbortSignal) => {
      setExplainLoading(true);
      try {
        // Ensure we have a score first
        const score = healthScore ?? (await getPortfolioHealthScore({ signal }));
        if (!healthScore) setHealthScore(score);

        const explain = await getPortfolioHealthExplain({
          healthScore: score,
          signal,
        });
        setHealthExplain(explain);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        toast({
          title: "Error",
          description: "Failed to generate explanation.",
          variant: "destructive",
        });
      } finally {
        setExplainLoading(false);
      }
    },
    [healthScore]
  );

  React.useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  // Register page context for the chat agent
  const dashSummary = React.useMemo(() => {
    if (!data) return undefined;
    const top = (data.topPositions ?? []).slice(0, 5).map((p: any) => p.symbol).join(", ");
    return [
      `Portfolio value: ${fmtCurrency(data.marketValue, (data as any).currency || "USD")}`,
      `Day P/L: ${fmtCurrency(data.dayPl, (data as any).currency || "USD")} (${fmtPct(data.dayPlPct)})`,
      `Unrealized P/L: ${fmtCurrency(data.unrealizedPl, (data as any).currency || "USD")} (${fmtPct(data.unrealizedPlPct)})`,
      `Positions: ${data.positionsCount}`,
      top ? `Top holdings: ${top}` : "",
      healthScore ? `Health score: ${healthScore.score}/100 (${healthScore.risk_level})` : "",
    ].filter(Boolean).join(". ");
  }, [data, healthScore]);

  usePageContext({
    pageType: "dashboard",
    route: pathname,
    summary: dashSummary,
  });

  if (loading && !data) return <LoadingShell />;

  if (!data) {
    return (
      <Page>
        <EmptyState
          title="Portfolio Overview"
          description="We couldn't load your portfolio right now."
          actionLabel="Retry"
          onAction={() => load(undefined)}
        />
      </Page>
    );
  }

  const ccy = (data as any).currency || "USD";

  return (
    <Page className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[2.1fr_0.9fr]">
        {/* Main Column */}
        <div className="flex flex-col gap-6 min-w-0">
          
          {/* ✅ Combined Hero + Health Card */}
          <PortfolioSummaryHero 
            data={data} 
            ccy={ccy}
            healthScore={healthScore}
            healthExplain={healthExplain}
            healthLoading={healthLoading}
            explainLoading={explainLoading}
            onExplainHealth={() => explainHealth()}
          />

          <AnalysisSummaryCard />
        </div>

        {/* Sidebar Rail */}
        <div className="flex flex-col gap-6">
          <ConnectionsCard connections={(data as any).connections} compact />
          <TopHoldings holdings={(data as any).topPositions} loading={loading} currency={ccy} />
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Portfolio Allocation
            </h3>
            <AllocationSection allocations={(data as any).allocations} />
          </div>
        </div>
      </div>
    </Page>
  );
}

/* -------------------- Updated Hero Component -------------------- */

interface HeroProps {
  data: PortfolioSummary;
  ccy: string;
  healthScore: PortfolioHealthScore | null;
  healthExplain: PortfolioHealthExplainResponse | null;
  healthLoading: boolean;
  explainLoading: boolean;
  onExplainHealth: () => void;
}

function PortfolioSummaryHero({ 
  data, 
  ccy, 
  healthScore, 
  healthExplain, 
  healthLoading, 
  explainLoading,
  onExplainHealth
}: HeroProps) {
  const [showExplanation, setShowExplanation] = React.useState(false);

  // Financial Data
  const totalReturn = (data as any).unrealizedPl ?? 0;
  const totalReturnPct = (data as any).unrealizedPlPct;
  const dayReturn = (data as any).dayPl ?? 0;
  const dayReturnPct = (data as any).dayPlPct;

  const toneClass = (v?: number | null) => {
    if (v == null) return "text-neutral-600";
    if (v > 0) return "text-emerald-700";
    if (v < 0) return "text-rose-700";
    return "text-neutral-700";
  };

  // Health Data
  const scoreVal = healthScore?.score || 0;
  const riskLabel = healthScore ? getRiskLabel(scoreVal) : "Unknown";
  const riskColor = healthScore ? getRiskColor(scoreVal) : "text-neutral-400";

  const handleToggleExplain = () => {
    if (!showExplanation && !healthExplain) {
      onExplainHealth();
    }
    setShowExplanation(!showExplanation);
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-sm transition-all">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          
          {/* --- LEFT: Financials --- */}
          <div className="flex-1 p-6 lg:border-r lg:border-neutral-100">
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Total Value
                </div>
                <div className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                  {fmtCurrency((data as any).marketValue, ccy)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <MiniStat 
                  label="Total return" 
                  value={fmtCurrency(totalReturn, ccy)} 
                  delta={fmtPct(totalReturnPct)} 
                  deltaClass={toneClass(totalReturn)} 
                />
                <div className="h-8 w-px bg-neutral-200/50" />
                <MiniStat 
                  label="Today's Change" 
                  value={fmtCurrency(dayReturn, ccy)} 
                  delta={fmtPct(dayReturnPct)} 
                  deltaClass={toneClass(dayReturn)} 
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT: Health Score --- */}
          <div className="bg-neutral-50/50 p-6 lg:w-[280px] lg:bg-transparent xl:w-[320px]">
            <div className="flex h-full flex-col justify-between gap-4">
              
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    <Activity className="h-3.5 w-3.5" />
                    Health Score
                  </div>
                  {healthScore ? (
                     <div className="mt-2 flex items-baseline gap-2">
                       <span className={cn("text-3xl font-bold", riskColor)}>{scoreVal}</span>
                       <span className="text-sm font-medium text-neutral-600">/ 100</span>
                     </div>
                  ) : (
                    <Skeleton className="mt-2 h-9 w-24 rounded-lg" />
                  )}
                </div>
                
                {/* Donut Chart */}
                <div className="relative flex h-14 w-14 items-center justify-center">
                   <ScoreDonut score={scoreVal} loading={!healthScore || healthLoading} />
                   <div className="absolute inset-0 flex items-center justify-center">
                     {healthLoading ? (
                       <RefreshCw className="h-4 w-4 animate-spin text-neutral-400" />
                     ) : (
                       <TrendingUp className={cn("h-5 w-5", riskColor)} />
                     )}
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Risk Badge */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-xs font-medium text-neutral-500">Risk Level</span>
                  {healthScore ? (
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-neutral-200 shadow-sm", riskColor)}>
                      {riskLabel}
                    </span>
                  ) : (
                    <Skeleton className="h-5 w-20" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                   <Button 
                      size="sm" 
                      variant={showExplanation ? "secondary" : "default"}
                      className={cn("h-8 flex-1 gap-1.5 rounded-xl text-xs", showExplanation && "bg-neutral-200 text-neutral-900")}
                      onClick={handleToggleExplain}
                      disabled={!healthScore || explainLoading}
                   >
                      {explainLoading ? "Analyzing..." : <><Sparkles className="h-3 w-3" /> Analyze my score</>}
                   </Button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- EXPANDABLE: Rich Explanation --- */}
        {showExplanation && healthExplain && (
          <PortfolioExplainCard 
            healthExplain={healthExplain} 
            explainLoading={explainLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- Sub-Components -------------------- */


function MiniStat({ label, value, delta, deltaClass }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-semibold text-neutral-900">{value}</div>
        {delta && <div className={cn("text-xs font-bold", deltaClass)}>{delta}</div>}
      </div>
    </div>
  );
}

function ScoreDonut({ score, loading }: { score: number; loading: boolean }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Color determination based on score
  let strokeColor = "text-rose-500";
  if (score >= 40) strokeColor = "text-amber-400";
  if (score >= 70) strokeColor = "text-emerald-500";
  if (score >= 85) strokeColor = "text-emerald-600";
  if (loading) strokeColor = "text-neutral-200";

  return (
    <svg className="h-full w-full -rotate-90" viewBox="0 0 50 50">
      {/* Background Circle */}
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-neutral-100"
      />
      {/* Progress Circle */}
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={loading ? circumference : offset}
        strokeLinecap="round"
        className={cn("transition-all duration-1000 ease-out", strokeColor)}
      />
    </svg>
  );
}

/* -------------------- Helpers -------------------- */

function getRiskLabel(score: number) {
  if (score >= 80) return "Low Risk";
  if (score >= 60) return "Moderate Risk";
  return "High Risk";
}

function getRiskColor(score: number) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 60) return "text-amber-600";
  return "text-rose-700";
}

// ... Keep existing AllocationSection, ConnectionsCard, AllocCard, LoadingShell etc. below ...
// (I will assume these exist unchanged from your original code or can be pasted here if needed)

function AllocationSection({ allocations }: any) {
  const byType = allocations?.byType ?? [];
  const byAccount = allocations?.byAccount ?? [];
  return (
    <div className="grid gap-4 lg:grid-cols-1">
      <AllocCard title="By Asset Type" items={byType} />
      <AllocCard title="By Account" items={byAccount} />
    </div>
  );
}

function AllocCard({ title, items }: any) {
  const hasData = (items?.length ?? 0) > 0;
  return (
    <Card className="rounded-3xl border-neutral-200/70 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-neutral-900 mb-3">{title}</p>
        {hasData ? (
          <>
            <StackedBar items={items.map((i: any) => ({ key: i.key, weight: i.weight }))} height={10} />
            <div className="mt-3 space-y-1.5">
              {items.slice(0, 3).map((i: any) => (
                <div key={i.key} className="flex justify-between text-xs">
                  <span className="text-neutral-500">{i.key}</span>
                  <span className="font-medium text-neutral-900">{i.weight.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-xs text-neutral-400 italic">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectionsCard({ connections, compact }: any) {
  const hasConnections = (connections?.length ?? 0) > 0;
  return (
    <Card className="rounded-3xl border-neutral-200/70 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Connections
          </CardTitle>
          <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
            <Link href="/connections">Manage</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {!hasConnections && (
          <Button asChild variant="outline" className="w-full rounded-xl border-dashed">
            <Link href="/connections" className="text-xs">
              Connect Account
            </Link>
          </Button>
        )}
        {connections?.slice(0, 2).map((c: any) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ProviderAvatar name={c.institutionName} className="h-10 w-10" />
              <div className="truncate text-sm font-medium text-neutral-700">{c.institutionName}</div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LoadingShell() {
  return (
    <Page className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2.1fr_0.9fr]">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-[220px] w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </Page>
  );
}

function EmptyState({ title, description, actionLabel, onAction }: any) {
  return (
    <Card className="rounded-3xl border-neutral-200/70 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
        <CardDescription className="text-sm text-neutral-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button onClick={onAction} className="rounded-xl">
          {actionLabel}
        </Button>
        <Button asChild variant="outline" className="rounded-xl bg-white">
          <Link href="/connections">Go to Connections</Link>
        </Button>
      </CardContent>
    </Card>
  );
}