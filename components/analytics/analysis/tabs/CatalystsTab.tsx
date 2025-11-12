import * as React from "react";
import type { CatalystItem } from "@/types/portfolio-ai";
import { catalystsSorted } from "@/utils/aiService";

export function CatalystsTab({ data }: { data: CatalystItem[] }) {
  const cats = catalystsSorted(data ?? []);
  if (!cats.length) return <Empty msg="No catalysts on deck." />;
  return (
    <div className="space-y-2">
      {cats.map((c, i) => (
        <div key={i} className="rounded-xl border p-3">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="text-sm font-medium">
              {c.type.toUpperCase()} · {c.date}
            </div>
            <div className="text-xs bg-muted rounded px-2 py-0.5">
              {c.expected_direction}
            </div>
          </div>
          <div className="text-sm mt-1">{c.description}</div>
          <div className="text-xs opacity-80 mt-1">
            Magnitude: {c.magnitude_basis}
          </div>
          <div className="text-xs mt-2 flex flex-wrap gap-1">
            {c.assets_affected.map((a) => (
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
