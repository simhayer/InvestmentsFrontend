"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioAnalysisResponse, AiLayers } from "@/types/portfolio-ai";
import { safeParseAnalysis } from "@/utils/aiService";
import { getAiInsightPortfolio } from "@/utils/portfolioService";

const SHOW_FORCE = (process.env.NEXT_PUBLIC_SHOW_FORCE || "0") === "1";

/** ---------- helpers ---------- */
function isRecord(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object";
}

/** ---------- meta ---------- */
export type PortfolioAiMeta = {
  // v2 doesn't provide TTL/cached_at in the same way, so keep meta minimal + useful
  showForce: boolean;
  lastUpdatedAt?: Date;
  warnings?: string[];
};

export function usePortfolioAi(opts?: { currency?: "USD" | "CAD" }) {
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResponse | null>(
    null
  );
  const [meta, setMeta] = useState<PortfolioAiMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchAi = useCallback(
    async (isRefetch = false, params?: { force?: boolean }) => {
      try {
        setError(null);
        isRefetch ? setRefetching(true) : setLoading(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        
        // v2 method: starts task + polls until complete (or returns cached result)
        const report = await getAiInsightPortfolio({
          currency: opts?.currency ?? "USD",
          force: !!params?.force,
          signal: controller.signal,
          // optional overrides:
          // maxWaitMs: 60_000,
          // intervalMs: 1200,
        });

        /**
         * Your v2 service returns `report` (any).
         * We stitch it into the same UI typed envelope you were using before.
         *
         * We accept either:
         * - report.ai_layers
         * - report.data.ai_layers (in case your backend nests it)
         * - report (already is ai_layers)
         */
        const aiLayersCandidate: unknown =
          isRecord(report) && isRecord((report as any).ai_layers)
            ? (report as any).ai_layers
            : isRecord(report) && isRecord((report as any).data)
            ? (report as any).data
            : report;

        const stitched: PortfolioAnalysisResponse | null = safeParseAnalysis({
          status: "ok",
          user_id: 0,
          ai_layers: aiLayersCandidate as AiLayers,
        });

        if (!stitched) {
          setError("Unexpected response shape");
          setAnalysis(null);
          setMeta({
            showForce: SHOW_FORCE,
            lastUpdatedAt: new Date(),
          });
          return;
        }

        setAnalysis(stitched);
        setMeta({
          showForce: SHOW_FORCE,
          lastUpdatedAt: new Date(),
          // If you later add warnings to v2 status payload, you can map them here.
        });
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
    [opts?.currency]
  );

  useEffect(() => {
    fetchAi();
    return () => abortRef.current?.abort();
  }, [fetchAi]);

  return {
    analysis,
    layers: analysis?.ai_layers ?? null,
    meta,
    loading,
    refetching,
    error,
    refetch: (force = false) => fetchAi(true, { force }),
  } as const;
}
