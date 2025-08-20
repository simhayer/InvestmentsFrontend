"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Investment } from "@/types/investment";
import { InvestmentItem } from "./investment-item";

interface InvestmentListProps {
  investments: Investment[];
  onDelete: (id: string) => void;
}

type GroupedInvestments = {
  [category: string]: Investment[];
};

export function groupInvestmentsByCategory(
  investments: Investment[]
): GroupedInvestments {
  const groups: GroupedInvestments = {
    stocks: [],
    crypto: [],
    other: [],
  };

  for (const inv of investments) {
    const type = inv.type?.toLowerCase();

    if (type === "equity" || type === "etf") {
      groups.stocks.push(inv);
    } else if (type === "cryptocurrency") {
      groups.crypto.push(inv);
    } else {
      groups.other.push(inv);
    }
  }

  return groups;
}

export function InvestmentList({ investments, onDelete }: InvestmentListProps) {
  const grouped = groupInvestmentsByCategory(investments);

  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No investments yet
            </h3>
            <p className="text-sm text-gray-500">
              Add your first investment to get started tracking your portfolio.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Investments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(grouped).map(([type, list]) => {
          const totalGroupValue = list.reduce(
            (sum, inv) => sum + inv.quantity * inv.currentPrice,
            0
          );

          if (list.length === 0) return null;

          return (
            <div key={type}>
              <div className="mb-2 flex justify-between items-center">
                <h3 className="text-md font-semibold capitalize text-gray-700">
                  {type === "etf"
                    ? "ETFs"
                    : type === "crypto"
                    ? "Cryptocurrency"
                    : type}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Total value: ${totalGroupValue.toFixed(2)}
                </p>
              </div>
              <div className="space-y-4">
                {list.map((investment) => {
                  return (
                    <InvestmentItem
                      key={investment.id}
                      investment={investment}
                      onDelete={onDelete}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
