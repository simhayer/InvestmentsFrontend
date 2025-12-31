"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  LineChart,
  Cpu,
} from "lucide-react";
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

// tiny debounce so we don’t PATCH on every keystroke
function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
) {
  const fnRef = React.useRef(fn);
  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const tRef = React.useRef<number | null>(null);

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs]
  );
}

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
    asset_preferences: {
      stocks: true,
      etfs: true,
      crypto: false,
      bonds: false,
      cash: true,
    },
    style_preference: "set_and_forget",
    notification_level: "balanced",
    notes: "",
  });

  // Keep a ref of the latest form (so debounced save uses latest values)
  const formRef = React.useRef(form);
  React.useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Load from backend and resume
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getOnboarding();
        if (cancelled) return;

        if (data.completed) {
          router.replace("/dashboard");
          return;
        }

        const s = clampStep(data.current_step ?? 0);
        setStep(s);
        setForm((prev) => ({ ...prev, ...data, current_step: s }));
      } catch (err) {
        console.error(err);
        toast({
          title: "Couldn’t load onboarding",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router, toast]);

  async function syncProgress(patch: Partial<OnboardingState>) {
    setSaving(true);
    try {
      const updated = await patchOnboarding(patch);
      setForm((prev) => ({ ...prev, ...updated }));
      return updated;
    } catch (e) {
      toast({
        title: "Save failed",
        description: "Try again.",
        variant: "destructive",
      });
      throw e;
    } finally {
      setSaving(false);
    }
  }

  // Debounced patch for frequent UI changes
  const debouncedPatch = useDebouncedCallback(
    (patch: Partial<OnboardingState>) => {
      // fire-and-forget, but don’t spam while already saving/finishing
      if (finishing) return;
      void syncProgress(patch).catch(() => {});
    },
    450
  );

  // Step navigation: persist current_step on backend
  const handleStepChange = async (direction: "next" | "back") => {
    const nextStep = clampStep(direction === "next" ? step + 1 : step - 1);
    if (nextStep === step) return;

    try {
      await syncProgress({ current_step: nextStep });
      setStep(nextStep);
    } catch {
      // toast already shown
    }
  };

  const handleSaveExit = async () => {
    try {
      // save everything important before leaving (safe)
      await syncProgress({ ...formRef.current, current_step: step });
    } catch {
      // toast already shown
      return;
    }
    router.replace("/dashboard");
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      // ensure latest values are saved + mark completed
      await syncProgress({ ...formRef.current, current_step: TOTAL_STEPS - 1 });
      await completeOnboarding();
      router.replace("/dashboard");
    } catch {
      toast({
        title: "Couldn’t finish",
        description: "Try again.",
        variant: "destructive",
      });
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return null;

  const steps = [
    {
      title: "Investment Style",
      subtitle: "Set your goals and risk",
      icon: ShieldCheck,
    },
    {
      title: "Market Focus",
      subtitle: "Choose what to track",
      icon: LineChart,
    },
    {
      title: "Link Accounts",
      subtitle: "Connect your bank or broker",
      icon: Cpu,
    },
    {
      title: "Review & Launch",
      subtitle: "Confirm your AI setup",
      icon: Sparkles,
    },
  ];

  const busy = saving || finishing;

  return (
    <div className="h-screen w-full bg-neutral-50 dark:bg-[#0A0A0A] flex overflow-hidden font-sans">
      {/* Left Panel */}
      <aside className="hidden lg:flex w-[400px] xl:w-[450px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-col p-10 relative">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-neutral-900 dark:text-white uppercase text-xs">
            WallStreetAI
          </span>
        </div>

        <div className="space-y-12">
          <nav className="space-y-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-4 transition-all duration-500",
                  i === step ? "opacity-100 scale-105" : "opacity-30 scale-100"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center border-2",
                    i === step
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-neutral-200 text-neutral-400"
                  )}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-none mb-1">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </nav>

          <div className="absolute bottom-10 left-10 right-10 p-6 rounded-[2rem] bg-neutral-900 text-white overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Cpu className="h-20 w-20 text-primary" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  System Processing
                </span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400 font-medium">
                Your insights will adapt to your{" "}
                <span className="text-white font-bold">{form.risk_level}</span>{" "}
                risk preference.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Area */}
      <section className="flex-1 flex flex-col relative bg-neutral-50/50 dark:bg-black/50">
        {/* Header */}
        <header className="h-20 w-full px-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Section
            </span>
            <span className="h-4 w-[1px] bg-neutral-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-white">
              0{step + 1} / 04
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveExit}
            disabled={busy}
            className="text-neutral-400 hover:text-neutral-900 text-[10px] font-bold uppercase tracking-widest"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save & Exit"
            )}
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-24 py-12">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <div className="mb-12">
                  <h2 className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white mb-4">
                    {steps[step].title}
                  </h2>
                  <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                    Answer a few quick questions — you can change this later.
                  </p>
                </div>

                <div className="space-y-12">
                  {step === 0 && (
                    <StepProfile
                      value={form}
                      saving={busy}
                      onChange={(p) => {
                        setForm((f: any) => ({ ...f, ...p }));
                        debouncedPatch(p); // saves only changed fields
                      }}
                      onBlurSave={() => {
                        // optional: force save on blur
                        void syncProgress(formRef.current).catch(() => {});
                      }}
                    />
                  )}

                  {step === 1 && (
                    <StepPreferences
                      value={form}
                      saving={busy}
                      onChange={(p) => {
                        setForm((f: any) => ({ ...f, ...p }));
                        debouncedPatch(p);
                      }}
                      onBlurSave={() => {
                        void syncProgress(formRef.current).catch(() => {});
                      }}
                    />
                  )}

                  {step === 2 && (
                    <StepPlaid
                      value={form}
                      saving={busy}
                      onChange={(p) => {
                        setForm((f: any) => ({ ...f, ...p }));
                        debouncedPatch(p);
                      }}
                      onSkip={() => handleStepChange("next")}
                    />
                  )}

                  {step === 3 && <StepFinish value={form} />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-28 w-full px-12 flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl shrink-0">
          <Button
            variant="ghost"
            onClick={() => void handleStepChange("back")}
            disabled={step === 0 || saving}
            className="rounded-xl h-12 px-6 font-bold text-neutral-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          <Button
            onClick={() =>
              step === TOTAL_STEPS - 1
                ? void handleFinish()
                : void handleStepChange("next")
            }
            disabled={saving}
            className="rounded-xl px-10 h-14 bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 active:scale-95 transition-all group"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : step === TOTAL_STEPS - 1 ? (
              "Activate AI Engine"
            ) : (
              "Continue"
            )}
            {!saving && (
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            )}
          </Button>
        </footer>
      </section>
    </div>
  );
}
