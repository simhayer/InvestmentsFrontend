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
import { SymbolAnalysis } from "@/components/ai/SymbolAnalysis";

export default function InvestmentOverview({ symbol }: { symbol: string }) {
  const [r, setR] = useState(RANGE_PRESETS[5]); // default 1Y

  const [range, setRange] = useState(RANGE_PRESETS[5]);
  const { data: quote, loading: loadingQ, error: errorQ } = useQuote(symbol);
  const {
    data: history,
    loading: loadingH,
    error: errorH,
  } = useHistory(symbol, range.period, range.interval);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <div className="text-sm text-slate-600">
            {quote?.exchange || "—"} • {quote?.currency || "—"}
          </div>
          {quote?.data_quality?.fetched_at_utc && (
            <div className="text-xs text-slate-500 mt-1">
              Last update{" "}
              {new Date(quote.data_quality.fetched_at_utc).toLocaleString()}{" "}
              {quote.data_quality?.is_stale ? "• Data may be delayed" : ""}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {dayBadge}
          <div className="text-right">
            {loadingQ ? (
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            ) : errorQ ? (
              <div className="text-xs text-red-600 max-w-[220px] text-right">
                {errorQ}
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold">
                  {fmtCurrency(quote?.current_price, quote?.currency || "USD")}
                </div>
                <div className="text-xs text-slate-600">
                  Δ {fmtNum(quote?.day_change)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Range selector */}
      <div className="flex flex-wrap gap-2">
        {RANGE_PRESETS.map((p) => {
          const active = p.label === r.label;
          return (
            <button
              key={p.label}
              onClick={() => setR(p)}
              className={`px-2.5 py-1 text-xs rounded border ${
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="p-3">
        {loadingH && !history ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-[360px] w-full" />
          </div>
        ) : errorH ? (
          <div className="text-sm text-red-600">{errorH}</div>
        ) : history?.status === "ok" && history.points?.length ? (
          <PriceChartCard candles={history.points} height={360} />
        ) : (
          <div className="text-sm text-slate-600">No chart data.</div>
        )}
      </Card>

      {analysis && (
        // <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
        //   {analysis.analysis}
        // </p>
        <SymbolAnalysis
          symbol={symbol}
          name={symbol}
          holdingAnalysis={analysis}
        />
      )}

      <Button variant="outline" size="sm" onClick={fetch} disabled={loading}>
        {loading ? "Analyzing..." : "AI Insight"}
      </Button>

      <Card className="p-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {quote?.["52_week_low"] != null
                ? (quote?.["52_week_low"] as number).toFixed(2)
                : "—"}
            </span>
            <span>52-Week Range</span>
            <span>
              {quote?.["52_week_high"] != null
                ? (quote?.["52_week_high"] as number).toFixed(2)
                : "—"}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded relative">
            <div
              className="absolute -top-1 h-3 w-1 rounded bg-slate-900"
              style={{ left: `calc(${pos52w * 100}% - 2px)` }}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="Market Cap" value={fmtCompact(quote?.market_cap)} />
          <Stat
            label="P/E (TTM)"
            value={
              quote?.pe_ratio != null
                ? (quote.pe_ratio as number).toFixed(2)
                : "—"
            }
          />
          <Stat
            label="Forward P/E"
            value={
              quote?.forward_pe != null
                ? (quote.forward_pe as number).toFixed(2)
                : "—"
            }
          />
          <Stat
            label="Dividend Yield"
            value={
              quote?.dividend_yield != null
                ? fmtPct((quote.dividend_yield as number) * 100)
                : "—"
            }
          />
          <Stat
            label="ROE"
            value={
              quote?.return_on_equity != null
                ? fmtPct((quote.return_on_equity as number) * 100)
                : "—"
            }
          />
          <Stat
            label="Net Margin"
            value={
              quote?.profit_margins != null
                ? fmtPct((quote.profit_margins as number) * 100)
                : "—"
            }
          />
          <Stat
            label="Target Price"
            value={
              quote?.target_price != null
                ? (quote.target_price as number).toFixed(2)
                : "—"
            }
          />
          <Stat
            label="Analyst"
            value={quote?.recommendation_key ?? "—"}
            hint={
              quote?.recommendation != null
                ? `Score ${quote.recommendation}`
                : undefined
            }
          />
        </div>
      </Card>

      <Tabs defaultValue="financials">
        <TabList>
          <TabTrigger value="financials">Financials</TabTrigger>
          <TabTrigger value="earnings">Earnings & Events</TabTrigger>
          <TabTrigger value="analyst">Analyst</TabTrigger>
          <TabTrigger value="profile">Profile</TabTrigger>
        </TabList>
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
        </TabPanels>
      </Tabs>
    </div>
  );
}
