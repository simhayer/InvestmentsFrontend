"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import { cn } from "@/lib/utils";

type TourStep = {
  id: string;
  targetId: string;
  title: string;
  body: string;
};

type TourContextValue = {
  start: () => void;
  skip: () => void;
  isOpen: boolean;
  hasCompleted: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "nav-search",
    targetId: "tour-global-nav",
    title: "Find anything quickly",
    body: "Use search to jump to tickers and the global navigation to switch between your dashboard, markets, and holdings.",
  },
  {
    id: "portfolio-hero",
    targetId: "tour-portfolio-hero",
    title: "Your portfolio at a glance",
    body: "See total value, returns, and live price status as soon as you log in.",
  },
  {
    id: "holdings-table",
    targetId: "tour-holdings-card",
    title: "All your positions in one place",
    body: "View positions, quantities, and P/L %. Tap a row anytime to open detailed analysis.",
  },
  {
    id: "market",
    targetId: "tour-market-nav",
    title: "Deep dives on each stock",
    body: "Open Market Overview or any symbol to see AI-assisted narratives, fundamentals, and scenarios.",
  },
  {
    id: "ai",
    targetId: "tour-ai-card",
    title: "AI view of your whole portfolio",
    body: "Explore multi-layer insights on risks, catalysts, and actions tailored to your holdings.",
  },
  {
    id: "connections",
    targetId: "tour-connections-card",
    title: "Connect your accounts",
    body: "Securely link your brokerages so the app can keep your holdings up to date. Read-only, no trading.",
  },
];

const TourContext = React.createContext<TourContextValue | null>(null);

const storageKey = (userId?: string | null) =>
  `investments:tour-complete:${userId || "anon"}`;

export function useAppTour() {
  const ctx = React.useContext(TourContext);
  if (!ctx) throw new Error("useAppTour must be used within AppTourProvider");
  return ctx;
}

export function AppTourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [hasCompleted, setHasCompleted] = React.useState(false);
  const [queuedStart, setQueuedStart] = React.useState<null | {
    mode: "auto" | "manual";
  }>(null);

  // Hydrate completion flag from local storage
  React.useEffect(() => {
    if (!user) return;
    try {
      const done =
        window.localStorage.getItem(storageKey(String(user.id))) === "true";
      setHasCompleted(done);
      if (!done) {
        setQueuedStart((prev) => prev ?? { mode: "auto" });
      }
    } catch {
      setHasCompleted(false);
      setQueuedStart((prev) => prev ?? { mode: "auto" });
    }
  }, [user?.id]);

  // Start the tour once we're on dashboard
  React.useEffect(() => {
    if (!queuedStart) return;
    if (!pathname?.startsWith("/dashboard")) {
      router.push("/dashboard");
      return;
    }

    const timer = window.setTimeout(
      () => {
        setIsOpen(true);
        setCurrentStep(0);
        setQueuedStart(null);
      },
      queuedStart.mode === "auto" ? 420 : 40
    );

    return () => window.clearTimeout(timer);
  }, [pathname, queuedStart, router]);

  const persistCompletion = React.useCallback(() => {
    const key = storageKey(String(user?.id));
    try {
      window.localStorage.setItem(key, "true");
    } catch {
      // no-op if storage unavailable
    }
  }, [user?.id]);

  const complete = React.useCallback(() => {
    setIsOpen(false);
    setHasCompleted(true);
    setQueuedStart(null);
    persistCompletion();
  }, [persistCompletion]);

  const start = React.useCallback(() => {
    setQueuedStart({ mode: "manual" });
    if (!pathname?.startsWith("/dashboard")) {
      router.push("/dashboard");
    } else {
      setIsOpen(true);
      setCurrentStep(0);
      setQueuedStart(null);
    }
  }, [pathname, router]);

  const skip = React.useCallback(() => complete(), [complete]);

  const goNext = React.useCallback(() => {
    setCurrentStep((idx) =>
      idx + 1 >= TOUR_STEPS.length
        ? idx
        : Math.min(idx + 1, TOUR_STEPS.length - 1)
    );
  }, []);

  const goPrev = React.useCallback(() => {
    setCurrentStep((idx) => Math.max(0, idx - 1));
  }, []);

  const value = React.useMemo<TourContextValue>(
    () => ({
      start,
      skip,
      isOpen,
      hasCompleted,
    }),
    [start, skip, isOpen, hasCompleted]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <AppTourOverlay
        isOpen={isOpen}
        steps={TOUR_STEPS}
        index={currentStep}
        onNext={() => {
          if (currentStep >= TOUR_STEPS.length - 1) {
            complete();
          } else {
            goNext();
          }
        }}
        onPrev={goPrev}
        onSkip={skip}
      />
    </TourContext.Provider>
  );
}

