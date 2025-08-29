// components/investments-view/InvestmentItem.tsx
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { Investment } from "@/types/investment";
import { useAiInsight } from "@/hooks/use-ai-insight";
import { AIPanel } from "@/components/ai/AIPanel";

const getTypeColor = (type: Investment["type"]) => {
  switch (type) {
    case "stock":
      return "bg-blue-100 text-blue-800";
    case "cryptocurrency":
      return "bg-orange-100 text-orange-800";
    case "etf":
      return "bg-green-100 text-green-800";
    case "bond":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const safeNumber = (n: unknown, fallback = 0) =>
  typeof n === "number" && Number.isFinite(n) ? n : fallback;

const usePnl = (inv: Investment) => {
  const qty = safeNumber(inv.quantity);
  const current = safeNumber(inv.currentPrice);
  const avg = safeNumber(inv.avgPrice);
  const totalValue = qty * current;
  const totalCost = qty * avg;
  const gainLoss = totalValue - totalCost;
  const percentage = totalCost ? (gainLoss / totalCost) * 100 : 0;
  return { gainLoss, percentage, totalValue };
};

export function InvestmentItem({
  investment,
  onDelete,
}: {
  investment: Investment;
  onDelete: (id: string) => void;
}) {
  const { gainLoss, percentage, totalValue } = usePnl(investment);
  const isPositive = gainLoss >= 0;

  const { loading, error, news, holdingAnalysis, fetch } =
    useAiInsight(investment);

  const institutionName = useMemo(
    () => investment.institution || "N/A",
    [investment.institution]
  );

  return (
    <Card>
      <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{investment.symbol}</h3>
              <p className="text-sm text-gray-500">{investment.name}</p>
            </div>
            <Badge className={getTypeColor(investment.type)}>
              {investment.type.toUpperCase()}
            </Badge>
          </div>

          {/* Facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{safeNumber(investment.quantity)}</p>
            </div>
            <div>
              <p className="text-gray-500">Purchase Price</p>
              <p className="font-medium">
                ${safeNumber(investment.avgPrice).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Current Price</p>
              <p className="font-medium">
                ${safeNumber(investment.currentPrice).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total Value</p>
              <p className="font-medium">${totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Institution</p>
              <p className="font-medium">{institutionName}</p>
            </div>
          </div>

          {/* AI Panel (News + Forward View) */}
          {error && (
            <div className="mt-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded text-sm">
              {error}
            </div>
          )}
          {holdingAnalysis && (
            <AIPanel
              symbol={investment.symbol}
              name={investment.name}
              holdingAnalysis={holdingAnalysis}
            />
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 pl-4">
          <div className="text-right">
            <div
              className={`flex items-center gap-1 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isPositive ? "+" : ""}${gainLoss.toFixed(2)}
              </span>
            </div>
            <div
              className={`text-sm ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {percentage.toFixed(2)}%
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(investment.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetch}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "AI Insight"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
