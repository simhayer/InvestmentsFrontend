"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Wallet2,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Newspaper,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useHolding } from "@/hooks/use-holdings";
import type { Holding } from "@/types/holding";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtCurrency, fmtNumber } from "@/utils/format";
import { Page } from "@/components/layout/Page";
import SymbolLogo from "@/components/layout/SymbolLogo";

/**
 * UTILS
 */
const fmtPercent = (n: number | null | undefined) =>
  n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

function toneFromPct(pct?: number | null) {
  if (pct == null) return "text-neutral-500 bg-neutral-50";
  if (pct > 0) return "text-emerald-600 bg-emerald-50";
  if (pct < 0) return "text-rose-600 bg-rose-50";
  return "text-neutral-600 bg-neutral-50";
}

/**
 * COMPONENTS: Sparkline
 */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2)
    return <div className="h-6 w-20 bg-neutral-50 rounded animate-pulse" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 80;
  const height = 24;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / (range || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/**
 * MAIN COMPONENT
 */
export function Holdings() {
  const { holdings, loading } = useHolding() as {
    holdings: Holding[];
    loading: boolean;
  };

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");

  const currency = holdings?.[0]?.currency || "USD";
  const positionsCount = holdings?.length ?? 0;

  const accountLabel = (h: Holding) =>
    h.accountName || h.institution || "Account";

  const accountOptions = useMemo(
    () =>
      Array.from(new Set((holdings ?? []).map(accountLabel))).filter(Boolean),
    [holdings]
  );

  const filteredHoldings = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (holdings ?? []).filter((h) => {
      const matchesAccount =
        accountFilter === "all" || accountLabel(h) === accountFilter;

      const matchesQuery = q
        ? h.symbol?.toLowerCase().includes(q) ||
          h.name?.toLowerCase().includes(q)
        : true;

      return matchesAccount && matchesQuery;
    });
  }, [holdings, search, accountFilter]);

  // Derived Financial Stats for the summary bar
  const stats = useMemo(() => {
    const totalValue = filteredHoldings.reduce(
      (acc, h) => acc + (h.currentValue ?? 0),
      0
    );
    const totalCost = filteredHoldings.reduce(
      (acc, h) => acc + Number(h.quantity) * Number(h.purchaseUnitPrice || 0),
      0
    );
    const totalPl = totalValue - totalCost;
    const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0;

    return { totalValue, totalPl, totalPlPct };
  }, [filteredHoldings]);

  const handleRowClick = (symbol: string) =>
    router.push(`/dashboard/symbol/${encodeURIComponent(symbol)}`);

  return (
    <Page>
      {/* Header Section */}
      <header className="flex flex-col gap-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              Holdings
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-md font-medium px-2 py-0"
              >
                {positionsCount} Positions
              </Badge>
              {accountFilter !== "all" && (
                <Badge
                  variant="outline"
                  className="rounded-md border-neutral-200 text-neutral-500"
                >
                  {accountFilter}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {accountOptions.length > 0 && (
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-neutral-200 bg-white shadow-sm">
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All accounts</SelectItem>
                  {accountOptions.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="relative flex-1 sm:w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find ticker..."
                className="rounded-xl border-neutral-200 pl-10 focus-visible:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <Card className="overflow-hidden rounded-[32px] border-neutral-200/60 shadow-xl shadow-neutral-200/40 bg-white">
        {/* TOP STATS BAR */}
        {!loading && filteredHoldings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100 border-b border-neutral-100 bg-neutral-50/30">
            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Portfolio Value
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {fmtCurrency(stats.totalValue, currency)}
              </p>
            </div>
            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Total Returns
              </p>
              <div
                className={cn(
                  "flex items-center gap-1.5 text-lg font-bold",
                  stats.totalPlPct >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {stats.totalPlPct >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {fmtPercent(stats.totalPlPct)}
              </div>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredHoldings.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4 ring-1 ring-neutral-100">
                <Wallet2 className="h-8 w-8 text-neutral-300" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                No holdings found
              </h3>
              <p className="text-sm text-neutral-500 max-w-xs mt-1">
                Adjust filters or connect more accounts to see your assets.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setAccountFilter("all");
                }}
                variant="link"
                className="mt-2 text-emerald-600"
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-20 bg-neutral-50/90 backdrop-blur-md text-neutral-500">
                  <tr>
                    {[
                      ["Asset", "text-left"],
                      ["Quantity", "text-right"],
                      ["Total Value", "text-right"],
                      ["Current Price", "text-right"],
                      ["7D Trend", "text-center"],
                      ["Returns", "text-right"],
                    ].map(([label, align]) => (
                      <th
                        key={label}
                        className={cn(
                          "px-6 py-4 text-[10px] font-bold uppercase tracking-widest",
                          align
                        )}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredHoldings.map((h) => {
                    const pl = h.unrealizedPlPct ?? 0;
                    const isPositive = pl >= 0;
                    const sparkColor = isPositive ? "#10b981" : "#f43f5e";

                    // Mock data - replace with h.history if available
                    const mockTrend = isPositive
                      ? [30, 35, 32, 45, 42, 50, 48, 60]
                      : [60, 55, 58, 45, 48, 40, 35, 30];

                    return (
                      <tr
                        key={h.externalId ?? h.id ?? h.symbol}
                        onClick={() => handleRowClick(h.symbol)}
                        className="group cursor-pointer transition-colors hover:bg-neutral-50/80"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <SymbolLogo
                              symbol={h.symbol}
                              isCrypto={h.type === "cryptocurrency"}
                              className="h-10 w-10 rounded-xl shadow-sm transition-transform group-hover:scale-110"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-neutral-900 leading-none mb-1">
                                {h.symbol}
                              </div>
                              <div className="truncate text-xs text-neutral-400 max-w-[120px]">
                                {h.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right font-medium text-neutral-600">
                          {fmtNumber(h.quantity)}
                        </td>

                        <td className="px-6 py-5 text-right font-bold text-neutral-900">
                          {fmtCurrency(h.currentValue ?? null, currency)}
                        </td>

                        <td className="px-6 py-5 text-right text-neutral-600">
                          {fmtCurrency(h.currentPrice ?? null, currency)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-center items-center opacity-70 group-hover:opacity-100 transition-opacity">
                            <Sparkline data={mockTrend} color={sparkColor} />
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={cn(
                                "rounded-md border-none px-2 py-0.5 font-bold shadow-none",
                                toneFromPct(pl)
                              )}
                            >
                              {fmtPercent(pl)}
                            </Badge>
                            <span className="text-[9px] uppercase tracking-tighter font-bold text-neutral-400">
                              Total P/L
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}
