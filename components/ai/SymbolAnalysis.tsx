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
// MAIN COMPONENT - Consolidated & Cleaned
// ============================================================================

interface StockAnalysisCardProps {
  data: StockAnalysisResponse;
  className?: string;
}

export function StockAnalysisCard({ data, className }: StockAnalysisCardProps) {
  const { report, dataGaps } = data;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. HERO: Verdict Card */}
      <VerdictCard report={report} />

      {/* 2. CORE: Investment Thesis (Bull & Bear consolidated) */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900">
            Investment Thesis
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          <ThesisSection
            title="Bull Case"
            items={report.bullCase}
            variant="bull"
          />
          <ThesisSection
            title="Bear Case"
            items={report.bearCase}
            variant="bear"
          />
        </div>
      </div>

      {/* 3. DEEP DIVE: Fundamentals & Momentum (Consolidated) */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-neutral-900">
            Fundamentals & Health
          </h3>
        </div>
        <div className="p-5 space-y-6">
          {/* Top Row: Assessments */}
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

          {/* Divider */}
          <div className="h-px bg-neutral-100" />

          {/* Bottom Row: Momentum */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LineChart className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Momentum Indicators
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-xs text-neutral-400 mr-2">
                  Earnings:
                </span>
                <MomentumBadge
                  value={report.momentum.earningsTrend}
                  type="earnings"
                />
              </div>
              <div>
                <span className="text-xs text-neutral-400 mr-2">
                  Growth:
                </span>
                <MomentumBadge
                  value={report.momentum.growthTrajectory}
                  type="growth"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OUTLOOK: Risks & Catalysts (Consolidated) */}
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

      {/* 5. FOOTER: Notes & Gaps */}
      <div className="space-y-4">
        {(report.technicalNotes || report.peerComparison) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {report.technicalNotes && (
              <NoteCard
                title="Technical Position"
                content={report.technicalNotes}
              />
            )}
            {report.peerComparison && (
              <NoteCard
                title="Peer Comparison"
                content={report.peerComparison}
              />
            )}
          </div>
        )}

        {dataGaps.length > 0 && <DataGapsCard gaps={dataGaps} />}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 1: VERDICT CARD
// ============================================================================

function VerdictCard({ report }: { report: AnalysisReport }) {
  const config = {
    Bullish: {
      bg: "bg-emerald-600",
      icon: TrendingUp,
      label: "Bullish",
    },
    Bearish: {
      bg: "bg-rose-600",
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
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-md"
    >
      <div
        className={cn("px-6 py-5 flex items-center justify-between", config.bg)}
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/80 font-medium mb-0.5">
              AI Verdict
            </p>
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
// COMPONENT 2: THESIS SECTIONS
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
      iconColor: "text-emerald-600",
      bgBadge: "bg-emerald-50 text-emerald-700",
      bullet: "text-emerald-500",
    },
    bear: {
      icon: TrendingDown,
      iconColor: "text-rose-600",
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
            <ChevronRight
              className={cn("h-4 w-4 mt-0.5 shrink-0", styles.bullet)}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// COMPONENT 3: ASSESSMENT CARDS (Inside Fundamentals)
// ============================================================================

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
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
  }[color];

  return (
    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-500">{title}</span>
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

function getAssessmentColor(assessment: Assessment) {
  const positive = ["Cheap", "Strong", "Solid"];
  const negative = ["Expensive", "Weak", "Concerning"];
  if (positive.includes(assessment)) return "emerald";
  if (negative.includes(assessment)) return "rose";
  return "amber";
}

// ============================================================================
// COMPONENT 4: MOMENTUM BADGE
// ============================================================================

function MomentumBadge({
  value,
  type,
}: {
  value: string;
  type: "earnings" | "growth";
}) {
  // Broad matching logic for robustness
  const valLower = value.toLowerCase();
  const isPos =
    valLower.includes("beat") ||
    valLower.includes("accel") ||
    valLower.includes("up") ||
    valLower.includes("strong");
  const isNeg =
    valLower.includes("miss") ||
    valLower.includes("decel") ||
    valLower.includes("down") ||
    valLower.includes("weak");

  let color = "amber";
  let Icon = Minus;

  if (isPos) {
    color = "emerald";
    Icon = TrendingUp;
  } else if (isNeg) {
    color = "rose";
    Icon = TrendingDown;
  }

  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  }[color];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
        colorClasses
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {value}
    </span>
  );
}

// ============================================================================
// COMPONENT 5: SIMPLE LIST (For Outlook)
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
  const bulletColor =
    accentColor === "rose" ? "text-rose-400" : "text-amber-400";

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-neutral-600">
            <ChevronRight
              className={cn("h-4 w-4 mt-0.5 shrink-0", bulletColor)}
            />
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