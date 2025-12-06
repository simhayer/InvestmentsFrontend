"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtCurrency } from "@/utils/format";
import { useAnalyst } from "@/hooks/use-fundamentals";

export default function AnalystTab({ symbol }: { symbol: string }) {
  const { data, loading, error } = useAnalyst(symbol);

  return (
    <Card className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : error ? (
        <div className="text-sm text-rose-600">{error}</div>
      ) : !data ? (
        <div className="text-sm text-neutral-600">No analyst data.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <StatBlock
            label="Recommendation"
            value={data.recommendation_key ?? "—"}
            emphasis
          />
          <StatBlock
            label="Score (1=Strong Buy)"
            value={data.recommendation ?? "—"}
          />
          <StatBlock
            label="Target (Low)"
            value={fmtCurrency(data.price_target_low ?? undefined)}
          />
          <StatBlock
            label="Target (Avg)"
            value={fmtCurrency(data.price_target_mean ?? undefined)}
          />
          <StatBlock
            label="Target (High)"
            value={fmtCurrency(data.price_target_high ?? undefined)}
          />
        </div>
      )}
    </Card>
  );
}

function StatBlock({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </div>
      <div
        className={emphasis ? "text-lg font-semibold text-neutral-900" : "text-neutral-800 font-medium"}
      >
        {value}
      </div>
    </div>
  );
}
