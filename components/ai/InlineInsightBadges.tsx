// components/ai/InlineInsightsBadges.tsx
"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InlineInsights, Verdict } from "@/types/symbol_analysis";

interface Props {
  insights: InlineInsights;
  verdict?: Verdict;
  compact?: boolean;
}

export function InlineInsightsBadges({ insights, verdict, compact = false }: Props) {
  if (compact) {
    return <CompactView insights={insights} verdict={verdict} />;
  }

  return <FullView insights={insights} />;
}

function CompactView({ insights, verdict }: { insights: InlineInsights; verdict?: Verdict }) {
  const VerdictIcon = verdict === "Bullish" ? TrendingUp : verdict === "Bearish" ? TrendingDown : Minus;
  const verdictColor = verdict === "Bullish" ? "text-emerald-600" : verdict === "Bearish" ? "text-rose-600" : "text-amber-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {verdict && (
        <div className={cn("flex items-center gap-2", verdictColor)}>
          <VerdictIcon className="h-4 w-4" />
          <span className="text-sm font-bold">{verdict}</span>
        </div>
      )}

      <div className="space-y-2">
        <InsightRow label="Valuation" value={insights.valuationBadge} />
        <InsightRow label="Earnings" value={insights.earningsFlag} />
        <InsightRow label="Margins" value={insights.marginCallout} />
        {insights.riskFlag && (
          <div className="flex items-start gap-2 text-rose-600">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="text-xs">{insights.riskFlag}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "Data unavailable") return null;

  return (
    <div className="flex items-start gap-2">
      <span className="text-[9px] font-bold text-neutral-400 uppercase w-16 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs text-neutral-700">{value}</span>
    </div>
  );
}

function FullView({ insights }: { insights: InlineInsights }) {
  const items = [
    { label: "Valuation", value: insights.valuationBadge, icon: "💰" },
    { label: "Margins", value: insights.marginCallout, icon: "📊" },
    { label: "Earnings", value: insights.earningsFlag, icon: "📈" },
    { label: "Health", value: insights.healthNote, icon: "🏦" },
    { label: "Momentum", value: insights.momentumSignal, icon: "⚡" },
  ].filter((i) => i.value && i.value !== "Data unavailable");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white border border-neutral-200 rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{item.icon}</span>
            <span className="text-[9px] font-bold text-neutral-400 uppercase">
              {item.label}
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-800 leading-snug">
            {item.value}
          </p>
        </motion.div>
      ))}

      {insights.riskFlag && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: items.length * 0.05 }}
          className="bg-rose-50 border border-rose-200 rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="h-3 w-3 text-rose-500" />
            <span className="text-[9px] font-bold text-rose-600 uppercase">
              Risk
            </span>
          </div>
          <p className="text-xs font-semibold text-rose-700 leading-snug">
            {insights.riskFlag}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default InlineInsightsBadges;