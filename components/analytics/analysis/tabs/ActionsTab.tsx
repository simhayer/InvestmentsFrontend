import * as React from "react";
import type { ActionItem } from "@/types/portfolio-ai";

export function ActionsTab({ data }: { data: ActionItem[] }) {
  if (!data?.length) return <Empty msg="No actions suggested." />;
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {data.map((a, i) => (
        <div key={i} className="rounded-xl border p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold">{a.title}</div>
            <div className="text-xs bg-muted rounded px-2 py-0.5 capitalize">
              {a.category.replaceAll("_", " ")}
            </div>
          </div>
          <div className="text-xs opacity-80 mb-2">
            Effort: {a.effort} · Impact: {a.impact} · Urgency: {a.urgency}
          </div>
          <p className="text-sm">{a.rationale}</p>
          <div className="text-xs mt-2 flex flex-wrap gap-1">
            {a.targets.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-muted">
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
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
