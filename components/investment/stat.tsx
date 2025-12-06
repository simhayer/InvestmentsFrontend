"use client";
import React from "react";

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </div>
      <div className="text-lg font-semibold text-neutral-900" title={hint}>
        {value}
      </div>
    </div>
  );
}
