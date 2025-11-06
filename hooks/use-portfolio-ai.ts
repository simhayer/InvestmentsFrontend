// app/hooks/use-portfolio-ai.ts
"use client";

import {
  PerformanceAnalysis,
  PredictionsBlock,
  SentimentBlock,
  PortfolioAiData,
  LatestDevelopment,
  Catalyst,
  Scenarios,
  ActionItem,
  RiskItem,
  Explainability,
  SectionConfidence,
} from "@/types/portfolio-ai";
import { useEffect, useRef, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BACKEND_URL = `${API_URL}/api/ai/analyze-portfolio`;
const SHOW_FORCE = (process.env.NEXT_PUBLIC_SHOW_FORCE || "0") === "1";

/** ---------- helpers ---------- */
function isRecord(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object";
}
function arr<T = any>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}
function humanizeSeconds(s?: number) {
  if (s == null || s <= 0) return "now";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m || !h) parts.push(`${m}m`);
  return parts.join(" ");
}

/** ---------- types ---------- */
type BackendEnvelope = {
  status?: string;
  ai_layers?: any;
  cached?: boolean;
  cached_at?: string;
  ttl_seconds_remaining?: number;
  warnings?: string[] | null;
  detail?: string; // error
  error?: string; // error
};

type Meta = {
  cached: boolean;
  cachedAt?: string;
  ttlSeconds: number;
  nextUpdateIn: string; // e.g., "3h 12m" or "now"
  nextUpdateAt?: Date;
  warnings?: string[];
  showForce: boolean; // expose env-driven ability to show Force button
  canRefreshNow: boolean; // convenience: ttlSeconds <= 0
};

/** ---------- hook ---------- */
export function usePortfolioAi(daysOfNews = 7) {
  const [data, setData] = useState<PortfolioAiData | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAi = useCallback(
    async (isRefetch = false, opts?: { force?: boolean }) => {
      try {
        setError(null);
        isRefetch ? setRefetching(true) : setLoading(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // NOTE: backend handles `?force=true`. We’re keeping POST to include cookies.
        const url = opts?.force ? `${BACKEND_URL}?force=true` : BACKEND_URL;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          // body: JSON.stringify({ days_of_news: daysOfNews }),
        });

        const isJson = res.headers
          .get("content-type")
          ?.includes("application/json");
        const json = (
          isJson ? await res.json() : null
        ) as BackendEnvelope | null;

        if (!res.ok) {
          const msg =
            (json?.detail as string) ||
            (json?.error as string) ||
            `HTTP ${res.status}`;
          throw new Error(msg);
        }

        // pull meta up front
        const ttl = Number(json?.ttl_seconds_remaining ?? 0) || 0;
        const nextUpdateAt =
          ttl > 0 ? new Date(Date.now() + ttl * 1000) : undefined;
        const metaNext: Meta = {
          cached: !!json?.cached,
          cachedAt: json?.cached_at,
          ttlSeconds: ttl,
          nextUpdateIn: humanizeSeconds(ttl),
          nextUpdateAt,
          warnings: json?.warnings ?? undefined,
          showForce: SHOW_FORCE,
          canRefreshNow: ttl <= 0,
        };

        // Accept either:
        // A) { status:"ok", ai_layers: { ...actualData... } }
        // B) { status:"ok", ai_layers: { data: { ...actualData... } } }
        const payload =
          isRecord(json) && isRecord(json.ai_layers) ? json.ai_layers : null;
        const d: unknown =
          payload && isRecord(payload.data) ? payload.data : payload;

        if (isRecord(d)) {
          const normalized: PortfolioAiData = {
            latest_developments: arr<LatestDevelopment>(d.latest_developments),
            catalysts: arr<Catalyst>(d.catalysts),
            scenarios: isRecord(d.scenarios) ? (d.scenarios as Scenarios) : {},
            actions: arr<ActionItem>(d.actions),
            alerts: arr(d.alerts),
            risks_list: arr<RiskItem>(d.risks_list),
            explainability: isRecord(d.explainability)
              ? (d.explainability as Explainability)
              : {},
            section_confidence: isRecord(d.section_confidence)
              ? (d.section_confidence as SectionConfidence)
              : {},
            summary: typeof d.summary === "string" ? d.summary : "",
            disclaimer: typeof d.disclaimer === "string" ? d.disclaimer : "",
            performance_analysis: isRecord(d.performance_analysis)
              ? (d.performance_analysis as PerformanceAnalysis)
              : {},
            sentiment: isRecord(d.sentiment)
              ? (d.sentiment as SentimentBlock)
              : {},
            predictions: isRecord(d.predictions)
              ? (d.predictions as PredictionsBlock)
              : {},
          };

          setData(normalized);
          setMeta(metaNext);
          return;
        }

        // Shape didn’t match
        const msg =
          (isRecord(json) && (json.detail as string)) ||
          (isRecord(json) && (json.error as string)) ||
          "Unexpected response shape";
        setError(msg);
        setData(null);
        setMeta(metaNext);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Failed to load");
          setData(null);
          setMeta((m) => m ?? null);
        }
      } finally {
        isRefetch ? setRefetching(false) : setLoading(false);
      }
    },
    [daysOfNews]
  );

  useEffect(() => {
    fetchAi();
    return () => abortRef.current?.abort();
  }, [fetchAi]);

  return {
    data,
    meta, // <-- new
    loading,
    refetching,
    error,
    // normal refetch respects TTL; force=true bypasses
    refetch: (force = false) => fetchAi(true, { force }),
  };
}
