"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  BrainCircuit,
} from "lucide-react";
import type { PerformanceLayer } from "@/types/portfolio-ai";
import { cn } from "@/lib/utils";

export function PredictionsTab({ data }: { data: PerformanceLayer }) {
  const assets = data?.predictions?.assets ?? [];

  if (!assets.length)
    return (
      <Empty msg="No predictive data available for the current holdings." />
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. FORECAST HEADER */}
      <div className="flex items-center justify-between rounded-[24px] border border-neutral-200/60 bg-neutral-50/50 p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200">
            <Calendar className="h-5 w-5 text-neutral-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Analysis Horizon
            </p>
            <p className="text-sm font-bold text-neutral-900">
              {data.predictions.forecast_window}
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <BrainCircuit className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-neutral-500">
            ML Model: Deep-Alpha v4
          </span>
        </div>
      </div>

      {/* 2. PREDICTION GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset, idx) => (
          <PredictionCard key={asset.symbol} asset={asset} index={idx} />
        ))}
      </div>
    </div>
  );
}

function PredictionCard({ asset, index }: { asset: any; index: number }) {
  const isUp = asset.expected_direction.toLowerCase() === "up";
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col rounded-[28px] border border-neutral-200/60 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h4 className="text-xl font-extrabold tracking-tight text-neutral-900">
            {asset.symbol}
          </h4>
          <p className="text-[10px] font-bold uppercase text-neutral-400">
            Ticker Symbol
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
            isUp
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
              : "bg-rose-50 text-rose-700 ring-rose-200/60"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {isUp ? "+" : "-"}
          {asset.expected_change_pct}%
        </div>
      </div>

      <div className="relative mb-4 flex-1 rounded-2xl bg-neutral-50 p-4">
        <p className="text-xs leading-relaxed text-neutral-600 font-medium">
          <span className="mb-1 block text-[9px] font-bold uppercase tracking-tighter text-neutral-400">
            Rationale
          </span>
          {asset.rationale}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-[11px] font-bold text-neutral-500 uppercase">
              Model Confidence
            </span>
          </div>
          <span className="text-xs font-bold text-neutral-900">
            {(asset.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-neutral-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${asset.confidence * 100}%` }}
            className={cn(
              "h-full rounded-full transition-all",
              isUp ? "bg-emerald-500" : "bg-rose-500"
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
        <Target className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-neutral-500">{msg}</p>
    </div>
  );
}
