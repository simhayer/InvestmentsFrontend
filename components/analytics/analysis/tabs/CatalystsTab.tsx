"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { CalendarDays } from "lucide-react";

type CatalystItem = {
  type?: string;
  description?: string;
  expected_direction?: "up" | "down" | "neutral";
  confidence?: number;
  assets_affected?: string[];
  magnitude_basis?: string;
  date?: string;
};

export function CatalystsTab({ items }: { items?: CatalystItem[] }) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-5 w-5" />}
        title="No upcoming catalysts"
        desc="Earnings dates and economic releases will show here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((c, idx) => (
        <li key={idx} className="rounded-lg border p-4 sm:p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium">
              {c.type ? `${c.type}: ` : ""}
              {c.description}
            </div>
            <div className="flex items-center gap-2">
              {c.expected_direction && (
                <Badge
                  variant={
                    c.expected_direction === "up"
                      ? "default"
                      : c.expected_direction === "down"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {c.expected_direction}
                </Badge>
              )}
              {typeof c.confidence === "number" && (
                <Badge variant="outline">
                  {(c.confidence * 100).toFixed(0)}% conf
                </Badge>
              )}
              {c.assets_affected?.length ? (
                <Badge variant="outline">{c.assets_affected.join(", ")}</Badge>
              ) : null}
            </div>
          </div>
          {c.magnitude_basis && (
            <p className="mt-1 text-sm text-muted-foreground">
              Basis: {c.magnitude_basis}
            </p>
          )}
          <div className="mt-2 text-xs text-muted-foreground">{c.date}</div>
        </li>
      ))}
    </ul>
  );
}
