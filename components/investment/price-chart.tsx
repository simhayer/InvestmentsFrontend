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

// ----- palettes (tuned to Tailwind-like shades) -----
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
  bg: "#0b1220",
  text: "#e5e7eb", // gray-200
  grid: "#1f2a44",
  crosshair: "#64748b", // slate-500
  // series
  areaLine: "#60a5fa", // blue-400
  areaTop: "rgba(96, 165, 250, 0.30)",
  areaBottom: "rgba(96, 165, 250, 0.06)",
  line: "#38bdf8", // sky-400
  up: "#34d399", // emerald-400
  down: "#f87171", // red-400
};

// Compact number formatter for axis labels / tooltip
const compact = (n: number) =>
  n >= 1e12
    ? `${(n / 1e12).toFixed(2)}T`
    : n >= 1e9
    ? `${(n / 1e9).toFixed(2)}B`
    : n >= 1e6
    ? `${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
    ? `${(n / 1e3).toFixed(1)}K`
    : n.toFixed(n >= 100 ? 1 : 2);

export function PriceChart({
  data,
  chartType = "area",
  height = 320,
  /** Hide Y axis numbers by default for minimal look */
  showYAxis = true,
  /** Hide grid lines by default */
  showGrid = false,
  /** Use compact price labels when Y axis is visible */
  compactYAxis = true,
}: {
  data: CandlePoint[];
  chartType?: ChartType;
  height?: number;
  showYAxis?: boolean;
  showGrid?: boolean;
  compactYAxis?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<SeriesRefs>(null);
  const roRef = React.useRef<ResizeObserver | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? DARK : LIGHT;

  // Create chart once (mount/unmount). Recreate when chartType/height/showYAxis/showGrid change.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure container is relatively positioned for absolute tooltip
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    const chart = createChart(container, {
      height,
      layout: {
        attributionLogo: false,
        background: { color: theme.bg },
        textColor: theme.text,
      },
      grid: {
        vertLines: { color: theme.grid, visible: showGrid },
        horzLines: { color: theme.grid, visible: showGrid },
      },
      rightPriceScale: showYAxis
        ? {
            visible: true,
            borderVisible: false,
            textColor: theme.text,
            scaleMargins: { top: 0.3, bottom: 0.3 },
          }
        : {
            visible: false,
          },
      timeScale: {
        borderVisible: false,
        secondsVisible: false,
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },
      // Hide crosshair lines (we'll use a tooltip instead)
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
        mode: 0,
      },
      // Disable user interactions (no scroll/zoom)
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
        horzTouchDrag: false,
        vertTouchDrag: false,
      },
      handleScale: {
        mouseWheel: false,
        pinch: false,
        axisPressedMouseMove: false,
        axisDoubleClickReset: false,
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
        priceLineVisible: false,
        lastValueVisible: false,
      });
      // optional compact y-axis formatting if visible
      if (showYAxis && compactYAxis) {
        s.applyOptions({
          priceFormat: {
            type: "custom",
            formatter: (v: number) => compact(v),
            minMove: 0.01,
          },
        });
      }
      seriesRef.current = { type: "candle", ref: s };
    } else if (chartType === "line") {
      const s = chart.addLineSeries({
        color: theme.line,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      if (showYAxis && compactYAxis) {
        s.applyOptions({
          priceFormat: {
            type: "custom",
            formatter: (v: number) => compact(v),
            minMove: 0.01,
          },
        });
      }
      seriesRef.current = { type: "line", ref: s };
    } else {
      const s = chart.addAreaSeries({
        lineColor: theme.areaLine,
        topColor: theme.areaTop,
        bottomColor: theme.areaBottom,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      if (showYAxis && compactYAxis) {
        s.applyOptions({
          priceFormat: {
            type: "custom",
            formatter: (v: number) => compact(v),
            minMove: 0.01,
          },
        });
      }
      seriesRef.current = { type: "area", ref: s };
    }

    // Initial data
    setSeriesData(seriesRef.current, data);

    // Fit to content
    chart.timeScale().fitContent();

    // Tooltip setup
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.pointerEvents = "none";
    tooltip.style.zIndex = "10";
    tooltip.style.padding = "6px 8px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
    tooltip.style.fontSize = "12px";
    tooltip.style.lineHeight = "16px";
    tooltip.style.transform = "translate(-50%, -120%)";
    // theme aware
    applyTooltipTheme(tooltip, resolvedTheme);
    tooltip.style.display = "none";
    container.appendChild(tooltip);
    tooltipRef.current = tooltip;

    const fmtDate = (t: number) => {
      const d = new Date(t * 1000);
      return d.toLocaleDateString(undefined, {
        year: "2-digit",
        month: "short",
        day: "2-digit",
      });
    };

    chart.subscribeCrosshairMove((p) => {
      // Hide tooltip if outside chart or we don’t have data
      if (!p.point || !p.time || !seriesRef.current) {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
        return;
      }

      const priceObj = p.seriesData.get(seriesRef.current.ref as any);
      const value =
        seriesRef.current.type === "candle"
          ? priceObj && "close" in priceObj
            ? (priceObj.close as number)
            : undefined
          : priceObj && "value" in priceObj
          ? (priceObj.value as number)
          : undefined;

      if (value == null) {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
        return;
      }

      const { x, y } = p.point;
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${x}px`;
        tooltipRef.current.style.top = `${y}px`;
        tooltipRef.current.innerHTML = `
          <div style="font-weight:600">${compact(value)}</div>
          <div style="opacity:0.8">${fmtDate(p.time as number)}</div>
        `;
        tooltipRef.current.style.display = "block";
      }
    });

    // Hide tooltip when mouse leaves the container
    const hideTooltip = () => {
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    };
    container.addEventListener("mouseleave", hideTooltip);

    // Resize handling
    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    });
    ro.observe(container);
    roRef.current = ro;

    // Cleanup
    return () => {
      container.removeEventListener("mouseleave", hideTooltip);
      if (roRef.current) {
        roRef.current.disconnect();
        roRef.current = null;
      }
      if (tooltipRef.current && tooltipRef.current.parentElement) {
        tooltipRef.current.parentElement.removeChild(tooltipRef.current);
      }
      tooltipRef.current = null;
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, height, showYAxis, showGrid]);

  // Update series data when `data` changes (no re-mount)
  React.useEffect(() => {
    if (!seriesRef.current) return;
    setSeriesData(seriesRef.current, data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  // React to theme changes: apply colors live (no re-mount)
  React.useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;

    chartRef.current.applyOptions({
      layout: { background: { color: theme.bg }, textColor: theme.text },
      grid: {
        vertLines: { color: theme.grid, visible: false }, // keep minimal on theme change
        horzLines: { color: theme.grid, visible: false },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: theme.text,
        scaleMargins: { top: 0.3, bottom: 0.3 },
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
        horzTouchDrag: false,
        vertTouchDrag: false,
      },
      handleScale: {
        mouseWheel: false,
        pinch: false,
        axisPressedMouseMove: false,
        axisDoubleClickReset: false,
      },
      timeScale: {
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },
    });

    // update series palette
    const s = seriesRef.current;
    if (s.type === "candle") {
      s.ref.applyOptions({
        upColor: theme.up,
        downColor: theme.down,
        wickUpColor: theme.up,
        wickDownColor: theme.down,
        borderVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
      });
    } else if (s.type === "line") {
      s.ref.applyOptions({
        color: theme.line,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
    } else {
      s.ref.applyOptions({
        lineColor: theme.areaLine,
        topColor: theme.areaTop,
        bottomColor: theme.areaBottom,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
    }

    // theme tooltip
    if (tooltipRef.current)
      applyTooltipTheme(tooltipRef.current, resolvedTheme);
  }, [resolvedTheme]);

  return <div ref={containerRef} className="w-full rounded-md" />;
}

// --- helpers ---
function applyTooltipTheme(el: HTMLDivElement, themeName?: string) {
  const isDark = themeName === "dark";
  el.style.background = isDark
    ? "rgba(15,23,42,0.75)"
    : "rgba(255,255,255,0.85)";
  el.style.color = isDark ? "#e5e7eb" : "#0f172a";
  el.style.backdropFilter = "blur(6px)";
}

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
