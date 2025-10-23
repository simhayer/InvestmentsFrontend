// components/investment/price-chart.tsx
"use client";

import * as React from "react";
import {
  createChart,
  type IChartApi,
  type UTCTimestamp,
  type CandlestickData,
  type LineData,
  type AreaData,
  type ISeriesApi,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { type CandlePoint } from "@/types/market";

function toUTCTimestamp(t: string | number): UTCTimestamp {
  if (typeof t === "number") {
    return (t > 1e12 ? Math.floor(t / 1000) : t) as UTCTimestamp;
  }
  const ms = Date.parse(t);
  if (Number.isNaN(ms)) throw new Error(`Invalid time: ${t}`);
  return Math.floor(ms / 1000) as UTCTimestamp;
}

export type ChartType = "area" | "line" | "candle";

type SeriesRefs =
  | { type: "area"; ref: ISeriesApi<"Area"> }
  | { type: "line"; ref: ISeriesApi<"Line"> }
  | { type: "candle"; ref: ISeriesApi<"Candlestick"> }
  | null;

// ----- palettes (tuned to Tailwind default shades) -----
const LIGHT = {
  bg: "#ffffff",
  text: "#0f172a", // slate-900
  grid: "#e5e7eb", // gray-200
  crosshair: "#94a3b8", // slate-400
  // series
  areaLine: "#2563eb", // blue-600
  areaTop: "rgba(37, 99, 235, 0.22)",
  areaBottom: "rgba(37, 99, 235, 0.02)",
  line: "#0ea5e9", // sky-500
  up: "#10b981", // emerald-500
  down: "#ef4444", // red-500
};

const DARK = {
  bg: "#0b1220", // deep navy-like UI background
  text: "#e5e7eb", // gray-200
  grid: "#1f2a44", // muted navy grid
  crosshair: "#64748b", // slate-500
  // series
  areaLine: "#60a5fa", // blue-400
  areaTop: "rgba(96, 165, 250, 0.30)",
  areaBottom: "rgba(96, 165, 250, 0.06)",
  line: "#38bdf8", // sky-400
  up: "#34d399", // emerald-400
  down: "#f87171", // red-400
};

export function PriceChart({
  data,
  chartType = "area",
  height = 320,
}: {
  data: CandlePoint[];
  chartType?: ChartType;
  height?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<SeriesRefs>(null);
  const roRef = React.useRef<ResizeObserver | null>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? DARK : LIGHT;

  // Create chart once (mount/unmount)
  React.useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        attributionLogo: false,
        background: { color: theme.bg },
        textColor: theme.text,
      },
      grid: {
        vertLines: { color: theme.grid, visible: true },
        horzLines: { color: theme.grid, visible: true },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: theme.text,
        scaleMargins: { top: 0.3, bottom: 0.3 },
      },
      timeScale: {
        borderVisible: false,
        secondsVisible: false,
        timeVisible: true,
      },
      crosshair: {
        mode: 0, // default
        vertLine: {
          color: theme.crosshair,
          width: 1,
          style: 0,
          visible: true,
          labelBackgroundColor: theme.crosshair,
        },
        horzLine: {
          color: theme.crosshair,
          width: 1,
          style: 0,
          visible: true,
          labelBackgroundColor: theme.crosshair,
        },
      },
      watermark: { visible: false },
    });

    chartRef.current = chart;

    // Create series (one type at a time)
    if (chartType === "candle") {
      const s = chart.addCandlestickSeries({
        upColor: theme.up,
        downColor: theme.down,
        wickUpColor: theme.up,
        wickDownColor: theme.down,
        borderVisible: false,
      });
      seriesRef.current = { type: "candle", ref: s };
    } else if (chartType === "line") {
      const s = chart.addLineSeries({
        color: theme.line,
        lineWidth: 2,
      });
      seriesRef.current = { type: "line", ref: s };
    } else {
      const s = chart.addAreaSeries({
        lineColor: theme.areaLine,
        topColor: theme.areaTop,
        bottomColor: theme.areaBottom,
        lineWidth: 2,
      });
      seriesRef.current = { type: "area", ref: s };
    }

    // Initial data
    setSeriesData(seriesRef.current, data);

    // Fit
    chart.timeScale().fitContent();

    // Resize handling
    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    });
    ro.observe(containerRef.current);
    roRef.current = ro;

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      roRef.current = null;
    };
    // mount once for a given chartType/height (changing type re-creates series)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, height]);

  // Update series data when `data` changes (no re-mount)
  React.useEffect(() => {
    if (!seriesRef.current) return;
    setSeriesData(seriesRef.current, data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  // React to theme changes: apply colors live (no re-mount)
  React.useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;

    // chart palette
    chartRef.current.applyOptions({
      layout: { background: { color: theme.bg }, textColor: theme.text },
      grid: {
        vertLines: { color: theme.grid, visible: true },
        horzLines: { color: theme.grid, visible: true },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: theme.text,
        scaleMargins: { top: 0.3, bottom: 0.3 },
      },
      crosshair: {
        vertLine: {
          color: theme.crosshair,
          labelBackgroundColor: theme.crosshair,
        },
        horzLine: {
          color: theme.crosshair,
          labelBackgroundColor: theme.crosshair,
        },
      },
    });

    // series palette
    const s = seriesRef.current;
    if (s.type === "candle") {
      s.ref.applyOptions({
        upColor: theme.up,
        downColor: theme.down,
        wickUpColor: theme.up,
        wickDownColor: theme.down,
        borderVisible: false,
      });
    } else if (s.type === "line") {
      s.ref.applyOptions({ color: theme.line, lineWidth: 2 });
    } else {
      s.ref.applyOptions({
        lineColor: theme.areaLine,
        topColor: theme.areaTop,
        bottomColor: theme.areaBottom,
        lineWidth: 2,
      });
    }
  }, [resolvedTheme]); // re-run on theme flip

  return <div ref={containerRef} className="w-full rounded-md" />;
}

// --- helpers ---
function setSeriesData(series: SeriesRefs, data: CandlePoint[]) {
  if (!series) return;

  if (series.type === "candle") {
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
    series.ref.setData(candles);
  } else if (series.type === "line") {
    const points: LineData[] = data
      .map((r) => {
        try {
          return { time: toUTCTimestamp(r.t), value: r.c } as LineData;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as LineData[];
    series.ref.setData(points);
  } else {
    const points: AreaData[] = data
      .map((r) => {
        try {
          return { time: toUTCTimestamp(r.t), value: r.c } as AreaData;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as AreaData[];
    series.ref.setData(points);
  }
}

export default PriceChart;
