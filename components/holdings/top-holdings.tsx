"use client";

import { Holding } from "@/types/holding";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  holdings: Holding[];
  loading: boolean;
  currency?: string;
}

export function TopHoldings({
  holdings,
  loading,
  currency = "USD",
}: Props) {
  const router = useRouter();
  const onHoldingsClick = () => {
    router.replace("/holdings");
  };
  const goToSymbol = (symbol: string) => {
    router.push(`/dashboard/symbol/${encodeURIComponent(symbol)}`);
  };

  return (
    <Card className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_20px_56px_-40px_rgba(15,23,42,0.38)]">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
              Top holdings
            </p>
            <CardTitle className="text-xl font-semibold text-neutral-900">
              Largest positions
            </CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Quick read on value, price, and move for your biggest holdings.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            onClick={onHoldingsClick}
          >
            Holdings overview <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200/70">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]">
                      Asset
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em]">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em]">
                      Total Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em]">
                      Current Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em]">
                      Price %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {!holdings?.length ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-neutral-600"
                      >
                        No holdings yet. Connect an account to see your top
                        positions.
                      </td>
                    </tr>
                  ) : (
                    holdings.map((holding, idx) => {
                      const totalValue =
                        (holding.currentPrice ?? 0) * (holding.quantity ?? 0);
                      const pctChange =
                        holding.purchasePrice
                          ? ((holding.currentPrice - holding.purchasePrice) /
                              holding.purchasePrice) *
                            100
                          : 0;
                      const priceTone =
                        pctChange > 0
                          ? "text-emerald-600"
                          : pctChange < 0
                          ? "text-rose-600"
                          : "text-neutral-600";
                      return (
                        <tr
                          key={holding.id ?? `${holding.symbol}-${idx}`}
                          onClick={() => goToSymbol(holding.symbol)}
                          className="cursor-pointer transition hover:bg-neutral-50/80"
                        >
                          <td className="px-4 py-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-neutral-900">
                                {holding.symbol}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {holding.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-800">
                            {holding.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                            {totalValue.toLocaleString(undefined, {
                              style: "currency",
                              currency,
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-800">
                            {holding.currentPrice.toLocaleString(undefined, {
                              style: "currency",
                              currency,
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 text-right font-semibold",
                              priceTone
                            )}
                          >
                            {pctChange.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
