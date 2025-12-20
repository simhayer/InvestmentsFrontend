// hooks/use-market-overview.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MarketOverviewData,
  // If you have a full response type, import it instead:
  // MarketOverviewResponse,
} from "@/types/market-overview";
import type {
  MarketSummaryData,
  MarketSummaryMeta,
  MarketSummaryResponse,
} from "@/types/market-summary";
import { authedFetch } from "@/utils/authService";

// Minimal response types if you don't already have them:
type OverviewEnvelope = { message: string; data: MarketOverviewData };
type SummaryEnvelope = MarketSummaryResponse; // already defined in your types

export function useMarketOverview() {
  // ---- OVERVIEW STATE ----
  const [overview, setOverview] = useState<MarketOverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewFetchedAt, setOverviewFetchedAt] = useState<Date | null>(null);

  // ---- SUMMARY STATE ----
  const [summary, setSummary] = useState<MarketSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryFetchedAt, setSummaryFetchedAt] = useState<Date | null>(null);
  const [summaryMeta, setSummaryMeta] = useState<MarketSummaryMeta | null>(
    null
  );

  // AbortControllers to cancel in-flight requests on unmount or new fetch
  const overviewAbortRef = useRef<AbortController | null>(null);
  const summaryAbortRef = useRef<AbortController | null>(null);

  // ---- FETCH: Overview ----
  const fetchOverview = useCallback(async () => {
    // cancel a previous request if still running
    overviewAbortRef.current?.abort();
    const controller = new AbortController();
    overviewAbortRef.current = controller;

    setOverviewLoading(true);
    setOverviewError(null);

    try {
      const path = "/api/market/overview";
      const res = await authedFetch(path, {
        method: "GET",
        signal: controller.signal,
      });

      const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
      const json = (
        isJson ? await res.json() : null
      ) as OverviewEnvelope | null;

      if (!json?.data) throw new Error("Malformed overview response");
      setOverview(json.data);
      setOverviewFetchedAt(new Date());
      return json;
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setOverview(null);
        setOverviewError("Couldn't load market overview.");
      }
      return null;
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  // ---- FETCH: Summary ----
  const fetchMarketSummary = useCallback(async () => {
    summaryAbortRef.current?.abort();
    const controller = new AbortController();
    summaryAbortRef.current = controller;

    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const path = "/api/market/summary";
      const res = await authedFetch(path, {
        method: "GET",
        signal: controller.signal,
      });
      const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
      const json = (isJson ? await res.json() : null) as SummaryEnvelope | null;
      const lastModified = res.headers.get("last-modified") || undefined;

      if (!json?.data?.sections || !Array.isArray(json.data.sections)) {
        throw new Error("Malformed summary response");
      }
      setSummary(json.data);
      // Prefer meta.updated_at; fallback to Last-Modified header
      const updated_at =
        json.meta?.updated_at ??
        (lastModified ? new Date(lastModified).toISOString() : undefined);
      setSummaryMeta({ updated_at, generated_at: json.meta?.generated_at });
      return json;
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setSummary(null);
        setSummaryMeta(null);
        setSummaryError("Couldn't load market summary.");
      }
      return null;
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      overviewAbortRef.current?.abort();
      summaryAbortRef.current?.abort();
    };
  }, []);

  // Combined convenience flags (optional)
  const loading = overviewLoading || summaryLoading;
  const error = overviewError || summaryError;

  return {
    // Overview
    data: overview,
    overview,
    overviewLoading,
    overviewError,
    overviewFetchedAt,
    fetchOverview,

    // Summary
    summary,
    summaryLoading,
    summaryError,
    summaryFetchedAt,
    summaryMeta,
    fetchMarketSummary,

    // Combined
    loading,
    error,
  };
}
