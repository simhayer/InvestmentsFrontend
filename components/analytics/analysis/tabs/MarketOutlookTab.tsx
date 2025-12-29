"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Clock,
  Binoculars,
  ShieldAlert,
  Lightbulb,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarketOutlookData {
  key_risks: string[];
  short_term: string;
  medium_term: string;
  key_opportunities: string[];
}

export function MarketOutlookTab({ data }: { data: MarketOutlookData }) {
  if (!data)
    return <Empty msg="Market outlook analysis is currently generating." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. HORIZON OUTLOOKS (NARRATIVE) */}
      <div className="grid gap-4 md:grid-cols-2">
        <OutlookCard
          title="Short-term"
          horizon="0-3 Months"
          icon={<Clock className="h-4 w-4" />}
          body={data.short_term}
          accent="blue"
        />
        <OutlookCard
          title="Medium-term"
          horizon="6-18 Months"
          icon={<Binoculars className="h-4 w-4" />}
          body={data.medium_term}
          accent="indigo"
        />
      </div>

      {/* 2. RISKS VS OPPORTUNITIES (ACTIONABLE) */}
      <div className="grid gap-4 md:grid-cols-2">
        <ListSection
          title="Critical Risks"
          items={data.key_risks}
          type="risk"
          icon={<ShieldAlert className="h-5 w-5 text-rose-500" />}
        />
        <ListSection
          title="Strategic Opportunities"
          items={data.key_opportunities}
          type="opportunity"
          icon={<Lightbulb className="h-5 w-5 text-emerald-500" />}
        />
      </div>
    </div>
  );
}

function OutlookCard({ title, horizon, icon, body, accent }: any) {
  return (
    <div className="group relative flex flex-col rounded-[28px] border border-neutral-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset",
              accent === "blue"
                ? "bg-blue-50 text-blue-600 ring-blue-100"
                : "bg-indigo-50 text-indigo-600 ring-indigo-100"
            )}
          >
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900">{title}</h4>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {horizon}
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium leading-relaxed text-neutral-600">
        {body}
      </p>
    </div>
  );
}

function ListSection({ title, items, type, icon }: any) {
  const isRisk = type === "risk";

  return (
    <div
      className={cn(
        "rounded-[32px] border p-6 shadow-sm",
        isRisk
          ? "border-rose-100 bg-rose-50/20"
          : "border-emerald-100 bg-emerald-50/20"
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        {icon}
        <h4
          className={cn(
            "text-sm font-black uppercase tracking-widest",
            isRisk ? "text-rose-900" : "text-emerald-900"
          )}
        >
          {title}
        </h4>
      </div>

      <ul className="space-y-3">
        {items.map((item: string, i: number) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 group"
          >
            <div
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                isRisk
                  ? "bg-rose-400 group-hover:scale-125 transition-transform"
                  : "bg-emerald-400 group-hover:scale-125 transition-transform"
              )}
            />
            <span className="text-sm font-medium text-neutral-700 leading-snug">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-16 text-center">
      <Compass className="mb-3 h-8 w-8 text-neutral-200 animate-pulse" />
      <p className="text-sm font-medium text-neutral-500 italic">{msg}</p>
    </div>
  );
}
