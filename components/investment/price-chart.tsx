"use client";

import * as React from "react";
import {
  createChart,
  type IChartApi,
  type UTCTimestamp,
  type ISeriesApi,
  CrosshairMode,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { type CandlePoint } from "@/types/market";

function toUTCTimestamp(t: string | number): UTCTimestamp {
  if (typeof t === "number")
    return (t > 1e12 ? Math.floor(t / 1000) : t) as UTCTimestamp;
  const ms = Date.parse(t);
  return Math.floor(ms / 1000) as UTCTimestamp;
}

export function PriceChart({
  data,
  height = 450,
}: {
  data: CandlePoint[];
  height?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const areaSeriesRef = React.useRef<ISeriesApi<"Area"> | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);
  const { resolvedTheme } = useTheme();

  // 1. Initialize Chart (Only Once)
  React.useEffect(() => {
    if (!containerRef.current) return;

    const isDark = resolvedTheme === "dark";
    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: "transparent" },
        textColor: isDark ? "#71717a" : "#94a3b8",
        fontFamily: "Geist Mono, Inter, sans-serif",
        attributionLogo: false, // Removes TradingView Logo
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: isDark ? "#18181b" : "#f1f5f9" },
      },
      handleScroll: false,
      handleScale: false,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    });

    const areaSeries = chart.addAreaSeries({
      lineWidth: 2,
      priceLineVisible: false,
    });

    const volumeSeries = chart.addHistogramSeries({
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current?.clientWidth || 0 });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [resolvedTheme, height]);

  // 2. Update Data (Instant Caching/Transition)
  React.useEffect(() => {
    if (
      !chartRef.current ||
      !areaSeriesRef.current ||
      !volumeSeriesRef.current ||
      !data.length
    )
      return;

    const isPositive = data[data.length - 1].c >= data[0].c;
    const mainColor = isPositive ? "#10b981" : "#f43f5e";

    // Update Series Styles dynamically based on trend
    areaSeriesRef.current.applyOptions({
      lineColor: mainColor,
      topColor: isPositive
        ? "rgba(16, 185, 129, 0.1)"
        : "rgba(244, 63, 94, 0.1)",
      bottomColor: "transparent",
    });

    // Set the Data
    areaSeriesRef.current.setData(
      data.map((p) => ({
        time: toUTCTimestamp(p.t),
        value: p.c,
      }))
    );

    volumeSeriesRef.current.setData(
      data.map((p) => ({
        time: toUTCTimestamp(p.t),
        value: p.v || 0,
        color:
          p.c >= p.o ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
      }))
    );

    // Fit content smoothly
    chartRef.current.timeScale().fitContent();
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      ref={containerRef}
      className="w-full"
    />
  );
}
