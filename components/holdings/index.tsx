"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Wallet2,
  SlidersHorizontal,
  X,
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
 * MAIN COMPONENT
 */
export function Holdings() {
  const {
    holdings,
    loading,
    reloadHoldings,
    totalCost: apiTotalCost,
    displayCurrency,
  } = useHolding();

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

  const currency = displayCurrency || holdings?.[0]?.currency || "USD";
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

  // Total from API (converted to user's currency in settings); fallback to sum when filtered
  const stats = useMemo(() => {
    const filteredSum = filteredHoldings.reduce(
      (acc, h) =>
        acc +
        Number(h.quantity) * Number(h.purchaseUnitPrice ?? h.purchasePrice ?? 0),
      0
    );
    const totalCost =
      apiTotalCost != null && accountFilter === "all" && !search.trim()
        ? apiTotalCost
        : filteredSum;
    return { totalCost };
  }, [filteredHoldings, apiTotalCost, accountFilter, search]);

  // Register page context for the chat agent
  const holdingsSummary = useMemo(() => {
    if (!holdings || holdings.length === 0) return undefined;
    const symbols = filteredHoldings.slice(0, 10).map((h) => h.symbol).join(", ");
    return [
      `Holdings: ${positionsCount} positions`,
      `Total cost: ${fmtCurrency(stats.totalCost, currency)}`,
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
          <div className="grid grid-cols-1 divide-y divide-neutral-100 border-b border-neutral-100 bg-neutral-50/30">
            <div className="p-4 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Total cost ({currency})
              </p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                {fmtCurrency(stats.totalCost, currency)}
              </p>
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
                      ["Quantity", "text-right", ""],
                      ["Purchase price", "text-right", ""],
                      ["Current price", "text-right", ""],
                      ["P/L", "text-right", ""],
                      ["Currency", "text-right", ""],
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
                  {filteredHoldings.map((h, index) => {
                    const purchasePrice =
                      h.purchaseUnitPrice ?? h.purchasePrice ?? 0;
                    const qty = Number(h.quantity) || 0;
                    const costBasis = purchasePrice * qty;
                    const currentPrice =
                      h.currentPrice != null && Number.isFinite(h.currentPrice)
                        ? h.currentPrice
                        : null;
                    const currentValue =
                      currentPrice != null ? currentPrice * qty : null;
                    const pl =
                      currentValue != null && costBasis > 0
                        ? currentValue - costBasis
                        : null;
                    const plPct =
                      currentValue != null && costBasis > 0
                        ? ((currentValue / costBasis - 1) * 100)
                        : null;
                    const rowKey =
                      h.id != null
                        ? String(h.id)
                        : `${h.externalId ?? h.symbol}-${h.accountName ?? h.accountId ?? index}`;

                    return (
                      <tr
                        key={rowKey}
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

                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-medium text-neutral-600">
                          {fmtNumber(h.quantity)}
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-bold text-neutral-900">
                          {fmtCurrency(purchasePrice, h.currency ?? currency)}
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-medium text-neutral-700">
                          {h.currentPrice != null && Number.isFinite(h.currentPrice)
                            ? fmtCurrency(h.currentPrice, h.currency ?? currency)
                            : "—"}
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-medium">
                          {pl != null && plPct != null ? (
                            <span
                              className={cn(
                                pl >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              )}
                            >
                              {fmtCurrency(pl, h.currency ?? currency)}
                              <span className="text-neutral-500 font-normal ml-1">
                                ({pl >= 0 ? "+" : ""}
                                {fmtPct(plPct)})
                              </span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right text-neutral-600 font-medium">
                          {h.currency ?? currency}
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
