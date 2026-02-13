// hooks/use-ai-insight-symbol.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { getFullAnalysis, getInlineInsights, getFullCryptoAnalysis, getCryptoInlineInsights } from "@/utils/aiService";
import type { StockAnalysisResponse, InlineInsights } from "@/types/symbol_analysis";
import type { CryptoAnalysisResponse, CryptoInlineInsights } from "@/types/crypto_analysis";

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

  // Auto-fetch inline insights on mount
  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;

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

    setAnalysisLoading(true);
    setError(null);

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
    } catch (e) {
      console.error("AI analysis error:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch AI insight.");
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }, [symbol, isCrypto]);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    // Keep inline insights visible
  }, []);

  return {
    inlineLoading,
    inline,
    analysisLoading,
    analysis,
    error,
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

  const fetch = useCallback(async () => {
    if (!symbol) return;

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
    }
  }, [symbol]);

  useEffect(() => {
    if (autoFetch && symbol) {
      fetch();
    }
  }, [autoFetch, symbol, fetch]);

  return { loading, error, insights, fetch };
}
