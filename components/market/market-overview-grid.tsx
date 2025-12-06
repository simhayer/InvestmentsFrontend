"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
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
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : (pct ?? 0) < 0
    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
    : "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200";

const toSeries = (arr: number[]) => arr.map((y, i) => ({ i, y }));

// ---------------------------
// Skeletons
// ---------------------------
function SparklineSkeleton() {
  return (
    <div className="h-28 sm:h-32 w-full rounded-xl overflow-hidden relative">
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
    <div className="rounded-3xl border border-neutral-200/70 bg-white/90 p-5 sm:p-6 shadow-[0_18px_42px_-26px_rgba(15,23,42,0.35)] min-h-[246px] sm:min-h-[260px] flex flex-col gap-3">
      <div className="flex justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-5 w-20 rounded-full bg-muted animate-pulse inline-block" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <SparklineSkeleton />
      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
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
  const chartHeight = compact ? "h-28 sm:h-32" : "h-32 sm:h-36";
  const headerPadding = compact ? "px-6 pt-6 pb-4" : "px-7 pt-7 pb-4";
  const bodyPadding = compact ? "px-6 pb-6" : "px-7 pb-7";
  const gridColumns = compact
    ? "grid-cols-1 md:grid-cols-2"
    : "grid-cols-1 md:grid-cols-2";
  const cardMinHeight = compact
    ? "min-h-[240px] sm:min-h-[252px]"
    : "min-h-[248px] sm:min-h-[268px]";

  // Loading state
  if (isLoading) {
    return (
      <div
        className={[
          "grid gap-6 sm:gap-6 font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]",
          gridColumns,
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
      <div className="rounded-xl border p-4 text-sm text-rose-600 bg-rose-50/40 dark:bg-rose-950/20 font-['Futura_PT_Book',_Futura,_sans-serif]">
        Failed to load market overview: {error}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-muted-foreground shadow-sm font-['Futura_PT_Book',_Futura,_sans-serif]">
        No market data available right now.
      </div>
    );
  }

  return (
    <div
      className={[
        "grid gap-6 sm:gap-6 font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]",
        gridColumns,
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
            className={[
              "group relative flex h-full flex-col rounded-2xl cursor-pointer overflow-hidden",
              "border border-neutral-200 bg-white",
              "shadow-[0_20px_60px_-42px_rgba(15,23,42,0.45)]",
              "hover:-translate-y-1 hover:shadow-lg hover:border-neutral-300 transition-all duration-200",
              cardMinHeight,
            ].join(" ")}
            onClick={() => handleClick(it.symbol)}
          >
            <CardHeader className={headerPadding}>
              <div className="flex items-start justify-between gap-4 min-h-[90px]">
                <div className="space-y-2 min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                    {it.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-900 truncate">
                      {typeof it.price !== "number"
                        ? "—"
                        : it.currency
                        ? fmtCurrency(it.price, it.currency)
                        : fmtNumber(it.price)}
                    </h3>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600 ring-1 ring-neutral-200">
                      {it.symbol}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Last price •{" "}
                    {typeof it.price === "number"
                      ? "Today"
                      : "Awaiting data"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 self-start shrink-0 text-right">
                  <div
                    className={[
                      "items-center gap-1.5 px-3 py-1.5 rounded-full text-xs inline-flex max-w-[160px]",
                      badgeColor(it.changePct),
                    ].join(" ")}
                  >
                    {typeof it.changePct === "number" && it.changePct > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : typeof it.changePct === "number" && it.changePct < 0 ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : null}
                    <span className="truncate font-medium">
                      {typeof it.changePct !== "number"
                        ? "—"
                        : `${it.changePct > 0 ? "+" : ""}${it.changePct.toFixed(
                            2
                          )}%`}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">
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
              className={[
                bodyPadding,
                "pt-1 flex flex-col gap-4 flex-1",
              ].join(" ")}
            >
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <span className="h-2 w-2 rounded-full bg-neutral-300" />
                  Intraday sparkline
                </div>
                <div className="text-xs text-neutral-500">
                  Click to open details
                </div>
              </div>
              <div
                className={[
                  "w-full cursor-pointer rounded-xl bg-gradient-to-b from-white via-neutral-50 to-neutral-100",
                  "group-hover:from-neutral-50 group-hover:to-neutral-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
                  chartHeight,
                  "[&_svg]:cursor-pointer",
                ].join(" ")}
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
              <div className="mt-auto pt-2 flex items-center justify-between text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-800">
                  View details
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-neutral-500">Tap chart or card</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
