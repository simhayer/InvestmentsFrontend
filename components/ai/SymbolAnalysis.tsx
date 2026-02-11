// components/ai/StockAnalysisCard.tsx
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
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StockAnalysisResponse,
  AnalysisReport,
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
    <div className={cn("space-y-4", className)}>
      {/* Verdict + Summary */}
      <VerdictCard report={report} />

      {/* Bull vs Bear */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ThesisCard
          title="Bull Case"
          items={report.bullCase}
          variant="bull"
        />
        <ThesisCard
          title="Bear Case"
          items={report.bearCase}
          variant="bear"
        />
      </div>

      {/* Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AssessmentCard
          title="Valuation"
          assessment={report.valuation.assessment as Assessment}
          detail={report.valuation.reasoning}
        />
        <AssessmentCard
          title="Profitability"
          assessment={report.profitability.assessment as Assessment}
          detail={report.profitability.reasoning}
        />
        <AssessmentCard
          title="Financial Health"
          assessment={report.financialHealth.assessment as Assessment}
          detail={report.financialHealth.reasoning}
        />
      </div>

      {/* Momentum */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-700">Momentum</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-neutral-400 mb-2">Earnings Trend</p>
            <MomentumBadge
              value={report.momentum.earningsTrend}
              type="earnings"
            />
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-2">Growth Trajectory</p>
            <MomentumBadge
              value={report.momentum.growthTrajectory}
              type="growth"
            />
          </div>
        </div>
      </div>

      {/* Risks & Catalysts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimpleListCard
          title="Key Risks"
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          items={report.risks}
          accentColor="rose"
        />
        <SimpleListCard
          title="Catalysts"
          icon={<Zap className="h-4 w-4 text-amber-500" />}
          items={report.catalysts}
          accentColor="amber"
        />
      </div>

      {/* Notes */}
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
      {dataGaps.length > 0 && <DataGapsCard gaps={dataGaps} />}
    </div>
  );
}

// ============================================================================
// VERDICT CARD
// ============================================================================

function VerdictCard({ report }: { report: AnalysisReport }) {
  const config = {
    Bullish: {
      bg: "bg-emerald-500",
      icon: TrendingUp,
      label: "Bullish",
    },
    Bearish: {
      bg: "bg-rose-500",
      icon: TrendingDown,
      label: "Bearish",
    },
    Neutral: {
      bg: "bg-amber-500",
      icon: Minus,
      label: "Neutral",
    },
  }[report.verdict];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
    >
      {/* Header Bar */}
      <div className={cn("px-5 py-4 flex items-center justify-between", config.bg)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/70 font-medium">AI Verdict</p>
            <p className="text-lg font-bold text-white">{config.label}</p>
          </div>
        </div>
        <ConfidenceIndicator confidence={report.confidence} />
      </div>

      {/* Summary */}
      <div className="p-5">
        <p className="text-neutral-600 leading-relaxed">{report.summary}</p>
      </div>
    </motion.div>
  );
}

function ConfidenceIndicator({ confidence }: { confidence: Confidence }) {
  const levels = { High: 3, Medium: 2, Low: 1 };
  const n = levels[confidence];

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-0.5 items-end">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-full",
              i <= n ? "bg-white" : "bg-white/30",
              i === 1 ? "h-2" : i === 2 ? "h-3" : "h-4"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-white/70 font-medium uppercase">
        {confidence}
      </span>
    </div>
  );
}

// ============================================================================
// THESIS CARDS (Bull/Bear)
// ============================================================================

function ThesisCard({
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
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      bullet: "text-emerald-500",
    },
    bear: {
      border: "border-rose-200",
      bg: "bg-rose-50/50",
      icon: TrendingDown,
      iconColor: "text-rose-600",
      bullet: "text-rose-500",
    },
  }[variant];

  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className={cn("rounded-2xl border p-5", styles.border, styles.bg)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={cn("h-4 w-4", styles.iconColor)} />
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-neutral-600">
            <ChevronRight className={cn("h-4 w-4 mt-0.5 shrink-0", styles.bullet)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ============================================================================
// ASSESSMENT CARD
// ============================================================================

function getAssessmentColor(assessment: Assessment) {
  const positive = ["Cheap", "Strong", "Solid"];
  const negative = ["Expensive", "Weak", "Concerning"];
  if (positive.includes(assessment)) return "emerald";
  if (negative.includes(assessment)) return "rose";
  return "amber";
}

function AssessmentCard({
  title,
  assessment,
  detail,
}: {
  title: string;
  assessment: Assessment;
  detail: string;
}) {
  const color = getAssessmentColor(assessment);
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-neutral-200 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {title}
        </span>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colorClasses)}>
          {assessment}
        </span>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{detail}</p>
    </motion.div>
  );
}

// ============================================================================
// MOMENTUM BADGE
// ============================================================================

function MomentumBadge({
  value,
  type,
}: {
  value: string;
  type: "earnings" | "growth";
}) {
  const positive = type === "earnings" ? "Beating" : "Accelerating";
  const negative = type === "earnings" ? "Missing" : "Decelerating";

  let color = "amber";
  let Icon = Minus;

  if (value === positive) {
    color = "emerald";
    Icon = TrendingUp;
  } else if (value === negative) {
    color = "rose";
    Icon = TrendingDown;
  }

  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  }[color];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold",
        colorClasses
      )}
    >
      <Icon className="h-4 w-4" />
      {value}
    </span>
  );
}

// ============================================================================
// SIMPLE LIST CARD
// ============================================================================

function SimpleListCard({
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-neutral-200 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-neutral-600">
            <ChevronRight className={cn("h-4 w-4 mt-0.5 shrink-0", bulletColor)} />
            <span>{item}</span>
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
      transition={{ delay: 0.2 }}
      className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-neutral-400" />
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{content}</p>
    </motion.div>
  );
}

// ============================================================================
// DATA GAPS
// ============================================================================

function DataGapsCard({ gaps }: { gaps: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">
          Some data unavailable
        </p>
        <p className="text-xs text-amber-600 mt-0.5">
          {gaps.slice(0, 2).join(" • ")}
          {gaps.length > 2 && ` +${gaps.length - 2} more`}
        </p>
      </div>
    </div>
  );
}

export default StockAnalysisCard;