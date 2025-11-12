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
        <div key={i} className="rounded-xl border p-3">
          <div className="text-sm font-semibold">{r.risk}</div>
          <div className="text-sm opacity-80 mt-1">
            Why it matters: {r.why_it_matters}
          </div>
          <div className="text-sm mt-1">Monitor: {r.monitor}</div>
          <div className="text-xs mt-2 flex flex-wrap gap-1">
            {r.assets_affected.map((a) => (
              <span key={a} className="px-2 py-0.5 rounded bg-muted">
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
