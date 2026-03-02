"use client";

import { MarketSummaryData } from "@/types/market-summary";
import { RefreshCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AiInsightsCardProps = {
  theme?: "light" | "dark";
  summary: MarketSummaryData | null;
  loading: boolean;
  error: string | null;
  updatedAgo?: string | null;
  onRetry: () => void;
};

const lightStyles = {
  card: "overflow-hidden rounded-[28px] border border-neutral-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,253,245,0.9))] shadow-[0_18px_40px_rgba(15,23,42,0.08)]",
  headerBorder: "border-emerald-100/80 bg-white/70 backdrop-blur-sm",
  iconWrap: "bg-emerald-100 text-emerald-700 shadow-inner",
  title: "text-neutral-900",
  subtitle: "text-neutral-500",
  refreshBtn:
    "flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/90 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-300 hover:bg-white disabled:opacity-50",
  skeleton: "bg-neutral-100",
  error: "text-sm text-neutral-600",
  sectionBorder: "border-emerald-100/80",
  headline: "mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700",
  cause: "mb-4 text-sm leading-7 text-neutral-700",
  impactBox: "rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3.5",
  impactLabel: "font-semibold text-neutral-900 mr-2",
  impactText: "text-xs leading-6 text-neutral-600",
};

const darkStyles = {
  card: "rounded-2xl border border-neutral-700/80 bg-neutral-900 shadow-xl overflow-hidden",
  headerBorder: "border-neutral-800",
  iconWrap: "bg-emerald-500/20 text-emerald-400",
  title: "text-neutral-100",
  subtitle: "text-neutral-500",
  refreshBtn:
    "rounded-lg border border-neutral-600 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors disabled:opacity-50 flex items-center gap-1.5",
  skeleton: "bg-neutral-800",
  error: "text-sm text-neutral-400",
  sectionBorder: "border-neutral-800/80",
  headline: "text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-2",
  cause: "text-sm text-neutral-300 leading-relaxed mb-3",
  impactBox: "rounded-xl bg-neutral-800/60 border border-neutral-700/50 px-4 py-3",
  impactLabel: "font-semibold text-neutral-200 mr-2",
  impactText: "text-xs text-neutral-400",
};

export function AiInsightsCard({
  theme = "dark",
  summary,
  loading,
  error,
  updatedAgo,
  onRetry,
}: AiInsightsCardProps) {
  if (!summary && !loading && !error) return null;

  const s = theme === "light" ? lightStyles : darkStyles;

  return (
    <div className={s.card}>
      <div className={cn("border-b px-5 py-4 flex items-center justify-between gap-3", s.headerBorder)}>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", s.iconWrap)}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className={cn("text-base font-bold", s.title)}>AI Insights</h2>
            <p className={cn("text-[11px]", s.subtitle)}>
              AI-Powered Analysis • World Brief • Updated {updatedAgo ?? "just now"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className={s.refreshBtn}
        >
          <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="p-5">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className={cn("h-4 w-28 rounded mb-3", s.skeleton)} />
                <div className={cn("h-3 w-full rounded mb-2", s.skeleton)} />
                <div className={cn("h-3 w-4/5 rounded", s.skeleton)} />
              </div>
            ))}
          </div>
        )}

        {error && !loading && !summary && <p className={s.error}>{error}</p>}

        {summary?.sections && summary.sections.length > 0 && !loading && (
          <div className="space-y-6">
            {summary.sections.map((section, i) => (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn("border-b pb-6 last:border-0 last:pb-0", s.sectionBorder)}
              >
                <h3 className={s.headline}>{section.headline}</h3>
                <p className={s.cause}>{section.cause}</p>
                <div className={s.impactBox}>
                  <p className={s.impactText}>
                    <span className={s.impactLabel}>Bottom line:</span>
                    {section.impact}
                  </p>
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
