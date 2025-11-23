// components/investment/investment-overview.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PriceChartCard from "./price-chart-card";
import { useHistory, useQuote } from "@/hooks/use-market";
import { RANGE_PRESETS } from "@/types/market";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat } from "./stat";
import { fmtCompact, fmtPct, fmtCurrency, fmtNum } from "@/utils/format";
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
import { useAiInsightSymbol } from "@/hooks/use-ai-insight-symbol";
import { Button } from "../ui/button";
import {
  StockAnalysisCard,
  StockAnalysis,
} from "@/components/ai/SymbolAnalysis";
import { NewsTab } from "./tabs/news-tab";

export default function InvestmentOverview({ symbol }: { symbol: string }) {
  const [r, setR] = useState(RANGE_PRESETS[5]);

  const { data: quote, loading: loadingQ, error: errorQ } = useQuote(symbol);
  const {
    data: history,
    loading: loadingH,
    error: errorH,
  } = useHistory(symbol, r.period, r.interval);

  const title = useMemo(
    () => (quote?.name ? `${quote.name} (${symbol})` : symbol),
    [quote?.name, symbol]
  );

  const dayBadge = useMemo(() => {
    const pct = quote?.day_change_pct ?? null;
    if (pct == null) return null;
    const pos = pct >= 0;
    const cls = pos ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    const sign = pos ? "+" : "";
    return (
      <Badge className={cls}>
        {sign}
        {pct.toFixed(2)}%
      </Badge>
    ); // pct already in % units from backend
  }, [quote?.day_change_pct]);

  const pos52w = useMemo(() => {
    const hi = quote?.["52_week_high"];
    const lo = quote?.["52_week_low"];
    const px = quote?.current_price;
    if ([hi, lo, px].some((v) => v == null) || hi === lo) return 0.5;
    return Math.min(
      1,
      Math.max(
        0,
        ((px as number) - (lo as number)) / ((hi as number) - (lo as number))
      )
    );
  }, [quote]);

  const { loading, error, analysis, fetch } = useAiInsightSymbol(symbol);

  return (
    <div className="space-y-6 md:space-y-7">
      {/* Header */}
      <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg">
        <div className="flex flex-col gap-5 px-5 py-5 text-white md:flex-row md:items-center md:justify-between md:px-7 md:py-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight">
                {title}
              </h1>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                {quote?.exchange || "—"} • {quote?.currency || "—"}
              </span>
            </div>
            {quote?.data_quality?.fetched_at_utc && (
              <div className="text-xs text-white/70">
                Last update {new Date(quote.data_quality.fetched_at_utc).toLocaleString()}{" "}
                {quote.data_quality?.is_stale ? "• Data may be delayed" : ""}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {dayBadge}
              {errorQ ? (
                <span className="text-xs text-red-200">{errorQ}</span>
              ) : null}
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
            <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right shadow-inner">
                {loadingQ ? (
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-6 w-28 bg-white/20" />
                    <Skeleton className="h-3 w-16 bg-white/20" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-semibold tracking-tight">
                      {fmtCurrency(quote?.current_price, quote?.currency || "USD")}
                    </div>
                    <div className="text-xs text-white/80">
                      Δ {fmtNum(quote?.day_change)}
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetch}
                disabled={loading}
                className="bg-white text-slate-900 hover:bg-white/90"
              >
                {loading ? "Analyzing..." : "AI Insight"}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Live quote with daily move
            </div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
              Price action
            </p>
            <p className="text-sm text-slate-600">Historic moves & ranges</p>
          </div>
          {dayBadge ? <div className="hidden md:block">{dayBadge}</div> : null}
        </div>
        {loadingH && !history ? (
          <div className="space-y-2 m-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-[280px] w-full" />
          </div>
        ) : errorH ? (
          <div className="text-sm text-red-600">{errorH}</div>
        ) : history?.status === "ok" && history.points?.length ? (
          <PriceChartCard
            candles={history.points}
            height={280}
            r={r}
            setR={setR}
          />
        ) : (
          <div className="text-sm text-slate-600">No chart data.</div>
        )}
      </Card>

      {analysis && (
        // <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
        //   {analysis.analysis}
        // </p>
        <StockAnalysisCard stock={analysis} />
      )}

      <Card className="border border-slate-200 p-4 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-700">52-Week Range</span>
            <span className="text-slate-500">Positioned vs highs/lows</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {quote?.["52_week_low"] != null
                ? (quote?.["52_week_low"] as number).toFixed(2)
                : "—"}
            </span>
            <span>
              {quote?.["52_week_high"] != null
                ? (quote?.["52_week_high"] as number).toFixed(2)
                : "—"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 relative overflow-hidden">
            <div
              className="absolute inset-y-0 w-1.5 -translate-x-1/2 rounded-full bg-slate-900"
              style={{ left: `${pos52w * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
              Fundamentals at a glance
            </p>
            <p className="text-sm text-slate-600">
              Valuation, profitability, and analyst posture
            </p>
          </div>
          <span className="text-xs text-slate-500">Auto-updated with latest quote</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {[
            { label: "Market Cap", value: fmtCompact(quote?.market_cap) },
            {
              label: "P/E (TTM)",
              value:
                quote?.pe_ratio != null
                  ? (quote.pe_ratio as number).toFixed(2)
                  : "—",
            },
            {
              label: "Forward P/E",
              value:
                quote?.forward_pe != null
                  ? (quote.forward_pe as number).toFixed(2)
                  : "—",
            },
            {
              label: "Dividend Yield",
              value:
                quote?.dividend_yield != null
                  ? fmtPct((quote.dividend_yield as number) * 100)
                  : "—",
            },
            {
              label: "ROE",
              value:
                quote?.return_on_equity != null
                  ? fmtPct((quote.return_on_equity as number) * 100)
                  : "—",
            },
            {
              label: "Net Margin",
              value:
                quote?.profit_margins != null
                  ? fmtPct((quote.profit_margins as number) * 100)
                  : "—",
            },
            {
              label: "Target Price",
              value:
                quote?.target_price != null
                  ? (quote.target_price as number).toFixed(2)
                  : "—",
            },
            {
              label: "Analyst",
              value: quote?.recommendation_key ?? "—",
              hint:
                quote?.recommendation != null
                  ? `Score ${quote.recommendation}`
                  : undefined,
            },
          ].map(({ label, value, hint }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <Stat label={label} value={value} hint={hint} />
              {hint ? (
                <div className="mt-1 text-[11px] text-slate-500">{hint}</div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1 px-5 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
              Deep dive
            </p>
            <p className="text-sm text-slate-600">
              Switch between fundamentals, earnings, analysts, profile, and news
            </p>
          </div>
        </div>
        <div className="mt-3 px-2 md:px-4">
          <Tabs defaultValue="financials">
            <div className="rounded-xl bg-slate-50/80 px-2 pt-2">
              <TabList>
                <TabTrigger value="financials">Financials</TabTrigger>
                <TabTrigger value="earnings">Earnings & Events</TabTrigger>
                <TabTrigger value="analyst">Analyst</TabTrigger>
                <TabTrigger value="profile">Profile</TabTrigger>
                <TabTrigger value="news">News</TabTrigger>
              </TabList>
            </div>
            <div className="px-1 pb-4 md:px-2">
              <TabPanels>
                <TabPanel value="financials" mount="mount-once">
                  <FinancialsTab symbol={symbol} />
                </TabPanel>
                <TabPanel value="earnings" mount="mount-once">
                  <EarningsTab symbol={symbol} />
                </TabPanel>
                <TabPanel value="analyst" mount="mount-once">
                  <AnalystTab symbol={symbol} />
                </TabPanel>
                <TabPanel value="profile" mount="mount-once">
                  <ProfileTab symbol={symbol} />
                </TabPanel>
                <TabPanel value="news" mount="mount-once">
                  <NewsTab symbol={symbol} />
                </TabPanel>
              </TabPanels>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
