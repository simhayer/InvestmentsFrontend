"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  ArrowRightLeft,
  AlertCircle,
  StickyNote,
  CheckCircle2,
  Split,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PathData {
  actions: string[];
  summary: string;
  risk_flags: string[];
  allocation_notes: string[];
}

export function RebalancePathsTab({
  data,
}: {
  data: Record<string, PathData>;
}) {
  const entries = Object.entries(data ?? {});
  if (!entries.length)
    return (
      <Empty msg="No rebalance paths available for the current profile." />
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Introduction */}
      <div className="rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm ring-1 ring-neutral-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Split className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
            Optimization Strategies
          </h3>
        </div>
        <p className="text-sm font-medium leading-relaxed text-neutral-500 max-w-3xl">
          Review generated allocation paths to optimize for diversification or
          liquidity. Each path contains a sequence of execution steps and
          associated risk parameters.
        </p>
      </div>

      {/* Paths Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {entries.map(([name, r], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col overflow-hidden rounded-[32px] border border-neutral-200/60 bg-white shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
          >
            {/* Path Title Section */}
            <div className="border-b border-neutral-100 bg-neutral-50/30 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-black capitalize tracking-tight text-neutral-900">
                  {name.replaceAll("_", " ")}
                </h4>
                <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 shadow-sm ring-1 ring-neutral-200">
                  <GitBranch className="h-3 w-3" />
                  Route {i + 1}
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-neutral-600">
                {r.summary}
              </p>
            </div>

            {/* Path Content Section */}
            <div className="grid gap-4 p-6 lg:grid-cols-1">
              <PathSection
                title="Execution Steps"
                items={r.actions}
                icon={<ArrowRightLeft className="h-3.5 w-3.5" />}
                type="action"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <PathSection
                  title="Risk Assessment"
                  items={r.risk_flags}
                  icon={<AlertCircle className="h-3.5 w-3.5" />}
                  type="risk"
                />
                <PathSection
                  title="Allocation Notes"
                  items={r.allocation_notes}
                  icon={<StickyNote className="h-3.5 w-3.5" />}
                  type="note"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PathSection({
  title,
  items,
  icon,
  type,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  type: "action" | "risk" | "note";
}) {
  if (!items?.length) return null;

  const styles = {
    action: "border-emerald-100 bg-emerald-50/30 text-emerald-900",
    risk: "border-amber-100 bg-amber-50/50 text-amber-900",
    note: "border-neutral-100 bg-neutral-50/50 text-neutral-700",
  }[type];

  const dotColors = {
    action: "bg-emerald-500",
    risk: "bg-amber-500",
    note: "bg-neutral-400",
  }[type];

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm h-full", styles)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="opacity-70">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
          {title}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-xs font-semibold leading-relaxed"
          >
            {type === "action" ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600/50" />
            ) : (
              <div
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  dotColors
                )}
              />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
        <ArrowRightLeft className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-neutral-500 italic">{msg}</p>
    </div>
  );
}
