"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNum } from "@/utils/format";
import { useProfile } from "@/hooks/use-fundamentals";

export default function ProfileTab({ symbol }: { symbol: string }) {
  const { data, loading, error } = useProfile(symbol);

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
        <div className="text-sm text-slate-600">No profile data.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Sector:</span>{" "}
              <span className="font-medium">{data.sector ?? "—"}</span>
            </div>
            <div>
              <span className="text-slate-500">Industry:</span>{" "}
              <span className="font-medium">{data.industry ?? "—"}</span>
            </div>
            <div>
              <span className="text-slate-500">Employees:</span>{" "}
              <span className="font-medium">
                {fmtNum(data.full_time_employees ?? undefined)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">HQ:</span>{" "}
              <span className="font-medium">
                {[data.city, data.state, data.country]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
          </div>
          <div className="text-sm">
            <div className="text-slate-500 text-xs mb-1">Business Summary</div>
            <p className="leading-relaxed whitespace-pre-wrap">
              {data.long_business_summary ?? "—"}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
