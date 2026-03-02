"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Watchlist } from "@/types/watchlist";
import { authedFetch } from "@/utils/authService";

type CreateWatchlistInput = {
  name: string;
  is_default?: boolean;
  symbols?: string[];
};

type UpdateWatchlistInput = {
  name?: string;
  is_default?: boolean;
};

type AddWatchlistItemInput = {
  symbol: string;
  note?: string | null;
};

export function useWatchlists(enabled: boolean) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchWatchlists = useCallback(async () => {
    if (!enabled) {
      setWatchlists([]);
      setLoading(false);
      setError(null);
      return [];
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await authedFetch("/api/watchlists", {
        method: "GET",
        signal: controller.signal,
      });
      const json = await res.json();
      const next = Array.isArray(json) ? (json as Watchlist[]) : [];
      setWatchlists(next);
      return next;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setWatchlists([]);
        setError("Couldn't load watchlists.");
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchWatchlists();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchWatchlists]);

  const createWatchlist = useCallback(
    async (input: CreateWatchlistInput) => {
      const res = await authedFetch("/api/watchlists", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await fetchWatchlists();
      return res.json();
    },
    [fetchWatchlists]
  );

  const updateWatchlist = useCallback(
    async (watchlistId: number, input: UpdateWatchlistInput) => {
      const res = await authedFetch(`/api/watchlists/${watchlistId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      await fetchWatchlists();
      return res.json();
    },
    [fetchWatchlists]
  );

  const addItem = useCallback(
    async (watchlistId: number, input: AddWatchlistItemInput) => {
      const res = await authedFetch(`/api/watchlists/${watchlistId}/items`, {
        method: "POST",
        body: JSON.stringify(input),
      });
      await fetchWatchlists();
      return res.json();
    },
    [fetchWatchlists]
  );

  const removeItem = useCallback(
    async (watchlistId: number, symbol: string) => {
      await authedFetch(`/api/watchlists/${watchlistId}/items/${encodeURIComponent(symbol)}`, {
        method: "DELETE",
      });
      await fetchWatchlists();
    },
    [fetchWatchlists]
  );

  const deleteWatchlist = useCallback(
    async (watchlistId: number) => {
      await authedFetch(`/api/watchlists/${watchlistId}`, {
        method: "DELETE",
      });
      await fetchWatchlists();
    },
    [fetchWatchlists]
  );

  return {
    watchlists,
    loading,
    error,
    refetch: fetchWatchlists,
    createWatchlist,
    updateWatchlist,
    addItem,
    removeItem,
    deleteWatchlist,
  };
}
