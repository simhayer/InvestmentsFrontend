"use client";

import * as React from "react";
import {
  TrendingUp,
  Mountain,
  Shield,
  Target,
  Clock,
  Rocket,
  GraduationCap,
  Sprout,
  BarChart3,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingState } from "@/utils/onboardingService";

type Props = {
  value: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onBlurSave: () => void;
  saving: boolean;
};

export function StepProfile({ value, onChange }: Props) {
  /* ── Goal ────────────────────────────────────────────── */
  const goals = [
    { id: "growth", label: "Grow wealth", desc: "Long-term capital appreciation", icon: TrendingUp },
    { id: "income", label: "Earn income", desc: "Dividends & interest", icon: Wallet },
    { id: "preserve", label: "Preserve capital", desc: "Protect what I have", icon: Shield },
    { id: "save_for_goal", label: "Save for a goal", desc: "House, education, etc.", icon: PiggyBank },
  ];

  /* ── Time horizon ────────────────────────────────────── */
  const horizons = [
    { id: "short", label: "Short-term", desc: "Under 2 years", icon: Clock },
    { id: "medium", label: "Medium", desc: "2–7 years", icon: Target },
    { id: "long", label: "Long-term", desc: "7+ years", icon: Mountain },
  ];

  /* ── Risk ─────────────────────────────────────────────── */
  const risks = [
    { id: "low", label: "Conservative", desc: "Minimize losses", color: "emerald" },
    { id: "medium", label: "Moderate", desc: "Balanced approach", color: "blue" },
    { id: "high", label: "Aggressive", desc: "Maximize growth", color: "orange" },
  ];

  /* ── Experience ───────────────────────────────────────── */
  const levels = [
    { id: "beginner", label: "Beginner", desc: "Just getting started", icon: Sprout },
    { id: "intermediate", label: "Intermediate", desc: "Some experience", icon: BarChart3 },
    { id: "advanced", label: "Advanced", desc: "Seasoned investor", icon: GraduationCap },
  ];

  return (
    <div className="space-y-8">
      {/* Primary Goal */}
      <OptionSection label="What's your main goal?">
        <div className="grid grid-cols-2 gap-3">
          {goals.map((g) => (
            <OptionCard
              key={g.id}
              active={value.primary_goal === g.id}
              onClick={() => onChange({ primary_goal: g.id as any })}
              icon={<g.icon className="h-5 w-5" />}
              label={g.label}
              desc={g.desc}
            />
          ))}
        </div>
      </OptionSection>

      {/* Time Horizon */}
      <OptionSection label="Investment timeline">
        <div className="grid grid-cols-3 gap-3">
          {horizons.map((h) => (
            <OptionCard
              key={h.id}
              active={value.time_horizon === h.id}
              onClick={() => onChange({ time_horizon: h.id as any })}
              icon={<h.icon className="h-5 w-5" />}
              label={h.label}
              desc={h.desc}
              compact
            />
          ))}
        </div>
      </OptionSection>

      {/* Risk Tolerance */}
      <OptionSection label="Risk comfort level">
        <div className="flex gap-2">
          {risks.map((r) => {
            const active = value.risk_level === r.id;
            const ringColor =
              r.color === "emerald" ? "ring-emerald-200" :
              r.color === "blue" ? "ring-blue-200" : "ring-orange-200";
            const dotColor =
              r.color === "emerald" ? "bg-emerald-500" :
              r.color === "blue" ? "bg-blue-500" : "bg-orange-500";
            return (
              <button
                key={r.id}
                onClick={() => onChange({ risk_level: r.id as any })}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-4 rounded-xl border transition-all",
                  active
                    ? `border-neutral-300 bg-white shadow-sm ring-2 ${ringColor}`
                    : "border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-200"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full mb-1", active ? dotColor : "bg-neutral-300")} />
                <span className="text-xs font-semibold text-neutral-800">{r.label}</span>
                <span className="text-[11px] text-neutral-400">{r.desc}</span>
              </button>
            );
          })}
        </div>
      </OptionSection>

      {/* Experience Level */}
      <OptionSection label="Your experience">
        <div className="grid grid-cols-3 gap-3">
          {levels.map((l) => (
            <OptionCard
              key={l.id}
              active={value.experience_level === l.id}
              onClick={() => onChange({ experience_level: l.id as any })}
              icon={<l.icon className="h-5 w-5" />}
              label={l.label}
              desc={l.desc}
              compact
            />
          ))}
        </div>
      </OptionSection>
    </div>
  );
}

/* ── Shared components ──────────────────────────────────── */

function OptionSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-700">{label}</h3>
      {children}
    </section>
  );
}

function OptionCard({
  active,
  onClick,
  icon,
  label,
  desc,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start text-left rounded-xl border transition-all",
        compact ? "p-3" : "p-4",
        active
          ? "border-neutral-900 bg-neutral-900/[0.03] shadow-sm ring-1 ring-neutral-900/10"
          : "border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-200"
      )}
    >
      <span
        className={cn(
          "mb-2 transition-colors",
          active ? "text-neutral-900" : "text-neutral-400"
        )}
      >
        {icon}
      </span>
      <span className="text-xs font-semibold text-neutral-800 leading-tight">{label}</span>
      <span className="text-[11px] text-neutral-400 leading-tight mt-0.5">{desc}</span>
    </button>
  );
}
