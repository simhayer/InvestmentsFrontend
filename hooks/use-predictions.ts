"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/utils/authService";

export interface PredictionsData {
  outlook: string | null;
  as_of: string;
}

export function usePredictions() {
  const [outlook, setOutlook] = useState<string | null>(null);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPredictions = useCallback(async (forceRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const url = forceRefresh
        ? `${API_URL}/api/market/predictions?refresh=true`
        : `${API_URL}/api/market/predictions`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to load predictions");
      const json = await res.json();
      const data = json?.data;
      if (data && typeof data.as_of === "string") {
        setOutlook(typeof data.outlook === "string" ? data.outlook : null);
        setAsOf(data.as_of);
      } else {
        setOutlook(null);
        setAsOf(null);
        throw new Error("Invalid predictions response");
      }
      return json;
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setOutlook(null);
        setAsOf(null);
        setError("Couldn't load predictions.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchPredictions]);

  const refetch = useCallback(
    (forceRefresh = false) => fetchPredictions(forceRefresh),
    [fetchPredictions]
  );

  return { outlook, asOf, loading, error, refetch };
}
