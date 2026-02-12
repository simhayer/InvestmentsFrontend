// hooks/use-portfolio-analysis.ts
"use client";

import { useState, useCallback, useEffect } from "react";
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
  includeInline: boolean = true
): Promise<PortfolioAnalysisResponse> {
  const url = `/api/portfolio/analysis/full?currency=${currency}&include_inline=${includeInline}`;
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
  fetchFullAnalysis: () => Promise<void>;
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

  // Fetch inline insights
  const refreshInline = useCallback(async () => {
    setInlineLoading(true);
    try {
      const res = await getPortfolioInlineInsights(currency);
      setInline(res);
    } catch (e) {
      console.error("Portfolio inline insights error:", e);
      // Don't set error for inline - it's optional/background
    } finally {
      setInlineLoading(false);
    }
  }, [currency]);

  // Auto-fetch inline on mount
  useEffect(() => {
    if (autoFetchInline) {
      refreshInline();
    }
  }, [autoFetchInline, refreshInline]);

  // Fetch full analysis
  const fetchFullAnalysis = useCallback(async () => {
    setAnalysisLoading(true);
    setError(null);

    try {
      const res = await getFullPortfolioAnalysis(currency, true);
      setAnalysis(res);
      // Update inline with full response's inline data
      if (res.inline) {
        setInline(res.inline);
      }
    } catch (e) {
      console.error("Portfolio analysis error:", e);
      setError(e instanceof Error ? e.message : "Failed to analyze portfolio.");
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }, [currency]);

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

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getPortfolioInlineInsights(currency);
      setInsights(res);
    } catch (e) {
      console.error("Portfolio inline error:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch insights.");
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return { loading, error, insights, fetch };
}