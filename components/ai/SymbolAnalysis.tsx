// components/ai/StockAnalysisCard.tsx
"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  AlertTriangle,
  Zap,
  Target,
  BarChart3,
  DollarSign,
  Activity,
  ChevronRight,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StockAnalysisResponse,
  AnalysisReport,
  Verdict,
  Confidence,
  Assessment,
} from "@/types/symbol_analysis";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface StockAnalysisCardProps {
  data: StockAnalysisResponse;
  className?: string;
}

export function StockAnalysisCard({ data, className }: StockAnalysisCardProps) {
  const { report, dataGaps } = data;

  return (
    <div className={cn("space-y-5", className)}>
      {/* Hero: Summary + Verdict */}
      <SummaryHero report={report} />

      {/* Bull vs Bear Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CaseCard
          title="Bull Case"
          icon={TrendingUp}
          items={report.bullCase}
          variant="bull"
        />
        <CaseCard
          title="Bear Case"
          icon={TrendingDown}
          items={report.bearCase}
          variant="bear"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Valuation"
          icon={DollarSign}
          assessment={report.valuation.assessment as Assessment}
          reasoning={report.valuation.reasoning}
        />
        <MetricCard
          title="Profitability"
          icon={BarChart3}
          assessment={report.profitability.assessment as Assessment}
          reasoning={report.profitability.reasoning}
        />
        <MetricCard
          title="Financial Health"
          icon={Shield}
          assessment={report.financialHealth.assessment as Assessment}
          reasoning={report.financialHealth.reasoning}
        />
      </div>

      {/* Momentum Row */}
      <MomentumRow momentum={report.momentum} />

      {/* Risks & Catalysts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListCard
          title="Key Risks"
          icon={AlertTriangle}
          items={report.risks}
          variant="risk"
        />
        <ListCard
          title="Catalysts"
          icon={Zap}
          items={report.catalysts}
          variant="catalyst"
        />
      </div>

      {/* Technical & Peer Notes */}
      {(report.technicalNotes || report.peerComparison) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.technicalNotes && (
            <NoteCard title="Technical Position" content={report.technicalNotes} />
          )}
          {report.peerComparison && (
            <NoteCard title="Peer Comparison" content={report.peerComparison} />
          )}
        </div>
      )}

      {/* Data Gaps */}
      {dataGaps.length > 0 && <DataGaps gaps={dataGaps} />}
    </div>
  );
}

// ============================================================================
// SUMMARY HERO
// ============================================================================

function SummaryHero({ report }: { report: AnalysisReport }) {
  const verdictConfig = {
    Bullish: {
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: TrendingUp,
    },
    Bearish: {
      gradient: "from-rose-500 to-red-600",
      bg: "bg-rose-50",
      text: "text-rose-700",
      icon: TrendingDown,
    },
    Neutral: {
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: Minus,
    },
  }[report.verdict];

  const Icon = verdictConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
    >
      {/* Verdict Banner */}
      <div
        className={cn(
          "px-6 py-4 flex items-center justify-between",
          `bg-gradient-to-r ${verdictConfig.gradient}`
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
              AI Verdict
            </p>
            <p className="text-white text-xl font-black">{report.verdict}</p>
          </div>
        </div>
        <ConfidenceMeter confidence={report.confidence} />
      </div>

      {/* Summary Text */}
      <div className="p-6">
        <p className="text-slate-700 leading-relaxed">{report.summary}</p>
      </div>
    </motion.div>
  );
}

function ConfidenceMeter({ confidence }: { confidence: Confidence }) {
  const levels = { High: 3, Medium: 2, Low: 1 };
  const level = levels[confidence];

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 rounded-full transition-all",
              i <= level ? "bg-white" : "bg-white/30",
              i === 1 ? "h-3" : i === 2 ? "h-4" : "h-5"
            )}
          />
        ))}
      </div>
      <span className="text-white/80 text-[10px] font-medium uppercase">
        {confidence}
      </span>
    </div>
  );
}

// ============================================================================
// CASE CARDS (Bull/Bear)
// ============================================================================

