"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bitcoin,
  Briefcase,
  Banknote,
  Building2,
  Globe,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingState, AssetPrefs } from "@/utils/onboardingService";
import { FlagCA, FlagUS } from "@/utils/constants";

type Props = {
  value: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onBlurSave: () => void;
  saving: boolean;
};

export function StepPreferences({ value, onChange }: Props) {
  const prefs: AssetPrefs = value.asset_preferences ?? {};

  const togglePref = (key: keyof AssetPrefs) => {
    onChange({ asset_preferences: { ...prefs, [key]: !prefs[key] } });
  };

  const assetTypes = [
    { id: "stocks", label: "Stocks", desc: "Individual companies", icon: BarChart3, color: "blue" },
    { id: "etfs", label: "ETFs", desc: "Index & sector funds", icon: Building2, color: "indigo" },
    { id: "crypto", label: "Crypto", desc: "Digital currencies", icon: Bitcoin, color: "orange" },
    { id: "bonds", label: "Bonds", desc: "Fixed income", icon: Briefcase, color: "emerald" },
    { id: "cash", label: "Cash", desc: "Savings & money market", icon: Banknote, color: "neutral" },
  ];

  const regions = [
    { id: "US", label: "United States", Flag: FlagUS },
    { id: "CA", label: "Canada", Flag: FlagCA },
  ];

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* ── Asset types ──────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700">
            Asset types you're interested in
          </h3>
          {activeCount > 0 && (
            <span className="text-[11px] text-neutral-400 font-medium">
              {activeCount} selected
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {assetTypes.map((asset) => {
            const isActive = !!prefs[asset.id as keyof AssetPrefs];
            return (
              <button
                key={asset.id}
                onClick={() => togglePref(asset.id as keyof AssetPrefs)}
                className={cn(
                  "relative flex items-start gap-3 p-4 rounded-xl border transition-all text-left",
                  isActive
                    ? "border-neutral-900 bg-neutral-900/[0.03] shadow-sm ring-1 ring-neutral-900/10"
                    : "border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-200"
                )}
              >
                {/* Check indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-neutral-900 flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                )}

                <div className="flex flex-col">
                  <asset.icon
                    className={cn(
                      "h-5 w-5 mb-2 transition-colors",
                      isActive ? "text-neutral-800" : "text-neutral-400"
                    )}
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    {asset.label}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-0.5">
                    {asset.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Region ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-700">Primary market</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {regions.map((region) => {
            const isActive = value.country === region.id;
            return (
              <button
                key={region.id}
                onClick={() => onChange({ country: region.id })}
                className={cn(
                  "flex items-center justify-center gap-3 h-12 rounded-xl border transition-all",
                  isActive
                    ? "border-neutral-900 bg-neutral-900/[0.03] shadow-sm ring-1 ring-neutral-900/10"
                    : "border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-200"
                )}
              >
                <span className="text-lg"><region.Flag /></span>
                <span className="text-sm font-medium text-neutral-800">{region.label}</span>
                {isActive && <Check className="h-3.5 w-3.5 text-neutral-800" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Hint */}
      <p className="text-[11px] text-neutral-400 text-center pt-2">
        You can change these anytime in Settings.
      </p>
    </div>
  );
}
