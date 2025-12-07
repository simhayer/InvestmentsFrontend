import * as React from "react";
import type { NewsSentimentLayer } from "@/types/portfolio-ai";

export function NewsSentimentTab({ data }: { data: NewsSentimentLayer }) {
  if (!data || !data.sentiment) return <Empty msg="No news/sentiment available." />;

  const sentiment = data.sentiment;
  const drivers = sentiment.drivers || [];
  const sources = sentiment.sources_considered || [];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
              Overall sentiment
            </p>
            <p className="text-sm text-slate-700">
              {sentiment.summary || "No summary available."}
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800 capitalize">
            {sentiment.overall_sentiment || "neutral"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900 mb-2">
            Drivers
          </div>
          <ul className="space-y-3 text-sm">
            {drivers.map((d, i) => (
              <li
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    {d.theme}
                  </span>
                  <span className="text-xs rounded-full px-2 py-0.5 bg-slate-900 text-white capitalize">
                    {d.tone}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {d.impact}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900 mb-2">
            Sources Considered
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {sources.map((s) => (
              <span
                key={s}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700"
              >
                {s}
              </span>
            ))}
          </div>
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
