"use client";

import * as React from "react";
import {
  Brain,
  Activity,
  ShieldCheck,
  Newspaper,
  Sparkles,
} from "lucide-react";

type Step = {
  icon: React.ReactNode;
  label: string;
  minMs?: number; // how long to hold this step (client-side)
};

const STEPS: Step[] = [
  {
    icon: <Activity className="h-4 w-4" />,
    label: "Crunching live quotes",
    minMs: 700,
  },
  {
    icon: <Newspaper className="h-4 w-4" />,
    label: "Scanning recent catalysts",
    minMs: 900,
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    label: "Scoring portfolio risks",
    minMs: 900,
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    label: "Composing AI insights",
    minMs: 900,
  },
];

const TIPS = [
  "Tip: You can refresh once per day — look for the 'Cached' badge.",
  "Hint: Try the 'Scenarios' tab to see bull/base/bear paths.",
  "Pro move: Click 'Actions' for quick, concrete next steps.",
  "FYI: We widen news windows if sources are sparse.",
];

function classNames(...cx: Array<string | false | undefined>) {
  return cx.filter(Boolean).join(" ");
}

export function PortfolioAnalyticsLoading({
  subtle = false,
  estimatedMs = 3500, // purely cosmetic; we’ll cap progress if response is faster/slower
}: {
  subtle?: boolean;
  estimatedMs?: number;
}) {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(8);
  const [tipIdx] = React.useState(() =>
    Math.floor(Math.random() * TIPS.length)
  );

  // cycle steps on a timer
  React.useEffect(() => {
    let mounted = true;
    let idx = 0;
    let handle: number;

    const tick = () => {
      if (!mounted) return;
      const next = (idx + 1) % STEPS.length;
      idx = next;
      setStepIdx(next);
      handle = window.setTimeout(tick, STEPS[next].minMs ?? 800);
    };

    handle = window.setTimeout(tick, STEPS[0].minMs ?? 800);
    return () => {
      mounted = false;
      window.clearTimeout(handle);
    };
  }, []);

  // animate progress bar (client-side estimate)
  React.useEffect(() => {
    let raf: number;
    const start = performance.now();
    const animate = (t: number) => {
      const elapsed = t - start;
      const pct = Math.min(
        95,
        Math.max(8, Math.round((elapsed / estimatedMs) * 100))
      );
      setProgress(pct);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [estimatedMs]);

  if (subtle) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-medium">Generating AI insights…</span>
          <span className="ml-auto tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {STEPS[stepIdx].icon}
            {STEPS[stepIdx].label}
          </span>
          <span className="ml-auto">{TIPS[tipIdx]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <p className="font-semibold">Analyzing your portfolio</p>
        <span className="ml-auto text-sm tabular-nums text-muted-foreground">
          {progress}%
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 grid gap-2 text-sm">
        {STEPS.map((s, i) => {
          const active = i === stepIdx;
          const done = i < stepIdx;
          return (
            <li
              key={i}
              className={classNames(
                "flex items-center gap-2 rounded-md px-2 py-1",
                active && "bg-primary/10",
                done && "text-foreground",
                !active && !done && "text-muted-foreground"
              )}
            >
              <span
                className={classNames(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full border",
                  done
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {s.icon}
              </span>
              <span>{s.label}</span>
              {active && (
                <span className="ml-2 animate-pulse text-xs text-muted-foreground">
                  in progress…
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 text-xs text-muted-foreground">{TIPS[tipIdx]}</div>
    </div>
  );
}
