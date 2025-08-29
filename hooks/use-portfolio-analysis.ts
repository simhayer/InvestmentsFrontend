"use client";
import { useEffect, useState, useRef, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BACKEND_URL = `${API_URL}/api/ai`;

export type PortfolioAnalysis = {
  as_of_utc: string;
  totals: { market_value: number; cost_basis: number; pnl_abs: number; pnl_pct: number | null };
  exposures: {
    by_type: { type: string; weight_pct: number }[];
    by_currency: { currency: string; weight_pct: number }[];
    by_institution: { institution: string; weight_pct: number }[];
  };
  top_positions: { symbol: string; weight_pct: number; pnl_pct: number | null }[];
  concentration: {
    hh_index: number;
    top_1_weight_pct: number;
    top_3_weight_pct: number;
    top_5_weight_pct: number;
  };
  rating: "strong" | "balanced" | "concentrated" | "risky" | "needs_rebalance";
  risk_level: "low" | "moderate" | "high";
  diversification_score: number;
  rationale: string;
  suggestions: string[];
  data_notes: string[];
  disclaimer: string;
} | { error: string; raw?: string };

export function usePortfolioAnalysis() {
  const [data, setData] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchIt = useCallback(async (isRefetch = false) => {
    try {
      setError(null);
      isRefetch ? setRefetching(true) : setLoading(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${BACKEND_URL}/analyze-portfolio`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.error) {
        setError(json.error);
      }
      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "Failed to load");
    } finally {
      isRefetch ? setRefetching(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIt();
    return () => abortRef.current?.abort();
  }, [fetchIt]);

  return { data, loading, error, refetching, refetch: () => fetchIt(true) };
}
