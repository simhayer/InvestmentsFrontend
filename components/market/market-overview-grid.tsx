"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMarketOverview } from "@/hooks/use-market-overview";
import type { MarketIndexKey, MarketIndexItem } from "@/types/market-overview";
import { useEffect } from "react";
import { fmtCurrency, fmtNumber } from "@/utils/format";

export type MarketOverviewGridProps = {
  className?: string;
  compact?: boolean; // slightly tighter padding
  items: MarketIndexItem[];
};

const badgeColor = (pct: number) =>
  pct > 0
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/40"
    : pct < 0
    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/40"
    : "bg-muted text-muted-foreground";

// Convert array of numbers to Recharts-friendly data
const toSeries = (arr: number[]) => arr.map((y, i) => ({ i, y }));

// ============================
// Component
// ============================
export default function MarketOverviewGrid({
  items,
  className,
  compact,
}: MarketOverviewGridProps) {
  return (
    <div
      className={[
        "grid gap-2 sm:gap-3",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className ?? "",
      ].join(" ")}
    >
      {items.map((it) => (
        <motion.div
          key={it.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className={[compact ? "p-2" : "p-3", "pb-0"].join(" ")}>
              <div className="flex align-center justify-between">
                <div>
                  <h3 className="text-medium font-medium tracking-tight">
                    {it.label}
                  </h3>
                  <div className="text-xs text-muted-foreground leading-none">
                    {it.symbol}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={[
                      "mt-1 items-center gap-1 px-2 py-0.5 rounded-full text-xs inline-flex",
                      badgeColor(it.changePct),
                    ].join(" ")}
                  >
                    {it.changePct > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : it.changePct < 0 ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : null}
                    <span>
                      {it.changePct === 0
                        ? "0.00%"
                        : `${it.changePct > 0 ? "+" : ""}${it.changePct.toFixed(
                            2
                          )}%`}
                    </span>
                  </div>
                  <span className="opacity-70 text-xs mt-0.5 flex items-center gap-1">
                    {`${it.changeAbs > 0 ? "+" : ""}${
                      it.currency
                        ? fmtCurrency(Math.abs(it.changeAbs), it.currency)
                        : fmtNumber(Math.abs(it.changeAbs))
                    }`}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className={"p-2  py-0"}>
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={toSeries(it.sparkline)}
                    margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
                  >
                    <YAxis domain={["auto", "auto"]} hide />
                    <Tooltip
                      cursor={{ strokeOpacity: 0.1 }}
                      formatter={(value: number) => [
                        fmtNumber(value),
                        it.label,
                      ]}
                      labelFormatter={() => ""}
                      contentStyle={{ borderRadius: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="y"
                      dot={false}
                      strokeWidth={2}
                      className={
                        it.changePct >= 0
                          ? "stroke-emerald-500"
                          : "stroke-rose-500"
                      }
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <div className="text-l font-semibold p-2">
              {it.currency
                ? fmtCurrency(it.price, it.currency)
                : fmtNumber(it.price)}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
