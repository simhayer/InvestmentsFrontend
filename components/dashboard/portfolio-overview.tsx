"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import type { Investment } from "@/types/investment";
import { formatCurrency, formatPct } from "@/utils/format";

type PortfolioOverviewProps = { investments: Investment[]; currency?: string };

export function PortfolioOverview({
  investments,
  currency = "USD",
}: PortfolioOverviewProps) {
  const stats = useMemo(() => {
    if (!investments?.length) {
      return {
        totalValue: 0,
        totalCost: 0,
        gain: 0,
        pct: 0,
        top: null as Investment | null,
        worst: null as Investment | null,
      };
    }

    let totalValue = 0,
      totalCost = 0;
    let top: Investment | null = null,
      worst: Investment | null = null;
    let best = -Infinity,
      worstv = Infinity;

    for (const inv of investments) {
      const value = inv.quantity * inv.currentPrice;
      const cost = inv.quantity * inv.purchasePrice;
      const perf = cost > 0 ? ((value - cost) / cost) * 100 : 0;

      totalValue += value;
      totalCost += cost;

      if (perf > best) {
        best = perf;
        top = inv;
      }
      if (perf < worstv) {
        worstv = perf;
        worst = inv;
      }
    }

    const gain = totalValue - totalCost;
    const pct = totalCost > 0 ? (gain / totalCost) * 100 : 0;

    return { totalValue, totalCost, gain, pct, top, worst };
  }, [investments]);

  const pos = stats.gain >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalValue, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            Cost basis: {formatCurrency(stats.totalCost, currency)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          {pos ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              pos ? "text-green-600" : "text-red-600"
            }`}
          >
            {pos ? "+" : ""}
            {formatCurrency(stats.gain, currency)}
          </div>
          <p className={`text-xs ${pos ? "text-green-600" : "text-red-600"}`}>
            {pos ? "+" : ""}
            {formatPct(stats.pct)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {stats.top ? (
            <>
              <div className="text-2xl font-bold">{stats.top.symbol}</div>
              <p className="text-xs text-green-600">
                +
                {formatPct(
                  ((stats.top.currentPrice - stats.top.purchasePrice) /
                    stats.top.purchasePrice) *
                    100
                )}
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No investments</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Investments
          </CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{investments.length}</div>
          <p className="text-xs text-muted-foreground">
            {
              // normalize types first (see grouping below)
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
