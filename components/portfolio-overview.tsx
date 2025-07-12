"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import type { Investment } from "@/types/investment";

interface PortfolioOverviewProps {
  investments: Investment[];
}

export function PortfolioOverview({ investments }: PortfolioOverviewProps) {
  const calculatePortfolioStats = () => {
    if (investments.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalPercentage: 0,
        topPerformer: null,
        worstPerformer: null,
      };
    }

    let totalValue = 0;
    let totalCost = 0;
    let bestPerformance = Number.NEGATIVE_INFINITY;
    let worstPerformance = Number.POSITIVE_INFINITY;
    let topPerformer = null;
    let worstPerformer = null;

    investments.forEach((investment: Investment) => {
      const value = investment.quantity * investment.currentPrice;
      const cost = investment.quantity * investment.purchasePrice;
      const performance = ((value - cost) / cost) * 100;

      totalValue += value;
      totalCost += cost;

      if (performance > bestPerformance) {
        bestPerformance = performance;
        topPerformer = investment;
      }

      if (performance < worstPerformance) {
        worstPerformance = performance;
        worstPerformer = investment;
      }
    });

    const totalGainLoss = totalValue - totalCost;
    const totalPercentage =
      totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalPercentage,
      topPerformer,
      worstPerformer,
    };
  };

  const stats = calculatePortfolioStats();
  const isPositive = stats.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalValue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Cost basis: ${stats.totalCost.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}${stats.totalGainLoss.toFixed(2)}
          </div>
          <p
            className={`text-xs ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {stats.totalPercentage.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {stats.topPerformer ? (
            <>
              <div className="text-2xl font-bold">
                {stats.topPerformer.symbol}
              </div>
              <p className="text-xs text-green-600">
                +
                {(
                  ((stats.topPerformer.currentPrice -
                    stats.topPerformer.purchasePrice) /
                    stats.topPerformer.purchasePrice) *
                  100
                ).toFixed(2)}
                %
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No investments</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Investments
          </CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{investments.length}</div>
          <p className="text-xs text-muted-foreground">
            {investments.filter((inv) => inv.type === "stock").length} stocks,{" "}
            {investments.filter((inv) => inv.type === "crypto").length} crypto
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
