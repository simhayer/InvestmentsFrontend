"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BACKEND_URL = `${API_URL}/api/ai`;

/** ---------- Types that match your current backend response ---------- */

export type InsightType = "warning" | "opportunity" | "positive";
export type InsightPriority = "high" | "medium" | "low";

export interface PortfolioInsight {
  id: number;
  type: InsightType;
  title: string;
  description: string;
  priority: InsightPriority;
  action: string;
}

export interface PortfolioPosition {
  symbol: string;
  weight: number; // 0..1
  sector?: string | null;
  country?: string | null;
  analysis?: unknown | null; // backend returns null or an object
}

export interface PortfolioSummary {
  positions_count: number;
  by_sector: Record<string, number>; // weights 0..1 by sector
  by_country: Record<string, number>; // weights 0..1 by country
  hhi: number; // concentration score
  top_position: { symbol: string; weight: number };
}

export interface PortfolioAnalysisOk {
  summary: PortfolioSummary;
  positions: PortfolioPosition[];
  insights: PortfolioInsight[];
  as_of_utc?: string; // optional; backend may add it later
  risk?: RiskBreakdown;
}

export interface RiskBreakdown {
  overall: { score: number; level: "Low" | "Moderate" | "High" };
  diversification: {
    score: number;
    n_eff: number | null;
    hhi: number;
    label: string;
  };
  volatility: { score: number; est_vol_annual_pct: number; label: string };
  details: {
    classes: {
      symbol: string;
      class: string;
      weight: number;
      sigma_pct: number;
    }[];
    notes: string[];
  };
  disclaimer: string;
  ai?: {
    overall_blurb: string;
    suggestions: string[];
  };
}

export type PortfolioAnalysis =
  | PortfolioAnalysisOk
  | { error: string; raw?: unknown };

/** ---------- Narrowing / validation (lightweight) ---------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

function isNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function isPortfolioInsight(x: unknown): x is PortfolioInsight {
  if (!isRecord(x)) return false;
  return (
    isNumber(x.id) &&
    (x.type === "warning" ||
      x.type === "opportunity" ||
      x.type === "positive") &&
    isString(x.title) &&
    isString(x.description) &&
    (x.priority === "high" ||
      x.priority === "medium" ||
      x.priority === "low") &&
    isString(x.action)
  );
}

function isPortfolioPosition(x: unknown): x is PortfolioPosition {
  if (!isRecord(x)) return false;
  return isString(x.symbol) && isNumber(x.weight);
}

function isPortfolioSummary(x: unknown): x is PortfolioSummary {
  if (!isRecord(x)) return false;
  const tp = x.top_position as unknown;
  const bs = x.by_sector as unknown;
  const bc = x.by_country as unknown;

  const validTop = isRecord(tp) && isString(tp.symbol) && isNumber(tp.weight);

  const validMaps =
    isRecord(bs) &&
    Object.values(bs).every(isNumber) &&
    isRecord(bc) &&
    Object.values(bc).every(isNumber);

  return (
    isNumber(x.positions_count) && validMaps && isNumber(x.hhi) && validTop
  );
}

function isPortfolioAnalysisOk(x: unknown): x is PortfolioAnalysisOk {
  if (!isRecord(x)) return false;
  const { summary, positions, insights, risk } = x;
  return (
    isPortfolioSummary(summary) &&
    Array.isArray(positions) &&
    positions.every(isPortfolioPosition) &&
    Array.isArray(insights) &&
    insights.every(isPortfolioInsight) &&
    isRecord(risk) &&
    isString(risk.disclaimer)
  );
}

/** ---------- Hook ---------- */

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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
        // body: JSON.stringify({}), // uncomment if your backend requires a body
      });

      if (!res.ok) {
        // Try to surface backend error shape if it exists
        let msg = `HTTP ${res.status}`;
        try {
          const maybe = await res.json();
          if (isRecord(maybe) && isString(maybe.error)) {
            msg = `${msg}: ${maybe.error}`;
            setData({ error: maybe.error, raw: maybe });
          }
        } catch {
          /* ignore parse errors */
        }
        throw new Error(msg);
      }

      const json: unknown = await res.json();
      // console.log("Portfolio analysis response:", json);

      if (isPortfolioAnalysisOk(json)) {
        setData(json);
      } else if (isRecord(json) && isString(json.error)) {
        setData({ error: json.error, raw: json });
        setError(json.error);
      } else {
        const msg = "Unexpected response shape";
        setData({ error: msg, raw: json });
        setError(msg);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        const msg = e?.message || "Failed to load";
        setError(msg);
        setData({ error: msg });
      }
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
