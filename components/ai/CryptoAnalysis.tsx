"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  ChevronRight,
  Info,
  Target,
  Shield,
  BarChart3,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CryptoAnalysisResponse, CryptoAnalysisReport, Confidence } from "@/types/crypto_analysis";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CryptoAnalysisCardProps {
  data: CryptoAnalysisResponse;
  className?: string;
}

export function CryptoAnalysisCard({ data, className }: CryptoAnalysisCardProps) {
  const { report, riskMetrics, dataGaps } = data;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. HERO: Verdict Card */}
      <VerdictCard report={report} />

      {/* 2. CORE: Investment Thesis */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900">
            Investment Thesis
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          <ThesisSection title="Bull Case" items={report.bullCase} variant="bull" />
          <ThesisSection title="Bear Case" items={report.bearCase} variant="bear" />
        </div>
      </div>

      {/* 3. ASSESSMENTS: Market Position, Risk Profile, Price Action */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900">
            Asset Profile
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CryptoAssessmentCard
              title="Market Position"
              icon={<BarChart3 className="h-4 w-4" />}
              assessment={report.marketPosition.assessment}
              detail={report.marketPosition.reasoning}
              type="position"
            />
            <CryptoAssessmentCard
              title="Risk Profile"
              icon={<Shield className="h-4 w-4" />}
              assessment={report.riskProfile.assessment}
              detail={report.riskProfile.reasoning}
              type="risk"
            />
            <CryptoAssessmentCard
              title="Price Action"
              icon={<Activity className="h-4 w-4" />}
              assessment={report.priceAction.trend}
              detail={report.priceAction.reasoning}
              type="trend"
            />
          </div>
        </div>
      </div>

      {/* 4. Risk Metrics (quantitative) */}
      {riskMetrics && <RiskMetricsCard metrics={riskMetrics} />}

      {/* 5. OUTLOOK: Risks & Catalysts */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900">
            Market Outlook
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          <SimpleListSection
            title="Key Risks"
            icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
            items={report.risks}
            accentColor="rose"
          />
          <SimpleListSection
            title="Catalysts"
            icon={<Zap className="h-4 w-4 text-amber-500" />}
            items={report.catalysts}
            accentColor="amber"
          />
        </div>
      </div>

      {/* 6. FOOTER: Notes & Gaps */}
      <div className="space-y-4">
        {report.technicalNotes && (
          <NoteCard title="Technical Position" content={report.technicalNotes} />
        )}
        {dataGaps.length > 0 && <DataGapsCard gaps={dataGaps} />}
      </div>
    </div>
  );
}

// ============================================================================
// VERDICT CARD
// ============================================================================

function VerdictCard({ report }: { report: CryptoAnalysisReport }) {
  const config = {
    Bullish: { bg: "bg-emerald-600", icon: TrendingUp, label: "Bullish" },
    Bearish: { bg: "bg-rose-600", icon: TrendingDown, label: "Bearish" },
    Neutral: { bg: "bg-amber-500", icon: Minus, label: "Neutral" },
  }[report.verdict];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-md"
    >
      <div className={cn("px-6 py-5 flex items-center justify-between", config.bg)}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/80 font-medium mb-0.5">AI Verdict</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {config.label}
            </p>
          </div>
        </div>
        <ConfidenceIndicator confidence={report.confidence} />
      </div>

      <div className="p-6">
        <p className="text-neutral-700 leading-relaxed text-base">
          {report.summary}
        </p>
      </div>
    </motion.div>
  );
}

function ConfidenceIndicator({ confidence }: { confidence: Confidence }) {
  const levels = { High: 3, Medium: 2, Low: 1 };
  const n = levels[confidence];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-1 items-end">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 rounded-full transition-all",
              i <= n ? "bg-white" : "bg-white/30",
              i === 1 ? "h-3" : i === 2 ? "h-4" : "h-5"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-white/90 font-bold uppercase tracking-wide">
        {confidence} Conf.
      </span>
    </div>
  );
}

// ============================================================================
// CRYPTO ASSESSMENT CARD
// ============================================================================

function CryptoAssessmentCard({
  title,
  icon,
  assessment,
  detail,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  assessment: string;
  detail: string;
  type: "position" | "risk" | "trend";
}) {
  const color = getAssessmentColor(assessment, type);
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
  }[color];

  return (
    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-neutral-500">
          {icon}
          <span className="text-xs font-medium">{title}</span>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
            colorClasses
          )}
        >
          {assessment}
        </span>
      </div>
      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
        {detail}
      </p>
    </div>
  );
}

