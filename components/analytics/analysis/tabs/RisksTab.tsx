"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskItem {
  risk: string;
  monitor: string;
  why_it_matters: string;
  assets_affected: string[];
}

export function RisksTab({ data }: { data: RiskItem[] }) {
  if (!data?.length) return <Empty msg="No explicit risks reported." />;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {data.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="overflow-hidden rounded-[28px] border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-6 shadow-sm"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-amber-950">{r.risk}</h4>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            {/* Impact Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700/70">
                <Activity className="h-3 w-3" />
                Strategic Impact
              </div>
              <p className="text-sm leading-relaxed text-amber-900/80">
                {r.why_it_matters}
              </p>
            </div>

            {/* Monitoring Section */}
            <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-amber-200/50">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700/70">
                <Eye className="h-3 w-3" />
                Active Monitoring
              </div>
              <p className="mt-1 text-sm font-semibold text-amber-900">
                {r.monitor}
              </p>
            </div>
          </div>

          {/* Affected Assets Footer */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-amber-200/40 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-tight text-amber-600/60">
              Exposure:
            </span>
            {r.assets_affected.map((a) => (
              <span
                key={a}
                className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-tight text-amber-800"
              >
                {a}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-neutral-500 italic">{msg}</p>
    </div>
  );
}
