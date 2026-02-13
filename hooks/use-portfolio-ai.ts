// hooks/use-portfolio-analysis.ts
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { authedFetch } from "@/utils/authService";
import type {
  PortfolioAnalysisResponse,
  PortfolioInlineInsights,
  QuickPortfolioSummary,
} from "@/types/portfolio-analysis";

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function getFullPortfolioAnalysis(
  currency: string = "USD",
  includeInline: boolean = true,
  forceRefresh: boolean = false
): Promise<PortfolioAnalysisResponse> {
  const url = `/api/portfolio/analysis/full?currency=${currency}&include_inline=${includeInline}&force_refresh=${forceRefresh}`;
  const res = await authedFetch(url, { method: "GET" });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Analysis failed: ${error}`);
  }
  
  return res.json();
}

async function getPortfolioInlineInsights(
  currency: string = "USD"
): Promise<PortfolioInlineInsights> {
  const res = await authedFetch(`/api/portfolio/analysis/inline?currency=${currency}`, {
    method: "GET",
  });
  
  if (!res.ok) {
    throw new Error(`Inline insights failed: ${res.status}`);
  }
  
  return res.json();
}

async function getPortfolioQuickSummary(
  currency: string = "USD"
): Promise<QuickPortfolioSummary> {
  const res = await authedFetch(`/api/portfolio/analysis/summary?currency=${currency}`, {
    method: "GET",
  });
  
  if (!res.ok) {
    throw new Error(`Summary failed: ${res.status}`);
  }
  
  return res.json();
}

// ============================================================================
// MAIN HOOK
// ============================================================================

interface UsePortfolioAnalysisReturn {
  // Inline insights (auto-fetched)
  inlineLoading: boolean;
  inline: PortfolioInlineInsights | null;
  
  // Full analysis (on-demand)
  analysisLoading: boolean;
  analysis: PortfolioAnalysisResponse | null;
  
  // Shared
  error: string | null;
  fetchFullAnalysis: (forceRefresh?: boolean | unknown) => Promise<void>;
  refreshInline: () => Promise<void>;
  reset: () => void;
}

export function usePortfolioAnalysis(
  currency: string = "USD",
  autoFetchInline: boolean = true
): UsePortfolioAnalysisReturn {
  // Inline insights state
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inline, setInline] = useState<PortfolioInlineInsights | null>(null);
  
  // Full analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResponse | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  // ─── Refs to prevent duplicate fetches ──────────────────────────
  const currencyRef = useRef(currency);
  currencyRef.current = currency;

  const inlineInFlightRef = useRef(false);
  const analysisInFlightRef = useRef(false);

  // Fetch inline insights — stable reference (no currency in deps)
  const refreshInline = useCallback(async () => {
    if (inlineInFlightRef.current) return;           // dedup
    inlineInFlightRef.current = true;
    setInlineLoading(true);
    try {
      const res = await getPortfolioInlineInsights(currencyRef.current);
      setInline(res);
    } catch (e) {
      console.error("Portfolio inline insights error:", e);
    } finally {
      setInlineLoading(false);
      inlineInFlightRef.current = false;
    }
  }, []); // stable — reads currency from ref

  // Auto-fetch inline on mount (fires once when autoFetchInline becomes true)
  const hasFetchedInlineRef = useRef(false);

  useEffect(() => {
    if (!autoFetchInline) {
      // Reset the guard so we re-fetch if autoFetchInline toggles off→on
      hasFetchedInlineRef.current = false;
      return;
    }
    if (hasFetchedInlineRef.current) return;         // already fetched this lifecycle

    hasFetchedInlineRef.current = true;

    let cancelled = false;

    (async () => {
      if (inlineInFlightRef.current) return;
      inlineInFlightRef.current = true;
      setInlineLoading(true);
      try {
        const res = await getPortfolioInlineInsights(currencyRef.current);
        if (!cancelled) setInline(res);
      } catch (e) {
        if (!cancelled) console.error("Portfolio inline insights error:", e);
      } finally {
        if (!cancelled) setInlineLoading(false);
        inlineInFlightRef.current = false;
      }
    })();

    return () => { cancelled = true; };
  }, [autoFetchInline]);

  // Fetch full analysis — stable reference
  const fetchFullAnalysis = useCallback(async (forceRefresh?: boolean | unknown) => {
    const refresh = forceRefresh === true;
    if (analysisInFlightRef.current) return;         // dedup
    analysisInFlightRef.current = true;
    setAnalysisLoading(true);
    setError(null);

    try {
      const res = await getFullPortfolioAnalysis(currencyRef.current, true, refresh);
      setAnalysis(res);
      if (res.inline) setInline(res.inline);
    } catch (e) {
      console.error("Portfolio analysis error:", e);
      setError(e instanceof Error ? e.message : "Failed to analyze portfolio.");
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
      analysisInFlightRef.current = false;
    }
  }, []); // stable — reads currency from ref

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    inlineLoading,
    inline,
    analysisLoading,
    analysis,
    error,
    fetchFullAnalysis,
    refreshInline,
    reset,
  };
}

// ============================================================================
// SIMPLE INLINE HOOK
// ============================================================================

export function usePortfolioInline(currency: string = "USD", autoFetch: boolean = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<PortfolioInlineInsights | null>(null);

  const currencyRef = useRef(currency);
  currencyRef.current = currency;
  const inFlightRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetch = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await getPortfolioInlineInsights(currencyRef.current);
      setInsights(res);
    } catch (e) {
      console.error("Portfolio inline error:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch insights.");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) {
      hasFetchedRef.current = false;
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetch();
  }, [autoFetch, fetch]);

  return { loading, error, insights, fetch };
}