function getAssessmentColor(
  assessment: string,
  type: "position" | "risk" | "trend"
): string {
  const lower = assessment.toLowerCase();

  if (type === "position") {
    if (lower === "leader") return "emerald";
    if (lower === "mid-cap") return "blue";
    if (lower === "small-cap") return "amber";
    return "rose"; // micro-cap
  }

  if (type === "risk") {
    if (lower === "conservative") return "emerald";
    if (lower === "moderate") return "amber";
    if (lower === "aggressive") return "orange";
    return "rose"; // speculative
  }

  // trend
  if (lower === "uptrend" || lower === "recovery") return "emerald";
  if (lower === "sideways") return "amber";
  return "rose"; // downtrend
}

// ============================================================================
// RISK METRICS CARD (quantitative)
// ============================================================================

function RiskMetricsCard({ metrics }: { metrics: Record<string, unknown> }) {
  const vol = metrics.volatility_annualized as number | null;
  const mdd = metrics.max_drawdown as number | null;
  const sharpe = metrics.sharpe_ratio as number | null;
  const sortino = metrics.sortino_ratio as number | null;
  const beta = metrics.beta as number | null;

  const items = [
    vol != null && {
      label: "Volatility (1Y)",
      value: `${(vol * 100).toFixed(1)}%`,
      sub: vol < 0.5 ? "Moderate" : vol < 0.8 ? "High" : "Extreme",
    },
    mdd != null && {
      label: "Max Drawdown",
      value: `${(mdd * 100).toFixed(1)}%`,
      sub: mdd > -0.2 ? "Shallow" : mdd > -0.5 ? "Significant" : "Severe",
    },
    sharpe != null && {
      label: "Sharpe Ratio",
      value: sharpe.toFixed(2),
      sub: sharpe < 0 ? "Negative" : sharpe < 0.5 ? "Poor" : sharpe < 1 ? "Adequate" : "Good",
    },
    sortino != null && {
      label: "Sortino Ratio",
      value: sortino.toFixed(2),
      sub: sortino < 0 ? "Negative" : sortino < 1 ? "Low" : "Solid",
    },
    beta != null && {
      label: "Beta vs S&P 500",
      value: beta.toFixed(2),
      sub: Math.abs(beta) < 0.5 ? "Low correlation" : Math.abs(beta) < 1 ? "Moderate" : "High correlation",
    },
  ].filter(Boolean) as { label: string; value: string; sub: string }[];

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
        <Activity className="h-4 w-4 text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-900">
          Risk Metrics
        </h3>
        <span className="text-[10px] font-medium text-neutral-400 ml-auto">
          Trailing 1 Year
        </span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-lg font-bold text-neutral-900 tabular-nums">
                {item.value}
              </p>
              <p className="text-xs font-medium text-neutral-500 mt-0.5">
                {item.label}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// THESIS SECTIONS
// ============================================================================

function ThesisSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "bull" | "bear";
}) {
  const styles = {
    bull: {
      icon: TrendingUp,
      bgBadge: "bg-emerald-50 text-emerald-700",
      bullet: "text-emerald-500",
    },
    bear: {
      icon: TrendingDown,
      bgBadge: "bg-rose-50 text-rose-700",
      bullet: "text-rose-500",
    },
  }[variant];

  const Icon = styles.icon;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={cn("p-1.5 rounded-lg", styles.bgBadge)}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="text-sm font-bold text-neutral-800">{title}</h4>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-neutral-600 leading-relaxed">
            <ChevronRight className={cn("h-4 w-4 mt-0.5 shrink-0", styles.bullet)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// SIMPLE LIST (Risks & Catalysts)
// ============================================================================

function SimpleListSection({
  title,
  icon,
  items,
  accentColor,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  accentColor: "rose" | "amber";
}) {
  const bulletColor = accentColor === "rose" ? "text-rose-400" : "text-amber-400";

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-neutral-600">
            <ChevronRight className={cn("h-4 w-4 mt-0.5 shrink-0", bulletColor)} />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXTRAS: NoteCard & DataGaps
// ============================================================================

function NoteCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-neutral-400" />
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{content}</p>
    </div>
  );
}

function DataGapsCard({ gaps }: { gaps: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">Some data unavailable</p>
        <p className="text-xs text-amber-600 mt-0.5">
          {gaps.slice(0, 2).join(" • ")}
          {gaps.length > 2 && ` +${gaps.length - 2} more`}
        </p>
      </div>
    </div>
  );
}
