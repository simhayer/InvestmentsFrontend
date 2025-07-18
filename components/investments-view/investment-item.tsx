"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { Investment } from "@/types/investment";

interface InvestmentItemProps {
  investment: Investment;
  onDelete: (id: string) => void;
}

export function InvestmentItem({ investment, onDelete }: InvestmentItemProps) {
  const getTypeColor = (type: Investment["type"]) => {
    switch (type) {
      case "stock":
        return "bg-blue-100 text-blue-800";
      case "crypto":
        return "bg-orange-100 text-orange-800";
      case "etf":
        return "bg-green-100 text-green-800";
      case "bond":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateGainLoss = (investment: Investment) => {
    const totalValue = investment.quantity * investment.currentPrice;
    const totalCost = investment.quantity * investment.avg_price;
    const gainLoss = totalValue - totalCost;
    const percentage = (gainLoss / totalCost) * 100;
    return { gainLoss, percentage };
  };

  const { gainLoss, percentage } = calculateGainLoss(investment);
  const isPositive = gainLoss >= 0;

  if (!investment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Investment Not Found
            </h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div
        key={investment.id}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{investment.symbol}</h3>
              <p className="text-sm text-gray-500">{investment.name}</p>
            </div>
            <Badge className={getTypeColor(investment.type)}>
              {investment.type.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{investment.quantity}</p>
            </div>
            <div>
              <p className="text-gray-500">Purchase Price</p>
              <p className="font-medium">${investment.avg_price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Current Price</p>
              <p className="font-medium">
                $
                {investment.currentPrice
                  ? investment.currentPrice.toFixed(2)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total Value</p>
              <p className="font-medium">
                ${(investment.quantity * investment.currentPrice).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </Card>
  );
}
