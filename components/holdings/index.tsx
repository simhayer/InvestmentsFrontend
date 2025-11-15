"use client";

import { useHolding } from "@/hooks/use-holdings";
import { Skeleton } from "../ui/skeleton";
import type { Holding } from "@/types/holding";

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

export function Holdings() {
  const { holdings, loading } = useHolding() as {
    holdings: Holding[];
    loading: boolean;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-medium my-6">Holdings</h1>

      {loading ? (
        <Skeleton className="h-80 w-full rounded-md" />
      ) : (
        <ul className="rounded-xl border divide-y">
          {/* Header */}
          <li className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/50 sticky top-0 z-10">
            <span>Asset</span>
            <span className="text-right hidden md:block">Quantity</span>
            <span className="text-right hidden md:block">Total Value</span>
            <span className="text-right hidden lg:block">Current Price</span>
            <span className="text-right hidden lg:block">Avg Unit Cost</span>
            <span className="text-right">P/L %</span>
          </li>

          {holdings.map((h) => {
            const color =
              h.unrealizedPlPct == null
                ? "text-muted-foreground"
                : h.unrealizedPlPct > 0
                ? "text-green-500"
                : h.unrealizedPlPct < 0
                ? "text-red-500"
                : "text-muted-foreground";

            return (
              <li
                key={h.externalId}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center p-4"
              >
                {/* Asset */}
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold truncate">{h.symbol}</h2>
                  <p className="text-xs text-muted-foreground truncate">
                    {h.name}
                  </p>
                </div>

                {/* Quantity */}
                <div className="text-sm text-right hidden md:block">
                  {fmtNumber(h.quantity)}
                </div>

                {/* Total Value */}
                <div className="text-sm text-right hidden md:block">
                  {fmtCurrency(h.currentValue)}
                </div>

                {/* Current Price */}
                <div className="text-sm text-right hidden lg:block">
                  {fmtCurrency(h.currentPrice)}
                </div>

                {/* Avg Unit Cost */}
                <div className="text-sm text-right hidden lg:block">
                  {fmtCurrency(h.purchaseUnitPrice)}
                </div>

                {/* P/L % (totals-based from server) */}
                <div className={`text-sm text-right font-medium ${color}`}>
                  {h.unrealizedPlPct == null
                    ? "—"
                    : `${h.unrealizedPlPct.toFixed(2)}%`}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
