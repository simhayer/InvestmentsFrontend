"use client";
import { useEffect, useState } from "react";
import type {
  FinancialsResponse,
  EarningsResponse,
  ProfileResponse,
  AnalystResponse,
} from "@/types/market-fundamentals";

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

export function useFinancials(symbol: string, period: "annual" | "quarterly") {
  const [data, setData] = useState<FinancialsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const f = await fetchJSON<FinancialsResponse>(
          apiUrl(
            `/api/market/financials/${encodeURIComponent(
              symbol
            )}?period=${period}`
          )
        );
        if (!cancelled) setData(f);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load financials");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, period]);

  return { data, loading, error };
}

export function useEarnings(symbol: string) {
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const e = await fetchJSON<EarningsResponse>(
          apiUrl(`/api/market/earnings/${encodeURIComponent(symbol)}`)
        );
        if (!cancelled) setData(e);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load earnings");
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

export function useAnalyst(symbol: string) {
  const [data, setData] = useState<AnalystResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const a = await fetchJSON<AnalystResponse>(
          apiUrl(`/api/market/analyst/${encodeURIComponent(symbol)}`)
        );
        if (!cancelled) setData(a);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load analyst data");
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

export function useProfile(symbol: string) {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchJSON<ProfileResponse>(
          apiUrl(`/api/market/overview/${encodeURIComponent(symbol)}`)
        );
        if (!cancelled) setData(p);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load profile");
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
