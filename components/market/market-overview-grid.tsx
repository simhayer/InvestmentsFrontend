"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { fmtCurrency, fmtNumber } from "@/utils/format";
import { cn } from "@/lib/utils";

// Types remains the same as your provided code...

const sparklineStroke = (pct: number | null) => {
  if (pct == null) return "#94a3b8";
  return pct > 0 ? "#10b981" : "#f43f5e";
};

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

export interface MarketOverviewGridProps {
  items?: MarketIndexItem[];
  isLoading?: boolean;
  error?: string | null;
  variant?: "grid" | "strip";
  theme?: "light" | "dark";
  className?: string;
  onItemClick?: (symbol: string) => void;
}

const cardStyles = {
  light: {
    card: "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/30 ring-1 ring-neutral-200/50",
    label: "text-neutral-500",
    symbol: "text-neutral-900",
    price: "text-neutral-900",
    skeletonCard: "border-neutral-100 bg-white",
    skeletonBg: "bg-neutral-100",
    skeletonBg2: "bg-neutral-200",
    chartBg: "bg-neutral-50",
    tooltip: "bg-white ring-black/5 text-neutral-900",
  },
  dark: {
    card: "border-neutral-700/80 bg-neutral-900 hover:border-neutral-600 hover:shadow-lg hover:shadow-black/20",
    label: "text-neutral-500",
    symbol: "text-neutral-100",
    price: "text-neutral-100",
    skeletonCard: "border-neutral-800 bg-neutral-900",
    skeletonBg: "bg-neutral-800",
    skeletonBg2: "bg-neutral-700",
    chartBg: "bg-neutral-800/80",
    tooltip: "bg-neutral-800 border-neutral-600 text-neutral-100",
  },
};

function GridSkeleton({ variant, theme = "light" }: { variant: "grid" | "strip"; theme?: "light" | "dark" }) {
  const skeletonCount = 4;
  const s = cardStyles[theme];
  const containerClasses = cn(
    "flex gap-4 overflow-x-auto pb-4 no-scrollbar",
    variant === "strip"
      ? "sm:grid sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2"
  );

  return (
    <div className={containerClasses}>
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div
          key={i}
          className={cn("min-w-[260px] rounded-[24px] border p-5 shadow-sm", s.skeletonCard)}
        >
          <div className="flex justify-between mb-6">
            <div className="space-y-2">
              <div className={cn("h-3 w-16 animate-pulse rounded", s.skeletonBg)} />
              <div className={cn("h-5 w-24 animate-pulse rounded", s.skeletonBg2)} />
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <div className={cn("h-4 w-20 animate-pulse rounded", s.skeletonBg)} />
              <div className={cn("h-3 w-12 animate-pulse rounded", s.skeletonBg)} />
            </div>
          </div>
          <div className={cn("relative h-16 w-full overflow-hidden rounded-xl", s.chartBg)}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketOverviewGrid({
  items,
  isLoading,
  variant = "grid",
  theme = "light",
  onItemClick,
}: MarketOverviewGridProps) {
  const router = useRouter();
  const s = cardStyles[theme];

  if (isLoading) return <GridSkeleton variant={variant} theme={theme} />;

  const handleClick = (symbol: string) => {
    if (onItemClick) onItemClick(symbol);
    else router.push(`/dashboard/symbol/${symbol}`);
  };

  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-4 no-scrollbar",
        variant === "strip"
          ? "sm:grid sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 md:grid-cols-2"
      )}
    >
      {items?.map((item, idx) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => handleClick(item.symbol)}
          className={cn("group relative min-w-[260px] cursor-pointer rounded-[24px] border p-5 shadow-sm transition-all", s.card)}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", s.label)}>
                {item.label}
              </p>
              <h4 className={cn("text-lg font-bold", s.symbol)}>
                {item.symbol}
              </h4>
            </div>
            <div className="text-right">
              <p className={cn("text-sm font-bold", s.price)}>
                {item.price ? fmtCurrency(item.price, item.currency) : "—"}
              </p>
              <BadgeDelta pct={item.changePct} theme={theme} />
            </div>
          </div>

          <div className="h-16 w-full opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={item.sparkline.map((y, i) => ({ i, y }))}>
                <defs>
                  <linearGradient
                    id={`gradient-${item.key}-${theme}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={sparklineStroke(item.changePct)}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={sparklineStroke(item.changePct)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={<CustomTooltip currency={item.currency} theme={theme} />}
                  cursor={{ stroke: theme === "dark" ? "#404040" : "#e5e5e5", strokeWidth: 1 }}
                />
                <YAxis domain={["auto", "auto"]} hide />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke={sparklineStroke(item.changePct)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 0,
                    fill: sparklineStroke(item.changePct),
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BadgeDelta({ pct, theme = "light" }: { pct: number | null; theme?: "light" | "dark" }) {
  if (pct === null) return null;
  const isPos = pct >= 0;
  const classes =
    theme === "dark"
      ? isPos
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-rose-500/20 text-rose-400"
      : isPos
        ? "bg-emerald-50 text-emerald-600"
        : "bg-rose-50 text-rose-600";
  return (
    <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md", classes)}>
      {isPos ? "↑" : "↓"} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

function CustomTooltip({ active, payload, currency, theme = "light" }: any) {
  if (active && payload && payload.length) {
    const s = cardStyles[theme as "light" | "dark"];
    return (
      <div className={cn("rounded-lg border border-neutral-600 px-2 py-1 shadow-xl", s.tooltip)}>
        <p className="text-[10px] font-bold">
          {fmtCurrency(payload[0].value, currency)}
        </p>
      </div>
    );
  }
  return null;
}
