"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lightbulb,
  Zap,
  ArrowRight,
  Target,
  Info,
} from "lucide-react";
import type { ActionItem } from "@/types/portfolio-ai";
import { cn } from "@/lib/utils";

export function ActionsTab({ data }: { data: ActionItem[] }) {
  if (!data?.length)
    return (
      <Empty msg="Portfolio is currently optimized. No immediate actions required." />
    );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {data.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="group relative flex flex-col overflow-hidden rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
        >
          {/* Top Row: Category & Priority */}
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-600">
              {a.category.replaceAll("_", " ")}
            </span>
            <div className="flex gap-2">
              <PriorityBadge label="Impact" value={a.impact} />
              <PriorityBadge label="Urgency" value={a.urgency} highlight />
            </div>
          </div>

          {/* Action Title */}
          <div className="mb-3 flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h4 className="text-lg font-bold leading-tight text-neutral-900 group-hover:text-emerald-700 transition-colors">
              {a.title}
            </h4>
          </div>

          {/* Rationale Insight Box */}
          <div className="relative mb-6 flex-1 rounded-2xl bg-neutral-50 p-4 ring-1 ring-inset ring-neutral-100">
            <div className="mb-2 flex items-center gap-1.5 opacity-50">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                AI Rationale
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-neutral-700">
              {a.rationale}
            </p>
          </div>

          {/* Footer: Targets & Effort */}
          <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4">
            <div className="flex flex-wrap gap-1.5">
              {a.targets.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-black text-white"
                >
                  <Target className="h-2.5 w-2.5 text-neutral-400" />
                  {t}
                </span>
              ))}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold uppercase text-neutral-400">
                Effort
              </span>
              <span className="text-xs font-bold text-neutral-900">
                {a.effort}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PriorityBadge({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const isHigh = value.toLowerCase().includes("high");

  return (
    <div className="flex flex-col items-end">
      <span className="text-[8px] font-black uppercase text-neutral-400 tracking-tighter">
        {label}
      </span>
      <span
        className={cn(
          "text-[10px] font-bold",
          isHigh && highlight
            ? "text-rose-600"
            : isHigh
            ? "text-emerald-600"
            : "text-neutral-500"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-300">
        <Info className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-neutral-500 italic">{msg}</p>
    </div>
  );
}
