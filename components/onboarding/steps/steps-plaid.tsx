"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Landmark } from "lucide-react";

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
      <Card className="relative overflow-hidden p-8 rounded-[2rem] border-none bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
            <Landmark className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Sync your Portfolio
            </h3>
            <p className="text-sm text-neutral-500 max-w-[280px] mx-auto">
              Link your brokerage to unlock personalized AI risk analysis and
              fee detection.
            </p>
          </div>

          <div className="w-full pt-6 flex flex-col gap-3">
            <PlaidLinkButton
              userId={userId}
              onSuccess={onSkip}
              label="Connect secure bank link"
              variant="default"
              size="lg"
              fullWidth
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-14 text-base font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
            />

            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={saving}
              className="text-neutral-400 hover:text-neutral-900"
            >
              I&apos;ll do this later
            </Button>

            {!userId ? (
              <p className="text-[11px] text-neutral-500">
                Loading your account…
              </p>
            ) : null}
          </div>
        </div>

        {/* Bank Trust Banner */}
        <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-[10px] text-center uppercase tracking-widest text-neutral-400 font-bold mb-4">
            Supported Institutions
          </p>
          <div className="flex justify-center items-center gap-6 grayscale opacity-40">
            <span className="text-xs font-black italic">CHASE</span>
            <span className="text-xs font-black italic">Fidelity</span>
            <span className="text-xs font-black italic">Charles SCHWAB</span>
          </div>
        </div>
      </Card>

      {/* Security Footer */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
        <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
            Bank-Grade Security
          </p>
          <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500/70 leading-relaxed">
            We never see your login credentials. Your data is read-only and
            encrypted using AES-256 standards.
          </p>
        </div>
      </div>
    </div>
  );
}
