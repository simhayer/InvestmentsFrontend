"use client";
import { useEffect, useRef, useState } from "react";
import type {
  HistoryResponse,
  CandlePoint,
  QuoteResponse,
} from "@/types/market";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
export const apiUrl = (path: string) => `${API_BASE}${path}`;

export async function fetchJSON<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, { ...init, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

function toSec(t: string | number): number {
  if (typeof t === "number")
    return t > 1e12 ? Math.floor(t / 1000) : Math.floor(t);
  const ms = Date.parse(t);
  return Number.isNaN(ms) ? NaN : Math.floor(ms / 1000);
}

export function useHistory(symbol: string, period: string, interval: string) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // simple in-memory cache per (symbol, period, interval)
  const cacheRef = useRef<Record<string, HistoryResponse>>({});
  const key = `${symbol}|${period}|${interval}`;

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;

    const cached = cacheRef.current[key];
    if (cached) setData(cached);

    (async () => {
      try {
        if (!cached) setLoading(true);
        const h = await fetchJSON<HistoryResponse>(
          apiUrl(
            `/api/market/history/${encodeURIComponent(
              symbol
            )}?period=${period}&interval=${interval}`
          )
        );

        // sanitize & sort ascending by time to satisfy lightweight-charts
        const pts: CandlePoint[] = (h.points ?? [])
          .map((p) => ({ ...p, t: toSec(p.t) }))
          .filter((p) => Number.isFinite(p.t as number))
          .sort((a, b) => (a.t as number) - (b.t as number))
          .map((p) => ({ ...p, t: p.t as number })); // keep seconds

        const sanitized: HistoryResponse = { ...h, points: pts };
        cacheRef.current[key] = sanitized;
        if (!cancelled) setData(sanitized);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load history");
      } finally {
        if (!cancelled && !cached) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol, period, interval]);

  return { data, loading, error };
}

export function useQuote(symbol: string) {
  const [data, setData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const q = await fetchJSON<QuoteResponse>(
          apiUrl(`/api/market/quote/${encodeURIComponent(symbol)}`)
        );
        if (!cancelled) setData(q);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load quote");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { data, loading, error };
}
