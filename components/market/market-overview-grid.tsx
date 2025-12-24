"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fmtCurrency, fmtNumber } from "@/utils/format";
import * as React from "react";
import { cn } from "@/lib/utils";

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
  variant?: "grid" | "strip";
  items?: MarketIndexItem[];
  isLoading?: boolean;
  error?: string | null;
  onItemClick?: (symbol: string) => void;
};

const badgeColor = (pct: number | null | undefined) =>
  (pct ?? 0) > 0
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : (pct ?? 0) < 0
    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
    : "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200";

const deltaTone = (pct: number | null | undefined) => {
  if (pct == null) return "text-neutral-500";
  if (pct > 0) return "text-emerald-600";
  if (pct < 0) return "text-rose-600";
  return "text-neutral-600";
};

const sparklineStroke = (pct: number | null | undefined) => {
  if (pct == null) return "#94a3b8";
  if (pct > 0) return "#10b981";
  if (pct < 0) return "#f43f5e";
  return "#94a3b8";
};

const toSeries = (arr: number[]) => arr.map((y, i) => ({ i, y }));

function Sparkline({
  data,
  pct,
  compact,
  heightClass,
  surface = "default",
}: {
  data: number[];
  pct: number | null | undefined;
  compact?: boolean;
  heightClass?: string;
  surface?: "default" | "none";
}) {
  const stroke = sparklineStroke(pct);
  const resolvedHeight = heightClass ?? (compact ? "h-10" : "h-32 sm:h-36");
  const containerClass =
    surface === "none"
      ? ""
      : compact
      ? "rounded-lg bg-neutral-50/80"
      : "rounded-xl bg-gradient-to-b from-white via-neutral-50 to-neutral-100";

  return (
    <div className={cn("w-full", resolvedHeight, containerClass)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={toSeries(data || [])}
          margin={{ top: compact ? 6 : 8, right: 0, left: 0, bottom: 0 }}
        >
          <YAxis domain={["auto", "auto"]} hide />
          <Line
            type="monotone"
            dataKey="y"
            dot={false}
            strokeWidth={compact ? 1.5 : 2}
            stroke={stroke}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

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

function StripTileSkeleton() {
  return (
    <div className="min-w-[220px] rounded-2xl border border-neutral-200/70 bg-white px-4 py-3 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] flex flex-col gap-3">
      <div className="h-3 w-32 rounded-full bg-muted animate-pulse" />
      <div className="h-5 w-36 rounded-full bg-muted animate-pulse" />
      <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
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
  variant = "grid",
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

  if (isLoading) {
    if (variant === "strip") {
      return (
        <div
          className={[
            "flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4",
            className ?? "",
          ].join(" ")}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <StripTileSkeleton key={i} />
          ))}
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
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

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

  if (variant === "strip") {
    return (
      <div
        className={[
          "flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4 font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]",
          className ?? "",
        ].join(" ")}
      >
        {items.map((it) => {
          const price =
            typeof it.price !== "number"
              ? "—"
              : it.currency
              ? fmtCurrency(it.price, it.currency)
              : fmtNumber(it.price);
          const changeAbs =
            typeof it.changeAbs !== "number"
              ? null
              : it.currency
              ? fmtCurrency(Math.abs(it.changeAbs), it.currency)
              : fmtNumber(Math.abs(it.changeAbs));
          const changeAbsText =
            changeAbs == null
              ? null
              : `${it.changeAbs >= 0 ? "+" : "-"}${changeAbs}`;
          const changePctText =
            typeof it.changePct === "number"
              ? `${it.changePct >= 0 ? "+" : ""}${it.changePct.toFixed(2)}%`
              : null;
          const changeText =
            changePctText && changeAbsText
              ? `${changePctText} / ${changeAbsText}`
              : "—";

          return (
            <motion.button
              key={it.key}
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="group min-w-[220px] text-left rounded-2xl border border-neutral-200/80 bg-white px-4 py-3 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_-30px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
              onClick={() => handleClick(it.symbol)}
              aria-label={`Open ${it.label}`}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500 truncate">
                  {it.label} - {it.symbol}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-base font-semibold text-neutral-900">
                  {price}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold whitespace-nowrap",
                    deltaTone(it.changePct)
                  )}
                >
                  {changeText}
                </span>
              </div>
              <div className="mt-3">
                <Sparkline
                  data={it.sparkline || []}
                  pct={it.changePct}
                  compact
                />
              </div>
            </motion.button>
          );
        })}
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
                <Sparkline
                  data={it.sparkline || []}
                  pct={it.changePct}
                  heightClass="h-full"
                  surface="none"
                />
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
