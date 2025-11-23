import * as React from "react";
import type { SummaryLayer } from "@/types/portfolio-ai";

export function SummaryTab({ data }: { data: SummaryLayer }) {
  if (!data) return <Empty msg="No summary available." />;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500 mb-2">
          Portfolio narrative
        </div>
        <p className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">
          {data.summary}
        </p>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
          Disclaimer
        </div>
        <p className="text-sm text-amber-900">{data.disclaimer}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-[0.08em] text-slate-500 mb-2">
          Confidence by section
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(data.explainability.section_confidence).map(
            ([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2"
              >
                <div className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
                  {k.replace(/_/g, " ")}
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {(v * 100).toFixed(0)}%
                </div>
              </div>
            )
          )}
        </div>
      </div>
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
