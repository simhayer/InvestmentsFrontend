// components/investment/InvestmentOverview.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  RefreshCcw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Zap,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import PriceChartCard from "./price-chart-card";
import { useHistory, useQuote } from "@/hooks/use-market";
import { RANGE_PRESETS } from "@/types/market";
import { fmtCompact, fmtCurrency, fmtPct } from "@/utils/format";

import {
  Tabs,
  TabList,
  TabTrigger,
  TabPanels,
  TabPanel,
} from "@/components/investment/tabs/tabs";
import FinancialsTab from "@/components/investment/tabs/financials-tab";
import EarningsTab from "@/components/investment/tabs/earnings-tab";
import AnalystTab from "@/components/investment/tabs/analyst-tab";
import ProfileTab from "@/components/investment/tabs/profile-tab";
import { NewsTab } from "./tabs/news-tab";

import { useAiInsightSymbol } from "@/hooks/use-ai-insight-symbol";
import { StockAnalysisCard } from "@/components/ai/SymbolAnalysis";
import SymbolLogo from "@/components/layout/SymbolLogo";

export default function InvestmentOverview({ symbol }: { symbol: string }) {
  const [r, setR] = useState(RANGE_PRESETS[5]);
  const searchParams = useSearchParams();
  const assetType = searchParams.get("type");
  const isCrypto = assetType === "crypto";

  const qParam = searchParams.get("q") ?? undefined;
  const quoteSymbol = qParam ?? (isCrypto ? `${symbol}-USD` : undefined);

  const { data: quote } = useQuote(symbol, quoteSymbol);
  const { data: history, loading: loadingH } = useHistory(
    symbol,
    r.period,
    r.interval,
    quoteSymbol
  );

  const {
    inlineLoading,
    inline,
    analysisLoading,
    analysis,
    error: aiError,
    fetchFullAnalysis,
    reset: resetAi,
  } = useAiInsightSymbol(symbol);

  // Ref for auto-scrolling to analysis
  const analysisRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to analysis when it loads
  useEffect(() => {
    if (analysis && analysisRef.current) {
      analysisRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }
  }, [analysis]);

  const isPositive = (quote?.day_change_pct ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ================================================================== */}
      {/* STICKY HEADER */}
      {/* ================================================================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Symbol */}
            <div className="flex items-center gap-3">
              <SymbolLogo symbol={symbol} isCrypto={isCrypto} />
              <div>
                <h1 className="text-lg font-bold text-neutral-900">{symbol}</h1>
                <p className="text-xs text-neutral-500 truncate max-w-[160px]">
                  {quote?.name}
                </p>
              </div>
            </div>

            {/* Center: Price */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xl font-bold text-neutral-900 tabular-nums">
                {fmtCurrency(quote?.current_price, quote?.currency)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg",
                  isPositive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-rose-700 bg-rose-50"
                )}
              >
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {fmtPct(quote?.day_change_pct || 0)}
              </span>
            </div>

            {/* Right: AI Button */}
            <button
              onClick={fetchFullAnalysis}
              disabled={analysisLoading}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                analysis
                  ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
              )}
            >
              {analysisLoading ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {analysisLoading ? "Analyzing..." : analysis ? "Refresh" : "AI Analysis"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 space-y-6">
        
        {/* Mobile Price */}
        <div className="md:hidden flex items-center justify-between bg-white rounded-2xl p-4 border border-neutral-200">
          <span className="text-2xl font-bold text-neutral-900 tabular-nums">
            {fmtCurrency(quote?.current_price, quote?.currency)}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg",
              isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            )}
          >
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {fmtPct(quote?.day_change_pct || 0)}
          </span>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: Stats + Quick Insights */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Key Stats */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
              Key Stats
            </h3>
            <div className="space-y-3">
              <StatRow label="Market Cap" value={fmtCompact(quote?.market_cap)} />
              <StatRow label="P/E Ratio" value={quote?.pe_ratio?.toFixed(2) || "—"} />
              <StatRow label="52W High" value={fmtCurrency(quote?.["52_week_high"], quote?.currency)} />
              <StatRow label="52W Low" value={fmtCurrency(quote?.["52_week_low"], quote?.currency)} />
            </div>
          </div>

          {/* Quick Insights */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Zap className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  AI Quick Insights
                </h3>
              </div>
              {inline && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {inlineLoading && !inline ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
                  ))}
                </motion.div>
              ) : inline ? (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                  <InsightPill label="Valuation" value={inline.valuationBadge} />
                  <InsightPill label="Margins" value={inline.marginCallout} />
                  <InsightPill label="Earnings" value={inline.earningsFlag} />
                  <InsightPill label="Health" value={inline.healthNote} />
                  <InsightPill label="Momentum" value={inline.momentumSignal} />
                  {inline.riskFlag && (
                    <InsightPill label="Risk" value={inline.riskFlag} isRisk />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-neutral-400 text-sm"
                >
                  Loading insights...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: AI ANALYSIS (appears right after insights!) */}
        {/* ============================================================== */}
        <div ref={analysisRef}>
          <AnimatePresence mode="wait">
            {/* Error State */}
            {aiError && (
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
                    <p className="text-sm text-rose-600">{aiError}</p>
                  </div>
                </div>
                <button onClick={resetAi} className="p-1.5 hover:bg-rose-100 rounded-lg">
                  <X className="h-4 w-4 text-rose-500" />
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
                className="bg-white border border-neutral-200 rounded-2xl p-10 flex flex-col items-center justify-center"
              >
                <div className="relative mb-5">
                  <div className="h-14 w-14 rounded-full border-[3px] border-neutral-200 border-t-indigo-600 animate-spin" />
                  <Sparkles className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-base font-semibold text-neutral-800">Analyzing {symbol}</p>
                <p className="text-sm text-neutral-400 mt-1">Gathering fundamentals, news, and generating insights...</p>
              </motion.div>
            )}

            {/* Analysis Result */}
            {analysis && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">AI Analysis</h2>
                      <p className="text-xs text-neutral-500">Deep fundamental analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={resetAi}
                    className="text-sm text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Dismiss
                  </button>
                </div>

                <StockAnalysisCard data={analysis} />
              </motion.div>
            )}

            {/* Empty State - CTA to analyze */}
            {!analysis && !analysisLoading && !aiError && (
              <motion.div
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-2xl">
                      <Sparkles className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-neutral-800">
                        Get AI-Powered Analysis
                      </h3>
                      <p className="text-sm text-neutral-500">
                        Deep dive into fundamentals, risks, and catalysts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchFullAnalysis}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze Now
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: Chart */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-700">Price Chart</h3>
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
              {RANGE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setR(p)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                    r.label === p.label
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[400px] p-4">
            {loadingH && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <RefreshCcw className="h-6 w-6 animate-spin text-neutral-300" />
              </div>
            )}
            <PriceChartCard
              candles={history?.points || []}
              height={380}
              r={r}
              setR={setR}
              hideRangeControls
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 4: Data Tabs */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <Tabs defaultValue="news">
            <TabList className="flex border-b border-neutral-100 px-2 pt-2 gap-1 overflow-x-auto">
              {[
                { value: "news", label: "News" },
                { value: "financials", label: "Financials" },
                { value: "earnings", label: "Earnings" },
                { value: "analyst", label: "Analyst" },
                { value: "profile", label: "Profile" },
              ].map((tab) => (
                <TabTrigger
                  key={tab.value}
                  value={tab.value}
                  className="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 text-neutral-500 hover:text-neutral-700"
                >
                  {tab.label}
                </TabTrigger>
              ))}
            </TabList>

            <TabPanels className="p-6">
              <TabPanel value="news"><NewsTab symbol={symbol} /></TabPanel>
              <TabPanel value="financials"><FinancialsTab symbol={symbol} /></TabPanel>
              <TabPanel value="earnings"><EarningsTab symbol={symbol} /></TabPanel>
              <TabPanel value="analyst"><AnalystTab symbol={symbol} /></TabPanel>
              <TabPanel value="profile"><ProfileTab symbol={symbol} /></TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-900 tabular-nums">{value}</span>
    </div>
  );
}

function InsightPill({ label, value, isRisk }: { label: string; value: string; isRisk?: boolean }) {
  if (!value || value === "Data unavailable") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-3 rounded-xl border",
        isRisk ? "bg-rose-50 border-rose-100" : "bg-neutral-50 border-neutral-100"
      )}
    >
      <p className={cn(
        "text-[10px] font-semibold uppercase tracking-wider mb-1",
        isRisk ? "text-rose-400" : "text-neutral-400"
      )}>
        {label}
      </p>
      <p className={cn(
        "text-xs font-medium leading-snug",
        isRisk ? "text-rose-700" : "text-neutral-700"
      )}>
        {value}
      </p>
    </motion.div>
  );
}