type RectLike = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  x: number;
  y: number;
  toJSON: () => unknown;
};

function AppTourOverlay({
  isOpen,
  steps,
  index,
  onNext,
  onPrev,
  onSkip,
}: {
  isOpen: boolean;
  steps: TourStep[];
  index: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const step = steps[index];
  const [targetRect, setTargetRect] = React.useState<RectLike | null>(null);
  const [tooltipRect, setTooltipRect] = React.useState<{
    width: number;
    height: number;
  }>({
    width: 360,
    height: 0,
  });
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  // Capture last focus to restore when tour closes
  React.useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    } else if (lastFocusedRef.current) {
      lastFocusedRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Focus trap + escape handling
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], [tabindex]:not([tabindex='-1'])"
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onSkip]);

  // Keep tooltip size measured for placement math
  React.useLayoutEffect(() => {
    if (!isOpen) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipRect((prev) =>
        prev.width !== rect.width || prev.height !== rect.height
          ? { width: rect.width, height: rect.height }
          : prev
      );
    }
  }, [isOpen, step]);

  // Track target position + scroll into view when step changes
  React.useEffect(() => {
    if (!isOpen) return;
    const pickTarget = () => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-tour-id="${step.targetId}"]`
        )
      );
      return (
        els.find((node) => node.offsetWidth > 0 && node.offsetHeight > 0) ??
        els[0] ??
        null
      );
    };
    const updateRect = () => {
      const el = pickTarget();
      if (!el) {
        setTargetRect(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    };

    updateRect();
    const targetEl = pickTarget();
    targetEl?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    let frame = 0;
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateRect);
    };

    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [isOpen, step]);

  // Focus primary action when step changes
  React.useEffect(() => {
    if (!isOpen) return;
    const btn = containerRef.current?.querySelector<HTMLButtonElement>(
      "[data-tour-primary]"
    );
    btn?.focus({ preventScroll: true });
  }, [isOpen, step]);

  if (typeof window === "undefined") return null;
  if (typeof document === "undefined") return null;

  const fallbackRect: RectLike = {
    top: window.innerHeight * 0.35,
    left: window.innerWidth * 0.5 - 160,
    width: 320,
    height: 1,
    bottom: window.innerHeight * 0.35 + 1,
    right: window.innerWidth * 0.5 + 160,
    x: window.innerWidth * 0.5 - 160,
    y: window.innerHeight * 0.35,
    toJSON: () => ({}),
  };
  const highlight: RectLike = targetRect ?? fallbackRect;

  const padding = 12;
  const viewportPadX = 12;
  const viewportPadY = 8;
  const top = Math.max(0, highlight.top - padding);
  const bottom = Math.min(
    window.innerHeight - viewportPadY,
    highlight.bottom + padding
  );
  const left = Math.max(viewportPadX, highlight.left - padding);
  const right = Math.min(
    window.innerWidth - viewportPadX,
    highlight.right + padding
  );
  const spotlight = {
    top,
    left,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };

  const placement = getPlacement(highlight, tooltipRect);
  const coords = getTooltipPosition(spotlight, tooltipRect, placement);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-neutral-950/55 backdrop-blur-[1px]" />
          <div
            className="fixed pointer-events-none border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              borderRadius: 22,
            }}
          />

          <div
            ref={containerRef}
            className="fixed inset-0 flex items-start justify-center"
            aria-live="polite"
          >
            <motion.div
              ref={cardRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${step.title} (${index + 1} of ${steps.length})`}
              className={cn(
                "relative max-w-[380px] rounded-2xl border border-neutral-200 bg-white px-5 py-5 text-left shadow-[0_24px_70px_-34px_rgba(15,23,42,0.45)]"
              )}
              style={{
                top: coords.top,
                left: coords.left,
                position: "fixed",
              }}
              initial={{ opacity: 0, scale: 0.98, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div
                className={cn(
                  "absolute h-3 w-3 rotate-45 bg-white",
                  placement === "top"
                    ? "bottom-[-6px]"
                    : placement === "bottom"
                    ? "top-[-6px]"
                    : placement === "left"
                    ? "right-[-6px]"
                    : "left-[-6px]"
                )}
                style={{
                  left:
                    placement === "top" || placement === "bottom"
                      ? arrowOffset(spotlight, coords, tooltipRect)
                      : undefined,
                  top:
                    placement === "left" || placement === "right"
                      ? arrowOffsetVertical(spotlight, coords, tooltipRect)
                      : undefined,
                }}
                aria-hidden
              />

              <button
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                onClick={onSkip}
                aria-label="Close tour"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Guided tour
              </div>

              <h2 className="text-xl font-semibold text-neutral-900 leading-tight">
                {step.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">{step.body}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                  <span className="inline-flex h-6 items-center rounded-full bg-neutral-100 px-2.5 text-neutral-700 ring-1 ring-neutral-200">
                    {index + 1} / {steps.length}
                  </span>
                  <button
                    className="text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                    onClick={onSkip}
                  >
                    Skip tour
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrev}
                    disabled={index === 0}
                    className="h-9 gap-1 rounded-lg border-neutral-200 bg-white text-neutral-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={onNext}
                    data-tour-primary
                    className="h-9 gap-1 rounded-lg"
                  >
                    {index === steps.length - 1 ? "Finish" : "Next"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

type Placement = "top" | "bottom" | "left" | "right";

function getPlacement(
  target: RectLike,
  tooltip: { width: number; height: number }
): Placement {
  const spaceAbove = target.top;
  const spaceBelow = window.innerHeight - (target.top + target.height);
  const spaceLeft = target.left;
  const spaceRight = window.innerWidth - (target.left + target.width);

  if (spaceBelow >= tooltip.height + 24) return "bottom";
  if (spaceAbove >= tooltip.height + 24) return "top";
  if (spaceRight >= tooltip.width + 24) return "right";
  if (spaceLeft >= tooltip.width + 24) return "left";
  return "bottom";
}

function getTooltipPosition(
  spotlight: { top: number; left: number; width: number; height: number },
  tooltip: { width: number; height: number },
  placement: Placement
) {
  const margin = 16;
  const maxLeft = Math.max(12, window.innerWidth - tooltip.width - 12);
  const centerX = spotlight.left + spotlight.width / 2;
  const centerY = spotlight.top + spotlight.height / 2;

  if (placement === "bottom" || placement === "top") {
    const top =
      placement === "bottom"
        ? spotlight.top + spotlight.height + margin
        : spotlight.top - tooltip.height - margin;
    const left = clamp(centerX - tooltip.width / 2, 12, maxLeft);
    return { top, left };
  }

  if (placement === "right" || placement === "left") {
    const left =
      placement === "right"
        ? spotlight.left + spotlight.width + margin
        : spotlight.left - tooltip.width - margin;
    const maxTop = Math.max(12, window.innerHeight - tooltip.height - 12);
    const top = clamp(centerY - tooltip.height / 2, 12, maxTop);
    return { top, left };
  }

  return { top: centerY, left: centerX };
}

function arrowOffset(
  spotlight: { left: number; width: number },
  tooltipPos: { left: number },
  tooltip: { width: number }
) {
  const center = spotlight.left + spotlight.width / 2;
  const offset = center - tooltipPos.left;
  return clamp(offset, 14, tooltip.width - 14);
}

function arrowOffsetVertical(
  spotlight: { top: number; height: number },
  tooltipPos: { top: number },
  tooltip: { height: number }
) {
  const center = spotlight.top + spotlight.height / 2;
  const offset = center - tooltipPos.top;
  return clamp(offset, 14, tooltip.height - 14);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
