"use client";

import { useState } from "react";
import PriceChart, {
  type ChartType,
} from "@/components/investment/price-chart";
import { type CandlePoint } from "@/types/market";
import { Button } from "@/components/ui/button";

export default function PriceChartCard({
  candles,
  height = 320,
}: {
  candles: CandlePoint[];
  height?: number;
}) {
  const [type, setType] = useState<ChartType>("area"); // "area" | "line" | "candle"

  return (
    <div className="rounded border p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Price</h3>
        <div className="flex gap-2">
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
        </div>
      </div>

      <PriceChart data={candles} chartType={type} height={height} />
    </div>
  );
}
