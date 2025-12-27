// components/portfolio/_bits.tsx
"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";

export function PriceStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<
    string,
    { label: string; variant: "secondary" | "outline" | "destructive" }
  > = {
    live: { label: "Live prices", variant: "secondary" },
    mixed: { label: "Mixed prices", variant: "outline" },
    unavailable: { label: "Prices unavailable", variant: "destructive" },
  };
  const v = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={v.variant}>{v.label}</Badge>;
}

export function StackedBar({
  items, // [{ key, weight }]
  height = 10,
  rounded = true,
}: {
  items: { key: string; weight: number }[];
  height?: number;
  rounded?: boolean;
}) {
  const total = items.reduce((s, i) => s + Math.max(0, i.weight || 0), 0) || 1;
  return (
    <div
      className="w-full overflow-hidden bg-muted"
      style={{ height, borderRadius: rounded ? 999 : 0 }}
    >
      <div className="flex h-full">
        {items.map((i, idx) => (
          <div
            key={`${i.key}-${idx}`}
            className="h-full"
            title={`${i.key}: ${i.weight.toFixed(2)}%`}
            style={{
              width: `${(Math.max(0, i.weight) / total) * 100}%`,
              opacity: 0.9,
              // simple deterministic color
              background: [
                "var(--primary)",
                "var(--muted-foreground)",
                "#10b981",
                "#f59e0b",
                "#3b82f6",
                "#ef4444",
              ][idx % 6],
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function KeyVal({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  const keyTitle = typeof k === "string" ? k : undefined;
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span
        className="min-w-0 flex-1 truncate text-muted-foreground"
        title={keyTitle}
      >
        {k}
      </span>
      <span className="shrink-0 font-medium">{v}</span>
    </div>
  );
}

export function TimeAgo({ iso }: { iso?: string }) {
  if (!iso) return <span className="text-muted-foreground">—</span>;
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const txt =
    days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : `${mins}m ago`;
  return <span title={d.toLocaleString()}>{txt}</span>;
}
