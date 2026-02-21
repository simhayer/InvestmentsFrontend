"use client";

import type { Holding } from "@/types/holding";
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
import SymbolLogo from "@/components/layout/SymbolLogo";

interface Props {
  holdings: Holding[];
  loading: boolean;
  currency?: string;
  variant?: "card" | "bare";
  title?: string;
  maxRows?: number;
}

export function TopHoldings({
  holdings,
  loading,
  currency = "USD",
  variant = "card",
  title = "Largest Positions",
  maxRows = 4,
}: Props) {
  const router = useRouter();

  // Broker-only: cost = purchase_price * quantity (no current price / P/L)
  const getTotalCost = (holding: Holding) => {
    const qty = Number(holding.quantity);
    const price = Number(holding.purchaseUnitPrice ?? holding.purchasePrice ?? 0);
    if (!Number.isFinite(qty) || !Number.isFinite(price)) return null;
    return qty * price;
  };

  const sortedHoldings = (holdings ?? [])
    .slice()
    .sort((a, b) => (getTotalCost(b) ?? 0) - (getTotalCost(a) ?? 0));

  const visibleHoldings = sortedHoldings.slice(0, maxRows);
  const hasMoreHoldings = (holdings?.length ?? 0) > visibleHoldings.length;

  const goToSymbol = (h: Holding) => {
    const isCrypto = h.type === "cryptocurrency";
    const params = new URLSearchParams();
    params.set("type", isCrypto ? "crypto" : "stock");

    router.push(
      `/dashboard/symbol/${encodeURIComponent(h.symbol)}?${params.toString()}`
    );
  };

  const TableContent = (
    <div className="space-y-1">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_100px] gap-2 px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        <span>Asset</span>
        <span className="text-right">Cost</span>
      </div>

      {!visibleHoldings.length ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 py-8 text-center text-sm text-neutral-500">
          No positions found.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
          {visibleHoldings.map((holding, idx) => {
            const totalCost = getTotalCost(holding);
            const displayCurrency = holding.currency ?? currency;

            return (
              <button
                key={holding.id ?? `${holding.symbol}-${idx}`}
                type="button"
                onClick={() => goToSymbol(holding)}
                className="grid w-full grid-cols-[auto_1fr_100px] items-center gap-3 px-3 py-3 text-left transition hover:bg-neutral-50"
              >
                {/* Logo */}
                <SymbolLogo
                  symbol={holding.symbol}
                  isCrypto={holding.type === "cryptocurrency"}
                  className="h-8 w-8 rounded-lg"
                />

                {/* Asset info */}
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-neutral-900">
                    {holding.symbol}
                  </div>
                  <div className="truncate text-[11px] text-neutral-500">
                    {holding.name || "Asset"}
                  </div>
                </div>

                {/* Cost (broker purchase_price * quantity) */}
                <div className="text-right text-sm font-semibold text-neutral-900">
                  {fmtCurrency(totalCost, displayCurrency)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
  // Layout for when used as a standalone card
  if (variant === "card") {
    return (
      <Card className="rounded-3xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              {title}
            </CardTitle>
            {hasMoreHoldings && (
              <Link
                href="/holdings"
                className="text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                View All
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : (
            TableContent
          )}
        </CardContent>
      </Card>
    );
  }

  // Layout for "bare" variant (usually inside a shared sidebar container)
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-bold text-neutral-900">{title}</span>
        {hasMoreHoldings && (
          <Link
            href="/holdings"
            className="text-xs text-neutral-500 hover:underline"
          >
            View All
          </Link>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : (
        TableContent
      )}
    </div>
  );
}