function CaseCard({
  title,
  icon: Icon,
  items,
  variant,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  variant: "bull" | "bear";
}) {
  const config = {
    bull: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      bullet: "bg-emerald-500",
      arrow: ArrowUpRight,
    },
    bear: {
      bg: "bg-gradient-to-br from-rose-50 to-red-50",
      border: "border-rose-100",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      bullet: "bg-rose-500",
      arrow: ArrowDownRight,
    },
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn("rounded-2xl border p-5", config.bg, config.border)}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className={cn("p-2 rounded-xl", config.iconBg)}>
          <Icon className={cn("h-4 w-4", config.iconColor)} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <config.arrow
              className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)}
            />
            <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ============================================================================
// METRIC CARD
// ============================================================================

function getAssessmentStyle(assessment: Assessment) {
  const positive = ["Cheap", "Strong", "Solid"];
  const negative = ["Expensive", "Weak", "Concerning"];

  if (positive.includes(assessment)) {
    return { pill: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" };
  }
  if (negative.includes(assessment)) {
    return { pill: "bg-rose-100 text-rose-700", bar: "bg-rose-500" };
  }
  return { pill: "bg-amber-100 text-amber-700", bar: "bg-amber-500" };
}

function MetricCard({
  title,
  icon: Icon,
  assessment,
  reasoning,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  assessment: Assessment;
  reasoning: string;
}) {
  const style = getAssessmentStyle(assessment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white border border-slate-200 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
        </div>
        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", style.pill)}>
          {assessment}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{reasoning}</p>
    </motion.div>
  );
}

// ============================================================================
// MOMENTUM ROW
// ============================================================================

function MomentumRow({ momentum }: { momentum: AnalysisReport["momentum"] }) {
  const earningsStyle = {
    Beating: { bg: "bg-emerald-100", text: "text-emerald-700", icon: TrendingUp },
    Mixed: { bg: "bg-amber-100", text: "text-amber-700", icon: Minus },
    Missing: { bg: "bg-rose-100", text: "text-rose-700", icon: TrendingDown },
  }[momentum.earningsTrend];

  const growthStyle = {
    Accelerating: { bg: "bg-emerald-100", text: "text-emerald-700", icon: TrendingUp },
    Stable: { bg: "bg-amber-100", text: "text-amber-700", icon: Minus },
    Decelerating: { bg: "bg-rose-100", text: "text-rose-700", icon: TrendingDown },
  }[momentum.growthTrajectory];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border border-slate-200 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Momentum
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2">Earnings Trend</p>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm",
              earningsStyle.bg,
              earningsStyle.text
            )}
          >
            <earningsStyle.icon className="h-4 w-4" />
            {momentum.earningsTrend}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2">Growth Trajectory</p>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm",
              growthStyle.bg,
              growthStyle.text
            )}
          >
            <growthStyle.icon className="h-4 w-4" />
            {momentum.growthTrajectory}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LIST CARD
// ============================================================================

function ListCard({
  title,
  icon: Icon,
  items,
  variant,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  variant: "risk" | "catalyst";
}) {
  const config = {
    risk: { iconColor: "text-rose-500", bulletColor: "text-rose-400" },
    catalyst: { iconColor: "text-amber-500", bulletColor: "text-amber-400" },
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white border border-slate-200 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={cn("h-4 w-4", config.iconColor)} />
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>

      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <ChevronRight className={cn("h-4 w-4 mt-0.5 shrink-0", config.bulletColor)} />
            <span className="text-sm text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ============================================================================
// NOTE CARD
// ============================================================================

function NoteCard({ title, content }: { title: string; content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
    >
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
    </motion.div>
  );
}

// ============================================================================
// DATA GAPS
// ============================================================================

function DataGaps({ gaps }: { gaps: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800 mb-1">
          Some data was unavailable
        </p>
        <ul className="text-xs text-amber-700 space-y-0.5">
          {gaps.slice(0, 3).map((gap, i) => (
            <li key={i}>• {gap}</li>
          ))}
          {gaps.length > 3 && (
            <li className="text-amber-600 font-medium">+{gaps.length - 3} more</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default StockAnalysisCard;
