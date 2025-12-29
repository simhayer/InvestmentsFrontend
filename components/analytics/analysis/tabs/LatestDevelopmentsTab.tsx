"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Flame,
  Newspaper,
  History,
  ArrowUpRight,
} from "lucide-react";
import type { LatestDevelopmentItem } from "@/types/portfolio-ai";
import { latestSorted } from "@/utils/aiService";
import { cn } from "@/lib/utils";

export function LatestDevelopmentsTab({
  data,
}: {
  data: LatestDevelopmentItem[];
}) {
  const items = React.useMemo(() => latestSorted(data ?? []), [data]);

  if (!items.length)
    return <Empty msg="No recent developments recorded for this watch-list." />;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Feed Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-neutral-400" />
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
            Chronological Intelligence
          </h3>
        </div>
        <span className="text-[10px] font-medium text-neutral-400">
          Updates hourly
        </span>
      </div>

      <div className="grid gap-3">
        {items.map((n, i) => (
          <motion.a
            key={i}
            href={n.url}
            target="_blank"
            rel="noreferrer noopener"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative flex flex-col rounded-[24px] border border-neutral-200/60 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md active:scale-[0.99]"
          >
            {/* Source & Date Row */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                  <Newspaper className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-600">
                  {n.source} <span className="mx-1 text-neutral-200">•</span>{" "}
                  {n.date}
                </span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition-colors group-hover:text-neutral-900" />
            </div>

            {/* Headline */}
            <h4 className="mb-2 text-base font-bold leading-snug tracking-tight text-neutral-900 decoration-neutral-200 decoration-2 group-hover:underline underline-offset-4">
              {n.headline}
            </h4>

            {/* AI Impact Statement */}
            <div className="relative mb-4 rounded-xl bg-neutral-50/80 p-3 ring-1 ring-inset ring-neutral-100">
              <div className="mb-1 flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-400">
                  Impact Analysis
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-neutral-700">
                {n.impact}
              </p>
            </div>

            {/* Ticker Badges */}
            <div className="flex flex-wrap gap-1.5">
              {n.assets_affected.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-neutral-800 shadow-sm"
                >
                  {a}
                </span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-20 text-center">
      <Newspaper className="mb-3 h-8 w-8 text-neutral-200" />
      <p className="text-sm font-medium text-neutral-500 italic">{msg}</p>
    </div>
  );
}
