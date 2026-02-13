"use client";

import * as React from "react";
import {
  CheckCircle2,
  Target,
  TrendingUp,
  Shield,
  Globe,
  BarChart3,
  Bitcoin,
  Building2,
  Briefcase,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingState } from "@/utils/onboardingService";
import { FlagCA, FlagUS } from "@/utils/constants";

export function StepFinish({ value }: { value: OnboardingState }) {
  const format = (str: string | null | undefined) =>
    str ? str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—";

  const assetIcons: Record<string, React.ElementType> = {
    stocks: BarChart3, etfs: Building2, crypto: Bitcoin, bonds: Briefcase, cash: Banknote,
  };

  const activeAssets = Object.entries(value.asset_preferences || {})
    .filter(([, v]) => v)
    .map(([k]) => k);

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-800 font-medium">
          Everything looks good. Click <span className="font-bold">Finish Setup</span> to start using your dashboard.
        </p>
      </div>

      {/* Summary grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard label="Goal" value={format(value.primary_goal)} icon={Target} />
        <SummaryCard label="Timeline" value={format(value.time_horizon)} icon={TrendingUp} />
        <SummaryCard label="Risk level" value={format(value.risk_level)} icon={Shield} />
        <SummaryCard
          label="Region"
          value={value.country || "US"}
          icon={Globe}
          trailing={
            <span className="text-base ml-auto">
              {value.country === "CA" ? <FlagCA /> : <FlagUS />}
            </span>
          }
        />
      </div>

      {/* Active assets */}
      {activeAssets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-500">Tracking</h4>
          <div className="flex flex-wrap gap-2">
            {activeAssets.map((key) => {
              const Icon = assetIcons[key] || BarChart3;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-xs font-medium text-neutral-700 capitalize"
                >
                  <Icon className="h-3.5 w-3.5 text-neutral-400" />
                  {key}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {value.notes && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-neutral-500">Your notes</h4>
          <p className="text-sm text-neutral-600 italic bg-neutral-50 rounded-lg p-3">
            &ldquo;{value.notes}&rdquo;
          </p>
        </div>
      )}

      {/* Footer hint */}
      <p className="text-[11px] text-neutral-400 text-center pt-2">
        You can update all of these in Settings at any time.
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  trailing,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50">
      <Icon className="h-4.5 w-4.5 text-neutral-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-neutral-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-neutral-800 truncate">{value}</p>
      </div>
      {trailing}
    </div>
  );
}
