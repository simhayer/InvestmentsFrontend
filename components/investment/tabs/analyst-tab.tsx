"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtCurrency } from "@/utils/format";
import { useAnalyst } from "@/hooks/use-fundamentals";

export default function AnalystTab({ symbol }: { symbol: string }) {
  const { data, loading, error } = useAnalyst(symbol);

  return (
    <Card className="p-4">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : !data ? (
        <div className="text-sm text-slate-600">No analyst data.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-500 text-xs">Recommendation</div>
            <div className="font-medium capitalize">
              {data.recommendation_key ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-xs">Score (1=Strong Buy)</div>
            <div className="font-medium">{data.recommendation ?? "—"}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs">Target (Low)</div>
            <div className="font-medium">
              {fmtCurrency(data.price_target_low ?? undefined)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-xs">Target (Avg)</div>
            <div className="font-medium">
              {fmtCurrency(data.price_target_mean ?? undefined)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-xs">Target (High)</div>
            <div className="font-medium">
              {fmtCurrency(data.price_target_high ?? undefined)}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
