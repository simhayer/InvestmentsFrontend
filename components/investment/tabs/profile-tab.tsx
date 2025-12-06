"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNum } from "@/utils/format";
import { useProfile } from "@/hooks/use-fundamentals";

export default function ProfileTab({ symbol }: { symbol: string }) {
  const { data, loading, error } = useProfile(symbol);

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
        <div className="text-sm text-neutral-600">No profile data.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <ProfileRow label="Sector" value={data.sector ?? "—"} />
            <ProfileRow label="Industry" value={data.industry ?? "—"} />
            <ProfileRow
              label="Employees"
              value={fmtNum(data.full_time_employees ?? undefined)}
            />
            <ProfileRow
              label="HQ"
              value={
                [data.city, data.state, data.country].filter(Boolean).join(", ") ||
                "—"
              }
            />
          </div>
          <div className="rounded-2xl bg-neutral-50/70 p-4 text-sm ring-1 ring-neutral-200/80">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-2">
              Business Summary
            </div>
            <p className="leading-relaxed whitespace-pre-wrap text-neutral-800">
              {data.long_business_summary ?? "—"}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-neutral-50/70 px-4 py-3 ring-1 ring-neutral-200/80">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}
