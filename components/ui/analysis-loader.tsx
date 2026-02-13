"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  BarChart3,
  Newspaper,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  PieChart,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Step definitions ────────────────────────────────────────── */

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  duration: number; // ms before moving to next
};

const STOCK_STEPS: Step[] = [
  { icon: Database, label: "Pulling market data & financials", duration: 2200 },
  { icon: BarChart3, label: "Analyzing valuation metrics", duration: 2400 },
  { icon: Newspaper, label: "Scanning recent news & filings", duration: 2800 },
  { icon: TrendingUp, label: "Evaluating price momentum", duration: 2000 },
  { icon: ShieldAlert, label: "Assessing risk factors", duration: 2200 },
  { icon: Sparkles, label: "Generating AI insights", duration: 6000 },
];

const CRYPTO_STEPS: Step[] = [
  { icon: Database, label: "Fetching on-chain & market data", duration: 2200 },
  { icon: TrendingUp, label: "Analyzing price action & trends", duration: 2600 },
  { icon: BarChart3, label: "Calculating volatility metrics", duration: 2400 },
  { icon: Newspaper, label: "Scanning market sentiment", duration: 2200 },
  { icon: ShieldAlert, label: "Evaluating risk exposure", duration: 2000 },
  { icon: Sparkles, label: "Generating AI insights", duration: 6000 },
];

const PORTFOLIO_STEPS: Step[] = [
  { icon: PieChart, label: "Mapping sector & asset allocation", duration: 2400 },
  { icon: Database, label: "Pulling data for each position", duration: 3000 },
  { icon: BarChart3, label: "Computing risk & return metrics", duration: 2600 },
  { icon: TrendingUp, label: "Benchmarking against S&P 500", duration: 2200 },
  { icon: ShieldAlert, label: "Identifying concentration risks", duration: 2400 },
  { icon: Zap, label: "Building rebalancing paths", duration: 2200 },
  { icon: Sparkles, label: "Synthesizing AI recommendations", duration: 6000 },
];

/* ─── Component ───────────────────────────────────────────────── */

interface AnalysisLoaderProps {
  /** What we're analyzing */
  variant: "stock" | "crypto" | "portfolio";
  /** Display name — e.g. "AAPL" or "your portfolio" */
  subject?: string;
}

export function AnalysisLoader({ variant, subject }: AnalysisLoaderProps) {
  const steps =
    variant === "portfolio"
      ? PORTFOLIO_STEPS
      : variant === "crypto"
      ? CRYPTO_STEPS
      : STOCK_STEPS;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length - 1) return; // stay on last step
    const timer = setTimeout(() => setCurrent((c) => c + 1), steps[current].duration);
    return () => clearTimeout(timer);
  }, [current, steps]);

  // Reset when variant/subject changes
  useEffect(() => {
    setCurrent(0);
  }, [variant, subject]);

  const title =
    variant === "portfolio"
      ? `Analyzing ${subject || "your portfolio"}`
      : `Analyzing ${subject || "this asset"}`;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-6 sm:pt-8 pb-4 text-center">
        {/* Animated icon */}
        <div className="relative mx-auto mb-4 h-14 w-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-neutral-100 border-t-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
        </div>

        <p className="text-base font-semibold text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-400 mt-0.5">
          This usually takes 10–20 seconds
        </p>
      </div>

      {/* Steps */}
      <div className="px-5 sm:px-6 pb-6 sm:pb-8">
        <div className="mx-auto max-w-sm space-y-1">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < current;
            const isActive = i === current;
            const isPending = i > current;

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.25 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors duration-500",
                  isActive && "bg-indigo-50",
                  isDone && "bg-transparent",
                  isPending && "bg-transparent opacity-40"
                )}
              >
                {/* Icon / check */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-500",
                    isActive && "bg-indigo-100 text-indigo-600",
                    isDone && "bg-emerald-50 text-emerald-500",
                    isPending && "bg-neutral-100 text-neutral-400"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isDone ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-500",
                    isActive && "text-indigo-900",
                    isDone && "text-neutral-500",
                    isPending && "text-neutral-400"
                  )}
                >
                  {step.label}
                </span>

                {/* Active pulse dot */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto flex items-center"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
