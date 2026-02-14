"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Zap,
  X,
  PieChart,
  Wallet,
  AlertCircle,
  BarChart3,
  ExternalLink,
  Plus,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { keysToCamel, fmtCurrency, fmtPct } from "@/utils/format";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Page } from "@/components/layout/Page";
import { TopHoldings } from "@/components/holdings/top-holdings";
import ProviderAvatar from "../layout/ProviderAvatar";
import { PortfolioAnalysisCard } from "@/components/analytics/portfolio-analysis-card";
import { UpgradeGate } from "@/components/upgrade-gate";
import { AnalysisLoader } from "@/components/ui/analysis-loader";
import { usePageContext } from "@/hooks/usePageContext";
import { usePathname } from "next/navigation";

import { getPortfolioSummary } from "@/utils/portfolioService";
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-ai";
import type { PortfolioSummary } from "@/types/portfolio-summary";

export function PortfolioOverview() {
  const pathname = usePathname();
  const [data, setData] = React.useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  // AI Analysis
  const {
    inlineLoading,
    inline,
    analysisLoading,
    analysis,
    error: aiError,
    tierError,
    fetchFullAnalysis,
    reset: resetAi,
  } = usePortfolioAnalysis(data?.currency || "USD", !!data);

  // Auto-scroll ref
  const analysisRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (analysis && analysisRef.current) {
      analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysis]);

  // Dedup guard — prevent overlapping summary fetches
  const summaryInFlightRef = React.useRef(false);

  const load = React.useCallback(async (signal?: AbortSignal) => {
    if (summaryInFlightRef.current) return;
    summaryInFlightRef.current = true;
    setLoading(true);
    try {
      const raw = await getPortfolioSummary({ signal });
      const summary = keysToCamel(raw) as unknown as PortfolioSummary;
      setData(summary);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast({
        title: "Error",
        description: "Failed to load portfolio overview.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      summaryInFlightRef.current = false;
    }
  }, []);

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
        <ErrorState onRetry={() => load()} />
      </Page>
    );
  }

  // No holdings yet — show the welcome / onboarding state
  if (data.positionsCount === 0) {
    return (
      <Page>
        <WelcomeState hasConnections={(data.connections?.length ?? 0) > 0} />
      </Page>
    );
  }

  const ccy = data.currency || "USD";
  const totalReturn = data.unrealizedPl ?? 0;
  const totalReturnPct = data.unrealizedPlPct ?? 0;
  const dayReturn = data.dayPl ?? 0;
  const dayReturnPct = data.dayPlPct ?? 0;
  const isPositive = totalReturn >= 0;
  const isDayPositive = dayReturn >= 0;

  return (
    <Page className="space-y-6">
      {/* ================================================================ */}
      {/* HERO: Value + Quick Stats + AI Button */}
      {/* ================================================================ */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Value */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                  <Wallet className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Portfolio Value
                  </p>
                  <p className="text-xs text-neutral-500">
                    {data.positionsCount} positions
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
                  {fmtCurrency(data.marketValue, ccy)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg",
                    isPositive ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-rose-700 bg-rose-50 border border-rose-100"
                  )}
                >
                  {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {fmtPct(totalReturnPct)}
                </span>
              </div>

              {/* Mini Stats */}
              <div className="flex items-center gap-4 sm:gap-6 pt-1 flex-wrap">
                <MiniStat
                  label="Total Return"
                  value={fmtCurrency(totalReturn, ccy)}
                  delta={fmtPct(totalReturnPct)}
                  positive={isPositive}
                />
                <div className="h-8 w-px bg-neutral-200" />
                <MiniStat
                  label="Today"
                  value={fmtCurrency(dayReturn, ccy)}
                  delta={fmtPct(dayReturnPct)}
                  positive={isDayPositive}
                />
              </div>
            </div>

            {/* Right: AI Button */}
            <div className="flex flex-col items-start lg:items-end gap-3">
              <Button
                onClick={fetchFullAnalysis}
                disabled={analysisLoading}
                size="lg"
                className={cn(
                  "h-12 px-6 rounded-xl font-semibold transition-all",
                  analysis
                    ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
                )}
              >
                {analysisLoading ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {analysis ? "Refresh Analysis" : "AI Portfolio Analysis"}
                  </>
                )}
              </Button>

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <HealthBadge health={analysis.report.health} />
                  <span className="text-xs text-neutral-500">
                    {analysis.report.riskLevel} Risk
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Insights Strip */}
        <div className="border-t border-neutral-100 bg-neutral-50/30">
          <div className="flex items-center justify-between px-6 pt-4 pb-2 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-100 rounded-lg">
                <Activity className="h-3.5 w-3.5 text-neutral-600" />
              </div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Quick Insights
              </span>
              {inline && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Live
                </span>
              )}
            </div>
          </div>

          <div className="px-6 pb-5 lg:px-8">
            <AnimatePresence mode="wait">
              {inlineLoading && !inline ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-[72px] bg-neutral-100 border border-neutral-200 rounded-xl animate-pulse" />
                  ))}
                </motion.div>
              ) : inline ? (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
                >
                  <InsightPill icon={PieChart} label="Health" value={inline.healthBadge} iconColor="text-indigo-500" />
                  <InsightPill icon={TrendingUp} label="Performance" value={inline.performanceNote} iconColor="text-emerald-500" />
                  <InsightPill icon={BarChart3} label="Top Performer" value={inline.topPerformer} iconColor="text-violet-500" />
                  {inline.riskFlag && (
                    <InsightPill icon={ShieldAlert} label="Risk Alert" value={inline.riskFlag} variant="risk" />
                  )}
                  {inline.actionNeeded && (
                    <InsightPill icon={Zap} label="Action Needed" value={inline.actionNeeded} variant="action" />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4 text-neutral-400"
                >
                  <p className="text-sm">Loading insights...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MAIN GRID */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Left Column */}
        <div className="space-y-6 min-w-0">
          {/* AI Analysis Section */}
          <div ref={analysisRef}>
            <AnimatePresence mode="wait">
              {/* Tier Limit */}
              {tierError && (
                <motion.div
                  key="tier-error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <UpgradeGate
                    feature="Portfolio Analysis"
                    plan={tierError.plan}
                    message={tierError.message}
                  />
                </motion.div>
              )}

              {/* Error */}
              {aiError && !tierError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="text-sm font-semibold text-rose-800">Analysis failed</p>
                      <p className="text-xs text-rose-600">{aiError}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetAi}
                    className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* Loading */}
              {analysisLoading && !analysis && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AnalysisLoader
                    variant="portfolio"
                    subject={`${data.positionsCount} positions`}
                  />
                </motion.div>
              )}

              {/* Analysis Result */}
              {analysis && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900">Portfolio Analysis</h2>
                        <p className="text-xs text-neutral-500">AI-powered insights & recommendations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={fetchFullAnalysis}
                        variant="outline"
                        size="sm"
                        disabled={analysisLoading}
                        className="h-9 text-xs font-medium rounded-lg bg-white"
                      >
                        <RefreshCcw className={cn("h-3.5 w-3.5 mr-2", analysisLoading && "animate-spin")} />
                        Regenerate
                      </Button>
                      <button
                        onClick={resetAi}
                        className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <PortfolioAnalysisCard data={analysis} />
                </motion.div>
              )}

              {/* CTA when no analysis */}
              {!analysis && !analysisLoading && !aiError && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white border border-indigo-100/50 rounded-2xl p-4 sm:p-6 lg:p-8"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-start gap-5 max-w-xl">
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-50 shrink-0">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">
                          AI Portfolio Analysis
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                          Get AI-powered insights on diversification, risk exposure, and optimization opportunities.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                            <PieChart className="h-3 w-3 mr-1.5 text-indigo-500" />
                            Allocation
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                            <ShieldAlert className="h-3 w-3 mr-1.5 text-rose-500" />
                            Risk Check
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                            <Zap className="h-3 w-3 mr-1.5 text-amber-500" />
                            Action Items
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={fetchFullAnalysis}
                      size="lg"
                      className="w-full md:w-auto shrink-0 h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Portfolio
                      <ChevronRight className="h-4 w-4 ml-1 opacity-70" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Top Holdings (full width on mobile, here on desktop) */}
          <div className="xl:hidden">
            <TopHoldings 
              holdings={data.topPositions} 
              loading={loading} 
              currency={ccy} 
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Connections */}
          <ConnectionsCard connections={data.connections} />

          {/* Top Holdings (desktop only) */}
          <div className="hidden xl:block">
            <TopHoldings 
              holdings={data.topPositions} 
              loading={loading} 
              currency={ccy} 
            />
          </div>

          {/* Allocations */}
          <AllocationSection allocations={data.allocations} />
        </div>
      </div>
    </Page>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function MiniStat({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-neutral-900">{value}</span>
        <span
          className={cn(
            "text-xs font-bold",
            positive ? "text-emerald-600" : "text-rose-600"
          )}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

function InsightPill({
  icon: Icon,
  label,
  value,
  iconColor,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconColor?: string;
  variant?: "default" | "risk" | "action";
}) {
  if (!value) return null;

  const styles = {
    default: "bg-neutral-50 border-neutral-200",
    risk: "bg-rose-50 border-rose-100",
    action: "bg-amber-50 border-amber-100",
  }[variant];

  const finalIconColor = iconColor || {
    default: "text-neutral-500",
    risk: "text-rose-500",
    action: "text-amber-600",
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-3.5 rounded-xl border flex flex-col justify-between h-full min-h-[72px]", styles)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", finalIconColor)} />
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          variant === "risk" ? "text-rose-400" :
          variant === "action" ? "text-amber-500" :
          "text-neutral-400"
        )}>
          {label}
        </span>
      </div>
      <p className={cn(
        "text-sm font-semibold leading-tight line-clamp-2",
        variant === "risk" ? "text-rose-900" :
        variant === "action" ? "text-amber-900" :
        "text-neutral-900"
      )}>
        {value}
      </p>
    </motion.div>
  );
}

