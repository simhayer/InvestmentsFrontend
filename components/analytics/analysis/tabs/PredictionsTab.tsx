import * as React from "react";
import type { PerformanceLayer } from "@/types/portfolio-ai";

export function PredictionsTab({ data }: { data: PerformanceLayer }) {
  const assets = data?.predictions?.assets ?? [];
  if (!assets.length) return <Empty msg="No predictions available." />;
  return (
    <div className="space-y-4">
      <div className="text-sm opacity-70">
        Window: {data.predictions.forecast_window}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {assets.map((a) => (
          <div key={a.symbol} className="rounded-xl border p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold">{a.symbol}</div>
              <div className="text-xs rounded-md px-2 py-0.5 bg-muted">
                {a.expected_direction} {a.expected_change_pct}%
              </div>
            </div>
            <p className="text-sm opacity-80">{a.rationale}</p>
            <div className="text-xs mt-2">
              Confidence: {(a.confidence * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
