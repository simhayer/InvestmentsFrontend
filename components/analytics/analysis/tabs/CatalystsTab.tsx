"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Zap, Clock, TrendingUp, TrendingDown, Layers } from "lucide-react";
import type { CatalystItem } from "@/types/portfolio-ai";
import { catalystsSorted } from "@/utils/aiService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function CatalystsTab({ data }: { data: CatalystItem[] }) {
  const cats = React.useMemo(() => catalystsSorted(data ?? []), [data]);

  if (!cats.length)
    return <Empty msg="No upcoming catalysts detected for this portfolio." />;

  return (
    <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Timeline Background Line */}
      <div className="absolute left-6 top-2 h-full w-px bg-neutral-100 hidden md:block" />

      {cats.map((c, i) => (
        <CatalystCard key={`${c.date}-${i}`} item={c} index={i} />
      ))}
    </div>
  );
}

function CatalystCard({ item, index }: { item: CatalystItem; index: number }) {
  const isUp =
    item.expected_direction.toLowerCase() === "up" ||
    item.expected_direction.toLowerCase() === "positive";
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative md:pl-14"
    >
      {/* Timeline Indicator (Mobile Hidden) */}
      <div className="absolute left-[21px] top-6 hidden h-3 w-3 rounded-full border-2 border-white bg-neutral-900 shadow-sm md:block z-10" />

      <div className="rounded-[28px] border border-neutral-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-neutral-300">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-neutral-900 text-white hover:bg-neutral-900 rounded-lg px-2 text-[10px] font-bold"
              >
                {item.type.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1 text-neutral-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-bold tracking-tight">
                  {item.date}
                </span>
              </div>
            </div>

            <h4 className="text-[15px] font-bold leading-relaxed text-neutral-900">
              {item.description}
            </h4>

            {/* Affected Assets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {item.assets_affected.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-black text-neutral-600 uppercase"
                >
                  <Layers className="h-2.5 w-2.5" />
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Impact Status Card */}
          <div
            className={cn(
              "flex shrink-0 flex-col items-center justify-center rounded-2xl border p-4 text-center min-w-[120px]",
              isUp
                ? "border-emerald-100 bg-emerald-50/50"
                : "border-rose-100 bg-rose-50/50"
            )}
          >
            <Icon
              className={cn(
                "mb-1 h-5 w-5",
                isUp ? "text-emerald-600" : "text-rose-600"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isUp ? "text-emerald-700" : "text-rose-700"
              )}
            >
              {item.expected_direction}
            </span>
            <div className="mt-2 w-full space-y-1">
              <div className="text-[9px] font-bold text-neutral-400 uppercase">
                Magnitude
              </div>
              <p className="text-[10px] font-bold text-neutral-700 truncate max-w-[100px]">
                {item.magnitude_basis}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-16 text-center">
      <Zap className="mb-3 h-8 w-8 text-neutral-200" />
      <p className="text-sm font-medium text-neutral-400 italic">{msg}</p>
    </div>
  );
}
