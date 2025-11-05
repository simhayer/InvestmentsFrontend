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

/** ---------- helpers ---------- */
function isRecord(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object";
}
function arr<T = any>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

/** ---------- hook ---------- */
export function usePortfolioAi(daysOfNews = 7) {
  const [data, setData] = useState<PortfolioAiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAi = useCallback(
    async (isRefetch = false) => {
      try {
        setError(null);
        isRefetch ? setRefetching(true) : setLoading(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          // body: JSON.stringify({ days_of_news: daysOfNews }),
        });

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const maybeErr = await res.json();
            if (isRecord(maybeErr)) {
              msg =
                (maybeErr.detail as string) ||
                (maybeErr.error as string) ||
                msg;
            }
          } catch {
            /* no-op */
          }
          throw new Error(msg);
        }

        const json: unknown = await res.json();

        // Accept either:
        // A) { status:"ok", ai_layers: { ...actualData... } }
        // B) { status:"ok", ai_layers: { data: { ...actualData... } } }
        if (isRecord(json) && isRecord(json.ai_layers)) {
          const payload = json.ai_layers;
          const d: unknown = isRecord(payload.data) ? payload.data : payload;

          if (isRecord(d)) {
            const normalized: PortfolioAiData = {
              latest_developments: arr<LatestDevelopment>(
                d.latest_developments
              ),
              catalysts: arr<Catalyst>(d.catalysts),
              scenarios: isRecord(d.scenarios)
                ? (d.scenarios as Scenarios)
                : {},
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
            return;
          }
        }

        // If we reach here, shape didn't match
        const msg =
          (isRecord(json) && (json.detail as string)) ||
          (isRecord(json) && (json.error as string)) ||
          "Unexpected response shape";
        setError(msg);
        setData(null);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Failed to load");
          setData(null);
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
    loading,
    refetching,
    error,
    refetch: () => fetchAi(true),
  };
}
