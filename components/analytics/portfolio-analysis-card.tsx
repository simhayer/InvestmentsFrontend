// components/ai/PortfolioAnalysisCard.tsx
"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Zap,
  PieChart,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Activity,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PortfolioAnalysisResponse,
  PortfolioHealth,
  PortfolioRiskMetrics,
  RiskLevel,
  ActionItem,
} from "@/types/portfolio-analysis";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PortfolioAnalysisCardProps {
  data: PortfolioAnalysisResponse;
  className?: string;
}

export function PortfolioAnalysisCard({ data, className }: PortfolioAnalysisCardProps) {
  const { report, portfolioSummary, riskMetrics, dataGaps } = data;

  // Check if we have urgent actions to highlight
  const hasActions = report.rebalancingSuggestions.length > 0 || report.actionItems.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. HERO: Health Overview */}
      <HealthOverviewCard
        health={report.health}
        riskLevel={report.riskLevel}
        summary={report.summary}
        portfolioSummary={portfolioSummary}
      />

      {/* 2. RISK DASHBOARD: Quantitative metrics + benchmark */}
      {riskMetrics && <RiskDashboard metrics={riskMetrics} />}

      {/* 3. STRATEGY: Action Plan (If applicable) */}
      {hasActions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.actionItems.length > 0 && (
            <StructuredActionSection
              title="Priority Actions"
              icon={Zap}
              items={report.actionItems}
            />
          )}
          {report.rebalancingSuggestions.length > 0 && (
            <ActionSection
              title="Rebalancing Opportunities"
              icon={PieChart}
              items={report.rebalancingSuggestions}
              variant="secondary"
            />
          )}
        </div>
      )}

      {/* 4. FUNDAMENTALS: Assessment Grid with Visual Meters */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900">Portfolio Fundamentals</h3>
        </div>
        <div className="divide-y md:divide-y-0 md:divide-x divide-neutral-100 grid grid-cols-1 md:grid-cols-3">
          <AssessmentRow
            title="Diversification"
            icon={PieChart}
            assessment={report.diversification.assessment}
            detail={report.diversification.detail}
          />
          <AssessmentRow
            title="Performance"
            icon={TrendingUp}
            assessment={report.performance.assessment}
            detail={report.performance.detail}
          />
          <AssessmentRow
            title="Risk Exposure"
            icon={Shield}
            assessment={report.riskExposure.assessment}
            detail={report.riskExposure.detail}
          />
        </div>
      </div>

      {/* 5. DEEP DIVE: Unified SWOT Matrix */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900">Deep Dive Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          <SwotQuadrant
            title="Strengths"
            icon={CheckCircle2}
            items={report.strengths}
            color="emerald"
          />
          <SwotQuadrant
            title="Weaknesses"
            icon={XCircle}
            items={report.weaknesses}
            color="rose"
          />
          <SwotQuadrant
            title="Opportunities"
            icon={Lightbulb}
            items={report.opportunities}
            color="blue"
          />
          <SwotQuadrant
            title="Risks"
            icon={AlertTriangle}
            items={report.risks}
            color="amber"
          />
        </div>
      </div>

      {/* 6. SPECIFICS: Position Insights */}
      {(report.topConviction.length > 0 || report.concerns.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.topConviction.length > 0 && (
            <PositionList
              title="High Conviction Holdings"
              items={report.topConviction}
              variant="positive"
            />
          )}
          {report.concerns.length > 0 && (
            <PositionList
              title="Areas of Concern"
              items={report.concerns}
              variant="negative"
            />
          )}
        </div>
      )}

      {/* 7. FOOTER: Data Gaps */}
      {dataGaps.length > 0 && <DataGapsCard gaps={dataGaps} />}
    </div>
  );
}

// ============================================================================
// COMPONENT: HEALTH OVERVIEW (Polished)
// ============================================================================

