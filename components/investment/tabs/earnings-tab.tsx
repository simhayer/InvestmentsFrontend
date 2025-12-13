"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtPct } from "@/utils/format";
import { useEarnings } from "@/hooks/use-fundamentals";

export default function EarningsTab({ symbol }: { symbol: string }) {
  const { data, loading, error } = useEarnings(symbol);

  return (
    <Card className="p-0 overflow-x-auto rounded-2xl border border-neutral-200/70 shadow-sm">
      {loading ? (
        <div className="p-5 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : error ? (
        <div className="p-5 text-sm text-rose-600">{error}</div>
      ) : !data || data.history.length === 0 ? (
        <div className="p-5 text-sm text-neutral-600">No earnings data.</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Period</th>
              <th className="text-right px-4 py-3 font-semibold">Actual EPS</th>
              <th className="text-right px-4 py-3 font-semibold">Estimate EPS</th>
              <th className="text-right px-4 py-3 font-semibold">Surprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.history.slice(0, 8).map((r, i) => (
              <tr key={i} className="even:bg-neutral-50/60">
                <td className="px-4 py-3 text-neutral-800">{r.period || r.date}</td>
                <td className="px-4 py-3 text-right text-neutral-800">
                  {r.actual ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-neutral-800">
                  {r.estimate ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-neutral-800">
                  {r.surprisePct == null ? "—" : fmtPct(r.surprisePct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
