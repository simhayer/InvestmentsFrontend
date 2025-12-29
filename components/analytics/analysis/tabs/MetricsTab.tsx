"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Globe2,
} from "lucide-react";
import type { MetricsLayer } from "@/types/portfolio-ai";
import { fmtCurrency, fmtPct } from "@/utils/format";
import { cn } from "@/lib/utils";

export function PortfolioMetricsTab({ data }: { data: MetricsLayer }) {
  if (!data) return <Empty msg="No metrics available." />;

  const p = data.portfolio;
  const symbols = Object.values(data.per_symbol || {});

  // Logical sorting for Winner/Loser
  const withPL = symbols.filter(
    (s: any) => typeof s?.unrealized_pnl_pct === "number"
  );
  const biggestWinner = withPL.length
    ? [...withPL].sort(
        (a: any, b: any) => b.unrealized_pnl_pct - a.unrealized_pnl_pct
      )[0]
    : null;
  const biggestLoser = withPL.length
    ? [...withPL].sort(
        (a: any, b: any) => a.unrealized_pnl_pct - b.unrealized_pnl_pct
      )[0]
    : null;

  const topWeight = symbols.length
    ? Math.max(
        ...symbols.map((s: any) =>
          typeof s?.weight_pct === "number" ? s.weight_pct : 0
        )
      )
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. TOP LEVEL "POWER METRICS" */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Portfolio Value"
          value={p.total_value}
          type="currency"
          highlight
        />
        <MetricCard label="Cash Reserve" value={p.cash_value} type="currency" />
        <MetricCard
          label="Top 5 Concentration"
          value={p.concentration_top_5_pct}
          type="pct"
          subtitle="Overall Exposure"
        />
        <MetricCard
          label="Active Positions"
          value={p.num_positions}
          type="int"
          subtitle="Unique Symbols"
        />
      </section>

      {/* 2. EXTREMES (WINNERS/LOSERS) */}
      <section className="grid gap-4 md:grid-cols-2">
        <ExtremeCard
          type="winner"
          symbol={biggestWinner?.symbol}
          value={biggestWinner?.unrealized_pnl_pct}
        />
        <ExtremeCard
          type="loser"
          symbol={biggestLoser?.symbol}
          value={biggestLoser?.unrealized_pnl_pct}
        />
      </section>

      {/* 3. WEIGHT DISTRIBUTION GRIDS */}
      <section className="grid gap-6 md:grid-cols-3">
        <WeightCard
          title="Asset Allocation"
          icon={<PieChart className="h-4 w-4" />}
          kv={p.asset_class_weights_pct ?? {}}
          barColor="bg-blue-500"
        />
        <WeightCard
          title="Sector Exposure"
          icon={<BarChart3 className="h-4 w-4" />}
          kv={p.sector_weights_pct ?? {}}
          barColor="bg-indigo-500"
        />
        <WeightCard
          title="Geographic Mix"
          icon={<Globe2 className="h-4 w-4" />}
          kv={p.region_weights_pct ?? {}}
          barColor="bg-emerald-500"
        />
      </section>
    </div>
  );
}

// SUB-COMPONENTS

function MetricCard({ label, value, type, highlight, subtitle }: any) {
  const formattedValue =
    value == null
      ? "—"
      : type === "currency"
      ? fmtCurrency(value)
      : type === "pct"
      ? `${value.toFixed(2)}%`
      : value;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-neutral-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md",
        highlight && "border-neutral-900 bg-neutral-900 text-white"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          highlight ? "text-neutral-400" : "text-neutral-500"
        )}
      >
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold tracking-tight">{formattedValue}</h4>
      </div>
      {subtitle && (
        <p className="mt-1 text-[10px] font-medium opacity-60">{subtitle}</p>
      )}
    </div>
  );
}

function ExtremeCard({ type, symbol, value }: any) {
  const isWinner = type === "winner";
  const Icon = isWinner ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-[24px] border p-5 shadow-sm",
        isWinner
          ? "border-emerald-100 bg-emerald-50/30"
          : "border-rose-100 bg-rose-50/30"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isWinner
              ? "bg-emerald-100 text-emerald-600"
              : "bg-rose-100 text-rose-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Biggest {type}
          </p>
          <h4 className="text-lg font-bold text-neutral-900">
            {symbol ?? "N/A"}
          </h4>
        </div>
      </div>
      <div
        className={cn(
          "text-right font-bold text-lg",
          isWinner ? "text-emerald-600" : "text-rose-600"
        )}
      >
        {value ? `${value > 0 ? "+" : ""}${value.toFixed(2)}%` : "—"}
      </div>
    </div>
  );
}

function WeightCard({ title, icon, kv, barColor }: any) {
  const entries = Object.entries(kv).sort((a: any, b: any) => b[1] - a[1]);

  return (
    <div className="rounded-[28px] border border-neutral-200/60 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {entries.slice(0, 6).map(([k, v]: any) => (
          <div key={k} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-neutral-600">{k}</span>
              <span className="text-neutral-900">{v.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${v}%` }}
                className={cn("h-full rounded-full", barColor)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-[24px] border border-dashed border-neutral-200 text-sm text-neutral-500">
      {msg}
    </div>
  );
}
