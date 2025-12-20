"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioAnalysisResponse, AiLayers } from "@/types/portfolio-ai";
import { safeParseAnalysis } from "@/utils/aiService";
import { authedFetch } from "@/utils/authService";

const ANALYZE_PATH = `/api/ai/analyze-portfolio`;
const SHOW_FORCE = (process.env.NEXT_PUBLIC_SHOW_FORCE || "0") === "1";

/** ---------- helpers ---------- */
function isRecord(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object";
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

/** ---------- envelope/meta ---------- */
export type BackendEnvelope = {
  status?: string;
  ai_layers?: any;
  cached?: boolean;
  cached_at?: string;
  ttl_seconds_remaining?: number;
  warnings?: string[] | null;
  detail?: string; // error
  error?: string; // error
};

export type PortfolioAiMeta = {
  cached: boolean;
  cachedAt?: string;
  ttlSeconds: number;
  nextUpdateIn: string; // e.g., "3h 12m" or "now"
  nextUpdateAt?: Date;
  warnings?: string[];
  showForce: boolean; // env-driven ability to show Force button
  canRefreshNow: boolean; // convenience: ttlSeconds <= 0
};

export function usePortfolioAi() {
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResponse | null>(
    null
  );
  const [meta, setMeta] = useState<PortfolioAiMeta | null>(null);
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

        const query = opts?.force
          ? `/api/ai/analyze-portfolio?force=true`
          : ANALYZE_PATH;

        const res = await authedFetch(query, {
          method: "POST",
          cache: "no-store",
          signal: controller.signal,
          // body: JSON.stringify({})
        });

        const isJson = res.headers
          .get("content-type")
          ?.includes("application/json");
        const json = (
          isJson ? await res.json() : null
        ) as BackendEnvelope | null;

        if (!res.ok) {
          const msg = json?.detail || json?.error || `HTTP ${res.status}`;
          throw new Error(msg);
        }

        // meta
        const ttl = Number(json?.ttl_seconds_remaining ?? 0) || 0;
        const nextUpdateAt =
          ttl > 0 ? new Date(Date.now() + ttl * 1000) : undefined;
        const metaNext: PortfolioAiMeta = {
          cached: !!json?.cached,
          cachedAt: json?.cached_at,
          ttlSeconds: ttl,
          nextUpdateIn: humanizeSeconds(ttl),
          nextUpdateAt,
          warnings: json?.warnings ?? undefined,
          showForce: SHOW_FORCE,
          canRefreshNow: ttl <= 0,
        };

        // Accept either ai_layers directly or nested data
        const payload =
          isRecord(json) && isRecord(json.ai_layers) ? json.ai_layers : null;
        const maybeData: unknown =
          payload && isRecord((payload as any).data)
            ? (payload as any).data
            : payload;

        // Stitch back into a typed response for the UI
        const stitched: PortfolioAnalysisResponse | null = safeParseAnalysis({
          status: "ok",
          user_id: 0,
          ai_layers: maybeData as AiLayers,
        });

        if (!stitched) {
          const msg =
            json?.detail || json?.error || "Unexpected response shape";
          setError(msg);
          setAnalysis(null);
          setMeta(metaNext);
          return;
        }

        setAnalysis(stitched);
        setMeta(metaNext);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Failed to load");
          setAnalysis(null);
          setMeta((m) => m ?? null);
        }
      } finally {
        isRefetch ? setRefetching(false) : setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAi();
    return () => abortRef.current?.abort();
  }, [fetchAi]);

  return {
    analysis, // full typed envelope
    layers: analysis?.ai_layers ?? null, // convenience alias
    meta,
    loading,
    refetching,
    error,
    refetch: (force = false) => fetchAi(true, { force }),
  } as const;
}
