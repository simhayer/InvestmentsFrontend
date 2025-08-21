"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Investment } from "@/types/investment";
import { InvestmentItem } from "./investment-item";
import { formatCurrency } from "@/utils/format";

type GroupKey = "stock" | "etf" | "crypto" | "other";

function normalizeType(t?: string): GroupKey {
  const s = (t || "").toLowerCase();
  if (s === "stock" || s === "equity" || s === "share") return "stock";
  if (s === "etf" || s === "fund") return "etf";
  if (s === "crypto" || s === "cryptocurrency") return "crypto";
  return "other";
}

export function InvestmentList({
  investments,
  onDelete,
}: {
  investments: Investment[];
  onDelete: (id: string) => void;
}) {
  const [sortBy, setSortBy] = useState<"value" | "alpha">("value");

  const groups = useMemo(() => {
    const g: Record<GroupKey, Investment[]> = {
      stock: [],
      etf: [],
      crypto: [],
      other: [],
    };
    for (const inv of investments) g[normalizeType(inv.type)].push(inv);
    const sortAlpha = (a: Investment, b: Investment) =>
      a.symbol.localeCompare(b.symbol);
    const sortValue = (a: Investment, b: Investment) =>
      b.quantity * b.currentPrice - a.quantity * a.currentPrice;
    (Object.keys(g) as GroupKey[]).forEach((k) =>
      g[k].sort(sortBy === "value" ? sortValue : sortAlpha)
    );
    return g;
  }, [investments, sortBy]);

  const order: GroupKey[] = ["stock", "etf", "crypto", "other"];
  const empty = !investments?.length;

  if (empty) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No investments yet
            </h3>
            <p className="text-sm text-gray-500">
              Add your first investment to start tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Your Investments</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort
          </label>
          <select
            id="sort"
            className="border rounded-md p-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="value">Sort by value</option>
            <option value="alpha">Sort A–Z</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {order.map((key) => {
          const list = groups[key];
          if (!list.length) return null;

          const totalValue = list.reduce(
            (sum, inv) => sum + inv.quantity * inv.currentPrice,
            0
          );
          const label =
            key === "stock"
              ? "Stocks"
              : key === "etf"
              ? "ETFs"
              : key === "crypto"
              ? "Cryptocurrency"
              : "Other";

          return (
            <section key={key} aria-label={label}>
              <div className="mb-2 flex justify-between items-center">
                <h3 className="text-md font-semibold capitalize text-gray-700">
                  {label}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({list.length})
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Total value: {formatCurrency(totalValue)}
                </p>
              </div>
              <div className="space-y-4">
                {list.map((inv) => (
                  <InvestmentItem
                    key={inv.id}
                    investment={inv}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
