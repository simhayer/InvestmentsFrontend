"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { AlertTriangle } from "lucide-react";

type AlertItem = {
  condition?: string;
  status?: "triggered" | "ok" | string;
};

export function AlertsTab({ items }: { items?: AlertItem[] }) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="All clear"
        desc="No alerts right now. We’ll flag anything noteworthy."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((al, idx) => (
        <li key={idx} className="rounded-lg border p-4 sm:p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{al.condition}</div>
            <Badge
              variant={
                al.status === "triggered"
                  ? "destructive"
                  : al.status === "ok"
                  ? "secondary"
                  : "outline"
              }
            >
              {al.status || "ok"}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
