import * as React from "react";
import type { NewsSentimentLayer } from "@/types/portfolio-ai";

export function NewsSentimentTab({ data }: { data: NewsSentimentLayer }) {
  if (!data) return <Empty msg="No news/sentiment available." />;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-3">
        <div className="text-sm font-medium mb-2">Overall Sentiment</div>
        <div className="text-sm">{data.sentiment.overall_sentiment}</div>
        <p className="text-sm opacity-80 mt-2">{data.sentiment.summary}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <div className="text-sm font-medium mb-2">Drivers</div>
          <ul className="text-sm space-y-2">
            {data.sentiment.drivers.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-xs mt-1 px-1.5 py-0.5 rounded bg-muted capitalize">
                  {d.tone}
                </span>
                <div>
                  <div className="font-medium">{d.theme}</div>
                  <div className="opacity-80">{d.impact}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm font-medium mb-2">Sources Considered</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {data.sentiment.sources_considered.map((s) => (
              <span key={s} className="px-2 py-1 rounded bg-muted">
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
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
