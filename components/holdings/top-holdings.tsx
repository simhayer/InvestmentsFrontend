"use client";

import { Holding } from "@/types/holding";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { fmtCurrency, fmtNumber } from "@/utils/format";

interface Props {
  holdings: Holding[];
  loading: boolean;
  currency?: string;
}

export function TopHoldings({ holdings, loading, currency = "USD" }: Props) {
  const router = useRouter();
  const maxRows = 4;

  const getTotalValue = (holding: Holding) => {
    if (holding.currentValue != null) return holding.currentValue;
    const qty = Number(holding.quantity);
    const price = Number(holding.currentPrice);
    if (!Number.isFinite(qty) || !Number.isFinite(price)) return null;
    return qty * price;
  };

  const sortedHoldings = (holdings ?? [])
    .slice()
    .sort(
      (a, b) => (getTotalValue(b) ?? 0) - (getTotalValue(a) ?? 0)
    );
  const visibleHoldings = sortedHoldings.slice(0, maxRows);
  const hasMoreHoldings = (holdings?.length ?? 0) > visibleHoldings.length;

  const goToSymbol = (symbol: string) => {
    router.push(`/dashboard/symbol/${encodeURIComponent(symbol)}`);
  };

  return (
    <Card
      className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_20px_56px_-40px_rgba(15,23,42,0.38)]"
      data-tour-id="tour-holdings-card"
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Largest positions
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white">
            <div className="hidden sm:block">
              <div className="grid grid-cols-[minmax(140px,1.2fr)_minmax(80px,0.6fr)_minmax(110px,0.8fr)] gap-2 bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                <span>Asset</span>
                <span className="text-right">Quantity</span>
                <span className="text-right">Total value</span>
              </div>
              {!visibleHoldings.length ? (
                <div className="px-5 py-6 text-center text-sm text-neutral-600">
                  No holdings yet. Connect an account to see your top positions.
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {visibleHoldings.map((holding, idx) => {
                    const totalValue = getTotalValue(holding);
                    return (
                      <button
                        key={holding.id ?? `${holding.symbol}-${idx}`}
                        type="button"
                        onClick={() => goToSymbol(holding.symbol)}
                        className="grid w-full grid-cols-[minmax(140px,1.2fr)_minmax(80px,0.6fr)_minmax(110px,0.8fr)] items-center gap-2 px-4 py-2.5 text-left transition hover:bg-neutral-50/80"
                      >
                        <div
                          className="min-w-0 break-words text-sm font-semibold leading-tight text-neutral-900"
                          title={holding.symbol}
                        >
                          {holding.symbol}
                        </div>
                        <div className="text-right text-sm text-neutral-800">
                          {fmtNumber(holding.quantity ?? 0)}
                        </div>
                        <div className="text-right text-sm font-semibold text-neutral-900">
                          {fmtCurrency(totalValue, currency)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sm:hidden">
              {!visibleHoldings.length ? (
                <div className="px-4 py-6 text-center text-sm text-neutral-600">
                  No holdings yet. Connect an account to see your top positions.
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {visibleHoldings.map((holding, idx) => {
                    const totalValue = getTotalValue(holding);
                    return (
                      <button
                        key={holding.id ?? `${holding.symbol}-${idx}`}
                        type="button"
                        onClick={() => goToSymbol(holding.symbol)}
                        className="w-full px-4 py-3 text-left transition hover:bg-neutral-50/80"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div
                              className="break-words text-sm font-semibold leading-tight text-neutral-900"
                              title={holding.symbol}
                            >
                              {holding.symbol}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-neutral-900">
                              {fmtCurrency(totalValue, currency)}
                            </div>
                            <div className="text-xs text-neutral-500">Value</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                          <span>Quantity</span>
                          <span className="text-neutral-800">
                            {fmtNumber(holding.quantity ?? 0)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      {!loading && hasMoreHoldings ? (
        <CardFooter className="justify-end border-t border-neutral-200/70 px-6 pb-5 pt-3">
          <Link
            href="/holdings"
            className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 transition hover:text-neutral-900"
          >
            View all holdings <ArrowRight className="h-4 w-4" />
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
