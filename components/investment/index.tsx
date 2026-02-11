// components/investment/InvestmentOverview.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  RefreshCcw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  Shield,
  Activity,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // Updated hook with auto-fetch inline insights
  const {
    inlineLoading,
    inline,
    analysisLoading,
    analysis,
    error: aiError,
    fetchFullAnalysis,
    reset: resetAi,
  } = useAiInsightSymbol(symbol);

  const isPositive = (quote?.day_change_pct ?? 0) >= 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ================================================================== */}
      {/* SIDEBAR */}
      {/* ================================================================== */}
      <aside className="w-full lg:w-[340px] bg-white border-r border-slate-200 flex flex-col shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full uppercase tracking-widest mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>

          <div className="flex items-center gap-3 mb-2">
            <SymbolLogo symbol={symbol} isCrypto={isCrypto} />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {symbol}
              </h1>
              <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">
                {quote?.name}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {fmtCurrency(quote?.current_price, quote?.currency)}
            </span>
            <span
              className={cn(
                "text-sm font-bold px-2 py-0.5 rounded-md",
                isPositive
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-rose-700 bg-rose-50"
              )}
            >
              {isPositive ? "+" : ""}
              {fmtPct(quote?.day_change_pct || 0)}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-2">
            <QuickStat label="Mkt Cap" value={fmtCompact(quote?.market_cap)} />
            <QuickStat label="P/E" value={quote?.pe_ratio?.toFixed(1) || "—"} />
            <QuickStat
              label="52W High"
              value={fmtCurrency(quote?.["52_week_high"], quote?.currency)}
            />
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="flex-1 p-4 space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              AI Insights
            </span>
          </div>

          {/* Inline Insights - Auto loaded */}
          <AnimatePresence mode="wait">
            {inlineLoading && !inline && (
              <motion.div
                key="inline-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </motion.div>
            )}

            {inline && (
              <motion.div
                key="inline-insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <InsightCard
                  icon={DollarSign}
                  label="Valuation"
                  value={inline.valuationBadge}
                  color="blue"
                />
                <InsightCard
                  icon={BarChart3}
                  label="Margins"
                  value={inline.marginCallout}
                  color="emerald"
                />
                <InsightCard
                  icon={Target}
                  label="Earnings"
                  value={inline.earningsFlag}
                  color="violet"
                />
                <InsightCard
                  icon={Shield}
                  label="Health"
                  value={inline.healthNote}
                  color="amber"
                />
                <InsightCard
                  icon={Activity}
                  label="Momentum"
                  value={inline.momentumSignal}
                  color="cyan"
                />
                {inline.riskFlag && (
                  <InsightCard
                    icon={AlertTriangle}
                    label="Risk"
                    value={inline.riskFlag}
                    color="rose"
                  />
                )}
              </motion.div>
            )}

            {!inlineLoading && !inline && (
              <motion.div
                key="no-inline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-slate-400 text-sm"
              >
                Insights loading...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 pt-4" />

          {/* Full Analysis Button */}
          <Button
            onClick={fetchFullAnalysis}
            disabled={analysisLoading}
            className={cn(
              "w-full h-14 rounded-2xl font-bold text-sm transition-all shadow-lg",
              analysis
                ? "bg-slate-800 hover:bg-slate-900 text-white"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            )}
          >
            {analysisLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>{analysis ? "Refresh Full Analysis" : "Get Deep Analysis"}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </Button>

          {/* Analysis verdict badge */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 p-3 bg-slate-50 rounded-xl"
            >
              <VerdictPill verdict={analysis.report.verdict} />
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {analysis.report.confidence}
                </span>{" "}
                confidence
              </div>
            </motion.div>
          )}
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-[1200px]">
        {/* Chart Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Price Chart
            </h2>
            <div className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm flex gap-0.5">
              {RANGE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setR(p)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all",
                    r.label === p.label
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Card className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[420px] bg-white p-5">
            {loadingH && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <RefreshCcw className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            )}
            <PriceChartCard
              candles={history?.points || []}
              height={400}
              r={r}
              setR={setR}
              hideRangeControls
            />
          </Card>
        </section>

        {/* AI Analysis Section */}
        <AnimatePresence mode="wait">
          {aiError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4"
            >
              <div className="p-2 bg-rose-100 rounded-xl">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-800">
                  Analysis failed
                </p>
                <p className="text-sm text-rose-600 mt-1">{aiError}</p>
              </div>
              <button
                onClick={resetAi}
                className="text-xs font-medium text-rose-600 hover:text-rose-800 underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {analysisLoading && !analysis && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center"
            >
              <div className="relative mb-4">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <p className="text-base font-bold text-slate-700">
                Analyzing {symbol}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Gathering fundamentals, news, and generating insights...
              </p>
            </motion.div>
          )}

          {analysis && (
            <motion.section
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    AI Deep Analysis
                  </h2>
                </div>
                <button
                  onClick={resetAi}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>

              <StockAnalysisCard data={analysis} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Data Tabs Section */}
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <Tabs defaultValue="news">
            <TabList className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex gap-1 overflow-x-auto">
              {["news", "financials", "earnings", "analyst", "profile"].map(
                (tab) => (
                  <TabTrigger
                    key={tab}
                    value={tab}
                    className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide rounded-xl whitespace-nowrap transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-400 hover:text-slate-600"
                  >
                    {tab}
                  </TabTrigger>
                )
              )}
            </TabList>

            <TabPanels className="p-6">
              <TabPanel value="news">
                <NewsTab symbol={symbol} />
              </TabPanel>
              <TabPanel value="financials">
                <FinancialsTab symbol={symbol} />
              </TabPanel>
              <TabPanel value="earnings">
                <EarningsTab symbol={symbol} />
              </TabPanel>
              <TabPanel value="analyst">
                <AnalystTab symbol={symbol} />
              </TabPanel>
              <TabPanel value="profile">
                <ProfileTab symbol={symbol} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600 bg-blue-100",
    text: "text-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600 bg-emerald-100",
    text: "text-emerald-700",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "text-violet-600 bg-violet-100",
    text: "text-violet-700",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600 bg-amber-100",
    text: "text-amber-700",
  },
  cyan: {
    bg: "bg-cyan-50",
    icon: "text-cyan-600 bg-cyan-100",
    text: "text-cyan-700",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "text-rose-600 bg-rose-100",
    text: "text-rose-700",
  },
};

function InsightCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: keyof typeof colorMap;
}) {
  if (!value || value === "Data unavailable") return null;

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-transparent",
        colors.bg
      )}
    >
      <div className={cn("p-1.5 rounded-lg", colors.icon)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className={cn("text-xs font-semibold truncate", colors.text)}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function VerdictPill({ verdict }: { verdict: "Bullish" | "Bearish" | "Neutral" }) {
  const config = {
    Bullish: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      icon: TrendingUp,
    },
    Bearish: {
      bg: "bg-rose-100",
      text: "text-rose-700",
      icon: TrendingDown,
    },
    Neutral: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: Activity,
    },
  }[verdict];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm",
        config.bg,
        config.text
      )}
    >
      <config.icon className="h-4 w-4" />
      {verdict}
    </div>
  );
}
