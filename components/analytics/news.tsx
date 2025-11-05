"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchNewsForUser } from "@/hooks/use-news";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Newspaper, RefreshCcw } from "lucide-react";

type NewsItem = {
  title: string;
  url: string;
  snippet?: string | null;
  published_at?: string | null; // ISO UTC
  source?: string | null;
  image?: string | null;
};

type NewsBySymbol = Record<string, NewsItem[]>;

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function domainFrom(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function SymbolChip({ symbol }: { symbol: string }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium bg-background">
      {symbol}
    </span>
  );
}

function NewsCard({ item, symbol }: { item: NewsItem; symbol: string }) {
  const when = timeAgo(item.published_at);
  const host = domainFrom(item.url);

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex gap-4 p-3 sm:p-4">
        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-start gap-2 min-w-0"
              title={item.title}
            >
              <h3 className="text-sm sm:text-base font-semibold leading-snug group-hover:underline line-clamp-2">
                {item.title}
              </h3>
              <ExternalLink className="h-3.5 w-3.5 mt-0.5 text-muted-foreground hidden sm:block" />
            </a>
            <SymbolChip symbol={symbol} />
          </div>

          <div className="mt-1.5 text-xs sm:text-[13px] text-muted-foreground flex items-center gap-2">
            {item.source ? (
              <span className="truncate">{item.source}</span>
            ) : null}
            {when ? (
              <>
                <span aria-hidden="true">•</span>
                <time dateTime={item.published_at || undefined}>{when}</time>
              </>
            ) : null}
          </div>

          {item.snippet ? (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {item.snippet}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function News() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Array<NewsItem & { symbol: string }>>([]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRefreshing(true);
      const res = await fetchNewsForUser();
      const data = (res || {}) as NewsBySymbol;

      // Flatten to [{ symbol, ...item }]
      const flat: Array<NewsItem & { symbol: string }> = [];
      for (const [symbol, list] of Object.entries(data)) {
        for (const it of list || []) {
          flat.push({ symbol, ...it });
        }
      }

      // Sort by recency (desc)
      flat.sort((a, b) => {
        const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
        const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
        return tb - ta;
      });

      setItems(flat);
    } catch (e) {
      console.error("Failed to fetch news:", e);
      setError("Couldn’t load news. Please try again.");
      setItems([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Loading state
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-28 rounded" />
          <Skeleton className="h-28 rounded" />
          <Skeleton className="h-28 rounded" />
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <Card className="max-w-xl border-destructive/20">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="mb-4">{error}</p>
            <Button variant="outline" onClick={fetchNews}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const count = items.length;

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background"
      aria-busy={refreshing}
      aria-live="polite"
    >
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-[-0.01em]">News</h2>
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground bg-background">
            {count} article{count === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Feed */}
      {count > 0 ? (
        <div
          className={`space-y-3 ${
            refreshing ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {items.map((it, idx) => (
            <NewsCard
              key={`${it.symbol}-${idx}-${it.url}`}
              item={it}
              symbol={it.symbol}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-sm text-muted-foreground">
            No news available
          </CardContent>
        </Card>
      )}
    </main>
  );
}
