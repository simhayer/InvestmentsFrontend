"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/utils/authService";

export type GlobalNewsItem = {
  title: string;
  url: string;
  snippet?: string;
  published_at?: string;
  source?: string;
  image?: string;
};

export function useGlobalNews(category: string = "general", limit: number = 20) {
  const [items, setItems] = useState<GlobalNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNews = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ category, limit: String(limit) });
      const res = await fetch(`${API_URL}/api/news/global?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to load news");
      const json = await res.json();
      setItems(Array.isArray(json?.items) ? json.items : []);
      return json;
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setItems([]);
        setError("Couldn't load global news.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchNews();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchNews]);

  return { items, loading, error, refetch: fetchNews };
}
