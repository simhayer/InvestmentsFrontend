"use client";

import { motion } from "framer-motion";
import {
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart3,
  Eye,
  RefreshCcw,
  Info,
  Award,
  Newspaper,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  DailyFeedResponse,
  FeedBriefingData,
  FeedBriefingSection,
  FeedDeltaData,
  FeedDeltaChange,
  FeedEarningsData,
  FeedEarningsEntry,
  FeedGoalData,
  FeedMilestone,
  FeedSentimentData,
  FeedSentimentEntry,
  FeedWeeklyData,
  FeedWeeklyHighlight,
  FeedItem,
} from "@/types/daily-feed";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface DailyFeedProps {
  data: DailyFeedResponse;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function DailyFeed({ data, loading, onRefresh, className }: DailyFeedProps) {
  const { feed } = data;

  return (
    <div className={cn("space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Your Daily Feed</h2>
            <p className="text-xs text-neutral-400">Personalized insights updated throughout the day</p>
          </div>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-full border-neutral-200 hover:bg-neutral-50 text-xs"
          >
            <RefreshCcw className={cn("mr-1.5 h-3 w-3", loading && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>

      {/* Briefing — hero card */}
      {feed.briefing?.data && <BriefingCard data={feed.briefing.data} />}

      {/* Two-column row: Delta + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {feed.delta?.data && <DeltaCard data={feed.delta.data} />}
        {feed.sentiment?.data && <SentimentCard data={feed.sentiment.data} />}
      </div>

      {/* Two-column row: Earnings + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {feed.earnings?.data && <EarningsCard data={feed.earnings.data} />}
        {feed.goals?.data && <GoalCard data={feed.goals.data} />}
      </div>

      {/* Weekly Report Card — full width */}
      {feed.weekly?.data && <WeeklyCard data={feed.weekly.data} />}

      {/* Disclaimer */}
      <p className="text-[10px] text-neutral-400 text-center leading-relaxed px-4">
        {data.disclaimer}
      </p>
    </div>
  );
}

// ============================================================================
// BRIEFING CARD
// ============================================================================

function BriefingCard({ data }: { data: FeedBriefingData }) {
  const urgencyColor = {
    low: "bg-neutral-100 text-neutral-600",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-white/80 fill-white/80" />
          <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
            Morning Briefing
          </span>
        </div>
        <p className="text-white text-lg font-medium">{data.greeting}</p>

        {/* Snapshot pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <SnapshotPill label="Day Change" value={data.portfolioSnapshot.dayChange} />
          <SnapshotPill label="Top" value={data.portfolioSnapshot.topMover} />
          <SnapshotPill label="Bottom" value={data.portfolioSnapshot.bottomMover} />
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-neutral-100">
        {data.sections.map((section, i) => (
          <div key={i} className="px-6 py-4 flex gap-4">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide h-fit mt-0.5 shrink-0",
                urgencyColor[section.urgency],
              )}
            >
              {section.headline}
            </span>
            <p className="text-sm text-neutral-600 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      {/* Watch Today */}
      {data.watchToday.length > 0 && (
        <div className="px-6 py-4 bg-neutral-50/80 border-t border-neutral-100">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
            <Eye className="inline h-3 w-3 mr-1" />
            Watch Today
          </p>
          <div className="flex flex-wrap gap-2">
            {data.watchToday.map((item, i) => (
              <span key={i} className="text-xs bg-white border border-neutral-200 rounded-full px-3 py-1 text-neutral-600">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SnapshotPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
      <span className="text-white/60 text-[10px] uppercase tracking-wide block">{label}</span>
      <span className="text-white text-sm font-bold">{value}</span>
    </div>
  );
}

// ============================================================================
// DELTA CARD — What Changed
// ============================================================================

function DeltaCard({ data }: { data: FeedDeltaData }) {
  if (data.changes.length === 0) {
    return (
      <FeedCardShell icon={Activity} title="What Changed" subtitle={data.sinceLabel ? `Since ${data.sinceLabel}` : undefined}>
        <p className="text-sm text-neutral-400 italic px-5 pb-4">No significant changes detected.</p>
      </FeedCardShell>
    );
  }

  return (
    <FeedCardShell icon={Activity} title="What Changed" subtitle={data.sinceLabel ? `Since ${data.sinceLabel}` : undefined}>
      <div className="divide-y divide-neutral-50">
        {data.changes.map((c, i) => (
          <div key={i} className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {c.direction === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              )}
              <div>
                <p className="text-sm font-medium text-neutral-800">{c.label}</p>
                <p className="text-[11px] text-neutral-400">
                  {c.previous} → {c.current}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                c.direction === "up" ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {c.change}
            </span>
          </div>
        ))}
      </div>
    </FeedCardShell>
  );
}

// ============================================================================
// SENTIMENT CARD
// ============================================================================

function SentimentCard({ data }: { data: FeedSentimentData }) {
  const sentimentConfig = {
    positive: { color: "text-emerald-600", bg: "bg-emerald-500", icon: TrendingUp, label: "Positive" },
    neutral: { color: "text-neutral-500", bg: "bg-neutral-400", icon: Minus, label: "Neutral" },
    negative: { color: "text-rose-600", bg: "bg-rose-500", icon: TrendingDown, label: "Negative" },
  };

  const overall = sentimentConfig[data.overall || "neutral"];

  return (
    <FeedCardShell icon={Newspaper} title="News Sentiment" subtitle={`${data.symbolsAnalyzed} holdings analyzed`}>
      {/* Overall score bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className={cn("text-sm font-bold flex items-center gap-1.5", overall.color)}>
            <overall.icon className="h-3.5 w-3.5" />
            {overall.label}
          </span>
          <span className="text-xs text-neutral-400 tabular-nums">{data.overallScore}/100</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", overall.bg)}
            style={{ width: `${data.overallScore}%` }}
          />
        </div>
      </div>

      {/* Per-symbol sentiment */}
      <div className="divide-y divide-neutral-50">
        {data.sentiments.slice(0, 5).map((s, i) => {
          const cfg = sentimentConfig[s.sentiment];
          return (
            <div key={i} className="px-5 py-2.5 flex items-start gap-3">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 mt-0.5 shrink-0">
                {s.symbol}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <cfg.icon className={cn("h-3 w-3", cfg.color)} />
                  <span className={cn("text-xs font-bold", cfg.color)}>{cfg.label}</span>
                  <span className="text-[10px] text-neutral-400 ml-auto">{s.confidence}% confidence</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed truncate">{s.reason}</p>
              </div>
            </div>
          );
        })}
      </div>
    </FeedCardShell>
  );
}

// ============================================================================
// EARNINGS CARD
// ============================================================================

function EarningsCard({ data }: { data: FeedEarningsData }) {
  const hasAny = data.thisWeek.length > 0 || data.nextWeek.length > 0 || data.later.length > 0;

  return (
    <FeedCardShell icon={Calendar} title="Earnings Calendar" subtitle={`${data.totalUpcoming} upcoming`}>
      {!hasAny ? (
        <p className="text-sm text-neutral-400 italic px-5 pb-4">No upcoming earnings for your holdings.</p>
      ) : (
        <div className="px-5 pb-4 space-y-3">
          {data.thisWeek.length > 0 && (
            <EarningsGroup label="This Week" entries={data.thisWeek} highlight />
          )}
          {data.nextWeek.length > 0 && (
            <EarningsGroup label="Next Week" entries={data.nextWeek} />
          )}
          {data.later.length > 0 && (
            <EarningsGroup label="Later" entries={data.later.slice(0, 5)} />
          )}
        </div>
      )}
    </FeedCardShell>
  );
}

function EarningsGroup({ label, entries, highlight }: { label: string; entries: FeedEarningsEntry[]; highlight?: boolean }) {
  const hourLabel = (h?: string | null) => {
    if (!h) return "";
    if (h === "bmo") return "Pre-market";
    if (h === "amc") return "After-hours";
    return h;
  };

  return (
    <div>
      <p className={cn(
        "text-[10px] font-bold uppercase tracking-wider mb-1.5",
        highlight ? "text-amber-600" : "text-neutral-400",
      )}>
        {label}
      </p>
      <div className="space-y-1.5">
        {entries.map((e, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-xs",
              highlight ? "bg-amber-50 border border-amber-100" : "bg-neutral-50",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900">{e.symbol}</span>
              <span className="text-neutral-400">{e.date}</span>
              {e.hour && <span className="text-neutral-400">• {hourLabel(e.hour)}</span>}
            </div>
            <div className="flex items-center gap-3 text-neutral-500">
              {e.epsEstimate != null && <span>EPS est. ${e.epsEstimate.toFixed(2)}</span>}
              {e.weight > 0 && <span className="text-neutral-300">|</span>}
              {e.weight > 0 && <span>{e.weight.toFixed(1)}% of portfolio</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// GOAL PROGRESS CARD
// ============================================================================

function GoalCard({ data }: { data: FeedGoalData }) {
  const monthsActive = Math.round(data.daysActive / 30);
  const nextMilestone = data.milestones.find(m => !m.reached);

  return (
    <FeedCardShell icon={Target} title="Goal Progress" subtitle={data.goal}>
      <div className="px-5 pb-4 space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-3 gap-3">
          <GoalStat label="Total Return" value={`${data.totalReturnPct >= 0 ? "+" : ""}${data.totalReturnPct}%`} positive={data.totalReturnPct >= 0} />
          <GoalStat label="Portfolio Value" value={`$${data.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <GoalStat label="Time Active" value={monthsActive < 12 ? `${monthsActive}mo` : `${(monthsActive / 12).toFixed(1)}yr`} />
        </div>

        {data.annualizedReturn != null && (
          <div className="bg-neutral-50 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Annualized Return</span>
            <span className={cn("text-sm font-bold tabular-nums", data.annualizedReturn >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {data.annualizedReturn >= 0 ? "+" : ""}{data.annualizedReturn}%
            </span>
          </div>
        )}

        {/* Next milestone */}
        {nextMilestone && (
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Next Milestone: ${nextMilestone.value.toLocaleString()}
            </p>
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${nextMilestone.progress || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-neutral-400 tabular-nums">
                {nextMilestone.progress?.toFixed(1)}%
              </p>
              {data.projection && (
                <p className="text-[10px] text-indigo-500 font-medium">
                  <Crosshair className="inline h-2.5 w-2.5 mr-0.5" />
                  Est. {data.projection.estimatedDate}
                </p>
              )}

        {/* Projection detail */}
        {data.projection && (
          <div className="bg-indigo-50 rounded-lg px-3 py-2">
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              At your current {data.projection.basedOnReturn}% annualized return,
              you could reach ${data.projection.targetValue.toLocaleString()} in ~{data.projection.estimatedMonths} months.
            </p>
          </div>
        )}

        {/* Reached milestones */}
        {data.milestones.filter(m => m.reached).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.milestones.filter(m => m.reached).map((m, i) => (
              <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 font-medium">
                ${m.value.toLocaleString()} ✓
              </span>
            ))}
          </div>
        )}

              {data.milestones.filter(m => m.reached).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.milestones.filter(m => m.reached).map((m, i) => (
                    <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 font-medium">
                      ${m.value.toLocaleString()} ✓
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

              <p className="text-[10px] text-neutral-400">
                {data.timeHorizon} · {data.riskLevel} risk
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeedCardShell>
  );
}

function GoalStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn(
        "text-base font-bold tabular-nums",
        positive === true && "text-emerald-600",
        positive === false && "text-rose-600",
        positive === undefined && "text-neutral-900",
      )}>
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// WEEKLY REPORT CARD
// ============================================================================

function WeeklyCard({ data }: { data: FeedWeeklyData }) {
  const gradeColor: Record<string, string> = {
    A: "from-emerald-500 to-emerald-600",
    B: "from-blue-500 to-blue-600",
    C: "from-amber-500 to-amber-600",
    D: "from-orange-500 to-orange-600",
    F: "from-rose-500 to-rose-600",
  };

  const gradeSmallColor: Record<string, string> = {
    A: "text-emerald-600 bg-emerald-50",
    B: "text-blue-600 bg-blue-50",
    C: "text-amber-600 bg-amber-50",
    D: "text-orange-600 bg-orange-50",
    F: "text-rose-600 bg-rose-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
    >
      <div className="flex">
        {/* Grade badge */}
        <div className={cn("w-24 shrink-0 flex flex-col items-center justify-center bg-gradient-to-b text-white", gradeColor[data.grade] || gradeColor.C)}>
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Grade</span>
          <span className="text-5xl font-black">{data.grade}</span>
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Weekly Report Card</span>
          </div>
          <p className="text-sm font-medium text-neutral-800 mb-3">{data.headline}</p>

          {/* Return vs benchmark */}
          {(data.weeklyReturn || data.benchmarkReturn) && (
            <div className="flex gap-3 mb-3">
              {data.weeklyReturn && (
                <div className="bg-neutral-50 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-neutral-400 block text-[10px]">Your Week</span>
                  <span className="font-bold text-neutral-900">{data.weeklyReturn}</span>
                </div>
              )}
              {data.benchmarkReturn && (
                <div className="bg-neutral-50 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-neutral-400 block text-[10px]">S&P 500</span>
                  <span className="font-bold text-neutral-900">{data.benchmarkReturn}</span>
                </div>
              )}
            </div>
          )}

          {/* Highlights */}
          <div className="space-y-2">
            {data.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 mt-0.5", gradeSmallColor[h.grade] || gradeSmallColor.C)}>
                  {h.grade}
                </span>
                <div>
                  <span className="text-xs font-bold text-neutral-700">{h.label}: </span>
                  <span className="text-xs text-neutral-500">{h.detail}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Improvement tip */}
          {data.improvementTip && (
            <div className="mt-3 bg-indigo-50 rounded-lg px-3 py-2 flex items-start gap-2">
              <Info className="h-3 w-3 text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-indigo-700 leading-relaxed">{data.improvementTip}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SHARED: Card Shell
// ============================================================================

function FeedCardShell({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
    >
      <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
        <Icon className="h-4 w-4 text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {subtitle && (
          <span className="text-[10px] text-neutral-400 ml-auto">{subtitle}</span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

export default DailyFeed;
