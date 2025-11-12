import * as React from "react";
import type { SummaryLayer } from "@/types/portfolio-ai";

export function SummaryTab({ data }: { data: SummaryLayer }) {
  if (!data) return <Empty msg="No summary available." />;
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
        {data.summary}
      </p>
      <div className="rounded-xl bg-muted p-3 text-xs">
        <div className="font-medium mb-1">Disclaimer</div>
        <p className="opacity-90">{data.disclaimer}</p>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Confidence by section</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(data.explainability.section_confidence).map(
            ([k, v]) => (
              <div key={k} className="rounded-lg border p-2">
                <div className="text-xs opacity-70">{k}</div>
                <div className="text-sm font-semibold">
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
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
