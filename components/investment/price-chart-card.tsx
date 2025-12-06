"use client";

import { useState } from "react";
import PriceChart, {
  type ChartType,
} from "@/components/investment/price-chart";
import { RANGE_PRESETS, type CandlePoint } from "@/types/market";
import { cn } from "@/lib/utils";

export default function PriceChartCard({
  candles,
  height = 320,
  r,
  setR,
  hideRangeControls = false,
}: {
  candles: CandlePoint[];
  height?: number;
  r: (typeof RANGE_PRESETS)[number];
  setR: (r: (typeof RANGE_PRESETS)[number]) => void;
  hideRangeControls?: boolean;
}) {
  const [type] = useState<ChartType>("area"); // "area" | "line" | "candle"

  return (
    <div className="rounded-2xl bg-gradient-to-b from-neutral-50 via-white to-neutral-100 ring-1 ring-neutral-200/80 px-4 py-4 sm:px-5 sm:py-5">
      {!hideRangeControls ? (
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-white px-1 py-1 ring-1 ring-neutral-200 shadow-sm">
            {RANGE_PRESETS.map((p) => {
              const active = p.label === r.label;
              return (
                <button
                  key={p.label}
                  onClick={() => setR(p)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-800/40"
                      : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {/* <div className="flex gap-2">
            {(["area", "line", "candle"] as ChartType[]).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={type === t ? "default" : "outline"}
                onClick={() => setType(t)}
              >
                {t}
              </Button>
            ))}
          </div> */}
        </div>
      ) : null}

      <div className="mt-2 sm:mt-3">
        <PriceChart data={candles} chartType={type} height={height} />
      </div>
    </div>
  );
}
