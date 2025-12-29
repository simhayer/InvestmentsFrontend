"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  return (
    <Badge
      variant={v.variant}
      className="rounded-full px-2.5 py-0 text-[10px] font-bold uppercase tracking-wider"
    >
      {v.label}
    </Badge>
  );
}

/**
 * A sleek, segmented bar showing distribution.
 * Updated with a more professional financial color palette.
 */
export function StackedBar({
  items,
  height = 8,
  rounded = true,
}: {
  items: { key: string; weight: number }[];
  height?: number;
  rounded?: boolean;
}) {
  const total = items.reduce((s, i) => s + Math.max(0, i.weight || 0), 0) || 1;

  // Professional financial palette: Indigo, Emerald, Amber, Blue, Slate, Rose
  const colors = [
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#3b82f6", // Blue
    "#64748b", // Slate
    "#f43f5e", // Rose
  ];

  return (
    <div
      className="w-full overflow-hidden bg-neutral-100 ring-1 ring-inset ring-black/5"
      style={{ height, borderRadius: rounded ? 999 : 4 }}
    >
      <div className="flex h-full">
        {items.map((i, idx) => {
          const widthPct = (Math.max(0, i.weight) / total) * 100;
          if (widthPct < 0.1) return null; // Don't render tiny slivers

          return (
            <div
              key={`${i.key}-${idx}`}
              className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
              title={`${i.key}: ${i.weight.toFixed(2)}%`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: colors[idx % colors.length],
                borderRight:
                  idx < items.length - 1
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function KeyVal({
  k,
  v,
  className,
}: {
  k: React.ReactNode;
  v: React.ReactNode;
  className?: string;
}) {
  const keyTitle = typeof k === "string" ? k : undefined;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 text-xs",
        className
      )}
    >
      <span
        className="min-w-0 flex-1 truncate text-neutral-500 font-medium"
        title={keyTitle}
      >
        {k}
      </span>
      <span className="shrink-0 font-semibold text-neutral-900">{v}</span>
    </div>
  );
}

export function TimeAgo({ iso }: { iso?: string }) {
  if (!iso) return <span className="text-neutral-400">—</span>;

  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  let txt = "";
  if (days > 0) txt = `${days}d ago`;
  else if (hours > 0) txt = `${hours}h ago`;
  else if (mins > 0) txt = `${mins}m ago`;
  else txt = "just now";

  return (
    <span className="font-medium text-neutral-500" title={d.toLocaleString()}>
      {txt}
    </span>
  );
}
