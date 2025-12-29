"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { SummaryLayer } from "@/types/portfolio-ai";
type NarrativeBlock = { heading?: string; body: string };

export function SummaryTab({ data }: { data: SummaryLayer }) {
  const [expanded, setExpanded] = React.useState(false);

  const narrativeBlocks = React.useMemo(
    () => buildNarrativeBlocks(data?.summary || ""),
    [data?.summary]
  );

  if (!data) return <Empty msg="No summary available." />;

  const isLong = data.summary.length > 800;
  const showReadMore = isLong && !expanded;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* LEFT COLUMN: NARRATIVE */}
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Portfolio Narrative
                  </h3>
                  <p className="text-[11px] font-medium text-neutral-500">
                    Multilayer AI Synthesis
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 border-none px-3 py-1"
              >
                v2.4 Engine
              </Badge>
            </div>

            <motion.div
              layout
              className={cn(
                "relative space-y-6 transition-all duration-500",
                showReadMore && "max-h-[420px] overflow-hidden"
              )}
            >
              {narrativeBlocks.map((block, idx) => (
                <div key={idx} className="group relative pl-4">
                  <div className="absolute left-0 top-1 h-full w-[2px] bg-neutral-100 group-hover:bg-emerald-200 transition-colors" />
                  {block.heading && (
                    <h5 className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
                      {block.heading}
                    </h5>
                  )}
                  <p className="text-[15px] leading-[1.6] text-neutral-700 font-medium">
                    {block.body}
                  </p>
                </div>
              ))}

              {/* Gradient Fade for Clamped Text */}
              {showReadMore && (
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
              )}
            </motion.div>

            {isLong && (
              <Button
                variant="ghost"
                className="mt-4 w-full rounded-2xl border border-neutral-100 bg-neutral-50/50 py-6 text-neutral-600 hover:bg-neutral-100"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    Collapse Narrative <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Read Full Intelligence Report{" "}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </section>

          {/* DISCLAIMER CARD */}
          <div className="rounded-[24px] bg-amber-50/50 border border-amber-100/50 p-5 flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                AI Disclosure
              </span>
              <p className="text-xs leading-relaxed text-amber-800/80 italic font-medium">
                {data.disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METADATA / CONFIDENCE */}
        <div className="space-y-6">
          <section className="rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-neutral-900">
                Confidence Scores
              </h3>
              <p className="text-xs text-neutral-500">
                Model certainty per data layer
              </p>
            </div>

            <div className="grid gap-3">
              {Object.entries(data.explainability.section_confidence).map(
                ([k, v]) => (
                  <ConfidenceCell key={k} label={formatLabel(k)} value={v} />
                )
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-neutral-400" />
                <span className="text-[10px] font-bold uppercase tracking-tight text-neutral-500">
                  Verification
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                This analysis is cross-referenced with real-time news sentiment
                and historical volatility patterns.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ConfidenceCell({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const colorClass =
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-rose-400";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight text-neutral-500">
        <span>{label}</span>
        <span className="text-neutral-900 font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </div>
  );
}

function buildNarrativeBlocks(text: string): NarrativeBlock[] {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return [{ body: text }];
  return parts.map((part) => {
    const match = part.match(/^([A-Z][\w\s&%-]{2,60}):\s*(.+)$/i);
    if (match && match[1].split(" ").length <= 6) {
      return { heading: match[1], body: match[2] };
    }
    return { body: part };
  });
}

function formatLabel(label: string) {
  return label
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 text-sm text-neutral-600 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.25)]">
      {msg}
    </div>
  );
}

// ... Keep your buildNarrativeBlocks, formatLabel, and Empty functions