function HealthBadge({ health }: { health: string }) {
  const config = {
    Excellent: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    Good: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    Fair: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "Needs Attention": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  }[health] || { bg: "bg-neutral-50", text: "text-neutral-700", border: "border-neutral-200" };

  return (
    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", config.bg, config.text, config.border)}>
      {health}
    </span>
  );
}

function ConnectionsCard({ connections }: { connections?: any[] }) {
  const hasConnections = (connections?.length ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Connections
        </h3>
        <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
          <Link href="/connections">
            Manage
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="p-4 space-y-2">
        {!hasConnections ? (
          <Button asChild variant="outline" className="w-full rounded-xl border-dashed h-12">
            <Link href="/connections" className="text-sm gap-2">
              <Plus className="h-4 w-4" />
              Connect Account
            </Link>
          </Button>
        ) : (
          connections?.slice(0, 3).map((c: any) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ProviderAvatar name={c.institutionName} className="h-9 w-9" />
                <span className="text-sm font-medium text-neutral-700 truncate">
                  {c.institutionName}
                </span>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AllocationSection({ allocations }: { allocations?: any }) {
  const byType = allocations?.byType ?? [];
  const byAccount = allocations?.byAccount ?? [];

  if (!byType.length && !byAccount.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
        Allocation
      </h3>
      
      {byType.length > 0 && (
        <AllocationCard title="By Asset Type" items={byType} />
      )}
      
      {byAccount.length > 0 && (
        <AllocationCard title="By Account" items={byAccount} />
      )}
    </div>
  );
}

function AllocationCard({ title, items }: { title: string; items: any[] }) {
  const colors = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-cyan-500",
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
      <p className="text-sm font-semibold text-neutral-800 mb-3">{title}</p>
      
      {/* Stacked Bar */}
      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden flex">
        {items.map((item: any, i: number) => (
          <div
            key={item.key || item.label || i}
            className={cn("h-full", colors[i % colors.length])}
            style={{ width: `${item.weight || item.percentage || 0}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {items.slice(0, 4).map((item: any, i: number) => (
          <div key={item.key || item.label || i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", colors[i % colors.length])} />
              <span className="text-neutral-600">{item.key || item.label}</span>
            </div>
            <span className="font-semibold text-neutral-900 tabular-nums">
              {(item.weight || item.percentage || 0).toFixed(1)}%
            </span>
          </div>
        ))}
        {items.length > 4 && (
          <p className="text-[10px] text-neutral-400 pt-1">
            +{items.length - 4} more
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <Page className="space-y-6">
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </Page>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
      <div className="p-4 bg-rose-50 rounded-2xl w-fit mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-rose-400" />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 mb-2">
        Couldn&apos;t load portfolio
      </h2>
      <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
        We had trouble loading your portfolio data. This could be a temporary
        issue — please try again.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={onRetry} className="rounded-xl">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/connections">Go to Connections</Link>
        </Button>
      </div>
    </div>
  );
}

function WelcomeState({ hasConnections }: { hasConnections: boolean }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <div className="relative mx-auto mb-6 w-fit">
            <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-100 opacity-40 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 mx-auto">
              <Sparkles className="h-9 w-9 text-indigo-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
            Welcome to your portfolio
          </h1>
          <p className="text-neutral-500 max-w-md mx-auto leading-relaxed">
            {hasConnections
              ? "Your account is connected — holdings will appear here once they sync. You can also add holdings manually."
              : "Get started by connecting your brokerage account or adding holdings manually. Your AI-powered dashboard will come to life once you have positions."}
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Connect Account */}
        <Link
          href="/connections"
          className="group bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 hover:border-indigo-200 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                {hasConnections ? "Manage Connections" : "Connect Account"}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {hasConnections
                  ? "Check sync status, add more brokerages, or refresh your holdings."
                  : "Link your brokerage through Plaid to automatically import all your holdings."}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0 mt-1 group-hover:text-indigo-400 transition-colors" />
          </div>
        </Link>

        {/* Add Manually */}
        <Link
          href="/holdings"
          className="group bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 hover:border-emerald-200 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                Add Holdings Manually
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Quickly add stocks, ETFs, or crypto you own. Search by ticker to auto-fill details.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0 mt-1 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* What you'll get */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
          What you&apos;ll unlock
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <BarChart3 className="h-4 w-4" />, label: "Portfolio Analytics", desc: "P/L tracking, allocation breakdowns" },
            { icon: <Sparkles className="h-4 w-4" />, label: "AI Analysis", desc: "Personalized insights and recommendations" },
            { icon: <ShieldAlert className="h-4 w-4" />, label: "Risk Metrics", desc: "Sharpe ratio, volatility, concentration" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">{item.label}</p>
                <p className="text-[11px] text-neutral-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortfolioOverview;
