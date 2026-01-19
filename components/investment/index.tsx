"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, RefreshCcw } from "lucide-react";
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
import SymbolLogo from "@/components//layout/SymbolLogo";

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
    quoteSymbol,
  );
  const {
    loading: aiLoading,
    analysis,
    fetch: fetchAi,
  } = useAiInsightSymbol(symbol);

  const isPositive = (quote?.day_change_pct ?? 0) >= 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F9FA]">
      {/* SIDEBAR: Compact & Sticky */}
      <aside className="w-full lg:w-[320px] bg-white border-r border-neutral-200 p-6 flex flex-col gap-6 shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <section>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded uppercase tracking-widest mb-4">
            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            Live Market
          </div>

          <div className="flex items-center gap-3 mb-1">
            <SymbolLogo symbol={symbol} isCrypto={isCrypto} />
            <h1 className="text-3xl font-black tracking-tighter text-neutral-900 leading-none">
              {symbol}
            </h1>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            {quote?.name}
          </p>

          <div className="mt-6">
            <div className="text-2xl font-bold tracking-tight text-neutral-900">
              {fmtCurrency(quote?.current_price, quote?.currency)}
            </div>
            <div
              className={cn(
                "text-sm font-bold flex items-center gap-1 mt-0.5",
                isPositive ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {isPositive ? "+" : ""}
              {fmtPct(quote?.day_change_pct || 0)}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <SidebarMetric
              label="Mkt Cap"
              value={fmtCompact(quote?.market_cap)}
            />
            <SidebarMetric
              label="P/E Ratio"
              value={quote?.pe_ratio?.toFixed(2) || "—"}
            />
            <SidebarMetric
              label="52W High"
              value={fmtCurrency(quote?.["52_week_high"], quote?.currency)}
            />
          </div>

          <Button
            onClick={fetchAi}
            disabled={aiLoading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl group transition-all"
          >
            {aiLoading ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="font-bold text-sm">Analyze with AI</span>
              </>
            )}
          </Button>
        </section>
      </aside>

      {/* MAIN VIEWPORT: Wide Insights */}
      <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-[1200px]">
        {/* 1. CHART AREA */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
              Market Performance
            </span>
            <div className="bg-white border border-neutral-200 p-1 rounded-xl shadow-sm flex gap-1">
              {RANGE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setR(p)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-black rounded-lg transition-all",
                    r.label === p.label
                      ? "bg-neutral-900 text-white shadow-md"
                      : "text-neutral-400 hover:bg-neutral-50",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Card className="rounded-[32px] overflow-hidden border-none shadow-sm relative min-h-[450px] bg-white p-6">
            {loadingH && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                <RefreshCcw className="h-6 w-6 animate-spin text-neutral-300" />
              </div>
            )}
            <PriceChartCard
              candles={history?.points || []}
              height={420}
              r={r}
              setR={setR}
              hideRangeControls
            />
          </Card>
        </section>

        {/* 2. AI ANALYSIS AREA (FULL WIDTH) */}
        <AnimatePresence>
          {analysis && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 px-2">
                <div className="p-1 bg-indigo-100 rounded">
                  <Sparkles className="h-3 w-3 text-indigo-600" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  AI Deep Reasoning
                </span>
              </div>
              {/* Fix this type cast once structure is finalized */}
              <StockAnalysisCard stock={analysis as any} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* 3. CONTEXTUAL DATA TABS */}
        <section className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <Tabs defaultValue="news">
            <TabList className="bg-neutral-50/50 border-b border-neutral-100 p-2 min-h-[52px] rounded-[32px]">
              <TabTrigger
                value="news"
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                Global News
              </TabTrigger>
              <TabTrigger
                value="financials"
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                Financials
              </TabTrigger>
              <TabTrigger
                value="earnings"
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                Earnings
              </TabTrigger>
              <TabTrigger
                value="analyst"
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                Analyst
              </TabTrigger>
              <TabTrigger
                value="profile"
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                Profile
              </TabTrigger>
            </TabList>

            <TabPanels className="p-8">
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

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4">
      <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-neutral-900">{value}</p>
    </div>
  );
}
