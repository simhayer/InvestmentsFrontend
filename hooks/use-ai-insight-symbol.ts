// hooks/use-ai-insight-symbol.ts
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getFullAnalysis, getInlineInsights, getFullCryptoAnalysis, getCryptoInlineInsights } from "@/utils/aiService";
import type { StockAnalysisResponse, InlineInsights } from "@/types/symbol_analysis";
import type { CryptoAnalysisResponse, CryptoInlineInsights } from "@/types/crypto_analysis";
import type { TierError } from "@/hooks/use-portfolio-ai";

// Union type for inline insights (stock vs crypto)
type AnyInline = InlineInsights | CryptoInlineInsights;
type AnyAnalysis = StockAnalysisResponse | CryptoAnalysisResponse;

interface UseAiInsightSymbolReturn {
  // Inline insights (auto-fetched)
  inlineLoading: boolean;
  inline: AnyInline | null;
  
  // Full analysis (on-demand)
  analysisLoading: boolean;
  analysis: AnyAnalysis | null;
  
  // Shared
  error: string | null;
  tierError: TierError | null;
  isCrypto: boolean;
  fetchFullAnalysis: () => Promise<void>;
  reset: () => void;
}

export function useAiInsightSymbol(
  symbol: string,
  isCrypto: boolean = false,
): UseAiInsightSymbolReturn {
  // Inline insights state (lightweight, auto-fetched)
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inline, setInline] = useState<AnyInline | null>(null);
  
  // Full analysis state (heavier, on-demand)
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnyAnalysis | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [tierError, setTierError] = useState<TierError | null>(null);

  // Dedup guard
  const inlineInFlightRef = useRef(false);
  const analysisInFlightRef = useRef(false);

  // Auto-fetch inline insights on mount (once per symbol)
  useEffect(() => {
    if (!symbol) return;
    if (inlineInFlightRef.current) return;

    let cancelled = false;
    inlineInFlightRef.current = true;

    const fetchInline = async () => {
      setInlineLoading(true);
      try {
        const res = isCrypto
          ? await getCryptoInlineInsights(symbol)
          : await getInlineInsights(symbol);
        if (!cancelled) {
          setInline(res);
        }
      } catch (e) {
        console.error("Inline insights error:", e);
        // Don't set error for inline - it's optional/background
      } finally {
        if (!cancelled) {
          setInlineLoading(false);
        }
        inlineInFlightRef.current = false;
      }
    };

    fetchInline();

    return () => {
      cancelled = true;
    };
  }, [symbol, isCrypto]);

  // Full analysis fetch (manual trigger)
  const fetchFullAnalysis = useCallback(async () => {
    if (!symbol) {
      setError("No symbol provided");
      return;
    }
    if (analysisInFlightRef.current) return;          // dedup
    analysisInFlightRef.current = true;

    setAnalysisLoading(true);
    setError(null);
    setTierError(null);

    try {
      if (isCrypto) {
        const res = await getFullCryptoAnalysis(symbol, true);
        setAnalysis(res);
        if (res.inline) {
          setInline(res.inline);
        }
      } else {
        const res = await getFullAnalysis(symbol, true);
        setAnalysis(res);
        if (res.inline) {
          setInline(res.inline);
        }
      }
    } catch (e: any) {
      console.error("AI analysis error:", e);
      // FastAPI wraps in {detail: ...}, and ApiError stores the parsed body
      const tierDetail = e?.detail?.detail ?? e?.detail;
      if (typeof tierDetail === "object" && tierDetail?.code === "TIER_LIMIT") {
        setTierError(tierDetail as TierError);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : "Failed to fetch AI insight.");
      }
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
      analysisInFlightRef.current = false;
    }
  }, [symbol, isCrypto]);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setTierError(null);
    // Keep inline insights visible
  }, []);

  return {
    inlineLoading,
    inline,
    analysisLoading,
    analysis,
    error,
    tierError,
    isCrypto,
    fetchFullAnalysis,
    reset,
  };
}

// Standalone hook if you just need inline insights elsewhere
export function useInlineInsights(symbol: string, autoFetch: boolean = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InlineInsights | null>(null);
  const inFlightRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetch = useCallback(async () => {
    if (!symbol || inFlightRef.current) return;
    inFlightRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const res = await getInlineInsights(symbol);
      setInsights(res);
    } catch (e) {
      console.error("Inline insights error:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch insights.");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [symbol]);

  useEffect(() => {
    if (!autoFetch || !symbol) {
      hasFetchedRef.current = false;
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetch();
  }, [autoFetch, symbol, fetch]);

  return { loading, error, insights, fetch };
}
