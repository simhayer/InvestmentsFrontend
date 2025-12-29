"use client";

import { PriceChart } from "@/components/investment/price-chart";
import { type CandlePoint, RANGE_PRESETS } from "@/types/market";

export default function PriceChartCard({
  candles,
  height = 320,
}: {
  candles: CandlePoint[];
  height?: number;
  r: (typeof RANGE_PRESETS)[number];
  setR: (r: (typeof RANGE_PRESETS)[number]) => void;
  hideRangeControls?: boolean;
}) {
  return (
    <div className="w-full h-full">
      {candles.length > 0 ? (
        <PriceChart data={candles} height={height} />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
          No historical data available for this range
        </div>
      )}
    </div>
  );
}