function HealthOverviewCard({
  health,
  riskLevel,
  summary,
  portfolioSummary,
}: {
  health: PortfolioHealth;
  riskLevel: RiskLevel;
  summary: string;
  portfolioSummary: PortfolioAnalysisResponse["portfolioSummary"];
}) {
  const healthConfig = {
    Excellent: { bg: "bg-emerald-600", icon: CheckCircle2 },
    Good: { bg: "bg-indigo-600", icon: TrendingUp },
    Fair: { bg: "bg-amber-500", icon: Activity },
    "Needs Attention": { bg: "bg-rose-600", icon: AlertTriangle },
  }[health];

  const Icon = healthConfig.icon;
  const plPositive = portfolioSummary.totalPL >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
    >
      {/* Hero Header */}
      <div className={cn("px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4", healthConfig.bg)}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                Portfolio Health
              </p>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                {riskLevel} Risk
              </span>
            </div>
            <p className="text-white text-2xl font-bold tracking-tight">{health}</p>
          </div>
        </div>
        
        {/* Key KPI - Right aligned on desktop */}
        <div className="flex items-end flex-col text-white">
             <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Total Return</p>
             <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                    {plPositive ? "+" : ""}{portfolioSummary.totalPLPct.toFixed(1)}%
                </span>
                <span className="text-sm opacity-80 font-medium">
                    ({plPositive ? "+" : ""}${Math.abs(portfolioSummary.totalPL).toLocaleString()})
                </span>
             </div>
        </div>
      </div>

      {/* Summary Text */}
      <div className="p-6 border-b border-neutral-100">
        <p className="text-neutral-600 leading-relaxed text-base">{summary}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-neutral-100 bg-neutral-50/50">
        <StatBox
          label="Market Value"
          value={`$${portfolioSummary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <StatBox
          label="Positions"
          value={portfolioSummary.positionCount.toString()}
        />
        <StatBox
          label="Day Change"
          value={`${portfolioSummary.dayPL >= 0 ? "+" : ""}$${Math.abs(portfolioSummary.dayPL).toLocaleString()}`}
          positive={portfolioSummary.dayPL >= 0}
        />
         <StatBox
          label="Cash Balance"
          value="--" // Placeholder if not in summary
          isLast
        />
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, positive, isLast }: { label: string; value: string; positive?: boolean; isLast?: boolean }) {
    return (
        <div className={cn("p-4 flex flex-col items-center text-center", !isLast && "")}>
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">{label}</span>
            <span className={cn(
                "text-base font-bold",
                positive === true && "text-emerald-600",
                positive === false && "text-rose-600",
                positive === undefined && "text-neutral-900"
            )}>
                {value}
            </span>
        </div>
    )
}

// ============================================================================
// COMPONENT: FUNDAMENTALS ROW (With Visual Meters)
// ============================================================================

function AssessmentRow({
  title,
  icon: Icon,
  assessment,
  detail,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  assessment: string;
  detail: string;
}) {
  // Determine meter color/value roughly based on text
  // In a real app, the API should return a score (0-100)
  const isPositive = ["Well", "Strong", "Low", "Excellent"].some(t => assessment.includes(t));
  const isNegative = ["High", "Weak", "Concentrated"].some(t => assessment.includes(t));
  
  const meterColor = isPositive ? "bg-emerald-500" : isNegative ? "bg-rose-500" : "bg-amber-500";
  const trackColor = isPositive ? "bg-emerald-100" : isNegative ? "bg-rose-100" : "bg-amber-100";
  // Fake percentage for visual
  const width = isPositive ? "90%" : isNegative ? "40%" : "65%";

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-neutral-400" />
        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{title}</h4>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between items-end mb-2">
            <span className="text-lg font-bold text-neutral-900">{assessment}</span>
        </div>
        {/* Visual Meter */}
        <div className={cn("h-1.5 w-full rounded-full", trackColor)}>
            <div className={cn("h-full rounded-full", meterColor)} style={{ width }} />
        </div>
      </div>

      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
        {detail}
      </p>
    </div>
  );
}

// ============================================================================
// COMPONENT: ACTION SECTION
// ============================================================================

function ActionSection({
  title,
  icon: Icon,
  items,
  variant
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  variant: "primary" | "secondary"
}) {
    const isPrimary = variant === "primary";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        "rounded-2xl border p-5",
        isPrimary ? "bg-indigo-50 border-indigo-100" : "bg-white border-neutral-200"
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("p-1.5 rounded-lg", isPrimary ? "bg-indigo-100" : "bg-neutral-100")}>
            <Icon className={cn("h-4 w-4", isPrimary ? "text-indigo-600" : "text-neutral-500")} />
        </div>
        <h3 className={cn("text-sm font-bold", isPrimary ? "text-indigo-900" : "text-neutral-800")}>{title}</h3>
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <ArrowRight className={cn(
              "h-4 w-4 mt-0.5 shrink-0",
              isPrimary ? "text-indigo-500" : "text-neutral-400"
            )} />
            <span className={cn(isPrimary ? "text-indigo-800" : "text-neutral-600")}>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ============================================================================
// COMPONENT: SWOT QUADRANT (Unified)
// ============================================================================

function SwotQuadrant({
  title,
  items,
  color,
  icon: Icon,
}: {
  title: string;
  items: string[];
  color: "emerald" | "rose" | "blue" | "amber";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const styles = {
    emerald: { text: "text-emerald-700", icon: "text-emerald-500", bg: "bg-emerald-500" },
    rose: { text: "text-rose-700", icon: "text-rose-500", bg: "bg-rose-500" },
    blue: { text: "text-blue-700", icon: "text-blue-500", bg: "bg-blue-500" },
    amber: { text: "text-amber-700", icon: "text-amber-500", bg: "bg-amber-500" },
  }[color];

  if (items.length === 0) return null;

  return (
    <div className="p-6 hover:bg-neutral-50/50 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={cn("h-4 w-4", styles.icon)} />
        <h3 className={cn("text-sm font-bold", styles.text)}>{title}</h3>
      </div>

      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-neutral-600">
            <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-60", styles.bg)} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// COMPONENT: POSITION LIST (Specifics)
// ============================================================================

function PositionList({
    title,
    items,
    variant
}: {
    title: string;
    items: Array<{ symbol: string; reasoning?: string; issue?: string }>;
    variant: "positive" | "negative"
}) {
    const isPos = variant === "positive";

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
                {isPos ? <Target className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-rose-500" />}
                <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
            </div>
            
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                         <span className={cn(
                             "px-2 py-1 rounded text-[10px] font-bold h-fit mt-0.5",
                             isPos ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                         )}>
                             {item.symbol}
                         </span>
                         <p className="text-sm text-neutral-600 leading-snug">
                             {item.reasoning || item.issue}
                         </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================================================
// COMPONENT: RISK DASHBOARD (Quantitative metrics + benchmark)
// ============================================================================

function RiskDashboard({ metrics }: { metrics: PortfolioRiskMetrics }) {
  const bench = metrics.benchmark;
  const perSymbol = metrics.per_symbol || {};
  const symbolEntries = Object.entries(perSymbol).slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
    >
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-neutral-900">Risk & Benchmark Dashboard</h3>
        </div>
        <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Trailing 1Y</span>
      </div>

      {/* Portfolio-level metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-neutral-100 border-b border-neutral-100">
        <RiskStat
          label="Portfolio Beta"
          value={metrics.portfolio_beta != null ? metrics.portfolio_beta.toFixed(2) : "—"}
          sub={metrics.portfolio_beta != null ? (metrics.portfolio_beta > 1.2 ? "Above market" : metrics.portfolio_beta < 0.8 ? "Defensive" : "Near market") : undefined}
          color={metrics.portfolio_beta != null ? (metrics.portfolio_beta > 1.3 ? "rose" : metrics.portfolio_beta < 0.8 ? "emerald" : "neutral") : "neutral"}
        />
        <RiskStat
          label="Volatility"
          value={metrics.portfolio_volatility_weighted != null ? `${(metrics.portfolio_volatility_weighted * 100).toFixed(1)}%` : "—"}
          sub="Weighted annual"
        />
        <RiskStat
          label="HHI Concentration"
          value={metrics.hhi_concentration != null ? metrics.hhi_concentration.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—"}
          sub={metrics.hhi_concentration != null ? (metrics.hhi_concentration > 2500 ? "Concentrated" : metrics.hhi_concentration > 1500 ? "Moderate" : "Diversified") : undefined}
          color={metrics.hhi_concentration != null ? (metrics.hhi_concentration > 2500 ? "rose" : metrics.hhi_concentration > 1500 ? "amber" : "emerald") : "neutral"}
        />
        <RiskStat
          label="Avg Correlation"
          value={metrics.avg_correlation_top_holdings != null ? metrics.avg_correlation_top_holdings.toFixed(2) : "—"}
          sub={metrics.avg_correlation_top_holdings != null ? (metrics.avg_correlation_top_holdings > 0.7 ? "High — low diversification" : metrics.avg_correlation_top_holdings > 0.4 ? "Moderate" : "Low — well diversified") : undefined}
          color={metrics.avg_correlation_top_holdings != null ? (metrics.avg_correlation_top_holdings > 0.7 ? "rose" : metrics.avg_correlation_top_holdings > 0.4 ? "amber" : "emerald") : "neutral"}
        />
      </div>

      {/* Benchmark comparison */}
      {bench && (
        <div className="px-5 py-4 border-b border-neutral-100 bg-indigo-50/30">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">vs S&P 500 (SPY)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {bench.annualized_return != null && (
              <BenchmarkStat label="SPY Return" value={`${(bench.annualized_return * 100).toFixed(1)}%`} />
            )}
            {bench.volatility != null && (
              <BenchmarkStat label="SPY Volatility" value={`${(bench.volatility * 100).toFixed(1)}%`} />
            )}
            {bench.max_drawdown != null && (
              <BenchmarkStat label="SPY Max Drawdown" value={`${(bench.max_drawdown * 100).toFixed(1)}%`} />
            )}
            {bench.sharpe_ratio != null && (
              <BenchmarkStat label="SPY Sharpe" value={bench.sharpe_ratio.toFixed(2)} />
            )}
          </div>
        </div>
      )}

      {/* Per-symbol risk table */}
      {symbolEntries.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Per-Holding Risk</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-neutral-400 font-medium uppercase tracking-wider border-b border-neutral-100">
                  <th className="text-left pb-2 pr-3">Symbol</th>
                  <th className="text-right pb-2 px-2">Beta</th>
                  <th className="text-right pb-2 px-2">Volatility</th>
                  <th className="text-right pb-2 px-2">Max DD</th>
                  <th className="text-right pb-2 px-2">Sharpe</th>
                  <th className="text-right pb-2 pl-2">Sortino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {symbolEntries.map(([sym, m]) => (
                  <tr key={sym} className="text-neutral-600 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-2 pr-3 font-bold text-neutral-900">{sym}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{m.beta != null ? m.beta.toFixed(2) : "—"}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{m.volatility_annualized != null ? `${(m.volatility_annualized * 100).toFixed(1)}%` : "—"}</td>
                    <td className={cn("py-2 px-2 text-right tabular-nums", m.max_drawdown != null && m.max_drawdown < -0.3 ? "text-rose-600 font-medium" : "")}>
                      {m.max_drawdown != null ? `${(m.max_drawdown * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className={cn("py-2 px-2 text-right tabular-nums", m.sharpe_ratio != null && m.sharpe_ratio > 1 ? "text-emerald-600 font-medium" : "")}>
                      {m.sharpe_ratio != null ? m.sharpe_ratio.toFixed(2) : "—"}
                    </td>
                    <td className="py-2 pl-2 text-right tabular-nums">{m.sortino_ratio != null ? m.sortino_ratio.toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function RiskStat({
  label,
  value,
  sub,
  color = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "rose" | "amber" | "neutral";
}) {
  const subColor = {
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    neutral: "text-neutral-400",
  }[color];

  return (
    <div className="p-4 flex flex-col items-center text-center">
      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">{label}</span>
      <span className="text-lg font-bold text-neutral-900 tabular-nums">{value}</span>
      {sub && <span className={cn("text-[10px] mt-0.5", subColor)}>{sub}</span>}
    </div>
  );
}

function BenchmarkStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg px-3 py-2 border border-indigo-100/60">
      <span className="text-[10px] text-indigo-400 font-medium block mb-0.5">{label}</span>
      <span className="text-sm font-bold text-indigo-900 tabular-nums">{value}</span>
    </div>
  );
}


// ============================================================================
// COMPONENT: STRUCTURED ACTION ITEMS
// ============================================================================

const ACTION_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  reduce: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", label: "REDUCE" },
  sell: { bg: "bg-rose-50 border-rose-100", text: "text-rose-700", label: "SELL" },
  add: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "ADD" },
  buy: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "BUY" },
  hold: { bg: "bg-blue-50 border-blue-100", text: "text-blue-700", label: "HOLD" },
};

function StructuredActionSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ActionItem[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border bg-indigo-50 border-indigo-100 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-100">
          <Icon className="h-4 w-4 text-indigo-600" />
        </div>
        <h3 className="text-sm font-bold text-indigo-900">{title}</h3>
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => {
          const config = ACTION_CONFIG[item.action] || ACTION_CONFIG.hold;
          return (
            <li key={i} className="flex gap-3 text-sm items-start">
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border", config.bg, config.text)}>
                  {config.label}
                </span>
                {item.symbol && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-neutral-200 text-neutral-800">
                    {item.symbol}
                  </span>
                )}
              </div>
              <span className="text-indigo-800 leading-snug">{item.reasoning}</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}


// ============================================================================
// COMPONENT: DATA GAPS
// ============================================================================

function DataGapsCard({ gaps }: { gaps: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3 flex items-start gap-3">
      <div className="p-1 bg-amber-100 rounded-full shrink-0">
         <Activity className="h-3 w-3 text-amber-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Data Limitations</p>
        <p className="text-xs text-amber-700/80">
          Analysis limited for: {gaps.join(", ")}
        </p>
      </div>
    </div>
  );
}

export default PortfolioAnalysisCard;