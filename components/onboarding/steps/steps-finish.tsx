"use client";

import * as React from "react";
import {
  CheckCircle2,
  Sparkles,
  Activity,
  Zap,
  Target,
  ShieldCheck,
  Globe,
} from "lucide-react";
import type { OnboardingState } from "@/utils/onboardingService";
import { FlagCA, FlagUS } from "@/utils/constants";

export function StepFinish({ value }: { value: OnboardingState }) {
  const format = (str: string | null) =>
    str
      ? str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Standard";

  const stats = [
    {
      label: "Strategy",
      val: format(value.time_horizon ?? null),
      icon: Target,
    },
    {
      label: "Risk Engine",
      val: format(value.risk_level ?? null),
      icon: Activity,
    },
    {
      label: "Protocol",
      val: format(value.style_preference ?? null),
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. The Strategy Blueprint - Now Integrated Light Design */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
        {/* Subtle Background Glow */}
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />

        <div className="relative space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-white">
                  Intelligence Profile
                </h3>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                  Validated & Ready for Deployment
                </p>
              </div>
            </div>

            {/* Pulsing Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Live
              </span>
            </div>
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2 p-1">
                <div className="flex items-center gap-2 text-neutral-400">
                  <stat.icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {stat.label}
                  </span>
                </div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {stat.val}
                </p>
              </div>
            ))}
          </div>

          {/* Region Lock */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
            <div className="flex items-center gap-2 text-neutral-400">
              <Globe className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Primary Region:
              </span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-neutral-100 dark:border-neutral-700">
              {value.country === "CA" ? <FlagCA /> : <FlagUS />}
              <span className="text-[10px] font-bold">
                {value.country || "US"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monitoring Summary */}
      <div className="p-8 rounded-[2.5rem] bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-6">
          AI Monitoring Radius
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(value.asset_preferences || {}).map(
            ([key, active]) =>
              active && (
                <div
                  key={key}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold capitalize shadow-sm flex items-center gap-2"
                >
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  {key}
                </div>
              )
          )}
        </div>

        {value.notes && (
          <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Custom Parameters
              </span>
            </div>
            <p className="text-xs text-neutral-500 italic leading-relaxed pl-5">
              "{value.notes}"
            </p>
          </div>
        )}
      </div>

      {/* 3. Deployment Notice */}
      <div className="flex items-center gap-4 px-6 pt-4">
        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="text-xs font-medium text-neutral-500 leading-relaxed">
          Your Investment AI is calibrated and ready. Clicking{" "}
          <span className="text-neutral-900 dark:text-white font-bold">
            Initialize Engine
          </span>{" "}
          will build your personal dashboard.
        </p>
      </div>
    </div>
  );
}
