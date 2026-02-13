// components/portfolio/PortfolioAnalysisTab.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCcw,
  AlertCircle,
  X,
  ChevronRight,
  TrendingUp,
  PieChart,
  BarChart3,
  Zap,
  Activity,
  ShieldAlert,
  Plus,
  Wallet2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-ai";
import { useHolding } from "@/hooks/use-holdings";
import { PortfolioAnalysisCard } from "@/components/analytics/portfolio-analysis-card";
import { UpgradeGate } from "@/components/upgrade-gate";
import { AnalysisLoader } from "@/components/ui/analysis-loader";
import { Page } from "@/components/layout/Page";

interface PortfolioAnalysisTabProps {
  currency?: string;
  className?: string;
}

export function PortfolioAnalysisTab({ 
  currency = "USD",
  className 
}: PortfolioAnalysisTabProps) {
  const { holdings, loading: holdingsLoading } = useHolding();
  const hasHoldings = holdings.length > 0;

  const {
    inlineLoading,
    inline,
    analysisLoading,
    analysis,
    error: aiError,
    tierError,
    fetchFullAnalysis,
    refreshInline,
    reset: resetAi,
  } = usePortfolioAnalysis(currency, hasHoldings);

  // ── Loading state ──
  if (holdingsLoading) {
    return (
      <Page>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </Page>
    );
  }

  // ── No holdings ──
  if (!hasHoldings) {
    return (
      <Page>
        <div className="max-w-lg mx-auto py-12 text-center">
          <div className="relative mx-auto mb-6 w-fit">
            <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-100 opacity-30 blur-lg" />
            <div className="relative h-16 w-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center ring-1 ring-indigo-100 mx-auto">
              <Wallet2 className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            No portfolio to analyze
          </h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed mb-6">
            Connect your brokerage or add holdings manually, then come back here
            for AI-powered portfolio analysis, risk metrics, and recommendations.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 shadow-lg">
              <Link href="/holdings">
                <Plus className="h-4 w-4" />
                Add Holdings
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl gap-1.5">
              <Link href="/connections">
                Connect Account
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* ================================================================== */}
      {/* SECTION 1: QUICK INSIGHTS (Cleaned Up) */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neutral-100 rounded-lg">
              <Activity className="h-3.5 w-3.5 text-neutral-600" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-700">Quick Insights</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {inline && (
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live
              </span>
            )}
            <button
              onClick={refreshInline}
              disabled={inlineLoading}
              className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", inlineLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {inlineLoading && !inline ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-[72px] bg-neutral-50 border border-neutral-100 rounded-xl animate-pulse" />
                ))}
              </motion.div>
            ) : inline ? (
              <motion.div
                key="insights"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
              >
                {/* 1. Health (Neutral/Indigo) */}
                <InsightPill
                  icon={PieChart}
                  label="Health"
                  value={inline.healthBadge}
                  iconColor="text-indigo-500"
                />

                {/* 2. Performance (Neutral/Emerald) */}
                <InsightPill
                  icon={TrendingUp}
                  label="Performance"
                  value={inline.performanceNote}
                  iconColor="text-emerald-500"
                />

                {/* 3. Top Performer (Neutral/Violet) */}
                <InsightPill
                  icon={BarChart3}
                  label="Top Performer"
                  value={inline.topPerformer}
                  iconColor="text-violet-500"
                />

                {/* 4. Risk (Subtle Red Background) */}
                {inline.riskFlag && (
                  <InsightPill
                    icon={ShieldAlert}
                    label="Risk Alert"
                    value={inline.riskFlag}
                    variant="risk"
                  />
                )}

                {/* 5. Action (Subtle Amber Background) */}
                {inline.actionNeeded && (
                  <InsightPill
                    icon={Zap}
                    label="Action Needed"
                    value={inline.actionNeeded}
                    variant="action"
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-neutral-400"
              >
                <p className="text-sm">Loading insights...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: FULL ANALYSIS */}
      {/* ================================================================== */}
      <AnimatePresence mode="wait">
        {/* Tier Limit State */}
        {tierError && (
          <motion.div
            key="tier-error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <UpgradeGate
              feature="Portfolio Analysis"
              plan={tierError.plan}
              message={tierError.message}
            />
          </motion.div>
        )}

        {/* Error State */}
        {aiError && !tierError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              <div>
                <p className="text-sm font-semibold text-rose-800">Analysis failed</p>
                <p className="text-xs text-rose-600">{aiError}</p>
              </div>
            </div>
            <button
              onClick={resetAi}
              className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {analysisLoading && !analysis && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnalysisLoader variant="portfolio" />
          </motion.div>
        )}

        {/* Analysis Result */}
        {analysis && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Portfolio Analysis</h2>
                  <p className="text-xs text-neutral-500">
                    AI-powered insights & recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={fetchFullAnalysis}
                  variant="outline"
                  size="sm"
                  disabled={analysisLoading}
                  className="h-9 text-xs font-medium rounded-lg bg-white"
                >
                  <RefreshCcw className={cn("h-3.5 w-3.5 mr-2", analysisLoading && "animate-spin")} />
                  Regenerate
                </Button>
                <button
                  onClick={resetAi}
                  className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <PortfolioAnalysisCard data={analysis} />
          </motion.div>
        )}

        {/* CTA (Empty State) - Updated to be lighter/cleaner */}
        {!analysis && !analysisLoading && !aiError && (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white border border-indigo-100/50 rounded-2xl p-4 sm:p-6 lg:p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="flex items-start gap-4 sm:gap-5 max-w-xl">
                <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-indigo-50 shrink-0">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    AI Portfolio Analysis
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                    Get AI-powered insights on diversification, risk exposure, and optimization opportunities.
                  </p>
                  
                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                      <PieChart className="h-3 w-3 mr-1.5 text-indigo-500" />
                      Allocation
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                      <ShieldAlert className="h-3 w-3 mr-1.5 text-rose-500" />
                      Risk Check
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                      <Zap className="h-3 w-3 mr-1.5 text-amber-500" />
                      Action Items
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={fetchFullAnalysis}
                size="lg"
                className="w-full md:w-auto shrink-0 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Portfolio
                <ChevronRight className="h-4 w-4 ml-1 opacity-70" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function InsightPill({
  icon: Icon,
  label,
  value,
  iconColor,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconColor?: string;
  variant?: "default" | "risk" | "action";
}) {
  if (!value) return null;

  const styles = {
    default: "bg-neutral-50 border-neutral-200", // Standard clean gray
    risk: "bg-rose-50 border-rose-100",           // Subtle red for risk
    action: "bg-amber-50 border-amber-100",       // Subtle amber for action
  }[variant];

  // Default icon color if not provided
  const finalIconColor = iconColor || {
    default: "text-neutral-500",
    risk: "text-rose-500",
    action: "text-amber-600",
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-3.5 rounded-xl border flex flex-col justify-between h-full min-h-[72px]", styles)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", finalIconColor)} />
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          variant === "risk" ? "text-rose-400" : 
          variant === "action" ? "text-amber-500" : 
          "text-neutral-400"
        )}>
          {label}
        </span>
      </div>
      <p className={cn(
        "text-sm font-semibold leading-tight line-clamp-2",
        variant === "risk" ? "text-rose-900" : 
        variant === "action" ? "text-amber-900" : 
        "text-neutral-900"
      )}>
        {value}
      </p>
    </motion.div>
  );
}

export default PortfolioAnalysisTab;