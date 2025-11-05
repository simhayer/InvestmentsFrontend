"use client";

import * as React from "react";
import { EmptyState } from "./EmptyState";
import { Target } from "lucide-react";

type Scenarios = {
  bull?: string;
  base?: string;
  bear?: string;
  probabilities?: { bull?: number; base?: number; bear?: number };
};

export function ScenariosTab({ scenarios }: { scenarios?: Scenarios }) {
  const has =
    !!scenarios &&
    (Boolean(scenarios.bull) ||
      Boolean(scenarios.base) ||
      Boolean(scenarios.bear));

  if (!has) {
    return (
      <EmptyState
        icon={<Target className="h-5 w-5" />}
        title="No scenarios yet"
        desc="Once we have enough signal, we’ll outline bull/base/bear paths."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {scenarios?.bull && (
        <div className="rounded-lg border p-4 sm:p-3">
          <div className="font-semibold">Bull</div>
          <p className="mt-1 text-sm text-muted-foreground">{scenarios.bull}</p>
          {typeof scenarios?.probabilities?.bull === "number" && (
            <div className="mt-2 text-xs text-muted-foreground">
              P(Bull): {(scenarios.probabilities.bull * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )}
      {scenarios?.base && (
        <div className="rounded-lg border p-4 sm:p-3">
          <div className="font-semibold">Base</div>
          <p className="mt-1 text-sm text-muted-foreground">{scenarios.base}</p>
          {typeof scenarios?.probabilities?.base === "number" && (
            <div className="mt-2 text-xs text-muted-foreground">
              P(Base): {(scenarios.probabilities.base * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )}
      {scenarios?.bear && (
        <div className="rounded-lg border p-4 sm:p-3">
          <div className="font-semibold">Bear</div>
          <p className="mt-1 text-sm text-muted-foreground">{scenarios.bear}</p>
          {typeof scenarios?.probabilities?.bear === "number" && (
            <div className="mt-2 text-xs text-muted-foreground">
              P(Bear): {(scenarios.probabilities.bear * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
