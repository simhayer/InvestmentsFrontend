"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Mountain,
  Zap,
  Target,
  ShieldCheck,
  Sparkles,
  Clock3,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingState } from "@/utils/onboardingService";

type Props = {
  value: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onBlurSave: () => void;
  saving: boolean;
};

export function StepProfile({ value, onChange, onBlurSave, saving }: Props) {
  const horizons = [
    { id: "short", label: "Short", icon: Clock3, desc: "< 2 years" },
    { id: "medium", label: "Balanced", icon: Target, desc: "2-7 years" },
    { id: "long", label: "Legacy", icon: Mountain, desc: "7+ years" },
  ];

  const risks = [
    {
      id: "low",
      label: "Preserve",
      icon: ShieldCheck,
      color: "text-emerald-500",
    },
    { id: "medium", label: "Steady", icon: TrendingUp, color: "text-blue-500" },
    { id: "high", label: "Aggressive", icon: Rocket, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-10">
      {/* Time Horizon - Horizontal Pill selection */}
      <section className="space-y-4">
        <Label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black px-1">
          Investment Horizon
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {horizons.map((h) => (
            <button
              key={h.id}
              onClick={() => onChange({ time_horizon: h.id as any })}
              className={cn(
                "group relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300",
                value.time_horizon === h.id
                  ? "bg-white dark:bg-neutral-800 border-primary shadow-lg scale-[1.02] z-10"
                  : "bg-neutral-50 dark:bg-neutral-900 border-transparent hover:border-neutral-200 opacity-60 hover:opacity-100"
              )}
            >
              <h.icon
                className={cn(
                  "h-5 w-5 mb-2 transition-colors",
                  value.time_horizon === h.id
                    ? "text-primary"
                    : "text-neutral-400"
                )}
              />
              <span className="text-xs font-bold">{h.label}</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                {h.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Risk Level - High Visual Impact */}
      <section className="space-y-4">
        <Label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black px-1">
          Risk Tolerance
        </Label>
        <div className="flex gap-2">
          {risks.map((r) => (
            <button
              key={r.id}
              onClick={() => onChange({ risk_level: r.id as any })}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all",
                value.risk_level === r.id
                  ? "border-primary bg-primary/5 text-primary ring-4 ring-primary/10"
                  : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:bg-neutral-50"
              )}
            >
              <r.icon
                className={cn(
                  "h-4 w-4",
                  value.risk_level === r.id ? r.color : "text-neutral-300"
                )}
              />
              <span className="text-xs font-bold">{r.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic AI Feedback - The "Magic" Element */}
      <AnimatePresence mode="wait">
        <motion.div
          key={value.risk_level}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-12 w-12 text-indigo-500" />
          </div>
          <div className="flex gap-4 items-start relative z-10">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                AI Calibration Strategy
              </h4>
              <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed">
                {value.risk_level === "high"
                  ? "Configuring high-volatility scanners. I will focus on sector breakouts and high-beta assets while ignoring standard safe-haven alerts."
                  : "Prioritizing capital preservation. I'll filter for low-beta securities and high-quality dividend payers with a 10-year stability score."}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Optional Notes - Minimalist Textarea */}
      <section className="space-y-4">
        <Label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black px-1">
          Special Constraints
        </Label>
        <div className="group relative">
          <Textarea
            value={value.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value })}
            onBlur={onBlurSave}
            placeholder="e.g. 'Exclude tobacco stocks', 'Focus on renewable energy'..."
            className="min-h-[100px] rounded-[1.5rem] border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 focus:bg-white transition-all resize-none p-4 text-sm"
          />
          <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <span className="text-[10px] text-neutral-400 font-medium">
              AI is listening...
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
