"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Bitcoin,
  Briefcase,
  Banknote,
  Building2,
  Bell,
  MousePointer2,
  Zap,
  Calendar,
  Globe,
  Check,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { OnboardingState, AssetPrefs } from "@/utils/onboardingService";
import { FlagCA, FlagUS } from "@/utils/constants";

type Props = {
  value: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onBlurSave: () => void;
  saving: boolean;
};

export function StepPreferences({
  value,
  onChange,
  onBlurSave,
  saving,
}: Props) {
  const prefs: AssetPrefs = value.asset_preferences ?? {};

  const togglePref = (key: keyof AssetPrefs) => {
    onChange({
      asset_preferences: {
        ...prefs,
        [key]: !prefs[key],
      },
    });
  };

  const assetTypes = [
    { id: "stocks", label: "Stocks", icon: BarChart3, color: "text-blue-500" },
    { id: "etfs", label: "ETFs", icon: Building2, color: "text-indigo-500" },
    { id: "crypto", label: "Crypto", icon: Bitcoin, color: "text-orange-500" },
    { id: "bonds", label: "Bonds", icon: Briefcase, color: "text-emerald-500" },
    { id: "cash", label: "Cash", icon: Banknote, color: "text-neutral-500" },
  ];

  const regions = [
    { id: "US", label: "United States", Flag: FlagUS },
    { id: "CA", label: "Canada", Flag: FlagCA },
  ];

  return (
    <div className="space-y-10">
      {/* 1. Market Coverage - Bento Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <Label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black">
            Market Coverage
          </Label>
          <AnimatePresence>
            {Object.values(prefs).some(Boolean) && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold text-primary flex items-center gap-1"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                AI Scanners Primed
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {assetTypes.map((asset) => {
            const isActive = !!prefs[asset.id as keyof AssetPrefs];
            return (
              <motion.button
                key={asset.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePref(asset.id as keyof AssetPrefs)}
                className={cn(
                  "relative flex flex-col items-start p-5 rounded-[2rem] border-2 transition-all duration-300 text-left overflow-hidden",
                  isActive
                    ? "border-primary bg-white dark:bg-neutral-800 shadow-xl shadow-primary/5 scale-[1.02]"
                    : "border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 opacity-60 hover:opacity-100"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="asset-glow"
                    className="absolute -right-6 -top-6 h-20 w-20 bg-primary/10 rounded-full blur-2xl"
                  />
                )}
                <asset.icon
                  className={cn(
                    "h-6 w-6 mb-3 transition-colors",
                    isActive ? asset.color : "text-neutral-300"
                  )}
                />
                <span className="text-xs font-bold">{asset.label}</span>
                <span className="text-[10px] text-neutral-400 mt-1 uppercase font-medium">
                  {isActive ? "Tracking" : "Inactive"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 2. Execution Mode - Segmented Strategy */}
      <section className="space-y-4">
        <Label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black px-1">
          Intelligence Protocol
        </Label>
        <ToggleGroup
          type="single"
          value={value.style_preference ?? "set_and_forget"}
          onValueChange={(v) =>
            onChange({ style_preference: (v || null) as any })
          }
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {[
            {
              id: "set_and_forget",
              label: "Passive",
              icon: Calendar,
              desc: "Monthly Rebalancing",
            },
            {
              id: "hands_on",
              label: "Proactive",
              icon: MousePointer2,
              desc: "Weekly Tuning",
            },
            {
              id: "news_driven",
              label: "Real-time",
              icon: Zap,
              desc: "Instant Signals",
            },
          ].map((style) => (
            <ToggleGroupItem
              key={style.id}
              value={style.id}
              className="flex-1 flex flex-col items-start h-auto p-4 rounded-2xl border-2 gap-1 data-[state=on]:border-primary data-[state=on]:bg-white dark:data-[state=on]:bg-neutral-800 transition-all text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <style.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold">{style.label}</span>
              </div>
              <span className="text-[10px] opacity-60 leading-tight">
                {style.desc}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      {/* 3. Global Settings Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Notification Tuning */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Bell className="h-4 w-4 text-primary" />
            <Label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black">
              Alert Volume
            </Label>
          </div>
          <ToggleGroup
            type="single"
            value={value.notification_level ?? "balanced"}
            onValueChange={(v) =>
              onChange({ notification_level: (v || null) as any })
            }
            className="flex w-full bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl"
          >
            {["minimal", "balanced", "frequent"].map((level) => (
              <ToggleGroupItem
                key={level}
                value={level}
                className="flex-1 rounded-xl capitalize text-[10px] font-bold tracking-wider data-[state=on]:bg-white dark:data-[state=on]:bg-neutral-700 data-[state=on]:shadow-md transition-all h-9"
              >
                {level}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Region Lock */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Globe className="h-4 w-4 text-primary" />
            <Label className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-black">
              Primary Region
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
            {regions.map((region) => {
              const isActive = value.country === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => onChange({ country: region.id })}
                  className={cn(
                    "relative flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold transition-all",
                    isActive
                      ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white"
                      : "text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  <span className="text-base">
                    <region.Flag />
                  </span>
                  <span>{region.id}</span>
                  {isActive && (
                    <motion.div layoutId="region-check" className="ml-1">
                      <Check className="h-3 w-3 text-primary stroke-[3px]" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-neutral-50 dark:border-neutral-800">
        <ShieldCheck className="h-3.5 w-3.5 text-neutral-300" />
        <p className="text-[10px] font-semibold text-neutral-300 uppercase tracking-widest">
          Parameters are encrypted & ISO-2 Compliant
        </p>
      </div>
    </div>
  );
}
