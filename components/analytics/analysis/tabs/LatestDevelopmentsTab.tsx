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
          className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
        >
          <div className="text-sm font-semibold text-slate-900 mb-1">
            {n.headline}
          </div>
          <div className="text-xs text-slate-600 mb-1">
            {n.source} · {n.date}
          </div>
          <div className="text-sm text-slate-800 leading-relaxed">{n.impact}</div>
          <div className="text-xs mt-3 flex flex-wrap gap-1">
            {n.assets_affected.map((a) => (
              <span
                key={a}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700"
              >
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
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      {msg}
    </div>
  );
}
