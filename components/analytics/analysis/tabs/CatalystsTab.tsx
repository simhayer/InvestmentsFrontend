import * as React from "react";
import type { CatalystItem } from "@/types/portfolio-ai";
import { catalystsSorted } from "@/utils/aiService";

export function CatalystsTab({ data }: { data: CatalystItem[] }) {
  const cats = catalystsSorted(data ?? []);
  if (!cats.length) return <Empty msg="No catalysts on deck." />;
  return (
    <div className="space-y-3">
      {cats.map((c, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {c.type.toUpperCase()} · {c.date}
            </div>
            <div className="text-xs rounded-full border border-slate-200 bg-slate-50 px-3 py-1 capitalize">
              {c.expected_direction}
            </div>
          </div>
          <div className="text-sm text-slate-800 mt-2 leading-relaxed">
            {c.description}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Magnitude: {c.magnitude_basis}
          </div>
          <div className="text-xs mt-3 flex flex-wrap gap-1">
            {c.assets_affected.map((a) => (
              <span
                key={a}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
