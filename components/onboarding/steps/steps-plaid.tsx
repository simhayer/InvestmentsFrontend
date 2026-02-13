"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Landmark, ArrowRight, Building2 } from "lucide-react";

import { PlaidLinkButton } from "@/components/plaid/plaid-link-button";
import { useAuth } from "@/lib/auth-provider";
import type { OnboardingState } from "@/utils/onboardingService";

type Props = {
  value: OnboardingState;
  saving: boolean;
  onChange: (patch: Partial<OnboardingState>) => void;
  onSkip: () => void;
};

export function StepPlaid({ saving, onSkip }: Props) {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : "";

  return (
    <div className="space-y-6">
      {/* Main card */}
      <div className="flex flex-col items-center text-center py-4">
        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-5">
          <Landmark className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-bold text-neutral-900 mb-1.5">
          Sync your portfolio automatically
        </h3>
        <p className="text-sm text-neutral-500 max-w-sm">
          Connect your brokerage or bank to import your holdings.
          We&apos;ll use this to give you personalized insights.
        </p>

        <div className="w-full max-w-sm mt-6 space-y-3">
          <PlaidLinkButton
            userId={userId}
            onSuccess={onSkip}
            label="Connect account"
            variant="default"
            size="lg"
            fullWidth
            className="w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 h-12 text-sm font-semibold shadow-sm"
          />

          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={saving}
            className="w-full text-neutral-400 hover:text-neutral-600 text-sm"
          >
            Skip for now
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Supported institutions */}
      <div className="pt-5 border-t border-neutral-100">
        <p className="text-[11px] text-neutral-400 font-medium text-center mb-3">
          Works with 12,000+ institutions
        </p>
        <div className="flex justify-center items-center gap-5 text-neutral-300">
          {["Chase", "Fidelity", "Schwab", "Vanguard", "TD"].map((name) => (
            <span key={name} className="text-[11px] font-bold">{name}</span>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50/60 rounded-xl">
        <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-emerald-800">Read-only & secure</p>
          <p className="text-[11px] text-emerald-700/70 leading-relaxed mt-0.5">
            We never see your login credentials. Connection is powered by Plaid with bank-grade encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
