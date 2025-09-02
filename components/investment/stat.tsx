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
    <div>
      <div className="text-slate-500 text-xs">{label}</div>
      <div className="font-medium" title={hint}>
        {value}
      </div>
    </div>
  );
}
