"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Quote,
  Search,
  Radio,
  MessageSquareText,
} from "lucide-react";
import type { NewsSentimentLayer } from "@/types/portfolio-ai";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function NewsSentimentTab({ data }: { data: NewsSentimentLayer }) {
  if (!data || !data.sentiment)
    return <Empty msg="No market sentiment analysis available." />;

  const { sentiment } = data;
  const drivers = sentiment.drivers || [];
  const sources = sentiment.sources_considered || [];

  const sentimentColor =
    sentiment.overall_sentiment?.toLowerCase().includes("bullish") ||
    sentiment.overall_sentiment?.toLowerCase() === "positive"
      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
      : sentiment.overall_sentiment?.toLowerCase().includes("bearish") ||
        sentiment.overall_sentiment?.toLowerCase() === "negative"
      ? "text-rose-600 bg-rose-50 border-rose-100"
      : "text-blue-600 bg-blue-50 border-blue-100";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. SENTIMENT OVERVIEW HERO */}
      <section className="rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">
                <Radio className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                Current Market Pulse
              </h3>
            </div>
            <p className="text-lg font-medium leading-relaxed text-neutral-800">
              {sentiment.summary}
            </p>
          </div>

          <div
            className={cn(
              "flex shrink-0 flex-col items-center justify-center rounded-3xl border px-8 py-6 text-center shadow-sm",
              sentimentColor
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
              Outlook
            </span>
            <span className="text-xl font-black capitalize tracking-tight">
              {sentiment.overall_sentiment}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* 2. KEY DRIVERS LIST */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Newspaper className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-900">
              Catalyst Drivers
            </h3>
          </div>

          <div className="grid gap-4">
            {drivers.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-[24px] border border-neutral-200/60 bg-white p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="rounded-md border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase text-neutral-500"
                  >
                    {d.theme}
                  </Badge>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                      d.tone?.toLowerCase() === "positive"
                        ? "bg-emerald-500 text-white"
                        : d.tone?.toLowerCase() === "negative"
                        ? "bg-rose-500 text-white"
                        : "bg-neutral-800 text-white"
                    )}
                  >
                    {d.tone}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-neutral-700">
                  {d.impact}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. SOURCES & TRANSPARENCY */}
        <div className="space-y-6">
          <section className="rounded-[28px] border border-neutral-200/60 bg-neutral-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-neutral-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Coverage
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold text-neutral-600 shadow-sm"
                >
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  {s}
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] leading-normal text-neutral-400">
              Our AI continuously monitors these sources for high-impact
              linguistic changes and volatility triggers.
            </p>
          </section>

          <div className="rounded-[28px] bg-neutral-900 p-6 text-white">
            <MessageSquareText className="mb-3 h-5 w-5 text-emerald-400" />
            <h4 className="text-sm font-bold">Sentiment Analysis</h4>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Scores are calculated based on semantic weight, source
              reliability, and temporal relevance to your specific holdings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 text-center">
      <Newspaper className="mb-2 h-6 w-6 text-neutral-300" />
      <p className="text-sm font-medium text-neutral-400">{msg}</p>
    </div>
  );
}
