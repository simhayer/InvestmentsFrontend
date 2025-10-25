"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fmtCurrency, fmtNumber } from "@/utils/format";
import * as React from "react";

export type MarketIndexItem = {
  key: string;
  label: string;
  symbol: string;
  price: number | null;
  changeAbs: number | null;
  changePct: number | null;
  currency: string;
  sparkline: number[];
};

export type MarketOverviewGridProps = {
  className?: string;
  compact?: boolean;
  items?: MarketIndexItem[];
  isLoading?: boolean; // <— NEW
  error?: string | null; // <— NEW
  onItemClick?: (symbol: string) => void; // optional override
};

const badgeColor = (pct: number | null | undefined) =>
  (pct ?? 0) > 0
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/40"
    : (pct ?? 0) < 0
    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/40"
    : "bg-muted text-muted-foreground";

const toSeries = (arr: number[]) => arr.map((y, i) => ({ i, y }));

// ---------------------------
// Skeletons
// ---------------------------
function SparklineSkeleton() {
  return (
    <div className="h-20 w-full rounded-md overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/60 to-transparent animate-[shimmer_1.5s_infinite] [background-size:200%_100%]" />
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm">
      <div className="flex justify-between">
        <div className="space-y-1">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-5 w-20 rounded-full bg-muted animate-pulse inline-block" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="mt-2">
        <SparklineSkeleton />
      </div>
      <div className="mt-2 h-4 w-24 rounded bg-muted animate-pulse" />
    </div>
  );
}

// ---------------------------
// Component
// ---------------------------
export default function MarketOverviewGrid({
  items,
  className,
  compact,
  isLoading,
  error,
  onItemClick,
}: MarketOverviewGridProps) {
  const router = useRouter();
  const handleClick = (symbol: string) =>
    onItemClick ? onItemClick(symbol) : router.push(`/investment/${symbol}`);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={[
          "grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          className ?? "",
        ].join(" ")}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error / empty
  if (error) {
    return (
      <div className="rounded-xl border p-4 text-sm text-rose-600 bg-rose-50/40 dark:bg-rose-950/20">
        Failed to load market overview: {error}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border p-4 text-sm text-muted-foreground">
        No market data available right now.
      </div>
    );
  }

  return (
    <div
      className={[
        "grid gap-3 sm:gap-4",
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
          <Card
            className="group rounded-2xl cursor-pointer shadow-sm ring-1 ring-transparent hover:shadow-lg hover:ring-foreground/10 transition-all duration-200 will-change-transform mt-5"
            // Card-level click (keyboard handled on inner button region)
            onClick={() => handleClick(it.symbol)}
          >
            <CardHeader className={[compact ? "p-2" : "p-3", "pb-0"].join(" ")}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium tracking-tight">
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
                    {typeof it.changePct === "number" && it.changePct > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : typeof it.changePct === "number" && it.changePct < 0 ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : null}
                    <span>
                      {typeof it.changePct !== "number"
                        ? "—"
                        : `${it.changePct > 0 ? "+" : ""}${it.changePct.toFixed(
                            2
                          )}%`}
                    </span>
                  </div>
                  <span className="opacity-70 text-xs mt-0.5 flex items-center gap-1">
                    {typeof it.changeAbs !== "number"
                      ? "—"
                      : `${it.changeAbs > 0 ? "+" : ""}${
                          it.currency
                            ? fmtCurrency(Math.abs(it.changeAbs), it.currency)
                            : fmtNumber(Math.abs(it.changeAbs))
                        }`}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent
              className={["pt-2", compact ? "px-2 pb-2" : "px-3 pb-3"].join(
                " "
              )}
            >
              {/* Clickable sparkline region with proper cursor inside SVG */}
              <div
                className="h-20 w-full cursor-pointer rounded-md from-transparent to-muted/20 group-hover:to-muted/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Open ${it.symbol}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(it.symbol);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick(it.symbol);
                  }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={toSeries(it.sparkline || [])}
                    margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
                    onClick={() => handleClick(it.symbol)}
                    style={{ cursor: "pointer" }}
                  >
                    <YAxis domain={["auto", "auto"]} hide />
                    <Line
                      type="monotone"
                      dataKey="y"
                      dot={false}
                      strokeWidth={2}
                      className={
                        it.changePct !== null && (it.changePct ?? 0) >= 0
                          ? "stroke-emerald-500"
                          : "stroke-rose-500"
                      }
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Price */}
              <div className="mt-2 text-base font-semibold">
                {typeof it.price !== "number"
                  ? "—"
                  : it.currency
                  ? fmtCurrency(it.price, it.currency)
                  : fmtNumber(it.price)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
