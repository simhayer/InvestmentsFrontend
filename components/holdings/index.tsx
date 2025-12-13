"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Wallet2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useHolding } from "@/hooks/use-holdings";
import type { Holding } from "@/types/holding";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const fmtCurrency = (n: number | null | undefined, currency = "USD") =>
  n == null
    ? "—"
    : n.toLocaleString(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      });

const fmtNumber = (n: number | null | undefined, digits = 8) =>
  n == null
    ? "—"
    : n.toLocaleString(undefined, { maximumFractionDigits: digits });

const fmtPercent = (n: number | null | undefined) =>
  n == null ? "—" : `${n.toFixed(2)}%`;

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
    () => Array.from(new Set(holdings?.map(accountLabel))).filter(Boolean),
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

  const totalValue = useMemo(
    () =>
      filteredHoldings.reduce(
        (acc, h) =>
          acc +
          (h.currentValue ??
            (Number(h.currentPrice) || 0) * (Number(h.quantity) || 0)),
        0
      ),
    [filteredHoldings]
  );

  const handleRowClick = (symbol: string) =>
    router.push(`/dashboard/symbol/${encodeURIComponent(symbol)}`);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200">
        <Wallet2 className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-neutral-900">
          No holdings yet
        </p>
        <p className="text-sm text-neutral-600">
          Connect an account or analyze your portfolio to see positions.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild size="sm">
          <Link href="/connections">Connect an account</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="bg-white">
          <Link href="/analytics">Analyze portfolio</Link>
        </Button>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-hidden rounded-[26px] border border-neutral-200/80 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em]">
                Asset
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em]">
                Quantity
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em]">
                Total Value
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em]">
                Current Price
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em]">
                Avg Unit Cost
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em]">
                P/L %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {filteredHoldings.map((h) => {
              const plTone =
                h.unrealizedPlPct == null
                  ? "text-neutral-500"
                  : h.unrealizedPlPct > 0
                  ? "text-emerald-600"
                  : h.unrealizedPlPct < 0
                  ? "text-rose-600"
                  : "text-neutral-600";

              return (
                <tr
                  key={h.externalId ?? h.id ?? h.symbol}
                  onClick={() => handleRowClick(h.symbol)}
                  className="cursor-pointer transition hover:bg-neutral-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-neutral-900">
                        {h.symbol}
                      </div>
                      <div className="text-xs text-neutral-500">{h.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-neutral-800">
                    {fmtNumber(h.quantity)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-neutral-900">
                    {fmtCurrency(h.currentValue ?? null, currency)}
                  </td>
                  <td className="px-5 py-4 text-right text-neutral-800">
                    {fmtCurrency(h.currentPrice ?? null, currency)}
                  </td>
                  <td className="px-5 py-4 text-right text-neutral-800">
                    {fmtCurrency(h.purchaseUnitPrice ?? null, currency)}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-4 text-right text-sm font-semibold",
                      plTone
                    )}
                  >
                    {fmtPercent(h.unrealizedPlPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMobileList = () => (
    <div className="grid grid-cols-1 gap-3">
      {filteredHoldings.map((h) => {
        const plTone =
          h.unrealizedPlPct == null
            ? "text-neutral-500"
            : h.unrealizedPlPct > 0
            ? "text-emerald-600"
            : h.unrealizedPlPct < 0
            ? "text-rose-600"
            : "text-neutral-600";

        return (
          <button
            key={h.externalId ?? h.id ?? h.symbol}
            onClick={() => handleRowClick(h.symbol)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-left shadow-[0_12px_36px_-28px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900">
                  {h.symbol}
                </div>
                <div className="text-xs text-neutral-500">{h.name}</div>
              </div>
              <div className={cn("text-sm font-semibold", plTone)}>
                {fmtPercent(h.unrealizedPlPct)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-neutral-600">
              <div className="space-y-1">
                <p className="uppercase tracking-[0.08em]">Quantity</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {fmtNumber(h.quantity)}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="uppercase tracking-[0.08em]">Total value</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {fmtCurrency(h.currentValue ?? null, currency)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="uppercase tracking-[0.08em]">Current price</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {fmtCurrency(h.currentPrice ?? null, currency)}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="uppercase tracking-[0.08em]">Avg unit cost</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {fmtCurrency(h.purchaseUnitPrice ?? null, currency)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="mx-auto w-full max-w-[1260px] px-4 sm:px-6 lg:px-10 xl:px-14 py-9 sm:py-10 lg:py-12 space-y-6 sm:space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-4 sm:gap-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Portfolio
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-[32px] font-semibold text-neutral-900">
                Holdings
              </h1>
              <Badge className="rounded-full bg-neutral-900 text-white">
                {positionsCount === 1
                  ? "1 position"
                  : `${positionsCount} positions`}
              </Badge>
            </div>
            <p className="text-sm text-neutral-600 max-w-2xl">
              All positions across your linked accounts.
            </p>
          </div>

          <div className="w-full max-w-xl space-y-2 sm:w-auto sm:space-y-3">
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              {accountOptions.length ? (
                <Select
                  value={accountFilter}
                  onValueChange={(value) => setAccountFilter(value)}
                >
                  <SelectTrigger className="w-full rounded-xl border-neutral-200 bg-white text-sm font-semibold text-neutral-900 shadow-sm sm:w-[180px]">
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All accounts</SelectItem>
                    {accountOptions.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <div className="relative min-w-[220px] flex-1 sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ticker or name"
                  className="h-10 rounded-xl border-neutral-200 bg-white pl-10 text-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        </header>

        <Card className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader className="flex flex-col gap-4 border-b border-neutral-100/80 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-[240px]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                Positions
              </p>
              <CardTitle className="text-xl font-semibold text-neutral-900">
                Current holdings
              </CardTitle>
              <CardDescription className="text-sm text-neutral-600">
                Live prices, cost basis, and unrealized moves.
              </CardDescription>
            </div>
            {!loading && filteredHoldings.length ? (
              <div className="w-full text-left sm:w-auto sm:text-right sm:ml-auto sm:self-start flex-shrink-0 space-y-1 rounded-2xl bg-neutral-50/70 px-4 py-3 sm:bg-transparent sm:px-0 sm:py-0">
                <p className="text-xs uppercase tracking-[0.08em] text-neutral-500 leading-none">
                  Total value (filtered)
                </p>
                <p className="text-lg font-semibold text-neutral-900 leading-tight">
                  {fmtCurrency(totalValue, currency)}
                </p>
                <p className="text-xs text-neutral-500 leading-snug">
                  {filteredHoldings.length === 1
                    ? "Across 1 position"
                    : `Across ${filteredHoldings.length} positions`}
                </p>
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <Skeleton className="h-72 w-full rounded-2xl" />
              </div>
            ) : !filteredHoldings.length ? (
              renderEmptyState()
            ) : (
              <>
                <div className="hidden md:block px-6">
                  {renderTable()}
                </div>
                <div className="block p-6 md:hidden">{renderMobileList()}</div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100/80 bg-neutral-50/70 px-6 py-4 text-sm text-neutral-700">
                  <span>Portfolio total</span>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-base font-semibold text-neutral-900">
                      {fmtCurrency(totalValue, currency)}
                    </span>
                    <span className="text-neutral-500">
                      {filteredHoldings.length === 1
                        ? "1 position"
                        : `${filteredHoldings.length} positions`}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
