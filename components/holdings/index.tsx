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
  Plus,
  Pencil,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useHolding } from "@/hooks/use-holdings";
import type { Holding } from "@/types/holding";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtCurrency, fmtNumber, fmtPct } from "@/utils/format";
import { Page } from "@/components/layout/Page";
import SymbolLogo from "@/components/layout/SymbolLogo";
import { AddEditHoldingDialog } from "@/components/holdings/add-edit-holding-dialog";
import { usePageContext } from "@/hooks/usePageContext";
import { usePathname } from "next/navigation";

/**
 * UTILS
 */

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
  const { holdings, loading, reloadHoldings } = useHolding();

  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");

  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);

  const openAddDialog = () => {
    setEditingHolding(null);
    setDialogOpen(true);
  };

  const openEditDialog = (h: Holding, e: React.MouseEvent) => {
    e.stopPropagation(); // don't navigate to symbol page
    setEditingHolding(h);
    setDialogOpen(true);
  };

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

  // Register page context for the chat agent
  const holdingsSummary = useMemo(() => {
    if (!holdings || holdings.length === 0) return undefined;
    const symbols = filteredHoldings.slice(0, 10).map((h) => h.symbol).join(", ");
    return [
      `Holdings: ${positionsCount} positions`,
      `Total value: ${fmtCurrency(stats.totalValue, currency)}`,
      `Total P/L: ${fmtCurrency(stats.totalPl, currency)} (${fmtPct(stats.totalPlPct)})`,
      accountFilter !== "all" ? `Filtered by: ${accountFilter}` : "",
      search ? `Search: "${search}"` : "",
      `Symbols: ${symbols}`,
    ].filter(Boolean).join(". ");
  }, [holdings, filteredHoldings, positionsCount, stats, currency, accountFilter, search]);

  usePageContext({
    pageType: "holdings",
    route: pathname,
    summary: holdingsSummary,
  });

  const handleRowClick = (h: Holding) => {
    const isCrypto = h.type === "cryptocurrency";
    const params = new URLSearchParams();
    params.set("type", isCrypto ? "crypto" : "stock");

    router.push(
      `/dashboard/symbol/${encodeURIComponent(h.symbol)}?${params.toString()}`
    );
  };

  return (
    <Page>
      {/* Header Section */}
      <header className="flex flex-col gap-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
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
            <Button
              onClick={openAddDialog}
              className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Holding</span>
            </Button>
          </div>
        </div>
      </header>

      <Card className="overflow-hidden rounded-[32px] border-neutral-200/60 shadow-xl shadow-neutral-200/40 bg-white">
        {/* TOP STATS BAR */}
        {!loading && filteredHoldings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-neutral-100 border-b border-neutral-100 bg-neutral-50/30">
            <div className="p-4 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Portfolio Value
              </p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                {fmtCurrency(stats.totalValue, currency)}
              </p>
            </div>
            <div className="p-4 sm:p-6">
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
                {fmtPct(stats.totalPlPct)}
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
            <div className="py-16 px-6 flex flex-col items-center text-center">
              {search || accountFilter !== "all" ? (
                /* ── Filter produced no results ── */
                <>
                  <div className="h-14 w-14 bg-neutral-50 rounded-full flex items-center justify-center mb-4 ring-1 ring-neutral-100">
                    <Search className="h-6 w-6 text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    No matches
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-xs mt-1">
                    No holdings match your current filters. Try broadening your
                    search or clearing filters.
                  </p>
                  <Button
                    onClick={() => { setSearch(""); setAccountFilter("all"); }}
                    variant="outline"
                    className="mt-4 rounded-xl"
                  >
                    Clear filters
                  </Button>
                </>
              ) : (
                /* ── Truly no holdings ── */
                <>
                  <div className="relative mb-5">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-100 opacity-30 blur-lg" />
                    <div className="relative h-16 w-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center ring-1 ring-indigo-100">
                      <Wallet2 className="h-7 w-7 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    No holdings yet
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-sm mt-1 leading-relaxed">
                    Get started by connecting your brokerage to import holdings automatically,
                    or add them manually by searching for a ticker.
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <Button
                      onClick={openAddDialog}
                      className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                      Add Holding
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl gap-1.5">
                      <Link href="/connections">
                        Connect Account
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-20 bg-neutral-50/90 backdrop-blur-md text-neutral-500">
                  <tr>
                    {[
                      ["Asset", "text-left", ""],
                      ["Quantity", "text-right", "hidden sm:table-cell"],
                      ["Total Value", "text-right", ""],
                      ["Current Price", "text-right", "hidden lg:table-cell"],
                      ["7D Trend", "text-center", "hidden md:table-cell"],
                      ["Returns", "text-right", ""],
                      ["", "w-10", ""],
                    ].map(([label, align, visibility]) => (
                      <th
                        key={label || "edit"}
                        className={cn(
                          "px-4 sm:px-6 py-4 text-[10px] font-bold uppercase tracking-widest",
                          align,
                          visibility
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
                        onClick={() => handleRowClick(h)}
                        className="group cursor-pointer transition-colors hover:bg-neutral-50/80"
                      >
                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                          <div className="flex items-center gap-3">
                            <SymbolLogo
                              symbol={h.symbol}
                              isCrypto={h.type === "cryptocurrency"}
                              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl shadow-sm transition-transform group-hover:scale-110"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-neutral-900 leading-none mb-1 text-sm">
                                {h.symbol}
                              </div>
                              <div className="truncate text-xs text-neutral-400 max-w-[100px] sm:max-w-[140px] lg:max-w-[180px]">
                                {h.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4 sm:py-5 text-right font-medium text-neutral-600">
                          {fmtNumber(h.quantity)}
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-bold text-neutral-900">
                          {fmtCurrency(h.currentValue ?? null, currency)}
                        </td>

                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4 sm:py-5 text-right text-neutral-600">
                          {fmtCurrency(h.currentPrice ?? null, currency)}
                        </td>

                        <td className="hidden md:table-cell px-4 sm:px-6 py-4 sm:py-5">
                          <div className="flex justify-center items-center opacity-70 group-hover:opacity-100 transition-opacity">
                            <Sparkline data={mockTrend} color={sparkColor} />
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={cn(
                                "rounded-md border-none px-2 py-0.5 font-bold shadow-none",
                                toneFromPct(pl)
                              )}
                            >
                              {fmtPct(pl)}
                            </Badge>
                            <span className="text-[9px] uppercase tracking-tighter font-bold text-neutral-400">
                              Total P/L
                            </span>
                          </div>
                        </td>

                        <td className="px-2 py-5">
                          {h.source === "manual" && (
                            <button
                              onClick={(e) => openEditDialog(h, e)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 group-hover:opacity-100 transition-all"
                              title="Edit holding"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
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

      {/* Add/Edit Dialog */}
      <AddEditHoldingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        holding={editingHolding}
        onSuccess={reloadHoldings}
      />
    </Page>
  );
}
