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
  className?: string;
  onItemClick?: (symbol: string) => void;
}

function GridSkeleton({ variant }: { variant: "grid" | "strip" }) {
  const skeletonCount = 4;

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
          className="min-w-[260px] rounded-[24px] border border-neutral-100 bg-white p-5 shadow-sm"
        >
          <div className="flex justify-between mb-6">
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-12 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>
          {/* Mock Chart Area */}
          <div className="relative h-16 w-full overflow-hidden rounded-xl bg-neutral-50">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
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
}: MarketOverviewGridProps) {
  const router = useRouter();

  if (isLoading) return <GridSkeleton variant={variant} />;

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
          onClick={() => router.push(`/dashboard/symbol/${item.symbol}`)}
          className="group relative min-w-[260px] cursor-pointer rounded-[24px] border border-neutral-200/60 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/40"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {item.label}
              </p>
              <h4 className="text-lg font-bold text-neutral-900">
                {item.symbol}
              </h4>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-neutral-900">
                {item.price ? fmtCurrency(item.price, item.currency) : "—"}
              </p>
              <BadgeDelta pct={item.changePct} />
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="h-16 w-full opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={item.sparkline.map((y, i) => ({ i, y }))}>
                <defs>
                  <linearGradient
                    id={`gradient-${item.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={sparklineStroke(item.changePct)}
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor={sparklineStroke(item.changePct)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={<CustomTooltip currency={item.currency} />}
                  cursor={{ stroke: "#e5e5e5", strokeWidth: 1 }}
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

function BadgeDelta({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const isPos = pct >= 0;
  return (
    <span
      className={cn(
        "text-[11px] font-bold px-1.5 py-0.5 rounded-md",
        isPos ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}
    >
      {isPos ? "↑" : "↓"} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

function CustomTooltip({ active, payload, currency }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white px-2 py-1 shadow-xl ring-1 ring-black/5">
        <p className="text-[10px] font-bold text-neutral-900">
          {fmtCurrency(payload[0].value, currency)}
        </p>
      </div>
    );
  }
  return null;
}
