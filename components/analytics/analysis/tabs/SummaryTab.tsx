"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function SummaryTab({
  summary,
  sectionConfidence,
}: {
  summary?: string;
  sectionConfidence?: { news?: number; scenarios?: number; actions?: number };
}) {
  if (!summary) {
    return (
      <EmptyState
        icon={<Activity className="h-5 w-5" />}
        title="No summary yet"
        desc="Run a refresh to generate a portfolio narrative."
      />
    );
  }

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" /> Summary
      </h3>
      <p className="text-sm text-muted-foreground">{summary}</p>
      {sectionConfidence?.news != null && (
        <div className="text-[11px] text-muted-foreground">
          Confidence — News: {(sectionConfidence.news * 100).toFixed(0)}%
          {sectionConfidence.scenarios != null
            ? ` · Scenarios: ${(sectionConfidence.scenarios * 100).toFixed(0)}%`
            : ""}
          {sectionConfidence.actions != null
            ? ` · Actions: ${(sectionConfidence.actions * 100).toFixed(0)}%`
            : ""}
        </div>
      )}
    </section>
  );
}
