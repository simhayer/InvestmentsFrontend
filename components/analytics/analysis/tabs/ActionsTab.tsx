"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";
import { EmptyState } from "./EmptyState";
import type { ActionItem } from "@/types/portfolio-ai";

export function ActionsTab({ items }: { items?: ActionItem[] }) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<Target className="h-5 w-5" />}
        title="No action ideas"
        desc="We’ll surface concrete next steps as soon as we have them."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((a, idx) => (
        <li
          key={idx}
          className="flex items-start gap-4 p-4 sm:p-3 rounded-lg border"
        >
          <div className="text-primary mt-0.5">
            <Target className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-semibold">{a.title}</h4>
              <div className="flex items-center gap-2">
                {a.impact ? (
                  <Badge variant="secondary">impact: {a.impact}</Badge>
                ) : null}
                {a.urgency ? (
                  <Badge variant="secondary">urgency: {a.urgency}</Badge>
                ) : null}
                {a.effort ? (
                  <Badge variant="secondary">effort: {a.effort}</Badge>
                ) : null}
                {a.category ? (
                  <Badge variant="outline">{a.category}</Badge>
                ) : null}
              </div>
            </div>
            {a.rationale && (
              <p className="text-sm text-muted-foreground">{a.rationale}</p>
            )}
            {a.targets?.length ? (
              <div className="text-xs text-muted-foreground">
                Targets: {a.targets.join(", ")}
              </div>
            ) : null}
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              Go <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
