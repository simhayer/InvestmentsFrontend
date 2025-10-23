"use client";

import { useState } from "react";
import PriceChart, {
  type ChartType,
} from "@/components/investment/price-chart";
import { RANGE_PRESETS, type CandlePoint } from "@/types/market";
import { Button } from "@/components/ui/button";

export default function PriceChartCard({
  candles,
  height = 320,
  r,
  setR,
}: {
  candles: CandlePoint[];
  height?: number;
  r: (typeof RANGE_PRESETS)[number];
  setR: (r: (typeof RANGE_PRESETS)[number]) => void;
}) {
  const [type, setType] = useState<ChartType>("area"); // "area" | "line" | "candle"

  return (
    <div className="rounded pt-0 bg-background/50">
      <div className="flex items-center justify-between mb-2">
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
        {/* Range selector */}
        <div className="flex mt-3 ml-3">
          <div className="border rounded">
            {RANGE_PRESETS.map((p) => {
              const active = p.label === r.label;
              return (
                <button
                  key={p.label}
                  onClick={() => setR(p)}
                  className={`m-1 px-2 py-1 text-xs rounded ${
                    active ? "bg-slate-900 text-white border-slate-900" : ""
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <PriceChart data={candles} chartType={type} height={height} />
    </div>
  );
}
