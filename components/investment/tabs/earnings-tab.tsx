"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtPct } from "@/utils/format";
import { useEarnings } from "@/hooks/use-fundamentals";

export default function EarningsTab({ symbol }: { symbol: string }) {
  const { data, loading, error } = useEarnings(symbol);

  return (
    <Card className="p-0 overflow-x-auto">
      {loading ? (
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600">{error}</div>
      ) : !data || data.history.length === 0 ? (
        <div className="p-4 text-sm text-slate-600">No earnings data.</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Period</th>
              <th className="text-right px-4 py-2">Actual EPS</th>
              <th className="text-right px-4 py-2">Estimate EPS</th>
              <th className="text-right px-4 py-2">Surprise</th>
            </tr>
          </thead>
          <tbody>
            {data.history.slice(0, 8).map((r, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-4 py-2">{r.period || r.date}</td>
                <td className="px-4 py-2 text-right">{r.actual ?? "—"}</td>
                <td className="px-4 py-2 text-right">{r.estimate ?? "—"}</td>
                <td className="px-4 py-2 text-right">
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
