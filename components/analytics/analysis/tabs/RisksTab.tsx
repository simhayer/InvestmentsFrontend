"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { ShieldAlert } from "lucide-react";

type RiskItem = {
  risk?: string;
  assets_affected?: string[];
  why_it_matters?: string;
  monitor?: string;
};

export function RisksTab({ items }: { items?: RiskItem[] }) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-5 w-5" />}
        title="No risks identified"
        desc="Key portfolio risks will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((r, idx) => (
        <li key={idx} className="rounded-lg border p-4 sm:p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium">{r.risk}</div>
            {r.assets_affected?.length ? (
              <Badge variant="outline">{r.assets_affected.join(", ")}</Badge>
            ) : null}
          </div>
          {(r.why_it_matters || r.monitor) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {r.why_it_matters ? <span>{r.why_it_matters} </span> : null}
              {r.monitor ? <span>· Monitor: {r.monitor}</span> : null}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
