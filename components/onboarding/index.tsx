// components/onboarding/index.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  getOnboarding,
  patchOnboarding,
  completeOnboarding,
  type OnboardingState,
} from "@/utils/onboardingService";

import { StepProfile } from "./steps/steps-profile";
import { StepPreferences } from "./steps/steps-preferences";
import { StepPlaid } from "./steps/steps-plaid";
import { StepFinish } from "./steps/steps-finish";

const TOTAL_STEPS = 4;

function clampStep(n: number) {
  return Math.max(0, Math.min(TOTAL_STEPS - 1, n));
}

function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
) {
  const fnRef = React.useRef(fn);
  React.useEffect(() => { fnRef.current = fn; }, [fn]);
  const tRef = React.useRef<number | null>(null);
  return React.useCallback(
    (...args: Parameters<T>) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs]
  );
}

const STEP_META = [
  { label: "Profile", title: "Tell us about yourself", subtitle: "So we can tailor your experience" },
  { label: "Preferences", title: "What do you want to track?", subtitle: "Pick the markets and assets you care about" },
  { label: "Connect", title: "Link your accounts", subtitle: "Import holdings automatically, or skip for now" },
  { label: "Ready", title: "You're all set", subtitle: "Here's a summary of your setup" },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [finishing, setFinishing] = React.useState(false);
  const [step, setStep] = React.useState(0);

  const [form, setForm] = React.useState<OnboardingState>({
    current_step: 0,
    time_horizon: "medium",
    primary_goal: "growth",
    risk_level: "medium",
    experience_level: "intermediate",
    age_band: null,
    country: null,
    asset_preferences: { stocks: true, etfs: true, crypto: false, bonds: false, cash: true },
    style_preference: "set_and_forget",
    notification_level: "balanced",
    notes: "",
  });

  const formRef = React.useRef(form);
  React.useEffect(() => { formRef.current = form; }, [form]);

  // Load from backend
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getOnboarding();
        if (cancelled) return;
        if (data.completed) { router.replace("/dashboard"); return; }
        const s = clampStep(data.current_step ?? 0);
        setStep(s);
        setForm((prev) => ({ ...prev, ...data, current_step: s }));
      } catch (err) {
        console.error(err);
        toast({ title: "Couldn't load onboarding", description: "Please refresh and try again.", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router, toast]);

  async function syncProgress(patch: Partial<OnboardingState>) {
    setSaving(true);
    try {
      const updated = await patchOnboarding(patch);
      setForm((prev) => ({ ...prev, ...updated }));
      return updated;
    } catch {
      toast({ title: "Save failed", description: "Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const debouncedPatch = useDebouncedCallback(
    (patch: Partial<OnboardingState>) => {
      if (finishing) return;
      void syncProgress(patch);
    },
    450
  );

  const handleStepChange = async (direction: "next" | "back") => {
    const nextStep = clampStep(direction === "next" ? step + 1 : step - 1);
    if (nextStep === step) return;
    try {
      await syncProgress({ current_step: nextStep });
      setStep(nextStep);
    } catch { /* toast shown */ }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await syncProgress({ ...formRef.current, current_step: TOTAL_STEPS - 1 });
      await completeOnboarding();
      router.replace("/dashboard");
    } catch {
      toast({ title: "Couldn't finish", description: "Try again.", variant: "destructive" });
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  const busy = saving || finishing;
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-3xl mx-auto">
        <span className="text-sm font-bold text-neutral-900 tracking-tight">
          WallStreetAI
        </span>
        <span className="text-xs text-neutral-400 font-medium">
          Step {step + 1} of {TOTAL_STEPS}
        </span>
      </header>

      {/* ── Progress bar ────────────────────────────────────────── */}
      <div className="w-full max-w-3xl mx-auto px-6">
        <div className="flex gap-2">
          {STEP_META.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-neutral-200">
              <motion.div
                className="h-full bg-neutral-900 rounded-full"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>

        {/* Step pills (desktop) */}
        <div className="hidden sm:flex items-center justify-between mt-3">
          {STEP_META.map((s, i) => (
            <span
              key={i}
              className={cn(
                "text-[11px] font-semibold transition-colors",
                i <= step ? "text-neutral-700" : "text-neutral-300"
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-1">
                {STEP_META[step].title}
              </h1>
              <p className="text-sm text-neutral-500">
                {STEP_META[step].subtitle}
              </p>
            </div>

            {/* Step body */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              {step === 0 && (
                <StepProfile
                  value={form}
                  saving={busy}
                  onChange={(p) => { setForm((f) => ({ ...f, ...p })); debouncedPatch(p); }}
                  onBlurSave={() => { void syncProgress(formRef.current); }}
                />
              )}
              {step === 1 && (
                <StepPreferences
                  value={form}
                  saving={busy}
                  onChange={(p) => { setForm((f) => ({ ...f, ...p })); debouncedPatch(p); }}
                  onBlurSave={() => { void syncProgress(formRef.current); }}
                />
              )}
              {step === 2 && (
                <StepPlaid
                  value={form}
                  saving={busy}
                  onChange={(p) => { setForm((f) => ({ ...f, ...p })); debouncedPatch(p); }}
                  onSkip={() => handleStepChange("next")}
                />
              )}
              {step === 3 && <StepFinish value={form} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer nav ──────────────────────────────────────────── */}
      <footer className="w-full max-w-3xl mx-auto px-6 pb-8 pt-2 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => void handleStepChange("back")}
          disabled={step === 0 || busy}
          className="rounded-xl h-11 px-5 text-neutral-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={() => isLast ? void handleFinish() : void handleStepChange("next")}
          disabled={busy}
          className={cn(
            "rounded-xl h-11 px-7 font-semibold shadow-sm transition-all",
            isLast
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-neutral-900 hover:bg-neutral-800 text-white"
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLast ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Finish Setup
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
