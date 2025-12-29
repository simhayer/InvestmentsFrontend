"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  MoveRight,
  Info,
  BarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScenariosData {
  base: string;
  bear: string;
  bull: string;
  probabilities?: { base: number; bear: number; bull: number };
}

export function ScenariosTab({ data }: { data: ScenariosData }) {
  if (!data) return <Empty msg="Scenario modeling is currently unavailable." />;

  const probs = data.probabilities || { base: 0.33, bear: 0.33, bull: 0.33 };

  const scenarios = [
    {
      id: "bull",
      label: "Bull Case",
      icon: TrendingUp,
      text: data.bull,
      prob: probs.bull,
      color: "emerald",
    },
    {
      id: "base",
      label: "Base Case",
      icon: MoveRight,
      text: data.base,
      prob: probs.base,
      color: "blue",
    },
    {
      id: "bear",
      label: "Bear Case",
      icon: TrendingDown,
      text: data.bear,
      prob: probs.bear,
      color: "rose",
    },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. PROBABILITY DISTRIBUTION STRIP */}
      <div className="hidden md:block overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 p-1.5 h-12">
        <div className="flex h-full w-full gap-1 overflow-hidden rounded-full">
          {scenarios.map((s) => (
            <motion.div
              key={s.id}
              initial={{ width: 0 }}
              animate={{ width: `${s.prob * 100}%` }}
              className={cn(
                "flex items-center justify-center text-[10px] font-black uppercase tracking-tighter text-white transition-all",
                s.color === "emerald"
                  ? "bg-emerald-500"
                  : s.color === "blue"
                  ? "bg-neutral-800"
                  : "bg-rose-500"
              )}
            >
              {Math.round(s.prob * 100)}% {s.id}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. SCENARIO CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative flex flex-col rounded-[32px] border p-6 shadow-sm transition-all",
              s.color === "emerald"
                ? "border-emerald-100 bg-emerald-50/20"
                : s.color === "rose"
                ? "border-rose-100 bg-rose-50/20"
                : "border-neutral-200 bg-white"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ring-1",
                  s.color === "emerald"
                    ? "bg-white text-emerald-600 ring-emerald-100"
                    : s.color === "rose"
                    ? "bg-white text-rose-600 ring-rose-100"
                    : "bg-neutral-900 text-white ring-neutral-800"
                )}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span className="font-mono text-sm font-bold text-neutral-400">
                {(s.prob * 100).toFixed(0)}%
              </span>
            </div>

            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
              {s.label}
            </h4>

            <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-neutral-700">
              {s.text}
            </p>

            {/* Probability Micro-bar (Mobile/Context) */}
            <div className="mt-6 h-1 w-full rounded-full bg-neutral-100">
              <div
                className={cn(
                  "h-full rounded-full",
                  s.color === "emerald"
                    ? "bg-emerald-500"
                    : s.color === "blue"
                    ? "bg-neutral-800"
                    : "bg-rose-500"
                )}
                style={{ width: `${s.prob * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. SCENARIO DISCLAIMER/NOTE */}
      <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
        <BarChart className="h-5 w-5 text-neutral-400" />
        <p className="text-[11px] font-medium leading-normal text-neutral-500">
          Scenarios are modeled using Monte Carlo simulations based on current
          implied volatility and macroeconomic indicators. Probabilities are
          updated every 6 hours.
        </p>
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-16 text-center">
      <Info className="mb-3 h-8 w-8 text-neutral-200" />
      <p className="text-sm font-medium text-neutral-500 italic">{msg}</p>
    </div>
  );
}
