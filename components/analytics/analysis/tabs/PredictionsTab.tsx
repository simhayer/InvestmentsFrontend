import * as React from "react";
import type { PerformanceLayer } from "@/types/portfolio-ai";

export function PredictionsTab({ data }: { data: PerformanceLayer }) {
  const assets = data?.predictions?.assets ?? [];
  if (!assets.length) return <Empty msg="No predictions available." />;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-[0.08em] text-slate-500">
          Forecast window
        </div>
        <div className="text-sm text-slate-700">
          {data.predictions.forecast_window}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {assets.map((a) => {
          const up = a.expected_direction.toLowerCase() === "up";
          const chipColor = up
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-rose-50 text-rose-700 border-rose-200";
          return (
            <div
              key={a.symbol}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold text-slate-900">
                  {a.symbol}
                </div>
                <span
                  className={`text-xs rounded-full px-2.5 py-1 border ${chipColor}`}
                >
                  {a.expected_direction} {a.expected_change_pct}%
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {a.rationale}
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Confidence</span>
                  <span className="font-semibold text-slate-900">
                    {(a.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${
                      up ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, a.confidence * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
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
