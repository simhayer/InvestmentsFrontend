// components/investment/price-chart.tsx
"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
  type LineData,
  type AreaData,
} from "lightweight-charts";
import { type CandlePoint } from "@/types/market";

function toUTCTimestamp(t: string | number): UTCTimestamp {
  if (typeof t === "number") {
    // if ms, convert to sec
    return (t > 1e12 ? Math.floor(t / 1000) : t) as UTCTimestamp;
  }
  const ms = Date.parse(t);
  if (Number.isNaN(ms)) throw new Error(`Invalid time: ${t}`);
  return Math.floor(ms / 1000) as UTCTimestamp;
}

export type ChartType = "area" | "line" | "candle";

export function PriceChart({
  data,
  chartType = "area", // default: smooth overview
  height = 320,
}: {
  data: CandlePoint[];
  chartType?: ChartType;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        attributionLogo: false,
        textColor: "#222",
        background: { color: "#fff" },
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      crosshair: { mode: 0 },
      watermark: { visible: false },
    });
    chartRef.current = chart;

    // Build series based on chartType
    if (chartType === "candle") {
      const series = chart.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        borderVisible: false,
      });
      const candles: CandlestickData[] = data
        .map((r) => {
          try {
            return {
              time: toUTCTimestamp(r.t),
              open: r.o,
              high: r.h,
              low: r.l,
              close: r.c,
            } as CandlestickData;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as CandlestickData[];
      series.setData(candles);
    } else if (chartType === "line") {
      const series = chart.addLineSeries();
      const points: LineData[] = data
        .map((r) => {
          try {
            return { time: toUTCTimestamp(r.t), value: r.c } as LineData;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as LineData[];
      series.setData(points);
    } else {
      // "area"
      const series = chart.addAreaSeries({
        lineWidth: 2,
        topColor: "rgba(37, 99, 235, 0.2)",
        bottomColor: "rgba(37, 99, 235, 0.0)",
      });
      const points: AreaData[] = data
        .map((r) => {
          try {
            return { time: toUTCTimestamp(r.t), value: r.c } as AreaData;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as AreaData[];
      series.setData(points);
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height, chartType]);

  return <div ref={containerRef} className="w-full" />;
}

export default PriceChart;
