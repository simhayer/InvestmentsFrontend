"use client";

import { useHolding } from "@/hooks/use-holdings";
import { User } from "@/types/user";

interface Props {
  user: User;
}

export function Holdings({ user }: Props) {
  const { holdings, loading } = useHolding();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-medium my-6">Holdings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="rounded-xl border divide-y">
          {/* Header */}
          <li className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-center px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/50 sticky top-0 z-10">
            <span>Asset</span>
            <span className="text-right hidden md:block">Quantity</span>
            <span className="text-right">Total Value</span>
            <span className="text-right hidden lg:block">Current Price</span>
            <span className="text-right hidden lg:block">Price %</span>
          </li>

          {holdings.map((holding) => (
            <li
              key={holding.id}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-center p-4"
            >
              {/* Asset (always visible) */}
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate">
                  {holding.symbol}
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {holding.name}
                </p>
              </div>

              {/* Quantity (hidden on small) */}
              <div className="text-sm text-right hidden md:block">
                {holding.quantity}
              </div>

              {/* Total value (only on lg+) */}
              <div className="text-sm text-right hidden lg:block">
                {(holding.currentPrice * holding.quantity).toLocaleString(
                  undefined,
                  {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  }
                )}
              </div>

              {/* Current Price hidden lg:block */}
              <div className="text-sm text-right hidden lg:block">
                {holding.currentPrice.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                })}
              </div>

              {/* Price Change % */}
              <div
                className={`text-sm text-right block font-medium ${
                  holding.currentPrice > holding.purchasePrice
                    ? "text-green-500"
                    : holding.currentPrice < holding.purchasePrice
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {(
                  ((holding.currentPrice - holding.purchasePrice) /
                    holding.purchasePrice) *
                  100
                ).toFixed(2)}
                %
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
