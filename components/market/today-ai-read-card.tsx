"use client";

import { MarketSummaryData } from "@/types/market-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Zap } from "lucide-react";
import { motion } from "framer-motion";

type TodayAiReadCardProps = {
  summary: MarketSummaryData | null;
  loading: boolean;
  error: string | null;
  updatedAgo?: string | null;
  onRetry: () => void;
};

export function TodayAiReadCard({
  summary,
  loading,
  updatedAgo,
  onRetry,
}: TodayAiReadCardProps) {
  if (!summary && !loading) return null;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-neutral-200/80 bg-white p-6 lg:p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
      {/* Editorial Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
              Today's Intelligence
            </h2>
          </div>
          <p className="text-sm font-medium text-neutral-500">
            AI Analysis for {summary?.market || "Global Markets"} • {updatedAgo}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="rounded-full border-neutral-200 hover:bg-neutral-50"
        >
          <RefreshCcw
            className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* The "Big Read" Sections */}
      <div className="grid gap-8">
        {summary?.sections.map((section, i) => (
          <motion.section
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative grid gap-4 md:grid-cols-[200px_1fr]"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                {section.headline}
              </h3>
              <div className="h-0.5 w-8 bg-emerald-100 group-hover:w-full transition-all duration-500" />
            </div>

            <div className="space-y-4">
              <p className="text-lg font-medium leading-relaxed text-neutral-800">
                {section.cause}
              </p>
              <div className="rounded-2xl bg-neutral-50/80 p-5 ring-1 ring-inset ring-neutral-100">
                <p className="text-sm leading-relaxed text-neutral-600 italic">
                  <span className="font-bold text-neutral-900 not-italic mr-2">
                    Bottom Line:
                  </span>
                  {section.impact}
                </p>
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
