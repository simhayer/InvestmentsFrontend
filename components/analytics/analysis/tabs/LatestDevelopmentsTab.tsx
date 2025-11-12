import * as React from "react";
import type { LatestDevelopmentItem } from "@/types/portfolio-ai";
import { latestSorted } from "@/utils/aiService";

export function LatestDevelopmentsTab({
  data,
}: {
  data: LatestDevelopmentItem[];
}) {
  const items = latestSorted(data ?? []);
  if (!items.length) return <Empty msg="No developments yet." />;
  return (
    <div className="space-y-3">
      {items.map((n, i) => (
        <a
          key={i}
          href={n.url}
          target="_blank"
          rel="noreferrer noopener"
          className="block rounded-xl border p-3 hover:bg-muted/50"
        >
          <div className="text-sm font-medium mb-1">{n.headline}</div>
          <div className="text-xs opacity-70 mb-1">
            {n.source} · {n.date}
          </div>
          <div className="text-sm opacity-90">{n.impact}</div>
          <div className="text-xs mt-2 flex flex-wrap gap-1">
            {n.assets_affected.map((a) => (
              <span key={a} className="px-2 py-0.5 rounded bg-muted">
                {a}
              </span>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
