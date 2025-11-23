import * as React from "react";

export function RisksTab({
  data,
}: {
  data: Array<{
    risk: string;
    monitor: string;
    why_it_matters: string;
    assets_affected: string[];
  }>;
}) {
  if (!data?.length) return <Empty msg="No explicit risks reported." />;
  return (
    <div className="space-y-3">
      {data.map((r, i) => (
        <div
          key={i}
          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm"
        >
          <div className="text-sm font-semibold text-amber-900">{r.risk}</div>
          <div className="text-sm text-amber-900/90 mt-2 leading-relaxed">
            Why it matters: {r.why_it_matters}
          </div>
          <div className="text-sm text-amber-900/90 mt-1">Monitor: {r.monitor}</div>
          <div className="text-xs mt-3 flex flex-wrap gap-1">
            {r.assets_affected.map((a) => (
              <span
                key={a}
                className="rounded-full border border-amber-200 bg-white/60 px-2.5 py-1 text-amber-900"
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
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      {msg}
    </div>
  );
}
