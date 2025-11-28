import * as React from "react";
import type { ActionItem } from "@/types/portfolio-ai";

export function ActionsTab({ data }: { data: ActionItem[] }) {
  if (!data?.length) return <Empty msg="No actions suggested." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.map((a, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {a.title}
            </div>
            <div className="text-xs rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 capitalize">
              {a.category.replaceAll("_", " ")}
            </div>
          </div>
          <div className="text-xs text-slate-600 mb-2">
            Effort: {a.effort} · Impact: {a.impact} · Urgency: {a.urgency}
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">
            {a.rationale}
          </p>
          <div className="text-xs mt-3 flex flex-wrap gap-1">
            {a.targets.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      {msg}
    </div>
  );
}
