// components/investment/investment-overview.tsx
"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { StockAnalysisCard } from "@/components/ai/SymbolAnalysis";
import { NewsTab } from "./tabs/news-tab";
import { cn } from "@/lib/utils";

function formatLastUpdated(input?: string | null) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

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

  const lastUpdated = useMemo(
    () => formatLastUpdated(quote?.data_quality?.fetched_at_utc),
    [quote?.data_quality?.fetched_at_utc]
  );

  const dayDelta = useMemo(() => {
    const pct = quote?.day_change_pct;
    const abs = quote?.day_change;
    if (pct == null && abs == null) return null;
    const positive = (pct ?? abs ?? 0) >= 0;
    const pctDisplay =
      pct == null ? null : `${positive && pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;
    const absDisplay = abs == null ? null : fmtNum(abs);
    return { positive, pctDisplay, absDisplay, pct };
  }, [quote?.day_change_pct, quote?.day_change]);

  const dayBadge = useMemo(() => {
    if (!dayDelta?.pctDisplay) return null;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
          dayDelta.positive
            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
            : "bg-rose-50 text-rose-700 ring-rose-100"
        )}
      >
        {dayDelta.positive ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        <span>{dayDelta.pctDisplay}</span>
      </span>
    );
  }, [dayDelta]);

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
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="mx-auto w-full max-w-[1260px] px-4 sm:px-6 lg:px-10 xl:px-14 py-10 lg:py-12 space-y-7 sm:space-y-8">
        {/* Asset hero */}
        <section className="rounded-3xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.55)] px-5 sm:px-7 lg:px-9 py-6 sm:py-7 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-[32px] font-semibold tracking-tight leading-tight">
                  {title}
                </h1>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15">
                  {quote?.exchange || "—"} • {quote?.currency || "—"}
                </span>
              </div>
              {lastUpdated ? (
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                  <span>Last update {lastUpdated}</span>
                  {quote?.data_quality?.is_stale ? (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80 ring-1 ring-white/20">
                      Data may be delayed
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                {dayBadge}
                {errorQ ? (
                  <span className="text-xs text-rose-200">{errorQ}</span>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
              <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
                <div className="rounded-2xl bg-white/10 px-5 py-4 text-right shadow-inner ring-1 ring-white/10 min-w-[210px]">
                  {loadingQ ? (
                    <div className="flex flex-col items-end gap-1">
                      <Skeleton className="h-6 w-28 bg-white/20" />
                      <Skeleton className="h-3 w-16 bg-white/20" />
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-semibold tracking-tight">
                        {fmtCurrency(
                          quote?.current_price,
                          quote?.currency || "USD"
                        )}
                      </div>
                      <div className="mt-1 text-sm text-white/80">
                        Δ {fmtNum(quote?.day_change)}
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="default"
                  size="lg"
                  onClick={fetch}
                  disabled={loading}
                  className="rounded-xl bg-white text-neutral-900 hover:bg-white/90 shadow-sm"
                >
                  {loading ? "Analyzing..." : "AI Insight"}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.16)]" />
                  Live quote with daily move
                </span>
                {dayDelta?.absDisplay && dayDelta?.pctDisplay ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/10">
                    {dayDelta.positive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {dayDelta.absDisplay} ({dayDelta.pctDisplay})
                  </span>
                ) : null}
              </div>
              {error ? (
                <div className="text-xs text-rose-200">
                  AI insight unavailable right now. Please retry in a moment.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Price + range */}
        <section className="space-y-3">
          <Card className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                  Price action
                </p>
                <p className="text-sm text-neutral-600">
                  Historic moves & ranges
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {dayBadge ? <div className="hidden md:block">{dayBadge}</div> : null}
                <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200">
                  {RANGE_PRESETS.map((p) => {
                    const active = p.label === r.label;
                    return (
                      <button
                        key={p.label}
                        onClick={() => setR(p)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                          active
                            ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200"
                            : "text-neutral-600 hover:text-neutral-900"
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-3 pb-4 sm:px-5 sm:pb-5">
              {loadingH && !history ? (
                <div className="space-y-3 rounded-2xl bg-neutral-50/80 p-4 ring-1 ring-neutral-200/80">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-[260px] w-full" />
                </div>
              ) : errorH ? (
                <div className="p-4 text-sm text-rose-600">{errorH}</div>
              ) : history?.status === "ok" && history.points?.length ? (
                <div className="mt-3 sm:mt-4">
                  <PriceChartCard
                    candles={history.points}
                    height={320}
                    r={r}
                    setR={setR}
                    hideRangeControls
                  />
                </div>
              ) : (
                <div className="p-4 text-sm text-neutral-600">No chart data.</div>
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
            <div className="space-y-3 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-800">52-week range</span>
                  <span className="text-neutral-500">
                    {quote?.["52_week_low"] != null
                      ? (quote?.["52_week_low"] as number).toFixed(2)
                      : "—"}
                  </span>
                </div>
                <span className="text-neutral-500">
                  Positioned vs highs/lows
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="relative h-3 rounded-full bg-neutral-100 ring-1 ring-neutral-200/80">
                <div
                  className="absolute inset-y-0 w-2 -translate-x-1/2 rounded-full bg-neutral-900 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.35)]"
                  style={{ left: `${pos52w * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-600">
                <span>
                  Current {fmtCurrency(quote?.current_price, quote?.currency || "USD")}
                </span>
                {quote?.["52_week_high"] != null ? (
                  <span>
                    High {(quote?.["52_week_high"] as number).toFixed(2)}
                  </span>
                ) : null}
              </div>
            </div>
          </Card>
        </section>

        {analysis ? <StockAnalysisCard stock={analysis} /> : null}

        {/* Fundamentals */}
        <section>
          <Card className="rounded-3xl border border-neutral-200/70 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                  Fundamentals at a glance
                </p>
                <p className="text-sm text-neutral-600">
                  Valuation, profitability, and analyst posture
                </p>
              </div>
              <span className="text-xs text-neutral-500">
                Auto-updated with latest quote
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  className="rounded-2xl border border-neutral-200/80 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Stat label={label} value={value} hint={hint} />
                  {hint ? (
                    <div className="mt-1 text-[11px] text-neutral-500">{hint}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Deep dive */}
        <section>
          <Card className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-1 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                  Deep dive
                </p>
                <p className="text-sm text-neutral-600">
                  Switch between fundamentals, earnings, analysts, profile, and news
                </p>
              </div>
            </div>
            <div className="mt-4 px-3 pb-5 sm:px-5">
              <Tabs defaultValue="financials">
                <TabList>
                  <TabTrigger value="financials">Financials</TabTrigger>
                  <TabTrigger value="earnings">Earnings & Events</TabTrigger>
                  <TabTrigger value="analyst">Analyst</TabTrigger>
                  <TabTrigger value="profile">Profile</TabTrigger>
                  <TabTrigger value="news">News</TabTrigger>
                </TabList>
                <div className="mt-3">
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
        </section>
      </div>
    </div>
  );
}
